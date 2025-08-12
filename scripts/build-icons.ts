import path from 'node:path';
import fs from 'fs-extra';
import sharp from 'sharp';
// png2icons 没有完善的类型定义，使用 require 并标注 any
// eslint-disable-next-line @typescript-eslint/no-var-requires
const png2icons: any = require('png2icons');
import pngToIco from 'png-to-ico';

const root = process.cwd();
const brandDir = path.join(root, 'public', 'brand');
const outDir = path.join(brandDir, 'dist');

const inputs = [
  'logo-mark.svg',
  'logo-wordmark.svg',
  'logo-horizontal.svg',
];

const pngSizes = [16, 32, 48, 64, 128, 256, 512, 1024];

async function ensureCleanDir(dir: string) {
  await fs.remove(dir);
  await fs.mkdirp(dir);
}

async function svgToPng(svgPath: string, size: number, outPath: string) {
  const svgBuffer = await fs.readFile(svgPath);
  const pngBuffer = await sharp(svgBuffer, { density: 384 })
    .resize({ width: size, height: size, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await fs.writeFile(outPath, pngBuffer);
  return pngBuffer;
}

async function buildFor(svgName: string) {
  const baseName = path.parse(svgName).name;
  const inPath = path.join(brandDir, svgName);
  const iconOutDir = path.join(outDir, baseName);
  await ensureCleanDir(iconOutDir);

  const pngBuffers: Buffer[] = [];
  for (const size of pngSizes) {
    const outPng = path.join(iconOutDir, `${baseName}-${size}.png`);
    const buf = await svgToPng(inPath, size, outPng);
    if (size <= 256) pngBuffers.push(buf);
  }

  // Build ICO (Windows)
  const icoBuffer = await pngToIco(pngBuffers);
  await fs.writeFile(path.join(iconOutDir, `${baseName}.ico`), icoBuffer);

  // Alternative ICO via png2icons (often smaller)
  try {
    const png256 = await fs.readFile(path.join(iconOutDir, `${baseName}-256.png`));
    const icoAlt = png2icons.PNGBufferToICO(png256, png2icons.BICUBIC, false, 0);
    if (icoAlt) {
      await fs.writeFile(path.join(iconOutDir, `${baseName}.alt.ico`), icoAlt as Buffer);
    }
  } catch {}
}

async function main() {
  await fs.mkdirp(outDir);
  for (const name of inputs) {
    console.log(`Building icons for ${name}...`);
    await buildFor(name);
  }
  console.log(`Done. Output: ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


