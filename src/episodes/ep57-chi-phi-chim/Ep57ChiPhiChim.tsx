import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp01} from '../../library/anim';
import '../../library/filament/theme'; // 载入越南语字体（Lora / Cormorant / Noto Serif Black）
import {Dust, GildedBg, Grain} from '../../library/gilded/stage';
import {G, GF, goldText, goldTextLight} from '../../library/gilded/theme';
import {Portrait} from '../../library/gilded/Portrait';
import {AFTER1, AFTER2, CITE, CUES, cueEnd, cueStart, EV, LIGHT, SLAMS, V, WT, VO, DARK2_FROM, DARK_FROM, DURATION, FPS, FREEZE, H, HIT, HIT2, SFX, W} from './timeline';
import {Img} from 'remotion';

/**
 * ep57 Chi phí chìm（暗金文献风 · 真 3D 空间：CSS perspective + preserve-3d，一台镜头在世界里飞）。见 timeline.ts 顶部说明。
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


/* ===================== 3D 引擎 ===================== */
/** 镜头：位置 (x,y,z)，俯仰 rx（负=往下看），偏航 ry（正=往右看）。CSS 坐标：y 向下，镜头朝 -z 看 */
type Cam = {x: number; y: number; z: number; rx: number; ry: number};
const P = 1100; // 透视距离
const FLOOR = 300;
const CamCtx = React.createContext<{cam: Cam; f: number}>({cam: {x: 0, y: 0, z: 0, rx: 0, ry: 0}, f: 0});
const D2R = Math.PI / 180;
/** 点在镜头前方的深度（view 空间 -z） */
const depthOf = (c: Cam, x: number, y: number, z: number) => {
  const qx = x - c.x;
  const qy = y - c.y;
  const qz = z - c.z;
  const a = -c.ry * D2R; // 画面里 rotateY 取了负号
  const b = c.rx * D2R;
  // Ry
  const z1 = -qx * Math.sin(a) + qz * Math.cos(a);
  // Rx
  const z2 = qy * Math.sin(b) + z1 * Math.cos(b);
  return -z2;
};

type K = [number, number, number, number, number, number]; // frame, x, y, z, rx, ry
const camAt = (keys: K[], f: number): Cam => {
  if (f <= keys[0][0]) {
    const k = keys[0];
    return {x: k[1], y: k[2], z: k[3], rx: k[4], ry: k[5]};
  }
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (f < b[0]) {
      const t = easeIO((f - a[0]) / Math.max(1, b[0] - a[0]));
      const m = (j: number) => a[j] + (b[j] - a[j]) * t;
      return {x: m(1), y: m(2), z: m(3), rx: m(4), ry: m(5)};
    }
  }
  const k = keys[keys.length - 1];
  return {x: k[1], y: k[2], z: k[3], rx: k[4], ry: k[5]};
};

/** 世界里的一个物体。flat 内容直接给 children；立体内容给 (opacity)=>节点 */
const Obj: React.FC<{
  x: number;
  y: number;
  z: number;
  rx?: number;
  ry?: number;
  rz?: number;
  s?: number;
  o?: number;
  near?: number;
  far?: number;
  children: React.ReactNode | ((o: number) => React.ReactNode);
}> = ({x, y, z, rx = 0, ry = 0, rz = 0, s = 1, o = 1, near = 120, far = 5200, children}) => {
  const {cam} = React.useContext(CamCtx);
  const d = depthOf(cam, x, y, z);
  const fade = clamp01((d - near) / 260) * (1 - clamp01((d - far) / 2400));
  const a = o * fade;
  if (a < 0.004) return null;
  const tf = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${s})`;
  if (typeof children === 'function')
    return <div style={{position: 'absolute', left: 0, top: 0, transformStyle: 'preserve-3d', transform: tf}}>{children(a)}</div>;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transformStyle: 'preserve-3d', transform: tf}}>
      <div style={{position: 'absolute', left: 0, top: 0, transform: 'translate(-50%, -50%)', opacity: a, width: 'max-content', backfaceVisibility: 'hidden'}}>{children}</div>
    </div>
  );
};

/** 立方体（中心为原点）。c 主色 rgb 三元组 */
const Box: React.FC<{w: number; h: number; d: number; c?: [number, number, number]; o?: number; edge?: string; front?: React.ReactNode}> = ({w, h, d, c = [64, 46, 24], o = 1, edge = 'rgba(214,180,106,0.55)', front}) => {
  const col = (k: number) => `rgba(${Math.round(c[0] * k)},${Math.round(c[1] * k)},${Math.round(c[2] * k)},0.96)`;
  const face = (fw: number, fh: number, tf: string, k: number, child?: React.ReactNode) => (
    <div style={{position: 'absolute', left: -fw / 2, top: -fh / 2, width: fw, height: fh, transform: tf, background: col(k), border: `1.5px solid ${edge}`, opacity: o, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{child}</div>
  );
  return (
    <div style={{position: 'absolute', transformStyle: 'preserve-3d'}}>
      {face(w, h, `rotateY(180deg) translateZ(${d / 2}px)`, 0.5)}
      {face(d, h, `rotateY(-90deg) translateZ(${w / 2}px)`, 0.7)}
      {face(d, h, `rotateY(90deg) translateZ(${w / 2}px)`, 0.6)}
      {face(w, d, `rotateX(-90deg) translateZ(${h / 2}px)`, 0.4)}
      {face(w, d, `rotateX(90deg) translateZ(${h / 2}px)`, 1.35)}
      {face(w, h, `translateZ(${d / 2}px)`, 1, front)}
    </div>
  );
};

/** 硬币：几层圆片叠出厚度 */
const Coin: React.FC<{r: number; o: number; label: string; spin: number; red?: boolean}> = ({r, o, label, spin, red}) => (
  <div style={{position: 'absolute', transformStyle: 'preserve-3d', transform: `rotateY(${spin}deg)`}}>
    {Array.from({length: 7}, (_, i) => (
      <div key={i} style={{position: 'absolute', left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: '50%', transform: `translateZ(${(i - 3) * 5}px)`, opacity: o, background: i === 6 || i === 0 ? (red ? 'radial-gradient(circle at 35% 30%, #ffb59f, #b3362a 70%)' : 'radial-gradient(circle at 35% 30%, #fff1c6, #d6b46a 55%, #7a5a26 100%)') : red ? '#7a2018' : '#8a6a30', border: `3px solid ${red ? '#ff8a72' : G.goldBright}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {i === 6 ? <span style={{fontFamily: DISP, fontWeight: 700, fontSize: r * 0.42, color: '#3a2a10', textAlign: 'center', lineHeight: 1.05}}>{label}</span> : null}
      </div>
    ))}
  </div>
);

