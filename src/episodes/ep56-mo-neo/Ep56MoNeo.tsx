import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp01} from '../../library/anim';
import '../../library/filament/theme'; // 载入越南语字体（Lora / Cormorant / Noto Serif Black）
import {Dust, GildedBg, Grain} from '../../library/gilded/stage';
import {G, GF, goldText, goldTextLight} from '../../library/gilded/theme';
import {Portrait} from '../../library/gilded/Portrait';
import {AFTER1, AFTER2, CITE, CUES, cueEnd, cueStart, EV, LIGHT, SLAMS, V, WT, VO, DARK2_FROM, DARK_FROM, DURATION, FPS, FREEZE, H, HIT, HIT2, SFX, W} from './timeline';

/**
 * ep56 Hiệu ứng mỏ neo（暗金文献风，横屏，越南语）。见 timeline.ts 顶部说明。
 */
const TXT = "'Filament Viet Text', serif";
const DISP = "'Filament Viet Display', serif";
const BLACK = "'Filament Viet Black', serif";
type Pt = [number, number];

const ease = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const easeIO = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const soft = (f: number, at: number, dur = 18, out?: number, outDur = 14) => {
  const v = ease((f - at) / dur) * (out === undefined ? 1 : 1 - clamp01((f - out) / outDur));
  return {opacity: v, filter: v < 1 ? `blur(${(1 - v) * 10}px)` : undefined, v};
};
const rnd = (i: number, s = 1) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const freezeAt = (f: number) => {
  for (const h of [HIT, HIT2]) if (f >= h - FREEZE && f < h) return h - FREEZE;
  return f;
};
const darkness = (f: number) => {
  for (const [from, h] of [
    [DARK_FROM, HIT],
    [DARK2_FROM, HIT2],
  ])
    if (f >= from && f < h) return 0.93 * ease((f - from) / (h - FREEZE - from));
  return 0;
};

