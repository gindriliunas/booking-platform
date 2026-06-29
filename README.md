# Booking Platform

A Next.js app for service providers to manage calendars, clients, session packages, and a client self-booking portal. Built as a clean reference project suitable for public hosting and AWS deployment practice.

## Features

- Provider dashboard: calendar, clients, packages, questionnaires, settings
- Client portal: book sessions, view packages, complete forms
- NextAuth authentication (AWS Cognito OIDC and/or email/password)
- PostgreSQL + Drizzle ORM
- Optional Google Calendar sync, Resend email, file scanning for invoice logos

## Quick start

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Set `DATABASE_URL` to your **AWS RDS** Postgres URL (see [docs/database-aws-rds.md](docs/database-aws-rds.md)) and generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

3. Apply schema and create a provider account:

```bash
npm install
npx drizzle-kit push
DEMO_PROVIDER_EMAIL=you@example.com DEMO_PROVIDER_PASSWORD='YourSecurePass1!' npx tsx scripts/create-provider.ts
```

4. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

## AWS Cognito

Set these in `.env.local` (from the Cognito app client and user pool):

| Variable | Example |
|----------|---------|
| `AUTH_COGNITO_ISSUER` | `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_AJTQbs10a` |
| `AUTH_COGNITO_ID` | App client ID |
| `AUTH_COGNITO_SECRET` | App client secret |
| `COGNITO_DOMAIN` | `https://your-domain.auth.us-east-1.amazoncognito.com` |

(`COGNITO_CLIENT_ID` / `COGNITO_CLIENT_SECRET` / `COGNITO_ISSUER` also work.)

In the Cognito app client (must match the authorize URL your app sends):

**Allowed callback URLs** — add these **exact** lines (no trailing slash):

```
http://localhost:3000/api/auth/callback/cognito
http://localhost:3000/api/auth/callback/cognito-signup
```

Production example (`booking.gindri.com`):

```
https://booking.gindri.com/api/auth/callback/cognito
https://booking.gindri.com/api/auth/callback/cognito-signup
```

**Allowed sign-out URLs:**

```
http://localhost:3000
```

**OAuth settings** on the same app client:

- Enable **Authorization code grant**
- OpenID scopes: enable **openid** and **email** (required). The app requests `openid email` only — if you enable **profile** or **phone** in Cognito, update `scope` in `src/auth.ts` to match.
- Under **Sign-up experience**, enable **Self-registration** if you want users to create accounts via **Sign up with Amazon Cognito**.

**App integration → Domain** — hosted UI domain must exist (e.g. `us-east-1ajtqbs10a.auth.us-east-1.amazoncognito.com`).

If you see Cognito’s generic “Something went wrong” on `/oauth2/authorize`, the callback URL is missing or does not match character-for-character.

Your app sends:

`redirect_uri=http://localhost:3000/api/auth/callback/cognito`

That is **not** the CloudFront root URL from AWS’s Express sample (`https://d84l1y8p4kdic.cloudfront.net`); Next.js needs the `/api/auth/callback/cognito` path.

The sign-in page shows **Sign in with Amazon Cognito** when the three required env vars are set. First-time Cognito users complete **Setup**; the provider row is keyed by Cognito `sub` or matched by email if you migrated from credentials.

## Client portal

Clients sign in with the **same** provider credentials. Add a client in the dashboard whose **email matches** the provider login email (for demos), or use a separate email and sign in as that user once a password is set on a provider row with that email.

Free packages can be claimed from `/portal/packages`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run test` | Unit tests (Vitest) |
| `npx drizzle-kit push` | Apply schema to database |
| `npx tsx scripts/create-provider.ts` | Create provider (env vars required) |
| `npx tsx scripts/seed-demo.ts` | Optional demo clients/bookings |
| `npx tsx scripts/cleanup-demo.ts` | Remove demo seed data |

## Database (AWS RDS)

The app targets **Amazon RDS PostgreSQL**, not Neon. Set `DATABASE_URL` in `.env.local`, then run `npx drizzle-kit push` to create tables.

See **[docs/database-aws-rds.md](docs/database-aws-rds.md)** for RDS connection strings, security groups, and migrating from Neon.

## AWS deployment (practice)

Typical layout:

- **RDS PostgreSQL** for `DATABASE_URL` (required)
- **ECS/Fargate**, **Elastic Beanstalk**, or **Amplify** for the Next.js app
- **Cognito User Pool** for authentication (optional)
- **Secrets Manager** for `AUTH_SECRET`, `COGNITO_*`, `CRON_SECRET`, `RESEND_API_KEY`
- **ALB** with HTTPS in front of the app

Set `AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your public hostname.

### Docker image (ECR)

The repo includes a production `Dockerfile` (Next.js standalone on port **3000**).

```bash
npm run build          # verify locally first
docker build -t booking-platform .
```

Push to ECR (Docker Desktop + AWS CLI required):

```powershell
.\scripts\push-ecr.ps1
```

Image URI for ECS:

```
631026310596.dkr.ecr.us-east-1.amazonaws.com/booking-platform:latest
```

