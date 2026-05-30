/**
 * Generate short, URL-safe, prefixed unique IDs (e.g. doc_xxxxxxx).
 * Not cryptographically random — for database IDs only.
 */
export function uid(prefix: string, length = 10): string {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  // Append microsecond-ish timestamp so collisions are basically impossible.
  return `${prefix}_${out}${Date.now().toString(36).slice(-4)}`;
}

export function slugify(input: string, maxLen = 40): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxLen);
}