const Seg: React.FC<{f: number; from: number; to: number; fade?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({f, from, to, fade = 14, style, children}) => {
  if (f < from - fade || f > to + fade) return null;
  const vin = clamp01((f - from + fade) / (fade * 2));
  const vout = 1 - clamp01((f - to + fade) / (fade * 2));
  const v = vin * vout;
  // 甩镜：从右边甩进来，往左边甩出去，带横向拖影
  const dx = (1 - ease(vin)) * 260 - (1 - vout) * (1 - vout) * 320;
  const sc = 1 + (1 - vin) * 0.12 - (1 - vout) * 0.06;
  return <AbsoluteFill style={{opacity: v, transform: `translateX(${dx}px) scale(${sc})`, filter: v < 1 ? `blur(${(1 - v) * 14}px)` : undefined, ...style}}>{children}</AbsoluteFill>;
};
const cam = (f: number, at: number, len: number, z0: number, z1: number, origin: Pt = [50, 50]): React.CSSProperties => ({
  transform: `scale(${z0 + (z1 - z0) * easeIO((f - at) / len)})`,
  transformOrigin: `${origin[0]}% ${origin[1]}%`,
});

/** 字幕：底部居中，逐字柔入，【】变金；重拍小节不出 */
const Subs: React.FC<{f: number}> = ({f}) => {
  const i = CUES.findIndex((_, k) => f >= cueStart(k) - 2 && f < cueEnd(k));
  if (i < 0 || (f >= HIT && f < AFTER1) || (f >= HIT2 && f < AFTER2)) return null;
  const at = cueStart(i);
  const o = 1 - clamp01((f - (cueEnd(i) - 8)) / 8);
  const parts: {c: string; hi: boolean}[] = [];
  let hi = false;
  for (const c of CUES[i]) {
    if (c === '【') hi = true;
    else if (c === '】') hi = false;
    else parts.push({c, hi});
  }
  return (
    <div style={{position: 'absolute', left: 120, right: 120, top: 935, textAlign: 'center', fontFamily: TXT, fontWeight: 500, fontSize: 44, letterSpacing: '0.01em', lineHeight: 1.3, opacity: o, filter: o < 1 ? `blur(${(1 - o) * 8}px)` : undefined}}>
      {parts.map((p, k) => {
        const v = ease((f - at - (VO[i].times[k] ?? 0) * FPS) / 7);
        return (
          <span key={k} style={{opacity: v, filter: v < 1 ? `blur(${(1 - v) * 8}px)` : undefined, ...(p.hi ? goldTextLight(0.4) : {color: G.ivory, textShadow: '0 2px 12px rgba(0,0,0,0.9)'})}}>
            {p.c}
          </span>
        );
      })}
    </div>
  );
};

/** 爆点大字（Smash 的越南语版） */
const VSmash: React.FC<{f: number; at: number; text: string; size: number; sub?: string; y?: number; red?: boolean}> = ({f, at, text, size, sub, y = 470, red}) => {
  const t = f - at;
  if (t < 0) return null;
  const s = 1.14 - 0.14 * ease(t / 9) + 0.006 * Math.sin(t / 14);
  const r = size * 1.4 + (1300 - size * 1.4) * ease(t / 40);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 55% at 50% ${(y / H) * 100}%, rgba(255,226,160,0.5) 0%, rgba(214,160,80,0.16) 40%, rgba(0,0,0,0) 75%)`, opacity: 1 - clamp01(t / 26) * 0.75}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <circle cx={W / 2} cy={y} r={r} fill="none" stroke={G.goldBright} strokeWidth={3 - 2 * clamp01(t / 40)} opacity={(1 - clamp01(t / 40)) * 0.8} style={{filter: `drop-shadow(0 0 10px ${G.gold})`}} />
        <circle cx={W / 2} cy={y} r={r * 0.72} fill="none" stroke={G.gold} strokeWidth={1} opacity={(1 - clamp01(t / 34)) * 0.5} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: y - size * 0.66, textAlign: 'center', transform: `scale(${s})`, filter: t < 8 ? `blur(${(1 - t / 8) * 8}px)` : undefined}}>
        <span style={{fontFamily: DISP, fontWeight: 600, fontSize: size, letterSpacing: '0.04em', whiteSpace: 'nowrap', ...goldText(1.2)}}>{text}</span>
      </div>
      {sub ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: y + size * 0.55, textAlign: 'center', fontFamily: GF.latinItalic, fontSize: 34, letterSpacing: 3, color: G.ivoryDim, opacity: clamp01((t - 18) / 14)}}>{sub}</div>
      ) : null}
    </AbsoluteFill>
  );
};

/** 右上文献引用（越南语版 BookCite） */
const Cite: React.FC<{f: number; at: number; out?: number}> = ({f, at, out}) => {
  const s = soft(f, at, 22, out);
  return (
    <div style={{position: 'absolute', right: 56, top: 38, opacity: s.opacity, filter: s.filter, display: 'flex', gap: 14, alignItems: 'flex-start'}}>
      <div style={{textAlign: 'right', maxWidth: 620}}>
        <div style={{fontFamily: GF.latinItalic, fontSize: 19, color: G.ivoryDim, lineHeight: 1.25}}>{CITE.original}</div>
        <div style={{fontFamily: TXT, fontSize: 24, color: G.gold, marginTop: 6}}>« {CITE.title} »</div>
        <div style={{fontFamily: GF.latin, fontSize: 17, color: G.ivoryFaint, marginTop: 6, letterSpacing: 1}}>{CITE.meta}</div>
        <div style={{height: 1, marginTop: 8, background: `linear-gradient(270deg, ${G.goldLine}, rgba(214,180,106,0))`}} />
      </div>
      <div style={{width: 34, height: 34, background: G.sealRed, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BLACK, fontSize: 11, color: '#f6dccb', lineHeight: 1, textAlign: 'center', boxShadow: 'inset 0 0 0 2px rgba(255,220,200,0.25)'}}>
        SCI
      </div>
    </div>
  );
};

/** 朱红印章（横排） */
const Stamp: React.FC<{f: number; at: number; text: string; x: number; y: number; size?: number; rot?: number}> = ({f, at, text, x, y, size = 64, rot = -9}) => {
  const t = f - at;
  if (t < 0) return null;
  const p = clamp01(t / 8);
  const s = p < 1 ? 1.7 - 0.75 * p : 0.95 + 0.05 * clamp01((t - 8) / 6);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: clamp01(t / 4), border: `4px solid ${G.sealRed}`, borderRadius: 8, padding: '8px 22px', fontFamily: BLACK, fontSize: size, lineHeight: 1, color: G.sealRed, letterSpacing: '0.08em', background: 'rgba(179,54,42,0.08)', boxShadow: '0 0 30px rgba(179,54,42,0.35)'}}>
      {text}
    </div>
  );
};

/* ---------- 镜头震动：每次「砸下」后 10 帧内衰减 ---------- */
const shakeAt = (f: number) => {
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
  for (const e of SLAMS()) hit(e, 24);
  for (const e of LIGHT()) hit(e, 9);
  return `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${r.toFixed(2)}deg)`;
};
/** 每次砸下：画面猛地推近再弹回 + 一闪金光 */
const punch = (f: number) => {
  let s = 0;
  let fl = 0;
  for (const e of SLAMS()) {
    const t = f - e;
    if (t >= 0 && t < 20) {
      s += 0.075 * Math.exp(-t / 4.5) * Math.cos(t * 0.5);
      fl = Math.max(fl, 0.22 * Math.exp(-t / 2.5));
    }
  }
  for (const e of LIGHT()) {
    const t = f - e;
    if (t >= 0 && t < 12) s += 0.025 * Math.exp(-t / 3);
  }
  return {s: 1 + s, fl};
};

/** 左上年份抬头（越南语版） */
const Header: React.FC<{f: number; at: number; year: string; caption: string; out?: number}> = ({f, at, year, caption, out}) => {
  const s = soft(f, at, 20, out);
  return (
    <div style={{position: 'absolute', left: 56, top: 34, opacity: s.opacity, filter: s.filter}}>
      <div style={{fontFamily: DISP, fontWeight: 600, fontSize: 66, lineHeight: 1.05, letterSpacing: 4, fontVariantNumeric: 'lining-nums', ...goldText(0.4)}}>{year}</div>
      <div style={{width: 340, height: 1, marginTop: 6, background: `linear-gradient(90deg, ${G.gold} 0%, rgba(214,180,106,0.35) 60%, rgba(214,180,106,0) 100%)`}} />
      <div style={{fontFamily: TXT, fontSize: 22, color: G.ivoryDim, marginTop: 12, letterSpacing: 1}}>{caption}</div>
    </div>
  );
};

/** 地面舞台：一条金色地平线 + 地面反光 */
const Stage: React.FC<{y: number; o?: number}> = ({y, o = 1}) => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: y, height: H - y, background: 'linear-gradient(180deg, rgba(60,42,20,0.35) 0%, rgba(0,0,0,0) 70%)', opacity: o}} />
    <div style={{position: 'absolute', left: 80, right: 80, top: y, height: 1, background: 'linear-gradient(90deg, rgba(214,180,106,0), rgba(214,180,106,0.5), rgba(214,180,106,0))', opacity: o}} />
  </>
);


/* ---------- 共用小件 ---------- */
/** 从上方砸下：at 落地，之前 8 帧加速下落，落地后轻微压扁回弹 */
const drop = (f: number, at: number, from = -520) => {
  const t = f - at;
  if (t < -8) return {y: from, o: 0, sx: 1, sy: 1};
  if (t < 0) {
    const u = (t + 8) / 8;
    return {y: from * (1 - u * u), o: clamp01(u * 3), sx: 0.92, sy: 1.1};
  }
  const b = Math.exp(-t / 3) * Math.cos(t * 1.4);
  return {y: 0, o: 1, sx: 1 + 0.12 * b, sy: 1 - 0.12 * b};
};
const Tile: React.FC<{f: number; at: number; x: number; y: number; text: string; size?: number; tone?: 'gold' | 'red' | 'dim'}> = ({f, at, x, y, text, size = 128, tone = 'gold'}) => {
  const d = drop(f, at);
  if (d.o <= 0) return null;
  const glow = clamp01(1 - (f - at) / 18);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2 + d.y,
        width: size,
        height: size,
        opacity: d.o,
        transform: `scale(${d.sx}, ${d.sy})`,
        transformOrigin: '50% 100%',
        borderRadius: 14,
        border: `2px solid ${tone === 'red' ? G.red : tone === 'dim' ? G.goldLine : G.gold}`,
        background: 'linear-gradient(180deg, rgba(46,34,18,0.96), rgba(16,11,6,0.96))',
        boxShadow: `0 14px 30px rgba(0,0,0,0.7), 0 0 ${10 + 30 * glow}px rgba(243,220,160,${0.15 + 0.5 * glow})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: DISP,
        fontWeight: 600,
        fontSize: size * (text.length > 2 ? 0.42 : 0.56),
        fontVariantNumeric: 'lining-nums',
        ...goldText(0.4),
      }}
    >
      <span style={{...goldText(0.4)}}>{text}</span>
    </div>
  );
};
/** 金色对勾印 / 红叉印 */
const Mark: React.FC<{f: number; at: number; x: number; y: number; ok?: boolean; size?: number; label?: string}> = ({f, at, x, y, ok = true, size = 110, label}) => {
  const t = f - at;
  if (t < 0) return null;
  const p = clamp01(t / 7);
  const s = p < 1 ? 1.8 - 0.8 * p : 1;
  const c = ok ? G.goldBright : G.red;
  const ring = clamp01(t / 18);
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, transform: `scale(${s}) rotate(${ok ? -6 : 6}deg)`, opacity: clamp01(t / 3)}}>
      <svg width={size} height={size} viewBox="-50 -50 100 100" style={{overflow: 'visible'}}>
        <circle r={44} fill="rgba(20,14,8,0.6)" stroke={c} strokeWidth={4} style={{filter: `drop-shadow(0 0 8px ${c})`}} />
        <circle r={44 + 40 * ring} fill="none" stroke={c} strokeWidth={2} opacity={1 - ring} />
        {ok ? <path d="M-22,2 L-6,18 L24,-18" fill="none" stroke={c} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /> : <path d="M-18,-18 L18,18 M18,-18 L-18,18" stroke={c} strokeWidth={9} strokeLinecap="round" />}
      </svg>
      {label ? <div style={{position: 'absolute', left: size + 14, top: size / 2 - 22, fontFamily: BLACK, fontSize: 36, letterSpacing: '0.1em', color: c, whiteSpace: 'nowrap'}}>{label}</div> : null}
    </div>
  );
};
/** 竖向仪表 */
const Meter: React.FC<{x: number; y: number; h: number; v: number; label: string; red?: boolean; o?: number}> = ({x, y, h, v, label, red, o = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 46, height: h, opacity: o, border: `2px solid ${red ? G.red : G.goldLine}`, borderRadius: 8}}>
    <div style={{position: 'absolute', left: 4, right: 4, bottom: 4, height: Math.max(0, (h - 8) * Math.min(1, v)), borderRadius: 4, background: red ? `linear-gradient(0deg, ${G.redDeep}, ${G.red})` : `linear-gradient(0deg, ${G.goldDeep}, ${G.goldBright})`, boxShadow: v > 0.95 && !red ? `0 0 30px ${G.goldBright}` : undefined}} />
    <div style={{position: 'absolute', top: h + 14, left: -60, width: 166, textAlign: 'center', fontFamily: TXT, fontSize: 24, color: G.ivoryDim}}>{label}</div>
    <div style={{position: 'absolute', top: -46, left: -60, width: 166, textAlign: 'center', fontFamily: DISP, fontWeight: 600, fontSize: 32, color: red ? '#ff8a72' : G.gold, fontVariantNumeric: 'lining-nums tabular-nums'}}>{Math.round(Math.min(1, v) * 100)}%</div>
  </div>
);
const lerpSteps = (f: number, steps: [number, number][], dur = 12) => {
  let v = 0;
  for (const [at, val] of steps) if (f >= at) v = v + (val - v) * ease((f - at) / dur);
  return v;
};


