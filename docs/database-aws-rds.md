# Database: AWS RDS PostgreSQL

This app uses **PostgreSQL** via Drizzle ORM. Production is intended to run on **Amazon RDS**, not Neon.

## Connection string

In `.env.local` or AWS Secrets Manager:

```env
DATABASE_URL=postgresql://APP_USER:PASSWORD@your-db.xxxxx.us-east-1.rds.amazonaws.com:5432/booking_platform?sslmode=require
```

- Create a dedicated database, e.g. `booking_platform`.
- Use `sslmode=require` for RDS.
- Do **not** use Neon-specific options (`channel_binding`, pooler hostnames, etc.).

## Apply schema (new RDS)

After RDS is reachable from your machine (security group allows your IP on port 5432):

```bash
npx drizzle-kit push
```

This creates all tables to match `src/lib/db/schema.ts`.

## Migrating from Neon

1. **Option A — Fresh start (simplest)**  
   - Create RDS instance.  
   - Set `DATABASE_URL` to RDS.  
   - Run `npx drizzle-kit push`.  
   - Sign in with Cognito and complete **Setup**, or run `scripts/create-provider.ts`.

2. **Option B — Move data**  
   - `pg_dump` from Neon, `pg_restore` to RDS.  
   - Run `npx drizzle-kit push` to add any missing columns (e.g. `password_hash`).  
   - Update Cognito/provider emails if IDs differ.

## Local dev against RDS

Allow your IP in the RDS security group, set `DATABASE_URL` in `.env.local`, restart `npm run dev`.

## Production

Store `DATABASE_URL` in **Secrets Manager** or **SSM Parameter Store** and inject into your compute layer (ECS, Amplify, Beanstalk, etc.). Use a **private subnet** and security group so only the app can reach RDS on port 5432; set `Publicly accessible` to **No** on the RDS instance.
