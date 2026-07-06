# DevSecOps: Secure and Deploy the Booking Platform on AWS

Step-by-step guide for securing this application as a DevSecOps engineer and deploying it to AWS. It is written for the **Booking Platform** stack: Next.js 16, NextAuth, PostgreSQL (Drizzle), optional Cognito, Resend, and Google Calendar.

**Related docs:** [database-aws-rds.md](./database-aws-rds.md), [SECURITY.md](../SECURITY.md)

---

## Overview

| Layer | AWS services (recommended) |
|-------|----------------------------|
| Compute | ECS Fargate (or Elastic Beanstalk / Amplify) |
| Database | RDS PostgreSQL (private subnet) |
| Auth | Cognito User Pool (production) |
| Secrets | Secrets Manager + SSM Parameter Store |
| Edge | Route 53, ACM, ALB, optional WAF |
| CI/CD | GitHub Actions → ECR → ECS |
| Scanning | CodeQL, npm audit, Gitleaks (already in repo) |

**Target architecture:**

```
Internet → Route 53 → ACM (TLS) → ALB (+ WAF) → ECS Fargate (Next.js)
                                              ↘ RDS PostgreSQL (private)
                                              ↘ Cognito (OIDC)
                                              ↘ Secrets Manager
```

---

## Phase 0 — Baseline and prerequisites

### 0.1 Inventory what you are protecting

| Asset | Location in repo | Production handling |
|-------|------------------|---------------------|
| Session signing key | `AUTH_SECRET` | Secrets Manager |
| Database credentials | `DATABASE_URL` | Secrets Manager |
| Cognito client | `AUTH_COGNITO_*`, `COGNITO_DOMAIN` | Secrets Manager |
| Cron endpoint | `CRON_SECRET` | Secrets Manager |
| Email | `RESEND_API_KEY` | Secrets Manager |
| Google OAuth | `GOOGLE_CLIENT_*` | Secrets Manager |
| File scanning | `CLAMD_HOST`, `VIRUSTOTAL_API_KEY` | Secrets Manager / sidecar |
| Public URLs | `AUTH_URL`, `NEXT_PUBLIC_APP_URL` | SSM or task env (non-secret) |

Copy `.env.example` to `.env.local` locally; **never** commit real values.

### 0.2 AWS account hygiene

1. Enable **AWS Organizations** (if multi-account) and use separate accounts for **prod**, **staging**, and **shared services**.
2. Turn on **root MFA** and disable root access keys.
3. Enable **AWS CloudTrail** (organization trail) in all regions.
4. Enable **GuardDuty** and **Security Hub** (CIS AWS Foundations Benchmark).
5. Configure **AWS Config** rules for public S3 buckets, open security groups, and unencrypted RDS.
6. Set a **billing alarm** and budget in AWS Budgets.

### 0.3 Local verification before cloud work

```bash
npm ci
npm run lint
npm test
npm audit --audit-level=high
npm run build
```

Fix any failures before deploying.

---

## Phase 1 — Shift-left security (DevSecOps in the pipeline)

The repo already ships baseline checks in [`.github/workflows/sast.yml`](../.github/workflows/sast.yml) and [`.github/workflows/dependency-review.yml`](../.github/workflows/dependency-review.yml).

### 1.1 Harden GitHub

1. **Branch protection** on `main`:
   - Require pull request reviews.
   - Require status checks: `npm audit`, `ESLint`, `Gitleaks`, `dependency-review`.
   - Block force pushes.
2. Enable **GitHub secret scanning** and **push protection** (Settings → Code security).
3. Add **CodeQL** (optional; requires GitHub Advanced Security on private repos):

   ```yaml
   # Add to .github/workflows/sast.yml
   - uses: github/codeql-action/init@v3
     with:
       languages: javascript-typescript
   - uses: github/codeql-action/analyze@v3
   ```

4. Pin GitHub Actions to commit SHAs in production pipelines (supply-chain hardening).

### 1.2 Dependency and secret discipline