/** 3D 卡片（平面） */
const Card: React.FC<{w: number; h: number; children: React.ReactNode; tone?: 'gold' | 'red' | 'dim'; glow?: number}> = ({w, h, children, tone = 'gold', glow = 0.3}) => {
  const bc = tone === 'red' ? G.red : tone === 'dim' ? 'rgba(214,180,106,0.35)' : G.goldBright;
  return (
    <div style={{width: w, height: h, borderRadius: 22, border: `3px solid ${bc}`, background: tone === 'red' ? 'linear-gradient(180deg, rgba(60,18,12,0.95), rgba(24,8,6,0.95))' : 'linear-gradient(180deg, rgba(48,34,16,0.95), rgba(16,11,6,0.96))', boxShadow: `0 0 ${60 * glow}px rgba(243,220,160,${glow}), inset 0 0 40px rgba(0,0,0,0.6)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: 20}}>
      {children}
    </div>
  );
};
const Lbl: React.FC<{size: number; children: React.ReactNode; c?: string; gold?: boolean; ls?: string}> = ({size, children, c = G.ivory, gold, ls = '0.04em'}) => (
  <div style={{fontFamily: DISP, fontWeight: 600, fontSize: size, lineHeight: 1.1, letterSpacing: ls, whiteSpace: 'nowrap', textAlign: 'center', ...(gold ? goldText(0.8) : {color: c})}}>{children}</div>
);

/** 从上方砸进世界：返回 y 偏移和挤压 */
const fall = (f: number, at: number, h = 900) => {
  const t = f - at;
  if (t < -10) return {dy: -h, sq: 1, v: 0};
  if (t < 0) {
    const p = (t + 10) / 10;
    return {dy: -h * (1 - p * p), sq: 1, v: 1};
  }
  return {dy: 0, sq: 1 - 0.12 * Math.exp(-t / 3) * Math.cos(t * 0.9), v: 1};
};
const rise = (f: number, at: number, dur = 16) => easeIO((f - at) / dur);

/* ===================== 世界里的东西 ===================== */
const Floor: React.FC<{f: number}> = ({f}) => (
  <div style={{position: 'absolute', left: -5000, top: -16000, width: 10000, height: 32000, transform: `translate3d(0px, ${FLOOR}px, -10000px) rotateX(90deg)`, background: `repeating-linear-gradient(0deg, rgba(214,180,106,0.16) 0 2px, rgba(0,0,0,0) 2px 200px), repeating-linear-gradient(90deg, rgba(214,180,106,0.12) 0 2px, rgba(0,0,0,0) 2px 200px), radial-gradient(ellipse 30% 50% at 50% 50%, rgba(90,62,28,0.35), rgba(0,0,0,0) 70%)`, WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 30%, #000 70%, transparent 100%)', backgroundPosition: `0 ${(f * 0) % 200}px`}} />
);

/** 地上的坑：发光圆口 + 往下的一圈圈 */
const Pit: React.FC<{x: number; z: number; r: number; o: number}> = ({x, z, r, o}) => (
  <>
    {Array.from({length: 7}, (_, i) => (
      <Obj key={i} x={x} y={FLOOR + i * 90} z={z} rx={90} o={o * (1 - i / 8)} near={40}>
        <div style={{width: (r - i * 22) * 2, height: (r - i * 22) * 2, borderRadius: '50%', border: `${i === 0 ? 5 : 2}px solid ${i === 0 ? G.goldBright : 'rgba(214,180,106,0.4)'}`, background: i === 0 ? 'radial-gradient(circle, #000 55%, rgba(0,0,0,0.85) 70%, rgba(80,50,20,0.4) 100%)' : 'transparent', boxShadow: i === 0 ? `0 0 50px ${G.gold}` : undefined}} />
      </Obj>
    ))}
  </>
);

/* ---------- 场 1：电影院 ---------- */
const Cinema: React.FC<{f: number; mode?: 'all' | 'noTicket' | 'ticket'}> = ({f, mode = 'all'}) => {
  const tk = fall(f, EV.ticket(), 700);
  const sinkT = clamp01((f - EV.sink() + 12) / 26);
  // 票：先在中间砸下，银幕亮时让到右边，出选择牌时落到前下方，最后掉进坑
  const side = easeIO((f - EV.screen()) / 16) * (1 - easeIO((f - EV.signs()) / 16));
  const low = easeIO((f - EV.signs()) / 16) * (1 - easeIO((f - V(4)) / 14));
  const tkX = 430 * side;
  const tkY = -60 + tk.dy + 40 * side + 100 * low + sinkT * sinkT * 1300;
  const tkZ = -800 - sinkT * 260;
  const tkS = 1 - 0.25 * side - 0.3 * low;
  const scr = rise(f, EV.screen(), 14);
  const mins = Math.min(20, Math.max(0, Math.floor((f - EV.screen()) / 2)));
  const bad = f >= EV.bad();
  const sg = (k: number) => fall(f, EV.signs() + k * 8, 500);
  const stay = f >= EV.stay();
  const pitO = clamp01((f - V(4) + 10) / 16);
  const ticket = f >= EV.ticket() - 12 ? (
        <Obj x={tkX} y={tkY} z={tkZ} rz={-6 + sinkT * 40} rx={sinkT * 50} ry={8 * Math.sin(f / 30) - 14 * side} s={tk.sq * tkS} near={40}>
          <div style={{width: 520, height: 250, borderRadius: 18, background: 'linear-gradient(135deg, #f3dca0, #c9a45a)', border: '3px dashed rgba(60,40,10,0.6)', boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(243,220,160,0.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontFamily: TXT, fontSize: 26, letterSpacing: '0.3em', color: '#5a4012'}}>VÉ XEM PHIM</div>
            <div style={{fontFamily: DISP, fontWeight: 700, fontSize: 92, color: '#2a1c06', opacity: clamp01((f - EV.price() + 4) / 6)}}>100.000đ</div>
            {f >= EV.regret() ? <div style={{fontFamily: BLACK, fontSize: 30, color: G.sealRed, border: `3px solid ${G.sealRed}`, padding: '2px 14px', transform: `rotate(-8deg) scale(${1.6 - 0.6 * ease((f - EV.regret()) / 7)})`}}>TIẾC TIỀN VÉ</div> : null}
          </div>
        </Obj>
      ) : null;
  if (mode === 'ticket') return ticket;
  return (
    <>
      {/* 银幕 */}
      <Obj x={0} y={-300} z={-2600} o={0.25 + 0.75 * scr}>
        <div style={{width: 1700, height: 720, borderRadius: 10, background: bad ? 'radial-gradient(ellipse at 50% 45%, rgba(120,40,30,0.75), rgba(30,10,8,0.95))' : 'radial-gradient(ellipse at 50% 45%, rgba(220,200,160,0.55), rgba(40,30,18,0.95))', border: `4px solid ${G.goldLine}`, boxShadow: `0 0 ${140 * scr}px rgba(243,220,160,${0.35 * scr})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: DISP, fontWeight: 600, fontSize: 150, color: G.ivory, opacity: scr, fontVariantNumeric: 'tabular-nums'}}>{`${mins}:00`}</div>
          {bad ? <div style={{fontFamily: BLACK, fontSize: 130, color: '#ff8a72', transform: `scale(${1.3 - 0.3 * ease((f - EV.bad()) / 8)})`, letterSpacing: '0.08em'}}>DỞ TỆ</div> : null}
        </div>
      </Obj>
      {/* 座椅三排 */}
      {[0, 1, 2].map((r) =>
        Array.from({length: 7}, (_, i) => (
          <Obj key={`${r}-${i}`} x={(i - 3) * 200} y={FLOOR - 70} z={-1520 - r * 260} near={60}>
            {(o) => <Box w={160} h={140} d={130} o={o} c={[110, 30, 26]} edge="rgba(214,120,90,0.4)" />}
          </Obj>
        )),
      )}
      {/* 两个选择牌 */}
      {[0, 1].map((k) => {
        const s = sg(k);
        if (f < EV.signs() - 12) return null;
        const chosen = stay && k === 0;
        const dim = stay && k === 1;
        return (
          <Obj key={k} x={k === 0 ? -470 : 470} y={-170 + s.dy} z={-950} ry={k === 0 ? 14 : -14} o={dim ? 0.35 : 1} s={chosen ? 1 + 0.08 * ease((f - EV.stay()) / 8) : 1}>
            <Card w={400} h={190} tone={chosen ? 'gold' : 'dim'} glow={chosen ? 0.6 : 0.15}>
              <Lbl size={58} gold={chosen} c={G.ivoryDim}>{k === 0 ? 'NGỒI TIẾP' : 'ĐI VỀ'}</Lbl>
            </Card>
          </Obj>
        );
      })}
      {/* 坑 */}
      <Pit x={0} z={-1060} r={300} o={pitO} />
      {mode === 'noTicket' ? null : ticket}
    </>
  );
};

