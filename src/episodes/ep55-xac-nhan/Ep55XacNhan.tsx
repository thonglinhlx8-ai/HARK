import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp01} from '../../library/anim';
import '../../library/filament/theme'; // 载入越南语字体（Lora / Cormorant / Noto Serif Black）
import {Dust, GildedBg, Grain} from '../../library/gilded/stage';
import {G, GF, goldText, goldTextLight} from '../../library/gilded/theme';
import {AFTER1, AFTER2, CITE, CUES, cueEnd, cueStart, EV, ROWS, SLAMS, V, VO, DARK2_FROM, DARK_FROM, DURATION, FPS, FREEZE, H, HIT, HIT2, SFX, W} from './timeline';

/**
 * ep55 Thiên kiến xác nhận（暗金文献风，横屏，越南语）。见 timeline.ts 顶部说明。
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
        QJEP
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

/* ---------- 开场：2-4-6 游戏 ---------- */
const TX = [640, 800, 960];
const RY = [210, 385, 560, 735];
const Game: React.FC<{f: number}> = ({f}) => {
  const rule = EV.rule();
  const sai = EV.sai();
  const conf = lerpSteps(f, [
    [EV.ok(0), 0.34],
    [EV.ok(1), 0.62],
    [EV.ok(2), 0.86],
    [EV.guess() + 10, 1],
  ]);
  const drain = clamp01((f - sai - 4) / 14);
  const xs = clamp01((f - sai) / 6);
  const crumble = clamp01((f - sai - 6) / 24);
  const guessIn = ease((f - EV.guess()) / 14);
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      <AbsoluteFill style={{transform: `scale(${1.1 - 0.1 * ease(f / 90)})`, transformOrigin: '50% 45%'}}>
        {/* 第 0 排：规则示例 */}
        <div style={{position: 'absolute', left: 380, top: RY[0] - 18, fontFamily: TXT, fontSize: 24, letterSpacing: '0.12em', color: G.gold, opacity: soft(f, rule[0] - 6, 12).v}}>MẪU</div>
        {rule.map((at, k) => (
          <Tile key={k} f={f} at={at} x={TX[k]} y={RY[0]} text={['2', '4', '6'][k]} />
        ))}
        <Mark f={f} at={rule[2] + 10} x={1150} y={RY[0]} size={90} />
        {/* 三排猜测 */}
        {ROWS.map((r, ri) => {
          const slotsAt = ri === 0 ? EV.slots() : V(r.cue) - 4;
          const fall = f > sai + 6 ? ease((f - sai - 6 - ri * 3) / 20) : 0;
          return (
            <div key={ri} style={{position: 'absolute', inset: 0, transform: `translateY(${fall * 40}px)`, opacity: 1 - fall * 0.55}}>
              {[0, 1, 2].map((k) => {
                const a = soft(f, slotsAt + k * 3, 8).v * (f < EV.tile(ri, k) ? 1 : 0);
                return a > 0 ? (
                  <div key={k} style={{position: 'absolute', left: TX[k] - 64, top: RY[ri + 1] - 64, width: 128, height: 128, borderRadius: 14, border: `2px dashed ${G.goldLine}`, opacity: a * (0.6 + 0.4 * Math.sin(f / 5)), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISP, fontSize: 60, color: G.goldLine}}>?</div>
                ) : null;
              })}
              {r.nums.map((n, k) => (
                <Tile key={k} f={f} at={EV.tile(ri, k)} x={TX[k]} y={RY[ri + 1]} text={n} />
              ))}
              <Mark f={f} at={EV.ok(ri)} x={1150} y={RY[ri + 1]} size={100} label="ĐÚNG" />
            </div>
          );
        })}
      </AbsoluteFill>
      {/* 自信表 */}
      <Meter x={1640} y={260} h={480} v={conf * (1 - drain)} label="tự tin" red={f >= sai} o={soft(f, EV.ok(0) - 10, 12).v} />
      {/* 假设卡 + 被红叉砸碎 */}
      {guessIn > 0 ? (
        <div style={{position: 'absolute', left: 70, top: 380, width: 360, height: 240, transform: `translateX(${(1 - guessIn) * -300}px)`, opacity: guessIn}}>
          {[0, 1].map((half) => (
            <div
              key={half}
              style={{
                position: 'absolute',
                inset: 0,
                clipPath: half ? 'polygon(52% 0, 100% 0, 100% 100%, 44% 100%, 56% 50%)' : 'polygon(0 0, 52% 0, 56% 50%, 44% 100%, 0 100%)',
                transform: `translate(${(half ? 60 : -40) * crumble}px, ${520 * crumble * crumble}px) rotate(${(half ? 24 : -18) * crumble}deg)`,
                opacity: 1 - clamp01((f - sai - 22) / 10),
                border: `2px solid ${G.gold}`,
                borderRadius: 12,
                background: 'linear-gradient(180deg, rgba(52,38,20,0.97), rgba(20,14,8,0.97))',
                padding: '24px 28px',
                boxSizing: 'border-box',
                boxShadow: conf > 0.95 ? `0 0 40px rgba(243,220,160,0.4)` : '0 10px 30px rgba(0,0,0,0.7)',
              }}
            >
              <div style={{fontFamily: TXT, fontSize: 22, letterSpacing: '0.16em', color: G.ivoryDim}}>GIẢ THUYẾT</div>
              <div style={{fontFamily: DISP, fontWeight: 600, fontSize: 46, lineHeight: 1.15, marginTop: 14, ...goldText(0.5)}}>Số chẵn,</div>
              <div style={{fontFamily: DISP, fontWeight: 600, fontSize: 46, lineHeight: 1.15, ...goldText(0.5)}}>mỗi lần +2</div>
            </div>
          ))}
        </div>
      ) : null}
      {/* 红色大叉 */}
      {xs > 0 ? (
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <path d="M520,140 L1260,820" stroke={G.red} strokeWidth={26} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01(xs * 2)} style={{filter: `drop-shadow(0 0 18px ${G.red})`}} />
          <path d="M1260,140 L520,820" stroke={G.red} strokeWidth={26} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01(xs * 2 - 1)} style={{filter: `drop-shadow(0 0 18px ${G.red})`}} />
        </svg>
      ) : null}
      <Stamp f={f} at={sai + 2} text="SAI" x={890} y={480} size={150} rot={-8} />
    </AbsoluteFill>
  );
};

