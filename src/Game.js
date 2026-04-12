import { useRef, useEffect, useState, useCallback } from 'react';
import './Game.css';

// ── Constants ─────────────────────────────────────────────────
const H       = 200;
const GROUND  = 150;
const MAN_X   = 92;
const GRAVITY = 0.7;
const JUMP_V  = -15;

const OBSTACLES = [
  { id: 'react',       size: 60 },
  { id: 'vue',         size: 52 },
  { id: 'angular',     size: 62 },
  { id: 'go',          size: 48 },
  { id: 'python',      size: 58 },
  { id: 'kubernetes',  size: 66 },
  { id: 'php',         size: 48 },
  { id: 'java',        size: 62 },
  { id: 'swift',       size: 56 },
  { id: 'kotlin',      size: 60 },
  { id: 'laravel',     size: 60 },
  { id: 'spring',      size: 62 },
  { id: 'typescript',  size: 56 },
  { id: 'redis',       size: 52 },
  { id: 'nextjs',      size: 44 },
  { id: 'graphql',     size: 60 },
  { id: 'django',      size: 52 },
  { id: 'cplusplus',   size: 62 },
  { id: 'dotnet',      size: 52 },
  { id: 'elixir',      size: 60 },
  { id: 'docker',      size: 62 },
  { id: 'mongodb',     size: 56 },
  { id: 'svelte',      size: 58 },
  { id: 'tailwindcss', size: 54 },
];

function hsGet() { return parseInt(localStorage.getItem('k-hs') || '0'); }
function hsSet(v) { localStorage.setItem('k-hs', String(v)); }

// ── Draw helpers ──────────────────────────────────────────────

function drawBackground(ctx, cw) {
  // Base — barely lighter than page bg to give the game its own plane
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, cw, H);

  // Subtle dot grid
  ctx.fillStyle = '#181818';
  const spacing = 24;
  for (let x = spacing; x < cw; x += spacing) {
    for (let y = spacing; y < H; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, 0.75, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Faint cyan ground glow — echoes the site accent colour
  const grd = ctx.createLinearGradient(0, GROUND - 40, 0, H);
  grd.addColorStop(0, 'transparent');
  grd.addColorStop(1, 'rgba(34, 211, 238, 0.04)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, GROUND - 40, cw, H - (GROUND - 40));
}

function drawMan(ctx, x, y, frame, airborne, img) {
  const bob  = airborne ? 0 : Math.sin(frame * 0.35) * 2.5;
  const size = airborne ? 84 : 76;
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x - size / 2, y - size - bob, size, size);
  }
}

function drawObs(ctx, obs, images) {
  const img = images[obs.id];
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, obs.x, GROUND - obs.size, obs.size, obs.size);
  } else {
    ctx.save();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth   = 1;
    ctx.strokeRect(obs.x, GROUND - obs.size, obs.size, obs.size);
    ctx.restore();
  }
}

