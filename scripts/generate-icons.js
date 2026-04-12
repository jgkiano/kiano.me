const sharp  = require('sharp');
const path   = require('path');
const fs     = require('fs');

const SRC    = path.join(__dirname, '../me.png');
const PUBLIC = path.join(__dirname, '../public');

const sizes = [
  { name: 'favicon-16.png',        size: 16  },
  { name: 'favicon-32.png',        size: 32  },
  { name: 'logo192.png',           size: 192 },
  { name: 'logo512.png',           size: 512 },
  { name: 'apple-touch-icon.png',  size: 180 },
  { name: 'man.png',               size: 128 },
];

const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <rect x="1" y="1" width="1198" height="628" fill="none" stroke="#1f1f1f" stroke-width="1"/>

  <text x="80" y="196" font-family="monospace" font-size="18" fill="#22d3ee" letter-spacing="3">SENIOR SOFTWARE ENGINEER</text>
  <text x="80" y="310" font-family="sans-serif" font-weight="700" font-size="112" fill="#f4f4f5" letter-spacing="-3">Kiano</text>
  <text x="84" y="368" font-family="sans-serif" font-size="32" fill="#52525b">(Julius G.)</text>
  <rect x="80" y="408" width="48" height="1" fill="#1f1f1f"/>
  <text x="80" y="450" font-family="sans-serif" font-size="22" fill="#71717a">Architecting for reliability, zero-downtime deployments,</text>
  <text x="80" y="482" font-family="sans-serif" font-size="22" fill="#71717a">mobile applications and infrastructure that powers millions.</text>
  <text x="80" y="575" font-family="monospace" font-size="18" fill="#3f3f46">kiano.me</text>
</svg>
`;

(async () => {
  // ── App icons ──────────────────────────────────────────────────
  for (const { name, size } of sizes) {
    await sharp(SRC)
      .resize(size, size, {
        fit:        'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(path.join(PUBLIC, name));
    console.log(`✓ ${name} (${size}x${size})`);
  }

  // ── favicon.ico ────────────────────────────────────────────────
  const favicon32 = await sharp(SRC)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(PUBLIC, 'favicon.ico'), favicon32);
  console.log('✓ favicon.ico (32x32)');

  // ── OG image — memoji composited on right ──────────────────────
  const MEMOJI_H = 400;
  const MEMOJI_W = Math.round(MEMOJI_H * (288 / 327));  // preserve aspect ratio
  const memojiBuf = await sharp(SRC)
    .resize(MEMOJI_W, MEMOJI_H, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .composite([{
      input: memojiBuf,
      top:   Math.round((630 - MEMOJI_H) / 2),
      left:  1200 - MEMOJI_W - 60,
    }])
    .png()
    .toFile(path.join(PUBLIC, 'og-image.png'));
  console.log(`✓ og-image.png (1200x630, memoji ${MEMOJI_W}x${MEMOJI_H})`);

  console.log('\ndone — icons in public/');
})();