/* ---------- 真规则：tăng dần ---------- */
const Reveal: React.FC<{f: number}> = ({f}) => {
  const t2 = EV.tiles2();
  const ok2 = EV.ok2();
  const open = ease((f - EV.reveal()) / 16);
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      <AbsoluteFill style={cam(f, AFTER1, V(9) - AFTER1, 1.05, 1.0)}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', opacity: open, transform: `translateY(${(1 - open) * 30}px)`}}>
          <div style={{fontFamily: TXT, fontSize: 26, letterSpacing: '0.2em', color: G.ivoryDim}}>QUY TẮC THẬT</div>
          <div style={{fontFamily: DISP, fontWeight: 600, fontSize: 110, marginTop: 6, letterSpacing: '0.03em', ...goldText(0.9)}}>Ba số tăng dần</div>
        </div>
        {/* 阶梯 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {[0, 1, 2, 3, 4].map((k) => {
            const a = ease((f - EV.reveal() - 6 - k * 3) / 10);
            return <rect key={k} x={1440 + k * 56} y={460 - k * 50 - 50 * a} width={44} height={40 + k * 50 + 50 * a} fill="rgba(214,180,106,0.15)" stroke={G.gold} strokeWidth={2} opacity={a} />;
          })}
        </svg>
        {[0, 1, 2].map((k) => (
          <Tile key={k} f={f} at={t2[k]} x={520 + k * 160} y={520 - k * 22} text={['1', '2', '3'][k]} />
        ))}
        <Mark f={f} at={ok2[0]} x={1030} y={500} size={96} label="ĐÚNG" />
        {[0, 1, 2].map((k) => (
          <Tile key={k} f={f} at={t2[k + 3]} x={520 + k * 160} y={740 - k * 22} text={['5', '17', '900'][k]} />
        ))}
        <Mark f={f} at={ok2[1]} x={1030} y={720} size={96} label="ĐÚNG" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 1960：29 人，6 人第一次就说对 ---------- */
const RIGHT = new Set([3, 9, 14, 20, 24, 27]);
const ORDER = Array.from({length: 29}, (_, i) => i).sort((a, b) => rnd(a, 77) - rnd(b, 77));
const Person: React.FC<{c: string}> = ({c}) => (
  <g>
    <circle cy={-34} r={16} fill="rgba(20,14,8,0.9)" stroke={c} strokeWidth={3} />
    <path d="M-26,22 C-26,-6 26,-6 26,22 Z" fill="rgba(20,14,8,0.9)" stroke={c} strokeWidth={3} />
  </g>
);
const People: React.FC<{f: number}> = ({f}) => {
  const p0 = EV.people();
  const doneAt = EV.verdict(28) + 6;
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      <AbsoluteFill style={cam(f, V(9), V(11) - V(9), 1.06, 1.0)}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {Array.from({length: 29}, (_, i) => {
            const row = i < 10 ? 0 : i < 20 ? 1 : 2;
            const col = i - [0, 10, 20][row];
            const n = row === 2 ? 9 : 10;
            const x = 960 + (col - (n - 1) / 2) * 130;
            const y = 330 + row * 175;
            const a = ease((f - p0 - i * 1.2) / 10);
            const vt = EV.verdict(ORDER.indexOf(i));
            const ok = RIGHT.has(i);
            const judged = f >= vt;
            const c = judged ? (ok ? G.goldBright : G.red) : G.ivoryDim;
            const sink = judged && !ok ? ease((f - vt) / 10) * 0.35 : 0;
            return (
              <g key={i} transform={`translate(${x} ${y + (1 - a) * 30}) scale(${judged && ok ? 1.1 : 1})`} opacity={a * (1 - sink)}>
                <Person c={c} />
                {judged ? (
                  <g transform="translate(30 -46)">
                    <circle r={15} fill={ok ? G.goldBright : G.red} />
                    {ok ? <path d="M-7,0 L-2,6 L8,-6" fill="none" stroke="#1a120a" strokeWidth={4} strokeLinecap="round" /> : <path d="M-6,-6 L6,6 M6,-6 L-6,6" stroke="#1a0c08" strokeWidth={4} strokeLinecap="round" />}
                  </g>
                ) : null}
              </g>
            );
          })}
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 780, textAlign: 'center', opacity: soft(f, doneAt, 12).v}}>
          <span style={{fontFamily: DISP, fontWeight: 600, fontSize: 64, ...goldText(0.6), fontVariantNumeric: 'lining-nums'}}>6 / 29</span>
          <span style={{fontFamily: TXT, fontSize: 28, color: G.ivoryDim, marginLeft: 22}}>người nói đúng quy tắc ngay lần đầu</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 小圈 vs 大圈：只测「让自己对」 ---------- */
const BIG: Pt = [780, 470];
const SMALL: Pt = [700, 500];
const Circles: React.FC<{f: number}> = ({f}) => {
  const s0 = V(11);
  const out = EV.outer();
  const lit = ease((f - out) / 14);
  const conf = lerpSteps(f, [0, 1, 2, 3].map((k): [number, number] => [EV.inner(k) + 4, 0.3 + k * 0.2]));
  const know = 0.12 + 0.7 * lit;
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      <AbsoluteFill style={cam(f, s0, EV.feed0() - s0, 1.0, 1.06, [42, 48])}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <circle cx={BIG[0]} cy={BIG[1]} r={330 * ease((f - s0) / 18)} fill={`rgba(214,180,106,${0.03 + 0.1 * lit})`} stroke={lit > 0 ? G.goldBright : G.goldFaint} strokeWidth={2 + 2 * lit} strokeDasharray={lit > 0.5 ? undefined : '10 10'} style={lit > 0 ? {filter: `drop-shadow(0 0 ${20 * lit}px ${G.gold})`} : undefined} />
          {lit > 0 ? <circle cx={BIG[0]} cy={BIG[1]} r={330 + 200 * clamp01((f - out) / 30)} fill="none" stroke={G.goldBright} strokeWidth={3} opacity={1 - clamp01((f - out) / 30)} /> : null}
          <circle cx={SMALL[0]} cy={SMALL[1]} r={120 * ease((f - s0 - 8) / 14)} fill="rgba(214,180,106,0.12)" stroke={G.gold} strokeWidth={3} />
          {[0, 1, 2, 3].map((k) => {
            const at = EV.inner(k);
            const u = clamp01((f - at + 8) / 8);
            if (u <= 0) return null;
            const tx = SMALL[0] - 50 + (k % 2) * 90;
            const ty = SMALL[1] - 40 + Math.floor(k / 2) * 70;
            const x = -100 + (tx + 100) * u;
            const y = ty - 200 * (1 - u) * u;
            return (
              <g key={k}>
                <circle cx={x} cy={y} r={11} fill={G.goldBright} />
                {f >= at + 4 ? <path d={`M${tx - 9},${ty + 22} l6,6 l12,-12`} fill="none" stroke={G.goldBright} strokeWidth={4} strokeLinecap="round" opacity={clamp01((f - at - 4) / 4)} /> : null}
              </g>
            );
          })}
          {(() => {
            const u = clamp01((f - out + 8) / 8);
            if (u <= 0) return null;
            const tx = BIG[0] + 180;
            const ty = BIG[1] - 150;
            return <circle cx={-100 + (tx + 100) * u} cy={ty - 260 * (1 - u) * u} r={14} fill="#fff3d6" style={{filter: 'drop-shadow(0 0 12px #fff3d6)'}} />;
          })()}
        </svg>
        <div style={{position: 'absolute', left: SMALL[0] - 110, top: SMALL[1] + 132, width: 220, textAlign: 'center', fontFamily: TXT, fontSize: 24, color: G.gold, opacity: soft(f, s0 + 14, 12).v}}>số chẵn, +2</div>
        <div style={{position: 'absolute', left: BIG[0] + 120, top: BIG[1] + 250, fontFamily: TXT, fontSize: 26, color: lit > 0 ? G.goldBright : G.ivoryFaint, opacity: soft(f, s0 + 10, 12).v}}>tăng dần</div>
        <div style={{position: 'absolute', left: BIG[0] + 150, top: BIG[1] - 222, fontFamily: DISP, fontWeight: 600, fontSize: 40, opacity: soft(f, out, 8).v, ...goldText(0.6)}}>1 – 2 – 3</div>
      </AbsoluteFill>
      <Meter x={1480} y={300} h={420} v={conf} label="tự tin" o={soft(f, EV.meters(), 12).v} />
      <Meter x={1680} y={300} h={420} v={know} label="hiểu biết" o={soft(f, EV.meters() + 6, 12).v} />
    </AbsoluteFill>
  );
};

