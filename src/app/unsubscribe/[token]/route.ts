/**
 * Opt-out endpoint.
 *   GET  /unsubscribe/:token  → a human clicked the link in the email
 *   POST /unsubscribe/:token  → RFC 8058 one-click, sent by the mail client
 *
 * Public by design: requiring a login to stop receiving mail would be a dark
 * pattern, and the token is an HMAC so it cannot be forged or enumerated.
 *
 * Implemented as a route handler rather than a page because the same URL has to
 * answer POST — `List-Unsubscribe-Post` is what makes Gmail and friends show a
 * native unsubscribe button, which is worth far more than a styled page.
 */
import { NextRequest, NextResponse } from "next/server";
import { suppressLead, verifyUnsubscribeToken } from "@/lib/leads/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const leadId = verifyUnsubscribeToken(token);

  if (!leadId) {
    return NextResponse.json({ error: "Invalid link" }, { status: 400 });
  }

  await suppressLead(leadId, "unsubscribed");
  return NextResponse.json({ ok: true });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const leadId = verifyUnsubscribeToken(token);

  if (!leadId) {
    return html(
      "Bu keçid etibarlı deyil",
      "Bu ünvan tanınmadı. Əgər bizdən mesaj almağa davam edirsinizsə, birbaşa cavab yazın — əl ilə siyahıdan çıxaracağıq.",
      400,
    );
  }

  await suppressLead(leadId, "unsubscribed");

  return html(
    "Siyahıdan çıxarıldınız",
    "Bu ünvana bir daha mesaj göndərməyəcəyik. Narahatlıq üçün üzr istəyirik.",
    200,
  );
}

/**
 * Self-contained HTML. No layout, no client bundle, no fonts — this page is
 * opened by someone who wants to leave, and it should load instantly and work
 * in any mail client's embedded browser.
 */
function html(title: string, message: string, status: number): NextResponse {
  const body = `<!doctype html>
<html lang="az">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light dark; }
  body {
    margin: 0; min-height: 100vh; display: grid; place-items: center;
    padding: 1.5rem;
    font: 16px/1.6 system-ui, -apple-system, "Segoe UI", sans-serif;
    background: #0b1326; color: #dae2fd;
  }
  main { max-width: 30rem; text-align: center; }
  h1 { font-size: 1.35rem; margin: 0 0 .75rem; font-weight: 600; }
  p { margin: 0; color: #cbc3d7; }
  .mark { font-size: 2rem; margin-bottom: .5rem; }
</style>
</head>
<body>
  <main>
    <div class="mark" aria-hidden="true">${status === 200 ? "✓" : "!"}</div>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
  </main>
</body>
</html>`;

  return new NextResponse(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
