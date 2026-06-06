# Security

## Reporting vulnerabilities

Please **do not** open public GitHub issues for security problems. Email the maintainer privately with steps to reproduce.

## Secrets

- Never commit `.env`, `.env.local`, or credentials.
- Rotate `AUTH_SECRET`, `CRON_SECRET`, and database passwords if they were ever exposed.
- Use AWS Secrets Manager or SSM Parameter Store in production.

## Authentication

- Providers sign in with email/password (bcrypt, NextAuth JWT).
- The client portal uses the same sign-in; a client row must exist with a matching email.
- Protect `/api/providers` and provider dashboards with session checks (`requireAdminProvider`).

## Dependencies

Run `npm audit` regularly and update dependencies. CI fails on high-severity issues via [`.github/workflows/sast.yml`](.github/workflows/sast.yml). Dependabot opens update PRs; see [README — Branch protection](README.md#branch-protection-main) for required merge checks (`npm audit`, `ESLint`, `Gitleaks`, CodeQL).

## Uploads

Invoice logos are validated as images and optionally scanned (ClamAV / VirusTotal). Configure `CLAMD_HOST` or `VIRUSTOTAL_API_KEY` in production.

## Database

Use **AWS RDS PostgreSQL** with `sslmode=require` in `DATABASE_URL`. Apply least-privilege DB users for the application role. Do not commit connection strings; store them in Secrets Manager in production.
