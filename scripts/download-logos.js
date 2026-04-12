const sharp  = require('sharp');
const https  = require('https');
const http   = require('http');
const fs     = require('fs');
const path   = require('path');

const BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';
const OUT  = path.join(__dirname, '../public/logos');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const LOGOS = [
  ['react',       'react/react-original.svg'],
  ['vue',         'vuejs/vuejs-original.svg'],
  ['angular',     'angularjs/angularjs-original.svg'],
  ['go',          'go/go-original.svg'],
  ['python',      'python/python-original.svg'],
  ['kubernetes',  'kubernetes/kubernetes-original.svg'],
  ['php',         'php/php-original.svg'],
  ['java',        'java/java-original.svg'],
  ['swift',       'swift/swift-original.svg'],
  ['kotlin',      'kotlin/kotlin-original.svg'],
  ['laravel',     'laravel/laravel-original.svg'],
  ['spring',      'spring/spring-original.svg'],
  ['typescript',  'typescript/typescript-original.svg'],
  ['redis',       'redis/redis-original.svg'],
  ['nextjs',      'nextjs/nextjs-original.svg'],
  ['graphql',     'graphql/graphql-plain.svg'],
  ['django',      'django/django-plain.svg'],
  ['cplusplus',   'cplusplus/cplusplus-original.svg'],
  ['dotnet',      'dotnetcore/dotnetcore-original.svg'],
  ['elixir',      'elixir/elixir-original.svg'],
  ['docker',      'docker/docker-original.svg'],
  ['mongodb',     'mongodb/mongodb-original.svg'],
  ['svelte',      'svelte/svelte-original.svg'],
  ['tailwindcss', 'tailwindcss/tailwindcss-original.svg'],
];

function fetch(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end',  () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

(async () => {
  for (const [name, logoPath] of LOGOS) {
    try {
      const buf = await fetch(`${BASE}/${logoPath}`);
      await sharp(buf, { density: 288 })
        .resize(256, 256, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(path.join(OUT, `${name}.png`));
      console.log(`✓ ${name}`);
    } catch (e) {
      console.error(`✗ ${name}: ${e.message}`);
    }
  }
  console.log('\ndone — logos in public/logos/');
})();
