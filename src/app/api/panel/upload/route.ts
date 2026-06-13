/**
 * Müştəri panel şəkil yükləməsi (logo + sayt şəkilləri).
 * Giriş tələb olunur. Banner SaaS plan/workspace gating-i YOXDUR — tenant
 * sahibləri öz saytları üçün şəkil yükləyir. Dev-də public/uploads/-ə yazılır.
 *
 *   POST /api/panel/upload  (multipart, field "file")  → { url }
 */
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { getSession } from "@/lib/session";
import { uid } from "@/lib/ids";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);
const EXT: Record<string, string> = {
  "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg",
};
const MAX = 8 * 1024 * 1024; // 8 MB

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) return NextResponse.json({ error: "Fayl yoxdur" }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Yalnız şəkil (png/jpg/webp/gif/svg)" }, { status: 415 });
  if (file.size > MAX) return NextResponse.json({ error: "Fayl çox böyükdür (maks 8 MB)" }, { status: 413 });

  const id = uid("img");
  const filename = `${id}.${EXT[file.type] ?? "bin"}`;
  const dir = resolve(process.cwd(), "public", "uploads", session.user.id);
  const full = resolve(dir, filename);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/${session.user.id}/${filename}` });
}
