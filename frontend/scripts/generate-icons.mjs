/**
 * PWA 아이콘 생성 스크립트
 * Usage: node scripts/generate-icons.mjs
 *
 * sharp가 없으면 SVG 기반 아이콘을 사용하므로 PNG 생성은 선택사항.
 * Google Play Store TWA는 512x512 PNG가 필수.
 */
import { writeFileSync } from "fs";

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function generateSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <text x="256" y="340" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="280" font-weight="800" fill="white">A</text>
</svg>`;
}

// Generate SVG icons for each size
for (const size of sizes) {
  writeFileSync(`public/icon-${size}x${size}.svg`, generateSvg(size));
  console.log(`Generated icon-${size}x${size}.svg`);
}

// Maskable icon (with padding for safe zone)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <text x="256" y="330" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="220" font-weight="800" fill="white">A</text>
</svg>`;
writeFileSync("public/icon-maskable.svg", maskableSvg);
console.log("Generated icon-maskable.svg");

// Apple touch icon
writeFileSync("public/apple-touch-icon.svg", generateSvg(180));
console.log("Generated apple-touch-icon.svg");

console.log("\nDone! For Play Store, generate PNG versions using sharp or an online tool.");
