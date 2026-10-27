import React from 'react';

/* Stick-figure engine for the EN series (feet at y=0, facing right). */
export type P = [number, number];
export type PD = {head: P; neck: P; hip: P; armL: [P, P]; armR: [P, P]; legL: [P, P]; legR: [P, P]};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeIO = (t: number) => { const x = clamp01(t); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

export const SH = (o: Partial<PD>, base: PD): PD => ({...base, ...o});
export const STAND: PD = {head: [0, -330], neck: [0, -292], hip: [0, -150], armL: [[-28, -222], [-36, -160]], armR: [[28, -222], [36, -160]], legL: [[-16, -76], [-22, 0]], legR: [[16, -76], [22, 0]]};
const SITLEGS = {legL: [[78, -169], [82, 0]] as [P, P], legR: [[86, -161], [94, 0]] as [P, P]};
export const SIT: PD = {head: [8, -355], neck: [4, -315], hip: [0, -165], armL: [[22, -245], [58, -205]], armR: [[30, -243], [66, -201]], ...SITLEGS};
/** sitting on the ground, knees up, hugging them */
export const HUDDLE: PD = {head: [40, -205], neck: [26, -175], hip: [0, -40], armL: [[52, -120], [96, -110]], armR: [[58, -116], [100, -106]], legL: [[80, -130], [110, 0]], legR: [[86, -124], [118, 0]]};

export const PO = {
  stand: STAND,
  look: SH({head: [14, -322], neck: [6, -290]}, STAND),
  lookUp: SH({head: [-4, -340], neck: [-2, -296]}, STAND),
  down: SH({head: [26, -306], neck: [12, -284]}, STAND),
  slump: SH({head: [34, -296], neck: [16, -278], armL: [[-6, -210], [-4, -146]], armR: [[10, -210], [14, -146]]}, STAND),
  paper: SH({head: [14, -320], armL: [[24, -230], [62, -262]], armR: [[30, -226], [66, -258]]}, STAND),
  headHands: SH({head: [10, -318], armL: [[-50, -290], [-6, -336]], armR: [[56, -290], [20, -336]]}, STAND),
  shrug: SH({armL: [[-56, -250], [-88, -292]], armR: [[56, -250], [88, -292]]}, STAND),
  throw: SH({head: [10, -332], armR: [[50, -300], [96, -350]]}, STAND),
  phone: SH({head: [12, -324], armL: [[22, -232], [44, -272]], armR: [[26, -228], [48, -268]]}, STAND),
  carry: SH({armL: [[30, -200], [70, -196]], armR: [[34, -204], [74, -200]]}, STAND),
  point: SH({armR: [[60, -260], [118, -270]]}, STAND),
  wave: SH({armR: [[46, -300], [60, -362]]}, STAND),
  reach: SH({head: [16, -326], armL: [[40, -240], [92, -230]], armR: [[44, -236], [96, -226]]}, STAND),
  tug: SH({head: [-8, -326], hip: [-10, -150], armL: [[30, -236], [70, -232]], armR: [[34, -232], [74, -228]]}, STAND),
  stretch: SH({head: [0, -336], armL: [[-30, -370], [-24, -444]], armR: [[30, -370], [24, -444]]}, STAND),
  balance: SH({armL: [[-70, -250], [-130, -262]], armR: [[70, -250], [130, -262]]}, STAND),
  hold: SH({armR: [[30, -236], [50, -282]]}, STAND),
  huddle: HUDDLE,
  sit: SIT,
};

const mixP = (a: P, b: P, u: number): P => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
export const mix = (a: PD, b: PD, u: number): PD => ({
  head: mixP(a.head, b.head, u), neck: mixP(a.neck, b.neck, u), hip: mixP(a.hip, b.hip, u),
  armL: [mixP(a.armL[0], b.armL[0], u), mixP(a.armL[1], b.armL[1], u)], armR: [mixP(a.armR[0], b.armR[0], u), mixP(a.armR[1], b.armR[1], u)],
  legL: [mixP(a.legL[0], b.legL[0], u), mixP(a.legL[1], b.legL[1], u)], legR: [mixP(a.legR[0], b.legR[0], u), mixP(a.legR[1], b.legR[1], u)],
});
/** pose keyframes in frames: [[frame, pose], ...]; each transition takes `dur` frames ending at the key frame */
export const poseAt = (f: number, keys: [number, PD][], dur = 10): PD => {
  let cur = keys[0][1];
  for (let j = 1; j < keys.length; j++) {
    const u = easeIO((f - (keys[j][0] - dur)) / dur);
    if (u <= 0) break;
    cur = mix(cur, keys[j][1], u);
  }
  return cur;
};
/** walk cycle; ph in cycles */
export const walk = (ph: number, base: PD = STAND, swingArms = true): PD => {
  const s = Math.sin(ph * Math.PI * 2);
  const c = Math.cos(ph * Math.PI * 2);
  const b = -Math.abs(s) * 7;
  return {
    ...base,
    head: [base.head[0] + 10, base.head[1] + b], neck: [base.neck[0] + 6, base.neck[1] + b], hip: [0, -150 + b],
    legL: [[22 * s + 6, -76 + b / 2], [44 * s, -Math.max(0, c) * 22]],
    legR: [[-22 * s + 6, -76 + b / 2], [-44 * s, -Math.max(0, -c) * 22]],
    armL: swingArms ? [[-20 * s, -222 + b], [-40 * s, -164 + b]] : base.armL,
    armR: swingArms ? [[20 * s, -222 + b], [40 * s, -164 + b]] : base.armR,
  };
};
/** run cycle (bigger stride, leaning) */
export const run = (ph: number): PD => {
  const s = Math.sin(ph * Math.PI * 2);
  const c = Math.cos(ph * Math.PI * 2);
  const b = -Math.abs(s) * 14;
  return {
    head: [26, -322 + b], neck: [18, -286 + b], hip: [0, -150 + b],
    legL: [[40 * s + 10, -80 + b / 2], [70 * s, -Math.max(0, c) * 50]],
    legR: [[-40 * s + 10, -80 + b / 2], [-70 * s, -Math.max(0, -c) * 50]],
    armL: [[-36 * s + 10, -214 + b], [-50 * s + 30, -170 + b]],
    armR: [[36 * s + 10, -214 + b], [50 * s + 30, -170 + b]],
  };
};

export type Prop = 'paper' | 'phone' | 'box' | 'cup' | 'cap' | undefined;
export const StickDefs: React.FC = () => (
  <defs>
    <filter id="stk-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="5" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
);

export const Stick: React.FC<{x: number; y: number; pose: PD; s?: number; f: number; flip?: boolean; color?: string; dash?: boolean; op?: number; seed?: number; bob?: number; rot?: number; prop?: Prop; propColor?: string; cap?: boolean}> = ({x, y, pose, s = 1, f, flip, color = '#f6f3ea', dash, op = 1, seed = 0, bob = 0, rot = 0, prop, propColor = '#f2c46d', cap}) => {
  const p = pose;
  const br = Math.sin(f * 0.073 + seed) * 2.2 + bob;
  const up = (q: P): P => [q[0], q[1] + (q[1] < p.hip[1] - 40 ? br : 0)];
  const pts = (a: P, b: P, c: P) => `M${a[0].toFixed(1)},${a[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)} L${c[0].toFixed(1)},${c[1].toFixed(1)}`;
  const sh: P = [lerp(p.neck[0], p.hip[0], 0.16), lerp(p.neck[1], p.hip[1], 0.16)];
  const head = up(p.head);
  const hand = up(p.armR[1]);
  const handL = up(p.armL[1]);
  const mid: P = [(hand[0] + handL[0]) / 2, (hand[1] + handL[1]) / 2];
  return (
    <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot}) scale(${flip ? -s : s},${s})`} opacity={op}>
      <g stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ? '14 14' : undefined} filter="url(#stk-glow)">
        <path d={`M${up(p.neck)[0]},${up(p.neck)[1]} L${p.hip[0]},${p.hip[1]}`} />
        <path d={pts(up(sh), up(p.armL[0]), up(p.armL[1]))} />
        <path d={pts(up(sh), up(p.armR[0]), up(p.armR[1]))} />
        <path d={pts(p.hip, p.legL[0], p.legL[1])} />
        <path d={pts(p.hip, p.legR[0], p.legR[1])} />
        <circle cx={head[0]} cy={head[1]} r={36} fill="rgba(14,10,8,0.92)" />
      </g>
      {cap && <g transform={`translate(${head[0]},${head[1] - 34})`}><path d="M-48,0 L0,-18 L48,0 L0,18 Z" fill="#111" stroke={propColor} strokeWidth={4} /><line x1={30} y1={4} x2={40} y2={34} stroke={propColor} strokeWidth={4} /></g>}
      {prop === 'paper' && <g transform={`translate(${mid[0]},${mid[1] - 26}) rotate(-8)`}><rect x={-30} y={-38} width={60} height={76} rx={4} fill="rgba(246,243,234,0.92)" /><line x1={-18} y1={-18} x2={18} y2={-18} stroke="#555" strokeWidth={4} /><line x1={-18} y1={-4} x2={14} y2={-4} stroke="#555" strokeWidth={4} /><line x1={-18} y1={10} x2={18} y2={10} stroke="#555" strokeWidth={4} /></g>}
      {prop === 'phone' && <rect x={hand[0] - 10} y={hand[1] - 34} width={20} height={34} rx={4} fill="#f6f3ea" stroke="#f6f3ea" strokeWidth={4} />}
      {prop === 'cup' && <path d={`M${hand[0] - 12},${hand[1] - 34} l24,0 l-4,34 l-16,0 Z`} fill="none" stroke={propColor} strokeWidth={5} />}
      {prop === 'box' && <g><rect x={mid[0] - 50} y={mid[1] - 60} width={100} height={70} rx={4} fill="rgba(20,14,10,0.95)" stroke={propColor} strokeWidth={5} /><path d={`M${mid[0] - 30},${mid[1] - 60} l10,-26 M${mid[0] + 10},${mid[1] - 60} l6,-34`} stroke={propColor} strokeWidth={4} /></g>}
      {!dash && <circle cx={head[0] + 16} cy={head[1] - 4} r={4.5} fill={color} />}
    </g>
  );
};
