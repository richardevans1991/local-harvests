import { mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const source = path.join(root, "public/logos/logo-icon-mark.png");
const background = "#f7f1e6";

const outputs = [
  { file: "src/app/icon.png", size: 48 },
  { file: "src/app/apple-icon.png", size: 180 },
  { file: "public/logos/favicon-96.png", size: 96 },
  { file: "public/logos/favicon-192.png", size: 192 },
  { file: "public/logos/favicon-512.png", size: 512 },
];

for (const { file, size } of outputs) {
  const outPath = path.join(root, file);
  await mkdir(path.dirname(outPath), { recursive: true });
  await sharp(source)
    .flatten({ background })
    .resize(size, size, {
      fit: "contain",
      background,
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toFile(outPath);
  console.log(`Wrote ${file} (${size}x${size})`);
}