/* ---------- 锚 ---------- */
const AnchorIcon: React.FC<{size?: number; c?: string; glow?: number}> = ({size = 120, c = G.gold, glow = 0.4}) => (
  <svg width={size} height={size * 1.15} viewBox="-50 -58 100 115" style={{overflow: 'visible', filter: `drop-shadow(0 0 ${8 + 20 * glow}px rgba(243,220,160,${glow}))`}}>
    <circle cy={-46} r={9} fill="none" stroke={c} strokeWidth={6} />
    <line x1={0} y1={-37} x2={0} y2={44} stroke={c} strokeWidth={8} strokeLinecap="round" />
    <line x1={-24} y1={-20} x2={24} y2={-20} stroke={c} strokeWidth={7} strokeLinecap="round" />
    <path d="M-40,14 C-38,40 -16,50 0,50 C16,50 38,40 40,14" fill="none" stroke={c} strokeWidth={8} strokeLinecap="round" />
    <path d="M-48,22 L-40,8 L-30,22 Z M48,22 L40,8 L30,22 Z" fill={c} />
  </svg>
);
/** 锚从天而降：at 落地 */
const FallingAnchor: React.FC<{f: number; at: number; x: number; y: number; size?: number; c?: string; chain?: boolean}> = ({f, at, x, y, size = 130, c, chain = true}) => {
  const d = drop(f, at, -900);
  if (d.o <= 0) return null;
  const top = y + d.y;
  const glow = clamp01(1 - (f - at) / 20);
  return (
    <>
      {chain ? <div style={{position: 'absolute', left: x - 2, top: -20, width: 4, height: Math.max(0, top + 20), background: `repeating-linear-gradient(180deg, ${G.goldDeep} 0 10px, rgba(0,0,0,0) 10px 14px)`, opacity: d.o}} /> : null}
      <div style={{position: 'absolute', left: x - size / 2, top, opacity: d.o, transform: `scale(${d.sx}, ${d.sy})`, transformOrigin: '50% 100%'}}>
        <AnchorIcon size={size} c={c} glow={0.3 + 0.6 * glow} />
      </div>
      {f >= at ? (
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
          <ellipse cx={x} cy={top + size * 1.12} rx={size * (0.5 + 1.5 * clamp01((f - at) / 20))} ry={size * 0.15 * (1 + clamp01((f - at) / 20))} fill="none" stroke={G.goldBright} strokeWidth={3} opacity={1 - clamp01((f - at) / 20)} />
        </svg>
      ) : null}
    </>
  );
};