- Run `npm audit fix` for high/critical issues; review breaking changes.
- Use **Dependabot** or **Renovate** for automated PRs.
- Pre-commit: run Gitleaks locally or use `gitleaks protect --staged`.

### 1.3 Security gates before merge

Define “Definition of Done” for every PR:

- [ ] No new high+ npm advisories
- [ ] No secrets in diff (Gitleaks clean)
- [ ] Auth/API routes use `requireAdminProvider` where appropriate
- [ ] New env vars documented in `.env.example` only (no real values)

---

## Phase 2 — IAM and least privilege

### 2.1 Human access

- Use **IAM Identity Center (SSO)** with MFA for engineers.
- Avoid long-lived IAM user access keys; prefer short-lived SSO roles.

### 2.2 CI/CD role (GitHub OIDC → AWS)

1. Create an IAM OIDC identity provider for `token.actions.githubusercontent.com`.
2. Create role `GitHubActionsDeployRole` with trust policy scoped to your repo:

   ```json
   {
     "Effect": "Allow",
     "Principal": {
       "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
     },
     "Action": "sts:AssumeRoleWithWebIdentity",
     "Condition": {
       "StringEquals": {
         "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
       },
       "StringLike": {
         "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/booking-platform:ref:refs/heads/main"
       }
     }
   }
   ```

3. Attach minimal policies: `ecr:*` (push), `ecs:UpdateService`, `ecs:DescribeServices`, `iam:PassRole` (task execution role only).

### 2.3 ECS task roles

| Role | Purpose | Permissions |
|------|---------|-------------|
| **Task execution role** | Pull image, read Secrets Manager at startup | `AmazonECSTaskExecutionRolePolicy` + `secretsmanager:GetSecretValue` on app secrets |
| **Task role** | Runtime AWS API calls from the app | Start empty; add only if app calls S3/SQS/etc. |

Never attach `AdministratorAccess` to task or CI roles.

---

## Phase 3 — Network (VPC)

### 3.1 VPC layout

Create a VPC (e.g. `10.0.0.0/16`) with:

| Subnet type | AZ | Purpose |
|-------------|-----|---------|
| Public | 2+ AZs | ALB, NAT Gateway |
| Private (app) | 2+ AZs | ECS tasks |
| Private (data) | 2+ AZs | RDS |

### 3.2 Security groups

**ALB SG (`sg-alb`):**

- Inbound: `443` from `0.0.0.0/0` (or CloudFront/WAF prefix list)
- Outbound: app port (e.g. `3000`) to ECS SG

**ECS SG (`sg-ecs`):**

- Inbound: `3000` from `sg-alb` only
- Outbound: `5432` to RDS SG, `443` to internet (NAT) for Resend/Google APIs

**RDS SG (`sg-rds`):**

- Inbound: `5432` from `sg-ecs` only
- No public accessibility on the RDS instance

### 3.3 Optional edge hardening

- Place **AWS WAF** on the ALB: AWSManagedRulesCommonRuleSet, KnownBadInputs, rate-based rule on `/api/*`.
- Use **VPC endpoints** for ECR, Secrets Manager, and CloudWatch Logs to reduce NAT exposure.

---

## Phase 4 — Secrets management

### 4.1 Create secrets in AWS Secrets Manager

Create one secret per logical group (easier rotation):

| Secret name | Keys |
|-------------|------|
| `booking-platform/prod/database` | `DATABASE_URL` |
| `booking-platform/prod/auth` | `AUTH_SECRET`, `AUTH_COGNITO_ID`, `AUTH_COGNITO_SECRET`, `AUTH_COGNITO_ISSUER`, `COGNITO_DOMAIN` |
| `booking-platform/prod/integrations` | `CRON_SECRET`, `RESEND_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |

Generate production values:

```bash
openssl rand -base64 32   # AUTH_SECRET
openssl rand -base64 32   # CRON_SECRET
```

### 4.2 Inject into ECS

In the task definition, map secrets to environment variables:

```json
"secrets": [
  { "name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:booking-platform/prod/database:DATABASE_URL::" },
  { "name": "AUTH_SECRET", "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:booking-platform/prod/auth:AUTH_SECRET::" }
]
```

Set non-secrets as plain `environment`:

- `NODE_ENV=production`
- `AUTH_URL=https://app.example.com`
- `NEXT_PUBLIC_APP_URL=https://app.example.com`
- `FILE_SCAN_REQUIRED=true` (recommended in prod)

