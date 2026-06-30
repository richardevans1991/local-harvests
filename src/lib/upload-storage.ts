import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 8 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export function getUploadRoot() {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
  }
  return path.join(/* turbopackIgnore: true */ process.cwd(), "data", "uploads");
}

export function getPublicUploadUrl(farmId: string, filename: string) {
  return `/uploads/${farmId}/${filename}`;
}

export function validateUploadFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Use a JPEG, PNG, WebP, or GIF image.";
  }
  if (file.size > MAX_BYTES) {
    return "Image must be 8 MB or smaller.";
  }
  return null;
}

export async function saveFarmUpload(
  farmId: string,
  buffer: Buffer,
  mimeType: string
) {
  const extension = EXTENSIONS[mimeType];
  if (!extension) {
    throw new Error("Unsupported image type.");
  }

  const safeFarmId = farmId.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeFarmId) {
    throw new Error("Invalid farm id.");
  }

  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;
  const farmDir = path.join(getUploadRoot(), safeFarmId);
  await mkdir(farmDir, { recursive: true });
  await writeFile(path.join(farmDir, filename), buffer);

  return getPublicUploadUrl(safeFarmId, filename);
}