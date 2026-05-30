/**
 * Email sending wrapper. In dev / no API key, logs to console so the magic
 * link or verification URL is visible. In prod, hits Resend.
 */
interface SendEmailOpts {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(opts: SendEmailOpts): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Addvoxen <noreply@addvoxen.local>";

  if (!apiKey) {
    // Dev mode: print to stdout. Saves having to wire Resend on day one.
    console.log("\n[dev-email] ─────────────────────────────────────────────");
    console.log(`To:      ${opts.to}`);
    console.log(`From:    ${from}`);
    console.log(`Subject: ${opts.subject}`);
    console.log(opts.text);
    console.log("─────────────────────────────────────────────────────────\n");
    return;
  }

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    }),
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Resend error ${resp.status}: ${body}`);
  }
}