/* ---------- 场 2：1985 两张滑雪票 ---------- */
const SZ = -4300;
const Study: React.FC<{f: number}> = ({f}) => {
  const card = (k: number) => {
    const at = k === 0 ? EV.c100() : EV.c50();
    const s = fall(f, at, 800);
    if (f < at - 12) return null;
    const pick = f >= EV.pick100();
    const red = pick && k === 0;
    return (
      <Obj x={k === 0 ? -380 : 380} y={FLOOR - 300 + s.dy} z={SZ} ry={k === 0 ? 10 : -10} s={s.sq}>
        <Card w={440} h={560} tone={red ? 'red' : 'gold'} glow={0.35}>
          <div style={{fontFamily: TXT, fontSize: 28, letterSpacing: '0.24em', color: G.ivoryDim}}>TRƯỢT TUYẾT</div>
          <div style={{fontFamily: TXT, fontSize: 30, color: G.ivoryDim, marginTop: 10}}>{k === 0 ? 'Michigan' : 'Wisconsin'}</div>
          <div style={{fontFamily: DISP, fontWeight: 700, fontSize: 170, lineHeight: 1.1, ...(red ? {color: '#ff8a72'} : goldText(1))}}>{k === 0 ? '$100' : '$50'}</div>
          <div style={{fontFamily: TXT, fontSize: 30, color: k === 1 && f >= EV.fun() ? G.goldBright : G.ivoryFaint, marginTop: 6}}>{k === 1 && f >= EV.fun() ? 'vui hơn hẳn ★★★' : k === 0 && f >= EV.fun() ? 'kém vui ★' : 'cùng ngày'}</div>
        </Card>
      </Obj>
    );
  };
  // 两根「开心」柱
  const funP = rise(f, EV.fun() + 4, 22);
  const cols: [number, number][] = [
    [-380, 160],
    [380, 470],
  ];
  // 10 个小人方块：6 个去 $100，4 个去 $50
  const tok = Array.from({length: 10}, (_, i) => {
    const go = ease((f - EV.tokens(i)) / 14);
    const left = i % 5 !== 4 && i < 9 ? i < 6 : false;
    const toLeft = i < 6;
    void left;
    const x0 = (i - 4.5) * 70;
    const x1 = toLeft ? -380 + ((i % 3) - 1) * 70 + 0 : 380 + (((i - 6) % 2) - 0.5) * 80;
    const z1 = SZ + 330 + (toLeft ? Math.floor(i / 3) * 70 : Math.floor((i - 6) / 2) * 70);
    return {x: x0 + (x1 - x0) * go, z: SZ + 520 + (z1 - SZ - 520) * go, toLeft};
  });
  const tokO = clamp01((f - V(8) + 6) / 10);
  const stampT = f - EV.pick100();
  return (
    <>
      <Obj x={0} y={-380} z={SZ - 1300} o={0.22}>
        <div style={{fontFamily: DISP, fontWeight: 700, fontSize: 620, letterSpacing: 20, ...goldText(0.6)}}>1985</div>
      </Obj>
      {cols.map(([x, h], k) => {
        const hh = Math.max(4, h * funP);
        if (f < EV.fun() - 4) return null;
        return (
          <Obj key={k} x={x} y={FLOOR - hh / 2} z={SZ - 380} near={60}>
            {(o) => <Box w={120} h={hh} d={120} o={o} c={k === 1 ? [200, 160, 80] : [90, 70, 40]} edge={k === 1 ? 'rgba(255,236,180,0.9)' : 'rgba(214,180,106,0.4)'} />}
          </Obj>
        );
      })}
      {card(0)}
      {card(1)}
      {tokO > 0
        ? tok.map((t, i) => (
            <Obj key={i} x={t.x} y={FLOOR - 30} z={t.z} o={tokO} near={60}>
              {(o) => <Box w={50} h={60} d={50} o={o} c={t.toLeft && f >= EV.tokens(i) + 10 ? [190, 70, 50] : [170, 140, 90]} edge="rgba(255,236,190,0.6)" />}
            </Obj>
          ))
        : null}
      {stampT >= 0 ? (
        <Obj x={-380} y={-360} z={SZ + 60} rz={-8} s={stampT < 8 ? 1.8 - 0.8 * (stampT / 8) : 1}>
          <div style={{fontFamily: BLACK, fontSize: 64, color: '#ff8a72', border: `5px solid ${G.sealRed}`, borderRadius: 10, padding: '8px 22px', background: 'rgba(179,54,42,0.15)', boxShadow: '0 0 40px rgba(179,54,42,0.5)'}}>HƠN 1/2 CHỌN</div>
        </Obj>
      ) : null}
    </>
  );
};

