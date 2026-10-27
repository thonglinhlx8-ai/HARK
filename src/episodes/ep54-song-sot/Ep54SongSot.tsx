import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp01} from '../../library/anim';
import '../../library/filament/theme'; // 载入越南语字体（Lora / Cormorant / Noto Serif Black）
import {Dust, GildedBg, Grain} from '../../library/gilded/stage';
import {G, GF, goldText, goldTextLight} from '../../library/gilded/theme';
import {B, CITE, CUES, cueEnd, cueStart, EV, SLAMS, V, VO, DARK2_FROM, DARK_FROM, DURATION, FPS, FREEZE, H, HIT, HIT2, SFX, W} from './timeline';

/**
 * ep54 Thiên kiến kẻ sống sót（暗金文献风，横屏，越南语）。
 * nhà / đĩa nhạc sống sót → bóng ma xung quanh → THIÊN KIẾN KẺ SỐNG SÓT → 1943 máy bay & lỗ đạn → động cơ
 * → ảnh chụp lãi & thành viên rời nhóm → một chấm vàng giữa hàng triệu chấm → IM LẶNG → máy bay, động cơ phát sáng + câu hỏi。
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
  const v = clamp01((f - from + fade) / (fade * 2)) * (1 - clamp01((f - to + fade) / (fade * 2)));
  return <AbsoluteFill style={{opacity: v, filter: v < 1 ? `blur(${(1 - v) * 8}px)` : undefined, ...style}}>{children}</AbsoluteFill>;
};
const cam = (f: number, at: number, len: number, z0: number, z1: number, origin: Pt = [50, 50]): React.CSSProperties => ({
  transform: `scale(${z0 + (z1 - z0) * easeIO((f - at) / len)})`,
  transformOrigin: `${origin[0]}% ${origin[1]}%`,
});

/** 字幕：底部居中，逐字柔入，【】变金；重拍小节不出 */
const Subs: React.FC<{f: number}> = ({f}) => {
  const i = CUES.findIndex((_, k) => f >= cueStart(k) - 2 && f < cueEnd(k));
  if (i < 0 || (f >= HIT && f < B(8)) || (f >= HIT2 && f < B(24))) return null;
  const at = cueStart(i);
  const o = 1 - clamp01((f - (cueEnd(i) - 8)) / 8);
  const parts: {c: string; hi: boolean}[] = [];
  let hi = false;
  for (const c of CUES[i][1]) {
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
      <div style={{width: 34, height: 34, background: G.sealRed, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BLACK, fontSize: 13, color: '#f6dccb', lineHeight: 1, textAlign: 'center', boxShadow: 'inset 0 0 0 2px rgba(255,220,200,0.25)'}}>
        SRG
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
  for (const e of SLAMS()) {
    const t = f - e;
    if (t < 0 || t > 14) continue;
    const a = 12 * Math.exp(-t / 3.5);
    x += a * Math.sin(t * 2.7);
    y += a * Math.cos(t * 3.3);
  }
  return `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
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

/* ---------- 开场：老房子 + 唱片 ---------- */
const HOUSE_OUT = 'M-46,0 L-46,-64 L0,-104 L46,-64 L46,0 Z';
const WIN: Pt[] = [
  [-30, -52],
  [10, -52],
  [-30, -26],
];
const House: React.FC<{lit?: number; f: number}> = ({lit = 1, f}) => (
  <g>
    <path d={HOUSE_OUT} fill="rgba(26,18,10,0.95)" stroke={G.gold} strokeWidth={2.4} strokeLinejoin="round" style={{filter: `drop-shadow(0 0 6px ${G.gold})`}} />
    <path d="M-34,-66 L-34,-88 L-22,-88 L-22,-76" fill="none" stroke={G.gold} strokeWidth={2} />
    <rect x={10} y={-30} width={20} height={30} fill="none" stroke={G.goldLine} strokeWidth={1.5} />
    {WIN.map(([x, y], i) => (
      <rect key={i} x={x} y={y} width={18} height={16} fill={`rgba(243,200,120,${(0.55 + 0.15 * Math.sin(f / 9 + i * 2)) * lit})`} style={{filter: 'drop-shadow(0 0 8px rgba(243,200,120,0.8))'}} />
    ))}
  </g>
);
/** 倒掉的房子：先虚线升起，再裂成屋顶 + 两面墙往下砸、扬起灰尘 */
const GhostHouse: React.FC<{f: number; k: number; x: number; y: number}> = ({f, k, x, y}) => {
  const rise = ease((f - EV.houseRise(k)) / 12);
  if (rise <= 0) return null;
  const t = f - EV.houseFall(k);
  const fall = t > 0 ? Math.min(1, Math.pow(t / 12, 2)) : 0;
  const fade = t > 30 ? 1 - clamp01((t - 30) / 20) : 1;
  const piece = (d: string, dx: number, rot: number, drop: number) => (
    <path d={d} transform={`translate(${dx * fall} ${drop * fall}) rotate(${rot * fall})`} fill="rgba(26,18,10,0.6)" stroke={t > 0 ? G.ivoryDim : G.goldLine} strokeWidth={1.8} strokeDasharray={t > 0 ? undefined : '6 6'} strokeLinejoin="round" />
  );
  return (
    <g transform={`translate(${x} ${y}) scale(1 ${rise})`} opacity={fade * 0.85}>
      {piece('M-46,-64 L0,-104 L46,-64 Z', 8, 24, 70)}
      {piece('M-46,0 L-46,-64 L0,-64 L0,0 Z', -16, -14, 22)}
      {piece('M0,0 L0,-64 L46,-64 L46,0 Z', 14, 18, 26)}
      {t > 10
        ? Array.from({length: 7}, (_, j) => {
            const u = clamp01((t - 10) / 34);
            return <circle key={j} cx={(j - 3) * 18 + (j - 3) * 30 * u} cy={-6 - 30 * u * (0.5 + rnd(j, k))} r={8 + 26 * u} fill="rgba(200,180,150,0.18)" opacity={1 - u} />;
          })
        : null}
    </g>
  );
};
const Disc: React.FC<{f: number; ghost?: boolean}> = ({f, ghost}) => (
  <g transform={`rotate(${ghost ? 0 : f * 1.5})`}>
    <circle r={46} fill={ghost ? 'none' : 'rgba(20,14,8,0.9)'} stroke={G.gold} strokeWidth={ghost ? 1.3 : 2.2} strokeDasharray={ghost ? '5 6' : undefined} style={ghost ? undefined : {filter: `drop-shadow(0 0 6px ${G.gold})`}} />
    {[36, 28].map((r) => (
      <circle key={r} r={r} fill="none" stroke={G.goldFaint} strokeWidth={1} />
    ))}
    <circle r={12} fill={ghost ? 'none' : G.sealRed} stroke={G.gold} strokeWidth={1} />
    <line x1={0} y1={-44} x2={0} y2={-16} stroke={G.goldLine} strokeWidth={1} />
  </g>
);
const COLS = 11;
const SURV_H = [3, 6, 8];
const SURV_D = [2, 5, 9];
const colX = (c: number) => 210 + c * 150;
const GH = [0, 1, 2, 4, 5, 7, 9, 10];
const Hook: React.FC<{f: number}> = ({f}) => {
  const dust = V(3) + 30;
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      <AbsoluteFill style={cam(f, 0, DARK_FROM, 1.3, 1.0, [52, 50])}>
        <Stage y={480} o={soft(f, 0, 30).v} />
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {GH.map((c, k) => (
            <GhostHouse key={c} f={f} k={k} x={colX(c)} y={480} />
          ))}
          {SURV_H.map((c, i) => {
            const t = f - (4 + i * 8);
            if (t < 0) return null;
            const drop = (1 - ease(t / 10)) * -40;
            return (
              <g key={c} transform={`translate(${colX(c)} ${480 + drop}) scale(1.12)`} opacity={clamp01(t / 6)}>
                <House f={f} />
              </g>
            );
          })}
          {Array.from({length: COLS}, (_, c) => {
            const surv = SURV_D.includes(c);
            if (surv) {
              const a = soft(f, V(1) + SURV_D.indexOf(c) * 8, 16);
              return (
                <g key={c} transform={`translate(${colX(c)} 720)`} opacity={a.v}>
                  <Disc f={f + c * 20} />
                </g>
              );
            }
            const a = clamp01((f - dust + 6 - rnd(c, 3) * 16) / 10) * (1 - clamp01((f - V(4) - rnd(c, 9) * 20) / 18));
            if (a <= 0) return null;
            // 唱片碎成金粉往下落
            const crumble = clamp01((f - V(4) - rnd(c, 9) * 20) / 18);
            return (
              <g key={c} transform={`translate(${colX(c)} 720)`} opacity={a}>
                <Disc f={0} ghost />
                {crumble > 0
                  ? Array.from({length: 10}, (_, j) => <circle key={j} cx={(rnd(j, c) - 0.5) * 80} cy={(rnd(j, c + 4) - 0.5) * 60 + crumble * 70} r={2} fill={G.gold} />)
                  : null}
              </g>
            );
          })}
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center', fontFamily: TXT, fontSize: 26, letterSpacing: '0.2em', color: G.ivoryDim, opacity: soft(f, V(3) + 40, 20).v}}>
          <span style={{color: G.gold}}>còn lại</span>
          <span style={{margin: '0 22px', color: G.ivoryFaint}}>·</span>
          <span>đã biến mất</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 轰炸机 ---------- */
const FUSE = 'M0,-310 C30,-300 38,-240 38,-180 L34,260 C30,300 10,320 0,326 C-10,320 -30,300 -34,260 L-38,-180 C-38,-240 -30,-300 0,-310 Z';
const WING = 'M36,-70 L455,0 L455,40 L36,30 Z M-36,-70 L-455,0 L-455,40 L-36,30 Z';
const TAIL = 'M30,236 L175,276 L175,302 L28,298 Z M-30,236 L-175,276 L-175,302 L-28,298 Z';
const ENGINES: Pt[] = [
  [-300, -30],
  [-150, -50],
  [150, -50],
  [300, -30],
];
type Hole = {p: Pt; zone: 'wing' | 'body' | 'tail'};
const HOLES: Hole[] = (() => {
  const out: Hole[] = [];
  let i = 0;
  while (out.length < 48 && i < 3000) {
    i++;
    const z = rnd(i, 5);
    let p: Pt;
    let zone: Hole['zone'];
    if (z < 0.52) {
      const side = rnd(i, 6) < 0.5 ? -1 : 1;
      const u = 0.12 + 0.86 * rnd(i, 7);
      const yTop = -70 + u * 70;
      const yBot = 30 + u * 10;
      p = [side * (36 + u * 419), yTop + (yBot - yTop) * (0.2 + 0.6 * rnd(i, 8))];
      zone = 'wing';
    } else if (z < 0.86) {
      p = [(rnd(i, 9) - 0.5) * 50, -120 + rnd(i, 10) * 360];
      zone = 'body';
    } else {
      const side = rnd(i, 11) < 0.5 ? -1 : 1;
      p = [side * (50 + rnd(i, 12) * 110), 262 + rnd(i, 13) * 28];
      zone = 'tail';
    }
    if (ENGINES.some(([ex, ey]) => Math.abs(p[0] - ex) < 40 && Math.abs(p[1] - ey) < 80)) continue;
    out.push({p, zone});
  }
  return out;
})();
/** 装甲板：机翼两块、机身一块（局部坐标） */
const PLATES = ['M60,-62 L430,-4 L430,34 L60,26 Z', 'M-60,-62 L-430,-4 L-430,34 L-60,26 Z', 'M-30,-170 L30,-170 L28,220 L-28,220 Z'];
const ArmorDefs: React.FC = () => (
  <defs>
    <pattern id="armor" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="14" height="14" fill="rgba(214,180,106,0.22)" />
      <line x1="0" y1="0" x2="0" y2="14" stroke="rgba(243,220,160,0.7)" strokeWidth="3" />
    </pattern>
  </defs>
);
/** 一块从上方砸下来的板：at 落地；fallAt 之后往下掉 */
const slamY = (f: number, at: number, from = -700) => {
  const t = (f - (at - 10)) / 10;
  if (t <= 0) return {y: from, o: 0};
  return {y: from * (1 - Math.pow(clamp01(t), 2)), o: clamp01(t * 3)};
};
const Plane: React.FC<{f: number; at: number; holesUpTo?: number; holesDim?: number; plates?: number[]; platesFall?: number; engPlates?: number[]; engineHot?: number; engineGold?: number; draw?: number}> = ({
  f,
  at,
  holesUpTo,
  holesDim = 0,
  plates,
  platesFall,
  engPlates,
  engineHot = 0,
  engineGold = 0,
  draw = 40,
}) => {
  const p = ease((f - at) / draw);
  const common = {fill: 'rgba(30,22,12,0.4)', stroke: G.gold, strokeWidth: 2.4, pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - p, style: {filter: 'drop-shadow(0 0 6px rgba(214,180,106,0.6))'}};
  return (
    <g>
      <path d={WING} {...common} />
      <path d={TAIL} {...common} />
      <path d={FUSE} {...common} />
      <path d="M-16,-250 Q0,-270 16,-250" fill="none" stroke={G.goldLine} strokeWidth={1.5} opacity={p} />
      {ENGINES.map(([x, y], i) => {
        const pulse = 0.5 + 0.5 * Math.sin(f / 6 + i);
        return (
          <g key={i} opacity={p}>
            {engineHot > 0 ? <circle cx={x} cy={y} r={52 + 14 * pulse} fill="none" stroke={G.red} strokeWidth={2.2} opacity={engineHot * (0.5 + 0.5 * pulse)} style={{filter: `drop-shadow(0 0 10px ${G.red})`}} /> : null}
            <ellipse cx={x} cy={y} rx={20} ry={58} fill="rgba(20,14,8,0.9)" stroke={G.gold} strokeWidth={2} />
            <line x1={x - 26} x2={x + 26} y1={y - 58} y2={y - 58} stroke={G.goldLine} strokeWidth={2} />
          </g>
        );
      })}
      {holesUpTo !== undefined
        ? HOLES.map(({p: [x, y]}, i) => {
            const t = holesUpTo - EV.hole(i);
            if (t < 0) return null;
            const flash = 1 - clamp01(t / 7);
            return (
              <g key={i}>
                {flash > 0 ? <circle cx={x} cy={y} r={6 + 26 * (1 - flash)} fill="none" stroke="#fff3d6" strokeWidth={3 * flash} opacity={flash} /> : null}
                {flash > 0.4 ? <circle cx={x} cy={y} r={14 * flash} fill="#fff3d6" opacity={flash} /> : null}
                <circle cx={x} cy={y} r={6} fill={G.red} opacity={1 - 0.7 * holesDim} style={{filter: holesDim < 0.5 ? `drop-shadow(0 0 5px ${G.red})` : undefined}} />
                <circle cx={x} cy={y} r={2.2} fill="#1a0c08" opacity={1 - 0.7 * holesDim} />
              </g>
            );
          })
        : null}
      {plates
        ? PLATES.map((d, k) => {
            const s = slamY(f, plates[k]);
            const ft = platesFall !== undefined ? f - platesFall - k * 3 : -1;
            const fy = ft > 0 ? 900 * Math.pow(ft / 26, 2) : 0;
            const fr2 = ft > 0 ? (k - 1) * ft * 0.8 : 0;
            const o = s.o * (ft > 0 ? 1 - clamp01((ft - 16) / 10) : 1);
            return o > 0 ? <path key={k} d={d} transform={`translate(0 ${s.y + fy}) rotate(${fr2})`} fill="url(#armor)" stroke={G.goldBright} strokeWidth={2.5} opacity={o} style={{filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.8))'}} /> : null;
          })
        : null}
      {engPlates
        ? ENGINES.map(([x, y], k) => {
            const s = slamY(f, engPlates[k], -600);
            const glow = engineGold * (0.7 + 0.3 * Math.sin(f / 8 + k));
            return s.o > 0 ? (
              <g key={k} transform={`translate(0 ${s.y})`} opacity={s.o}>
                <rect x={x - 30} y={y - 74} width={60} height={148} rx={10} fill="url(#armor)" stroke={G.goldBright} strokeWidth={3} style={{filter: `drop-shadow(0 0 ${8 + 14 * glow}px rgba(243,220,160,${0.4 + 0.5 * glow}))`}} />
              </g>
            ) : null;
          })
        : null}
    </g>
  );
};
/** 小号飞机图标（编队、样本格子用） */
const MiniPlane: React.FC<{color?: string; dashed?: boolean; holes?: boolean; engineHits?: boolean; fill?: string}> = ({color = G.gold, dashed, holes, engineHits, fill = 'rgba(30,22,12,0.6)'}) => (
  <g>
    {[WING, TAIL, FUSE].map((d, i) => (
      <path key={i} d={d} fill={dashed ? 'none' : fill} stroke={color} strokeWidth={9} strokeDasharray={dashed ? '26 18' : undefined} strokeLinejoin="round" />
    ))}
    {ENGINES.map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx={22} ry={60} fill={engineHits ? G.red : 'rgba(20,14,8,0.9)'} stroke={color} strokeWidth={7} />
    ))}
    {holes
      ? HOLES.filter((_, i) => i % 3 === 0).map(({p: [x, y]}, i) => (
          <circle key={i} cx={x} cy={y} r={16} fill={G.red} />
        ))
      : null}
  </g>
);

/* 编队：夜空、15 架、高射炮炸开、3 架被打中拖着烟坠落 */
const FORM: Pt[] = [
  [0, -3], [-1, -2], [1, -2], [-2, -1], [0, -1], [2, -1], [-3, 0], [-1, 0], [1, 0], [3, 0], [-2, 1], [0, 1], [2, 1], [-1, 2], [1, 2],
];
const Formation: React.FC<{f: number}> = ({f}) => {
  const w0 = V(6);
  const t = f - w0;
  const flak = EV.flak();
  const fallers = EV.fallers();
  const base = (i: number): Pt => [960 + FORM[i][0] * 120 + Math.sin(t / 30 + i) * 4, 470 + FORM[i][1] * 95 - t * 0.5 + Math.cos(t / 25 + i) * 3];
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(40,52,80,0.45) 0%, rgba(0,0,0,0) 70%)'}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {/* 云 */}
        {Array.from({length: 9}, (_, k) => (
          <ellipse key={k} cx={((rnd(k, 1) * 2200 + t * (0.6 + rnd(k, 2))) % 2300) - 200} cy={200 + rnd(k, 3) * 600} rx={220 + rnd(k, 4) * 200} ry={40 + rnd(k, 5) * 40} fill="rgba(160,170,190,0.05)" style={{filter: 'blur(18px)'}} />
        ))}
        {FORM.map((_, i) => {
          const fl = fallers.find((x) => x.plane === i);
          let [x, y] = base(i);
          let rot = 0;
          let o = clamp01(t / 12);
          if (fl && f > fl.at) {
            const u = (f - fl.at) / 30;
            x += (i % 2 ? 1 : -1) * 80 * u;
            y += 420 * u * u;
            rot = (i % 2 ? 1 : -1) * 70 * u;
            o *= 1 - clamp01((f - fl.at - 40) / 14);
          }
          return (
            <g key={i} opacity={o}>
              {fl && f > fl.at
                ? Array.from({length: 10}, (_, j) => {
                    const back = (f - fl.at) - j * 3;
                    if (back < 0) return null;
                    const u = back / 30;
                    const sx = base(i)[0] + (i % 2 ? 1 : -1) * 80 * u;
                    const sy = base(i)[1] + 420 * u * u;
                    return <circle key={j} cx={sx} cy={sy} r={6 + j * 2.6} fill={j < 2 ? '#ffb070' : 'rgba(150,140,130,0.25)'} opacity={(1 - j / 10) * 0.8} />;
                  })
                : null}
              <g transform={`translate(${x} ${y}) rotate(${rot}) scale(0.085)`}>
                <MiniPlane color={fl && f > fl.at ? '#ff9a70' : G.gold} />
              </g>
            </g>
          );
        })}
        {flak.map((at, k) => {
          const u = (f - at) / 22;
          if (u < 0 || u > 2.2) return null;
          const fl = fallers.find((x) => x.at === at);
          const [cx, cy] = fl ? base(fl.plane) : [960 + (rnd(k, 7) - 0.5) * 900, 470 + (rnd(k, 8) - 0.6) * 500 - (f - w0) * 0.5];
          return (
            <g key={k}>
              <circle cx={cx} cy={cy} r={10 + 60 * ease(u)} fill="rgba(255,236,190,0.9)" opacity={Math.max(0, 1 - u * 1.6)} style={{filter: 'blur(4px)'}} />
              <circle cx={cx} cy={cy} r={30 + 90 * ease(u / 2)} fill="rgba(140,130,120,0.22)" opacity={Math.max(0, 1 - u / 2.2)} style={{filter: 'blur(10px)'}} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* 大飞机：弹孔 → 装甲砸上 + 重量条爆表 → 装甲掉下 */
const zoneCount = (f: number, zone: Hole['zone'] | 'eng') => (zone === 'eng' ? 0 : HOLES.filter((h, i) => h.zone === zone && f >= EV.hole(i)).length);
const BigPlane: React.FC<{f: number}> = ({f}) => {
  const n = HOLES.filter((_, i) => f >= EV.hole(i)).length;
  const plates = [0, 1, 2].map(EV.plate);
  const filled = plates.filter((p) => f >= p).length;
  const gauge = ease((f - plates[0] + 10) / 40) * Math.min(1.18, filled * 0.42);
  const over = f >= EV.overload();
  const tallyO = soft(f, V(7) + 20, 14, V(8)).v;
  const gaugeO = soft(f, V(8), 14, EV.platesFall() + 10).v;
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      <AbsoluteFill style={cam(f, V(7), V(10) - V(7), 1.0, 1.06, [50, 46])}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <ArmorDefs />
          <g transform="translate(960 480) scale(0.92)">
            <Plane f={f} at={V(7) - 20} holesUpTo={f} plates={plates} platesFall={EV.platesFall()} />
          </g>
        </svg>
      </AbsoluteFill>
      {/* 弹孔计数 */}
      <div style={{position: 'absolute', left: 120, top: 380, opacity: soft(f, V(7), 12, V(10)).v}}>
        <div style={{fontFamily: DISP, fontWeight: 600, fontSize: 120, lineHeight: 1, color: '#ff8a72', textShadow: '0 0 24px rgba(200,81,60,0.6)', fontVariantNumeric: 'lining-nums tabular-nums'}}>{n}</div>
        <div style={{fontFamily: TXT, fontSize: 26, color: G.ivoryDim, letterSpacing: '0.12em', marginTop: 6}}>lỗ đạn</div>
      </div>
      {/* 部位统计 */}
      <div style={{position: 'absolute', left: 1560, top: 360, opacity: tallyO, fontFamily: TXT, fontSize: 28, lineHeight: 2, color: G.ivory}}>
        {([['cánh', 'wing'], ['thân', 'body'], ['đuôi', 'tail'], ['động cơ', 'eng']] as const).map(([l, z]) => (
          <div key={z} style={{display: 'flex', gap: 18, alignItems: 'baseline'}}>
            <span style={{width: 120, color: z === 'eng' ? G.ivoryFaint : G.ivoryDim}}>{l}</span>
            <span style={{fontFamily: DISP, fontWeight: 600, fontSize: 40, color: z === 'eng' ? G.ivoryFaint : G.gold, fontVariantNumeric: 'lining-nums tabular-nums'}}>{zoneCount(f, z)}</span>
          </div>
        ))}
      </div>
      {/* 重量条 */}
      <div style={{position: 'absolute', left: 1620, top: 300, width: 44, height: 420, opacity: gaugeO, border: `2px solid ${over ? G.red : G.goldLine}`, borderRadius: 6, overflow: 'visible'}}>
        <div style={{position: 'absolute', left: -12, right: -12, top: 420 * (1 - 1) - 2, height: 2, background: G.ivoryDim}} />
        <div style={{position: 'absolute', left: 4, right: 4, bottom: 4, height: Math.min(412, 412 * gauge), borderRadius: 3, background: over ? `linear-gradient(0deg, ${G.redDeep}, ${G.red})` : `linear-gradient(0deg, ${G.goldDeep}, ${G.goldBright})`, boxShadow: over ? `0 0 24px ${G.red}` : undefined}} />
        <div style={{position: 'absolute', top: 440, left: -40, width: 124, textAlign: 'center', fontFamily: TXT, fontSize: 22, color: G.ivoryDim}}>trọng lượng</div>
      </div>
      {gaugeO > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: gaugeO}}>
          <Stamp f={f} at={EV.overload()} text="QUÁ NẶNG" x={1642} y={250} size={40} rot={-8} />
        </div>
      ) : null}
      {/* Wald 名片 */}
      <div style={{position: 'absolute', left: 110, top: 720, opacity: soft(f, V(9), 16, V(10)).v, transform: `translateX(${(1 - ease((f - V(9)) / 16)) * -60}px)`, border: `1px solid ${G.goldLine}`, background: 'rgba(20,14,8,0.85)', padding: '16px 24px', borderLeft: `4px solid ${G.gold}`}}>
        <div style={{fontFamily: GF.latinItalic, fontSize: 18, color: G.ivoryDim}}>Abraham Wald</div>
        <div style={{fontFamily: DISP, fontWeight: 600, fontSize: 38, ...goldText(0.4)}}>Nhà thống kê</div>
        <div style={{fontFamily: TXT, fontSize: 18, color: G.ivoryFaint}}>1902 – 1950</div>
      </div>
    </AbsoluteFill>
  );
};

/* 样本格子：只有飞回来的 → 空位亮出没回来的（红、引擎中弹）→ 往下坠 */
const SLOT_GHOST = [1, 4, 8, 10, 13, 16];
const Grid: React.FC<{f: number}> = ({f}) => {
  const g0 = EV.grid();
  let gi = 0;
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      <AbsoluteFill style={cam(f, g0, EV.plane2() - g0, 1.08, 1.0)}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {Array.from({length: 18}, (_, i) => {
            const x = 360 + (i % 6) * 240;
            const y = 320 + Math.floor(i / 6) * 200;
            const ghost = SLOT_GHOST.includes(i);
            if (!ghost) {
              const k = gi++;
              const a = clamp01((f - g0 - 8 - k * 2) / 8);
              return (
                <g key={i} transform={`translate(${x} ${y + (1 - a) * 20}) scale(0.18)`} opacity={a}>
                  <MiniPlane holes />
                </g>
              );
            }
            const gk = SLOT_GHOST.indexOf(i);
            const a = clamp01((f - EV.ghosts() - gk * 3) / 10);
            const ft = f - EV.ghostFall(gk);
            const fy = ft > 0 ? 500 * Math.pow(ft / 30, 2) : 0;
            const o = a * (ft > 0 ? 1 - clamp01((ft - 18) / 14) : 1);
            if (o <= 0) return null;
            return (
              <g key={i} transform={`translate(${x + (ft > 0 ? (gk % 2 ? 1 : -1) * ft * 1.5 : 0)} ${y + fy}) rotate(${ft > 0 ? (gk % 2 ? 1 : -1) * ft * 2 : 0}) scale(0.18)`} opacity={o}>
                <MiniPlane color={G.red} dashed engineHits />
              </g>
            );
          })}
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: TXT, fontSize: 30, letterSpacing: '0.08em'}}>
          <span style={{color: G.ivoryDim, opacity: soft(f, g0 + 6, 14).v}}>Mẫu thống kê: chỉ có máy bay </span>
          <span style={{...goldTextLight(0.4), opacity: soft(f, g0 + 6, 14).v}}>trở về</span>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: TXT, fontSize: 26, color: '#ff8a72', letterSpacing: '0.08em', opacity: soft(f, EV.ghosts() + 10, 14).v}}>Máy bay trúng đạn ở động cơ: không có trong mẫu</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* 第二次大飞机：引擎装甲一块块砸上 */
const Plane2: React.FC<{f: number}> = ({f}) => {
  const p0 = EV.plane2();
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      <AbsoluteFill style={cam(f, p0, B(17) - p0, 1.04, 1.1, [50, 44])}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <ArmorDefs />
          <g transform="translate(960 480) scale(0.92)">
            <Plane f={f} at={p0 - 60} holesUpTo={p0 + 999} holesDim={0.75} engPlates={[0, 1, 2, 3].map(EV.engPlate)} engineGold={ease((f - EV.check()) / 16)} engineHot={soft(f, p0, 10, EV.engPlate(0)).v} />
          </g>
        </svg>
        <div style={{position: 'absolute', left: 1290, top: 300, fontFamily: TXT, fontSize: 32, letterSpacing: '0.1em', color: G.goldBright, opacity: soft(f, EV.check(), 12).v, textShadow: '0 0 16px rgba(243,220,160,0.6)'}}>— động cơ ✓</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Wald: React.FC<{f: number}> = ({f}) => (
  <>
    <Seg f={f} from={B(8)} to={V(7) - 4} fade={10}>
      <Formation f={f} />
    </Seg>
    <Seg f={f} from={V(7) - 4} to={EV.grid()} fade={10}>
      <BigPlane f={f} />
    </Seg>
    <Seg f={f} from={EV.grid()} to={EV.plane2()} fade={10}>
      <Grid f={f} />
    </Seg>
    <Seg f={f} from={EV.plane2()} to={B(17) + 30} fade={10}>
      <Plane2 f={f} />
    </Seg>
  </>
);

/* ---------- 现代：投资群 ---------- */
const Card: React.FC<{v: string; sub: string}> = ({v, sub}) => (
  <div style={{width: 250, height: 330, borderRadius: 18, border: `1.5px solid ${G.goldLine}`, background: 'linear-gradient(180deg, rgba(40,30,16,0.97), rgba(14,10,6,0.97))', boxShadow: '0 20px 50px rgba(0,0,0,0.75)', padding: 24, boxSizing: 'border-box'}}>
    <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
      <div style={{width: 30, height: 30, borderRadius: 15, background: G.goldDeep}} />
      <div style={{height: 8, width: 90, borderRadius: 4, background: G.goldFaint}} />
    </div>
    <div style={{marginTop: 54, fontFamily: DISP, fontWeight: 600, fontSize: 78, textAlign: 'center', fontVariantNumeric: 'lining-nums', ...goldText(0.8)}}>{v}</div>
    <div style={{marginTop: 8, fontFamily: TXT, fontSize: 22, textAlign: 'center', color: G.ivoryDim}}>{sub}</div>
    <svg width={202} height={70} style={{marginTop: 18}}>
      <polyline points="0,60 30,52 60,56 90,40 120,44 150,24 180,18 202,4" fill="none" stroke={G.gold} strokeWidth={2.5} />
    </svg>
  </div>
);
const KEPT = new Set([5, 37, 88, 121]);
const Invest: React.FC<{f: number}> = ({f}) => {
  const s0 = B(17);
  const leaveAt = EV.leave();
  const cols = 16;
  const rows = 10;
  const leftN = Array.from({length: cols * rows}, (_, i) => i).filter((i) => !KEPT.has(i) && clamp01((f - leaveAt - rnd(i, 4) * 60) / 14) >= 1).length;
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      <AbsoluteFill style={cam(f, s0, B(20) - s0, 1.04, 1.0)}>
        {[
          ['+320%', 'BTC', 220, 250, -6],
          ['+148%', 'cổ phiếu', 470, 230, 3],
          ['x5', 'coin mới', 720, 260, -2],
        ].map(([v, sub, x, y, rot], i) => {
          const t = f - EV.card(i);
          if (t < -8) return null;
          const sc = t < 0 ? 1.5 - 0.5 * ease((t + 8) / 8) : 1;
          return (
            <div key={i} style={{position: 'absolute', left: x as number, top: y as number, transform: `rotate(${rot}deg) scale(${sc})`, opacity: clamp01((t + 8) / 4), filter: t < 0 ? `blur(${-t}px)` : undefined}}>
              <Card v={v as string} sub={sub as string} />
            </div>
          );
        })}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {Array.from({length: cols * rows}, (_, i) => {
            const x = 1080 + (i % cols) * 42;
            const y = 260 + Math.floor(i / cols) * 42;
            const a = clamp01((f - s0 - 10 - (i % cols) * 0.8) / 14);
            const kept = KEPT.has(i);
            const leave = kept ? 0 : clamp01((f - leaveAt - rnd(i, 4) * 60) / 14);
            const win = kept && f > leaveAt + 50;
            return <circle key={i} cx={x} cy={y + leave * leave * 60} r={win ? 9 : 7} fill={win ? G.goldBright : leave > 0 ? G.red : G.ivoryDim} opacity={a * (1 - leave)} style={win ? {filter: `drop-shadow(0 0 8px ${G.gold})`} : undefined} />;
          })}
        </svg>
        <div style={{position: 'absolute', left: 1080, top: 700, width: 650, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: TXT, fontSize: 26, letterSpacing: '0.06em'}}>
          <span style={{color: G.ivoryDim, opacity: soft(f, s0 + 20, 16).v}}>thành viên nhóm</span>
          <span style={{color: '#ff8a72', opacity: soft(f, leaveAt + 10, 16).v}}>
            đã rời nhóm <span style={{fontFamily: DISP, fontWeight: 600, fontSize: 48, fontVariantNumeric: 'lining-nums tabular-nums'}}>{leftN}</span>
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 一个人 vs 一大片 ---------- */
const FC = 96;
const FR = 40;
const dotPath = (pts: Pt[], r: number) => pts.map(([x, y]) => `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`).join('');
const ONE: Pt = [960, 470];
const fmtVi = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const Dropout: React.FC<{f: number}> = ({f}) => {
  const s0 = B(20);
  const R = 1300 * ease((f - EV.count()) / 45);
  const pts: Pt[] = [];
  for (let r = 0; r < FR; r++)
    for (let c = 0; c < FC; c++) {
      const x = 960 + (c - (FC - 1) / 2) * 19;
      const y = 470 + (r - (FR - 1) / 2) * 19;
      if (Math.abs(x - ONE[0]) < 2 && Math.abs(y - ONE[1]) < 12) continue;
      if (Math.hypot(x - ONE[0], y - ONE[1]) < R) pts.push([x, y]);
    }
  const cu = clamp01((f - EV.count()) / 42);
  const num = Math.pow(cu, 3) * 1000000;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={cam(f, s0, DARK2_FROM - s0, 2.6, 1.0, [50, 43.5])}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <path d={dotPath(pts, 3)} fill={G.ivory} opacity={0.38} />
          <circle cx={ONE[0]} cy={ONE[1] - 10} r={30} fill="rgba(243,220,160,0.25)" opacity={soft(f, s0, 16).v} />
          <circle cx={ONE[0]} cy={ONE[1] - 10} r={8} fill={G.goldBright} opacity={soft(f, s0, 16).v} style={{filter: `drop-shadow(0 0 12px ${G.gold})`}} />
        </svg>
        <div style={{position: 'absolute', left: ONE[0] + 24, top: ONE[1] - 34, fontFamily: TXT, fontSize: 14, color: G.goldBright, opacity: soft(f, s0 + 10, 16, EV.count()).v}}>1 người</div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: soft(f, EV.count(), 10, DARK2_FROM).v}}>
        <div style={{fontFamily: DISP, fontWeight: 600, fontSize: 96, lineHeight: 1, color: G.ivory, textShadow: '0 0 30px rgba(0,0,0,0.9)', fontVariantNumeric: 'lining-nums tabular-nums'}}>{fmtVi(num)}</div>
        <div style={{fontFamily: TXT, fontSize: 26, color: G.ivoryDim, marginTop: 8, letterSpacing: '0.1em'}}>người bỏ học khác</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 结尾：飞机回来，引擎装甲砸上、发光 ---------- */
const Close: React.FC<{f: number}> = ({f}) => {
  const s0 = B(24);
  const ring = (f - V(21)) / 40;
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      <AbsoluteFill style={cam(f, s0, DURATION - s0, 1.0, 1.1, [50, 42])}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <ArmorDefs />
          <g transform="translate(960 450) scale(0.82)">
            <Plane f={f} at={s0} holesUpTo={s0 + 999} holesDim={0.8} engPlates={[0, 1, 2, 3].map(EV.closePlate)} engineGold={ease((f - EV.closePlate(3)) / 20)} draw={36} />
            {ring > 0
              ? ENGINES.map(([x, y], i) => {
                  const r = (ring + i * 0.12) % 1;
                  return <circle key={i} cx={x} cy={y} r={40 + 120 * r} fill="none" stroke={G.goldBright} strokeWidth={2} opacity={(1 - r) * 0.7} />;
                })
              : null}
          </g>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Ep54SongSot: React.FC = () => {
  const real = useCurrentFrame();
  const f = freezeAt(real);
  const dark = darkness(real);
  const flash = (h: number) => (real >= h ? Math.max(0, 1 - (real - h) / 24) : 0);
  const glow = 1 + 1.2 * Math.max(flash(HIT), flash(HIT2));

  return (
    <AbsoluteFill style={{background: G.bg}}>
      <Audio src={staticFile('audio/ep54-song-sot/bgm.wav')} volume={(fr) => (VO.some((v) => fr >= v.start * FPS - 6 && fr < v.end * FPS + 6) ? 0.42 : 0.7)} />
      {VO.map((v, i) => (
        <Sequence key={`vo${i}`} from={V(i)}>
          <Audio src={staticFile(`audio/ep54-song-sot/vo/${String(i).padStart(2, '0')}.mp3`)} volume={1} />
        </Sequence>
      ))}
      {SFX.map(([file, at, vol], i) => (
        <Sequence key={i} from={at}>
          <Audio src={staticFile(file)} volume={(fr) => vol * (VO.some((v) => at + fr >= v.start * FPS - 4 && at + fr < v.end * FPS + 4) ? 0.4 : 0.75)} />
        </Sequence>
      ))}
      <GildedBg f={f} tone={f >= B(20) && f < B(24) ? 'cool' : 'warm'} strength={glow} />
      <Dust f={f} />

      <Seg f={f} from={0} to={HIT + 2} fade={10}>
        <Hook f={f} />
      </Seg>
      <Seg f={f} from={HIT} to={B(8)} fade={10}>
        <VSmash f={f} at={HIT} text="THIÊN KIẾN KẺ SỐNG SÓT" size={124} sub="Survivorship bias" />
      </Seg>
      <Seg f={f} from={B(8)} to={B(17)} fade={14}>
        <Wald f={f} />
      </Seg>
      <Header f={f} at={B(8)} year="1943" caption="Thế chiến II · bầu trời châu Âu" out={B(17) - 14} />
      <Cite f={f} at={V(9)} out={B(17) - 14} />
      <Seg f={f} from={B(17)} to={B(20)} fade={12}>
        <Invest f={f} />
      </Seg>
      <Seg f={f} from={B(20)} to={HIT2 + 2} fade={12}>
        <Dropout f={f} />
      </Seg>
      <Seg f={f} from={HIT2} to={B(24)} fade={10}>
        <VSmash f={f} at={HIT2} text="IM LẶNG" size={220} y={480} />
      </Seg>
      <Seg f={f} from={B(24)} to={DURATION + 20} fade={14}>
        <Close f={f} />
      </Seg>

      <Subs f={f} />
      <AbsoluteFill style={{background: '#000', opacity: dark, pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: '#000', opacity: clamp01((real - (DURATION - FPS)) / FPS), pointerEvents: 'none'}} />
      <Grain />
    </AbsoluteFill>
  );
};
