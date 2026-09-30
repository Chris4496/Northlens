// Renders src/app/icon.svg into favicon.ico, apple-icon.png and a 512px export.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";

const svg = await readFile("src/app/icon.svg");
// iOS applies its own rounded mask, so the touch icon needs a square background.
const squareSvg = Buffer.from(svg.toString().replace(/rx="[\d.]+"/, 'rx="0"'));

const png = (src, size) => sharp(src, { density: 72 * (size / 32) * 2 }).resize(size, size).png().toBuffer();

const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((s) => png(svg, s)));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = 6 + 16 * images.length;
const entries = images.map((img, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i], 0);
  e.writeUInt8(sizes[i], 1);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(img.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += img.length;
  return e;
});
await writeFile("src/app/favicon.ico", Buffer.concat([header, ...entries, ...images]));

await writeFile("src/app/apple-icon.png", await png(squareSvg, 180));

await mkdir("public/brand", { recursive: true });
await writeFile("public/brand/northlens-mark.svg", svg);
await writeFile("public/brand/northlens-mark-512.png", await png(svg, 512));

console.log("icons written");