/* ---------- 场 3：坠入隧道 + 沉下去的三样东西 ---------- */
const TZ0 = -5800;
const Tunnel: React.FC<{f: number}> = ({f}) => {
  const three = ['TIỀN', 'THỜI\nGIAN', 'CÔNG\nSỨC'];
  const goneT = clamp01((f - EV.gone()) / 30);
  return (
    <>
      {Array.from({length: 15}, (_, i) => (
        <Obj key={i} x={0} y={-100} z={TZ0 - i * 260} rz={i * 9 + f * 0.4} near={30} far={4200}>
          <div style={{width: 1500 - i * 20, height: 1500 - i * 20, borderRadius: '50%', border: `${i % 3 === 0 ? 6 : 2}px ${i % 3 === 0 ? 'solid' : 'dashed'} ${i % 3 === 0 ? G.gold : 'rgba(214,180,106,0.45)'}`, boxShadow: i % 3 === 0 ? `0 0 40px rgba(214,180,106,0.4), inset 0 0 40px rgba(214,180,106,0.25)` : undefined}} />
        </Obj>
      ))}
      {/* 漂浮的硬币 */}
      {Array.from({length: 26}, (_, i) => (
        <Obj key={`c${i}`} x={(rnd(i, 3) - 0.5) * 1100} y={-100 + (rnd(i, 5) - 0.5) * 900 + ((f * (2 + rnd(i, 7) * 3)) % 900) - 450} z={TZ0 - 100 - rnd(i, 9) * 3400} near={40}>
          {(o) => <Coin r={34} o={o * 0.8} label="đ" spin={f * (3 + rnd(i, 11) * 5)} />}
        </Obj>
      ))}
      {/* 三枚大币：钱 / 时间 / 力气，然后沉进深处 */}
      {[0, 1, 2].map((k) => {
        const at = EV.three(k);
        if (f < at - 10) return null;
        const s = fall(f, at, 600);
        return (
          <Obj key={k} x={(k - 1) * 440} y={-100 + s.dy + goneT * goneT * 900} z={TZ0 - 2700 - goneT * goneT * 2600} near={60}>
            {(o) => <Coin r={150} o={o} label={three[k]} spin={Math.sin((f - at) / 18) * 25} />}
          </Obj>
        );
      })}
      {/* 拉着往前走的锁链 */}
      {f >= EV.pull() - 2
        ? Array.from({length: 12}, (_, i) => {
            const p = ease((f - EV.pull()) / 14);
            return (
              <Obj key={`l${i}`} x={0} y={-100 + i * 0} z={TZ0 - 2700 + i * 160 * p} rz={i % 2 ? 90 : 0} near={50} o={p}>
                <div style={{width: 120, height: 60, borderRadius: 30, border: `10px solid ${G.goldBright}`, boxShadow: `0 0 20px ${G.gold}`}} />
              </Obj>
            );
          })
        : null}
    </>
  );
};