/* ---------- 命运轮 ---------- */
const SEG = 20;
const wheelRot = (f: number, from: number, to: number, value: number) => {
  const target = 1080 + (value / 5) * (360 / SEG);
  if (f < from) return 0;
  const p = clamp01((f - from) / (to - from));
  return -target * (1 - Math.pow(1 - p, 3));
};
const Wheel: React.FC<{f: number; cx: number; cy: number; r: number; from: number; to: number; value: number; o?: number}> = ({f, cx, cy, r, from, to, value, o = 1}) => {
  const rot = wheelRot(f, from, to, value);
  const won = f >= to;
  const pulse = won ? clamp01(1 - (f - to) / 24) : 0;
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
      <g transform={`translate(${cx} ${cy})`}>
        <circle r={r + 16} fill="none" stroke={G.goldDeep} strokeWidth={3} />
        <g transform={`rotate(${rot})`}>
          {Array.from({length: SEG}, (_, i) => {
            const a0 = ((i - 0.5) * 360) / SEG - 90;
            const a1 = ((i + 0.5) * 360) / SEG - 90;
            const p = (a: number) => [r * Math.cos((a * Math.PI) / 180), r * Math.sin((a * Math.PI) / 180)];
            const [x0, y0] = p(a0);
            const [x1, y1] = p(a1);
            const isWin = won && i * 5 === value;
            const am = (i * 360) / SEG;
            return (
              <g key={i}>
                <path d={`M0,0 L${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1} Z`} fill={isWin ? 'rgba(243,220,160,0.55)' : i % 2 ? 'rgba(214,180,106,0.16)' : 'rgba(30,22,12,0.92)'} stroke={G.goldLine} strokeWidth={1.5} />
                <text transform={`rotate(${am}) translate(0 ${-r * 0.8})`} textAnchor="middle" dominantBaseline="middle" fontFamily={DISP} fontWeight={600} fontSize={r * 0.11} fill={isWin ? '#1a120a' : G.gold}>
                  {i * 5}
                </text>
              </g>
            );
          })}
          <circle r={r * 0.16} fill="#1a120a" stroke={G.gold} strokeWidth={4} />
        </g>
        <path d={`M-18,${-r - 34} L18,${-r - 34} L0,${-r + 6} Z`} fill={G.goldBright} style={{filter: `drop-shadow(0 0 10px ${G.gold})`}} />
        {won ? <circle r={r + 16 + 120 * (1 - pulse)} fill="none" stroke={G.goldBright} strokeWidth={3} opacity={pulse} /> : null}
      </g>
    </svg>
  );
};
const BigNum: React.FC<{f: number; at: number; x: number; y: number; text: string; size?: number}> = ({f, at, x, y, text, size = 150}) => {
  const t = f - at;
  if (t < 0) return null;
  const s = t < 8 ? 1.5 - 0.5 * (t / 8) : 1;
  return (
    <div style={{position: 'absolute', left: x - 300, top: y - size * 0.6, width: 600, textAlign: 'center', transform: `scale(${s})`, opacity: clamp01(t / 4)}}>
      <span style={{fontFamily: DISP, fontWeight: 600, fontSize: size, lineHeight: 1.1, fontVariantNumeric: 'lining-nums', ...goldText(1)}}>{text}</span>
    </div>
  );
};