/* ---------- 现代：手机信息流 ---------- */
const PH = {x: 760, y: 120, w: 400, h: 760};
const NEWS = [
  ['Lợi nhuận quý tăng mạnh', true],
  ['Bị điều tra kế toán', false],
  ['Chuyên gia: còn lên nữa', true],
  ['Doanh thu hụt kỳ vọng', false],
  ['Quỹ lớn gom thêm', true],
  ['CEO bán bớt cổ phần', false],
] as const;
const CHATS = ['Đang bận, tí nữa nhé.', 'Hôm nay ngủ sớm.', 'Ok.'];
const Feed: React.FC<{f: number}> = ({f}) => {
  const s0 = EV.feed0();
  const ph = ease((f - s0) / 16);
  const stage = f < V(16) ? 'stock' : f < V(17) ? 'chat' : 'algo';
  const scroll = stage === 'algo' ? (f - V(17)) * 6 : 0;
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      <AbsoluteFill style={cam(f, s0, HIT2 - s0, 1.0, 1.08, [50, 46])}>
        {/* 回声圈 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {f > EV.checks(0)
            ? [0, 1, 2].map((k) => {
                const r = (((f - EV.checks(0)) / 40 + k / 3) % 1);
                return <rect key={k} x={PH.x - 40 - 300 * r} y={PH.y - 40 - 200 * r} width={PH.w + 80 + 600 * r} height={PH.h + 80 + 400 * r} rx={60 + 80 * r} fill="none" stroke={G.gold} strokeWidth={2} opacity={(1 - r) * 0.6} />;
              })
            : null}
        </svg>
        <div style={{position: 'absolute', left: PH.x, top: PH.y + (1 - ph) * 80, width: PH.w, height: PH.h, opacity: ph, borderRadius: 48, border: `3px solid ${G.gold}`, background: 'linear-gradient(180deg, rgba(24,18,10,0.97), rgba(8,6,4,0.97))', boxShadow: '0 30px 80px rgba(0,0,0,0.8)', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: PH.w / 2 - 50, top: 14, width: 100, height: 8, borderRadius: 4, background: G.goldFaint}} />
          {stage === 'stock' ? (
            <div style={{position: 'absolute', left: 26, right: 26, top: 50}}>
              <div style={{fontFamily: TXT, fontSize: 22, color: G.ivoryDim}}>Cổ phiếu của bạn</div>
              <svg width={348} height={160} style={{marginTop: 10}}>
                <polyline points="0,140 40,120 80,128 120,96 160,104 200,70 240,78 280,40 320,30 348,12" fill="none" stroke={G.goldBright} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease((f - V(15)) / 20)} />
              </svg>
              {NEWS.map(([t, good], k) =>
                good && f >= EV.pull(k) + 8 ? (
                  <div key={k} style={{marginTop: 12, padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${G.goldLine}`, background: 'rgba(214,180,106,0.1)', fontFamily: TXT, fontSize: 22, color: G.ivory, opacity: ease((f - EV.pull(k) - 8) / 6)}}>▲ {t}</div>
                ) : null,
              )}
            </div>
          ) : null}
          {stage === 'chat' ? (
            <div style={{position: 'absolute', left: 26, right: 26, top: 70}}>
              <div style={{fontFamily: TXT, fontSize: 22, color: G.ivoryDim, textAlign: 'center', marginBottom: 20}}>❤ Người yêu</div>
              {CHATS.map((c, k) => {
                const at = EV.chat(k);
                const a = ease((f - at + 10) / 8);
                return (
                  <div key={k} style={{position: 'relative', marginTop: 26, opacity: a, transform: `translateY(${(1 - a) * 20}px)`}}>
                    <div style={{display: 'inline-block', padding: '14px 20px', borderRadius: 20, background: 'rgba(239,230,210,0.1)', border: `1px solid ${G.ivoryFaint}`, fontFamily: TXT, fontSize: 26, color: G.ivory}}>{c}</div>
                    {f >= at ? (
                      <div style={{position: 'absolute', right: 6, top: -12, width: 52, height: 52, borderRadius: 26, background: G.red, color: '#fff1e6', fontFamily: BLACK, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${f - at < 6 ? 1.8 - 0.8 * ((f - at) / 6) : 1})`, boxShadow: `0 0 20px ${G.red}`}}>?</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
          {stage === 'algo' ? (
            <div style={{position: 'absolute', left: 26, right: 26, top: 60 - scroll}}>
              {Array.from({length: 14}, (_, k) => {
                const a = ease((f - EV.algo(Math.min(k, 7)) + (k > 7 ? 30 : 0)) / 6);
                const ck = f >= EV.checks(Math.min(11, k));
                return (
                  <div key={k} style={{position: 'relative', height: 120, marginBottom: 16, borderRadius: 14, border: `1.5px solid ${G.goldLine}`, background: 'rgba(214,180,106,0.07)', opacity: a, padding: 16, boxSizing: 'border-box'}}>
                    <div style={{width: 60, height: 60, borderRadius: 10, background: G.goldDeep, display: 'inline-block'}} />
                    <div style={{position: 'absolute', left: 92, top: 22, width: 200, height: 12, borderRadius: 6, background: G.goldFaint}} />
                    <div style={{position: 'absolute', left: 92, top: 46, width: 150, height: 12, borderRadius: 6, background: G.goldFaint}} />
                    {ck ? (
                      <div style={{position: 'absolute', right: 14, top: 28, width: 60, height: 60, borderRadius: 30, background: G.goldBright, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1.6 - 0.6 * clamp01((f - EV.checks(Math.min(11, k))) / 6)})`, boxShadow: `0 0 18px ${G.goldBright}`}}>
                        <svg width={34} height={34} viewBox="-17 -17 34 34">
                          <path d="M-10,0 L-3,8 L11,-8" fill="none" stroke="#1a120a" strokeWidth={5} strokeLinecap="round" />
                        </svg>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
        {/* 新闻卡：好消息被吸进手机，坏消息被弹开 */}
        {stage === 'stock'
          ? NEWS.map(([t, good], k) => {
              const at = EV.pull(k);
              const u = (f - at + 14) / 14;
              if (u < 0) return null;
              const side = k % 2 ? 1 : -1;
              const sx = side < 0 ? 180 : 1440;
              const sy = 200 + k * 100;
              let x = sx;
              let y = sy;
              let rot = 0;
              let o = clamp01(u * 3);
              if (good) {
                const p = ease(u);
                x = sx + (PH.x + 30 - sx) * p;
                y = sy + (PH.y + 260 - sy) * p;
                o *= 1 - clamp01((f - at - 6) / 4);
              } else {
                const p = clamp01(u);
                x = sx + (PH.x - 300 - sx) * Math.min(1, p) * (side > 0 ? -0.85 : 0.85);
                if (f > at) {
                  const b = (f - at) / 20;
                  x += side * 500 * b;
                  y += 300 * b * b - 120 * b;
                  rot = side * 40 * b;
                  o *= 1 - clamp01(b - 0.6);
                }
              }
              return (
                <div key={k} style={{position: 'absolute', left: x, top: y, width: 300, padding: '16px 20px', borderRadius: 12, border: `1.5px solid ${good ? G.gold : G.red}`, background: 'rgba(20,14,8,0.95)', fontFamily: TXT, fontSize: 24, color: good ? G.goldBright : '#ff8a72', transform: `rotate(${rot}deg)`, opacity: o, boxShadow: '0 10px 30px rgba(0,0,0,0.7)'}}>
                  {good ? '▲' : '▼'} {t}
                </div>
              );
            })
          : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 结尾：放大镜找裂缝 + 提问 ---------- */
const Close: React.FC<{f: number}> = ({f}) => {
  const s0 = AFTER2;
  const lensT = easeIO((f - EV.lens()) / 60);
  const crack = clamp01((f - EV.crack()) / 10);
  const ask = EV.ask();
  const cardUp = ease((f - ask + 8) / 14);
  const fin = soft(f, EV.final(), 20).v;
  const lx = 640 + 520 * lensT;
  const ly = 470 - 60 * Math.sin(lensT * Math.PI);
  return (
    <AbsoluteFill style={{transform: shakeAt(f)}}>
      <AbsoluteFill style={cam(f, s0, DURATION - s0, 1.0, 1.06, [50, 44])}>
        <div style={{position: 'absolute', left: 560, top: 300 - cardUp * 130, width: 800, height: 340, opacity: soft(f, s0, 16).v * (1 - fin * 0.9), transform: `scale(${1 - cardUp * 0.25})`, border: `2px solid ${G.gold}`, borderRadius: 18, background: 'linear-gradient(180deg, rgba(52,38,20,0.96), rgba(20,14,8,0.96))', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: TXT, fontSize: 26, letterSpacing: '0.2em', color: G.ivoryDim}}>ĐIỀU MÌNH TIN CHẮC</div>
          <div style={{fontFamily: DISP, fontWeight: 600, fontSize: 92, marginTop: 10, ...goldText(0.6)}}>“Mình đúng.”</div>
          {crack > 0 ? (
            <svg width={800} height={340} style={{position: 'absolute', left: 0, top: 0}}>
              {['M560,0 L520,90 L560,150 L500,240 L540,340', 'M520,90 L440,120 L400,100', 'M500,240 L600,270 L660,250'].map((d, k) => (
                <path key={k} d={d} fill="none" stroke="#fff3d6" strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01(crack * 1.5 - k * 0.25)} style={{filter: 'drop-shadow(0 0 6px #fff3d6)'}} />
              ))}
            </svg>
          ) : null}
        </div>
        {/* 放大镜 */}
        {f >= EV.lens() && f < ask + 10 ? (
          <svg width={W} height={H} style={{position: 'absolute', opacity: 1 - clamp01((f - ask) / 10)}}>
            <g transform={`translate(${lx} ${ly}) rotate(-20)`}>
              <circle r={110} fill="rgba(243,220,160,0.08)" stroke={G.goldBright} strokeWidth={6} style={{filter: `drop-shadow(0 0 12px ${G.gold})`}} />
              <rect x={-14} y={110} width={28} height={150} rx={10} fill={G.goldDeep} stroke={G.gold} strokeWidth={3} />
            </g>
          </svg>
        ) : null}
        <div style={{position: 'absolute', left: 0, right: 0, top: 560 + (1 - cardUp) * 60, textAlign: 'center', opacity: clamp01((f - ask + 8) / 6) * (1 - fin * 0.9), transform: `scale(${f < ask ? 1.3 - 0.3 * cardUp : 1})`}}>
          <div style={{fontFamily: DISP, fontWeight: 600, fontSize: 70, lineHeight: 1.2, color: G.ivory, textShadow: '0 4px 24px rgba(0,0,0,0.9)'}}>
            Bằng chứng nào sẽ khiến mình <span style={goldTextLight(0.7)}>đổi ý</span>?
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', opacity: fin, transform: `scale(${0.8 + 0.2 * fin})`}}>
          <span style={{fontFamily: DISP, fontWeight: 600, fontSize: 380, lineHeight: 1, ...goldText(1.4)}}>?</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Ep55XacNhan: React.FC = () => {
  const real = useCurrentFrame();
  const f = freezeAt(real);
  const dark = darkness(real);
  const flash = (h: number) => (real >= h ? Math.max(0, 1 - (real - h) / 24) : 0);
  const glow = 1 + 1.2 * Math.max(flash(HIT), flash(HIT2));
  return (
    <AbsoluteFill style={{background: G.bg}}>
      <Audio src={staticFile('audio/ep55-xac-nhan/bgm.wav')} volume={(fr) => (VO.some((v) => fr >= v.start * FPS - 6 && fr < v.end * FPS + 6) ? 0.38 : 0.65)} />
      {VO.map((v, i) => (
        <Sequence key={`vo${i}`} from={V(i)}>
          <Audio src={staticFile(`audio/ep55-xac-nhan/vo/${String(i).padStart(2, '0')}.mp3`)} volume={1} />
        </Sequence>
      ))}
      {SFX.map(([file, at, vol], i) => (
        <Sequence key={i} from={at}>
          <Audio src={staticFile(file)} volume={(fr) => vol * (VO.some((v) => at + fr >= v.start * FPS - 4 && at + fr < v.end * FPS + 4) ? 0.4 : 0.75)} />
        </Sequence>
      ))}
      <GildedBg f={f} tone={f >= EV.feed0() && f < HIT2 ? 'cool' : 'warm'} strength={glow} />
      <Dust f={f} />

      <Seg f={f} from={0} to={HIT + 2} fade={10}>
        <Game f={f} />
      </Seg>
      <Seg f={f} from={HIT} to={AFTER1} fade={10}>
        <VSmash f={f} at={HIT} text="THIÊN KIẾN XÁC NHẬN" size={124} sub="Confirmation bias" />
      </Seg>
      <Seg f={f} from={AFTER1} to={V(9)} fade={12}>
        <Reveal f={f} />
      </Seg>
      <Seg f={f} from={V(9)} to={V(11)} fade={12}>
        <People f={f} />
      </Seg>
      <Header f={f} at={V(9)} year="1960" caption="Thí nghiệm của Peter Wason" out={V(11) - 10} />
      <Cite f={f} at={V(9) + 10} out={V(11) - 10} />
      <Seg f={f} from={V(11)} to={EV.feed0()} fade={12}>
        <Circles f={f} />
      </Seg>
      <Seg f={f} from={EV.feed0()} to={HIT2 + 2} fade={12}>
        <Feed f={f} />
      </Seg>
      <Seg f={f} from={HIT2} to={AFTER2} fade={10}>
        <VSmash f={f} at={HIT2} text="TÌM CÁI SAI" size={190} y={480} />
      </Seg>
      <Seg f={f} from={AFTER2} to={DURATION + 20} fade={14}>
        <Close f={f} />
      </Seg>

      <Subs f={f} />
      <AbsoluteFill style={{background: '#000', opacity: dark, pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: '#000', opacity: clamp01((real - (DURATION - FPS)) / FPS), pointerEvents: 'none'}} />
      <Grain />
    </AbsoluteFill>
  );
};
