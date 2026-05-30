/**
 * Image upload. In dev (no R2) we save to ./public/uploads/{userId}/{uuid}.{ext}
 * and serve from /uploads/... directly. In prod, swap this body for an R2
 * presigned upload.
 *
 *   POST /api/upload   (multipart/form-data, field: "file")
 *   Returns: { url, width, height, type, size }
 */
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { requireUser, getUserDefaultWorkspace } from "@/lib/session";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { uid } from "@/lib/ids";
import { getLimits } from "@/lib/billing";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const limits = getLimits(user.plan);
    if (!limits.canUploadImages) {
      return NextResponse.json(
        { error: "Image upload not available on your plan." },
        { status: 402 },
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file field" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported type: ${file.type}` },
        { status: 415 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large (max ${MAX_BYTES / 1024 / 1024} MB)` },
        { status: 413 },
      );
    }

    const ext =
      {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/webp": "webp",
        "image/gif": "gif",
        "image/svg+xml": "svg",
      }[file.type] ?? "bin";

    const id = uid("img");
    const filename = `${id}.${ext}`;
    const userDir = resolve(process.cwd(), "public", "uploads", user.id);
    const fullPath = resolve(userDir, filename);
    await mkdir(dirname(fullPath), { recursive: true });

    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(fullPath, buf);

    const publicUrl = `/uploads/${user.id}/${filename}`;

    // Try to resolve workspace + persist asset row (best effort)
    try {
      const ws = await getUserDefaultWorkspace(user.id);
      if (ws) {
        await db.insert(assets).values({
          id,
          workspaceId: ws.id,
          uploadedBy: user.id,
          url: publicUrl,
          type: file.type,
          sizeBytes: file.size,
        });
      }
    } catch {
      // non-fatal
    }

    return NextResponse.json({
      url: publicUrl,
      type: file.type,
      size: file.size,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}