### 4.3 Rotation

- Enable automatic rotation for RDS master password (Secrets Manager integration).
- Document rotation runbook for `AUTH_SECRET` and `CRON_SECRET` (requires coordinated redeploy).

---

## Phase 5 — Database (RDS PostgreSQL)

Follow [database-aws-rds.md](./database-aws-rds.md) for connection strings and schema migration.

### 5.1 Provision RDS securely

1. Engine: **PostgreSQL 16** (or current supported version).
2. **Multi-AZ** for production.
3. **Storage encryption** enabled (AWS KMS default or CMK).
4. **Backup retention** ≥ 7 days; enable deletion protection.
5. Place in **private subnets**; `Publicly accessible = No`.
6. Create application user with least privilege (not the master user):

   ```sql
   CREATE USER app_user WITH PASSWORD '...';
   CREATE DATABASE booking_platform OWNER app_user;
   GRANT CONNECT ON DATABASE booking_platform TO app_user;
   -- After drizzle-kit push, grant DML on app tables only
   ```

7. Connection string must include `sslmode=require`:

   ```
   postgresql://app_user:PASSWORD@your-db.region.rds.amazonaws.com:5432/booking_platform?sslmode=require
   ```

### 5.2 Apply schema

From a bastion, CI job, or one-off task with RDS access:

```bash
export DATABASE_URL="postgresql://..."
npx drizzle-kit push
```

Bootstrap the first provider only via a secure one-off (not in the container image):

```bash
DEMO_PROVIDER_EMAIL=... DEMO_PROVIDER_PASSWORD='...' npx tsx scripts/create-provider.ts
```

Prefer Cognito for production sign-in and retire demo credentials.

---

## Phase 6 — Authentication (Cognito)

Production should use **Cognito OIDC** rather than credentials-only auth.

### 6.1 Cognito User Pool

1. Create a User Pool with strong password policy and **MFA optional** (recommended: required for admins).
2. Create an app client with **Authorization code grant**, client secret enabled.
3. Scopes: **openid**, **email** (matches `src/auth.ts`).
4. **Allowed callback URLs** (exact match):

   ```
   https://app.example.com/api/auth/callback/cognito
   ```

5. **Allowed sign-out URLs:**

   ```
   https://app.example.com
   ```

6. Configure hosted UI domain → set `COGNITO_DOMAIN`.

### 6.2 App environment

Set in production:

- `AUTH_URL=https://app.example.com`
- `NEXT_PUBLIC_APP_URL=https://app.example.com`
- All `AUTH_COGNITO_*` vars from Secrets Manager

### 6.3 Session security

- `AUTH_SECRET` must be unique per environment.
- Cookies are managed by NextAuth; ensure the app is **HTTPS-only** in production (ALB terminates TLS).
- Review public routes in `src/middleware.ts` before go-live; portal/API paths are intentionally public.

---

## Phase 7 — Application security hardening

### 7.1 HTTP security headers

Add headers in `next.config.ts` (or via ALB/CloudFront):

```typescript
async headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ];
},
```

### 7.2 File uploads

Invoice logos are validated and optionally scanned (`src/lib/security/file-scan.ts`).

For production:

- Set `FILE_SCAN_REQUIRED=true`
- Run **ClamAV** as a sidecar or separate service; set `CLAMD_HOST`
- Or configure `VIRUSTOTAL_API_KEY` as a fallback
- Never disable scanning in prod (`FILE_SCAN_MODE=off` is dev-only)

### 7.3 Cron endpoint

`/api/cron/reminders` requires `Authorization: Bearer $CRON_SECRET`.

