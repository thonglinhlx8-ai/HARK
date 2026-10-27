import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp01} from '../../library/anim';
import {FilBg, FilGrain} from '../../library/filament/stage';
import {ease, F} from '../../library/filament/theme';
import {BAR, BARLEN, BP, DROP, END, MID, S, W, H} from './timeline';

/**
 * ep64 "Trì hoãn" — một vệt sáng đi qua các ngã rẽ.
 * Thiết bị RIÊNG: ngã ba "Làm / Lướt 5 phút", vòng lặp chồng thành cuộn rối, con dốc đắp bằng chữ cảm xúc,
 * vệt sáng duỗi thành đường căng thẳng học kỳ, ngã "Tự mắng / Tha cho mình", lối thứ ba "chỉ mở file".
 * Nguồn: Sirois & Pychyl 2013; Tice & Baumeister 1997; Wohl, Pychyl & Bennett 2010.
 */

const SUB = "'Ep64 Sub', 'Filament Viet', sans-serif";
const DISP = "'Ep64 Display', 'Filament Viet Display', serif";
if (typeof document !== 'undefined') {
  const h = delayRender('ep64 fonts');
  Promise.all([
    new FontFace('Ep64 Sub', `url(${staticFile('fonts/ep58/BeVietnamPro-ExtraBold.ttf')})`).load().then((l) => document.fonts.add(l)),
    new FontFace('Ep64 Display', `url(${staticFile('fonts/ep58/PlayfairDisplay.ttf')})`, {weight: '400 900'}).load().then((l) => document.fonts.add(l)),
  ]).catch(() => undefined).finally(() => continueRender(h));
}

const GOLD = '#f2c46d';
const GOLD_DIM = 'rgba(240,212,165,0.32)';
const RED = F.red;
const RED_HOT = F.redHot;
const TXT = F.text;
const BASE = 1380;
const P: Pt = [540, BASE];

type Pt = [number, number];
const io = (f: number, a: number, b: number, d = 8) => ease((f - a) / d) * (1 - ease((f - b) / d));
const blurV = (v: number) => (v >= 0.999 ? undefined : `blur(${((1 - v) * 10).toFixed(1)}px)`);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rnd = (k: number) => {
  const x = Math.sin(k * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const prog = (t: number, a: number, b: number) => ease(clamp01((t - a) / (b - a)));
const lin = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/* ============================== HÌNH HỌC ĐƯỜNG ============================== */
const cum = (pts: Pt[]) => {
  const c = [0];
  for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return c;
};
const at = (pts: Pt[], t: number): Pt => {
  const c = cum(pts);
  const L = c[c.length - 1] * clamp01(t);
  for (let i = 1; i < pts.length; i++) {
    if (c[i] >= L) {
      const k = (L - c[i - 1]) / Math.max(1e-6, c[i] - c[i - 1]);
      return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)];
    }
  }
  return pts[pts.length - 1];
};
const part = (pts: Pt[], t: number): Pt[] => {
  if (t <= 0) return [pts[0]];
  if (t >= 1) return pts;
  const c = cum(pts);
  const L = c[c.length - 1] * t;
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (c[i] < L) out.push(pts[i]);
    else {
      const k = (L - c[i - 1]) / Math.max(1e-6, c[i] - c[i - 1]);
      out.push([lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]);
      break;
    }
  }
  return out;
};
const resample = (pts: Pt[], n: number): Pt[] => Array.from({length: n}, (_, i) => at(pts, i / (n - 1)));
const D = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

/** Vòng lặp "lướt 5 phút" thứ k: rẽ phải, vòng một vòng, quay về đúng ngã cũ */
const loopPts = (k: number): Pt[] => {
  const r = 170 + 26 * k;
  const c: Pt = [770 + 12 * k, BASE - r];
  const pts: Pt[] = [];
  for (let i = 0; i <= 12; i++) pts.push([lerp(P[0], c[0], i / 12), BASE]);
  for (let i = 1; i <= 90; i++) {
    const th = Math.PI / 2 - (2 * Math.PI * i) / 90;
    const wob = 1 + 0.04 * Math.sin(i * 0.31 + k * 2);
    pts.push([c[0] + r * wob * Math.cos(th), c[1] + r * wob * Math.sin(th)]);
  }
  for (let i = 1; i <= 12; i++) pts.push([lerp(c[0], P[0] + 6, i / 12), BASE + 10 * Math.sin((i / 12) * Math.PI)]);
  return resample(pts, 140);
};
const LOOPS = [0, 1, 2].map(loopPts);
const LOOP_T: [number, number][] = [
  [MID(1), MID(4)],
  [BAR(5) + 0.2, MID(7)],
  [BAR(8) + 0.2, MID(10)],
];
const LOOP_LABEL = ['5 phút', '40 phút', '3 tiếng'];
const STRAIGHT = resample(
  [
    [P[0], BASE],
    [P[0], 560],
  ],
  140,
);

