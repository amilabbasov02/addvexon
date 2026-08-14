# Lead Finder

Finds local businesses that need a website, scores them by how likely they are
to buy, and (in later phases) generates a demo site and outreach for the best
ones.

Phase 1 — discovery, scoring and the results dashboard — is implemented.

## Setup

1. **Create the tables.** The project manages schema with `drizzle-kit push`,
   not migration files, so either:

   ```bash
   pnpm db:push          # diffs the live database against src/db/schema.ts
   ```

   or apply the extracted SQL, which is additive and re-runnable:

   ```bash
   psql "$DATABASE_URL" -f scripts/lead-finder-tables.sql
   ```

2. **Set `CRON_SECRET`** in `.env.local` and in the Vercel project settings.
   Nothing runs without it — the queue endpoint refuses unauthenticated calls.

3. **Deploy.** `vercel.json` registers a cron that calls `/api/cron/jobs` every
   minute. Locally, advance the queue by hand:

   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" localhost:3000/api/cron/jobs
   ```

## How a search runs

`POST /api/leads/searches` writes a `lead_searches` row and enqueues a
`background_jobs` row. It returns immediately — nothing long-running happens
inside the request.

The cron endpoint claims due jobs with `FOR UPDATE SKIP LOCKED`, so overlapping
invocations never process the same job twice. The handler then runs:

| Stage | Progress | What happens |
|---|---|---|
| Finding businesses | 10% | Provider query (Overpass/OSM) |
| Removing duplicates | 30% | Collapse the batch on `dedupeKey` |
| Analyzing websites | 40–85% | Fetch and inspect each site, 5 at a time |
| Scoring leads | 88% | Apply `SCORING_CONFIG` |
| Saving results | 94% | Upsert leads and analyses |

Progress is written to the job row, and the UI polls
`GET /api/leads/searches/:id` every 3 seconds while it runs — so a page refresh
loses nothing.

A crashed worker leaves a `running` row with a stale lock; the next tick returns
it to the queue. Only failures a provider marks retryable are retried, with
backoff — retrying a genuine bug three times just wastes runs.

## Data sources

`BusinessDiscoveryProvider` (`src/lib/leads/providers/types.ts`) is the contract.
Adding a source means writing one module and registering it — scoring, dedupe,
storage and UI never change.

**OpenStreetMap via Overpass** is the default and the only implementation.
Chosen deliberately: ODbL permits storing the data and building a derived
database from it, which is precisely what a lead pipeline is. The obligation is
attribution, which is stored on every lead and rendered under the results table.

The interface carries a `canStore` flag because not every source allows this.
Google Places, for example, forbids retaining most fields beyond a place ID — a
provider like that must set `canStore: false` so the pipeline never builds a
database it has no right to build.

Overpass is a free, volunteer-run service. One query per search, a real
User-Agent, and no aggressive retries. A 429 means stop, not try harder.

## Scoring

All weights live in `SCORING_CONFIG` (`src/lib/leads/scoring.ts`). Each rule that
fires records its label, and those labels are what the UI shows under "Why this
is a potential customer?" — the score and the explanation cannot drift apart.

| Rule | Points |
|---|---|
| No website found | +30 |
| Website does not load | +30 |
| Website has technical or usability problems | +20 |
| Business appears active | +15 |
| Public contact details available | +15 |
| Active social media presence | +10 |
| A matching Addvoxen template is available | +10 |

Bands: **High** ≥ 70, **Medium** ≥ 45, **Low** below.

**The bands were tuned against live data, and the weights were not.** That
distinction is the point: the weights encode what predicts a sale, the bands
encode how selective the list is. When High turned out to be unreachable, the
band moved.

"No website" and "weak website" are mutually exclusive, so the real ceilings are
80 without a site and 70 with a bad one. Reaching 80 also needs social links —
and measured against live OSM data for Baku, those barely exist:

| Category | Found | Social | Phone | Email |
|---|---|---|---|---|
| Beauty salons | 159 | 11% | 28% | 7% |
| Restaurants | 300+ | 0% | 11% | 1% |
| Cafes | 299 | 4% | 10% | 2% |
| Dental | 90 | 3% | 24% | 9% |

With High at 80, four of five categories produced **zero** High leads and the
best prospects all sat in Medium. At 70 they surface correctly.

Re-check this if a richer data source is ever added — the ceiling stops being
artificial and 80 may become right again.

**A note on what the bands mean in this market.** Across 300 stored leads the
split is roughly 49 High / 15 Medium / 236 Low. The large Low group is not a
tuning failure: those businesses have no phone, no email and no social profile
in the data, so there is no way to contact them at all. `pnpm leads:probe` is
the tool for re-measuring this against any city or category.

## Security

- **Every API route is workspace-scoped.** An id alone is never enough; queries
  filter on `workspaceId` as well, so one tenant cannot read another's leads.
- **SSRF.** Website analysis takes a URL from a third-party dataset and makes an
  outbound request with it. `src/lib/leads/website-analysis.ts` allows only
  http/https, resolves every candidate host and rejects private, loopback,
  link-local and reserved ranges, follows redirects manually so each hop is
  re-checked, and caps both time and response size. The manual redirect handling
  is the important part — the built-in follower would chase a 302 into
  `169.254.169.254` without asking.
- **Rate limiting.** Ten searches per user per hour, counted from the
  `lead_searches` table, so it survives restarts and multiple instances.
- **The cron endpoint** requires `Bearer $CRON_SECRET`.
- **Suppression list.** `suppression_list` exists from Phase 1 even though
  nothing sends mail yet. An unsubscribe has to outlive the lead being
  re-discovered by a later search, so it is keyed on the address, not the lead.

## Files

```
src/lib/leads/
  scoring.ts              tunable scoring model
  dedupe.ts               fingerprinting and batch merge
  website-analysis.ts     SSRF-guarded fetch and inspection
  template-match.ts       niche → site template
  providers/
    types.ts              provider contract, niche list
    overpass.ts           OpenStreetMap implementation
    index.ts              registry