/* ---------- 开场：命运轮 + 提问 ---------- */
const Hook: React.FC<{f: number}> = ({f}) => {
  const q = ease((f - EV.question()) / 20);
  const g0 = EV.guess();
  const sx = (v: number) => 760 + (v / 100) * 900;
  const gv = 30 + 30 * ease((f - g0 - 10) / 50) + 3 * Math.sin((f - g0) / 7) * (1 - ease((f - g0 - 40) / 30));
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      <AbsoluteFill style={{transform: `translate(${-470 * q}px, ${-110 * q}px) scale(${1 - 0.5 * q})`, transformOrigin: '50% 45%'}}>
        <Wheel f={f} cx={960} cy={480} r={320} from={EV.spin()} to={EV.stop()} value={65} o={soft(f, 0, 16).v} />
      </AbsoluteFill>
      <BigNum f={f} at={EV.stop() + 2} x={960 + (1 - q) * 520 - q * 760} y={480 - q * 290} text="65" size={170 - 50 * q} />
      {q > 0 ? (
        <div style={{position: 'absolute', left: 820, top: 210, width: 920, opacity: clamp01((q - 0.55) / 0.45), transform: `translateY(${(1 - q) * 30}px)`}}>
          <div style={{fontFamily: TXT, fontSize: 26, letterSpacing: '0.18em', color: G.ivoryDim}}>CÂU HỎI</div>
          <div style={{fontFamily: DISP, fontWeight: 600, fontSize: 60, lineHeight: 1.2, marginTop: 10, color: G.ivory}}>
            Châu Phi chiếm <span style={goldTextLight(0.6)}>bao nhiêu %</span> số nước trong Liên Hợp Quốc?
          </div>
        </div>
      ) : null}
      {f >= g0 - 6 ? (
        <div style={{position: 'absolute', inset: 0, opacity: soft(f, g0 - 6, 12).v}}>
          <div style={{position: 'absolute', left: sx(0), top: 640, width: 900, height: 6, borderRadius: 3, background: G.goldFaint}} />
          {[0, 25, 50, 75, 100].map((v) => (
            <div key={v} style={{position: 'absolute', left: sx(v) - 40, top: 662, width: 80, textAlign: 'center', fontFamily: DISP, fontSize: 28, color: G.ivoryDim}}>{v}%</div>
          ))}
          <div style={{position: 'absolute', left: sx(65) - 1, top: 600, width: 2, height: 80, background: G.goldLine, opacity: 0.6}} />
          <div style={{position: 'absolute', left: sx(65) - 60, top: 568, width: 120, textAlign: 'center', fontFamily: TXT, fontSize: 20, color: G.goldLine}}>65</div>
          <div style={{position: 'absolute', left: sx(gv) - 30, top: 612, width: 60, height: 60, borderRadius: 30, background: G.goldBright, boxShadow: `0 0 24px ${G.goldBright}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BLACK, fontSize: 30, color: '#1a120a'}}>?</div>
          <div style={{position: 'absolute', left: sx(gv) - 100, top: 720, width: 200, textAlign: 'center', fontFamily: TXT, fontSize: 26, color: G.gold}}>bạn đoán</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- 1974：两个轮子 + 两根柱 ---------- */
const Study: React.FC<{f: number}> = ({f}) => {
  const w0 = EV.wheels();
  const up = ease((f - EV.barA() + 30) / 20);
  const cy = 500 - 230 * up;
  const r = 220 - 90 * up;
  const base = 830;
  const hA = 9 * 25 * ease((f - EV.barA() + 10) / 14);
  const hB = 9 * 45 * ease((f - EV.barB() + 10) / 14);
  const pull = clamp01((f - EV.pull()) / 16);
  const bar = (x: number, h: number, v: number, at: number) => (
    <>
      <div style={{position: 'absolute', left: x - 90, top: base - h, width: 180, height: h, borderRadius: '8px 8px 0 0', background: `linear-gradient(0deg, ${G.goldDeep}, ${G.goldBright})`, boxShadow: `0 0 ${20 + 30 * clamp01(1 - (f - at) / 20)}px rgba(243,220,160,0.4)`}} />
      {f >= at - 10 ? <div style={{position: 'absolute', left: x - 150, top: base - h - 86, width: 300, textAlign: 'center', fontFamily: DISP, fontWeight: 600, fontSize: 72, fontVariantNumeric: 'lining-nums', ...goldText(0.8)}}>{Math.round((h / 9) * 1)}%</div> : null}
    </>
  );
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      <Wheel f={f} cx={640} cy={cy} r={r} from={w0} to={EV.stopA()} value={10} o={soft(f, w0 - 10, 12).v} />
      <Wheel f={f} cx={1280} cy={cy} r={r} from={w0} to={EV.stopB()} value={65} o={soft(f, w0 - 10, 12).v} />
      {f >= EV.stopA() ? <div style={{position: 'absolute', left: 640 - r - 140, top: cy - 40, fontFamily: DISP, fontWeight: 600, fontSize: 70, ...goldText(0.8)}}>10</div> : null}
      {f >= EV.stopB() ? <div style={{position: 'absolute', left: 1280 + r + 40, top: cy - 40, fontFamily: DISP, fontWeight: 600, fontSize: 70, ...goldText(0.8)}}>65</div> : null}
      {up > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: up}}>
          <div style={{position: 'absolute', left: 380, right: 380, top: base, height: 2, background: G.goldLine}} />
          {bar(640, hA, 25, EV.barA())}
          {bar(1280, hB, 45, EV.barB())}
          <div style={{position: 'absolute', left: 540, top: base + 16, width: 200, textAlign: 'center', fontFamily: TXT, fontSize: 24, color: G.ivoryDim}}>nhóm thấy 10</div>
          <div style={{position: 'absolute', left: 1180, top: base + 16, width: 200, textAlign: 'center', fontFamily: TXT, fontSize: 24, color: G.ivoryDim}}>nhóm thấy 65</div>
        </div>
      ) : null}
      {pull > 0 ? (
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {[
            [640, 9 * 25],
            [1280, 9 * 45],
          ].map(([x, h], k) => (
            <path key={k} d={`M${x},${cy + r + 10} L${x},${base - h - 100}`} stroke={G.goldBright} strokeWidth={4} strokeDasharray="12 8" strokeDashoffset={-f * 2} opacity={pull} style={{filter: `drop-shadow(0 0 8px ${G.gold})`}} />
          ))}
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- 锚 + 挪不远 ---------- */
const Adjust: React.FC<{f: number}> = ({f}) => {
  const y = 640;
  const ax = 420;
  const truth = 1450;
  let step = 0;
  for (let k = 0; k < 5; k++) step += ease((f - EV.steps(k)) / 6);
  let tug = 0;
  for (let k = 0; k < 3; k++) {
    const t = f - EV.tug(k);
    if (t >= 0 && t < 24) tug += 90 * Math.sin((t / 24) * Math.PI) * (t < 8 ? t / 8 : 1);
  }
  const mx = ax + step * 90 + tug;
  const early = soft(f, EV.stopEarly(), 10).v;
  const lineIn = ease((f - AFTER1) / 16);
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      <div style={{position: 'absolute', left: 200, top: y, width: 1520 * lineIn, height: 4, background: G.goldLine}} />
      {Array.from({length: 11}, (_, k) => (
        <div key={k} style={{position: 'absolute', left: 200 + k * 152, top: y - 10, width: 2, height: 24, background: G.goldLine, opacity: lineIn}} />
      ))}
      <div style={{position: 'absolute', left: truth - 80, top: y - 170, width: 160, textAlign: 'center', opacity: soft(f, AFTER1 + 10, 14).v}}>
        <div style={{fontFamily: TXT, fontSize: 24, color: G.ivoryDim}}>sự thật</div>
        <div style={{margin: '8px auto 0', width: 4, height: 120, background: `repeating-linear-gradient(180deg, ${G.ivoryDim} 0 8px, rgba(0,0,0,0) 8px 14px)`}} />
      </div>
      <FallingAnchor f={f} at={EV.anchor()} x={ax} y={y + 20} size={120} />
      {f >= EV.anchor() ? <div style={{position: 'absolute', left: ax - 80, top: y + 170, width: 160, textAlign: 'center', fontFamily: TXT, fontSize: 26, color: G.gold}}>neo</div> : null}
      {f >= EV.steps(0) - 6 ? (
        <>
          <svg width={W} height={H} style={{position: 'absolute'}}>
            <path d={`M${ax},${y + 30} Q${(ax + mx) / 2},${y + 30 + (tug > 10 ? 0 : 30)} ${mx},${y}`} fill="none" stroke={G.goldDeep} strokeWidth={4} strokeDasharray="10 5" />
          </svg>
          <div style={{position: 'absolute', left: mx - 32, top: y - 32, width: 64, height: 64, borderRadius: 32, background: G.goldBright, boxShadow: `0 0 24px ${G.goldBright}`, opacity: soft(f, EV.steps(0) - 6, 8).v}} />
          <div style={{position: 'absolute', left: mx - 100, top: y - 100, width: 200, textAlign: 'center', fontFamily: TXT, fontSize: 24, color: G.goldBright}}>câu trả lời</div>
        </>
      ) : null}
      {early > 0 ? (
        <div style={{position: 'absolute', left: ax + 450 + 40, top: y + 50, width: truth - ax - 450 - 80, opacity: early}}>
          <div style={{height: 22, borderLeft: `3px solid ${G.red}`, borderRight: `3px solid ${G.red}`, borderBottom: `3px solid ${G.red}`}} />
          <div style={{textAlign: 'center', marginTop: 12, fontFamily: BLACK, fontSize: 34, letterSpacing: '0.06em', color: G.red}}>DỪNG QUÁ SỚM</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- 划线价 ---------- */
const PriceTag: React.FC<{f: number}> = ({f}) => {
  const t0 = EV.tag();
  const swing = 6 * Math.sin((f - t0) / 14) * Math.exp(-(f - t0) / 80) - 4;
  const strike = clamp01((f - EV.strike()) / 8);
  const a = ease((f - t0) / 16);
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      <div style={{position: 'absolute', left: 960 - 2, top: -20, width: 4, height: 210 * a + 20, background: G.goldDeep}} />
      <div style={{position: 'absolute', left: 560, top: 180, width: 800, height: 520, transform: `translateY(${(1 - a) * -300}px) rotate(${swing}deg)`, transformOrigin: '50% 0%', opacity: a}}>
        <svg width={800} height={520} style={{position: 'absolute'}}>
          <path d="M400,10 L780,140 L780,510 L20,510 L20,140 Z" fill="rgba(36,26,14,0.97)" stroke={G.gold} strokeWidth={3} />
          <circle cx={400} cy={80} r={18} fill={G.bg} stroke={G.gold} strokeWidth={3} />
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: TXT, fontSize: 28, letterSpacing: '0.2em', color: G.ivoryDim}}>ÁO SƠ MI</div>
        {f >= EV.oldPrice() - 4 ? (
          <div style={{position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center'}}>
            <span style={{position: 'relative', fontFamily: DISP, fontWeight: 600, fontSize: 70, color: strike > 0 ? G.ivoryDim : G.ivory}}>
              1.000.000đ
              <span style={{position: 'absolute', left: -10, top: '52%', height: 6, width: `${strike * 105}%`, background: G.red, borderRadius: 3, transform: 'rotate(-4deg)', boxShadow: `0 0 10px ${G.red}`}} />
            </span>
          </div>
        ) : null}
        {f >= EV.newPrice() ? (
          <div style={{position: 'absolute', left: 0, right: 0, top: 310, textAlign: 'center', transform: `scale(${f - EV.newPrice() < 8 ? 1.5 - 0.5 * ((f - EV.newPrice()) / 8) : 1})`}}>
            <span style={{fontFamily: DISP, fontWeight: 600, fontSize: 130, fontVariantNumeric: 'lining-nums', ...goldText(1.1)}}>499.000đ</span>
          </div>
        ) : null}
      </div>
      {f >= EV.cheap() - 10 ? <FallingAnchor f={f} at={EV.cheap() - 2} x={1460} y={330} size={110} chain /> : null}
      <Stamp f={f} at={EV.cheap()} text="RẺ!" x={1460} y={600} size={80} rot={-10} />
    </AbsoluteFill>
  );
};

/* ---------- 菜单 ---------- */
const MENU: [string, string][] = [
  ['Bò Wagyu nướng đá', '2.000.000'],
  ['Tôm hùm sốt bơ', '1.200.000'],
  ['Cá hồi áp chảo', '500.000'],
  ['Salad rau mùa', '150.000'],
];
const Menu: React.FC<{f: number}> = ({f}) => {
  const m0 = EV.menu();
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      <AbsoluteFill style={cam(f, m0, EV.interview() - m0, 1.02, 1.06, [50, 50])}>
        <div style={{position: 'absolute', left: 560, top: 110, width: 800, height: 780, opacity: soft(f, m0 - 4, 14).v, border: `2px solid ${G.gold}`, borderRadius: 16, background: 'linear-gradient(180deg, rgba(40,29,15,0.97), rgba(16,11,6,0.97))', padding: '40px 60px', boxSizing: 'border-box'}}>
          <div style={{textAlign: 'center', fontFamily: DISP, fontWeight: 600, fontSize: 64, letterSpacing: '0.2em', ...goldText(0.5)}}>MENU</div>
          <div style={{height: 1, background: G.goldLine, margin: '18px 0 26px'}} />
          {MENU.map(([n, p], k) => {
            const at = k === 0 ? EV.menuTop() - 6 : m0 + 6 + k * 5;
            const hi = k === 2 && f >= EV.menuMid();
            const top = k === 0 && f >= EV.menuTop();
            return (
              <div key={k} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '22px 18px', marginBottom: 12, borderRadius: 10, opacity: soft(f, at, 10).v, background: hi ? 'rgba(243,220,160,0.14)' : 'transparent', boxShadow: hi ? `0 0 30px rgba(243,220,160,0.25)` : undefined, border: hi ? `1.5px solid ${G.goldBright}` : '1.5px solid transparent'}}>
                <span style={{fontFamily: TXT, fontSize: 36, color: G.ivory}}>{n}</span>
                <span style={{fontFamily: DISP, fontWeight: 600, fontSize: 42, color: top ? G.goldBright : G.gold}}>{p}</span>
              </div>
            );
          })}
        </div>
        {f >= EV.menuTop() - 10 ? <FallingAnchor f={f} at={EV.menuTop()} x={470} y={170} size={100} /> : null}
        <Mark f={f} at={EV.menuMid()} x={1440} y={555} size={90} label="HỢP LÝ" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 面试 ---------- */
const Interview: React.FC<{f: number}> = ({f}) => {
  const i0 = EV.interview();
  const tilt = ease((f - EV.tilt()) / 16);
  const card = (x: number, label: string, lit: boolean) => (
    <div style={{position: 'absolute', left: x, top: 220, width: 380, height: 300, border: `2px solid ${lit ? G.goldBright : G.goldLine}`, borderRadius: 16, background: 'rgba(24,18,10,0.95)', boxShadow: lit ? `0 0 40px rgba(243,220,160,0.35)` : undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: soft(f, i0, 14).v}}>
      <svg width={120} height={120} viewBox="-60 -60 120 120">
        <circle cy={-22} r={24} fill="none" stroke={lit ? G.goldBright : G.gold} strokeWidth={4} />
        <path d="M-44,48 C-44,6 44,6 44,48" fill="none" stroke={lit ? G.goldBright : G.gold} strokeWidth={4} />
      </svg>
      <div style={{fontFamily: TXT, fontSize: 30, letterSpacing: '0.1em', color: G.ivory, marginTop: 16}}>{label}</div>
    </div>
  );
  const sx = (v: number) => 560 + ((v - 10) / 30) * 800;
  const lo = 15 + 7 * tilt;
  const hi = 30 + 2 * tilt;
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      {card(220, 'NHÀ TUYỂN DỤNG', false)}
      {card(1320, 'BẠN · NÓI TRƯỚC', f >= EV.salary())}
      {f >= EV.salary() - 6 ? (
        <div style={{position: 'absolute', left: 760, top: 250, width: 400, textAlign: 'center', transform: `scale(${f - EV.salary() < 8 ? 1.5 - 0.5 * clamp01((f - EV.salary()) / 8) : 1})`, opacity: clamp01((f - EV.salary() + 6) / 6)}}>
          <div style={{fontFamily: TXT, fontSize: 26, color: G.ivoryDim}}>mức lương đề nghị</div>
          <div style={{fontFamily: DISP, fontWeight: 600, fontSize: 96, ...goldText(1)}}>30 triệu</div>
        </div>
      ) : null}
      {f >= EV.salary() - 10 ? <FallingAnchor f={f} at={EV.salary()} x={sx(30)} y={640} size={90} /> : null}
      <div style={{position: 'absolute', inset: 0, opacity: soft(f, i0 + 10, 14).v}}>
        <div style={{position: 'absolute', left: 560, top: 820, width: 800, height: 4, background: G.goldFaint}} />
        <div style={{position: 'absolute', left: sx(lo), top: 800, width: sx(hi) - sx(lo), height: 44, borderRadius: 8, background: 'rgba(214,180,106,0.25)', border: `2px solid ${G.gold}`}} />
        <div style={{position: 'absolute', left: 560, top: 860, width: 800, textAlign: 'center', fontFamily: TXT, fontSize: 24, color: G.ivoryDim}}>khoảng thương lượng</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 每天几十个锚 ---------- */
const TAGS = ['-50%', 'Giá gốc 990k', 'Chỉ còn 3 suất', 'Top 1', '8,5 điểm', '1 tỷ view', 'Giảm 70%', '10.000 lượt bán', '4,9 ★', 'Chỉ hôm nay', 'Từ 99k', 'Lương 50 triệu'];
const Rain: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{transform: shakeAt(f)}}>
    {TAGS.map((t, k) => {
      const at = EV.rain(k);
      const x = 170 + ((k * 5) % 12) * 143;
      const y = 180 + (k % 3) * 190 + rnd(k, 9) * 50;
      return (
        <React.Fragment key={k}>
          <FallingAnchor f={f} at={at} x={x} y={y} size={80} />
          {f >= at ? <div style={{position: 'absolute', left: x - 110, top: y + 100, width: 220, textAlign: 'center', fontFamily: DISP, fontWeight: 600, fontSize: 32, color: G.goldBright, opacity: ease((f - at) / 8), textShadow: '0 2px 10px rgba(0,0,0,0.9)'}}>{t}</div> : null}
        </React.Fragment>
      );
    })}
  </AbsoluteFill>
);

/* ---------- 结尾：先写自己的数 ---------- */
const Close: React.FC<{f: number}> = ({f}) => {
  const c0 = AFTER2;
  const push = ease((f - EV.counter()) / 20);
  const fin = soft(f, EV.final(), 20).v;
  const typed = '300.000đ'.slice(0, Math.max(0, Math.floor((f - V(18) - 6) / 3)));
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      <AbsoluteFill style={{opacity: 1 - fin * 0.85}}>
        <div style={{position: 'absolute', left: 1100 + push * 260, top: 260, width: 520, height: 260, opacity: soft(f, c0, 14).v * (1 - push * 0.7), transform: `rotate(${push * 12}deg)`, border: `2px solid ${G.red}`, borderRadius: 14, background: 'rgba(30,14,10,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: TXT, fontSize: 24, letterSpacing: '0.16em', color: '#e9a596'}}>GIÁ HỌ ĐƯA</div>
          <div style={{fontFamily: DISP, fontWeight: 600, fontSize: 80, color: '#ff8a72'}}>1.000.000đ</div>
        </div>
        <div style={{position: 'absolute', left: 300, top: 260, width: 520, height: 260, opacity: soft(f, V(18), 14).v, border: `2px solid ${G.goldBright}`, borderRadius: 14, background: 'rgba(36,26,14,0.95)', boxShadow: '0 0 40px rgba(243,220,160,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: TXT, fontSize: 24, letterSpacing: '0.16em', color: G.ivoryDim}}>CON SỐ CỦA TÔI</div>
          <div style={{fontFamily: DISP, fontWeight: 600, fontSize: 80, minHeight: 100, ...goldText(0.8)}}>{typed}</div>
        </div>
        <FallingAnchor f={f} at={EV.mine()} x={560} y={560} size={120} />
        {push > 0 ? (
          <svg width={W} height={H} style={{position: 'absolute'}}>
            <path d={`M840,390 L${840 + 220 * push},390`} stroke={G.goldBright} strokeWidth={8} strokeLinecap="round" />
            <path d={`M${830 + 220 * push},366 L${870 + 220 * push},390 L${830 + 220 * push},414`} fill="none" stroke={G.goldBright} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </AbsoluteFill>
      {fin > 0 ? (
        <div style={{position: 'absolute', left: 960 - 160, top: 200, opacity: fin, transform: `scale(${0.85 + 0.15 * fin})`}}>
          <AnchorIcon size={320} c={G.gold} glow={0.7} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: DISP, fontWeight: 600, fontSize: 120, ...goldText(1.2)}}>?</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const Ep56MoNeo: React.FC = () => {
  const real = useCurrentFrame();
  const f = freezeAt(real);
  const dark = darkness(real);
  const flash = (h: number) => (real >= h ? Math.max(0, 1 - (real - h) / 24) : 0);
  const glow = 1 + 1.2 * Math.max(flash(HIT), flash(HIT2));
  const pn = punch(real);
  return (
    <AbsoluteFill style={{background: G.bg}}>
      <Audio src={staticFile('audio/ep56-mo-neo/bgm.wav')} volume={(fr) => (VO.some((v) => fr >= v.start * FPS - 6 && fr < v.end * FPS + 6) ? 0.38 : 0.65)} />
      {VO.map((v, i) => (
        <Sequence key={`vo${i}`} from={V(i)}>
          <Audio src={staticFile(`audio/ep56-mo-neo/vo/${String(i).padStart(2, '0')}.mp3`)} volume={1} />
        </Sequence>
      ))}
      {SFX.map(([file, at, vol], i) => (
        <Sequence key={i} from={at}>
          <Audio src={staticFile(file)} volume={(fr) => vol * (VO.some((v) => at + fr >= v.start * FPS - 4 && at + fr < v.end * FPS + 4) ? 0.4 : 0.75)} />
        </Sequence>
      ))}
      <GildedBg f={f} tone={f >= V(13) && f < HIT2 ? 'cool' : 'warm'} strength={glow} />
      <Dust f={f} />
      <AbsoluteFill style={{transform: `scale(${pn.s})`}}>
      <Portrait f={f} src="img/people/kahneman.jpg" at={WT(5, 2) - 6} out={HIT - 24} x={330} y={500} size={620} o={0.5} dim={EV.wheels()} name="Daniel Kahneman" sub="Nobel Kinh tế 2002" />
      <Portrait f={f} src="img/people/tversky.jpg" at={WT(5, 4) - 6} out={HIT - 24} x={1590} y={500} size={620} o={0.5} dim={EV.wheels()} name="Amos Tversky" sub="1937 – 1996" />

      <Seg f={f} from={0} to={EV.study()} fade={12}>
        <Hook f={f} />
      </Seg>
      <Seg f={f} from={EV.study()} to={HIT + 2} fade={12}>
        <Study f={f} />
      </Seg>
      <Header f={f} at={EV.study()} year="1974" caption="Tversky & Kahneman" out={HIT - 24} />
      <Cite f={f} at={EV.study() + 10} out={HIT - 24} />
      <Seg f={f} from={HIT} to={AFTER1} fade={10}>
        <VSmash f={f} at={HIT} text="HIỆU ỨNG MỎ NEO" size={130} sub="Anchoring effect" />
      </Seg>
      <Seg f={f} from={AFTER1} to={V(13)} fade={12}>
        <Adjust f={f} />
      </Seg>
      <Seg f={f} from={V(13)} to={V(15)} fade={12}>
        <PriceTag f={f} />
      </Seg>
      <Seg f={f} from={V(15)} to={V(16)} fade={12}>
        <Menu f={f} />
      </Seg>
      <Seg f={f} from={V(16)} to={V(17)} fade={12}>
        <Interview f={f} />
      </Seg>
      <Seg f={f} from={V(17)} to={HIT2 + 2} fade={12}>
        <Rain f={f} />
      </Seg>
      <Seg f={f} from={HIT2} to={AFTER2} fade={10}>
        <VSmash f={f} at={HIT2} text="AI ĐẶT NEO?" size={190} y={480} />
      </Seg>
      <Seg f={f} from={AFTER2} to={DURATION + 20} fade={14}>
        <Close f={f} />
      </Seg>

      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(255,236,190,1), rgba(214,160,80,0.4) 60%, rgba(0,0,0,0) 85%)', opacity: pn.fl, pointerEvents: 'none', mixBlendMode: 'screen'}} />
      <Subs f={f} />
      <AbsoluteFill style={{background: '#000', opacity: dark, pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: '#000', opacity: clamp01((real - (DURATION - FPS)) / FPS), pointerEvents: 'none'}} />
      <Grain />
    </AbsoluteFill>
  );
};