Schedule with **EventBridge Scheduler** → **Lambda** or **ECS scheduled task** that calls the endpoint over HTTPS with the secret. Do not expose the cron URL without authentication.

### 7.4 Google Calendar OAuth

Register production redirect URI in Google Cloud Console:

```
https://app.example.com/api/google-calendar/callback
```

Store `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Secrets Manager.

---

## Phase 8 — Containerize and deploy (ECS Fargate)

This is the recommended path for full DevSecOps control. Alternatives: **Amplify Hosting** (simpler, less network control) or **Elastic Beanstalk** (middle ground).

### 8.1 Dockerfile

Create `Dockerfile` in the repo root:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

Enable standalone output in `next.config.ts`:

```typescript
output: "standalone",
```

### 8.2 ECR repository

```bash
aws ecr create-repository --repository-name booking-platform --image-scanning-configuration scanOnPush=true
```

Enable **enhanced scanning** (Inspector) for CVE detection on push.

### 8.3 ECS service

1. Create cluster (Fargate).
2. Task definition: 512 CPU / 1024 MB (adjust after load testing).
3. Service: desired count ≥ 2 across AZs for HA.
4. Attach to **target group** (ALB, HTTP health check on `/` or dedicated `/api/health` if added).
5. Enable **ECS Exec** only for break-glass debugging; restrict IAM who can use it.

### 8.4 TLS and DNS

1. Request **ACM certificate** for `app.example.com` (DNS validation in Route 53).
2. ALB listener **443** → forward to target group; redirect **80** → **443**.
3. Route 53 **A alias** → ALB.

---

## Phase 9 — CI/CD deploy pipeline

**Implemented in this repo:**

- **Terraform** — [`terraform/`](../terraform/) provisions ECR, ALB, ECS, RDS, ACM, security groups, Secrets Manager, and the GitHub OIDC deploy role.
- **GitHub Actions** — [`.github/workflows/deploy-aws.yml`](../.github/workflows/deploy-aws.yml) builds the Docker image, pushes to ECR, and rolls ECS on push to `main`.
- **Deploy script** — [`scripts/ecs-deploy.sh`](../scripts/ecs-deploy.sh) registers a new task definition with the image tag from CI.

After `terraform apply`, set GitHub repository variable `AWS_DEPLOY_ROLE_ARN` from `terraform output github_deploy_role_arn`. See [`terraform/README.md`](../terraform/README.md).

Example GitHub Actions job (reference — use the workflow file above):

```yaml
name: Deploy production

on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::ACCOUNT_ID:role/GitHubActionsDeployRole
          aws-region: us-east-1

      - uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push
        env:
          ECR_REGISTRY: ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/booking-platform:$IMAGE_TAG .
          docker push $ECR_REGISTRY/booking-platform:$IMAGE_TAG

      - name: Deploy ECS
        run: |
          aws ecs update-service \
            --cluster booking-platform \
            --service booking-platform \
            --force-new-deployment
