# Architecture Diagrams — Booking Platform

High Level Design (HLD), Data Flow Diagrams (DFD), and supporting views for the Booking Platform on AWS.

**Related:** [devsecops-aws-deployment.md](./devsecops-aws-deployment.md) · [database-aws-rds.md](./database-aws-rds.md)

> **Note:** “HDL” in common usage means **HLD (High Level Design)** — used throughout this document.

---

## Diagram index

| # | Diagram | Type | Purpose |
|---|---------|------|---------|
| 1 | [System context](#1-hld--system-context) | HLD | External actors and system boundary |
| 2 | [AWS infrastructure](#2-hld--aws-infrastructure) | HLD | Production cloud topology |
| 3 | [Application layers](#3-hld--application-layers) | HLD | Next.js internal structure |
| 4 | [Component diagram](#4-hld--component-diagram) | HLD | Major modules and dependencies |
| 5 | [Security architecture](#5-hld--security-architecture) | HLD | Auth, secrets, scanning, network controls |
| 6 | [CI/CD pipeline](#6-hld--cicd-pipeline) | HLD | Build, scan, deploy flow |
| 7 | [VPC network](#7-hld--vpc-network) | HLD | Subnets and security groups |
| 8 | [DFD Level 0](#8-dfd--level-0-context) | DFD | Context diagram |
| 9 | [DFD Level 1](#9-dfd--level-1-system-decomposition) | DFD | Top-level processes |
| 10 | [DFD Level 2 — Auth](#10-dfd--level-2-authentication) | DFD | Sign-in / session flow |
| 11 | [DFD Level 2 — Booking](#11-dfd--level-2-booking) | DFD | Provider + portal booking |
| 12 | [DFD Level 2 — Reminders](#12-dfd--level-2-session-reminders) | DFD | Cron + email |
| 13 | [Logical data model](#13-logical-data-model-erd) | ERD | Core entities |
| 14 | [Sequence — Cognito sign-in](#14-sequence--cognito-sign-in) | Sequence | OAuth flow |
| 15 | [Sequence — Client self-book](#15-sequence--client-self-book) | Sequence | Portal booking |

---

## Legend

### DFD notation (used in Sections 8–12)

| Symbol | Meaning |
|--------|---------|
| `[External Entity]` | Person or system outside the app |
| `((Process))` | Transform / business logic |
| `[(Data Store)]` | Persistent data |
| `-->` | Data flow (label on arrow) |

### AWS / HLD notation

| Symbol | Meaning |
|--------|---------|
| Solid box | AWS managed service or app tier |
| Dashed box | Optional / external integration |
| Red path | Sensitive data (credentials, PII, tokens) |

---

## 1. HLD — System context

Shows the Booking Platform as a single system and its external dependencies.

```mermaid
flowchart TB
    subgraph actors [External Actors]
        Provider["Service Provider<br/>(Dashboard user)"]
        Client["Client<br/>(Portal user)"]
        DevOps["DevOps Engineer"]
    end

    subgraph system [Booking Platform System]
        App["Next.js Application<br/>(Provider dashboard + Client portal + API)"]
    end

    subgraph external [External Services]
        Cognito["AWS Cognito<br/>(OIDC / Hosted UI)"]
        RDS[("Amazon RDS<br/>PostgreSQL")]
        Resend["Resend<br/>(Email API)"]
        Google["Google Calendar API<br/>(OAuth)"]
        ClamAV["ClamAV / VirusTotal<br/>(File scan)"]
    end

    subgraph aws_ops [AWS Operations]
        GH["GitHub<br/>(Source + CI)"]
        ECR["Amazon ECR"]
        ECS["Amazon ECS Fargate"]
        SM["Secrets Manager"]
        R53["Route 53 + ACM + ALB"]
    end

    Provider -->|"HTTPS"| R53
    Client -->|"HTTPS"| R53
    R53 --> App
    App --> ECS

    App <-->|"OIDC auth"| Cognito
    App <-->|"SQL / Drizzle ORM"| RDS
    App -->|"Transactional email"| Resend
    App <-->|"Calendar sync tokens"| Google
    App -->|"Logo upload scan"| ClamAV

    ECS -->|"Read secrets at startup"| SM
    DevOps -->|"Push code / review PRs"| GH
    GH -->|"Build + scan + deploy"| ECR
    ECR --> ECS
```

---

## 2. HLD — AWS infrastructure

Production reference architecture (ECS Fargate path from [devsecops-aws-deployment.md](./devsecops-aws-deployment.md)).

```mermaid
flowchart TB
    Internet((Internet))

    subgraph edge [Edge Layer — Public]
        R53["Route 53<br/>DNS"]
        ACM["ACM<br/>TLS Certificate"]
        WAF["AWS WAF<br/>(optional)"]
        ALB["Application Load Balancer<br/>HTTPS :443"]
    end

    subgraph vpc [VPC 10.0.0.0/16]
        subgraph public_subnets [Public Subnets — 2 AZs]
            NAT["NAT Gateway"]
        end

        subgraph private_app [Private App Subnets — 2 AZs]
            ECS["ECS Fargate Service<br/>Next.js container :3000"]
            ClamSidecar["ClamAV sidecar<br/>(optional)"]
        end

        subgraph private_data [Private Data Subnets — 2 AZs]
            RDS[("RDS PostgreSQL<br/>Multi-AZ, encrypted")]
        end
    end

    subgraph shared [Shared AWS Services]
        SM["Secrets Manager"]
        CW["CloudWatch Logs + Metrics"]
        EB["EventBridge Scheduler<br/>(cron trigger)"]
        Lambda["Lambda / ECS Task<br/>(cron caller)"]
        Cognito["Cognito User Pool"]
        ECR["ECR<br/>Container registry"]
    end

    subgraph cicd [CI/CD]
        GH["GitHub Actions"]
        OIDC["IAM OIDC Role"]
    end

    Internet --> R53 --> ACM --> WAF --> ALB
    ALB -->|"sg-alb → sg-ecs"| ECS
    ECS --> ClamSidecar
    ECS -->|"sg-ecs → sg-rds :5432"| RDS
    ECS -->|"443 via NAT"| Cognito
    ECS --> SM
    ECS --> CW

    EB --> Lambda
    Lambda -->|"Bearer CRON_SECRET"| ALB

    GH --> OIDC --> ECR
    ECR --> ECS

    style RDS fill:#232F3E,color:#fff
    style ECS fill:#FF9900,color:#000
    style SM fill:#DD344C,color:#fff
```

---

## 3. HLD — Application layers

Internal structure of the Next.js monolith.

```mermaid
flowchart TB
    subgraph presentation [Presentation Layer]
        Pages["App Router pages<br/>(app)/ dashboard, setup, settings"]
        Portal["Portal pages<br/>/portal/*"]
        Components["React components<br/>calendar, dialogs, forms"]
    end

    subgraph edge_layer [Edge Layer]
        MW["middleware.ts<br/>NextAuth session gate"]
    end

    subgraph api [API Layer — Route Handlers]
        AuthAPI["/api/auth/*<br/>NextAuth + Cognito logout"]
        ProviderAPI["/api/providers, clients,<br/>bookings, packages, ..."]
        PortalAPI["/api/portal/*<br/>self-book, profile, claim"]
        Integrations["/api/google-calendar/*<br/>/api/cron/reminders"]
    end

    subgraph domain [Domain / Business Logic]
        AuthLib["auth-provider.ts<br/>requireAdminProvider"]
        Slots["slots.ts / availability"]
        Waitlist["waitlist.ts"]
        LateCancel["late-cancel.ts"]
        FileScan["security/file-scan.ts"]
        Email["email/*"]
    end

    subgraph data [Data Access Layer]
        Drizzle["Drizzle ORM"]
        Schema["schema.ts"]
        DBConn["db/index.ts<br/>postgres driver"]
    end

    subgraph storage [Persistence]
        PG[("PostgreSQL")]
    end

    Pages --> Components
    Portal --> Components
    Pages --> MW
    Portal --> MW
    MW --> AuthAPI
    MW --> ProviderAPI
    MW --> PortalAPI

    ProviderAPI --> AuthLib
    ProviderAPI --> domain
    PortalAPI --> domain
    Integrations --> domain

    domain --> Drizzle
    Drizzle --> Schema
    Drizzle --> DBConn
    DBConn --> PG
```

---

## 4. HLD — Component diagram

Functional modules and their main interactions.

```mermaid
flowchart LR
    subgraph ui [UI Modules]
        Cal["Session Calendar"]
        ClientsUI["Clients Manager"]
        PkgUI["Packages / Subscriptions"]
        QUI["Questionnaires"]
        PortalUI["Client Portal"]
        SettingsUI["Provider Settings"]
    end

    subgraph core [Core Services]
        Auth["Authentication<br/>NextAuth + Cognito + bcrypt"]
        BookingSvc["Booking Service<br/>individual + group + recurrence"]
        AvailSvc["Availability Engine"]
        PkgSvc["Package / Subscription<br/>session accounting"]
        FormSvc["Questionnaire Service"]
        InvoiceSvc["Invoice Generator"]
    end

    subgraph integrations [Integrations]
        GCal["Google Calendar Sync"]
        Mail["Resend Email"]
        Scan["File Scanner<br/>ClamAV / VT"]
        Cron["Reminder Cron"]
    end

    DB[("PostgreSQL")]

    Cal --> BookingSvc
    Cal --> AvailSvc
    ClientsUI --> BookingSvc
    PkgUI --> PkgSvc
    QUI --> FormSvc
    PortalUI --> BookingSvc
    PortalUI --> PkgSvc
    PortalUI --> FormSvc
    SettingsUI --> GCal
    SettingsUI --> InvoiceSvc
    SettingsUI --> Scan

    Auth --> DB
    BookingSvc --> DB
    AvailSvc --> DB
    PkgSvc --> DB
    FormSvc --> DB
    InvoiceSvc --> DB
    GCal --> DB
    Cron --> DB
    Cron --> Mail
    InvoiceSvc --> Mail
    Scan --> InvoiceSvc
```

---

## 5. HLD — Security architecture

Defense-in-depth view aligned with [SECURITY.md](../SECURITY.md).

```mermaid
flowchart TB
    subgraph perimeter [Perimeter]
        TLS["TLS 1.2+ at ALB"]
        WAF["WAF rate limits + OWASP rules"]
        HSTS["Security headers<br/>HSTS, X-Frame-Options, ..."]
    end

    subgraph identity [Identity & Access]
        Cognito["Cognito OIDC"]
        JWT["NextAuth JWT sessions"]
        MW["Middleware route protection"]
        RBAC["requireAdminProvider<br/>provider-scoped API auth"]
        CronAuth["CRON_SECRET Bearer token"]
    end

    subgraph data_protection [Data Protection]
        RDSEnc["RDS encryption at rest"]
        SSL["DATABASE_URL sslmode=require"]
        Secrets["Secrets Manager<br/>no secrets in git/image"]
        Bcrypt["bcrypt password hashes"]
    end

    subgraph app_security [Application Security]
        UploadVal["Image validation<br/>image-data-url.ts"]
        FileScan["Malware scan<br/>file-scan.ts"]
        PromptSan["LLM prompt sanitization<br/>questionnaire answers"]
        Audit["npm audit + Gitleaks + ESLint CI"]
    end

    subgraph monitoring [Detection & Response]
        CT["CloudTrail"]
        GD["GuardDuty"]
        SH["Security Hub"]
        CWL["CloudWatch alarms"]
    end

    User((User)) --> TLS --> WAF --> HSTS
    HSTS --> MW
    MW --> Cognito
    MW --> JWT
    JWT --> RBAC
    RBAC --> RDSEnc
    RDSEnc --> SSL

    UploadVal --> FileScan
    CronAuth --> CronJob["/api/cron/reminders"]

    CT --> GD --> SH
    SH --> CWL
    Audit --> Deploy["Deploy gate"]
```

---

## 6. HLD — CI/CD pipeline

```mermaid
flowchart LR
    Dev["Developer"] -->|"git push / PR"| GH["GitHub"]

    subgraph ci [Continuous Integration]
        SAST["SAST workflow<br/>npm audit, ESLint, Gitleaks"]
        DepRev["Dependency review<br/>(PR only)"]
        Test["npm test + build"]
    end

    subgraph cd [Continuous Deployment — main branch]
        OIDC["AWS OIDC assume role"]
        Docker["docker build"]
        ECRPush["Push to ECR<br/>scan on push"]
        ECSDeploy["ECS rolling deploy"]
        Smoke["Smoke test HTTPS"]
    end

    GH --> SAST
    GH --> DepRev
    GH --> Test
    SAST -->|"pass"| Test
    DepRev -->|"pass"| Test
    Test -->|"merge to main"| OIDC
    OIDC --> Docker --> ECRPush --> ECSDeploy --> Smoke
```

---

## 7. HLD — VPC network

```mermaid
flowchart TB
    subgraph internet [Internet]
        Users["Providers + Clients"]
    end

    subgraph vpc [VPC]
        subgraph az1 [Availability Zone A]
            PubA["Public subnet<br/>ALB, NAT"]
            PrivAppA["Private subnet<br/>ECS task"]
            PrivDataA["Private subnet<br/>RDS primary"]
        end

        subgraph az2 [Availability Zone B]
            PubB["Public subnet<br/>ALB, NAT"]
            PrivAppB["Private subnet<br/>ECS task"]
            PrivDataB["Private subnet<br/>RDS standby"]
        end
    end

    Users -->|"443"| ALB["ALB<br/>sg-alb"]
    ALB -->|"3000"| ECS["ECS tasks<br/>sg-ecs"]
    ECS -->|"5432"| RDS["RDS<br/>sg-rds"]
    ECS --> NAT["NAT Gateway"]
    NAT --> Ext["Cognito, Resend,<br/>Google APIs"]

    SGNote["Security group rules:<br/>sg-alb: 443 in from 0.0.0.0/0<br/>sg-ecs: 3000 in from sg-alb only<br/>sg-rds: 5432 in from sg-ecs only"]
```

---

## 8. DFD — Level 0 (Context)

Single process representing the entire system. External entities exchange data with **P0: Booking Platform**.

```mermaid
flowchart LR
    Provider["E1: Provider"]
    Client["E2: Client"]
    Cognito["E3: AWS Cognito"]
    Resend["E4: Resend"]
    Google["E5: Google Calendar"]
    Scheduler["E6: EventBridge<br/>Scheduler"]
    Scanner["E7: ClamAV / VT"]

    P0(("P0<br/>Booking<br/>Platform"))

    Provider -->|"credentials / dashboard actions"| P0
    P0 -->|"calendar, clients, invoices"| Provider

    Client -->|"portal sign-in, book, forms"| P0
    P0 -->|"confirmations, reminders, availability"| Client

    P0 <-->|"OIDC tokens, user claims"| Cognito

    P0 -->|"email payloads"| Resend

    P0 <-->|"OAuth tokens, events"| Google

    Scheduler -->|"cron trigger + CRON_SECRET"| P0

    P0 -->|"file bytes for scan"| Scanner
    Scanner -->|"clean / infected verdict"| P0
```

---

## 9. DFD — Level 1 (System decomposition)

P0 decomposed into major processes and data stores.

```mermaid
flowchart TB
    Provider["E1: Provider"]
    Client["E2: Client"]
    Cognito["E3: Cognito"]
    Resend["E4: Resend"]
    Google["E5: Google"]
    Scheduler["E6: Scheduler"]

    P1(("P1<br/>Authenticate<br/>& Authorize"))
    P2(("P2<br/>Manage Provider<br/>Operations"))
    P3(("P3<br/>Client Portal<br/>Self-Service"))
    P4(("P4<br/>Send<br/>Notifications"))
    P5(("P5<br/>Sync External<br/>Calendars"))
    P6(("P6<br/>Process<br/>Reminders"))

    D1[("D1: Providers<br/>& Settings")]
    D2[("D2: Clients")]
    D3[("D3: Bookings<br/>& Availability")]
    D4[("D4: Packages &<br/>Subscriptions")]
    D5[("D5: Questionnaires<br/>& Responses")]
    D6[("D6: Reminder<br/>Logs")]

    Provider --> P1
    Client --> P1
    P1 <--> Cognito
    P1 --> D1

    Provider --> P2
    P2 --> D1
    P2 --> D2
    P2 --> D3
    P2 --> D4
    P2 --> D5

    Client --> P3
    P3 --> D2
    P3 --> D3
    P3 --> D4
    P3 --> D5

    P2 --> P4
    P3 --> P4
    P6 --> P4
    P4 --> Resend
    P4 --> D6

    Provider --> P5
    P5 <--> Google
    P5 --> D1
    P5 --> D3

    Scheduler --> P6
    P6 --> D3
    P6 --> D6
    P6 --> P4
```

### Level 1 process descriptions

| Process | Description | Key API routes |
|---------|-------------|----------------|
| **P1** | Sign-in (Cognito OIDC or credentials), JWT session, middleware | `/api/auth/*`, `middleware.ts` |
| **P2** | Provider dashboard: clients, calendar, packages, questionnaires, settings | `/api/clients`, `/api/bookings`, `/api/packages`, … |
| **P3** | Client portal: book sessions, claim packages, complete forms | `/api/portal/*` |
| **P4** | Email: invoices, waitlist, reminders | Resend via `src/lib/email/*` |
| **P5** | Google Calendar OAuth connect/sync | `/api/google-calendar/*` |
| **P6** | Scheduled reminder job | `/api/cron/reminders` |

---

## 10. DFD — Level 2: Authentication

Decomposition of **P1 — Authenticate & Authorize**.

```mermaid
flowchart TB
    User["E: User<br/>(Provider or Client)"]
    Cognito["E: AWS Cognito"]

    P1_1(("P1.1<br/>Present<br/>Sign-In"))
    P1_2(("P1.2<br/>Validate<br/>Credentials"))
    P1_3(("P1.3<br/>Exchange<br/>OIDC Code"))
    P1_4(("P1.4<br/>Issue JWT<br/>Session"))
    P1_5(("P1.5<br/>Enforce Route<br/>Access"))
    P1_6(("P1.6<br/>Resolve<br/>Provider ID"))

    D1[("D1: providers<br/>password_hash, email")]
    D7[("D7: Session JWT<br/>(client cookie)")]

    User -->|"email + password"| P1_1
    User -->|"Sign in with Cognito"| P1_1

    P1_1 -->|"credential login"| P1_2
    P1_2 -->|"lookup hash"| D1
    D1 -->|"provider row"| P1_2
    P1_2 -->|"valid user"| P1_4

    P1_1 -->|"redirect to hosted UI"| Cognito
    Cognito -->|"auth code"| P1_3
    P1_3 -->|"token request"| Cognito
    Cognito -->|"id_token, sub, email"| P1_3
    P1_3 -->|"match/create provider"| D1
    P1_3 --> P1_4

    P1_4 -->|"Set session cookie"| D7
    D7 --> P1_5
    P1_5 -->|"protected route"| P1_6
    P1_6 -->|"providerId for API"| D1
```

---

## 11. DFD — Level 2: Booking

Decomposition of booking flows for **P2** (provider) and **P3** (portal).

```mermaid
flowchart TB
    Provider["E: Provider"]
    Client["E: Client"]

    P2_1(("P2.1<br/>Create / Edit<br/>Booking"))
    P2_2(("P2.2<br/>Block<br/>Time"))
    P3_1(("P3.1<br/>Check<br/>Availability"))
    P3_2(("P3.2<br/>Self-Book<br/>Session"))
    P3_3(("P3.3<br/>Join Group /<br/>Waitlist"))
    P2_3(("P2.3<br/>Apply Late<br/>Cancel Rules"))

    D1[("D1: providers")]
    D2[("D2: clients")]
    D3[("D3: bookings<br/>blocked_times<br/>participants<br/>waitlist")]
    D4[("D4: client_packages<br/>client_subscriptions")]

    Provider --> P2_1
    Provider --> P2_2
    P2_1 --> D3
    P2_2 --> D3
    P2_1 --> D1

    Client --> P3_1
    P3_1 --> D3
    P3_1 --> D1
    P3_1 -->|"open slots"| Client

    Client --> P3_2
    P3_2 --> D3
    P3_2 --> D4
    P3_2 -->|"decrement session credit"| D4

    Client --> P3_3
    P3_3 --> D3

    Client -->|"cancel booking"| P2_3
    P2_3 --> D3
    P2_3 --> D4
    P2_3 -->|"deduct / waive session"| D4
```

---

## 12. DFD — Level 2: Session reminders

Decomposition of **P6 — Process Reminders**.

```mermaid
flowchart TB
    Scheduler["E: EventBridge<br/>Scheduler"]
    Resend["E: Resend"]

    P6_1(("P6.1<br/>Validate<br/>Cron Auth"))
    P6_2(("P6.2<br/>Query Upcoming<br/>Bookings"))
    P6_3(("P6.3<br/>Dedupe via<br/>Reminder Log"))
    P6_4(("P6.4<br/>Queue /<br/>Send Email"))

    D3[("D3: bookings")]
    D2[("D2: clients")]
    D6[("D6: reminder_logs")]

    Scheduler -->|"GET /api/cron/reminders<br/>Bearer CRON_SECRET"| P6_1
    P6_1 -->|"authorized"| P6_2
    P6_2 --> D3
    D3 --> P6_2
    P6_2 --> D2

    P6_2 --> P6_3
    P6_3 --> D6
    D6 -->|"insert if not exists"| P6_3

    P6_3 --> P6_4
    P6_4 --> Resend
    P6_4 -->|"log sent"| D6
```

---

## 13. Logical data model (ERD)

Core entities from `src/lib/db/schema.ts` (simplified).

```mermaid
erDiagram
    providers ||--o{ clients : manages
    providers ||--o{ packages : offers
    providers ||--o{ subscription_plans : offers
    providers ||--o{ bookings : schedules
    providers ||--o{ questionnaires : creates
    providers ||--o{ blocked_times : defines

    clients ||--o{ client_packages : purchases
    clients ||--o{ client_subscriptions : subscribes
    clients ||--o{ bookings : attends
    clients ||--o{ client_questionnaires : completes
    clients ||--o{ booking_participants : joins
    clients ||--o{ waitlist_entries : waits

    packages ||--o{ client_packages : instantiated_as
    subscription_plans ||--o{ client_subscriptions : instantiated_as

    bookings ||--o{ booking_participants : has
    bookings ||--o{ waitlist_entries : has
    bookings ||--o{ reminder_logs : triggers
    bookings }o--|| booking_series : may_belong_to

    questionnaires ||--o{ questionnaire_questions : contains
    questionnaires ||--o{ client_questionnaires : assigned_via
    client_questionnaires ||--o{ client_questionnaire_answers : has

    providers {
        uuid id PK
        text email UK
        text password_hash
        text google_calendar_access_token
        boolean google_calendar_sync_enabled
    }

    clients {
        uuid id PK
        uuid provider_id FK
        text email
        text name
    }

    bookings {
        uuid id PK
        uuid provider_id FK
        uuid client_id FK
        timestamp start_time
        timestamp end_time
        enum status
        enum session_type
    }

    packages {
        uuid id PK
        uuid provider_id FK
        int session_count
        decimal price
    }

    client_packages {
        uuid id PK
        uuid client_id FK
        int sessions_remaining
        enum status
    }
```

---

## 14. Sequence — Cognito sign-in

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant ALB as ALB / Next.js
    participant MW as Middleware
    participant NA as NextAuth
    participant Cognito as AWS Cognito
    participant RDS as RDS PostgreSQL

    User->>Browser: Click "Sign in with Cognito"
    Browser->>ALB: GET /api/auth/signin/cognito
    ALB->>NA: Initiate OAuth
    NA->>Browser: Redirect to Cognito Hosted UI
    Browser->>Cognito: Authenticate user
    Cognito->>Browser: Redirect with auth code
    Browser->>ALB: GET /api/auth/callback/cognito?code=...
    ALB->>NA: Exchange code for tokens
    NA->>Cognito: POST /oauth2/token
    Cognito-->>NA: id_token, access_token
    NA->>RDS: Find/create provider by sub or email
    RDS-->>NA: provider row
    NA->>Browser: Set JWT session cookie
    Browser->>ALB: GET /dashboard
    ALB->>MW: Check session
    MW-->>Browser: Allow access
```

---

## 15. Sequence — Client self-book

```mermaid
sequenceDiagram
    actor Client
    participant Portal as Portal UI
    participant API as /api/portal/*
    participant Avail as Availability Engine
    participant RDS as RDS PostgreSQL

    Client->>Portal: Open /portal/book
    Portal->>API: GET /api/portal/availability
    API->>Avail: Compute open slots
    Avail->>RDS: Read bookings, blocked_times, settings
    RDS-->>Avail: Schedule data
    Avail-->>Portal: Available time slots

    Client->>Portal: Select slot + confirm
    Portal->>API: POST /api/portal/book
    API->>RDS: Validate client package/subscription
    API->>RDS: Insert booking (transaction)
    API->>RDS: Decrement sessions_remaining
    RDS-->>API: booking id
    API-->>Portal: 201 Created
    Portal-->>Client: Confirmation
```

---

## Exporting diagrams

These diagrams use [Mermaid](https://mermaid.js.org/). To export as PNG/SVG/PDF:

1. **GitHub** — push this file; Mermaid renders in the repo UI.
2. **VS Code / Cursor** — Markdown Preview Mermaid Support extension.
3. **CLI** — `@mermaid-js/mermaid-cli`:
   ```bash
   npx @mermaid-js/mermaid-cli -i docs/architecture-diagrams.md -o docs/diagrams/
   ```
4. **Draw.io / Lucidchart** — import Mermaid or recreate for formal deliverables.

For architecture review packs, recommended exports:

| Deliverable | Sections to include |
|-------------|---------------------|
| Executive summary | 1, 2, 8 |
| Security review | 5, 7, 10 |
| Developer onboarding | 3, 4, 13 |
| Ops / runbook | 2, 6, 7, 12 |

---

## Document history

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-05 | Initial HLD + DFD (L0–L2) + ERD + sequences |
