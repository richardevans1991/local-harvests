import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getUploadRoot } from "@/lib/upload-storage";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

interface RouteContext {
  params: Promise<{ farmId: string; filename: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { farmId, filename } = await context.params;

    if (!/^[a-zA-Z0-9_-]+$/.test(farmId) || !/^[a-zA-Z0-9._-]+$/.test(filename)) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const extension = path.extname(filename).toLowerCase();
    const contentType = CONTENT_TYPES[extension];
    if (!contentType) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const filePath = path.join(getUploadRoot(), farmId, filename);
    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
}