/* ---------- 场 4：Concorde ---------- */
const CZ = -10600;
const ConcordeScene: React.FC<{f: number}> = ({f}) => {
  const img = rise(f, V(11) - 6, 30);
  const lossP = rise(f, EV.loss() + 6, 40);
  const fs = fall(f, EV.fallacy(), 700);
  return (
    <>
      <Obj x={0} y={-380} z={CZ - 1100} o={0.55 * img} far={7000}>
        <div style={{width: 2200, height: 1396, filter: 'grayscale(1) sepia(0.6) brightness(0.85) contrast(1.05)', WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 40%, rgba(0,0,0,0.4) 65%, transparent 80%)'}}>
          <Img src={staticFile('img/ep57/concorde.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.1 - 0.1 * clamp01((f - EV.concorde()) / 300)})`}} />
        </div>
      </Obj>
      <Obj x={0} y={-660} z={CZ - 900} o={img}>
        <div style={{textAlign: 'center'}}>
          <Lbl size={130} gold ls="0.12em">CONCORDE</Lbl>
          <div style={{fontFamily: TXT, fontSize: 36, color: G.ivoryDim, letterSpacing: '0.2em', marginTop: 8}}>ANH · PHÁP · 1976 – 2003</div>
        </div>
      </Obj>
      {/* 亏损柱：越往后越往地下扎 */}
      {f >= EV.loss()
        ? Array.from({length: 6}, (_, i) => {
            const h = 60 + i * 70;
            const hh = Math.max(4, h * clamp01(lossP * 6 - i));
            return (
              <Obj key={i} x={-900 + i * 110} y={FLOOR + hh / 2} z={CZ + 200} near={60}>
                {(o) => <Box w={80} h={hh} d={80} o={o} c={[170, 50, 36]} edge="rgba(255,138,114,0.8)" />}
              </Obj>
            );
          })
        : null}
      {f >= EV.loss() + 10 ? (
        <Obj x={-630} y={FLOOR - 120} z={CZ + 200} o={clamp01((f - EV.loss() - 10) / 10)}>
          <Lbl size={90} c="#ff8a72">LỖ ↓</Lbl>
        </Obj>
      ) : null}
      {/* 钱塔：一叠一叠砸下来 */}
      {Array.from({length: 12}, (_, k) => {
        const at = EV.pour(k);
        if (f < at - 10) return null;
        const s = fall(f, at, 700);
        return (
          <Obj key={`m${k}`} x={640 + (rnd(k, 2) - 0.5) * 30} y={FLOOR - 28 - k * 56 + s.dy} z={CZ + 200} ry={(rnd(k, 4) - 0.5) * 30} near={60}>
            {(o) => <Box w={300} h={56} d={150} o={o} c={[70, 110, 60]} edge="rgba(200,240,170,0.6)" front={<span style={{fontFamily: DISP, fontWeight: 700, fontSize: 34, color: 'rgba(230,255,210,0.9)'}}>$$$</span>} />}
          </Obj>
        );
      })}
      {f >= EV.fallacy() - 10 ? (
        <Obj x={0} y={-80 + fs.dy} z={CZ + 500} s={fs.sq}>
          <Card w={900} h={200} tone="red" glow={0.4}>
            <Lbl size={78} c="#ffd0c2" ls="0.06em">NGỤY BIỆN CONCORDE</Lbl>
            <div style={{fontFamily: GF.latinItalic, fontSize: 30, color: G.ivoryDim, marginTop: 6}}>Concorde fallacy</div>
          </Card>
        </Obj>
      ) : null}
    </>
  );
};

/* ---------- 场 5：生活卡片走廊 ---------- */
const CARDS: {x: number; z: number; title: string; paid: string; why: string}[] = [
  {x: -400, z: -13600, title: 'BUFFET', paid: 'đã trả 299k', why: 'trả tiền rồi'},
  {x: 400, z: -14900, title: 'TÌNH CẢM', paid: 'đã bỏ 5 năm', why: 'đã lỡ đầu tư'},
  {x: -400, z: -16200, title: 'NGÀNH HỌC', paid: 'đã học 2 năm', why: 'đã học 2 năm rồi'},
];
const Corridor: React.FC<{f: number}> = ({f}) => (
  <>
    {CARDS.map((c, k) => {
      const at = EV.card(k);
      if (f < at - 30) return null;
      const s = fall(f, at, 600);
      const hit = f >= EV.cardHit(k);
      return (
        <React.Fragment key={k}>
          <Obj x={c.x} y={-140 + s.dy} z={c.z} ry={c.x < 0 ? 8 : -8} s={s.sq}>
            <Card w={620} h={420} glow={0.35}>
              <Lbl size={84} gold ls="0.08em">{c.title}</Lbl>
              <div style={{fontFamily: TXT, fontSize: 36, color: G.ivoryDim, marginTop: 14}}>{c.paid}</div>
              {hit ? <div style={{marginTop: 22, fontFamily: BLACK, fontSize: 44, color: '#ff8a72', border: `4px solid ${G.sealRed}`, borderRadius: 8, padding: '4px 18px', transform: `rotate(-6deg) scale(${1.6 - 0.6 * ease((f - EV.cardHit(k)) / 7)})`}}>« {c.why} »</div> : null}
            </Card>
          </Obj>
          {/* 卡片脚下的铁球：拖着走 */}
          <Obj x={c.x} y={FLOOR - 70} z={c.z + 40} near={60} o={clamp01((f - at) / 12)}>
            <div style={{width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #8a8070, #2a241c 70%)', boxShadow: '0 20px 40px rgba(0,0,0,0.8)'}} />
          </Obj>
        </React.Fragment>
      );
    })}
  </>
);

/* ---------- 场 6：巨大的「0」环 + 提问 ---------- */
const ZZ = -18400;
const ZeroGate: React.FC<{f: number}> = ({f}) => {
  if (f < HIT2 - 40) return null;
  const on = rise(f, HIT2, 20);
  const ch = f >= EV.choose();
  return (
    <>
      {Array.from({length: 9}, (_, i) => (
        <Obj key={i} x={0} y={-150} z={ZZ + (i - 4) * 26} near={30} far={7000} o={on * (1 - Math.abs(i - 4) / 6)}>
          <div style={{width: 1300, height: 1800, borderRadius: '50%', border: `${i === 4 ? 26 : 8}px solid ${i === 4 ? G.goldBright : G.gold}`, boxShadow: i === 4 ? `0 0 90px ${G.gold}, inset 0 0 90px rgba(214,180,106,0.5)` : undefined}} />
        </Obj>
      ))}
      {f >= V(19) ? (
        <Obj x={0} y={-180} z={ZZ - 1300} o={clamp01((f - V(19)) / 14)}>
          <Card w={980} h={400} glow={0.45}>
            <div style={{fontFamily: TXT, fontSize: 34, letterSpacing: '0.2em', color: G.ivoryDim}}>BẮT ĐẦU LẠI TỪ SỐ 0</div>
            <Lbl size={78} gold>Có chọn lại không?</Lbl>
            <div style={{display: 'flex', gap: 40, marginTop: 26}}>
              {['CÓ', 'KHÔNG'].map((t, k) => (
                <div key={t} style={{width: 260, height: 90, borderRadius: 14, border: `3px solid ${ch ? (k === 0 ? G.goldBright : 'rgba(214,180,106,0.4)') : G.goldLine}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISP, fontWeight: 700, fontSize: 44, color: ch && k === 0 ? '#2a1c06' : G.ivory, background: ch && k === 0 ? G.goldBright : 'transparent', boxShadow: ch && k === 0 ? `0 0 40px ${G.gold}` : undefined}}>
                  {t}
                </div>
              ))}
            </div>
          </Card>
        </Obj>
      ) : null}
    </>
  );
};

/* ===================== 镜头路线 ===================== */
const camKeys = (): K[] => [
  [0, 0, -140, 900, 3, 0],
  [EV.ticket() + 12, 0, -90, 180, 0, 0],
  [EV.screen() + 6, 0, -90, 120, 0, 0],
  [EV.bad() + 4, 0, -160, -260, 3, 0],
  [EV.signs() + 4, 0, -110, -60, 0, 0],
  [EV.stay() + 10, -160, -110, -170, 0, -8],
  [V(4) + 4, -120, -150, -160, -6, -4],
  [EV.sink() - 6, 0, -620, -360, -48, 0],
  [EV.sink() + 20, 0, -680, -520, -58, 0],
  [V(5) + 4, 0, -720, -1500, -14, 0],
  [V(5) + 34, 0, -900, -2600, -10, 0],
  [EV.cards() + 4, 0, -220, -3000, -2, 0],
  [EV.fun(), 120, -220, -3250, -2, 6],
  [V(8), 260, -250, -3280, -4, 10],
  [V(8) + 40, -200, -330, -3250, -12, -8],
  [DARK_FROM, -220, -260, -3380, -6, -9],
  [HIT, 0, -100, -5100, 0, 0],
  [AFTER1 + 10, 0, -100, -6900, 0, 0],
  [V(10), 0, -100, -7300, 0, 6],
  [EV.gone() + 30, 0, -100, -7500, 0, -4],
  [V(11) - 4, 0, -110, -8300, 0, 0],
  [EV.concorde() + 10, 0, -180, -9150, 3, 0],
  [V(12) + 10, -280, -150, -9550, 0, -10],
  [V(13) + 10, 280, -320, -9600, -5, 12],
  [V(14) + 6, 0, -220, -9350, 0, 0],
  [V(15) - 14, 0, -220, -9420, 0, 0],
  [V(15) + 4, 0, -200, -10700, 0, 0],
  [EV.card(0) + 18, -320, -160, -12450, 0, 0],
  [EV.card(1) - 4, -320, -160, -12500, 0, 0],
  [EV.card(1) + 18, 320, -160, -13750, 0, 0],
  [EV.card(2) - 4, 320, -160, -13800, 0, 0],
  [EV.card(2) + 18, -320, -160, -15050, 0, 0],
  [DARK2_FROM, -320, -160, -15120, 0, 0],
  [HIT2, 0, -150, -16000, 0, 0],
  [AFTER2 + 6, 0, -150, -16900, 0, 0],
  [V(19) + 20, 0, -170, -18900, 0, 0],
  [EV.choose() + 10, 0, -180, -19150, 0, 0],
  [EV.keep() + 50, 0, -900, -19800, -16, 180],
  [DURATION, 0, -1100, -20600, -18, 180],
];

const World: React.FC<{f: number; cam: Cam}> = ({f, cam}) => (
  <CamCtx.Provider value={{cam, f}}>
    <AbsoluteFill style={{perspective: P, perspectiveOrigin: '50% 50%', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, transformStyle: 'preserve-3d', transform: `translateZ(${P}px) rotateX(${cam.rx}deg) rotateY(${-cam.ry}deg) translate3d(${-cam.x}px, ${-cam.y}px, ${-cam.z}px)`}}>
        <Floor f={f} />
        {f < V(5) + 40 ? <Cinema f={f} mode={f < EV.sink() - 12 ? 'noTicket' : 'all'} /> : null}
        {f >= V(5) - 20 && f < HIT + 10 ? <Study f={f} /> : null}
        {f >= HIT - 2 && f < V(15) ? <Tunnel f={f} /> : null}
        {f >= V(10) && f < EV.card(1) ? <ConcordeScene f={f} /> : null}
        {f >= V(14) ? <Corridor f={f} /> : null}
        <ZeroGate f={f} />
      </div>
    </AbsoluteFill>
    {/* 票在下沉前单独一层渲染，避免 Chrome 3D 排序把座椅面画到票前面 */}
    {f < EV.sink() - 12 ? (
      <AbsoluteFill style={{perspective: P, perspectiveOrigin: '50% 50%', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, transformStyle: 'preserve-3d', transform: `translateZ(${P}px) rotateX(${cam.rx}deg) rotateY(${-cam.ry}deg) translate3d(${-cam.x}px, ${-cam.y}px, ${-cam.z}px)`}}>
          <Cinema f={f} mode="ticket" />
        </div>
      </AbsoluteFill>
    ) : null}
  </CamCtx.Provider>
);

/** 结尾 2D 大字 */
const Final: React.FC<{f: number}> = ({f}) => {
  const a = soft(f, EV.keep() + 6, 20);
  const b = soft(f, EV.final() + 4, 20);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center', marginTop: -120}}>
        <div style={{opacity: a.opacity, filter: a.filter, fontFamily: TXT, fontSize: 44, color: G.ivoryDim, letterSpacing: '0.1em'}}>Thứ bạn đang cố giữ</div>
        <div style={{opacity: b.opacity, filter: b.filter, fontFamily: DISP, fontWeight: 600, fontSize: 110, marginTop: 18, ...goldText(1.1)}}>Đáng — hay chỉ tiếc?</div>
      </div>
    </AbsoluteFill>
  );
};

export const Ep57ChiPhiChim: React.FC = () => {
  const real = useCurrentFrame();
  const f = freezeAt(real);
  const dark = darkness(real);
  const flash = (h: number) => (real >= h ? Math.max(0, 1 - (real - h) / 24) : 0);
  const glow = 1 + 1.2 * Math.max(flash(HIT), flash(HIT2));
  const pn = punch(real);
  const keys = React.useMemo(camKeys, []);
  const cam = camAt(keys, f);
  return (
    <AbsoluteFill style={{background: G.bg}}>
      <Audio src={staticFile('audio/ep57-chi-phi-chim/bgm.wav')} volume={(fr) => (VO.some((v) => fr >= v.start * FPS - 6 && fr < v.end * FPS + 6) ? 0.38 : 0.65)} />
      {VO.map((v, i) => (
        <Sequence key={`vo${i}`} from={V(i)}>
          <Audio src={staticFile(`audio/ep57-chi-phi-chim/vo/${String(i).padStart(2, '0')}.mp3`)} volume={1} />
        </Sequence>
      ))}
      {SFX.map(([file, at, vol], i) => (
        <Sequence key={i} from={Math.max(0, at)}>
          <Audio src={staticFile(file)} volume={(fr) => vol * (VO.some((v) => at + fr >= v.start * FPS - 4 && at + fr < v.end * FPS + 4) ? 0.4 : 0.75)} />
        </Sequence>
      ))}
      <GildedBg f={f} tone={f >= V(11) && f < HIT2 ? 'cool' : 'warm'} strength={glow} />
      <AbsoluteFill style={{transform: `${shakeAt(real)} scale(${pn.s})`}}>
        <World f={f} cam={cam} />
      </AbsoluteFill>
      <Dust f={f} />
      <Portrait f={f} src="img/people/arkes.jpg" at={WT(5, 2) - 6} out={EV.cards() + 30} x={330} y={480} size={600} o={0.5} dim={EV.cards()} name="Hal Arkes" sub="Đại học Ohio" />
      {f >= WT(5, 4) - 6 && f < EV.cards() + 50 ? (
        <div style={{position: 'absolute', right: 140, top: 640, width: 480, textAlign: 'center', opacity: soft(f, WT(5, 4) - 6, 18, EV.cards() + 20).opacity}}>
          <div style={{fontFamily: DISP, fontWeight: 600, fontSize: 40, color: G.goldBright, letterSpacing: 2, textShadow: '0 2px 14px rgba(0,0,0,0.9)'}}>Catherine Blumer</div>
          <div style={{fontFamily: TXT, fontSize: 22, color: G.ivoryDim, marginTop: 4}}>đồng tác giả</div>
        </div>
      ) : null}
      <Header f={f} at={EV.study()} year="1985" caption="Arkes & Blumer" out={HIT - 24} />
      <Cite f={f} at={EV.study() + 10} out={HIT - 24} />
      <Seg f={f} from={HIT} to={V(10) - 4} fade={10}>
        <VSmash f={f} at={HIT} text="CHI PHÍ CHÌM" size={170} sub="Sunk cost" />
      </Seg>
      <Seg f={f} from={HIT2} to={V(19) - 4} fade={10}>
        <VSmash f={f} at={HIT2} text="BẮT ĐẦU TỪ SỐ 0" size={140} y={480} />
      </Seg>
      {f >= EV.keep() ? <Final f={f} /> : null}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(255,236,190,1), rgba(214,160,80,0.4) 60%, rgba(0,0,0,0) 85%)', opacity: pn.fl, pointerEvents: 'none', mixBlendMode: 'screen'}} />
      <Subs f={f} />
      <AbsoluteFill style={{background: '#000', opacity: dark, pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: '#000', opacity: clamp01((real - (DURATION - FPS)) / FPS), pointerEvents: 'none'}} />
      <Grain />
    </AbsoluteFill>
  );
};
