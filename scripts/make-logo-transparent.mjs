import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input = path.join(__dirname, "../public/logos/logo.jpg");
const output = path.join(__dirname, "../public/logos/logo-transparent.png");

function isBackground(r, g, b) {
  const brightness = (r + g + b) / 3;
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);

  if (brightness > 215 && r > 200 && g > 195 && b > 165) return true;
  if (brightness > 190 && r > 175 && g > 170 && b > 140 && chroma < 45) return true;
  if (brightness > 175 && r > 160 && g > 155 && b > 125 && chroma < 35) return true;
  return false;
}

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
let transparent = 0;

for (let i = 0; i < data.length; i += channels) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (isBackground(r, g, b)) {
    data[i + 3] = 0;
    transparent += 1;
  }
}

await sharp(data, { raw: { width, height, channels } }).png().toFile(output);

const total = width * height;
console.log(`Wrote ${output} (${width}x${height})`);
console.log(`Transparent pixels: ${transparent}/${total} (${((transparent / total) * 100).toFixed(1)}%)`);