import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Beautiful SVG Icon for Daily Bible Devotion: warm amber / gold dawn with a Bible cross and rays
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>
    <radialGradient id="sunburst" cx="50%" cy="58%" r="60%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.9" />
      <stop offset="35%" stop-color="#d97706" stop-opacity="0.5" />
      <stop offset="70%" stop-color="#b45309" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="goldGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="bookWhite" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f1f5f9" />
    </linearGradient>
  </defs>
  
  <!-- Base Background -->
  <rect width="512" height="512" rx="104" fill="url(#bg)" />
  <circle cx="256" cy="270" r="220" fill="url(#sunburst)" />
  
  <!-- Rays of Light -->
  <path d="M 256 90 L 256 160" stroke="#fef08a" stroke-width="4" stroke-linecap="round" opacity="0.6" />
  <path d="M 130 160 L 180 200" stroke="#fef08a" stroke-width="4" stroke-linecap="round" opacity="0.5" />
  <path d="M 382 160 L 332 200" stroke="#fef08a" stroke-width="4" stroke-linecap="round" opacity="0.5" />
  <path d="M 80 270 L 150 270" stroke="#fef08a" stroke-width="4" stroke-linecap="round" opacity="0.4" />
  <path d="M 432 270 L 362 270" stroke="#fef08a" stroke-width="4" stroke-linecap="round" opacity="0.4" />
  
  <!-- Gentle Sun behind Cross -->
  <circle cx="256" cy="220" r="54" fill="#fef08a" opacity="0.25" filter="blur(4px)" />
  <circle cx="256" cy="220" r="38" fill="#fbbf24" opacity="0.8" />
  
  <!-- Open Bible Pages -->
  <!-- Left Page -->
  <path d="M 104 360 C 140 348, 210 348, 252 368 L 252 272 C 210 252, 140 252, 104 266 Z" fill="url(#bookWhite)" />
  <!-- Right Page -->
  <path d="M 408 360 C 372 348, 302 348, 260 368 L 260 272 C 302 252, 372 252, 408 266 Z" fill="url(#bookWhite)" />
  
  <!-- Page Lines (Scripture text illusion) -->
  <path d="M 130 286 L 230 286 M 130 304 L 230 304 M 130 322 L 210 322 M 130 340 L 225 340" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round" />
  <path d="M 282 286 L 382 286 M 282 304 L 382 304 M 282 322 L 362 322 M 282 340 L 377 340" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round" />
  
  <!-- Center Book Spine & Bookmark Ribbon -->
  <path d="M 256 268 L 256 384" stroke="#d97706" stroke-width="5" stroke-linecap="round" />
  <path d="M 256 370 Q 266 390 275 410 L 265 408 L 256 424 L 256 370" fill="#dc2626" />
  
  <!-- Holy Cross in the Center Rising -->
  <rect x="249" y="140" width="14" height="110" rx="4" fill="url(#goldGold)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))" />
  <rect x="220" y="168" width="72" height="14" rx="4" fill="url(#goldGold)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent.trim());
console.log('Saved public/icon.svg');

// Simple PNG builder using Node's zlib to generate valid PNG files
function createSolidPng(width, height, r, g, b, a = 255) {
  // A minimal valid PNG generator for square icon sizes
  // We'll draw a background gradient and a golden cross + book symbol in pixels
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      // Calculate normalized coordinates (-1 to 1)
      const nx = (x / width) * 2 - 1;
      const ny = (y / height) * 2 - 1;
      const dist = Math.sqrt(nx * nx + ny * ny);

      // Default deep navy background #0f172a
      let pr = 15;
      let pg = 23;
      let pb = 42;

      // Warm radial glow in center
      if (dist < 0.75) {
        const glow = Math.pow(1 - dist / 0.75, 2);
        pr = Math.min(255, Math.round(pr + glow * 180));
        pg = Math.min(255, Math.round(pg + glow * 130));
        pb = Math.min(255, Math.round(pb + glow * 30));
      }

      // Draw Cross
      // Vertical bar
      const crossX = Math.abs(x - width * 0.5) < width * 0.035;
      const crossY = y > height * 0.25 && y < height * 0.58;
      // Horizontal bar
      const barY = Math.abs(y - height * 0.36) < height * 0.035;
      const barX = Math.abs(x - width * 0.5) < width * 0.18;

      if ((crossX && crossY) || (barX && barY)) {
        pr = 251;
        pg = 191;
        pb = 36; // Amber gold #fbbf24
      }

      // Draw open book bottom area
      if (y >= height * 0.58 && y <= height * 0.76 && Math.abs(nx) < 0.65) {
        // Curve for book pages
        const bookArch = 0.58 + 0.05 * Math.sin(Math.abs(nx) * 3.14);
        if (y / height >= bookArch) {
          pr = 248;
          pg = 250;
          pb = 252; // White/slate pages
          // Spine dividing line
          if (Math.abs(x - width * 0.5) < Math.max(1, width * 0.015)) {
            pr = 217;
            pg = 119;
            pb = 6;
          }
        }
      }

      rawData[pxOffset] = pr;
      rawData[pxOffset + 1] = pg;
      rawData[pxOffset + 2] = pb;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8 bits per channel
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // Deflate
  ihdr.writeUInt8(0, 11); // Filter 0
  ihdr.writeUInt8(0, 12); // Interlace 0

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Generate PWA icons
const iconSizes = [
  { file: 'pwa-192x192.png', size: 192 },
  { file: 'pwa-512x512.png', size: 512 },
  { file: 'pwa-maskable-512x512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'favicon.ico', size: 64 },
];

for (const { file, size } of iconSizes) {
  const pngBuf = createSolidPng(size, size);
  fs.writeFileSync(path.join(publicDir, file), pngBuf);
  console.log(`Generated public/${file} (${size}x${size})`);
}
console.log('All icons generated successfully!');