src/lib/jobs/
  runner.ts               claim, run, retry, reap
  handlers/lead-search.ts the pipeline
src/app/api/leads/        searches, leads, lead detail
src/app/api/cron/jobs/    queue tick
src/app/leads/            dashboard and results UI
```

## Demo generator (Phase 2)

`POST /api/leads/:id/demo` builds a personalised demo site for a lead. It is
idempotent per lead — calling it twice returns the existing demo.

**A demo is a `tenant` with `status = "demo"` and a `leadId`.** It is not a new
kind of object, which is the point: it inherits subdomain hosting, the renderer,
the content editor and the AZ/EN/RU localisation that already exist for paying
customers. A demo that lands converts into a real site by changing a status,
not by migrating anything.

### Templates

Five second-generation templates back the generator, one per trade rather than
one generic design recoloured five times:

| Slug | Design | Trade | Preview |
|---|---|---|---|
| `gozellik-lumen` | Lumen | Salon / spa / barber | `demo-lumen` |
| `restoran-ember` | Ember | Restaurant / cafe | `demo-ember` |
| `klinika-meridian` | Meridian | Dental / medical | `demo-meridian` |
| `fitnes-forge` | Forge | Gym / sports club | `demo-forge` |
| `korporativ-atlas` | Atlas | Professional services / B2B | `demo-atlas` |

Each renders 11–15 sections in AZ/EN/RU. They sit at `sortOrder` 1–5 while the
first-generation templates sit at 90, because `findTemplateForCategory()` takes
the lowest sort order per category — that ordering is what makes the demo
generator pick the new designs.

Re-seed after editing content: `pnpm seed:templates` (idempotent).

Content is produced by **cloning the template's own preview tenant** (found via
`site_templates.preview_subdomain`) and substituting the business's details.
Cloning beats generating a skeleton because the preview content is already
designed, populated and translated — and a thin generated page would sell the
template short.

What gets substituted, per locale:

| Section | Change |
|---|---|
| `siteName`, hero heading/subheading | Business name replaces the template's |
| `contact` | Real phone / email / address; template placeholders are dropped, not kept |
| `about`, `cta`, `features` headings | Name references swapped |
| footer socials | The lead's real profiles, or removed if we found none |
| gallery, menu, products, stats | **Left as the template's own** |

That last row is deliberate. We have no real photos, prices or figures for the
business, and inventing them would misrepresent it to the person being pitched.

Demo addresses are `<business-slug>-<6 random chars>.<root domain>`. The name
makes the link feel personal in outreach; the suffix stops demos being
enumerable by anyone who guesses a competitor's name.

**One existing-code change was required:** `resolveTenantByHost` previously
rendered only `active` tenants, so demos would have 404'd. It now renders
`active` and `demo` (`RENDERABLE_STATUSES` in `src/lib/tenant.ts`). Demos are
public by design — sending the prospect a link is the entire mechanism.
`pending`, `suspended` and `canceled` still render nothing.

If a lead's category has no published template — or the template has no preview
content to clone — the endpoint returns **409** with a plain explanation rather
than a 500. That is an operator problem (seed a template), not a server fault.

## Outreach (Phase 3)

Two explicit steps, never one click:

```
POST /api/leads/:id/outreach          → generate 3 variants (saves nothing)
POST /api/leads/:id/outreach          → { variant } saves the chosen draft
POST /api/leads/:id/outreach/send     → { outreachMessageId } sends it
```

Copy comes from **templates, not a language model**, by default. Templates are
deterministic, free, reviewable before sending, and — the reason that matters —
cannot invent a fact about someone's business. Pass `useAi: true` to have Claude
rephrase a draft; it is instructed to keep every factual claim and the opt-out
line verbatim, and any failure silently returns the template.

Three angles are generated (demo-first, observation-first, short) in Azerbaijani
or English. Each includes one sentence stating **only what the analyser actually
found** — no website, or the specific problems on the existing one. If nothing
was found, that sentence is omitted rather than inventing a criticism.

Gallery, menu, product and statistics content is never fabricated, and neither
is outreach copy. This is the same principle in both places.

### Sending

`lib/leads/mailer.ts` sends over the project's own SMTP server and is
**deliberately separate from `lib/email.ts`**, which sends transactional mail
through Resend. Mixing cold outreach into the transactional sending identity is
how a domain's deliverability gets destroyed by one unrelated spam complaint.

Every send passes `assertSendable`, which fails closed:

- the address must be present and well-formed
- the address **and its domain** must not be on the suppression list
- the workspace must be under 40 outreach emails per hour

The email row is written to `email_messages` **before** the transport is opened,
so a crash mid-send leaves evidence rather than silence. The RFC `Message-ID` is
captured on success — that is what Phase 4 threads replies against.

There is no bulk-send endpoint. One lead, one email, one human decision.

### Opt-out

Every message carries a `List-Unsubscribe` header with
`List-Unsubscribe-Post: One-Click` plus a link in the body. `GET` and `POST` on
`/unsubscribe/:token` both work — the header is what makes Gmail show its native
unsubscribe button, which is worth more than any styled page.

Tokens are an HMAC over the lead id (`OUTREACH_UNSUBSCRIBE_SECRET`), so they are
**stateless, unforgeable and never expire**. An opt-out link has to keep working
long after the campaign; a recipient should never meet a dead one. The route is
public — requiring a login to stop receiving mail would be a dark pattern.

Opting out writes to `suppression_list` keyed on the address, not the lead, so
it survives the same business being re-discovered by a later search. It also
sets the lead to `not_interested`.

### Diagnostics

```
GET  /api/outreach/smtp-test   → verify credentials without sending
POST /api/outreach/smtp-test   → send a test to your own address
```

Non-admins can only mail themselves — a test endpoint that will mail an
arbitrary stranger is an open relay with extra steps. Neither response ever
returns the host, user or password; a misconfiguration comes back as the names
of the missing variables.

## Not built yet

Phase 4 — IMAP reply tracking. The `.env.example` IMAP entries are placeholders
for it and are read by nothing today. The groundwork exists: `email_messages`
already stores `message_id`, `in_reply_to` and `references`, and `message_id`
carries a unique index so re-reading the mailbox can never duplicate a reply.
