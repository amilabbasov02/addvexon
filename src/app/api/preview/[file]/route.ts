import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { NextRequest } from "next/server";

/**
 * Serves banner preview HTML (and PNG fallbacks) directly from disk so the
 * marketplace can iframe them without depending on Next.js's build-time
 * `/public` snapshot. Regenerating banners no longer requires a rebuild —
 * the new files are picked up on the next request.
 *
 *   /api/preview/banner-fashion-1080x1080.html  → public/banner-previews/...
 *   /api/preview/banner-fashion-1080x1080.png   → public/banner-thumbnails/...
 *
 * Only `banner-*` filenames are allowed; everything else 404s.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;

  // Strict allowlist — must look like a banner slug + .html or .png
  if (!/^banner-[a-z0-9-]+\.(html|png)$/.test(file)) {
    return new Response("Not found", { status: 404 });
  }

  const ext = file.endsWith(".html") ? "html" : "png";
  const dir = ext === "html" ? "banner-previews" : "banner-thumbnails";
  const path = resolve(process.cwd(), "public", dir, file);

  try {
    if (ext === "html") {
      const content = await readFile(path, "utf8");
      return new Response(content, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }
    const content = await readFile(path);
    return new Response(new Uint8Array(content), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