function drawPowerup(ctx, p, frame) {
  const isRocket  = p.type === 'rocket';
  const colorRgb  = isRocket ? '251, 191, 36' : '167, 139, 250';
  const color     = isRocket ? '#fbbf24'       : '#a78bfa';
  const label     = isRocket ? 'BOOST'         : 'SLOW';
  const emoji     = isRocket ? '🚀'            : '🐌';

  const cx    = p.x + p.size / 2;
  const cy    = GROUND - p.size / 2;
  const pulse = Math.sin(frame * 0.1) * 2;

  ctx.save();

  // Bloom glow — blur pass gives real brightness regardless of color profile
  ctx.filter = 'blur(12px)';
  ctx.beginPath();
  ctx.arc(cx, cy, p.size / 2 + 4 + pulse, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${colorRgb}, ${0.55 + Math.sin(frame * 0.1) * 0.1})`;
  ctx.fill();
  ctx.filter = 'none';

  // Sharp inner glow ring
  ctx.beginPath();
  ctx.arc(cx, cy, p.size / 2 + 6 + pulse, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${colorRgb}, 0.22)`;
  ctx.fill();

  // Badge background (sits on ground)
  const pad  = 6;
  const bx   = p.x - pad;
  const by   = GROUND - p.size - pad;
  const bw   = p.size + pad * 2;
  const bh   = p.size + pad * 2;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 4);
  ctx.fillStyle   = `rgba(${colorRgb}, 0.2)`;
  ctx.fill();
  ctx.strokeStyle = `rgba(${colorRgb}, 0.9)`;
  ctx.lineWidth   = 1;
  ctx.stroke();

  // Emoji
  ctx.font         = `${p.size}px sans-serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, cx, cy);

  // Label above badge
  ctx.font         = '7px "JetBrains Mono", monospace';
  ctx.fillStyle    = color;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(label, cx, by - 3);

  ctx.restore();
}

function drawHUD(ctx, score, cw, speedMult, frame) {
  const hi = hsGet();
  ctx.save();
  ctx.font         = '11px "JetBrains Mono", monospace';
  ctx.textAlign    = 'right';
  ctx.textBaseline = 'top';
  ctx.fillStyle    = '#3f3f46';
  ctx.fillText(
    `HI ${String(hi).padStart(5,'0')}  ${String(Math.floor(score)).padStart(5,'0')}`,
    cw - 16, 10
  );

  // Speed multiplier indicator
  if (speedMult > 1) {
    const alpha = 0.6 + Math.sin(frame * 0.15) * 0.4;
    ctx.font      = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
    ctx.textAlign = 'left';
    ctx.fillText(`⚡ x${speedMult.toFixed(1)}`, 16, 10);
  }

  ctx.restore();
}

// ── Spawn helper ──────────────────────────────────────────────

function safeSpawnX(cw, obstacles, powerups) {
  const minGap = 120;
  let x = cw + 20;
  const entities = [
    ...obstacles.map(e => ({ left: e.x, right: e.x + e.size })),
    ...powerups.map(e => ({ left: e.x, right: e.x + e.size })),
  ];
  for (let i = 0; i < 10; i++) {
    const blocker = entities.find(e => x < e.right + minGap && x + minGap > e.left);
    if (!blocker) return x;
    x = blocker.right + minGap;
  }
  return x;
}

// ── State factory ─────────────────────────────────────────────

function mkState() {
  return {
    manY: GROUND, velY: 0, grounded: true,
    obstacles: [], powerups: [],
    score: 0, baseSpeed: 5, speed: 5,
    speedMult: 1,
    frame: 0,
    spawnIn:       45 + Math.random() * 45,
    spawnPowerIn:  220 + Math.random() * 180,
  };
}

// ── Component ─────────────────────────────────────────────────

export default function Game() {
  const canvasRef = useRef(null);
  const ctxRef    = useRef(null);
  const gsRef     = useRef(null);
  const rafRef    = useRef(null);
  const dprRef    = useRef(1);
  const imagesRef = useRef({});

  const [phase, setPhase]       = useState('idle');
  const [dead,  setDead]        = useState({ score: 0, isNew: false });
  const [highScore, setHSState] = useState(hsGet);

  // Preload logos + man
  useEffect(() => {
    const man = new Image();
    man.onload = () => {
      const ctx = ctxRef.current;
      if (!ctx || gsRef.current) return;
      const cw = ctx.canvas.width / dprRef.current;
      drawBackground(ctx, cw);
      drawMan(ctx, MAN_X, GROUND, 0, false, man);
      if (hsGet() > 0) drawHUD(ctx, 0, cw, 1, 0);
    };
    man.src = '/man.png';
    imagesRef.current['_man'] = man;

    OBSTACLES.forEach(({ id }) => {
      const img = new Image();
      img.src = `/logos/${id}.png`;
      imagesRef.current[id] = img;
    });
  }, []);

  // ── Game tick ────────────────────────────────────────────────
  const tick = useCallback(() => {
    const s   = gsRef.current;
    const ctx = ctxRef.current;
    if (!s || !ctx) return;

    const cw = ctx.canvas.width / dprRef.current;

    s.frame++;
    s.score     += 0.1;
    s.baseSpeed  = 5.5 + s.score * 0.006;         // faster base + faster scaling
    s.speed      = s.baseSpeed * s.speedMult;

    // Physics
    if (!s.grounded) {
      s.velY += GRAVITY;
      s.manY += s.velY;
      if (s.manY >= GROUND) { s.manY = GROUND; s.velY = 0; s.grounded = true; }
    }

    // Spawn obstacle
    s.spawnIn--;
    if (s.spawnIn <= 0) {
      const obs = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
      s.obstacles.push({ ...obs, x: safeSpawnX(cw, s.obstacles, s.powerups) });
      const gap = Math.max(34, 80 - s.score * 0.15);  // tighter gaps faster
      s.spawnIn = gap + Math.random() * 45;
    }

    // Spawn power-up (rocket 60% / snail 40%)
    s.spawnPowerIn--;
    if (s.spawnPowerIn <= 0) {
      const type = Math.random() < 0.6 ? 'rocket' : 'snail';
      s.powerups.push({ type, x: safeSpawnX(cw, s.obstacles, s.powerups), size: 52 });
      s.spawnPowerIn = 200 + Math.random() * 200;
    }

    // Move + prune
    for (const o of s.obstacles) o.x -= s.speed;
    for (const p of s.powerups)  p.x -= s.speed;
    s.obstacles = s.obstacles.filter(o => o.x + o.size > -20);
    s.powerups  = s.powerups.filter(p => p.x + p.size > -20);

    // Collect power-ups (only when grounded — can't grab mid-air after jumping over)
    for (let i = s.powerups.length - 1; i >= 0; i--) {
      const p = s.powerups[i];
      const cx = p.x + p.size / 2;
      if (s.grounded && Math.abs(MAN_X - cx) < p.size / 2 + 10) {
        if (p.type === 'rocket') {
          s.speedMult = Math.round((s.speedMult + 0.4) * 10) / 10;
        } else {
          s.speedMult = Math.round(Math.max(1, s.speedMult - 0.4) * 10) / 10;
        }
        s.powerups.splice(i, 1);
      }
    }

    // Obstacle collision
    for (const o of s.obstacles) {
      if (
        MAN_X + 12 > o.x + 6            &&
        MAN_X - 12 < o.x + o.size - 6   &&
        s.manY     > GROUND - o.size + 6 &&
        s.manY - 42 < GROUND
      ) {
        const sc    = Math.floor(s.score);
        const prev  = hsGet();
        const isNew = sc > prev;
        if (isNew) { hsSet(sc); setHSState(sc); }
        setDead({ score: sc, isNew });
        setPhase('dead');
        gsRef.current = null;
        drawBackground(ctx, cw);
        drawMan(ctx, MAN_X, s.manY, s.frame, !s.grounded, imagesRef.current['_man']);
        for (const ob of s.obstacles) drawObs(ctx, ob, imagesRef.current);
        for (const p  of s.powerups)  drawPowerup(ctx, p, s.frame);
        drawHUD(ctx, s.score, cw, 1, s.frame);
        return;
      }
    }

    // Draw
    drawBackground(ctx, cw);
    drawMan(ctx, MAN_X, s.manY, s.frame, !s.grounded, imagesRef.current['_man']);
    for (const o of s.obstacles) drawObs(ctx, o, imagesRef.current);
    for (const p  of s.powerups)  drawPowerup(ctx, p, s.frame);
    drawHUD(ctx, s.score, cw, s.speedMult, s.frame);

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // ── Start ────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    gsRef.current = mkState();
    setPhase('playing');
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  // ── Jump ─────────────────────────────────────────────────────
  const jump = useCallback(() => {
    if (phase !== 'playing') { startGame(); return; }
    const s = gsRef.current;
    if (s?.grounded) { s.velY = JUMP_V; s.grounded = false; }
  }, [phase, startGame]);

  // ── Keyboard ─────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump]);

  // ── Canvas setup + resize ────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const setup = () => {
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      canvas.width   = canvas.offsetWidth * dpr;
      canvas.height  = H * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctxRef.current = ctx;
    };
    setup();
    window.addEventListener('resize', setup);
    return () => window.removeEventListener('resize', setup);
  }, []);

  // ── Idle / dead static frame ─────────────────────────────────
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx || phase === 'playing') return;
    const cw = ctx.canvas.width / dprRef.current;
    drawBackground(ctx, cw);
    drawMan(ctx, MAN_X, GROUND, 0, false, imagesRef.current['_man']);
    if (hsGet() > 0) drawHUD(ctx, 0, cw, 1, 0);
  }, [phase]);

  // ── Cleanup ──────────────────────────────────────────────────
  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const showUI = phase === 'idle' || phase === 'dead';

  return (
    <div className="game-wrap">
      <canvas ref={canvasRef} className="game-canvas" onClick={jump} />
      <div className={`game-ui${showUI ? '' : ' game-ui--hidden'}`}>
        {phase === 'dead' && (
          <span className="game-result">
            {dead.isNew ? `✦ new best  ${dead.score}` : `score  ${dead.score}`}
          </span>
        )}
        <button className="game-play-btn" onClick={jump}>
          {phase === 'idle' ? '▶  play' : '↺  again'}
        </button>
        {phase === 'idle' && highScore > 0 && (
          <span className="game-hi">hi {String(highScore).padStart(5,'0')}</span>
        )}
      </div>
    </div>
  );
}