/* ============================== CON DỐC BẰNG CHỮ ============================== */
const HILL_STEPS: [number, number][] = [
  [0, 140],
  [MID(4), 230],
  [MID(7), 330],
  [MID(10), 440],
  [BAR(12) + 0.15, 700],
];
const SHRINK = [BAR(34), MID(34), BAR(35), MID(35), BAR(36), MID(36)];
const SHRINK_H = [560, 430, 320, 220, 140, 90];
const hillH = (t: number) => {
  let h = HILL_STEPS[0][1];
  for (let i = 1; i < HILL_STEPS.length; i++) {
    const [ts, v] = HILL_STEPS[i];
    const d = t - ts;
    if (d >= 0) {
      const prev = HILL_STEPS[i - 1][1];
      const k = clamp01(d / 0.22);
      h = prev + (v - prev) * ease(k) + (v - prev) * 0.12 * Math.exp(-d / 0.12) * Math.sin(d * 30) * (k >= 1 ? 1 : 0);
    }
  }
  if (t >= BAR(31)) h = 720;
  for (let i = 0; i < SHRINK.length; i++) {
    const d = t - SHRINK[i];
    if (d >= 0) {
      const prev = i === 0 ? 720 : SHRINK_H[i - 1];
      h = prev + (SHRINK_H[i] - prev) * ease(clamp01(d / 0.2));
    }
  }
  return h;
};
const hillPath = (h: number, x0 = 90, x1 = 500, base = BASE) => `M${x0},${base} Q${(x0 + x1) / 2},${base - 2 * h} ${x1},${base} Z`;
const hillPt = (h: number, t: number, x0 = 90, x1 = 500, base = BASE): Pt => {
  const cx = (x0 + x1) / 2;
  const cy = base - 2 * h;
  return [(1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1, (1 - t) * (1 - t) * base + 2 * (1 - t) * t * cy + t * t * base];
};
const WORDS = ['chán', 'sợ làm dở', 'không biết bắt đầu', 'sợ bị chê', 'mệt', 'chưa đủ giỏi', 'lỡ sai thì sao'];

const Hill: React.FC<{f: number; t: number; h: number; bright: number; shame: boolean; o: number}> = ({f, t, h, bright, shame, o}) => {
  const rows = Math.ceil(h / 44) + 1;
  const peak = hillPt(h, 0.5);
  const label = t < BAR(15) || t >= BAR(32);
  return (
    <g opacity={o}>
      <defs>
        <clipPath id="e64hill">
          <path d={hillPath(h)} />
        </clipPath>
        <linearGradient id="e64hillg" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#2b2219" />
          <stop offset="1" stopColor="#4a3a2a" />
        </linearGradient>
      </defs>
      <path d={hillPath(h)} fill="url(#e64hillg)" stroke={GOLD} strokeOpacity={0.7} strokeWidth={3} />
      <g clipPath="url(#e64hill)">
        {Array.from({length: rows}, (_, r) => {
          const y = BASE - 14 - r * 44;
          const top = shame && r >= rows - 3;
          const txt = Array.from({length: 6}, (_, j) => (top ? 'mình tệ' : WORDS[(r * 3 + j) % WORDS.length])).join('  ·  ');
          const drift = ((f * 0.6 + r * 37) % 180) - 90;
          return (
            <text key={r} x={-60 + (r % 2) * 40 + drift * 0.3} y={y} fontFamily={SUB} fontSize={30} fill={top ? RED_HOT : GOLD} fillOpacity={top ? 0.9 : 0.16 + 0.7 * bright}>
              {txt}
            </text>
          );
        })}
      </g>
      {label ? (
        <g transform={`translate(${peak[0]},${peak[1] - 34})`}>
          <text textAnchor="middle" fontFamily={SUB} fontSize={34} letterSpacing={6} fill={TXT}>LÀM</text>
        </g>
      ) : null}
    </g>
  );
};

/** Chữ rơi khỏi dốc ở mỗi nhịp co lại */
const Falling: React.FC<{t: number}> = ({t}) => (
  <g>
    {SHRINK.map((ts, i) => {
      const d = t - ts;
      if (d < 0 || d > 1.6) return null;
      const hb = i === 0 ? 720 : SHRINK_H[i - 1];
      return [0, 1, 2].map((j) => {
        const w = WORDS[(i * 3 + j) % WORDS.length];
        const x0 = 170 + j * 110 + rnd(i * 7 + j) * 40;
        const y0 = BASE - hb + 60 + j * 20;
        const vx = (rnd(i * 13 + j) - 0.5) * 260;
        const x = x0 + vx * d;
        const y = y0 - 220 * d + 1300 * d * d;
        const rot = (rnd(i + j * 5) - 0.5) * 220 * d;
        return (
          <text key={`${i}-${j}`} x={x} y={y} transform={`rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`} fontFamily={SUB} fontSize={34} fill={GOLD} opacity={1 - clamp01((d - 0.9) / 0.7)} textAnchor="middle">
            {w}
          </text>
        );
      });
    })}
  </g>
);

/* ============================== VỆT SÁNG ============================== */
const Glow: React.FC<{d: string; color?: string; w?: number; o?: number; dash?: string}> = ({d, color = GOLD, w = 6, o = 1, dash}) => (
  <g opacity={o}>
    <path d={d} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={w * 4} strokeLinecap="round" strokeLinejoin="round" style={{filter: 'blur(8px)'}} />
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} />
  </g>
);
const Head: React.FC<{p: Pt; color?: string; f: number; r?: number}> = ({p, color = '#fff6dc', f, r = 13}) => (
  <g>
    <circle cx={p[0]} cy={p[1]} r={r * 3.2 * (1 + 0.08 * Math.sin(f / 3))} fill={color === '#fff6dc' ? 'rgba(255,214,140,0.22)' : 'rgba(255,80,60,0.25)'} />
    <circle cx={p[0]} cy={p[1]} r={r} fill={color} />
  </g>
);

