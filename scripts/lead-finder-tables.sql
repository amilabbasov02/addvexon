-- Lead Finder tables.
-- Additive only — safe to run against the existing Addvoxen database.
-- Extracted from src/db/schema.ts via drizzle-kit, trimmed to the new tables.

CREATE TABLE IF NOT EXISTS "background_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"step" text,
	"error" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"run_after" timestamp with time zone DEFAULT now() NOT NULL,
	"locked_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "lead_analyses" (
	"lead_id" text PRIMARY KEY NOT NULL,
	"has_website" boolean DEFAULT false NOT NULL,
	"reachable" boolean DEFAULT false NOT NULL,
	"http_status" integer,
	"response_ms" integer,
	"is_https" boolean,
	"has_viewport_meta" boolean,
	"has_title" boolean,
	"has_description" boolean,
	"html_bytes" integer,
	"issues" jsonb,
	"screenshot_url" text,
	"error" text,
	"analyzed_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "lead_events" (
	"id" text PRIMARY KEY NOT NULL,
	"lead_id" text NOT NULL,
	"type" text NOT NULL,
	"actor_user_id" text,
	"detail" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "lead_searches" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"job_id" text,
	"country" text NOT NULL,
	"city" text NOT NULL,
	"category" text NOT NULL,
	"max_leads" integer DEFAULT 100 NOT NULL,
	"filters" jsonb,
	"status" text DEFAULT 'queued' NOT NULL,
	"total_found" integer DEFAULT 0 NOT NULL,
	"high_count" integer DEFAULT 0 NOT NULL,
	"medium_count" integer DEFAULT 0 NOT NULL,
	"low_count" integer DEFAULT 0 NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "leads" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"search_id" text,
	"name" text NOT NULL,
	"category" text,
	"country" text,
	"city" text,
	"address" text,
	"lat" integer,
	"lng" integer,
	"phone" text,
	"email" text,
	"website_url" text,
	"socials" jsonb,
	"source" text NOT NULL,
	"source_id" text,
	"source_attribution" text,
	"dedupe_key" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"band" text DEFAULT 'low' NOT NULL,
	"score_reasons" jsonb,
	"status" text DEFAULT 'new' NOT NULL,
	"contacted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "suppression_list" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"value" text NOT NULL,
	"kind" text DEFAULT 'email' NOT NULL,
	"reason" text DEFAULT 'manual' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "background_jobs" ADD CONSTRAINT "background_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "background_jobs" ADD CONSTRAINT "background_jobs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "lead_analyses" ADD CONSTRAINT "lead_analyses_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "lead_searches" ADD CONSTRAINT "lead_searches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "lead_searches" ADD CONSTRAINT "lead_searches_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "lead_searches" ADD CONSTRAINT "lead_searches_job_id_background_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."background_jobs"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "leads" ADD CONSTRAINT "leads_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "leads" ADD CONSTRAINT "leads_search_id_lead_searches_id_fk" FOREIGN KEY ("search_id") REFERENCES "public"."lead_searches"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "suppression_list" ADD CONSTRAINT "suppression_list_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "background_jobs_claim_idx" ON "background_jobs" USING btree ("status","run_after");
CREATE INDEX IF NOT EXISTS "background_jobs_user_idx" ON "background_jobs" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "background_jobs_workspace_idx" ON "background_jobs" USING btree ("workspace_id");
CREATE INDEX IF NOT EXISTS "lead_events_lead_idx" ON "lead_events" USING btree ("lead_id","created_at");
CREATE INDEX IF NOT EXISTS "lead_searches_user_idx" ON "lead_searches" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "lead_searches_workspace_idx" ON "lead_searches" USING btree ("workspace_id");
CREATE INDEX IF NOT EXISTS "lead_searches_created_idx" ON "lead_searches" USING btree ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "leads_workspace_dedupe_idx" ON "leads" USING btree ("workspace_id","dedupe_key");
CREATE INDEX IF NOT EXISTS "leads_workspace_idx" ON "leads" USING btree ("workspace_id");
CREATE INDEX IF NOT EXISTS "leads_search_idx" ON "leads" USING btree ("search_id");
CREATE INDEX IF NOT EXISTS "leads_score_idx" ON "leads" USING btree ("workspace_id","score");
CREATE INDEX IF NOT EXISTS "leads_status_idx" ON "leads" USING btree ("workspace_id","status");
CREATE UNIQUE INDEX IF NOT EXISTS "suppression_workspace_value_idx" ON "suppression_list" USING btree ("workspace_id","value");

-- Phase 2: link a generated demo site back to the lead it was built for.
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "lead_id" text;
DO $$ BEGIN
  ALTER TABLE "tenants" ADD CONSTRAINT "tenants_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "tenants_lead_idx" ON "tenants" USING btree ("lead_id");

-- Phase 3: outreach drafts and the email log (both directions).
CREATE TABLE IF NOT EXISTS "email_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"lead_id" text,
	"outreach_message_id" text,
	"direction" text NOT NULL,
	"from_address" text NOT NULL,
	"to_address" text NOT NULL,
	"subject" text,
	"body_text" text,
	"body_html" text,
	"message_id" text,
	"in_reply_to" text,
	"references" text,
	"status" text DEFAULT 'queued' NOT NULL,
	"error" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"sent_at" timestamp with time zone,
	"received_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "outreach_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"lead_id" text NOT NULL,
	"variant" integer DEFAULT 1 NOT NULL,
	"locale" text DEFAULT 'az' NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"demo_url" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"generator" text DEFAULT 'template' NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_outreach_message_id_outreach_messages_id_fk" FOREIGN KEY ("outreach_message_id") REFERENCES "public"."outreach_messages"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "outreach_messages" ADD CONSTRAINT "outreach_messages_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "outreach_messages" ADD CONSTRAINT "outreach_messages_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "outreach_messages" ADD CONSTRAINT "outreach_messages_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "email_messages_message_id_idx" ON "email_messages" USING btree ("message_id");
CREATE INDEX IF NOT EXISTS "email_messages_lead_idx" ON "email_messages" USING btree ("lead_id","created_at");
CREATE INDEX IF NOT EXISTS "email_messages_workspace_idx" ON "email_messages" USING btree ("workspace_id");
CREATE INDEX IF NOT EXISTS "email_messages_in_reply_to_idx" ON "email_messages" USING btree ("in_reply_to");
CREATE INDEX IF NOT EXISTS "outreach_messages_lead_idx" ON "outreach_messages" USING btree ("lead_id");
CREATE INDEX IF NOT EXISTS "outreach_messages_workspace_idx" ON "outreach_messages" USING btree ("workspace_id");
CREATE INDEX IF NOT EXISTS "outreach_messages_status_idx" ON "outreach_messages" USING btree ("workspace_id","status");
