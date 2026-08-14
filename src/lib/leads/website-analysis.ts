/**
 * Fetch and inspect a lead's website.
 *
 * This module takes a URL that came from an untrusted third-party dataset and
 * makes an outbound request with it. That is a textbook SSRF sink, so the
 * guards here are not optional decoration:
 *
 *   - only http/https, no file:, gopher:, redis: and friends
 *   - every candidate host is DNS-resolved and checked against private,
 *     loopback, link-local and reserved ranges before we connect
 *   - redirects are followed manually so each hop is re-validated; a public
 *     domain that 302s to 169.254.169.254 is the standard cloud-metadata attack
 *   - hard timeout and response size cap so one bad host can't stall a job
 *
 * The analysis itself is deliberately cheap — an HTML fetch and some string
 * checks, no headless browser. Puppeteer is available in the project and can
 * be added later for screenshots, but it costs seconds per site and a lead
 * search may analyse a hundred of them.
 */
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { parse as parseHtml } from "node-html-parser";

const FETCH_TIMEOUT_MS = 12_000;
const MAX_BYTES = 1_500_000;
const MAX_REDIRECTS = 4;
const USER_AGENT =
  "Addvoxen-SiteCheck/1.0 (+https://addvoxen.com; contact: info@addvoxen.com)";

export type WebsiteAnalysis = {
  hasWebsite: boolean;
  reachable: boolean;
  httpStatus?: number;
  responseMs?: number;
  isHttps?: boolean;
  hasViewportMeta?: boolean;
  hasTitle?: boolean;
  hasDescription?: boolean;
  htmlBytes?: number;
  /** Plain-language problems, safe to show the user verbatim. */
  issues: string[];
  error?: string;
};

export async function analyzeWebsite(
  rawUrl: string | null | undefined,
): Promise<WebsiteAnalysis> {
  if (!rawUrl) return { hasWebsite: false, reachable: false, issues: [] };

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return {
      hasWebsite: true,
      reachable: false,
      issues: ["Website address is not valid"],
      error: "invalid_url",
    };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return {
      hasWebsite: true,
      reachable: false,
      issues: ["Website address uses an unsupported protocol"],
      error: "unsupported_protocol",
    };
  }

  const started = Date.now();
  try {
    const { response, finalUrl } = await safeFetch(url);
    const responseMs = Date.now() - started;

    if (!response.ok) {
      return {
        hasWebsite: true,
        reachable: false,
        httpStatus: response.status,
        responseMs,
        issues: [`Website returned an error (HTTP ${response.status})`],
      };
    }

    const html = await readCapped(response);
    return inspectHtml(html, finalUrl, response.status, responseMs);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return {
      hasWebsite: true,
      reachable: false,
      responseMs: Date.now() - started,
      issues: ["Website could not be reached"],
      error: message.slice(0, 200),
    };
  }
}

function inspectHtml(
  html: string,
  finalUrl: URL,
  status: number,
  responseMs: number,
): WebsiteAnalysis {
  const root = parseHtml(html);
  const issues: string[] = [];

  const isHttps = finalUrl.protocol === "https:";
  if (!isHttps) issues.push("No HTTPS — the browser will warn visitors");

  const hasViewportMeta = Boolean(
    root.querySelector('meta[name="viewport"]'),
  );
  if (!hasViewportMeta) issues.push("Not mobile-friendly (no viewport tag)");

  const titleText = root.querySelector("title")?.text?.trim() ?? "";
  const hasTitle = titleText.length > 0;
  if (!hasTitle) issues.push("Missing page title — hurts search results");

  const descEl = root.querySelector('meta[name="description"]');
  const hasDescription = Boolean(descEl?.getAttribute("content")?.trim());
  if (!hasDescription) issues.push("Missing meta description");

  if (responseMs > 4000) issues.push("Very slow to load");

  const htmlBytes = Buffer.byteLength(html);
  // A page this small is almost always a parked domain or an error placeholder.
  if (htmlBytes < 1500) issues.push("Page looks empty or is a placeholder");

  return {
    hasWebsite: true,
    reachable: true,
    httpStatus: status,
    responseMs,
    isHttps,
    hasViewportMeta,
    hasTitle,
    hasDescription,
    htmlBytes,
    issues,
  };
}

/**
 * Fetch with per-hop SSRF validation.
 *
 * `redirect: "manual"` is what makes this safe — the built-in follower would
 * chase a redirect into a private address without ever consulting us.
 */
async function safeFetch(
  startUrl: URL,
): Promise<{ response: Response; finalUrl: URL }> {
  let url = startUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicHost(url.hostname);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
        },
      });
    } finally {
      clearTimeout(timer);
    }

    const isRedirect = response.status >= 300 && response.status < 400;
    const location = response.headers.get("location");

    if (!isRedirect || !location) return { response, finalUrl: url };

    const next = new URL(location, url);
    if (next.protocol !== "http:" && next.protocol !== "https:") {
      throw new Error("Redirected to an unsupported protocol");
    }
    url = next;
  }

  throw new Error("Too many redirects");
}

/** Resolve the host and refuse anything that is not a public unicast address. */
async function assertPublicHost(hostname: string): Promise<void> {
  const literal = isIP(hostname);
  const addresses = literal
    ? [{ address: hostname, family: literal }]
    : await lookup(hostname, { all: true });

  if (addresses.length === 0) throw new Error("Host does not resolve");

  for (const { address } of addresses) {
    if (isPrivateAddress(address)) {
      throw new Error("Refusing to connect to a private address");
    }
  }
}

/**
 * Private, loopback, link-local and otherwise non-routable ranges.
 * 169.254.169.254 (cloud metadata) falls inside the link-local block.
 */
export function isPrivateAddress(address: string): boolean {
  const version = isIP(address);

  if (version === 4) {
    const parts = address.split(".").map(Number);
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
    const [a, b] = parts as [number, number, number, number];

    if (a === 0) return true; // "this network"
    if (a === 10) return true; // private
    if (a === 127) return true; // loopback
    if (a === 169 && b === 254) return true; // link-local + metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a === 192 && b === 0) return true; // IETF protocol assignments
    if (a >= 224) return true; // multicast + reserved + broadcast
    return false;
  }

  if (version === 6) {
    const addr = address.toLowerCase();
    if (addr === "::" || addr === "::1") return true;
    if (addr.startsWith("fe80")) return true; // link-local
    if (addr.startsWith("fc") || addr.startsWith("fd")) return true; // unique local
    if (addr.startsWith("ff")) return true; // multicast
    // IPv4-mapped (::ffff:10.0.0.1) — validate the embedded v4 address.
    const mapped = addr.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped?.[1]) return isPrivateAddress(mapped[1]);
    return false;
  }

  // Not a recognisable IP — fail closed.
  return true;
}

/** Read the body but stop at MAX_BYTES so a huge page can't exhaust memory. */
async function readCapped(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";

  const chunks: Uint8Array[] = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    chunks.push(value);
    if (total >= MAX_BYTES) {
      await reader.cancel();
      break;
    }
  }

  return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf8");
}
