/**
 * Regenerate SuperTech launcher icons + splash screens into the (git-ignored)
 * Android project. Run after `npm run add:android` / `npx cap add android`.
 *
 * Usage (from the repo root or the mobile/ folder):
 *   node mobile/scripts/generate-android-assets.mjs
 *
 * Resolves `sharp` from the main web project's node_modules, so you don't need
 * to install it in mobile/ (avoids the sharp/libvips binary download).
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url)); // mobile/scripts
const repoRoot = join(here, "..", "..");
const SRC = join(repoRoot, "public", "logo.png");
const RES = join(here, "..", "android", "app", "src", "main", "res");

const LOGO_BG = { r: 250, g: 218, b: 188, alpha: 1 }; // adaptive-icon background
const SPLASH_BG = { r: 241, g: 241, b: 242, alpha: 1 };

const legacy = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192,
};
const foreground = {
  "mipmap-mdpi": 108,
  "mipmap-hdpi": 162,
  "mipmap-xhdpi": 216,
  "mipmap-xxhdpi": 324,
  "mipmap-xxxhdpi": 432,
};
const splash = {
  drawable: [480, 320],
  "drawable-port-mdpi": [320, 480],
  "drawable-port-hdpi": [480, 800],
  "drawable-port-xhdpi": [720, 1280],
  "drawable-port-xxhdpi": [960, 1600],
  "drawable-port-xxxhdpi": [1280, 1920],
  "drawable-land-mdpi": [480, 320],
  "drawable-land-hdpi": [800, 480],
  "drawable-land-xhdpi": [1280, 720],
  "drawable-land-xxhdpi": [1600, 960],
  "drawable-land-xxxhdpi": [1920, 1280],
};

async function run() {
  for (const [dir, size] of Object.entries(legacy)) {
    await sharp(SRC).resize(size, size).png().toFile(join(RES, dir, "ic_launcher.png"));
    const mask = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`,
    );
    const logo = await sharp(SRC).resize(size, size).png().toBuffer();
    await sharp(logo)
      .composite([{ input: mask, blend: "dest-in" }])
      .png()
      .toFile(join(RES, dir, "ic_launcher_round.png"));
  }

  for (const [dir, size] of Object.entries(foreground)) {
    const inner = Math.round(size * 0.66);
    const logo = await sharp(SRC).resize(inner, inner).png().toBuffer();
    await sharp({
      create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([{ input: logo, gravity: "center" }])
      .png()
      .toFile(join(RES, dir, "ic_launcher_foreground.png"));
  }

  for (const [dir, [w, h]] of Object.entries(splash)) {
    const logoSize = Math.round(Math.min(w, h) * 0.34);
    const logo = await sharp(SRC).resize(logoSize, logoSize).png().toBuffer();
    await sharp({ create: { width: w, height: h, channels: 4, background: SPLASH_BG } })
      .composite([{ input: logo, gravity: "center" }])
      .png()
      .toFile(join(RES, dir, "splash.png"));
  }

  writeFileSync(
    join(RES, "values", "ic_launcher_background.xml"),
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#FADABC</color>\n</resources>\n`,
  );

  console.log("✓ Android launcher icons + splash screens regenerated.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
