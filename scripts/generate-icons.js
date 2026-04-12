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
})();