## AWS network & security groups

Production uses a **three-tier security group** model in a VPC. Security groups are stateful firewalls — each tier only accepts traffic from the tier above it.

```
Internet
   │
   ▼
┌─────────────────────────────────────┐
│  Application Load Balancer (ALB)    │  booking-alb-sg
│  Public subnets · HTTPS :443        │
└─────────────────┬───────────────────┘
                  │ TCP :3000 (from sg-alb only)
                  ▼
┌─────────────────────────────────────┐
│  ECS Fargate (Next.js app)          │  booking-ecs-sg
│  Private app subnets · port 3000    │
└─────────────────┬───────────────────┘
                  │ PostgreSQL :5432 (from sg-ecs only)
                  ▼
┌─────────────────────────────────────┐
│  RDS PostgreSQL                     │  booking-rds-sg
│  Private data subnets · no public IP│
└─────────────────────────────────────┘

External APIs (Cognito, Resend, Google) ← ECS via NAT Gateway :443
Secrets (DATABASE_URL, AUTH_SECRET)     ← AWS Secrets Manager
Auth                                     ← AWS Cognito (OIDC)
```

### Security group rules

| Security group | Attached to | Inbound | Purpose |
|----------------|-------------|---------|---------|
| **booking-alb-sg** | Application Load Balancer | `443` from `0.0.0.0/0` | Public HTTPS entry point |
| **booking-ecs-sg** | ECS Fargate tasks | `3000` from **booking-alb-sg** only | App not exposed to internet |
| **booking-rds-sg** | RDS PostgreSQL | `5432` from **booking-ecs-sg** only | Database reachable only by app |

**Outbound:** default allow-all on each group (ECS needs `443` via NAT for Cognito/email APIs; `5432` to RDS).

### Design decisions (DevSecOps)

- **No public RDS** in production — `Publicly accessible = No`, database in private subnets.
- **Reference security groups by ID**, not IP ranges — rules stay correct when ECS scales across AZs.
- **Secrets in Secrets Manager**, not in the container image or git.
- **NACLs** are optional defense-in-depth; security groups are the primary control.
- **No VPN / Virtual Private Gateway** required — cloud-native SaaS layout, not on-prem hybrid.

### Related services

| Concern | AWS service |
|---------|-------------|
| Compute | ECS Fargate + ECR |
| Database | RDS PostgreSQL (Multi-AZ, encrypted) |
| Auth | Cognito User Pool |
| Secrets | Secrets Manager |
| Edge | Route 53, ACM, ALB (+ optional WAF) |
| CI/CD | GitHub Actions → ECR → ECS (OIDC, no long-lived keys) |

Full deployment runbook: [docs/devsecops-aws-deployment.md](docs/devsecops-aws-deployment.md) · Diagrams: [docs/architecture-diagrams.md](docs/architecture-diagrams.md)

## Security

See [SECURITY.md](SECURITY.md).

### CI security scanning

GitHub Actions run on every push and pull request to `main`:

| Workflow / setting | What it checks |
|------------------|----------------|
| **CodeQL default setup** (repo **Security** settings) | Static analysis for TypeScript/JavaScript |
| [`.github/workflows/sast.yml`](.github/workflows/sast.yml) | `npm audit` (high+), ESLint, Gitleaks (secrets in git history) |
| [`.github/workflows/dependency-review.yml`](.github/workflows/dependency-review.yml) | New dependencies on pull requests (high+ advisories) |

**When CI runs:** [sast.yml](.github/workflows/sast.yml) on every push and pull request to `main`; [dependency-review.yml](.github/workflows/dependency-review.yml) on pull requests only.

**Local checks (not in CI yet):** run before deploying or opening a PR:

```bash
npm ci && npm run lint && npm test && npm audit --audit-level=high && npm run build
```

Lint and audit are covered in CI; tests and production build are developer responsibility until added to a workflow.

Do not add a custom CodeQL job to `sast.yml` while default setup is enabled — GitHub rejects duplicate advanced configurations.

### Branch protection (`main`)

A GitHub ruleset on `main` enforces:

- Restrict deletion and block force pushes
- Pull requests required (no direct pushes)
- Review from a [code owner](.github/CODEOWNERS) (`@gindriliunas`)

**Require status checks to pass** (add under the ruleset after [sast.yml](.github/workflows/sast.yml) has run once on a PR):

- `npm audit`
- `ESLint`
- `Gitleaks`

**Require code scanning results:**

- CodeQL (high or higher)

Dependabot handles dependency update PRs. [dependency-review.yml](.github/workflows/dependency-review.yml) may still run on PRs but is not required for merge.

### Pull request review

[Cursor Bugbot](https://cursor.com/bugbot) is connected to this repository and automatically reviews pull requests for potential bugs and issues, alongside human review from the [code owner](.github/CODEOWNERS).

## License

MIT — see [LICENSE](LICENSE) if present; add one before publishing if needed.


AUTH_COGNITO_KEY=1234LKJ2J43643L6J7875LJf
