/**
 * Ep67 EN — The Sunday Scaries (9:16, 1080×1920, ~101 s, series music 112 BPM).
 * Metaphor: an office-tower shadow ("Monday") creeps across the living-room floor hour by hour,
 * swallows the evening, then shrinks back once real Monday turns out to be just Monday.
 * Stick-figure style (series rule 2026-10-27): glowing ivory line figures on warm dark rooms.
 */
import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile, useCurrentFrame} from 'remotion';
import BEATS_DATA from './beats.json';

export const FPS = 30;
export const DURATION = 101 * FPS;
const BEATS = BEATS_DATA as number[];
const fr = (s: number) => Math.round(s * FPS);
/** bar k start (sec): downbeats are BEATS[4k-1] */
const BAR = (k: number) => (k <= 0 ? 0 : BEATS[4 * k - 1]);
/** nearest beat to t (sec) */
const NB = (t: number) => BEATS.reduce((a, b) => (Math.abs(b - t) < Math.abs(a - t) ? b : a), BEATS[0]);

const FONT = "'Ep67 Sub', sans-serif";
if (typeof document !== 'undefined') {
  const h = delayRender('ep67 font');
  new FontFace('Ep67 Sub', `url(${staticFile('fonts/ep58/BeVietnamPro-ExtraBold.ttf')})`).load().then((l) => { document.fonts.add(l); continueRender(h); }).catch(() => continueRender(h));
}

