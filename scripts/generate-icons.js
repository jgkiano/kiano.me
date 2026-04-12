const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SRC = path.join(__dirname, '../public/icon.svg');
const PUBLIC = path.join(__dirname, '../public');

const svgBuffer = fs.readFileSync(SRC);

const sizes = [
  { name: 'favicon-16.png', size: 16 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'logo192.png',    size: 192 },
  { name: 'logo512.png',    size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <!-- Background -->
  <rect width="1200" height="630" fill="#0a0a0a"/>

  <!-- Subtle border -->
  <rect x="1" y="1" width="1198" height="628" fill="none" stroke="#1f1f1f" stroke-width="1"/>

  <!-- K mark (right side) -->
  <g transform="translate(820, 155) scale(0.625)">
    <rect width="512" height="512" rx="96" fill="#111111"/>
    <rect x="156" y="110" width="62" height="292" fill="#f4f4f5"/>
    <polygon points="218,195 380,110 380,172 218,260" fill="#22d3ee"/>
    <polygon points="218,252 380,340 380,402 218,316" fill="#22d3ee"/>
  </g>

  <!-- Tag -->
  <text x="80" y="196" font-family="monospace" font-size="18" fill="#22d3ee" letter-spacing="3">SENIOR SOFTWARE ENGINEER</text>

  <!-- Name -->
  <text x="80" y="310" font-family="sans-serif" font-weight="700" font-size="112" fill="#f4f4f5" letter-spacing="-3">Kiano</text>

  <!-- Subtitle -->
  <text x="84" y="368" font-family="sans-serif" font-size="32" fill="#52525b">(Julius G.)</text>

  <!-- Divider -->
  <rect x="80" y="408" width="48" height="1" fill="#1f1f1f"/>

  <!-- Description -->
  <text x="80" y="450" font-family="sans-serif" font-size="22" fill="#71717a">Architecting for reliability, zero-downtime deployments,</text>
  <text x="80" y="482" font-family="sans-serif" font-size="22" fill="#71717a">mobile applications and infrastructure that powers millions.</text>

  <!-- Domain -->
  <text x="80" y="575" font-family="monospace" font-size="18" fill="#3f3f46">kiano.me</text>
</svg>
`;

(async () => {
  for (const { name, size } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(PUBLIC, name));
    console.log(`✓ ${name} (${size}x${size})`);
  }

  // favicon.ico — use 32x32 PNG renamed (browsers accept PNG favicon)
  const favicon32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(PUBLIC, 'favicon.ico'), favicon32);
  console.log('✓ favicon.ico (32x32 PNG)');

  // OG image — 1200x630
  await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .png()
    .toFile(path.join(PUBLIC, 'og-image.png'));
  console.log('✓ og-image.png (1200x630)');
})();