```

**Pipeline order:** SAST workflows pass → build image → scan image (ECR/Inspector) → deploy → smoke test.

---

## Phase 10 — Observability and incident response

### 10.1 Logging and monitoring

- Ship container logs to **CloudWatch Logs** (log group retention ≥ 30 days).
- ALB access logs → S3 (encrypted bucket, block public access).
- Metrics: ECS CPU/memory, ALB 5xx, RDS connections, free storage.
- Alarms: 5xx rate, task health, RDS storage < 20%.

### 10.2 Security monitoring

- **GuardDuty** findings → SNS or Security Hub → ticketing.
- **CloudTrail** alerts on IAM changes, security group changes, Secrets Manager access anomalies.
- Subscribe to **AWS Health** events.

### 10.3 Runbooks

Document:

- Secret rotation
- RDS restore from snapshot
- Rollback ECS to previous task definition revision
- Cognito callback URL mismatch (see README Cognito section)

---

## Phase 11 — Pre-production checklist

### Security

- [ ] No secrets in git history (`gitleaks` clean)
- [ ] RDS not publicly accessible; SG allows only ECS
- [ ] All secrets in Secrets Manager; task role least privilege
- [ ] HTTPS only; HSTS enabled
- [ ] Cognito callback/sign-out URLs match production hostname exactly
- [ ] `CRON_SECRET` set; cron invoked with Bearer token only
- [ ] File upload scanning enabled (`FILE_SCAN_REQUIRED=true`)
- [ ] WAF or rate limiting on public `/api/portal/*` if abuse is a concern
- [ ] CloudTrail, GuardDuty, Security Hub enabled

### Application

- [ ] `AUTH_URL` and `NEXT_PUBLIC_APP_URL` set to production URL
- [ ] Schema applied (`drizzle-kit push`)
- [ ] Provider bootstrap completed (Cognito + Setup flow)
- [ ] Resend domain verified (if using email)
- [ ] Google OAuth redirect URIs updated (if using Calendar sync)

### CI/CD

- [ ] Branch protection and required checks enabled
- [ ] Deploy uses OIDC (no long-lived AWS keys in GitHub Secrets)
- [ ] ECR image scanning on push
- [ ] Rollback procedure tested

### Smoke test after deploy

```bash
curl -I https://app.example.com
curl -I https://app.example.com/api/auth/signin
# Sign in via Cognito in browser
# Create client, book session, verify email if configured
```

---

## Phase 12 — Ongoing DevSecOps operations

| Cadence | Activity |
|---------|----------|
| Every PR | SAST, lint, npm audit, dependency review, code review |
| Weekly | Review GuardDuty/Security Hub; triage Dependabot PRs |
| Monthly | RDS patch window; rotate non-RDS secrets; access review |
| Quarterly | Penetration test or OWASP ZAP scan against staging; DR drill (RDS restore) |
| On incident | Rotate exposed secrets; review CloudTrail; post-mortem |

---

## Alternative deployment paths

### AWS Amplify Hosting

**Pros:** Fastest path, built-in CI from Git, automatic HTTPS.  
**Cons:** Less control over VPC peering to private RDS (often requires RDS Proxy + public subnet or VPN).

Use when learning frontend deploy; migrate to ECS when you need private RDS-only networking.

### Elastic Beanstalk (Docker)

**Pros:** Managed platform, simpler than raw ECS.  
**Cons:** Less granular security grouping than ECS + custom VPC design.

---

## Environment variable reference (production)

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | RDS with `sslmode=require` |
| `AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `AUTH_URL` | Yes | Public HTTPS URL |
| `NEXT_PUBLIC_APP_URL` | Yes | Same as public URL |
| `AUTH_COGNITO_ID` | Recommended | Cognito app client |
| `AUTH_COGNITO_SECRET` | Recommended | Cognito app client secret |
| `AUTH_COGNITO_ISSUER` | Recommended | Cognito issuer URL |
| `COGNITO_DOMAIN` | Recommended | Hosted UI logout |
| `CRON_SECRET` | Yes | Protect cron route |
| `RESEND_API_KEY` | Optional | Email |
| `GOOGLE_CLIENT_ID/SECRET` | Optional | Calendar sync |
| `CLAMD_HOST` | Recommended | Malware scan |
| `FILE_SCAN_REQUIRED` | Recommended | `true` in prod |

---

## Estimated build order (first-time)

1. AWS account security (Phase 0–2)  
2. VPC + security groups (Phase 3)  
3. Secrets Manager (Phase 4)  
4. RDS + schema (Phase 5)  
5. Cognito (Phase 6)  
6. ECR + Dockerfile + ECS + ALB + ACM (Phase 8)  
7. Wire secrets into task definition  
8. CI/CD with OIDC (Phase 9)  
9. Run pre-production checklist (Phase 11)  
10. Enable monitoring and schedules (Phases 7.3, 10)

---

## License and vulnerability reporting

See [SECURITY.md](../SECURITY.md) for responsible disclosure. Do not file public issues for security bugs.
