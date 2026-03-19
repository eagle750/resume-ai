# ResumeAI — Technical Documentation

> **Product:** AI-powered resume tailoring SaaS for Indian job seekers
> **Target Market:** India (pricing in INR, Razorpay payments)
> **Last Updated:** 2026-03-19

---

## Table of Contents

1. [Technologies Used](#1-technologies-used)
2. [User Functionalities](#2-user-functionalities)
3. [High-Level Design (HLD)](#3-high-level-design-hld)
4. [Low-Level Design (LLD)](#4-low-level-design-lld)

---

## 1. Technologies Used

### Frontend

| Technology | Version | Use Case |
|---|---|---|
| **Next.js** | 16.2.0 | React framework — App Router, SSR, file-based routing, API routes |
| **React** | 19.2.4 | UI component library |
| **Tailwind CSS** | 4 | Utility-first CSS styling |
| **Shadcn / Base UI** | base-nova | Headless accessible UI primitives (dialogs, accordions, etc.) |
| **Lucide React** | 0.577.0 | Icon library |
| **next-themes** | 0.4.6 | Dark/light mode switching |
| **Sonner** | 2.0.7 | Toast notifications |
| **clsx + tailwind-merge** | — | Conditional className utilities |

### Backend / API

| Technology | Version | Use Case |
|---|---|---|
| **Next.js API Routes** | — | Server-side endpoints for auth, AI, payments, file processing |
| **Zod** | 4.3.6 | Request body validation and schema enforcement |
| **bcryptjs** | 3.0.3 | Password hashing (future email/password auth) |

### Authentication

| Technology | Version | Use Case |
|---|---|---|
| **NextAuth.js** | 5.0.0-beta.30 | Full-stack auth — Google OAuth, session management |
| **@auth/drizzle-adapter** | 1.11.1 | Persists NextAuth sessions, accounts, and users in Postgres |
| **Google OAuth** | — | Primary sign-in provider |

### Database

| Technology | Version | Use Case |
|---|---|---|
| **Neon (serverless Postgres)** | — | Primary relational database — users, sessions, tailoring history |
| **Drizzle ORM** | 0.45.1 | Type-safe SQL query builder and schema management |
| **@neondatabase/serverless** | 1.0.2 | Neon HTTP driver (edge-compatible) |

### AI / LLM

| Technology | Version | Use Case |
|---|---|---|
| **Anthropic Claude** | claude-sonnet-4-20250514 | Resume tailoring, ATS scoring, keyword extraction |
| **@anthropic-ai/sdk** | 0.80.0 | Claude API client |

### File Processing

| Technology | Version | Use Case |
|---|---|---|
| **mammoth** | 1.12.0 | Extract plain text from `.docx` files |
| **unpdf** | 1.4.0 | Extract plain text from `.pdf` files |
| **@react-pdf/renderer** | 4.3.2 | Generate downloadable PDF from tailored resume JSON |

### Cloud Storage

| Technology | Version | Use Case |
|---|---|---|
| **Cloudflare R2** | — | S3-compatible object storage for uploaded resume files |
| **@aws-sdk/client-s3** | 3.1012.0 | R2 interaction using the AWS S3 API |

### Payments

| Technology | Version | Use Case |
|---|---|---|
| **Razorpay** | 2.9.6 | Indian payment gateway — one-time payments and subscriptions |
| **LemonSqueezy** | 4.0.0 | International payments (skeleton, not yet active) |

### Content & SEO

| Technology | Version | Use Case |
|---|---|---|
| **next-mdx-remote** | 6.0.0 | Render MDX blog posts from the filesystem |
| **gray-matter** | 4.0.3 | Parse YAML frontmatter from MDX files |
| **JSON-LD (structured data)** | — | Rich search result snippets (FAQ, Article schema) |
| **sitemap.ts / robots.ts** | — | Auto-generated sitemap and robots.txt |

### Email

| Technology | Version | Use Case |
|---|---|---|
| **Resend** | 6.9.4 | Transactional email (provisioned, not yet active) |

---

## 2. User Functionalities

### 2.1 Authentication

- Sign up / log in with **Google OAuth** (one click)
- Session persisted in the database (not JWT — more secure)
- Auto-redirect to `/dashboard` after login

### 2.2 Resume Upload

- Upload resume as **PDF or DOCX**
- Drag-and-drop interface
- File stored securely in **Cloudflare R2**
- Text extracted server-side (never exposed to the browser raw)
- Base resume saved to user profile for reuse across sessions

### 2.3 Resume Tailoring (Core Feature)

1. User pastes a **job description** into the input
2. Clicks **"Tailor My Resume"**
3. Claude AI:
   - Extracts keywords and requirements from the JD
   - Rewrites bullet points using **Action Verb + Metric + Result** format
   - Naturally weaves JD keywords into the resume
   - Never invents experience that isn't there
4. Returns:
   - Tailored resume (structured JSON by section)
   - **ATS Score** (0–100)
   - Score breakdown (keyword match, skills coverage, experience relevance, formatting)
   - Missing keywords list
   - Actionable improvement suggestions

### 2.4 ATS Score & Analysis

- Visual ATS score display with breakdown by category
- Missing keywords highlighted
- Suggestions panel with specific tips to improve the score
- Helps users understand exactly why they may be filtered out

### 2.5 PDF Download

- Download the tailored resume as a **formatted PDF**
- Generated server-side using `@react-pdf/renderer`
- Free tier: PDF includes a watermark
- Pro tier: clean, watermark-free PDF

### 2.6 Tailoring History

- View all past tailoring sessions at `/dashboard/history`
- Each entry stores: company name, job title, ATS score, tailored JSON, date
- Can revisit and re-download past tailored resumes

### 2.7 User Settings & Profile

- View current plan (Free / Pro) at `/dashboard/settings`
- View usage counter (tailors used this month / limit)
- View subscription status and expiry date
- Manage billing (cancel subscription)

### 2.8 Pricing & Upgrade

| Feature | Free | Pro (₹499/mo) |
|---|---|---|
| Tailors per month | 3 | Unlimited |
| Templates | 1 | All |
| PDF watermark | Yes | No |
| ATS score & analysis | Yes | Yes |
| Tailoring history | Yes | Yes |

- Upgrade via **Razorpay** checkout (UPI, cards, netbanking)
- One-time payment and subscription options
- Subscription auto-renews monthly, cancellable anytime

### 2.9 Free Public Tools (No Login Required)

- `/tools/ats-score-checker` — Paste resume + JD, get an instant ATS score
- `/tools/resume-keyword-scanner` — Find missing keywords vs a job description
- `/tools/resume-summary-generator` — Generate a professional summary section

### 2.10 Resume Examples & Guides

- `/resume-examples/[role]` — Role-specific resume guides (Software Engineer, Data Analyst, PM, etc.)
- Company-specific keyword and formatting tips (Google, TCS, Infosys, etc.)
- No login required — SEO-optimized for organic traffic

### 2.11 Blog

- `/blog/[slug]` — MDX-powered blog posts
- Topics: ATS tips, resume writing, interview prep for Indian job market
- Drives organic search traffic

---

## 3. High-Level Design (HLD)

```
┌─────────────────────────────────────────────────────────────────────┐
│                            BROWSER (Client)                         │
│                                                                     │
│   Landing Page   Dashboard   Pricing   Blog   Free Tools            │
│        │               │        │                                   │
│        └───────────────┴────────┴──── Next.js (App Router) ────────┤
└─────────────────────────────────────────────────────────────────────┘
                                │
                     HTTPS API Calls
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│                         NEXT.JS SERVER                               │
│                                                                      │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────────────┐   │
│  │  /api/auth   │  │ /api/tailor   │  │ /api/parse-resume      │   │
│  │  (NextAuth)  │  │ (Claude AI)   │  │ (mammoth / unpdf)      │   │
│  └──────┬───────┘  └──────┬────────┘  └──────────┬─────────────┘   │
│         │                 │                        │                 │
│  ┌──────▼───────┐  ┌──────▼────────┐  ┌──────────▼─────────────┐   │
│  │ /api/user    │  │/api/razorpay  │  │ /api/generate-pdf      │   │
│  │  /profile    │  │ /api/webhooks │  │ (@react-pdf/renderer)  │   │
│  └──────────────┘  └───────────────┘  └────────────────────────┘   │
└──────┬───────────────────┬───────────────────────┬───────────────────┘
       │                   │                        │
  ┌────▼──────┐     ┌──────▼──────┐       ┌────────▼────────┐
  │  Neon DB  │     │ Anthropic   │       │  Cloudflare R2  │
  │ (Postgres)│     │ Claude API  │       │  (File Storage) │
  └────┬──────┘     └─────────────┘       └─────────────────┘
       │
  ┌────▼─────────────────────┐
  │  Tables:                 │
  │  - users                 │
  │  - accounts              │
  │  - sessions              │
  │  - tailoredResumes       │
  │  - verificationTokens    │
  └──────────────────────────┘
       │
  ┌────▼──────────┐
  │   Razorpay    │ ──── Webhooks ──▶ /api/webhooks/razorpay
  │ (Payments)    │
  └───────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|---|---|
| **Next.js App Router** | Single repo for frontend + backend, SSR for SEO |
| **Neon (serverless Postgres)** | Scale-to-zero pricing, no connection pool needed |
| **Drizzle ORM** | Type-safe, lightweight, works well with Neon's HTTP driver |
| **Cloudflare R2** | S3-compatible, zero egress cost, global CDN |
| **Razorpay** | Best Indian payment gateway — supports UPI, EMI, netbanking |
| **Claude AI** | Best-in-class instruction following for structured JSON output |
| **Google OAuth only** | Reduces friction, no password management needed |

---

## 4. Low-Level Design (LLD)

### 4.1 Database Schema

```sql
-- Users table (core)
users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  name            TEXT,
  image           TEXT,
  email_verified  TIMESTAMP,

  -- Plan & subscription
  plan                  TEXT DEFAULT 'free',        -- 'free' | 'pro'
  subscription_id       TEXT,                       -- Razorpay subscription ID
  subscription_status   TEXT,                       -- 'active' | 'cancelled' | 'halted'
  payment_provider      TEXT,                       -- 'razorpay' | 'lemonsqueezy'
  pro_expires_at        TIMESTAMP,                  -- When Pro access expires

  -- Usage tracking
  tailors_used_this_month  INTEGER DEFAULT 0,
  tailors_reset_date       TIMESTAMP,

  -- Resume storage
  base_resume_text      TEXT,
  base_resume_filename  TEXT,
  base_resume_url       TEXT,                      -- R2 object URL

  created_at  TIMESTAMP DEFAULT now(),
  updated_at  TIMESTAMP DEFAULT now()
)

-- Tailoring history
tailored_resumes (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID REFERENCES users(id) ON DELETE CASCADE,
  job_description      TEXT NOT NULL,
  company_name         TEXT,
  job_title            TEXT,
  original_resume_text TEXT,
  tailored_resume_json JSONB,                -- Structured sections
  ats_score            INTEGER,              -- 0-100
  score_breakdown      JSONB,                -- Per-category scores
  missing_keywords     TEXT[],
  suggestions          TEXT[],
  template_used        TEXT,
  pdf_url              TEXT,
  created_at           TIMESTAMP DEFAULT now()
)

-- NextAuth standard tables
accounts (...)          -- OAuth provider linking
sessions (...)          -- Active sessions
verification_tokens (...) -- Email verification
```

### 4.2 API Route Contracts

#### `POST /api/tailor`

**Request:**
```json
{
  "resumeText": "string (extracted resume text)",
  "jobDescription": "string (pasted JD)"
}
```

**Auth:** Session cookie required

**Business Logic:**
1. Validate session — reject if unauthenticated
2. Check usage: if `plan === 'free'` and `tailorsUsedThisMonth >= 3` → 429
3. Check if reset needed: if `tailorsResetDate` is 30+ days ago → reset counter to 0
4. Call `tailorResume(resumeText, jobDescription)` → Claude API
5. Save result to `tailored_resumes` table
6. Increment `tailors_used_this_month`
7. Return tailored JSON

**Response:**
```json
{
  "tailored_sections": {
    "summary": "string",
    "experience": [{ "company": "", "role": "", "bullets": [] }],
    "skills": ["string"],
    "education": [],
    "certifications": []
  },
  "ats_score": 87,
  "score_breakdown": {
    "keyword_match": 90,
    "skills_coverage": 85,
    "experience_relevance": 88,
    "formatting_score": 85
  },
  "missing_keywords": ["GraphQL", "Kubernetes"],
  "suggestions": ["Add quantified metrics to your DevOps bullet points"],
  "extracted_job_info": {
    "company": "Google",
    "job_title": "Senior Software Engineer",
    "key_requirements": ["Python", "distributed systems", "5+ years"]
  }
}
```

---

#### `POST /api/parse-resume`

**Request:** `multipart/form-data` with file field

**Logic:**
1. Detect file type by extension (`.pdf` → unpdf, `.docx` → mammoth)
2. Extract plain text
3. Upload original file to R2 at `resumes/{userId}/{timestamp}-{filename}`
4. Update `users.base_resume_text`, `base_resume_url`
5. Return extracted text

**Response:**
```json
{
  "text": "string (full resume text)",
  "filename": "resume.pdf",
  "url": "https://r2.example.com/resumes/..."
}
```

---

#### `POST /api/razorpay/create-subscription`

**Logic:**
1. Verify session
2. Call `razorpay.subscriptions.create({ plan_id, total_count: 12 })`
3. Return `subscriptionId` to client

**Client then:**
- Loads `checkout.razorpay.com/v1/checkout.js`
- Opens modal with `subscription_id`
- On success → calls `/api/razorpay/verify`

---

#### `POST /api/razorpay/verify`

**Request:**
```json
{
  "razorpay_subscription_id": "string",
  "razorpay_payment_id": "string",
  "razorpay_signature": "string"
}
```

**Logic:**
1. Compute expected signature: `HMAC_SHA256(subscriptionId + "|" + paymentId, secret)`
2. Compare with received signature — reject if mismatch
3. Update user: `plan = 'pro'`, `proExpiresAt = now() + 30 days`, `subscriptionId`

---

#### `POST /api/webhooks/razorpay`

**Handled Events:**

| Event | Action |
|---|---|
| `subscription.activated` | Set plan='pro', update expiry |
| `subscription.charged` | Extend proExpiresAt by 30 days |
| `subscription.cancelled` | Set subscriptionStatus='cancelled' |
| `subscription.halted` | Set subscriptionStatus='halted', demote to free |

---

### 4.3 Claude AI Prompt Design

**System Prompt (abbreviated):**
```
You are an elite resume optimization specialist.

Rules:
- NEVER invent experience, skills, or qualifications not in the original resume
- Rewrite every bullet in ACTION VERB + METRIC + RESULT format
- Extract all keywords from the JD and weave them naturally into existing experience
- Return ONLY valid JSON matching the schema below

Schema:
{
  tailored_sections: { summary, experience[], skills[], education[], certifications[] },
  ats_score: number (0-100),
  score_breakdown: { keyword_match, skills_coverage, experience_relevance, formatting_score },
  missing_keywords: string[],
  suggestions: string[],
  extracted_job_info: { company, job_title, key_requirements[] }
}
```

**Parameters:**
- Model: `claude-sonnet-4-20250514`
- Max tokens: `4096`
- Temperature: default (not set — deterministic enough for structured output)

---

### 4.4 Usage Limit State Machine

```
User makes tailor request
        │
        ▼
Is user authenticated? ──No──▶ 401 Unauthorized
        │ Yes
        ▼
Is tailorsResetDate > 30 days ago?
        │ Yes                    │ No
        ▼                        │
Reset counter to 0               │
Update tailorsResetDate          │
        │                        │
        └────────────────────────┘
        ▼
Is plan === 'pro' OR tailorsUsed < 3?
        │ Yes                    │ No
        ▼                        ▼
Proceed to tailor          429 Limit Reached
                           (prompt to upgrade)
        ▼
Call Claude API
        ▼
Save to tailored_resumes
Increment tailorsUsedThisMonth
        ▼
Return result to client
```

---

### 4.5 File Upload Flow

```
Client                      Server                    External
  │                            │                          │
  │── POST /api/parse-resume ──▶│                          │
  │   (multipart file)         │                          │
  │                            │── detect type            │
  │                            │   .pdf → unpdf           │
  │                            │   .docx → mammoth        │
  │                            │── extract text           │
  │                            │                          │
  │                            │── PUT object ──────────▶ R2
  │                            │   resumes/{userId}/...   │
  │                            │◀── object URL ───────────│
  │                            │                          │
  │                            │── UPDATE users SET       │
  │                            │   base_resume_text,      │
  │                            │   base_resume_url        │
  │                            │                          │
  │◀── { text, url } ──────────│
```

---

### 4.6 PDF Generation Flow

```
Client                         Server
  │                               │
  │── POST /api/generate-pdf ────▶│
  │   { tailoredResumeJson }      │
  │                               │── React render (server-side)
  │                               │   using @react-pdf/renderer
  │                               │── Add watermark if plan=free
  │                               │── Convert to Buffer
  │◀── PDF binary stream ─────────│
  │                               │
  │── Browser triggers download
```

---

### 4.7 Project Directory Map

```
src/
├── app/
│   ├── (auth)/login, signup        # Google OAuth pages
│   ├── api/
│   │   ├── auth/[...nextauth]      # NextAuth handler
│   │   ├── tailor/route.ts         # Core AI endpoint
│   │   ├── parse-resume/route.ts   # File parsing
│   │   ├── generate-pdf/route.ts   # PDF export
│   │   ├── user/profile/route.ts   # User data fetch
│   │   ├── razorpay/               # Payment endpoints
│   │   └── webhooks/               # Event handlers
│   ├── dashboard/
│   │   ├── page.tsx                # Main tailor UI
│   │   ├── history/page.tsx        # Past tailoring sessions
│   │   └── settings/page.tsx       # Account & billing
│   ├── blog/[slug]/page.tsx        # MDX blog
│   ├── pricing/page.tsx            # Pricing + Razorpay checkout
│   ├── tools/                      # Free public tools
│   ├── resume-examples/[role]      # SEO guides
│   └── page.tsx                    # Landing page
├── lib/
│   ├── db/schema.ts                # Drizzle table definitions
│   ├── db/index.ts                 # Neon client setup
│   ├── auth.ts                     # NextAuth config
│   ├── claude.ts                   # Claude integration + prompt
│   ├── razorpay.ts                 # Razorpay client setup
│   ├── r2.ts                       # S3 client for R2
│   ├── pdf-document.tsx            # React PDF template
│   └── scoring.ts                  # ATS scoring helpers
├── components/
│   ├── landing/                    # Landing page sections
│   ├── dashboard/                  # Dashboard UI components
│   ├── shared/                     # Navbar, Footer
│   └── ui/                         # Shadcn primitives
├── content/blog/*.mdx              # Blog post content
└── data/
    ├── roles.ts                    # Role-specific resume tips
    └── companies.ts                # Company-specific tips
```

---

*Generated 2026-03-19 | ResumeAI Technical Documentation*