const C = {
  ivory: '#f4efe4',
  dim: 'rgba(244,239,228,0.5)',
  faint: 'rgba(244,239,228,0.28)',
  red: '#e2483a',
  redHot: '#ff6b55',
  amber: '#f2c66d',
  sun: '#ffd89a',
  tv: '#8fb8ff',
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const easeIO = (t: number) => { const x = clamp01(t); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rnd = (i: number, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
/** keyframed value: [[sec, value], ...] */
const kf = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let j = 1; j < keys.length; j++) if (t <= keys[j][0]) return lerp(keys[j - 1][1], keys[j][1], easeIO((t - keys[j - 1][0]) / (keys[j][0] - keys[j - 1][0])));
  return keys[keys.length - 1][1];
};

/* ===================== timeline ===================== */
const T = {
  s1: 0, s2: BAR(2), s3: BAR(4), s4: BAR(6), s5: BAR(8), s6: BAR(11), s7: BAR(16), s8: BAR(19),
  s9: BAR(24), s10: BAR(27), s11: BAR(30), s12: BAR(33), s13: BAR(38), s14: BAR(43), end: 101,
};
const HIT = {
  stamp: BEATS[4 * 8], // music accent 17.53s (was one beat late)
  x1: NB(30.0), x2: NB(31.1), x3: NB(32.2),
  alarm: NB(43.0),
  shatter: T.s9,
  exist: BEATS[4 * 25 + 1],
  bigger: BEATS[4 * 34 + 1],
  close: BEATS[4 * 39 + 1],
};

type Cue = {a: number; b: number; t: string; y?: number; size?: number};
const CUES: Cue[] = [
  {a: -1, b: T.s2 - 0.2, t: 'Sunday, 10:00 AM. The 【best day】 of the week.'},
  {a: T.s2 + 0.1, b: T.s3 - 0.2, t: '12:30 PM.'},
  {a: T.s3 + 0.1, b: T.s4 - 0.2, t: '2:00 PM.'},
  {a: T.s4 + 0.1, b: T.s5 - 0.2, t: "3:00 PM. Part of you 【already left】."},
  {a: HIT.stamp + 1.6, b: T.s6 - 0.3, t: "That's when it starts for most people.", y: 1180},
  {a: T.s6 + 0.1, b: 28.6, t: '6:00 PM. Nothing has happened yet.'},
  {a: 28.8, b: T.s7 - 0.2, t: 'But in your head, Monday already went wrong. 【Three times】.'},
  {a: T.s7 + 0.1, b: T.s8 - 0.2, t: "9:00 PM. You're 【not really there】."},
  {a: T.s8 + 0.1, b: 45.7, t: "11:47 PM. Sunday's gone."},
  {a: 46.0, b: T.s9 - 0.3, t: 'You never got the evening.'},
  {a: T.s10 + 0.1, b: T.s11 - 0.2, t: 'Psychologists call it 【anticipatory anxiety】: living a day before it arrives.'},
  {a: T.s11 + 0.1, b: T.s11 + 3.6, t: 'Then Monday comes.'},
  {a: T.s11 + 4.1, b: T.s12 - 0.2, t: "And it's... just Monday."},
  {a: T.s12 + 0.1, b: 75.6, t: 'The dread was 【bigger than the day】.'},
  {a: 75.8, b: T.s13 - 0.2, t: 'It usually is.'},
  {a: T.s13 + 0.1, b: 85.0, t: "At 3:54, write tomorrow's 3 things. 【Close the notebook】."},
  {a: 85.2, b: 88.3, t: 'Put one good thing on Monday morning.'},
  {a: 88.5, b: T.s14 - 0.2, t: 'When it creeps in: "That\'s tomorrow. 【I\'m here】."'},
  {a: T.s14 + 0.1, b: 97.5, t: 'Monday will come. Let it come 【on Monday】.'},
  {a: 97.8, b: 101.5, t: 'What time do yours start?', y: 700, size: 70},
];

/* camera punches (sec, strength) */
const PUNCH: [number, number][] = [
  [HIT.stamp, 1], [HIT.x1, 0.45], [HIT.x2, 0.55], [HIT.x3, 0.7], [HIT.alarm, 0.4],
  [HIT.shatter, 1.2], [HIT.exist, 1], [HIT.bigger, 0.8], [HIT.close, 0.6],
];

/* ===================== subtitles ===================== */
const Subs: React.FC<{t: number}> = ({t}) => {
  const c = CUES.find((q) => t >= q.a && t < q.b);
  if (!c) return null;
  const o = 1 - clamp01((t - (c.b - 0.25)) / 0.25);
  const words: {w: string; hi: boolean}[] = [];
  let hi = false;
  c.t.split(' ').forEach((raw) => {
    let w = raw;
    const open = w.includes('【');
    const close = w.includes('】');
    if (open) hi = true;
    w = w.replace(/[【】]/g, '');
    words.push({w, hi});
    if (close) hi = false;
  });
  const size = c.size ?? 62;
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: c.y ?? 250, textAlign: 'center', fontFamily: FONT, fontSize: size, lineHeight: 1.36, opacity: o}}>
      {words.map((w, i) => {
        const at = c.a < 0 ? -1 : c.a + i * 0.11;
        const v = ease((t - at) / 0.27);
        const dt = Math.max(0, t - at);
        const bounce = w.hi && v >= 1 ? 1 + 0.3 * Math.exp(-dt / 0.17) * Math.cos(dt * 18) : 1;
        return (
          <React.Fragment key={i}>
            {i > 0 ? ' ' : ''}
            <span style={{display: 'inline-block', whiteSpace: 'nowrap', opacity: v, transform: `translateY(${((1 - v) * 30).toFixed(1)}px) scale(${((0.85 + 0.15 * v) * bounce).toFixed(3)})`, filter: v < 1 ? `blur(${((1 - v) * 9).toFixed(1)}px)` : undefined, color: w.hi ? C.red : C.ivory, textShadow: w.hi ? '0 0 26px rgba(226,72,58,0.75), 0 3px 8px #000' : '0 3px 8px #000, 0 2px 22px rgba(0,0,0,0.9)'}}>
              {w.w}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ===================== stick figure engine (floor-relative: feet at y=0) ===================== */
type P = [number, number];
type PD = {head: P; neck: P; hip: P; armL: [P, P]; armR: [P, P]; legL: [P, P]; legR: [P, P]};
const SITLEGS = {legL: [[78, -169], [82, 0]] as [P, P], legR: [[86, -161], [94, 0]] as [P, P]};
const SH = (o: Partial<PD>, base: PD): PD => ({...base, ...o});
const STAND: PD = {head: [0, -330], neck: [0, -292], hip: [0, -150], armL: [[-28, -222], [-36, -160]], armR: [[28, -222], [36, -160]], legL: [[-16, -76], [-22, 0]], legR: [[16, -76], [22, 0]]};
const SIT: PD = {head: [8, -355], neck: [4, -315], hip: [0, -165], armL: [[22, -245], [58, -205]], armR: [[30, -243], [66, -201]], ...SITLEGS};
const PO = {
  stand: STAND,
  standLook: SH({head: [14, -322], neck: [6, -290]}, STAND),
  standPhone: SH({head: [12, -324], armL: [[22, -232], [44, -272]], armR: [[26, -228], [48, -268]]}, STAND),
  standHead: SH({head: [0, -322], armL: [[-56, -296], [-22, -352]], armR: [[56, -296], [22, -352]]}, STAND),
  standWave: SH({armR: [[46, -300], [60, -362]]}, STAND),
  standReach: SH({head: [6, -334], armR: [[34, -318], [52, -404]]}, STAND),
  standStretch: SH({head: [0, -336], armL: [[-30, -370], [-24, -444]], armR: [[30, -370], [24, -444]]}, STAND),
  sit: SIT,
  sitBack: SH({head: [-16, -350], neck: [-10, -312], armL: [[-34, -250], [-14, -200]], armR: [[-28, -252], [-6, -202]]}, SIT),
  sitMug: SH({armR: [[40, -235], [62, -277]]}, SIT),
  sitSip: SH({head: [12, -352], armR: [[46, -262], [30, -326]]}, SIT),
  sitStretch: SH({head: [0, -362], neck: [0, -320], armL: [[-30, -385], [-22, -455]], armR: [[30, -385], [22, -455]]}, SIT),
  sitPhone: SH({head: [16, -347], neck: [6, -313], armL: [[34, -239], [58, -277]], armR: [[40, -235], [64, -273]]}, SIT),
  sitSlump: SH({head: [40, -318], neck: [20, -294], armL: [[44, -228], [74, -176]], armR: [[50, -224], [80, -172]]}, SIT),
  sitTV: SH({head: [-6, -353], neck: [2, -315], armL: [[18, -247], [40, -195]], armR: [[24, -243], [52, -191]]}, SIT),
  sitShrug: SH({head: [14, -352], armL: [[-50, -262], [-84, -302]], armR: [[64, -262], [96, -302]]}, SIT),
  cheers: SH({armR: [[46, -277], [78, -315]]}, SIT),
};
const LIE: PD = {head: [-190, -8], neck: [-150, -2], hip: [0, 0], armL: [[-80, 8], [-20, 10]], armR: [[-84, 4], [-26, 6]], legL: [[90, 2], [180, 4]], legR: [[92, -4], [184, -2]]};
const mixP = (a: P, b: P, u: number): P => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const mix = (a: PD, b: PD, u: number): PD => ({
  head: mixP(a.head, b.head, u), neck: mixP(a.neck, b.neck, u), hip: mixP(a.hip, b.hip, u),
  armL: [mixP(a.armL[0], b.armL[0], u), mixP(a.armL[1], b.armL[1], u)], armR: [mixP(a.armR[0], b.armR[0], u), mixP(a.armR[1], b.armR[1], u)],
  legL: [mixP(a.legL[0], b.legL[0], u), mixP(a.legL[1], b.legL[1], u)], legR: [mixP(a.legR[0], b.legR[0], u), mixP(a.legR[1], b.legR[1], u)],
});
/** pose keyframes: [[sec, pose], ...], each transition takes `dur` sec ending at the key time */
const poseAt = (t: number, keys: [number, PD][], dur = 0.35): PD => {
  let cur = keys[0][1];
  for (let j = 1; j < keys.length; j++) {
    const u = easeIO((t - (keys[j][0] - dur)) / dur);
    if (u <= 0) break;
    cur = mix(cur, keys[j][1], u);
  }
  return cur;
};
/** walk cycle, facing right; ph in cycles */
const walk = (ph: number, base: PD = STAND): PD => {
  const s = Math.sin(ph * Math.PI * 2);
  const c = Math.cos(ph * Math.PI * 2);
  const b = -Math.abs(s) * 7;
  return {
    ...base,
    head: [base.head[0] + 10, base.head[1] + b], neck: [base.neck[0] + 6, base.neck[1] + b], hip: [0, -150 + b],
    legL: [[22 * s + 6, -76 + b / 2], [44 * s, -Math.max(0, c) * 22]],
    legR: [[-22 * s + 6, -76 + b / 2], [-44 * s, -Math.max(0, -c) * 22]],
    armL: base === STAND ? [[-20 * s, -222 + b], [-40 * s, -164 + b]] : base.armL,
    armR: base === STAND ? [[20 * s, -222 + b], [40 * s, -164 + b]] : base.armR,
  };
};
/** walk path: x moves between keys; returns {x, pose, flip} */
const walker = (t: number, path: [number, number][], standPose: PD = STAND, speed = 1.7) => {
  let x = path[0][1];
  let moving = false;
  let dir = 1;
  for (let j = 1; j < path.length; j++) {
    const [t0, x0] = path[j - 1];
    const [t1, x1] = path[j];
    if (t >= t0 && t < t1) {
      if (x1 !== x0) { moving = true; dir = Math.sign(x1 - x0); }
      x = lerp(x0, x1, (t - t0) / (t1 - t0));
      break;
    }
    if (t >= t1) { x = x1; if (x1 !== x0) dir = Math.sign(x1 - x0); }
  }
  return {x, pose: moving ? walk(t * speed, standPose) : standPose, flip: dir < 0, moving};
};

type Prop = 'mug' | 'phone' | undefined;
const Stick: React.FC<{x: number; y: number; pose: PD; s?: number; t: number; flip?: boolean; color?: string; dash?: boolean; op?: number; eyesOpen?: boolean; seed?: number; bob?: number; lying?: boolean; prop?: Prop; propLit?: boolean}> = ({x, y, pose, s = 1, t, flip, color = C.ivory, dash, op = 1, eyesOpen, seed = 0, bob = 0, lying, prop, propLit}) => {
  const p = pose;
  const br = lying ? 0 : Math.sin(t * 2.2 + seed) * 2.2 + bob;
  const up = (q: P): P => [q[0], q[1] + (q[1] < p.hip[1] - 40 ? br : 0)];
  const pts = (a: P, b: P, c: P) => `M${a[0].toFixed(1)},${a[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)} L${c[0].toFixed(1)},${c[1].toFixed(1)}`;
  const sh: P = [lerp(p.neck[0], p.hip[0], 0.16), lerp(p.neck[1], p.hip[1], 0.16)];
  const head = up(p.head);
  const hand = up(p.armR[1]);
  return (
    <g transform={`translate(${x.toFixed(1)},${y}) scale(${flip ? -s : s},${s})`} opacity={op}>
      <g stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ? '14 14' : undefined} filter="url(#glow)">
        <path d={`M${up(p.neck)[0]},${up(p.neck)[1]} L${p.hip[0]},${p.hip[1]}`} />
        <path d={pts(up(sh), up(p.armL[0]), up(p.armL[1]))} />
        <path d={pts(up(sh), up(p.armR[0]), up(p.armR[1]))} />
        <path d={pts(p.hip, p.legL[0], p.legL[1])} />
        <path d={pts(p.hip, p.legR[0], p.legR[1])} />
        <circle cx={head[0]} cy={head[1]} r={36} fill="rgba(20,14,10,0.9)" />
      </g>
      {prop === 'mug' && <rect x={hand[0] - 12} y={hand[1] - 30} width={26} height={30} rx={5} fill="none" stroke={C.amber} strokeWidth={5} />}
      {prop === 'phone' && <rect x={hand[0] - 10} y={hand[1] - 34} width={20} height={34} rx={4} fill={propLit ? C.ivory : 'rgba(0,0,0,0.6)'} stroke={C.ivory} strokeWidth={4} />}
      {!lying && !dash && <circle cx={head[0] + 16} cy={head[1] - 4} r={4.5} fill={color} />}
      {lying && eyesOpen && <circle cx={head[0] + 4} cy={head[1] - 14} r={5} fill={color} />}
      {lying && !eyesOpen && <path d={`M${head[0] - 6},${head[1] - 14} q8,6 16,0`} stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" />}
    </g>
  );
};

const Defs: React.FC = () => (
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="5" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22" /></filter>
    <filter id="smoke" x="-50%" y="-50%" width="200%" height="200%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="4" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="60" />
      <feGaussianBlur stdDeviation="6" />
    </filter>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#ffd89a" stopOpacity="0.32" />
      <stop offset="100%" stopColor="#ffd89a" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="redHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#e2483a" stopOpacity="0.55" />
      <stop offset="100%" stopColor="#e2483a" stopOpacity="0" />
    </radialGradient>
  </defs>
);

/* ===================== Monday's shadow (the episode's device) ===================== */
/** shadow length 0..1 across the whole episode */
const shadowLen = (t: number) => kf(t, [[8.4, 0], [9.6, 0.05], [12.6, 0.07], [16.8, 0.42], [23.4, 0.55], [33.5, 0.82], [40, 0.95], [51, 1], [63.7, 1], [68, 0.6], [74, 0.1], [80.7, 0.04], [91, 0.02], [96, 0]]);
const TowerShadow: React.FC<{t: number; len: number; night?: boolean}> = ({t, len, night}) => {
  if (len <= 0.002) return null;
  const flick = (i: number) => (rnd(i, 3) > 0.42 ? 1 : 0.18) * (0.8 + 0.2 * Math.sin(t * 1.3 + i));
  // floor part: grows from the window base toward the viewer
  const L = 620 * clamp01(len / 0.5);
  const wins: React.ReactNode[] = [];
  let k = 0;
  for (let r = 0; r < 16; r++) for (let c = 0; c < 5; c++) {
    k++;
    const yy = 30 + r * 38;
    if (yy > L - 24) continue;
    wins.push(<rect key={k} x={26 + c * 52} y={yy} width={28} height={18} fill={C.red} opacity={flick(k) * (night ? 0.85 : 0.6)} />);
  }
  return (
    <g transform="matrix(1.25,0,0.62,0.78,135,1468)">
      <path d={`M0,0 L290,0 L290,${Math.max(0, L - 50)} L230,${Math.max(0, L - 50)} L230,${L} L60,${L} L60,${Math.max(0, L - 50)} L0,${Math.max(0, L - 50)} Z`} fill="#040201" fillOpacity={0.93} stroke={C.red} strokeOpacity={0.6} strokeWidth={3} />
      {wins}
    </g>
  );
};
/** wall part: the tower silhouette rises behind the couch once the floor is covered */
const WallTower: React.FC<{t: number; len: number; night?: boolean}> = ({t, len, night}) => {
  const g = clamp01((len - 0.45) / 0.55);
  if (g <= 0.002) return null;
  const h = 760 * g;
  const x0 = 470;
  const w = 560;
  const top = 1465 - h;
  const wins: React.ReactNode[] = [];
  let k = 100;
  for (let r = 0; r < 18; r++) for (let c = 0; c < 8; c++) {
    k++;
    const yy = top + 50 + r * 42;
    if (yy > 1440) continue;
    wins.push(<rect key={k} x={x0 + 34 + c * 64} y={yy} width={30} height={20} fill={C.red} opacity={(rnd(k, 3) > 0.45 ? 1 : 0.15) * (night ? 0.8 : 0.55) * (0.8 + 0.2 * Math.sin(t + k))} />);
  }
  return (
    <g>
      <path d={`M${x0},1465 L${x0},${top + 60} L${x0 + 90},${top + 60} L${x0 + 90},${top} L${x0 + w - 90},${top} L${x0 + w - 90},${top + 60} L${x0 + w},${top + 60} L${x0 + w},1465 Z`} fill="#040201" fillOpacity={0.95} stroke={C.red} strokeOpacity={0.6} strokeWidth={4} />
      <line x1={x0 + w / 2} y1={top} x2={x0 + w / 2} y2={top - 70 * g} stroke={C.red} strokeOpacity={0.7} strokeWidth={4} />
      {wins}
    </g>
  );
};

/* ===================== sets ===================== */
type Tone = 'day' | 'noon' | 'dusk' | 'night' | 'lamp' | 'morning';
const BG: Record<Tone, [string, string]> = {
  day: ['#2b2016', '#120c08'],
  noon: ['#30231a', '#130d09'],
  dusk: ['#3a1c12', '#110908'],
  night: ['#141320', '#07070c'],
  lamp: ['#2a1c12', '#0d0907'],
  morning: ['#26241f', '#0f0d0b'],
};
const Backdrop: React.FC<{tone: Tone}> = ({tone}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 62%, ${BG[tone][0]} 0%, ${BG[tone][1]} 70%)`}} />
);

const Clock: React.FC<{x: number; y: number; h: number; m: number; r?: number; red?: boolean}> = ({x, y, h, m, r = 46, red}) => {
  const ma = (m / 60) * 360;
  const ha = ((h % 12) / 12) * 360 + m / 2;
  const col = red ? C.red : C.ivory;
  return (
    <g transform={`translate(${x},${y})`} stroke={col} fill="none" strokeLinecap="round" filter="url(#glow)">
      <circle r={r} strokeWidth={5} />
      <line x1={0} y1={0} x2={Math.sin((ha * Math.PI) / 180) * r * 0.5} y2={-Math.cos((ha * Math.PI) / 180) * r * 0.5} strokeWidth={6} />
      <line x1={0} y1={0} x2={Math.sin((ma * Math.PI) / 180) * r * 0.78} y2={-Math.cos((ma * Math.PI) / 180) * r * 0.78} strokeWidth={4} />
    </g>
  );
};

/** living room: window left, couch right, coffee table, floor */
const Room: React.FC<{t: number; tone: Tone; clock: [number, number]; sun?: number; children?: React.ReactNode; shadow?: number; tv?: boolean; lamp?: boolean; lampOn?: number}> = ({t, tone, clock, sun = 0, children, shadow = 0, tv, lamp, lampOn = 1}) => {
  const night = tone === 'night' || tone === 'lamp';
  const line = night ? 'rgba(244,239,228,0.55)' : 'rgba(244,239,228,0.75)';
  const skyCol = tone === 'dusk' ? '#ff8a4c' : night ? '#1c2440' : '#ffd89a';
  return (
    <g transform="translate(540,1465) scale(1.12) translate(-540,-1465)">
      {/* floor */}
      <line x1={0} y1={1465} x2={1080} y2={1465} stroke={line} strokeWidth={4} />
      {/* window with city */}
      <g>
        <rect x={130} y={860} width={300} height={430} fill={skyCol} opacity={night ? 0.5 : 0.22} />
        {/* skyline through window */}
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={140 + i * 58} y={1290 - (80 + rnd(i, 7) * 220)} width={50} height={80 + rnd(i, 7) * 220} fill="#0a0705" opacity={0.85} />
        ))}
        <rect x={130} y={860} width={300} height={430} fill="none" stroke={line} strokeWidth={6} />
        <line x1={280} y1={860} x2={280} y2={1290} stroke={line} strokeWidth={4} />
        <line x1={130} y1={1075} x2={430} y2={1075} stroke={line} strokeWidth={4} />
      </g>
      {/* sunlight patch */}
      {sun > 0 && <polygon points="130,1465 430,1465 980,1720 560,1720" fill={C.sun} opacity={0.2 * sun} />}
      {/* lamp */}
      {lamp && (
        <g>
          <circle cx={960} cy={1080} r={240} fill="url(#halo)" opacity={lampOn} />
          <path d="M920,1060 L1000,1060 L980,1010 L940,1010 Z" fill="none" stroke={C.amber} strokeWidth={5} filter="url(#glow)" />
          <line x1={960} y1={1060} x2={960} y2={1465} stroke={line} strokeWidth={4} />
        </g>
      )}
      <Clock x={620} y={940} h={clock[0]} m={clock[1]} />
      <WallTower t={t} len={shadow} night={night} />
      {/* couch */}
      <g stroke={line} strokeWidth={6} fill="rgba(0,0,0,0.25)" strokeLinejoin="round">
        <path d="M560,1300 L560,1180 Q560,1150 590,1150 L900,1150 Q930,1150 930,1180 L930,1300" />
        <path d="M530,1300 L960,1300 L960,1400 L530,1400 Z" />
        <line x1={560} y1={1400} x2={560} y2={1465} />
        <line x1={930} y1={1400} x2={930} y2={1465} />
      </g>
      {/* coffee table */}
      <g stroke={line} strokeWidth={5} fill="none">
        <line x1={300} y1={1390} x2={470} y2={1390} />
        <line x1={320} y1={1390} x2={320} y2={1465} />
        <line x1={450} y1={1390} x2={450} y2={1465} />
      </g>
      {tv && (
        <g>
          <polygon points="470,1150 140,1000 140,1600" fill={C.tv} opacity={0.08 + 0.03 * Math.sin(t * 7)} />
          <rect x={40} y={1180} width={120} height={80} fill={C.tv} opacity={0.5 + 0.2 * Math.sin(t * 9)} stroke={line} strokeWidth={4} />
        </g>
      )}
      <TowerShadow t={t} len={shadow} night={night} />
      {children}
    </g>
  );
};

/* ===================== scene wrapper ===================== */
const Scene: React.FC<{t: number; a: number; b: number; children: React.ReactNode; zoom?: [number, number]; origin?: string; first?: boolean}> = ({t, a, b, children, zoom = [1, 1.05], origin = '50% 70%', first}) => {
  const fi = 0.35;
  if (t < a - (first ? 0 : fi) || t >= b + fi) return null;
  const vin = first ? 1 : clamp01((t - a + fi) / (fi * 2));
  const vout = 1 - clamp01((t - b + fi) / (fi * 2));
  const v = Math.min(vin, vout);
  const z = lerp(zoom[0], zoom[1], easeIO((t - a) / Math.max(0.1, b - a)));
  const dx = (1 - ease(vin)) * 260 - (1 - vout) * (1 - vout) * 300;
  return (
    <AbsoluteFill style={{opacity: v, filter: v < 0.999 ? `blur(${((1 - v) * 14).toFixed(1)}px)` : undefined, transform: `translateX(${dx.toFixed(1)}px) scale(${z.toFixed(4)})`, transformOrigin: origin}}>
      {children}
    </AbsoluteFill>
  );
};
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
    <Defs />
    {children}
  </svg>
);

/* red smoke "imagined Monday" cloud */
const Smoke: React.FC<{t: number; x: number; y: number; s: number; op?: number; burst?: number}> = ({t, x, y, s, op = 1, burst = 0}) => {
  if (s <= 0.01 || op <= 0.01) return null;
  const blobs = Array.from({length: 9}, (_, i) => {
    const a = (i / 9) * Math.PI * 2 + t * 0.3;
    const rr = 90 + 30 * Math.sin(t * 1.4 + i);
    const out = burst * (300 + rnd(i, 5) * 300);
    return <circle key={i} cx={Math.cos(a) * (rr + out)} cy={Math.sin(a) * rr * 0.6 - 20 - out * 0.4} r={(70 + rnd(i, 2) * 40) * (1 - burst * 0.6)} fill={C.red} opacity={0.5 * (1 - burst)} />;
  });
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={op}>
      <circle r={260} fill="url(#redHalo)" />
      <g filter="url(#smoke)">{blobs}</g>
    </g>
  );
};

/* phone notification card */
const NotifCard: React.FC<{t: number; at: number; x: number; y: number}> = ({t, at, x, y}) => {
  const v = ease((t - at) / 0.35);
  if (v <= 0) return null;
  const sc = 0.6 + 0.4 * v + 0.06 * Math.exp(-Math.max(0, t - at - 0.35) * 6);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 620, transform: `translate(-50%,0) scale(${sc.toFixed(3)})`, opacity: v, background: 'rgba(30,24,20,0.92)', border: '2px solid rgba(244,239,228,0.35)', borderRadius: 34, padding: '26px 34px', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', fontFamily: FONT}}>
      <div style={{color: C.dim, fontSize: 26, letterSpacing: 2}}>CALENDAR · TOMORROW</div>
      <div style={{color: C.ivory, fontSize: 46, marginTop: 8}}>Mon 9:00 AM</div>
      <div style={{color: C.red, fontSize: 40, marginTop: 4}}>Team sync</div>
    </div>
  );
};

/* ===================== main ===================== */
export const Ep67enSunday: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const sl = shadowLen(t);

  // camera punch + shake
  let punch = 0;
  let shake = 0;
  let flash = 0;
  PUNCH.forEach(([at, k]) => {
    const d = t - at;
    if (d >= 0 && d < 0.6) {
      const e = Math.exp(-d * 9);
      punch += 0.075 * k * e;
      shake += 22 * k * e;
      flash += 0.35 * k * Math.exp(-d * 14);
    }
  });
  const sx = Math.sin(f * 2.7) * shake;
  const sy = Math.cos(f * 3.1) * shake;

  return (
    <AbsoluteFill style={{background: '#0a0705', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) scale(${(1 + punch).toFixed(4)})`}}>
        {/* S1 10:00 AM couch + coffee */}
        <Scene t={t} a={T.s1} b={T.s2} first>
          <Backdrop tone="day" />
          <Svg>
            <Room t={t} tone="day" clock={[10, 0 + t * 2]} sun={1}>
              <Stick x={700} y={1465} t={t} prop="mug" pose={poseAt(t, [[0, PO.sitMug], [1.2, PO.sitSip], [2.1, PO.sitSip], [2.6, PO.sitMug], [3.3, PO.sitStretch], [3.9, PO.sitBack]], 0.45)} />

            </Room>
          </Svg>
        </Scene>

        {/* S2 12:30 brunch */}
        <Scene t={t} a={T.s2} b={T.s3} zoom={[1.02, 1.07]}>
          <Backdrop tone="noon" />
          <Svg>
            <circle cx={540} cy={1250} r={520} fill="url(#halo)" />
            <line x1={0} y1={1465} x2={1080} y2={1465} stroke="rgba(244,239,228,0.6)" strokeWidth={4} />
            <g stroke="rgba(244,239,228,0.8)" strokeWidth={6} fill="none">
              <line x1={300} y1={1330} x2={780} y2={1330} />
              <line x1={540} y1={1330} x2={540} y2={1465} />
              <line x1={470} y1={1465} x2={610} y2={1465} />
            </g>
            {(() => {
              const cl = NB(T.s2 + 2.15);
              const lift = clamp01((t - (cl - 0.5)) / 0.5) * (1 - clamp01((t - cl - 0.6) / 0.4));
              const laugh = (i: number) => Math.abs(Math.sin(t * 9 + i)) * 6;
              return (
                <>
                  <Stick x={300} y={1485} pose={mix(PO.sit, PO.cheers, lift)} t={t} seed={1} bob={-laugh(1)} />
                  <Stick x={780} y={1485} pose={mix(PO.sit, PO.cheers, lift)} t={t} flip seed={2} bob={-laugh(2)} />
                  {(() => { const w = walker(t, [[T.s2, 1150], [T.s2 + 4.3, -100]], STAND, 1.6); return <Stick x={w.x} y={1465} pose={w.pose} flip={w.flip} s={0.55} t={t} seed={3} op={0.55} />; })()}
                  {t > cl && t < cl + 0.5 && <circle cx={540} cy={1140} r={30 + (t - cl) * 120} fill="none" stroke={C.amber} strokeWidth={4} opacity={1 - (t - cl) * 2} />}
                  <g stroke={C.amber} strokeWidth={4} fill="none"><path d="M380,1310 l-8,-30 h24 z" /><path d="M700,1310 l-8,-30 h24 z" /></g>
                </>
              );
            })()}
          </Svg>
        </Scene>

        {/* S3 2:00 PM phone buzz */}
        <Scene t={t} a={T.s3} b={T.s4}>
          <Backdrop tone="day" />
          <Svg>
            <Room t={t} tone="day" clock={[14, (t - T.s3) * 3]} sun={0.85} shadow={sl}>
              {(() => {
                const b = T.s3;
                const picked = t > b + 1.25;
                const jolt = t > b + 0.9 && t < b + 1.3 ? -18 * Math.sin(((t - b - 0.9) / 0.4) * Math.PI) : 0;
                return (
                  <>
                    {!picked && <rect x={380} y={1360} width={34} height={20} rx={4} fill={t > b + 0.9 ? C.ivory : 'rgba(0,0,0,0.6)'} stroke={C.ivory} strokeWidth={4} transform={`rotate(${t > b + 0.9 ? Math.sin(t * 80) * 10 : 0} 397 1370)`} />}
                    <Stick x={700} y={1465} t={t} bob={jolt} prop={picked ? 'phone' : undefined} propLit pose={poseAt(t, [[b, PO.sitBack], [b + 1.0, PO.sitBack], [b + 1.25, SH({armR: [[-10, -225], [-60, -205]]}, PO.sit)], [b + 1.7, PO.sitPhone], [b + 2.8, PO.sitPhone], [b + 3.8, SH({armL: [[44, -228], [74, -176]], armR: [[50, -224], [72, -200]]}, PO.sitSlump)]], 0.4)} />
                  </>
                );
              })()}
            </Room>
          </Svg>
          <NotifCard t={t} at={T.s3 + 1.0} x={540} y={560} />
        </Scene>

        {/* S4 3:00 PM shadow crawls, ghost walks out */}
        <Scene t={t} a={T.s4} b={T.s5}>
          <Backdrop tone="day" />
          <Svg>
            <Room t={t} tone="day" clock={[15, (t - T.s4) * 3]} sun={lerp(0.8, 0.5, clamp01((t - T.s4) / 4))} shadow={sl}>
              {(() => {
                const b = T.s4;
                if (t < b + 0.9) return <Stick x={700} y={1465} t={t} prop="phone" pose={poseAt(t, [[b - 1, PO.sitSlump], [b + 0.9, PO.standPhone]], 0.7)} />;
                const w = walker(t, [[b + 0.9, 700], [b + 2.9, 380], [99, 380]], PO.standPhone, 1.5);
                const look = clamp01((t - b - 3.0) / 0.6);
                return <Stick x={w.x} y={1465} t={t} prop="phone" flip pose={w.moving ? w.pose : mix(PO.standPhone, PO.standLook, look)} />;
              })()}
              {(() => {
                // the dashed "part of you" keeps walking out into the shadow
                const g = clamp01((t - (T.s4 + 2.4)) / 1.6);
                if (g <= 0) return null;
                return <Stick x={lerp(380, 160, g)} y={1465} pose={walk(t * 1.5)} t={t} dash flip op={0.6 * (1 - clamp01((g - 0.7) / 0.3))} />;
              })()}
            </Room>
          </Svg>
        </Scene>

        {/* S5 3:54 PM stamp */}
        <Scene t={t} a={T.s5} b={T.s6} zoom={[1, 1.03]}>
          <Backdrop tone="day" />
          <Svg>
            <g opacity={lerp(1, 0.35, clamp01((t - HIT.stamp + 0.3) / 0.3))}>
              <Room t={t} tone="day" clock={[15, 54]} sun={0.45} shadow={sl}>
                <Stick x={380} y={1465} t={t} prop="phone" flip={t < HIT.stamp} bob={t >= HIT.stamp && t < HIT.stamp + 0.3 ? -14 * Math.sin(((t - HIT.stamp) / 0.3) * Math.PI) : 0} pose={poseAt(t, [[T.s5, PO.standLook], [HIT.stamp, PO.standLook], [HIT.stamp + 0.25, PO.standPhone], [HIT.stamp + 2.5, PO.standPhone], [HIT.stamp + 3.5, PO.standLook]], 0.25)} />
              </Room>
            </g>
          </Svg>
          {t >= HIT.stamp - 0.12 && (() => {
            const d = t - HIT.stamp;
            const v = clamp01((d + 0.12) / 0.12);
            const sc = d < 0 ? lerp(2.4, 1, v) : 1 + 0.08 * Math.exp(-d * 7) * Math.cos(d * 30);
            return (
              <div style={{position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', fontFamily: FONT, fontSize: 230, color: C.red, letterSpacing: -4, opacity: v, transform: `scale(${sc.toFixed(3)}) rotate(-4deg)`, textShadow: '0 0 60px rgba(226,72,58,0.8), 0 6px 14px #000'}}>
                3:54 <span style={{fontSize: 120}}>PM</span>
              </div>
            );
          })()}
          {t > HIT.stamp + 1.6 && <div style={{position: 'absolute', left: 60, right: 60, top: 1830, textAlign: 'center', fontFamily: FONT, fontSize: 24, color: C.faint, opacity: clamp01((t - HIT.stamp - 1.6) / 0.5)}}>Talker Research survey of 2,000 Americans, 2024</div>}
        </Scene>

        {/* S6 6:00 PM imagined Monday, counter */}
        <Scene t={t} a={T.s6} b={T.s7} zoom={[1, 1.06]} origin="60% 55%">
          <Backdrop tone="dusk" />
          <Svg>
            <Room t={t} tone="dusk" clock={[18, (t - T.s6) * 2]} sun={0.25} shadow={sl}>
              {(() => {
                const b = T.s6;
                const w = walker(t, [[b, 380], [b + 0.4, 380], [b + 2.2, 820], [b + 2.8, 820], [b + 4.6, 300], [b + 5.0, 300], [HIT.x1 - 0.1, 640], [HIT.x2 - 0.1, 640], [HIT.x3 - 0.3, 640], [99, 640]], PO.standPhone, 1.9);
                const fl = [HIT.x1, HIT.x2, HIT.x3].reduce((a, h) => a + (t >= h && t < h + 0.35 ? -16 * Math.sin(((t - h) / 0.35) * Math.PI) : 0), 0);
                const head = clamp01((t - HIT.x3 + 0.05) / 0.2);
                return <Stick x={w.x} y={1465} t={t} flip={w.flip} bob={fl} prop={head > 0.5 ? undefined : 'phone'} propLit pose={w.moving ? w.pose : mix(PO.standPhone, PO.standHead, head)} />;
              })()}
              {(() => {
                const grow = ease((t - (T.s6 + 2.5)) / 2.5);
                const pulse = [HIT.x1, HIT.x2, HIT.x3].reduce((a, h) => a + (t >= h ? 0.18 * Math.exp(-(t - h) * 5) : 0), 0);
                const step = t >= HIT.x3 ? 3 : t >= HIT.x2 ? 2 : t >= HIT.x1 ? 1 : 0;
                return (
                  <>
                    <Smoke t={t} x={720} y={900} s={(0.6 + 0.25 * step / 3 + pulse) * grow} />
                    {grow > 0.3 && (
                      <g opacity={clamp01((grow - 0.3) / 0.4)} fill={C.ivory} fontFamily={FONT}>
                        <text x={560} y={860} fontSize={40} fill={C.ivory}>47 unread</text>
                        <text x={720} y={960} fontSize={44} fill={C.ivory}>DEADLINE</text>
                        {/* angry boss face */}
                        <g transform="translate(640,770)" stroke={C.ivory} strokeWidth={5} fill="none">
                          <circle r={34} />
                          <path d="M-18,-12 l12,6 M18,-12 l-12,6 M-14,16 q14,-10 28,0" strokeLinecap="round" />
                        </g>
                      </g>
                    )}
                    {step > 0 && (
                      <text x={540} y={1640} textAnchor="middle" fontFamily={FONT} fontSize={86} fill={C.red} filter="url(#glow)">
                        {'Monday ×' + step}
                      </text>
                    )}
                  </>
                );
              })()}
            </Room>
          </Svg>
        </Scene>

        {/* S7 9:00 PM TV, not there */}
        <Scene t={t} a={T.s7} b={T.s8}>
          <Backdrop tone="night" />
          <Svg>
            <Room t={t} tone="night" clock={[21, (t - T.s7) * 2]} shadow={sl} tv>
              {(() => {
                const b = T.s7;
                return <Stick x={700} y={1465} t={t} flip prop="phone" propLit pose={poseAt(t, [[b, PO.sitTV], [b + 1.2, PO.sitTV], [b + 1.5, PO.sitPhone], [b + 2.6, PO.sitPhone], [b + 2.9, PO.sitTV], [b + 3.8, PO.sitTV], [b + 4.1, PO.sitPhone], [b + 5.6, PO.sitPhone], [b + 5.9, PO.sitSlump]], 0.3)} />;
              })()}
              <Smoke t={t} x={640} y={1000} s={0.35} op={0.8} />
            </Room>
          </Svg>
        </Scene>

        {/* S8 11:47 PM bed, eyes open, alarm */}
        <Scene t={t} a={T.s8} b={T.s9} zoom={[1, 1.08]} origin="50% 65%">
          <Backdrop tone="night" />
          <Svg>
            <line x1={0} y1={1465} x2={1080} y2={1465} stroke="rgba(244,239,228,0.45)" strokeWidth={4} />
            {/* window full of tower */}
            <rect x={680} y={760} width={300} height={420} fill="#1c2440" opacity={0.5} />
            <rect x={720} y={800} width={200} height={380} fill="#050302" />
            {Array.from({length: 24}, (_, i) => <rect key={i} x={740 + (i % 4) * 44} y={830 + Math.floor(i / 4) * 56} width={22} height={18} fill={C.red} opacity={rnd(i, 9) > 0.4 ? 0.7 : 0.15} />)}
            <rect x={680} y={760} width={300} height={420} fill="none" stroke="rgba(244,239,228,0.55)" strokeWidth={6} />
            {/* bed */}
            <g stroke="rgba(244,239,228,0.6)" strokeWidth={6} fill="rgba(0,0,0,0.3)">
              <path d="M120,1300 L120,1180 M120,1330 L900,1330 L900,1400 L120,1400 Z" />
              <line x1={140} y1={1400} x2={140} y2={1465} /><line x1={880} y1={1400} x2={880} y2={1465} />
            </g>
            {(() => {
              const flips = [T.s8 + 1.2, HIT.alarm + 0.6, T.s8 + 5.0, T.s8 + 6.8, T.s8 + 8.4];
              let side = 1;
              let sx = 1;
              flips.forEach((ft) => { const u = easeIO((t - ft) / 0.35); if (u > 0) { const target = -side; sx = lerp(side, target, u); if (u >= 1) side = target; } });
              if (Math.abs(sx) < 0.15) sx = Math.sign(sx || 1) * 0.15;
              return <Stick x={460} y={1310} pose={LIE} lying t={t} eyesOpen s={1.05 * Math.abs(sx)} flip={sx < 0} />;
            })()}
            <path d="M420,1305 Q600,1270 860,1300 L860,1330 L420,1330 Z" fill="rgba(244,239,228,0.08)" stroke="rgba(244,239,228,0.5)" strokeWidth={4} />
            {/* alarm clock */}
            {(() => {
              const d = t - HIT.alarm;
              const j = d >= 0 && d < 0.8 ? Math.sin(d * 70) * 6 * (1 - d / 0.8) : 0;
              return (
                <g transform={`translate(${980 + j},1430)`}>
                  <rect x={-70} y={-40} width={140} height={70} rx={14} fill="rgba(0,0,0,0.6)" stroke={C.red} strokeWidth={4} />
                  <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontSize={40} fill={C.red} filter="url(#glow)">7:00</text>
                </g>
              );
            })()}
            <Smoke t={t} x={320} y={1080} s={0.4 + 0.25 * clamp01((t - T.s8) / 8)} op={0.85} />
          </Svg>
        </Scene>

        {/* S9 key line: smoke shatters */}
        <Scene t={t} a={T.s9} b={T.s10} zoom={[1.05, 1]}>
          <Backdrop tone="night" />
          <Svg>
            <Smoke t={t} x={540} y={1250} s={1.3} burst={ease((t - T.s9) / 0.8)} op={1 - clamp01((t - T.s9 - 0.6) / 0.6)} />
            {Array.from({length: 40}, (_, i) => {
              const d = t - T.s9;
              if (d < 0 || d > 2.5) return null;
              const a = rnd(i, 1) * Math.PI * 2;
              const sp = 300 + rnd(i, 2) * 700;
              return <circle key={i} cx={540 + Math.cos(a) * sp * ease(d / 1.2)} cy={1250 + Math.sin(a) * sp * ease(d / 1.2) + d * d * 120} r={3 + rnd(i, 3) * 6} fill={C.redHot} opacity={1 - d / 2.5} />;
            })}
          </Svg>
          {(() => {
            const l1 = T.s9 + 0.05;
            const l2 = BAR(25) - 0.55;
            const l3 = HIT.exist;
            const line = (txt: React.ReactNode, at: number, top: number, size: number, red = false) => {
              const d = t - at;
              if (d < -0.1) return null;
              const v = clamp01((d + 0.1) / 0.15);
              const sc = d < 0.05 ? lerp(1.6, 1, v) : 1 + 0.06 * Math.exp(-d * 8);
              return <div style={{position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: FONT, fontSize: size, lineHeight: 1.2, color: red ? C.red : C.ivory, opacity: v, transform: `scale(${sc.toFixed(3)})`, textShadow: red ? '0 0 50px rgba(226,72,58,0.85), 0 5px 12px #000' : '0 4px 12px #000'}}>{txt}</div>;
            };
            return (
              <>
                {line("You didn't lose Sunday to Monday.", l1, 520, 70)}
                {line('You lost it to a Monday', l2, 760, 70)}
                {line("that doesn't exist.", l3, 900, 110, true)}
              </>
            );
          })()}
        </Scene>

        {/* S10 anticipatory anxiety: head with orbiting Monday */}
        <Scene t={t} a={T.s10} b={T.s11} zoom={[1, 1.06]} origin="50% 55%">
          <Backdrop tone="night" />
          <Svg>
            <circle cx={540} cy={1150} r={420} fill="url(#halo)" opacity={0.7} />
            <g stroke={C.ivory} strokeWidth={9} fill="none" filter="url(#glow)" strokeLinecap="round">
              <circle cx={540} cy={1100} r={170} fill="rgba(20,14,10,0.9)" />
              <path d="M540,1270 L540,1560 M540,1330 L400,1520 M540,1330 L680,1520" />
            </g>
            <circle cx={605} cy={1080} r={9} fill={C.ivory} />
            {/* calendar page "MON" inside the head */}
            <g transform="translate(500,1090)">
              <rect x={-60} y={-55} width={120} height={110} rx={10} fill="none" stroke={C.red} strokeWidth={5} />
              <rect x={-60} y={-55} width={120} height={30} fill={C.red} opacity={0.8} />
              <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontSize={40} fill={C.red}>MON</text>
            </g>
            {/* orbit ring: tomorrow pulled into today */}
            <ellipse cx={540} cy={1100} rx={300} ry={90} fill="none" stroke={C.red} strokeWidth={4} strokeDasharray="10 16" strokeDashoffset={-t * 60} opacity={0.75} transform="rotate(-14 540 1100)" />
            {(() => {
              const a = t * 1.8;
              const ox = 540 + Math.cos(a) * 300 * Math.cos(-0.244) - Math.sin(a) * 90 * Math.sin(-0.244);
              const oy = 1100 + Math.cos(a) * 300 * Math.sin(-0.244) + Math.sin(a) * 90 * Math.cos(-0.244);
              return <circle cx={ox} cy={oy} r={16} fill={C.redHot} filter="url(#glow)" />;
            })()}
          </Svg>
        </Scene>

        {/* S11 real Monday morning: just Monday */}
        <Scene t={t} a={T.s11} b={T.s12}>
          <Backdrop tone="morning" />
          <Svg>
            <circle cx={540} cy={1250} r={560} fill="url(#halo)" opacity={0.8} />
            <line x1={0} y1={1465} x2={1080} y2={1465} stroke="rgba(244,239,228,0.7)" strokeWidth={4} />
            {/* desk */}
            <g stroke="rgba(244,239,228,0.8)" strokeWidth={6} fill="none">
              <line x1={200} y1={1300} x2={620} y2={1300} /><line x1={220} y1={1300} x2={220} y2={1465} /><line x1={600} y1={1300} x2={600} y2={1465} />
              <rect x={300} y={1180} width={170} height={110} rx={8} /><line x1={385} y1={1290} x2={385} y2={1300} />
            </g>
            <Clock x={540} y={920} h={9} m={15} r={50} />
            {(() => {
              const b = T.s11;
              if (t < b + 1.5) { const w = walker(t, [[b - 1, 40], [b + 1.3, 560], [99, 560]], STAND, 1.7); return <Stick x={w.x} y={1465} t={t} pose={w.moving ? w.pose : STAND} flip={false} prop="mug" />; }
              return <Stick x={560} y={1465} t={t} flip prop="mug" pose={poseAt(t, [[b + 1.5, STAND], [b + 1.9, PO.sitMug], [b + 3.9, PO.sitMug], [b + 4.2, PO.sitShrug], [b + 5.2, PO.sitShrug], [b + 5.6, PO.sitSip]], 0.35)} />;
            })()}
            <Stick x={860} y={1465} pose={poseAt(t, [[T.s11, STAND], [T.s11 + 1.7, PO.standWave], [T.s11 + 3.4, PO.standWave], [T.s11 + 3.8, STAND]], 0.3)} bob={t > T.s11 + 1.7 && t < T.s11 + 3.4 ? Math.sin(t * 14) * 4 : 0} t={t} flip seed={4} />
          </Svg>
          {t > T.s11 + 1.8 && (() => {
            const v = ease((t - T.s11 - 1.8) / 0.35);
            return <div style={{position: 'absolute', left: 560, top: 1000, width: 420, padding: '20px 26px', borderRadius: 30, background: 'rgba(244,239,228,0.92)', color: '#1a120c', fontFamily: FONT, fontSize: 36, lineHeight: 1.25, opacity: v, transform: `scale(${(0.7 + 0.3 * v).toFixed(3)})`, transformOrigin: '80% 100%'}}>How was your weekend?</div>;
          })()}
          {t > T.s11 + 3.4 && (() => {
            const v = ease((t - T.s11 - 3.4) / 0.35);
            return (
              <div style={{position: 'absolute', left: 120, top: 760, padding: '16px 26px', borderRadius: 24, background: 'rgba(30,24,20,0.9)', border: '2px solid rgba(244,239,228,0.35)', fontFamily: FONT, fontSize: 34, color: C.ivory, opacity: v, transform: `translateY(${((1 - v) * 20).toFixed(1)}px)`}}>
                Team sync · 15 min <span style={{color: C.amber}}>✓ done</span>
              </div>
            );
          })()}
        </Scene>

        {/* S12 the dread was bigger than the day: shadow shrinks */}
        <Scene t={t} a={T.s12} b={T.s13}>
          <Backdrop tone="day" />
          <Svg>
            <Room t={t} tone="day" clock={[18, 0]} sun={lerp(0.2, 0.9, clamp01((t - T.s12) / 4))} shadow={Math.max(sl, 0.04)}>
              {(() => {
                const b = T.s12;
                if (t < b + 6.5) return <Stick x={700} y={1465} t={t} pose={poseAt(t, [[b, PO.sitSlump], [b + 1.6, PO.sitSlump], [b + 2.4, PO.sit], [HIT.bigger, PO.sit], [HIT.bigger + 0.5, PO.stand], [b + 5.2, PO.standStretch], [b + 6.5, STAND]], 0.5)} />;
                const w = walker(t, [[b + 6.5, 700], [b + 8.6, 400], [99, 400]], STAND, 1.5);
                return <Stick x={w.x} y={1465} t={t} pose={w.pose} flip />;
              })()}
            </Room>
            {t >= HIT.bigger - 0.1 && (() => {
              const d = t - HIT.bigger;
              return <circle cx={540} cy={1500} r={60 + Math.max(0, d) * 900} fill="none" stroke={C.red} strokeWidth={6} opacity={Math.max(0, 0.8 - d)} />;
            })()}
          </Svg>
        </Scene>

        {/* S13 notebook tips */}
        <Scene t={t} a={T.s13} b={T.s14} zoom={[1, 1.04]}>
          <Backdrop tone="lamp" />
          <Svg>
            <circle cx={540} cy={1250} r={520} fill="url(#halo)" />
            {(() => {
              const shut = ease((t - HIT.close + 0.12) / 0.12);
              const open = 1 - shut;
              const lines = ['Mon:', '1. Reply to Sam', '2. Slides v2', '3. Book dentist'];
              return (
                <g>
                  {/* left page (cover when closed) */}
                  <rect x={160} y={1000} width={380} height={520} rx={12} fill="rgba(244,239,228,0.06)" stroke="rgba(244,239,228,0.7)" strokeWidth={5} />
                  {/* right page swings over */}
                  <g transform={`translate(540,0) scale(${lerp(-1, 1, open).toFixed(3)},1)`}>
                    <rect x={0} y={1000} width={380} height={520} rx={12} fill={open < 0.5 ? '#2a1c12' : 'rgba(244,239,228,0.06)'} stroke="rgba(244,239,228,0.7)" strokeWidth={5} />
                  </g>
                  {open > 0.5 && lines.map((ln, i) => {
                    const at = T.s13 + 0.6 + i * 0.55;
                    const v = clamp01((t - at) / 0.45);
                    return (
                      <g key={i}>
                        <clipPath id={`cl${i}`}><rect x={580} y={1040 + i * 90} width={330 * v} height={80} /></clipPath>
                        <text x={590} y={1100 + i * 90} fontFamily={FONT} fontSize={i === 0 ? 40 : 34} fill={i === 0 ? C.amber : C.ivory} clipPath={`url(#cl${i})`}>{ln}</text>
                      </g>
                    );
                  })}
                  {/* pen */}
                  {open > 0.5 && <line x1={820} y1={1440} x2={900} y2={1340} stroke={C.amber} strokeWidth={10} strokeLinecap="round" />}
                  {shut > 0.9 && t < 85 && <text x={350} y={1290} textAnchor="middle" fontFamily={FONT} fontSize={44} fill={C.amber}>MONDAY</text>}
                </g>
              );
            })()}
            {/* tip 2: morning coffee + music note */}
            {t > 85.1 && (() => {
              const v = ease((t - 85.1) / 0.4);
              return (
                <g opacity={v * (1 - clamp01((t - 88.2) / 0.3))} transform={`translate(0,${(1 - v) * 30})`}>
                  <rect x={0} y={900} width={1080} height={700} fill="#0d0907" opacity={0.85} />
                  <g stroke={C.amber} strokeWidth={7} fill="none" filter="url(#glow)" strokeLinecap="round">
                    <path d="M440,1180 L460,1360 L600,1360 L620,1180 Z" />
                    <path d="M620,1220 q60,0 50,60 q-10,40 -60,40" />
                    <path d="M500,1150 q14,-24 0,-48 M560,1150 q14,-24 0,-48" opacity={0.7} />
                  </g>
                  <g fill={C.ivory}><circle cx={720} cy={1100} r={16} /><rect x={732} y={1020} width={6} height={80} /></g>
                </g>
              );
            })()}
            {/* tip 3: shadow at the door, figure turns back */}
            {t > 88.4 && (
              <g opacity={ease((t - 88.4) / 0.4)}>
                <rect x={0} y={900} width={1080} height={700} fill="#0d0907" opacity={0.92} />
                <WallTower t={t} len={0.62} night />
                {(() => { const w = walker(t, [[88.4, 220], [89.6, 440], [89.95, 440], [91.4, 120]], STAND, 1.7); return <Stick x={w.x} y={1465} t={t} pose={w.pose} flip={w.flip} />; })()}
                <path d="M680,1180 q70,-30 120,10" stroke={C.amber} strokeWidth={5} fill="none" opacity={0.7} />
              </g>
            )}
          </Svg>
        </Scene>

        {/* S14 evening calm, sleeping */}
        <Scene t={t} a={T.s14} b={T.end + 1} zoom={[1, 1.06]} origin="50% 70%">
          <Backdrop tone="lamp" />
          <Svg>
            <Room t={t} tone="lamp" clock={[22, 30]} lamp lampOn={1 - 0.7 * clamp01((t - T.s14 - 1.5) / 0.2)} shadow={sl}>
              {(() => {
                const b = T.s14;
                const swap = clamp01((t - b - 2.6) / 0.4);
                return (
                  <>
                    {swap < 1 && <Stick x={880} y={1465} t={t} op={1 - swap} pose={poseAt(t, [[b, STAND], [b + 1.0, PO.standReach], [b + 1.9, PO.standReach], [b + 2.3, STAND]], 0.4)} />}
                    {swap > 0 && <Stick x={760} y={1295} pose={LIE} lying t={t} s={0.9} op={swap} />}
                  </>
                );
              })()}
              <path d="M650,1290 Q760,1250 920,1285 L920,1300 L650,1300 Z" fill="rgba(242,198,109,0.12)" stroke="rgba(242,198,109,0.6)" strokeWidth={4} />
              {[0, 1, 2].map((i) => {
                const ph = (t * 0.4 + i / 3) % 1;
                return <text key={i} x={600 + ph * 60 + i * 10} y={1180 - ph * 140} fontFamily={FONT} fontSize={30 + ph * 20} fill={C.ivory} opacity={0.7 * (1 - ph)}>z</text>;
              })}
            </Room>
          </Svg>
          {/* end card overlay */}
          {t > 97.6 && <AbsoluteFill style={{background: '#0a0705', opacity: 0.55 * ease((t - 97.6) / 0.6)}} />}
        </Scene>

        <Subs t={t} />
      </AbsoluteFill>

      {flash > 0.01 && <AbsoluteFill style={{background: '#ffd89a', opacity: Math.min(0.5, flash), mixBlendMode: 'screen'}} />}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)', pointerEvents: 'none'}} />

      <Audio src={staticFile('audio/ep67en-sunday/bgm.wav')} volume={0.75} />
      {SFX.map(([at, n, v], i) => (
        <Sequence key={i} from={Math.max(0, fr(at))} durationInFrames={fr(5)}>
          <Audio src={staticFile(`audio/ep67en-sunday/sfx/${n}.wav`)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/* [sec, file, volume] */
const SFX: [number, string, number][] = [
  [NB(T.s2 + 2.15) - 0.01, 'foley-glass-touch', 0.9],
  [T.s2 - 0.25, 'whoosh-medium-soft', 0.5],
  [T.s3 - 0.25, 'whoosh-medium-soft', 0.5],
  [T.s3 + 0.9, 'phone-vibrate-table', 0.9],
  [T.s3 + 1.0, 'notification-message-in-soft', 0.8],
  [T.s4 - 0.25, 'whoosh-medium-soft', 0.5],
  [T.s4 + 0.3, 'bass-rumble-medium', 0.7],
  [T.s5 - 0.25, 'whoosh-slow-soft', 0.5],
  [HIT.stamp - 0.01, 'cinematic-slam-big', 1],
  [HIT.stamp - 0.01, 'impact-heavy-hard', 0.8],
  [T.s6 - 0.3, 'whoosh-slow-soft', 0.5],
  [T.s6 + 2.5, 'riser-2s-soft', 0.5],
  [HIT.x1 - 0.01, 'boom-hit-medium', 0.7],
  [HIT.x2 - 0.01, 'boom-hit-medium', 0.8],
  [HIT.x3 - 0.01, 'boom-hit-medium', 1],
  [T.s7 - 0.3, 'whoosh-slow-soft', 0.5],
  [T.s8 - 0.3, 'whoosh-slow-soft', 0.5],
  [T.s8 + 0.4, 'time-clock', 0.5],
  [HIT.alarm - 0.01, 'time-alarm', 0.45],
  [HIT.shatter - 0.05, 'boom-drop-strong', 1],
  [HIT.shatter - 0.01, 'appear-burst', 0.8],
  [HIT.exist - 0.01, 'cinematic-drum-massive', 1],
  [T.s10 - 0.3, 'whoosh-slow-soft', 0.5],
  [T.s10 + 0.4, 'shimmer-long-soft', 0.5],
  [T.s11 - 0.3, 'whoosh-medium-soft', 0.5],
  [T.s11 + 1.8, 'pop-medium-bubble', 0.8],
  [T.s11 + 3.4, 'writing-pen-tick', 0.8],
  [T.s12 - 0.3, 'whoosh-medium-soft', 0.5],
  [HIT.bigger - 0.01, 'cinematic-slam-big', 0.9],
  [T.s13 - 0.3, 'whoosh-slow-soft', 0.5],
  [T.s13 + 0.6, 'writing-pen-write', 0.7],
  [HIT.close - 0.01, 'props-book-close', 1],
  [HIT.close - 0.01, 'impact-heavy-hard', 0.5],
  [85.1, 'pop-medium-bubble', 0.6],
  [88.4, 'whoosh-medium-soft', 0.5],
  [T.s14 - 0.3, 'whoosh-slow-soft', 0.5],
  [T.s14 + 0.3, 'shimmer-long-soft', 0.45],
];
