import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile, useCurrentFrame, getInputProps} from 'remotion';
import {clamp01} from '../../library/anim';
import '../../library/filament/theme';
import BASS_DATA from './bass.json';
import {BARS, barF, beatF, CT, CUES, cueEnd, cueStart, DURATION, FPS, H, HITS, V, VE, VO, W, WORD} from './timeline';

/** ep58 Con sư tử không tới — 竖屏「vibe 知识」风：近黑底、一种主色调（夜蓝 / 落日橙）、红色只给关键词和想象的狮子 */
const TXT = "'Filament Viet Text', serif";
const DISP = "'Filament Viet Display', serif";
const BLACK = "'Filament Viet Black', serif";
// font phụ đề bản không lời dẫn (user chọn từ bảng mẫu 2026-10-21)
const SUBFONT = "'Ep58 Sub', 'Filament Viet', sans-serif";
if (typeof document !== 'undefined') {
  const h = delayRender('ep58 sub font');
  new FontFace('Ep58 Sub', `url(${staticFile('fonts/ep58/BeVietnamPro-ExtraBold.ttf')})`).load().then((l) => { document.fonts.add(l); continueRender(h); }).catch(() => continueRender(h));
}
const C = {
  ivory: '#f4efe4',
  dim: 'rgba(244,239,228,0.55)',
  faint: 'rgba(244,239,228,0.3)',
  red: '#e2483a',
  redHot: '#ff6b55',
  amber: '#f2c66d',
  sun: '#ffd89a',
};

const ease = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const easeIO = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const soft = (f: number, at: number, dur = 18, out?: number, outDur = 14) => {
  const v = ease((f - at) / dur) * (out === undefined ? 1 : 1 - clamp01((f - out) / outDur));
  return {opacity: v, filter: v < 0.999 ? `blur(${(1 - v) * 10}px)` : undefined, v};
};
const rnd = (i: number, s = 1) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ===================== 场景切换 ===================== */
const Scene: React.FC<{f: number; from: number; to: number; fade?: number; children: React.ReactNode; zoom?: [number, number]; origin?: string; cutIn?: boolean; cutOut?: boolean}> = ({f, from, to, fade = 14, children, zoom = [1, 1.04], origin = '50% 60%', cutIn, cutOut}) => {
  const fi = cutIn ? 1 : fade;
  const fo = cutOut ? 1 : fade;
  if (f < from - fi || f >= to + fo) return null;
  const vin = clamp01((f - from + fi) / (fi * 2));
  const vout = 1 - clamp01((f - to + fo) / (fo * 2));
  const v = Math.min(vin, vout);
  const z = lerp(zoom[0], zoom[1] + 0.03, easeIO((f - from) / Math.max(1, to - from)));
  // quẹt ngang: vào từ phải, ra sang trái, có blur + scale (giống ep56)
  const dx = (1 - ease(vin)) * 320 - (1 - vout) * (1 - vout) * 380;
  const sc = z * (1 + (1 - vin) * 0.12 - (1 - vout) * 0.06);
  return (
    <AbsoluteFill style={{opacity: v, filter: v < 0.999 ? `blur(${(1 - v) * 16}px)` : undefined, transform: `translateX(${dx.toFixed(1)}px) scale(${sc})`, transformOrigin: origin}}>
      {children}
    </AbsoluteFill>
  );
};

/* ===================== 字幕：上方居中，逐字柔入，【】变红 ===================== */
const Subs: React.FC<{f: number; top?: number}> = ({f, top = 300}) => {
  const i = CUES.findIndex((_, k) => f >= cueStart(k) && f < cueEnd(k));
  if (i < 0) return null;
  const o = 1 - clamp01((f - (cueEnd(i) - 8)) / 8);
  const parts: {c: string; hi: boolean}[] = [];
  let hi = false;
  for (const ch of CUES[i]) {
    if (ch === '【') hi = true;
    else if (ch === '】') hi = false;
    else parts.push({c: ch, hi});
  }
  // bản không lời dẫn: chữ to, đậm, đặt như video tham khảo (thảo nguyên: giữa trời ~1/3 khung; phòng ngủ/số liệu: phía trên)
  const SKY = [4, 5, 6, 14, 15, 16, 17, 18];
  const t0 = i === 24 ? 860 : SKY.includes(i) ? 600 : i === 9 || i === 12 ? 210 : top;
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: t0, textAlign: 'center', fontFamily: SUBFONT, fontWeight: 800, fontSize: 60, lineHeight: 1.42, letterSpacing: 0, opacity: o, filter: o < 1 ? `blur(${(1 - o) * 8}px)` : undefined}}>
      {(() => {
        // gom ký tự thành từ: mỗi từ bật lên (trượt lên + phóng nhẹ), từ khoá đỏ nảy mạnh hơn
        const words: {k0: number; chars: {c: string; hi: boolean; k: number}[]}[] = [];
        parts.forEach((p, k) => {
          if (p.c === ' ' || !words.length) words.push({k0: k, chars: []});
          if (p.c !== ' ') words[words.length - 1].chars.push({...p, k});
        });
        return words.map((w, wi) => {
          if (!w.chars.length) return null;
          const at = CT(i, w.chars[0].k);
          const v = ease((f - at) / 8);
          const hi = w.chars.some((c) => c.hi);
          const bounce = hi ? 1 + 0.35 * Math.exp(-Math.max(0, f - at) / 5) * Math.cos(Math.max(0, f - at) * 0.6) : 1;
          return (
            <React.Fragment key={wi}>
              {wi > 0 ? ' ' : ''}
              <span style={{display: 'inline-block', whiteSpace: 'nowrap', opacity: v, transform: `translateY(${((1 - v) * 34).toFixed(1)}px) scale(${((0.82 + 0.18 * v) * (v >= 1 ? bounce : 1)).toFixed(3)})`, filter: v < 1 ? `blur(${(1 - v) * 10}px)` : undefined}}>
                {w.chars.map((c) => (
                  <span key={c.k} style={{color: c.hi ? C.red : C.ivory, textShadow: c.hi ? `0 0 26px rgba(226,72,58,0.7), 0 3px 8px rgba(0,0,0,1)` : '0 3px 8px rgba(0,0,0,1), 0 2px 20px rgba(0,0,0,0.9)'}}>{c.c}</span>
                ))}
              </span>
            </React.Fragment>
          );
        });
      })()}
    </div>
  );
};

const Cite: React.FC<{f: number; at: number; out?: number; text: string; y?: number}> = ({f, at, out, text, y = 1800}) => {
  const s = soft(f, at, 20, out);
  return <div style={{position: 'absolute', left: 60, right: 60, top: y, textAlign: 'center', fontFamily: TXT, fontSize: 24, color: C.faint, letterSpacing: 0.5, opacity: s.opacity, filter: s.filter}}>{text}</div>;
};

