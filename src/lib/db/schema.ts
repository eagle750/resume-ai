import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ============================================
// NextAuth.js required tables
// ============================================
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),

  // Our custom fields (added on top of NextAuth defaults)
  plan: text("plan").default("free").notNull(),
  // plan can be: 'free' | 'pro_india' | 'pro_global'
  subscriptionId: text("subscription_id"),
  subscriptionStatus: text("subscription_status").default("inactive"),
  // subscriptionStatus: 'inactive' | 'active' | 'cancelled' | 'past_due'
  paymentProvider: text("payment_provider"),
  // paymentProvider: 'razorpay' | 'lemonsqueezy'
  tailorsUsedThisMonth: integer("tailors_used_this_month").default(0),
  tailorsResetDate: timestamp("tailors_reset_date", { mode: "date" }).defaultNow(),
  baseResumeText: text("base_resume_text"),
  baseResumeFilename: text("base_resume_filename"),
  baseResumeUrl: text("base_resume_url"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ============================================
// Our app tables
// ============================================
export const tailoredResumes = pgTable("tailored_resumes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  jobDescription: text("job_description").notNull(),
  companyName: text("company_name"),
  jobTitle: text("job_title"),
  originalResumeText: text("original_resume_text").notNull(),
  tailoredResumeJson: jsonb("tailored_resume_json").notNull(),
  atsScore: integer("ats_score"),
  scoreBreakdown: jsonb("score_breakdown"),
  missingKeywords: text("missing_keywords").array(),
  suggestions: text("suggestions").array(),
  templateUsed: text("template_used").default("clean"),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});