/* ============================== CHỮ ============================== */
const Caption: React.FC<{f: number; a: number; b: number; text: string; size?: number; top?: number}> = ({f, a, b, text, size = 54, top = 250}) => {
  const fa = S(a);
  const fb = S(b);
  if (f < fa - 2 || f > fb + 10) return null;
  const words: {w: string; hi: boolean}[] = [];
  let hi = false;
  for (const raw of text.split(' ')) {
    if (raw.includes('【')) hi = true;
    const close = raw.includes('】');
    words.push({w: raw.replace(/[【】]/g, ''), hi});
    if (close) hi = false;
  }
  const out = 1 - ease((f - fb) / 8);
  const big = size > 60;
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top, textAlign: 'center', fontFamily: big ? DISP : SUB, fontWeight: big ? 900 : undefined, fontSize: size, lineHeight: 1.36, color: TXT, opacity: out, filter: blurV(out)}}>
      {words.map((x, i) => {
        const v = a < 0 ? 1 : ease((f - fa - i * 2) / 7);
        const pop = big && x.hi ? 1 + 0.25 * Math.exp(-Math.max(0, f - fa - i * 2) / 4) : 1;
        return (
          <React.Fragment key={i}>
            {i > 0 ? ' ' : ''}
            <span style={{display: 'inline-block', opacity: v, filter: blurV(v), transform: `translateY(${((1 - v) * 14).toFixed(1)}px) scale(${pop.toFixed(3)})`, color: x.hi ? RED_HOT : undefined, textShadow: x.hi ? '0 0 26px rgba(255,90,70,0.6), 0 3px 8px #000' : '0 3px 10px rgba(0,0,0,0.95)'}}>{x.w}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Clock: React.FC<{f: number; text: string; part: string; a: number; b: number; first?: boolean}> = ({f, text, part, a, b, first}) => {
  const v = first ? 1 - ease((f - S(b)) / 6) : io(f, S(a), S(b), 6);
  if (v <= 0) return null;
  const pop = first ? 1 : 1 + 0.12 * Math.exp(-Math.max(0, f - S(a)) / 4);
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 110, textAlign: 'center', opacity: v, transform: `scale(${pop})`}}>
      <span style={{fontFamily: DISP, fontWeight: 800, fontSize: 66, color: TXT, letterSpacing: 2}}>{text}</span>
      <span style={{fontFamily: SUB, fontSize: 24, color: GOLD, letterSpacing: 6, marginLeft: 16, verticalAlign: 16}}>{part}</span>
    </div>
  );
};

const Foot: React.FC<{f: number; a: number; b: number; text: string}> = ({f, a, b, text}) => {
  const v = io(f, S(a), S(b), 10);
  if (v <= 0) return null;
  return <div style={{position: 'absolute', left: 60, right: 60, top: 1650, textAlign: 'center', fontFamily: SUB, fontSize: 25, color: 'rgba(246,243,234,0.5)', opacity: v}}>{text}</div>;
};

const Pill: React.FC<{x: number; y: number; text: string; o: number; color?: string; pop?: number; size?: number}> = ({x, y, text, o, color = GOLD, pop = 1, size = 30}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${pop.toFixed(3)})`, opacity: o, padding: '8px 22px', borderRadius: 999, border: `2px solid ${color}`, background: 'rgba(20,15,11,0.85)', fontFamily: SUB, fontSize: size, color, whiteSpace: 'nowrap'}}>{text}</div>
);

/* ============================== THẺ CƠ CHẾ ============================== */
const MoodCard: React.FC<{f: number}> = ({f}) => {
  const fa = S(BAR(18));
  const fb = S(BAR(20));
  if (f < fa - 2 || f > fb + 10) return null;
  const r = (d: number) => io(f, fa + d, fb, 10);
  const pop = 1 + 0.06 * Math.exp(-(f - fa) / 5);
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 560, textAlign: 'center'}}>
      <div style={{display: 'inline-block', fontFamily: SUB, fontSize: 26, letterSpacing: 6, color: GOLD, border: `1.5px solid ${GOLD}`, borderRadius: 999, padding: '4px 22px', opacity: r(0)}}>CƠ CHẾ</div>
      <div style={{marginTop: 26, fontFamily: DISP, fontWeight: 900, fontSize: 116, lineHeight: 1.08, color: TXT, opacity: r(2), filter: blurV(r(2)), transform: `scale(${pop.toFixed(3)})`}}>Sửa tâm trạng<br />tức thời</div>
      <div style={{marginTop: 16, fontFamily: DISP, fontStyle: 'italic', fontSize: 42, color: 'rgba(246,243,234,0.6)', opacity: r(8)}}>Short-term mood repair</div>
      <div style={{margin: '24px auto 0', width: 340 * ease((f - fa - 10) / 14), height: 3, background: `linear-gradient(90deg, rgba(242,196,109,0), ${GOLD}, rgba(242,196,109,0))`}} />
      <div style={{marginTop: 30, padding: '0 100px', fontFamily: SUB, fontSize: 42, lineHeight: 1.45, color: TXT, opacity: r(18)}}>Né việc để dễ chịu ngay. Phần khó để lại cho <span style={{color: RED_HOT}}>bạn ngày mai</span>.</div>
    </div>
  );
};

/* ============================== BIỂU ĐỒ HỌC KỲ ============================== */
const CX0 = 150;
const CX1 = 930;
const grey = (u: number): Pt => [lerp(CX0, CX1, u), 1060 - 60 * u];
const gold = (u: number): Pt => [lerp(CX0, CX1, u), 1200 - 420 * u * u];
const UX = (60 + Math.sqrt(3600 + 4 * 420 * 140)) / 840;
const G0 = BAR(20) + 0.4;
const GX = MID(21);
const G1 = G0 + (GX - G0) / UX;
const Chart: React.FC<{f: number; t: number}> = ({f, t}) => {
  const fa = S(BAR(20));
  const fb = S(BAR(24.5));
  if (f < fa - 2 || f > fb + 10) return null;
  const v = io(f, fa, fb, 9);
  const gp = prog(t, BAR(20) + 0.1, BAR(20) + 1.1);
  const up = lin(t, G0, G1);
  const N = 80;
  const gr = Array.from({length: N + 1}, (_, i) => grey((i / N) * gp));
  const g1: Pt[] = [];
  const g2: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const u = (i / N) * up;
    if (u <= UX) g1.push(gold(u));
    else {
      if (!g2.length) g2.push(gold(UX));
      g2.push(gold(u));
    }
  }
  const xp = gold(UX);
  const dx = f - S(GX);
  const head = gold(up);
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: v}}>
      <line x1={CX0} y1={1300} x2={CX1 + 20} y2={1300} stroke={GOLD_DIM} strokeWidth={2} />
      <line x1={CX0} y1={1300} x2={CX0} y2={700} stroke={GOLD_DIM} strokeWidth={2} />
      <text x={CX0} y={1350} fontFamily={SUB} fontSize={30} fill="rgba(246,243,234,0.6)">Đầu kỳ</text>
      <text x={CX1} y={1350} textAnchor="end" fontFamily={SUB} fontSize={30} fill="rgba(246,243,234,0.6)">Cuối kỳ</text>
      <text x={CX0} y={672} fontFamily={SUB} fontSize={30} fill="rgba(246,243,234,0.6)">Căng thẳng ↑</text>
      <path d={D(gr)} fill="none" stroke="rgba(200,200,200,0.55)" strokeWidth={5} strokeLinecap="round" />
      {gp > 0.95 ? <text x={CX1} y={1018} textAnchor="end" fontFamily={SUB} fontSize={28} fill="rgba(220,220,220,0.75)" opacity={ease((t - BAR(20) - 1.1) / 0.4)}>Không trì hoãn</text> : null}
      {g1.length > 1 ? <Glow d={D(g1)} color={GOLD} w={7} /> : null}
      {g2.length > 1 ? <Glow d={D(g2)} color={RED_HOT} w={8} /> : null}
      {up > 0 && up < 1 ? <Head p={head} f={f} color={up > UX ? '#ffd2c8' : '#fff6dc'} /> : null}
      {up >= 1 ? <text x={CX1} y={740} textAnchor="end" fontFamily={SUB} fontSize={34} fill={RED_HOT} opacity={ease((t - G1) / 0.3)}>Trì hoãn</text> : null}
      {dx >= 0 && dx < 24 ? <circle cx={xp[0]} cy={xp[1]} r={20 + dx * 9} fill="none" stroke={RED_HOT} strokeWidth={4} opacity={1 - dx / 24} /> : null}
      <text x={CX1} y={1400} textAnchor="end" fontFamily={SUB} fontSize={22} fill="rgba(246,243,234,0.35)">minh hoạ xu hướng</text>
    </svg>
  );
};

/* ============================== NGÃ RẼ THỨ HAI ============================== */
const Q: Pt = [540, 1450];
const KIND_PTS: Pt[] = resample(
  [
    [540, 1450],
    [470, 1330],
    [380, 1180],
    [320, 1000],
    [300, 820],
    [300, 640],
  ],
  120,
);
const SCOLD_PTS: Pt[] = (() => {
  const raw: Pt[] = [
    [540, 1450],
    [620, 1330],
    [700, 1240],
    [790, 1120],
    [860, 1000],
    [920, 960],
    [985, 1030],
    [990, 1160],
    [930, 1290],
    [860, 1450],
  ];
  const r = resample(raw, 120);
  return r.map(([x, y], i) => [x + (i % 2 ? 9 : -9) * (i > 2 && i < 117 ? 1 : 0), y] as Pt);
})();
const SH_X0 = 690;
const SH_X1 = 1040;
const SH_BASE = 1450;
const shameH = (t: number) => {
  let h = 0;
  if (t >= MID(25) + 0.9) h = 200 * ease(clamp01((t - MID(25) - 0.9) / 0.25));
  if (t >= MID(26)) h = 200 + 120 * ease(clamp01((t - MID(26)) / 0.25));
  if (t >= MID(27)) h = 320 + 90 * ease(clamp01((t - MID(27)) / 0.25));
  if (t >= MID(30)) h = 410 + 120 * ease(clamp01((t - MID(30)) / 0.22)) + 40 * Math.exp(-(t - MID(30)) / 0.12) * Math.sin((t - MID(30)) * 30);
  return h;
};
const Fork2: React.FC<{f: number; t: number}> = ({f, t}) => {
  const fa = S(BAR(24.5));
  const fb = S(BAR(32));
  if (f < fa - 2 || f > fb + 10) return null;
  const v = io(f, fa, fb, 9);
  const sp = prog(t, MID(25), MID(25) + 0.95);
  const kp = prog(t, BAR(28) + 0.3, MID(29));
  const sh = shameH(t);
  const kindLit = t >= BAR(28) + 0.3;
  const shDim = kindLit ? 0.55 : 1;
  const pathsO = ease((t - BAR(24.5)) / 0.4);
  const stem: Pt[] = [
    [540, 1800],
    [540, 1450],
  ];
  let head: Pt = Q;
  if (sp > 0 && sp < 1) head = at(SCOLD_PTS, sp);
  if (sp >= 1) head = SCOLD_PTS[SCOLD_PTS.length - 1];
  if (kindLit) head = kp < 1 ? at(KIND_PTS, kp) : KIND_PTS[KIND_PTS.length - 1];
  const rows = Math.ceil(sh / 44) + 1;
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: v}}>
      <defs>
        <clipPath id="e64shame">
          <path d={hillPath(sh, SH_X0, SH_X1, SH_BASE)} />
        </clipPath>
      </defs>
      <Glow d={D(stem)} w={6} />
      <path d={D(KIND_PTS)} fill="none" stroke={GOLD} strokeOpacity={0.35 * pathsO} strokeWidth={5} strokeDasharray="10 12" strokeLinecap="round" />
      <path d={D(SCOLD_PTS)} fill="none" stroke={RED} strokeOpacity={0.35 * pathsO} strokeWidth={5} strokeDasharray="10 12" strokeLinecap="round" />
      {sh > 2 ? (
        <g opacity={shDim}>
          <path d={hillPath(sh, SH_X0, SH_X1, SH_BASE)} fill="#2b1a14" stroke={RED} strokeWidth={3} />
          <g clipPath="url(#e64shame)">
            {Array.from({length: rows}, (_, r) => (
              <text key={r} x={SH_X0 - 40 + (r % 2) * 30} y={SH_BASE - 14 - r * 44} fontFamily={SUB} fontSize={30} fill={RED_HOT} fillOpacity={0.85}>
                {'mình tệ  ·  mình tệ  ·  mình tệ  ·  mình tệ'}
              </text>
            ))}
          </g>
        </g>
      ) : null}
      {sp > 0 ? <Glow d={D(part(SCOLD_PTS, sp))} color={RED_HOT} w={7} o={shDim} /> : null}
      {kp > 0 ? <Glow d={D(part(KIND_PTS, kp))} color={GOLD} w={8} /> : null}
      <Head p={head} f={f} color={kindLit ? '#fff6dc' : sp > 0 ? '#ffd2c8' : '#fff6dc'} />
      <text x={330} y={1250} textAnchor="middle" fontFamily={SUB} fontSize={36} fill={GOLD} opacity={pathsO * (kindLit ? 1 : 0.75)}>Tha cho mình</text>
      <text x={830} y={1515} textAnchor="middle" fontFamily={SUB} fontSize={36} fill={RED_HOT} opacity={pathsO * shDim}>Tự mắng mình</text>
    </svg>
  );
};

/* ============================== SFX ============================== */
type Fx = [number, string, number];
const FX: Fx[] = [];
FX.push([MID(1) - 0.1, 'whoosh', 0.35]);
LOOP_T.forEach(([a], k) => FX.push([a, 'curl', 0.35], [a + 0.05, 'pop', 0.35 + 0.05 * k]));
[MID(4), MID(7), MID(10)].forEach((x, k) => FX.push([x, 'thud', 0.5 + 0.1 * k], [x, 'impact', 0.3 + 0.1 * k]));
[BAR(5), BAR(8)].forEach((x) => FX.push([x, 'tick', 0.45]));
FX.push([BAR(12), 'impact', 0.9], [BAR(12), 'tick', 0.5], [BAR(13), 'hiss', 0.45]);
[BAR(13), MID(13), BAR(14), MID(14)].forEach((x, i) => FX.push([x, 'heart', 0.4 + 0.06 * i]));
FX.push([BAR(15), 'suck', 0.5], [DROP - 2.1, 'riser', 0.45], [DROP, 'impact', 1], [DROP, 'stamp', 0.9], [BAR(17), 'stamp', 0.8], [BAR(17), 'thud', 0.45]);
FX.push([BAR(18), 'paper', 0.6], [BAR(20) - 0.2, 'whoosh', 0.35], [GX, 'impact', 0.6], [GX + 0.02, 'snap', 0.4], [BAR(23), 'stamp', 0.7]);
FX.push([BAR(24.5) - 0.2, 'whoosh', 0.35], [BAR(24.5), 'tick', 0.45], [MID(25), 'snap', 0.6], [MID(26), 'thud', 0.5], [MID(27), 'thud', 0.55], [BAR(28) + 0.3, 'heal', 0.5], [MID(30), 'impact', 0.85], [MID(30), 'stamp', 0.8]);
FX.push([BAR(32) - 0.2, 'whoosh', 0.35], [BAR(32) + 0.3, 'pop', 0.5], [MID(33), 'click', 0.8]);
SHRINK.forEach((x, i) => FX.push([x, 'snap', 0.45], [x, 'thud', 0.25 + 0.03 * i]));
FX.push([BAR(37), 'shimmer', 0.4], [BAR(39), 'sunrise', 0.55], [BAR(41), 'impact', 0.55], [BAR(41), 'shimmer', 0.4], [BAR(43), 'ding', 0.4]);
const GLOBAL = new Set(['paper', 'type', 'boing', 'error', 'snip', 'magic', 'confetti', 'shake', 'question']);
const LOCAL63 = new Set(['bksp', 'glass', 'hiss', 'hum', 'whistle']);
const fxSrc = (n: string) => (LOCAL63.has(n) ? `audio/ep63-on/sfx/${n}.wav` : GLOBAL.has(n) ? `audio/sfx/${n}.wav` : `audio/ep60-troi-sap/sfx/${n}.wav`);

/* ============================== CHỮ TRÊN MÀN ============================== */
const CAPS: [number, number, string, number?][] = [
  [-2, BAR(2) - 0.12, 'Việc cần làm. Hay 【5 phút】 lướt?'],
  [BAR(2) + 0.05, BAR(5) - 0.12, 'Báo cáo nộp thứ Sáu. Mở máy… mở 【TikTok】 trước đã.'],
  [BAR(5) + 0.05, BAR(8) - 0.12, 'Ăn trưa xong đã. 【40 phút】.'],
  [BAR(8) + 0.05, BAR(12) - 0.12, 'Dọn bàn cho gọn rồi làm. 【3 tiếng】.'],
  [BAR(12) + 0.05, BAR(15) - 0.12, '01:00. Không còn 【ngã rẽ】 nào.'],
  [DROP, BAR(17) - 0.1, 'Bạn không 【lười】.', 84],
  [BAR(17), BAR(18) - 0.1, 'Bạn đang 【né một cảm giác】.', 76],
  [BAR(20) + 0.05, BAR(21.5) - 0.12, 'Đầu học kỳ: 【nhẹ nhõm hơn】.'],
  [BAR(21.5) + 0.05, BAR(23) - 0.12, 'Cuối kỳ: căng hơn, 【ốm nhiều hơn】, điểm thấp hơn.'],
  [BAR(23), BAR(24.5) - 0.12, 'Đường dễ không miễn phí. Nó 【tính tiền sau】.', 70],
  [BAR(24.5) + 0.05, BAR(26.5) - 0.12, 'Lần sau phải 【nghiêm với mình】 hơn.'],
  [BAR(26.5) + 0.05, BAR(28) - 0.12, 'Đường đó vòng ngược về 【chỗ cũ】.'],
  [BAR(28) + 0.05, BAR(30) - 0.12, 'Ai 【tha cho mình】 sau lần hoãn đầu, kỳ sau hoãn ít hơn.'],
  [BAR(30), BAR(32) - 0.12, 'Mắng mình chỉ làm con dốc 【cao thêm】.', 70],
  [BAR(32) + 0.05, BAR(35) - 0.12, 'Không cần làm xong. Chỉ cần 【mở file】.'],
  [BAR(35) + 0.05, BAR(38.5) - 0.12, 'Bắt đầu nhỏ đến mức 【không né được】.'],
  [BAR(39) + 0.05, BAR(41) - 0.12, 'Trì hoãn không phải chuyện quản lý 【thời gian】.'],
  [BAR(41), BAR(43) - 0.12, 'Là chuyện quản lý 【cảm xúc】.', 78],
  [BAR(43) + 0.05, END + 1, 'Việc bạn đang để mai là gì?'],
];

/* ============================== CAMERA ============================== */
const CAM: [number, number, number, number][] = [
  [0, 1.12, 540, 1150],
  [BAR(11), 0.98, 600, 1180],
  [BAR(12), 1.1, 430, 1120],
  [BAR(15), 1.5, 300, 1000],
  [BAR(18), 1.2, 420, 1100],
  [BAR(32), 1.12, 540, 1150],
  [BAR(39), 1.05, 540, 1080],
];
const cam = (t: number) => {
  let [, s, x, y] = CAM[0];
  for (let i = 1; i < CAM.length; i++) {
    const k = prog(t, CAM[i][0], CAM[i][0] + (i === 3 ? 1.6 : 0.9));
    s = lerp(s, CAM[i][1], k);
    x = lerp(x, CAM[i][2], k);
    y = lerp(y, CAM[i][3], k);
  }
  return {s, x, y};
};

/* ============================== MAIN ============================== */
export const Ep64TriHoan: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;

  // rung + punch
  const hits: [number, number][] = [[MID(4), 6], [MID(7), 8], [MID(10), 11], [BAR(12), 16], [DROP, 30], [BAR(17), 14], [GX, 12], [BAR(23), 10], [MID(25), 8], [MID(27), 8], [MID(30), 18], [MID(33), 8], ...SHRINK.map((x) => [x, 5] as [number, number]), [BAR(41), 14]];
  let shake = 0;
  let punch = 0;
  for (const [h, amp] of hits) {
    const d = f - S(h);
    if (d >= 0 && d < 16) {
      shake += Math.exp(-d / 3.5) * amp;
      punch += Math.exp(-d / 3) * amp * 0.0028;
    }
  }
  if (t >= BAR(13) && t < BAR(15)) shake += 1.5 + 4 * lin(t, BAR(13), BAR(15));
  const sx = shake * Math.sin(f * 2.3);
  const sy = shake * Math.cos(f * 3.1) * 0.7;

  // thế giới ngã rẽ 1
  const w1 = Math.max(f < S(BAR(19)) ? 1 - ease((f - S(BAR(18))) / 18) * 0.75 : Math.max(0, 0.25 * (1 - ease((f - S(BAR(19.6))) / 8))), io(f, S(BAR(32)), S(END + 2), 9));
  const h = hillH(t);
  const bright = io(f, S(BAR(15)), S(BAR(18.5)), 14);
  const shame = t >= BAR(31);
  const roadO = 1 - ease((t - BAR(12)) / 0.5) * (t < BAR(32) ? 1 : 1);
  const loopO = t < BAR(12) ? 1 : t < BAR(39) ? 0.18 : 0.18 + 0.82 * prog(t, BAR(39), BAR(40));
  const morph = prog(t, BAR(39), BAR(41));

  let head: Pt = P;
  for (let k = 0; k < 3; k++) {
    const [a, b] = LOOP_T[k];
    if (t >= a && t < b) head = at(LOOPS[k], lin(t, a, b));
  }
  // 01:00 leo vách
  const climb: Pt[] = [];
  const cp = lin(t, BAR(13), BAR(15));
  if (t >= BAR(12.6) && t < BAR(19)) {
    const N = 60;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const [x, y] = hillPt(h, 1 - 0.44 * u);
      const jit = (rnd(i * 3.7) - 0.5) * 34;
      climb.push([x + 26 + jit, y - 10 + jit * 0.5]);
    }
  }
  if (t >= BAR(12.6) && t < BAR(15)) head = climb.length ? at(climb, cp) : head;
  // lối thứ ba
  const tiny: Pt[] = [
    [P[0], BASE],
    [P[0] - 18, BASE - 60],
    [P[0] - 40, BASE - 92],
  ];
  const tp = prog(t, BAR(33), MID(33));
  const over = lin(t, BAR(37), BAR(38.6));
  if (t >= BAR(32) && t < BAR(39)) {
    head = P;
    if (tp > 0) head = at(tiny, tp);
    if (over > 0) {
      const path: Pt[] = [tiny[2], [500, BASE - 20], ...Array.from({length: 30}, (_, i) => hillPt(h, 1 - i / 29)), [60, BASE - 140]];
      head = at(path, over);
    }
  }
  if (t >= BAR(39)) head = at(STRAIGHT, morph);

  const c = cam(t);
  const camT = `translate(${W / 2}px, ${H / 2}px) scale(${c.s.toFixed(4)}) translate(${-c.x}px, ${-c.y}px)`;

  const loopLabel = (() => {
    for (let k = 2; k >= 0; k--) {
      const a = LOOP_T[k][0];
      if (t >= a && t < BAR(12)) {
        const r = 170 + 26 * k;
        const d = f - S(a);
        return {k, x: 770 + 12 * k, y: BASE - r, pop: 1 + 0.4 * Math.exp(-d / 4)};
      }
    }
    return null;
  })();

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <FilBg f={f} w={W} h={H} tone="warm" glow={[50, 60]} strength={t >= DROP && t < BAR(18) ? 1.3 : 0.95} />
      <AbsoluteFill style={{transform: `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) scale(${1 + punch})`}}>
        {/* thế giới ngã rẽ 1 (có camera) */}
        {w1 > 0.001 ? (
          <AbsoluteFill style={{opacity: w1, transform: camT, transformOrigin: '0 0'}}>
            <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              <Glow
                d={D([
                  [540, 1900],
                  P,
                ])}
                w={6}
              />
              <Hill f={f} t={t} h={h} bright={bright} shame={shame} o={t >= BAR(39) ? 0.5 : 1} />
              <Falling t={t} />
              <Glow
                d={D([
                  P,
                  [500, BASE],
                ])}
                w={5}
                o={0.8}
              />
              {roadO > 0.01 ? (
                <g opacity={roadO}>
                  <path d={`M${P[0]},${BASE} L1000,${BASE}`} stroke={GOLD_DIM} strokeWidth={5} />
                  <text x={760} y={BASE + 62} textAnchor="middle" fontFamily={SUB} fontSize={32} letterSpacing={4} fill={GOLD}>LƯỚT 5 PHÚT</text>
                </g>
              ) : null}
              {LOOPS.map((pts, k) => {
                const [a, b] = LOOP_T[k];
                const p = lin(t, a, b);
                if (p <= 0) return null;
                const shown = morph > 0 ? pts.map((q, i) => [lerp(q[0], STRAIGHT[i][0], morph), lerp(q[1], STRAIGHT[i][1], morph)] as Pt) : part(pts, p);
                const age = t >= b && t < BAR(12) ? 0.55 : 1;
                return <Glow key={k} d={D(shown)} w={morph > 0 ? 6 : 5} o={loopO * age} />;
              })}
              {climb.length && t < BAR(19) ? <Glow d={D(part(climb, cp))} color={RED_HOT} w={6} o={1 - ease((t - BAR(15.5)) / 0.6)} /> : null}
              {t >= BAR(32) && t < BAR(39) ? (
                <>
                  <Glow d={D(tiny)} w={6} o={ease((t - BAR(32) - 0.3) / 0.3)} dash={tp > 0 ? undefined : '8 10'} />
                  {over > 0 ? <Glow d={D(part([tiny[2], [500, BASE - 20], ...Array.from({length: 30}, (_, i) => hillPt(h, 1 - i / 29)), [60, BASE - 140]], over))} w={6} /> : null}
                </>
              ) : null}
              {t < BAR(15.5) || t >= BAR(32) ? <Head p={head} f={f} color={t >= BAR(12.6) && t < BAR(15) ? '#ffd2c8' : '#fff6dc'} /> : null}
            </svg>
            {loopLabel ? <div style={{position: 'absolute', left: loopLabel.x, top: loopLabel.y, transform: `translate(-50%,-50%) scale(${loopLabel.pop.toFixed(3)})`, fontFamily: DISP, fontWeight: 900, fontSize: 64, color: loopLabel.k === 2 ? RED_HOT : GOLD, textShadow: '0 0 24px rgba(0,0,0,0.9)', opacity: 1 - ease((t - BAR(11.6)) / 0.4)}}>{LOOP_LABEL[loopLabel.k]}</div> : null}
            {t >= BAR(32) && t < BAR(38) ? <Pill x={P[0] - 40} y={BASE - 150} text="chỉ mở file" o={io(f, S(BAR(32) + 0.3), S(BAR(38)), 6)} pop={1 + 0.3 * Math.exp(-Math.max(0, f - S(BAR(32) + 0.3)) / 4)} /> : null}
          </AbsoluteFill>
        ) : null}

        <MoodCard f={f} />
        <Chart f={f} t={t} />
        <Fork2 f={f} t={t} />
        {t >= BAR(28) && t < BAR(30.2) ? <Pill x={W / 2} y={480} text="119 sinh viên năm nhất · 2 kỳ thi giữa kỳ" o={io(f, S(BAR(28) + 0.2), S(BAR(30)), 6)} size={28} /> : null}

        <Clock f={f} text="9:00" part="SÁNG" a={0} b={BAR(5)} first />
        <Clock f={f} text="14:00" part="CHIỀU" a={BAR(5)} b={BAR(8)} />
        <Clock f={f} text="21:00" part="TỐI" a={BAR(8)} b={BAR(12)} />
        <Clock f={f} text="01:00" part="ĐÊM" a={BAR(12)} b={BAR(15)} />
        <Clock f={f} text="8:00" part="HÔM SAU" a={BAR(24.5)} b={BAR(32)} />
        <Clock f={f} text="9:00" part="SÁNG" a={BAR(39)} b={END + 2} />

        {CAPS.map(([a, b, tx, sz], i) => <Caption key={i} f={f} a={a} b={b} text={tx} size={sz} top={sz && sz > 60 ? 230 : 250} />)}
        <Foot f={f} a={BAR(18) + 0.3} b={BAR(20)} text="Sirois & Pychyl, 2013 · Social and Personality Psychology Compass" />
        <Foot f={f} a={BAR(20) + 0.5} b={BAR(24.5)} text="Tice & Baumeister, 1997 · sinh viên đại học, cả học kỳ · Psychological Science" />
        <Foot f={f} a={BAR(28) + 0.3} b={BAR(32)} text="Wohl, Pychyl & Bennett, 2010 · Personality and Individual Differences" />
        {f >= S(DROP) && f < S(DROP) + 12 ? <AbsoluteFill style={{background: `rgba(255,60,30,${0.35 * Math.exp(-(f - S(DROP)) / 4)})`, mixBlendMode: 'screen'}} /> : null}
      </AbsoluteFill>
      <FilGrain opacity={0.07} />

      <Sequence from={0} durationInFrames={S(DROP) + 2}>
        <Audio src={staticFile('audio/ep60-troi-sap/bgm.wav')} volume={(fr) => Math.round(20 * (fr < S(BAR(15)) ? 0.9 : 0.5)) / 20} />
      </Sequence>
      <Sequence from={S(DROP)} durationInFrames={S(4 * BARLEN) + 12}>
        <Audio src={staticFile('audio/ep60-troi-sap/bgm.wav')} startFrom={S(93.36)} volume={(fr) => Math.round(20 * (1 - clamp01((fr - (S(4 * BARLEN) - 2)) / 14))) / 20} />
      </Sequence>
      <Sequence from={S(BAR(20)) - 2} durationInFrames={S(END - BAR(20)) + 4}>
        <Audio
          src={staticFile('audio/ep60-troi-sap/bgm.wav')}
          startFrom={S(DROP)}
          volume={(fr) => {
            const g = fr < 12 ? fr / 12 : 1;
            const lift = interpolate(fr, [S(BAR(39) - BAR(20)), S(BAR(40) - BAR(20))], [0.85, 1.15], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const tail = 1 - clamp01((fr - (S(END - BAR(20)) - 90)) / 90);
            return Math.round(g * lift * tail * 20) / 20;
          }}
        />
      </Sequence>
      {FX.map(([tm, nm, g], i) => (
        <Sequence key={i} from={Math.max(0, S(tm))} durationInFrames={S(nm === 'riser' ? 2.4 : 2.5)}>
          <Audio src={staticFile(fxSrc(nm))} volume={g * 0.85} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