/* ===================== 心跳线 ===================== */
type RateKey = [number, number]; // [帧, 每秒心跳数]
const phaseCache = new Map<string, Float64Array>();
const phaseArr = (id: string, keys: RateKey[]) => {
  let a = phaseCache.get(id);
  if (a) return a;
  a = new Float64Array(DURATION + 2);
  const rate = (k: number) => {
    if (k <= keys[0][0]) return keys[0][1];
    for (let j = 1; j < keys.length; j++) if (k <= keys[j][0]) return lerp(keys[j - 1][1], keys[j][1], (k - keys[j - 1][0]) / (keys[j][0] - keys[j - 1][0]));
    return keys[keys.length - 1][1];
  };
  for (let k = 1; k < a.length; k++) a[k] = a[k - 1] + rate(k) / FPS;
  phaseCache.set(id, a);
  return a;
};
const ecg = (u: number) => {
  const x = u - Math.floor(u);
  if (x < 0.12) return 0.12 * Math.sin((x / 0.12) * Math.PI);
  if (x < 0.2) return 0;
  if (x < 0.23) return -0.18 * ((x - 0.2) / 0.03);
  if (x < 0.27) return lerp(-0.18, 1, (x - 0.23) / 0.04);
  if (x < 0.31) return lerp(1, -0.38, (x - 0.27) / 0.04);
  if (x < 0.34) return lerp(-0.38, 0, (x - 0.31) / 0.03);
  if (x < 0.5) return 0;
  if (x < 0.68) return 0.22 * Math.sin(((x - 0.5) / 0.18) * Math.PI);
  return 0;
};
const Heart: React.FC<{f: number; id: string; keys: RateKey[]; x0?: number; x1?: number; y: number; amp?: number; color: string; label: string; opacity?: number}> = ({f, id, keys, x0 = 120, x1 = 900, y, amp = 70, color, label, opacity = 1}) => {
  const ph = phaseArr(id, keys);
  const span = 2.6 * FPS; // 屏幕上显示 2.6 秒
  const pts: string[] = [];
  const N = 260;
  for (let n = 0; n <= N; n++) {
    const x = x0 + ((x1 - x0) * n) / N;
    const tf = f - span * (1 - n / N);
    const k = Math.max(0, Math.min(ph.length - 2, tf));
    const k0 = Math.floor(k);
    const p = lerp(ph[k0], ph[k0 + 1], k - k0);
    const fadeIn = clamp01(n / 30);
    pts.push(`${x.toFixed(1)},${(y - ecg(p) * amp * fadeIn).toFixed(1)}`);
  }
  const last = pts[pts.length - 1].split(',').map(Number);
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id={`hg-${id}`} x1="0" x2="1">
            <stop offset="0" stopColor={color} stopOpacity="0" />
            <stop offset="0.25" stopColor={color} stopOpacity="0.55" />
            <stop offset="1" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>
        <polyline points={pts.join(' ')} fill="none" stroke={`url(#hg-${id})`} strokeWidth={3.2} strokeLinejoin="round" style={{filter: `drop-shadow(0 0 6px ${color})`}} />
        <circle cx={last[0]} cy={last[1]} r={6} fill={color} style={{filter: `drop-shadow(0 0 10px ${color})`}} />
      </svg>
      <div style={{position: 'absolute', left: x0 - 40, top: y + 38, fontFamily: TXT, fontSize: 26, color, opacity: 0.85}}>{label}</div>
    </div>
  );
};

/* ===================== 动物剪影 ===================== */
/** 斑马：朝右，原点在脚底中心附近。run 0..1 奔跑幅度，graze 0..1 低头吃草 */
const Zebra: React.FC<{x: number; y: number; s?: number; run?: number; graze?: number; t: number; glow?: number}> = ({x, y, s = 1, run = 0, graze = 0, t, glow = 0}) => {
  const sw = (k: number) => run * 28 * Math.sin(t * 0.55 + k);
  const bob = run * 6 * Math.abs(Math.sin(t * 0.55));
  const neckRot = graze * 62;
  const id = `zc${Math.round(x)}${Math.round(y)}`;
  const leg = (lx: number, k: number) => <rect key={k} x={lx - 8} y={-118} width={16} height={112} rx={6} transform={`rotate(${sw(k)} ${lx} -118)`} />;
  const body = (
    <>
      <path d="M-110,-150 C-118,-200 -60,-214 0,-212 C60,-214 108,-205 112,-160 C116,-122 70,-112 0,-114 C-70,-112 -104,-118 -110,-150 Z" />
      <path transform={`rotate(${neckRot} 92 -170)`} d="M70,-190 L120,-262 C132,-280 160,-280 168,-262 L172,-246 L118,-150 Z" />
      <path transform={`rotate(${neckRot} 92 -170)`} d="M150,-276 C168,-292 196,-270 214,-238 C222,-222 214,-210 200,-212 L148,-232 Z" />
      <path transform={`rotate(${neckRot} 92 -170)`} d="M150,-276 L156,-300 L166,-276 Z" />
      {leg(-82, 0)}
      {leg(-58, 2.2)}
      {leg(58, 2.8)}
      {leg(84, 0.6)}
    </>
  );
  const stripes = [
    ...Array.from({length: 15}, (_, k) => {
      const sx = -150 + k * 15;
      return <path key={k} d={`M${sx},-215 L${sx + 7},-215 L${sx + 18},-110 L${sx + 11},-110 Z`} />;
    }),
    ...Array.from({length: 7}, (_, k) => <rect key={`l${k}`} x={-130} y={-112 + k * 13} width={250} height={6} />),
  ];
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>{body}</clipPath>
      </defs>
      <g transform={`translate(${x} ${y - bob}) scale(${s})`} style={{filter: glow > 0 ? `drop-shadow(0 0 ${14 * glow}px rgba(255,210,140,${0.6 * glow}))` : undefined}}>
        <path d={`M-108,-160 Q-140,-150 -138,-${100 + run * 12 * Math.sin(t * 0.4)}`} stroke="#141010" strokeWidth={7} fill="none" />
        <g fill="#efe9dc">{body}</g>
        <g clipPath={`url(#${id})`} fill="#141010">
          {stripes}
          <g transform={`rotate(${neckRot} 92 -170)`}>
            {Array.from({length: 11}, (_, k) => {
              const y0 = -150 - k * 13;
              return <path key={k} d={`M60,${y0} L190,${y0 - 40} L190,${y0 - 33} L60,${y0 + 7} Z`} />;
            })}
            <ellipse cx={210} cy={-222} rx={16} ry={13} />
          </g>
          <rect x={-200} y={-22} width={420} height={30} />
        </g>
      </g>
    </svg>
  );
};

/** 狮子剪影：朝右。fill/stroke 可改成红色发光版（想象中的狮子） */
const LION_D =
  'M-150,-120 C-150,-170 -110,-196 -40,-196 C10,-196 60,-200 92,-214 C96,-252 128,-282 170,-280 C214,-278 240,-246 236,-206 C250,-196 262,-180 256,-166 C246,-150 224,-150 210,-146 C204,-120 186,-104 160,-100 L156,-12 L132,-12 L126,-96 C80,-92 20,-92 -30,-96 L-48,-12 L-72,-12 L-80,-102 C-110,-104 -132,-108 -142,-114 L-170,-60 L-186,-64 L-160,-128 Z';
const MANE_D = 'M100,-212 C92,-262 130,-300 176,-296 C226,-292 252,-250 246,-200 C238,-160 210,-140 176,-136 C136,-132 106,-160 100,-212 Z';
const Lion: React.FC<{x: number; y: number; s?: number; t: number; run?: number; mode?: 'black' | 'red'; opacity?: number; flip?: boolean}> = ({x, y, s = 1, t, run = 1, mode = 'black', opacity = 1, flip}) => {
  const bob = run * 8 * Math.sin(t * 0.6);
  const stretch = 1 + run * 0.05 * Math.sin(t * 0.6);
  const red = mode === 'red';
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity}}>
      <g transform={`translate(${x} ${y + bob}) scale(${(flip ? -1 : 1) * s * stretch} ${s})`}>
        <g
          fill={red ? 'rgba(226,60,48,0.85)' : '#0c0806'}
          stroke={red ? '#ff7a60' : 'rgba(255,190,120,0.75)'}
          strokeWidth={red ? 5 : 3}
          style={{filter: red ? 'drop-shadow(0 0 18px rgba(255,70,50,0.9)) blur(1.5px)' : 'drop-shadow(0 0 8px rgba(255,170,90,0.6))'}}
        >
          <path d={LION_D} />
          <path d={MANE_D} />
        </g>
      </g>
    </svg>
  );
};

/* ===================== 草原 ===================== */
const Savanna: React.FC<{f: number; children?: React.ReactNode; warm?: number; scroll?: number}> = ({f, children, warm = 1, scroll = 0}) => {
  const sx = -(scroll % 1200);
  const HZ = 1250;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(180deg, #070404 0%, #1c0d08 22%, #5a2412 46%, #b4562a 58%, #e48b42 64.5%, #f4b062 65.2%, #3a1d10 65.4%, #1a0c06 78%, #050302 100%)`}} />
      {/* 太阳 */}
      <div style={{position: 'absolute', left: 760 - 330, top: HZ - 330, width: 660, height: 660, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,226,170,0.55) 0%, rgba(255,170,90,0.22) 35%, rgba(255,140,60,0) 70%)', opacity: warm}} />
      <div style={{position: 'absolute', left: 760 - 92, top: HZ - 150, width: 184, height: 184, borderRadius: '50%', background: 'radial-gradient(circle, #fff1cf 0%, #ffd590 55%, #f6a95a 100%)', boxShadow: '0 0 80px rgba(255,200,120,0.8)', clipPath: 'inset(0 0 calc(100% - 150px) 0)'}} />
      {/* 云带 */}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {[
          [620, 880, 260, 0.35],
          [-80, 960, 420, 0.25],
          [480, 1040, 520, 0.3],
          [80, 1110, 300, 0.22],
        ].map(([x, y, w, o], k) => (
          <ellipse key={k} cx={(x as number) + (w as number) / 2 + ((f * 0.15 * (k % 2 ? 1 : -1)) % 60)} cy={y} rx={(w as number) / 2} ry={7} fill={`rgba(255,190,130,${o})`} />
        ))}
        {/* 远山 */}
        <path d={`M0,${HZ} C120,${HZ - 34} 260,${HZ - 50} 400,${HZ - 30} C520,${HZ - 14} 640,${HZ - 40} 820,${HZ - 36} C940,${HZ - 32} 1020,${HZ - 18} 1080,${HZ - 10} L1080,${HZ + 4} L0,${HZ + 4} Z`} fill="#3d1c0f" opacity={0.9} />
        <g transform={`translate(${sx.toFixed(1)},0)`}>
        {/* 地平线上的草 */}
        <path d={Array.from({length: 200}, (_, k) => `M${k * 12},${HZ + 6} l4,-${6 + rnd(k) * 12} l4,${6 + rnd(k) * 12}`).join(' ')} fill="#1c0d07" />
        {/* 金合欢树 */}
        <g fill="#120805">
          <path d={`M640,${HZ} L652,${HZ - 150} L630,${HZ - 196} L640,${HZ - 198} L660,${HZ - 160} L684,${HZ - 204} L694,${HZ - 200} L668,${HZ - 150} L676,${HZ} Z`} />
          <path d={`M520,${HZ - 196} C540,${HZ - 236} 600,${HZ - 250} 660,${HZ - 248} C730,${HZ - 250} 800,${HZ - 236} 812,${HZ - 204} C780,${HZ - 192} 720,${HZ - 198} 660,${HZ - 194} C600,${HZ - 198} 550,${HZ - 190} 520,${HZ - 196} Z`} />
        </g>
        <g fill="#120805">
          <path d={`M30,${HZ} L36,${HZ - 70} L44,${HZ - 70} L50,${HZ} Z`} />
          <path d={`M-40,${HZ - 70} C-10,${HZ - 96} 80,${HZ - 98} 120,${HZ - 72} C80,${HZ - 62} 10,${HZ - 64} -40,${HZ - 70} Z`} />
        </g>
        <g transform="translate(1200,0)">
        {/* 金合欢树 */}
        <g fill="#120805">
          <path d={`M640,${HZ} L652,${HZ - 150} L630,${HZ - 196} L640,${HZ - 198} L660,${HZ - 160} L684,${HZ - 204} L694,${HZ - 200} L668,${HZ - 150} L676,${HZ} Z`} />
          <path d={`M520,${HZ - 196} C540,${HZ - 236} 600,${HZ - 250} 660,${HZ - 248} C730,${HZ - 250} 800,${HZ - 236} 812,${HZ - 204} C780,${HZ - 192} 720,${HZ - 198} 660,${HZ - 194} C600,${HZ - 198} 550,${HZ - 190} 520,${HZ - 196} Z`} />
        </g>
        <g fill="#120805">
          <path d={`M30,${HZ} L36,${HZ - 70} L44,${HZ - 70} L50,${HZ} Z`} />
          <path d={`M-40,${HZ - 70} C-10,${HZ - 96} 80,${HZ - 98} 120,${HZ - 72} C80,${HZ - 62} 10,${HZ - 64} -40,${HZ - 70} Z`} />
        </g>
        </g>
        </g>
      </svg>
      {children}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 70% at 50% 55%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

/* ===================== 卧室 ===================== */
type RoomMood = 'night' | 'red' | 'dawn' | 'sleep' | 'off';
const Clock: React.FC<{text: string; x: number; y: number; dim?: number}> = ({text, x, y, dim = 1}) => (
  <div style={{position: 'absolute', left: x - 82, top: y - 34, width: 164, height: 68, borderRadius: 8, background: 'rgba(30,6,6,0.85)', border: '2px solid rgba(255,80,60,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 46, letterSpacing: 2, color: '#ff3b2f', textShadow: '0 0 14px rgba(255,50,40,0.9)', opacity: dim}}>
    {text}
  </div>
);
const Bedroom: React.FC<{f: number; mood: RoomMood; pose: 'sit' | 'lie'; clock: string; lamp?: number; children?: React.ReactNode; dawn?: number}> = ({f, mood, pose, clock, lamp = 0, children, dawn = 0}) => {
  const wall = {night: '#0b0f1c', red: '#1a0808', dawn: '#141518', sleep: '#0b0f1e', off: '#05070d'}[mood];
  const winGlow = mood === 'red' ? 'rgba(120,40,40,0.25)' : `rgba(120,150,220,${0.22 + dawn * 0.0})`;
  const outline = mood === 'red' ? 'rgba(255,90,70,0.75)' : mood === 'sleep' || lamp > 0.5 ? 'rgba(255,200,140,0.7)' : 'rgba(150,170,230,0.45)';
  const breath = Math.sin(f * 0.07);
  return (
    <AbsoluteFill style={{background: wall}}>
      {/* 墙面渐变 */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.85) 100%)'}} />
      {/* 窗 */}
      <div style={{position: 'absolute', left: 40, top: 560, width: 360, height: 470, background: dawn > 0 ? `rgba(${lerp(30, 236, dawn)},${lerp(40, 214, dawn)},${lerp(70, 168, dawn)},1)` : 'linear-gradient(180deg, #1c2744 0%, #121a30 100%)', boxShadow: `0 0 120px ${dawn > 0 ? `rgba(255,220,160,${0.5 * dawn})` : winGlow}`}}>
        <div style={{position: 'absolute', left: 176, top: 0, width: 10, height: '100%', background: wall}} />
        <div style={{position: 'absolute', top: 226, left: 0, height: 10, width: '100%', background: wall}} />
        <div style={{position: 'absolute', inset: 0, border: `10px solid ${wall}`}} />
      </div>
      {/* 晨光斜照 */}
      {dawn > 0 ? <div style={{position: 'absolute', left: 40, top: 1030, width: 900, height: 520, background: `linear-gradient(200deg, rgba(255,226,170,${0.32 * dawn}) 0%, rgba(255,226,170,0) 70%)`, clipPath: 'polygon(0 0, 40% 0, 100% 100%, 30% 100%)'}} /> : null}
      {/* 台灯光 */}
      <div style={{position: 'absolute', left: 900 - 420, top: 1100 - 380, width: 840, height: 840, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,200,130,0.42) 0%, rgba(255,170,90,0.14) 38%, rgba(0,0,0,0) 70%)', opacity: lamp}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {/* 床头柜 + 台灯 */}
        <rect x={790} y={1200} width={230} height={260} fill="#160d0d" stroke={outline} strokeWidth={2} opacity={0.95} />
        <line x1={905} y1={1080} x2={905} y2={1200} stroke={lamp > 0.3 ? '#d9a868' : '#3a2a2a'} strokeWidth={6} />
        <path d="M840,1080 L970,1080 L940,1010 L870,1010 Z" fill={lamp > 0.3 ? `rgba(255,${lerp(150, 226, lamp)},${lerp(110, 170, lamp)},1)` : '#2a1d1d'} style={{filter: lamp > 0.3 ? 'drop-shadow(0 0 30px rgba(255,210,140,0.9))' : undefined}} />
        {/* 床 */}
        <rect x={700} y={1080} width={34} height={380} rx={6} fill="#1a1012" stroke={outline} strokeWidth={2} />
        <path d="M-40,1260 L720,1260 L720,1460 L-40,1460 Z" fill="#191214" stroke={outline} strokeWidth={2} />
        <path d="M-40,1250 C200,1232 500,1232 720,1250 L720,1300 L-40,1300 Z" fill="#241a1d" />
        {pose === 'lie' ? (
          <g style={{filter: `drop-shadow(0 0 10px ${outline})`}}>
            <path d="M560,1214 C600,1190 680,1190 712,1220 L712,1258 L560,1258 Z" fill="#2c2226" />
            <circle cx={630} cy={1196} r={46} fill="#080507" stroke={outline} strokeWidth={2.5} />
            <path d={`M0,1262 C40,${1180 - breath * 3} 200,${1176 - breath * 4} 360,${1182 - breath * 4} C460,${1186 - breath * 3} 560,1214 600,1262 Z`} fill="#0e0a0c" stroke={outline} strokeWidth={2.5} />
          </g>
        ) : (
          <g style={{filter: `drop-shadow(0 0 10px ${outline})`}} transform={`translate(0 ${breath * 2})`}>
            <path d="M420,1262 C410,1180 430,1100 480,1060 C520,1030 600,1040 630,1090 C660,1140 650,1210 640,1262 Z" fill="#060405" stroke={outline} strokeWidth={2.5} />
            <path d="M400,1262 C380,1214 400,1170 450,1160 C500,1150 540,1180 548,1262 Z" fill="#060405" stroke={outline} strokeWidth={2.5} />
            <circle cx={470} cy={1040} r={52} fill="#060405" stroke={outline} strokeWidth={2.5} />
          </g>
        )}
        {/* 拖鞋 */}
        <ellipse cx={380} cy={1500} rx={42} ry={12} fill="#1a1214" />
        <ellipse cx={460} cy={1508} rx={42} ry={12} fill="#1a1214" />
      </svg>
      {mood === 'night' || mood === 'off' ? <div style={{position: 'absolute', left: 905 - 300, top: 1300 - 300, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,50,40,0.28) 0%, rgba(255,40,30,0.08) 40%, rgba(0,0,0,0) 70%)'}} /> : null}
      <Clock text={clock} x={905} y={1300} dim={mood === 'off' ? 0.8 : 1} />
      {children}
      <AbsoluteFill style={{background: mood === 'off' ? 'rgba(0,0,8,0.55)' : 'radial-gradient(ellipse 90% 70% at 50% 55%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)'}} />
    </AbsoluteFill>
  );
};

/* ===================== 担心的话（越南语） ===================== */
const WORRIES = [
  'Mai phỏng vấn hỏng thì sao?',
  'Nhắn tin không ai trả lời thì sao?',
  'Thi trượt thì sao?',
  'Bị sếp mắng thì sao?',
  'Ra trường không có việc thì sao?',
  'Người ta không thích mình thì sao?',
  'Nói sai trước đám đông thì sao?',
  'Bố mẹ thất vọng thì sao?',
  'Hết tiền thì sao?',
  'Deadline không kịp thì sao?',
  'Lỡ bị bệnh thì sao?',
  'Bị cho nghỉ việc thì sao?',
  'Thuyết trình quên bài thì sao?',
  'Cãi nhau rồi chia tay thì sao?',
  'Già rồi cô đơn thì sao?',
  'Trễ chuyến xe thì sao?',
  'Nhà mình có chuyện thì sao?',
  'Ba mươi tuổi chưa ra gì thì sao?',
  'Đầu tư lỗ hết thì sao?',
  'Mọi người cười mình thì sao?',
  'Máy bay có chuyện thì sao?',
  'Mình làm chưa đủ tốt thì sao?',
];
const Worries: React.FC<{f: number; at: number; count: number; per?: number; area?: [number, number, number, number]; size?: [number, number]; out?: number; seed?: number; drift?: number; suck?: [number, number, number, number]}> = ({f, at, count, per = 5, area = [60, 520, 1020, 1180], size = [28, 40], out, seed = 1, drift = 0, suck}) => (
  <AbsoluteFill>
    {Array.from({length: count}, (_, k) => {
      const a = at + k * per;
      const s = soft(f, a, 14, out === undefined ? undefined : out + rnd(k, seed + 9) * 20, 20);
      if (s.v <= 0) return null;
      const x = lerp(area[0], area[2], rnd(k, seed));
      const y = lerp(area[1], area[3], rnd(k, seed + 3)) - (f - a) * 0.12 - (out !== undefined && f > out ? (f - out) * drift : 0);
      const fs = lerp(size[0], size[1], rnd(k, seed + 5));
      const near = rnd(k, seed + 7);
      // hút xoáy vào đầu: [lúc bắt đầu, độ dài, x đầu, y đầu]
      let px = x;
      let py = y;
      let sc = 1;
      let red = 0;
      let so = 1;
      if (suck && f > suck[0]) {
        const q = clamp01((f - suck[0] - rnd(k, seed + 11) * suck[1] * 0.25) / (suck[1] * 0.75));
        const p = q * q * q;
        const dx = x - suck[2];
        const dy = y - suck[3];
        const r = Math.hypot(dx, dy) * (1 - p);
        const ang = Math.atan2(dy, dx) + p * Math.PI * 2.4;
        px = suck[2] + r * Math.cos(ang);
        py = suck[3] + r * Math.sin(ang) * 0.6;
        sc = 1 - 0.8 * p;
        red = clamp01(q * 1.6);
        so = 1 - Math.pow(p, 3);
      }
      if (so <= 0.01) return null;
      return (
        <div key={k} style={{position: 'absolute', left: px, top: py, transform: `translateX(-50%) scale(${sc.toFixed(3)})`, whiteSpace: 'nowrap', fontFamily: SUBFONT, fontWeight: 800, fontSize: fs, color: red > 0 ? `rgba(${Math.round(244 - 30 * red)},${Math.round(239 - 180 * red)},${Math.round(228 - 180 * red)},${0.35 + near * 0.55})` : `rgba(244,239,228,${0.35 + near * 0.55})`, opacity: s.opacity * so, filter: `blur(${(1 - near) * 2.2 + (1 - s.v) * 8}px)`, textShadow: red > 0 ? `0 0 ${(20 * red).toFixed(0)}px rgba(255,40,30,${(0.85 * red).toFixed(2)}), 0 2px 10px rgba(0,0,0,0.9)` : '0 2px 10px rgba(0,0,0,0.9)'}}>
          {WORRIES[(k + seed * 5) % WORRIES.length]}
        </div>
      );
    })}
  </AbsoluteFill>
);

/** Nổ: chữ bắn từ tâm ra, bay xuyên qua camera (to dần, mờ dần) */
const Burst: React.FC<{f: number; at: number; count?: number; cx?: number; cy?: number}> = ({f, at, count = 46, cx = 540, cy = 960}) => {
  const t0 = f - at;
  if (t0 < 0 || t0 > 60) return null;
  return (
    <AbsoluteFill>
      {Array.from({length: count}, (_, k) => {
        const d = 26 + rnd(k, 31) * 34;
        const q = clamp01(t0 / d);
        if (q >= 1) return null;
        const e = 1 - Math.pow(1 - q, 2.2);
        const ang = rnd(k, 33) * Math.PI * 2;
        const R = 500 + rnd(k, 35) * 1100;
        const z = 0.25 + e * (1.5 + rnd(k, 37) * 4.5);
        const x = cx + Math.cos(ang) * R * e;
        const y = cy + Math.sin(ang) * R * e * 1.25;
        const big = z > 2.6;
        return (
          <div key={k} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${z.toFixed(3)})`, whiteSpace: 'nowrap', fontFamily: SUBFONT, fontWeight: 800, fontSize: 34, color: k % 3 ? 'rgba(255,90,70,0.95)' : 'rgba(244,239,228,0.9)', opacity: (1 - q) * Math.min(1, t0 / 2), filter: `blur(${(big ? (z - 2.6) * 3 : 0) + q * 2}px)`, textShadow: '0 0 18px rgba(255,40,30,0.8)'}}>
            {WORRIES[(k * 7) % WORRIES.length]}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** 计数：「Trong đầu, bị vồ  N  lần」 */
const Counter: React.FC<{f: number; at: number; value: string; y: number; label?: string; color?: string; size?: number; out?: number}> = ({f, at, value, y, label = 'Trong đầu, bị vồ', color = C.red, size = 110, out}) => {
  const s = soft(f, at, 16, out);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 18, opacity: s.opacity, filter: s.filter}}>
      <span style={{fontFamily: DISP, fontWeight: 600, fontSize: 36, color: C.ivory}}>{label}</span>
      <span style={{fontFamily: BLACK, fontSize: size, lineHeight: 1, color, textShadow: `0 0 26px ${color}`, fontVariantNumeric: 'tabular-nums lining-nums'}}>{value}</span>
      <span style={{fontFamily: DISP, fontWeight: 600, fontSize: 36, color: C.ivory}}>lần</span>
    </div>
  );
};

/** 小狮子图标（计数网格用） */
const MiniLion: React.FC<{x: number; y: number; s: number; o: number; color: string}> = ({x, y, s, o, color}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d={LION_D} fill={color} />
    <path d={MANE_D} fill={color} />
  </g>
);

const fmtClock = (min: number) => {
  const m = Math.floor(((min % 1440) + 1440) % 1440);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};


/** Canh phách: mỗi đầu ô nhịp nhích nhẹ, mỗi phách trong đoạn căng nhích nhỏ hơn, 4 cú nhấn đẩy mạnh + lóe sáng */
const beatPulse = (f: number) => {
  let s = 0;
  let fl = 0;
  const bump = (at: number, amp: number, len: number) => {
    const t = f - at;
    if (t >= 0 && t < len) s += amp * Math.exp(-t / (len / 4));
  };
  // giật theo từng cú bass thật của nhạc (bass.json: phách có kick/bass mạnh, dò <150 Hz)
  for (const [sec, st] of BASS) {
    const at = Math.round(sec * FPS);
    if (at > f) break;
    if (f - at < 14) { bump(at, 0.022 * st, 14); fl = Math.max(fl, 0.06 * st * Math.exp(-(f - at) / 2.5)); }
  }
  for (const h of HITS) {
    bump(h, 0.045, 30);
    const t = f - h;
    if (t >= 0 && t < 16) fl = Math.max(fl, 0.2 * Math.exp(-t / 3));
  }
  return {s: 1 + s, fl};
};

/* ===================== Rung + punch (giống ep56) ===================== */
const shakeAt = (f: number, slams: number[], lights: number[]) => {
  let x = 0;
  let y = 0;
  let r = 0;
  const hit = (e: number, amp: number) => {
    const t = f - e;
    if (t < 0 || t > 16) return;
    const a = amp * Math.exp(-t / 3.2);
    x += a * Math.sin(t * 2.7);
    y += a * Math.cos(t * 3.3);
    r += a * 0.06 * Math.sin(t * 2.1);
  };
  for (const e of slams) hit(e, 24);
  for (const e of lights) hit(e, 9);
  return `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${r.toFixed(2)}deg)`;
};
const punchAt = (f: number, slams: number[], lights: number[]) => {
  let s = 0;
  let fl = 0;
  for (const e of slams) {
    const t = f - e;
    if (t >= 0 && t < 20) {
      s += 0.075 * Math.exp(-t / 4.5) * Math.cos(t * 0.5);
      fl = Math.max(fl, 0.22 * Math.exp(-t / 2.5));
    }
  }
  for (const e of lights) {
    const t = f - e;
    if (t >= 0 && t < 12) s += 0.025 * Math.exp(-t / 3);
  }
  return {s, fl};
};
const integ = (from: number, to: number, fn: (k: number) => number) => {
  let a = 0;
  for (let k = from; k < to; k++) a += fn(k);
  return a;
};
/** khung các từ khoá đỏ bắt đầu hiện */
const HI_AT: number[] = CUES.flatMap((c, i) => {
  const out: number[] = [];
  let k = 0;
  for (const ch of c) {
    if (ch === '【') out.push(CT(i, k));
    else if (ch !== '】') k++;
  }
  return out;
});

const BASS = BASS_DATA as [number, number][];
/* ===================== 主体 ===================== */
export const Ep58SuTu: React.FC = () => {
  const f = useCurrentFrame();
  const S = (i: number) => V(i) - 3; // câu mở cảnh đã nằm đúng nửa ô nhịp
  const t = f;

  // 心跳节奏
  const zebraKeys: [number, number][] = [
    [S(4), 1.1],
    [V(5), 1.2],
    [V(5) + 20, 3.4],
    [V(6), 3.2],
    [V(6) + 50, 1.1],
    [V(9), 1.1],
    [V(9) + 30, 3.2],
    [V(10), 3],
    [V(14), 1.1],
    [WORD(15, 'chạy'), 3.6],
    [V(17), 3.4],
    [V(17) + 40, 1.1],
  ];
  const youKeys: [number, number][] = [
    [S(7), 1.2],
    [V(7) + 40, 2.2],
    [V(8), 2.6],
    [V(9), 2.4],
    [V(9) + 30, 3.2],
    [V(10), 3],
    [V(11), 2],
    [V(12), 2.4],
    [V(12) + 90, 3.6],
    [V(13), 3.4],
    [V(20), 1.2],
  ];

  const bp = beatPulse(f);
  // ---- sự kiện: cú đập mạnh / nhẹ
  const SCENES = [S(4), S(7), S(9), S(10), S(12), S(13), S(14), S(19), S(20), S(24)];
  const SLAMS = [...HITS, V(5), WORD(8, 'vồ'), WORD(12, 'Thế là'), WORD(19, 'một lần')];
  const LIGHTS = [...SCENES, ...HI_AT, V(17), WORD(23, 'tắt')];
  const pu = punchAt(f, SLAMS, LIGHTS);
  // ---- chạy: nền trôi (parallax)
  const runA = (k: number) => (k < V(5) ? 0 : k < V(6) ? 1 : 1 - clamp01((k - V(6)) / 40));
  const goB = WORD(15, 'chạy');
  const runB = (k: number) => (k < goB ? 0 : k < V(17) ? 1 : 1 - clamp01((k - V(17)) / 40));
  const scrollA = f > S(4) - 20 && f < S(7) + 20 ? integ(V(5), f, runA) * 26 : 0;
  const scrollB = f > S(14) - 20 && f < S(19) + 20 ? integ(goB, f, runB) * 26 : 0;
  const scrollSplit = f > S(9) - 20 && f < S(10) + 20 ? (f - S(9)) * 22 : 0;
  return (
    <AbsoluteFill style={{background: '#030303'}}>
      <AbsoluteFill style={{transform: `${shakeAt(f, SLAMS, LIGHTS)} scale(${(bp.s + pu.s).toFixed(4)})`, transformOrigin: '50% 55%'}}>
      {/* ---------- 1 卧室深夜：担心一句句冒出来 ---------- */}
      <Scene f={f} from={0} to={HITS[0]} zoom={[1.06, 1.0]} cutOut>
        {(() => {
          // một ô nhịp trước drop: mọi nỗi lo xoáy hút vào đầu, camera lao vào đầu, rồi drop thì nổ
          const SK: [number, number, number, number] = [HITS[0] - 66, 62, 630, 1196];
          const p = clamp01((f - SK[0]) / SK[1]);
          const pe = p * p * p;
          return (
            <AbsoluteFill style={{transform: `scale(${(1 + pe * 1.6).toFixed(4)}) rotate(${(pe * -6).toFixed(2)}deg)`, transformOrigin: '630px 1196px'}}>
              <Bedroom f={f} mood="night" pose="lie" clock={fmtClock(75 + Math.floor((f / Math.max(1, S(3))) * 83))} />
              {p > 0 ? (
                <svg width={W} height={H} style={{position: 'absolute'}}>
                  {Array.from({length: 7}, (_, k) => {
                    const rx = (420 - k * 50) * (1 - pe * 0.7);
                    return (
                      <ellipse key={k} cx={630} cy={1196} rx={rx} ry={rx * 0.32} fill="none" stroke={`rgba(255,${50 + k * 12},40,${(0.12 + 0.5 * p) * (1 - k / 9)})`} strokeWidth={3 + k} strokeDasharray={`${120 + k * 30} ${80 + k * 20}`} strokeDashoffset={-f * (14 + k * 4)} transform={`rotate(${-12 + k * 5} 630 1196)`} style={{filter: 'blur(2px)'}} />
                    );
                  })}
                  <circle cx={630} cy={1196} r={60 + 40 * pe} fill={`rgba(255,40,30,${0.15 + 0.55 * pe})`} style={{filter: 'blur(24px)'}} />
                </svg>
              ) : null}
              <Worries f={f} at={V(0) + 10} count={7} per={10} area={[180, 560, 900, 1000]} size={[30, 38]} seed={1} suck={SK} />
              <Worries f={f} at={V(2) - 10} count={12} per={8} area={[120, 500, 960, 1560]} size={[28, 40]} seed={4} suck={SK} />
              <Worries f={f} at={V(2) + 100} count={6} per={9} area={[60, 420, 1020, 1700]} size={[26, 40]} seed={9} suck={SK} />
            </AbsoluteFill>
          );
        })()}
      </Scene>

      {/* ---------- 2 LO ÂU 大字 ---------- */}
      <Scene f={f} from={HITS[0]} to={S(4)} zoom={[1.0, 1.06]} cutIn>
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 50%, #1a1414 0%, #050404 100%)'}} />
        <div style={{opacity: 0.3}}><Worries f={f} at={HITS[0] + 6} count={18} per={7} area={[-20, 380, 1100, 1900]} size={[30, 50]} seed={7} /></div>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,4,4,0.95) 0%, rgba(5,4,4,0.9) 26%, rgba(5,4,4,0) 36%)'}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 50% 22% at 50% 50%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)'}} />
        <Burst f={f} at={HITS[0]} count={24} />
        {(() => {
          const a = HITS[0];
          const s = soft(f, a, 4);
          const sc = 1 + 1.3 * Math.exp(-Math.max(0, f - a) / 3.5);
          return (
            <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', opacity: s.opacity, filter: s.filter, transform: `scale(${sc})`}}>
              <span style={{fontFamily: SUBFONT, fontWeight: 800, fontSize: 230, color: C.red, letterSpacing: 4, textShadow: '0 0 50px rgba(226,72,58,0.6)'}}>LO ÂU</span>
            </div>
          );
        })()}
      </Scene>

      {/* ---------- 3 草原：Sapolsky 的书，斑马被追，狮子走了低头吃草 ---------- */}
      <Scene f={f} from={S(4)} to={S(7)} zoom={[1.0, 1.05]}>
        <Savanna f={f} scroll={scrollA}>
          {(() => {
            const chase0 = V(5);
            const chaseEnd = V(6) + 30;
            const inChase = f >= chase0 - 10 && f < chaseEnd + 40;
            const run = f < chase0 ? 0 : f < V(6) ? 1 : 1 - clamp01((f - V(6)) / 40);
            const graze = clamp01((f - V(6) - 30) / 30);
            const zx = f < chase0 ? 560 : lerp(560, 600, ease((f - chase0) / 30));
            // sư tử luôn bám sau một khoảng ngắn (~1 thân), khoảng cách co giãn nhẹ, không chạm đuôi ngựa vằn
            const gapA = zx - 470 + 24 * Math.sin(f / 15);
            const lionX = f < chase0 ? -300 : f < V(6) ? lerp(-300, gapA, ease((f - chase0) / 40)) : lerp(gapA, -400, easeIO((f - V(6)) / 40));
            return (
              <>
                {inChase ? <Lion x={lionX} y={1440} s={0.95} t={t} run={1} /> : null}
                <Zebra x={zx} y={1450} s={1.15} t={t} run={run} graze={graze} glow={0.3} />
                {f >= chase0 - 4 && run > 0.5 ? (
                  <svg width={W} height={H} style={{position: 'absolute'}}>
                    {Array.from({length: 10}, (_, k) => {
                      const age = (f + k * 7) % 30;
                      return <circle key={k} cx={zx - 120 - age * 6} cy={1440 - age * 0.8 + rnd(k) * 10} r={6 + age * 0.9} fill={`rgba(150,90,50,${0.35 * (1 - age / 30)})`} />;
                    })}
                  </svg>
                ) : null}
              </>
            );
          })()}
          <Heart f={f} id="zebra" keys={zebraKeys} y={1640} color={C.amber} label="Nhịp tim ngựa vằn" opacity={soft(f, V(5) - 10, 16).opacity} />
          <Cite f={f} at={V(4) + 20} text="Robert Sapolsky · Why Zebras Don't Get Ulcers · 1994" y={1780} />
        </Savanna>
      </Scene>

      {/* ---------- 4 卧室红：想象的狮子一次次扑过来 ---------- */}
      <Scene f={f} from={S(7)} to={S(9)} zoom={[1.0, 1.05]}>
        {(() => {
          const pounce = (k: number) => V(8) + 20 + k * 22;
          const n = f < WORD(8, 'vồ') ? 0 : 1 + Math.max(0, Math.floor((f - WORD(8, 'vồ')) / 18));
          const p = n > 0 ? ((f - WORD(8, 'vồ')) % 18) / 18 : 0;
          const grow = clamp01((f - V(7) - 30) / 90);
          return (
            <Bedroom f={f} mood="red" pose="sit" clock={fmtClock(250 + Math.floor((f - S(7)) / 40))}>
              <Lion x={lerp(-260, 60, grow) + (n > 0 ? 50 * Math.sin(p * Math.PI) : 0)} y={1280} s={1.05 + grow * 0.15} t={t * 0.4} run={0.4} mode="red" opacity={0.25 + grow * 0.65} />
              <Counter f={f} at={WORD(8, 'vồ') - 4} value={n > 9 ? 'N' : String(Math.max(1, n))} y={560} size={120} />
              <Heart f={f} id="you" keys={youKeys} y={1640} color={C.red} label="Nhịp tim của bạn" />
              {void pounce}
            </Bedroom>
          );
        })()}
      </Scene>

      {/* ---------- 5 分屏：真狮子 vs 想象的狮子，心跳一样快 ---------- */}
      <Scene f={f} from={S(9)} to={S(10)}>
        <AbsoluteFill style={{background: '#050304'}} />
        {(() => {
          const top = 610;
          const bot = 1190;
          const hh = 540;
          const a = soft(f, S(9) + 6, 18);
          const b = soft(f, WORD(9, 'tưởng tượng') - 6, 18);
          return (
            <>
              <div style={{position: 'absolute', left: 30, right: 30, top, height: hh, overflow: 'hidden', borderRadius: 18, opacity: a.opacity, filter: a.filter, boxShadow: '0 0 0 1px rgba(255,200,140,0.25)'}}>
                <div style={{position: 'absolute', left: -30, top: -(1250 - 300), width: W, height: H}}>
                  <Savanna f={f} scroll={scrollSplit}>
                    <Lion x={lerp(80, 300, ease((f - S(9)) / 60))} y={1440} s={0.8} t={t} run={1} />
                    <Zebra x={620} y={1450} s={0.95} t={t} run={1} />
                  </Savanna>
                </div>
                <div style={{position: 'absolute', left: 0, right: 0, top: hh - 170, height: 170, background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 100%)'}} />
                <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}>
                  <Heart f={f} id="zebra" keys={zebraKeys} x0={60} x1={960} y={hh - 70} amp={55} color={C.amber} label="" />
                </div>
                <div style={{position: 'absolute', left: 28, top: 22, fontFamily: TXT, fontSize: 30, color: C.amber}}>Ngựa vằn bị rượt</div>
              </div>
              <div style={{position: 'absolute', left: 30, right: 30, top: bot, height: hh, overflow: 'hidden', borderRadius: 18, opacity: b.opacity, filter: b.filter, boxShadow: '0 0 0 1px rgba(255,90,70,0.3)'}}>
                <div style={{position: 'absolute', left: -30, top: -720, width: W, height: H}}>
                  <Bedroom f={f} mood="red" pose="sit" clock="05:10">
                    <Lion x={70} y={1280} s={1.1} t={t * 0.4} run={0.4} mode="red" opacity={0.9} />
                  </Bedroom>
                </div>
                <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}>
                  <Heart f={f} id="you" keys={youKeys} x0={60} x1={960} y={hh - 70} amp={55} color={C.red} label="" />
                </div>
                <div style={{position: 'absolute', left: 28, top: 22, fontFamily: TXT, fontSize: 30, color: C.redHot}}>Bạn, bên giường</div>
              </div>
              {/* 两条心跳同步的连接虚线 */}
              <svg width={W} height={H} style={{position: 'absolute', opacity: soft(f, WORD(9, 'y như') - 4, 16).opacity}}>
                {[260, 470, 680, 890].map((x, k) => (
                  <line key={k} x1={x} y1={top + hh - 70} x2={x} y2={bot + hh - 70} stroke="rgba(244,239,228,0.35)" strokeWidth={2} strokeDasharray="6 10" />
                ))}
              </svg>
            </>
          );
        })()}
      </Scene>

      {/* ---------- 6 天亮了，狮子没来；以为是自己守住的 ---------- */}
      <Scene f={f} from={S(10)} to={S(12)} zoom={[1.0, 1.04]}>
        {(() => {
          const dawn = ease((f - V(10)) / 50);
          const ok = WORD(11, 'canh chừng');
          return (
            <Bedroom f={f} mood="dawn" pose="sit" clock="06:40" dawn={dawn}>
              {/* 天亮的光圈 */}
              <svg width={W} height={H} style={{position: 'absolute'}}>
                {[0, 1, 2].map((k) => {
                  const p = clamp01((f - WORD(10, 'Sư tử') - k * 14) / 50);
                  return p > 0 && p < 1 ? <circle key={k} cx={500} cy={1120} r={80 + p * 340} fill="none" stroke={`rgba(255,240,210,${0.35 * (1 - p)})`} strokeWidth={10} /> : null;
                })}
                {f >= ok ? <path d="M400,880 L470,950 L620,800" fill="none" stroke={C.amber} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={420} strokeDashoffset={420 * (1 - ease((f - ok) / 14))} style={{filter: 'drop-shadow(0 0 14px rgba(242,198,109,0.8))'}} /> : null}
              </svg>
              <Heart f={f} id="you" keys={youKeys} y={1640} color={C.red} label="Nhịp tim của bạn" opacity={0.6} />
            </Bedroom>
          );
        })()}
      </Scene>

      {/* ---------- 7 「nhờ mình canh」→ 下一晚狮子来得更多 ---------- */}
      <Scene f={f} from={S(12)} to={S(13)} zoom={[1.0, 1.06]}>
        {(() => {
          const more = WORD(12, 'Thế là');
          const g = ease((f - more) / 60);
          return (
            <Bedroom f={f} mood={f < more ? 'dawn' : 'red'} pose="sit" clock={f < more ? '06:40' : '01:02'} dawn={f < more ? 1 : 0}>
              {f < more && f >= WORD(12, 'nhờ') ? (
                <svg width={W} height={H} style={{position: 'absolute'}}>
                  <path d="M400,880 L470,950 L620,800" fill="none" stroke={C.amber} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 14px rgba(242,198,109,0.8))'}} />
                </svg>
              ) : null}
              {f >= more
                ? [0, 1, 2, 3, 4].map((k) => (
                    <Lion key={k} x={lerp(-300, [-40, 120, -160, 260, 40][k], g)} y={[1300, 1180, 1120, 1260, 1050][k]} s={[1.2, 0.9, 0.8, 0.85, 0.7][k]} t={t * 0.4 + k} run={0.4} mode="red" opacity={clamp01((f - more - k * 10) / 20) * 0.75} />
                  ))
                : null}
              {f >= more ? <Counter f={f} at={more + 10} value="N" y={600} size={120} /> : null}
              <Heart f={f} id="you" keys={youKeys} y={1640} color={C.red} label="Nhịp tim của bạn" opacity={f < more ? 0.6 : 1} />
            </Bedroom>
          );
        })()}
      </Scene>

      {/* ---------- 8 研究：91,4% 的担心没成真 ---------- */}
      <Scene f={f} from={S(13)} to={S(14)} zoom={[1.0, 1.03]}>
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 55%, #1a1212 0%, #040303 100%)'}} />
        {(() => {
          const a = WORD(13, '91,4%');
          const fade = WORD(13, 'không hề');
          const s = soft(f, a - 2, 10);
          const val = (91.4 * ease((f - a + 8) / 30)).toFixed(1).replace('.', ',');
          return (
            <>
              <div style={{position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', opacity: s.opacity, filter: s.filter}}>
                <span style={{fontFamily: BLACK, fontSize: 210, color: C.red, textShadow: '0 0 40px rgba(226,72,58,0.6)', fontVariantNumeric: 'tabular-nums lining-nums'}}>{val}%</span>
              </div>
              <svg width={W} height={H} style={{position: 'absolute'}}>
                {Array.from({length: 100}, (_, k) => {
                  const cx = 270 + (k % 10) * 60;
                  const cy = 1000 + Math.floor(k / 10) * 60;
                  const app = clamp01((f - V(13) - k * 0.5) / 12);
                  const unreal = k < 91 || (k === 91 && false);
                  const d = unreal ? ease((f - fade - (k % 13) * 2) / 20) : 0;
                  return <circle key={k} cx={cx} cy={cy} r={16} fill={d > 0.5 ? 'none' : C.red} stroke={d > 0.5 ? 'rgba(244,239,228,0.35)' : C.red} strokeWidth={2.5} opacity={app * (1 - d * 0.35)} style={{filter: d > 0.5 ? undefined : 'drop-shadow(0 0 6px rgba(226,72,58,0.7))'}} />;
                })}
              </svg>
              <div style={{position: 'absolute', left: 0, right: 0, top: 1630, display: 'flex', justifyContent: 'center', gap: 50, fontFamily: TXT, fontSize: 28, opacity: soft(f, fade, 16).opacity}}>
                <span style={{color: C.dim}}>○ không xảy ra</span>
                <span style={{color: C.redHot}}>● có xảy ra</span>
              </div>
            </>
          );
        })()}
        <Cite f={f} at={V(13) + 30} text="LaFreniere & Newman · Behavior Therapy · 2020 · 29 người" />
      </Scene>

      {/* ---------- 9 草原：狮子真来了 → 跑；跑完平静；压力只该用这几分钟 ---------- */}
      <Scene f={f} from={S(14)} to={S(19)} zoom={[1.0, 1.04]}>
        <Savanna f={f} scroll={scrollB}>
          {(() => {
            const go = WORD(15, 'chạy');
            const calm = V(17);
            const lionX = f < V(14) + 20 ? -400 : f < go ? lerp(-400, -160, ease((f - V(14) - 20) / 40)) : f < calm ? lerp(-160, 640 - 470 + 24 * Math.sin(f / 15), ease((f - go) / 40)) : lerp(170, -500, easeIO((f - calm) / 50));
            const run = f < go ? 0 : f < calm ? 1 : 1 - clamp01((f - calm) / 40);
            const graze = clamp01((f - calm - 50) / 30);
            const zx = f < go ? 560 : f < calm ? lerp(560, 640, ease((f - go) / 30)) : 640;
            const look = f >= V(14) + 20 && f < go;
            return (
              <>
                <Lion x={lionX} y={1440} s={0.95} t={t} run={f < go ? 0.3 : run} opacity={lionX > -380 ? 1 : 0} />
                <Zebra x={zx + (look ? 4 * Math.sin(f * 0.8) : 0)} y={1450} s={1.15} t={t} run={run} graze={graze} glow={0.3} />
                {run > 0.5 ? (
                  <svg width={W} height={H} style={{position: 'absolute'}}>
                    {Array.from({length: 10}, (_, k) => {
                      const age = (f + k * 7) % 30;
                      return <circle key={k} cx={zx - 120 - age * 6} cy={1440 - age * 0.8 + rnd(k) * 10} r={6 + age * 0.9} fill={`rgba(150,90,50,${0.35 * (1 - age / 30)})`} />;
                    })}
                  </svg>
                ) : null}
                {/* 「几分钟」：沙漏式的短亮条 */}
                {f >= V(18) ? (
                  <div style={{position: 'absolute', left: 240, right: 240, top: 1540, height: 6, borderRadius: 3, background: 'rgba(242,198,109,0.18)', opacity: soft(f, V(18), 14).opacity}}>
                    <div style={{width: `${100 * clamp01((f - WORD(18, 'vài phút')) / 30)}%`, height: '100%', borderRadius: 3, background: C.amber, boxShadow: '0 0 12px rgba(242,198,109,0.8)'}} />
                  </div>
                ) : null}
              </>
            );
          })()}
          <Heart f={f} id="zebra" keys={zebraKeys} y={1640} color={C.amber} label="Nhịp tim ngựa vằn" />
          <Cite f={f} at={V(18)} text="Phản ứng căng thẳng · Robert Sapolsky, Why Zebras Don't Get Ulcers" y={1780} />
        </Savanna>
      </Scene>

      {/* ---------- 10 计数：脑子里被扑了几百次，草原上真来了 1 次 ---------- */}
      <Scene f={f} from={S(19)} to={S(20)}>
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 45%, #170f0e 0%, #030303 100%)'}} />
        {(() => {
          const a = V(19) + 6;
          const one = WORD(19, 'Ngoài');
          const total = 240;
          const n = Math.floor(total * ease((f - a) / 70));
          const shown = f < WORD(19, 'hàng trăm') + 30 ? String(Math.round(293 * ease((f - a) / 70))) : 'N';
          const dim = f >= one ? 0.35 : 1;
          return (
            <>
              <div style={{opacity: dim}}>
                <Counter f={f} at={a} value={shown} y={560} size={140} />
                <svg width={W} height={H} style={{position: 'absolute'}}>
                  {Array.from({length: total}, (_, k) => (
                    <MiniLion key={k} x={200 + (k % 20) * 36} y={830 + Math.floor(k / 20) * 30} s={0.1} o={k < n ? 0.9 : 0} color={C.red} />
                  ))}
                </svg>
              </div>
              {f >= one ? (
                <>
                  <Counter f={f} at={one} value="1" y={1300} label="Ngoài thảo nguyên, tới thật" color={C.amber} size={150} />
                  <div style={{opacity: soft(f, one + 20, 16).opacity}}>
                    <Zebra x={540 + Math.min(120, (f - one - 20) * 3)} y={1640} s={0.5} t={t} run={1} glow={0.5} />
                  </div>
                  <div style={{position: 'absolute', left: 0, right: 0, top: 1680, textAlign: 'center', fontFamily: DISP, fontWeight: 600, fontSize: 34, color: C.amber, opacity: soft(f, one + 40, 16).opacity}}>chạy thoát</div>
                </>
              ) : null}
            </>
          );
        })()}
      </Scene>

      {/* ---------- 11 不再站岗：担心碎掉 → 安稳入睡 → 关灯 ---------- */}
      <Scene f={f} from={S(20)} to={S(24)} zoom={[1.0, 1.05]}>
        {(() => {
          const off = WORD(23, 'tắt');
          const lamp = f < off ? soft(f, V(20) + 40, 30).v : 1 - clamp01((f - off) / 12);
          const clock = f < V(22) ? '23:47' : '23:52';
          return (
            <Bedroom f={f} mood={f < off + 6 ? 'sleep' : 'off'} pose="lie" clock={clock} lamp={lamp}>
              <Worries f={f} at={S(20) - 20} count={26} per={0.8} area={[40, 420, 1040, 1620]} size={[28, 44]} seed={11} out={WORD(20, 'thôi')} drift={2.2} />
              <svg width={W} height={H} style={{position: 'absolute'}}>
                {Array.from({length: 40}, (_, k) => {
                  const tw = 0.4 + 0.6 * Math.abs(Math.sin(f * 0.05 + k));
                  return <circle key={k} cx={rnd(k, 21) * W} cy={300 + rnd(k, 22) * 1500 - ((f * 0.2 + k * 30) % 200)} r={1.5 + rnd(k, 23) * 2} fill={`rgba(255,226,180,${0.5 * tw * soft(f, V(20) + 50, 30).v})`} />;
                })}
              </svg>
            </Bedroom>
          );
        })()}
      </Scene>

      {/* ---------- 12 结尾提问 ---------- */}
      <Scene f={f} from={S(24)} to={DURATION + 20}>
        <Bedroom f={f} mood="off" pose="lie" clock="23:52" />
        <AbsoluteFill style={{background: 'rgba(0,0,0,0.45)'}} />
      </Scene>

      </AbsoluteFill>
      {Math.max(bp.fl, pu.fl) > 0 ? <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,210,150,1) 0%, rgba(255,160,90,0) 70%)', mixBlendMode: 'screen', opacity: Math.max(bp.fl, pu.fl)}} /> : null}
      <Subs f={f} />

      {/* ---------- 声音 ---------- */}
      <Audio src={staticFile(((getInputProps() as {bgm?: string}).bgm) || 'audio/ep58-su-tu/bgm.wav')} volume={0.75} />
      {/* ---------- SFX ---------- */}
      {(() => {
        const list: [string, number, number][] = [];
        const add = (n: string, at: number, v: number) => { if (at >= 0 && at < DURATION) list.push([n, Math.round(at), v]); };
        for (const sc of SCENES) add('whoosh', sc - 14, 0.55);
        for (const h of HITS) add('riser', h - 27, 0.35);
        add('riser', HITS[0] - 66, 0.5);
        add('whoosh', HITS[0] - 20, 0.6);
        for (const e of SLAMS) add('impact', e, HITS.includes(e) ? 0.9 : 0.6);
        add('roar', V(5) - 8, 0.7);
        add('roar', goB - 8, 0.6);
        for (let k = V(5); k < V(6) + 30; k += 8) if (runA(k) > 0.4) add('hoof', k, 0.35 + 0.15 * ((k / 8) % 2));
        for (let k = goB; k < V(17) + 30; k += 8) if (runB(k) > 0.4) add('hoof', k, 0.35 + 0.15 * ((k / 8) % 2));
        for (let k = S(9); k < S(10); k += 8) add('hoof', k, 0.22);
        const beats = (id: string, keys: RateKey[], wins: [number, number][], v: number) => {
          const ph = phaseArr(id, keys);
          for (const [a, b] of wins) for (let k = Math.max(1, a); k < Math.min(b, ph.length - 1); k++) if (Math.floor(ph[k] - 0.27) > Math.floor(ph[k - 1] - 0.27)) add('heart', k, v);
        };
        beats('zebra', zebraKeys, [[V(5) - 10, S(7)], [S(14), S(19)]], 0.55);
        beats('you', youKeys, [[S(7), S(9)], [S(10), S(13)]], 0.6);
        beats('you', youKeys, [[S(9), S(10)]], 0.5);
        for (let k = 15; k < S(3); k += 30) add('tick', k, 0.35);
        for (let k = S(20); k < WORD(23, 'tắt'); k += 30) add('tick', k, 0.18);
        for (let i = 0; i < CUES.length; i++) add('pop', V(i), 0.3);
        for (let k = 0; k < 7; k++) add('pop', V(0) + 10 + k * 10, 0.18);
        for (let k = 0; k < 14; k++) add('pop', V(2) - 10 + k * 4, 0.14);
        for (const h of HI_AT) add('ding', h, 0.3);
        { const a = WORD(13, '91,4%'); for (let k = a - 8; k < a + 22; k += 2) add('count', k, 0.3); }
        { const a = V(19) + 6; for (let k = a; k < a + 70; k += 3) add('count', k, 0.28); }
        { const a = WORD(8, 'vồ'); for (let k = a + 18; k < S(9) - 10; k += 18) add('thud', k, 0.35); }
        add('sunrise', V(10) - 30, 0.55);
        add('click', WORD(23, 'tắt'), 0.6);
        return list.map(([n, at, v], i) => (
          <Sequence key={`sfx${i}`} from={at} durationInFrames={90}>
            <Audio src={staticFile(`audio/ep58-su-tu/sfx/${n}.wav`)} volume={v} />
          </Sequence>
        ));
      })()}

      {void VE}
    </AbsoluteFill>
  );
};
