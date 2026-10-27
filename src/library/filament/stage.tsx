import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, rand} from '../anim';
import {blurIn, ease, F, FF, isTall, SIZE} from './theme';

/**
 * 丝线星图风的舞台层：底色（暖 / 冷）、颗粒、逐字模糊扫入的字幕、红色砸字、标题卡、引文卡、出处脚注、光缝转场。
 * 所有组件按传入的 w/h 排版，竖屏（1080×1920）和横屏（1920×1080）都能用；动画全部由帧号 f 算出。
 */

/** 背景。warm：暖黑 + 中心一团暖光 + 暗角；cool：深蓝夜空 + 两三团缓慢漂移的紫色星云 + 闪烁星点。glow 是光晕中心（百分比） */
export const FilBg: React.FC<{f: number; w: number; h: number; tone?: 'warm' | 'cool'; glow?: [number, number]; strength?: number}> = ({f, w, h, tone = 'warm', glow = [50, 46], strength = 1}) => {
  if (tone === 'warm') {
    const b = 0.92 + 0.08 * Math.sin(f / 45);
    return (
      <AbsoluteFill style={{background: F.bgWarm}}>
        <AbsoluteFill style={{background: `radial-gradient(ellipse 58% 42% at ${glow[0]}% ${glow[1]}%, ${F.glowWarm}${0.42 * strength * b}) 0%, ${F.glowWarm}${0.12 * strength}) 48%, rgba(0,0,0,0) 78%)`}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 80% at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)'}} />
      </AbsoluteFill>
    );
  }
  const blobs = [
    [0.72, 0.28, 0.42, 0.22, F.nebula, 0.32],
    [0.2, 0.62, 0.36, 0.2, F.nebula, 0.22],
    [0.55, 0.78, 0.3, 0.16, F.nebulaPink, 0.16],
  ] as const;
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, #020309 0%, ${F.bgCool} 55%, #0b0c1c 100%)`}}>
      {blobs.map(([x, y, rx, ry, c, a], i) => (
        <AbsoluteFill
          key={i}
          style={{background: `radial-gradient(ellipse ${rx * 100}% ${ry * 100}% at ${x * 100 + Math.sin(f / 160 + i) * 2}% ${y * 100 + Math.cos(f / 190 + i) * 1.5}%, ${c}${a * strength}) 0%, ${c}0) 100%)`, filter: 'blur(30px)'}}
        />
      ))}
      <svg width={w} height={h} style={{position: 'absolute'}}>
        {Array.from({length: 90}, (_, i) => {
          const tw = 0.3 + 0.7 * Math.abs(Math.sin(f / (30 + rand(i + 3) * 50) + i));
          return <circle key={i} cx={rand(i) * w} cy={rand(i + 0.5) * h} r={0.6 + rand(i + 1) * 1.3} fill="#dfe4ff" opacity={0.55 * tw} />;
        })}
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 95% 85% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)'}} />
    </AbsoluteFill>
  );
};

/** 颗粒：很淡的噪点，压掉纯数字的干净感 */
export const FilGrain: React.FC<{opacity?: number}> = ({opacity = 0.08}) => (
  <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity}}>
    <svg width="100%" height="100%">
      <filter id="fl-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix values="0 0 0 0 0.9  0 0 0 0 0.88  0 0 0 0 0.82  0 0 0 0.5 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#fl-grain)" />
    </svg>
  </AbsoluteFill>
);

/** 把「【关键词】」切成普通段和高亮段 */
const splitMarks = (text: string) => {
  const out: {ch: string; hi: boolean}[] = [];
  let hi = false;
  for (const ch of text) {
    if (ch === '【') hi = true;
    else if (ch === '】') hi = false;
    else out.push({ch, hi});
  }
  return out;
};

/**
 * 字幕：逐字从左往右「模糊扫入」（每字 perChar 帧，单字 8 帧从 blur 12px 收清），整句约 1 秒扫完。
 * 竖屏默认在画面上方 7%，横屏在下方 90%。「【】」里的词用强调色（冷底金；暖底参考片里字幕全白、不高亮，强调交给 Slam 红字），一句最多一处。
 */
export const Caption: React.FC<{f: number; at: number; text: string; w: number; h: number; out?: number; y?: number; size?: number; perChar?: number; hiColor?: string; maxW?: number}> = ({
  f,
  at,
  text,
  w,
  h,
  out,
  y,
  size,
  perChar = 1.6,
  hiColor,
  maxW,
}) => {
  if (f < at - 1) return null;
  const tall = isTall(w, h);
  const s = size ?? (tall ? SIZE.caption : SIZE.captionWide) * (w / (tall ? 1080 : 1920));
  const yy = y ?? (tall ? h * 0.07 : h * 0.885);
  const o = out === undefined ? 1 : 1 - ease((f - out) / 10);
  const outBlur = out === undefined ? 0 : clamp01((f - out) / 10) * 10;
  const chars = splitMarks(text);
  return (
    <div style={{position: 'absolute', left: (w - (maxW ?? w * 0.9)) / 2, width: maxW ?? w * 0.9, top: yy, textAlign: 'center', fontFamily: FF.cn, fontSize: s, lineHeight: 1.45, color: F.text, letterSpacing: '0.02em', opacity: o, filter: outBlur ? `blur(${outBlur}px)` : undefined, textShadow: '0 2px 14px rgba(0,0,0,0.9)'}}>
      {chars.map((c, i) => {
        const t = clamp01((f - at - i * perChar) / 8);
        const e = ease(t);
        return (
          <span key={i} style={{opacity: e, filter: t < 1 ? `blur(${(1 - e) * 12}px)` : undefined, color: c.hi ? hiColor ?? F.gold : undefined}}>
            {c.ch === '\n' ? <br /> : c.ch}
          </span>
        );
      })}
    </div>
  );
};

/**
 * 红色砸字：宋体 Black 红字在 at 帧从 1.7 倍、强模糊砸到原大（12 帧，ease-out），
 * 同时一圈扁椭圆冲击波向外扩散（18 帧淡出），身后一团红光，之后几颗火星往上飘。
 * 一个画面最多一处；连续砸几个词时错开 6～10 帧，位置散开。color 冷底可传 F.pink。
 */
export const Slam: React.FC<{f: number; at: number; text: string; x: number; y: number; size?: number; color?: string; out?: number; rot?: number}> = ({f, at, text, x, y, size = SIZE.slam, color = F.red, out, rot = -3}) => {
  const t = f - at;
  if (t < 0) return null;
  const p = ease(t / 12);
  const scale = 1.7 - 0.7 * p;
  const o = clamp01(t / 4) * (out === undefined ? 1 : 1 - ease((f - out) / 12));
  const ring = clamp01(t / 18);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: o}}>
      <svg width={size * 6} height={size * 3} style={{position: 'absolute', left: -size * 3, top: -size * 1.5, overflow: 'visible'}}>
        {[0, 0.35].map((d, i) => {
          const r = clamp01(ring - d);
          return r > 0 && r < 1 ? <ellipse key={i} cx={size * 3} cy={size * 1.5} rx={size * (0.6 + 2.6 * ease(r))} ry={size * (0.22 + 0.7 * ease(r))} fill="none" stroke={color} strokeWidth={2} opacity={(1 - r) * 0.7} /> : null;
        })}
        {Array.from({length: 10}, (_, i) => {
          const life = clamp01((t - 6 - i * 2) / 40);
          if (life <= 0 || life >= 1) return null;
          return <circle key={i} cx={size * 3 + (rand(i + at) - 0.5) * size * 2.2} cy={size * 1.5 + size * 0.3 - life * size * 1.2} r={1.5 + rand(i + 9) * 1.5} fill={F.redHot} opacity={(1 - life) * 0.9} />;
        })}
      </svg>
      <div
        style={{
          position: 'relative',
          whiteSpace: 'nowrap',
          fontFamily: FF.cnBlack,
          fontSize: size,
          lineHeight: 1,
          color,
          transform: `scale(${scale}) rotate(${rot}deg)`,
          filter: `blur(${(1 - p) * 14}px)`,
          textShadow: `0 0 ${size * 0.25}px ${color}, 0 0 ${size * 0.6}px rgba(200,40,30,0.55), 0 ${size * 0.05}px 0 ${F.redDeep}`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** 标题卡：居中大号宋体 Black 白字 + 下方字距拉开的西文小大写（0.45em）。整卡 16 帧模糊渐显 */
export const TitleCard: React.FC<{f: number; at: number; title: string; en: string; w: number; h: number; out?: number; size?: number}> = ({f, at, title, en, w, h, out, size}) => {
  const s = size ?? SIZE.title * (Math.min(w, h) / 1080);
  const a = blurIn(f, at, 16, out);
  const b = blurIn(f, at + 10, 16, out);
  return (
    <div style={{position: 'absolute', left: 0, width: w, top: h * 0.5 - s * 0.7, textAlign: 'center'}}>
      <div style={{fontFamily: FF.cnBlack, fontSize: s, lineHeight: 1, color: F.text, letterSpacing: '0.12em', textShadow: '0 0 30px rgba(255,255,255,0.18)', opacity: a.opacity, filter: a.filter}}>{title}</div>
      <div style={{marginTop: s * 0.28, fontFamily: FF.latin, fontSize: s * 0.15, letterSpacing: '0.45em', color: F.textDim, textTransform: 'uppercase', opacity: b.opacity, filter: b.filter}}>{en}</div>
    </div>
  );
};

/**
 * 引文卡：人名（小号金色宋体）→ 西文身份行（极小、字距拉开）→ 原文斜体 → 一条两端渐隐的细线 → 中文译文大字逐字扫入。
 * 各行依次错开 8 帧出场。
 */
export const QuoteCard: React.FC<{f: number; at: number; who: string; meta: string; original: string; text: string; w: number; h: number; out?: number}> = ({f, at, who, meta, original, text, w, h, out}) => {
  const k = Math.min(w, h) / 1080;
  const y0 = h * 0.5 - 260 * k;
  const r = (i: number) => blurIn(f, at + i * 8, 14, out);
  return (
    <div style={{position: 'absolute', left: 0, width: w, top: y0, textAlign: 'center'}}>
      <div style={{fontFamily: FF.cn, fontSize: 40 * k, color: F.gold, ...r(0)}}>{who}</div>
      <div style={{marginTop: 10 * k, fontFamily: FF.latin, fontSize: 20 * k, letterSpacing: '0.3em', color: F.textFaint, textTransform: 'uppercase', ...r(1)}}>{meta}</div>
      <div style={{marginTop: 36 * k, fontFamily: FF.latinItalic, fontSize: 64 * k, color: F.text, opacity: 0.88 * r(2).opacity, filter: r(2).filter}}>{original}</div>
      <div style={{margin: `${30 * k}px auto 0`, width: w * 0.42 * ease((f - at - 24) / 20), height: 1.5, background: 'linear-gradient(90deg, rgba(232,200,120,0), rgba(232,200,120,0.7), rgba(232,200,120,0))'}} />
      <Caption f={f} at={at + 40} text={text} w={w} h={h} y={70 * k + 300 * k} size={96 * k} perChar={3} out={out} />
    </div>
  );
};

/** 出处脚注：画面下方一行极小的暗字（来源 / 样本量），只在有数字的画面出现 */
export const Footnote: React.FC<{f: number; at: number; text: string; w: number; h: number; out?: number}> = ({f, at, text, w, h, out}) => {
  const tall = isTall(w, h);
  return (
    <div style={{position: 'absolute', left: 0, width: w, top: tall ? h * 0.9 : h * 0.955, textAlign: 'center', fontFamily: FF.cn, fontSize: SIZE.foot * (w / (tall ? 1080 : 1920)) * (tall ? 1 : 1.2), color: F.textFaint, letterSpacing: '0.04em', ...blurIn(f, at, 14, out)}}>
      {text}
    </div>
  );
};

/** 一个数字的计数：从 from 走到 to（ease-out），保留 digits 位小数 */
export const countTo = (f: number, at: number, dur: number, from: number, to: number, digits = 0) => (from + (to - from) * ease((f - at) / dur)).toFixed(digits);

/** 大数字 + 上方说明小字（冷底常用粉红，表示「风险 / 剩下的」）。数字变化时整块轻微模糊一下 */
export const BigNumber: React.FC<{f: number; at: number; value: string; label?: string; sub?: string; x: number; y: number; size?: number; color?: string; out?: number; align?: 'left' | 'center' | 'right'}> = ({
  f,
  at,
  value,
  label,
  sub,
  x,
  y,
  size = 150,
  color = F.text,
  out,
  align = 'center',
}) => {
  const a = blurIn(f, at, 14, out);
  const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translateX(${tx})`, textAlign: align, ...a}}>
      {label ? <div style={{fontFamily: FF.cn, fontSize: size * 0.16, color: F.textDim, marginBottom: size * 0.04}}>{label}</div> : null}
      <div style={{fontFamily: FF.latin, fontWeight: 600, fontSize: size, lineHeight: 1, color, textShadow: `0 0 ${size * 0.2}px ${color}66`}}>{value}</div>
      {sub ? <div style={{fontFamily: FF.latin, fontSize: size * 0.13, letterSpacing: '0.2em', color: F.textFaint, marginTop: size * 0.08}}>{sub}</div> : null}
    </div>
  );
};

/**
 * 光缝转场：一条竖直的亮线（带光晕）从左扫到右，dur 帧（默认 20，先快后慢）。
 * slitX 给出这一帧亮线的位置；把旧画面裁成 inset(0 0 0 x)、新画面裁成 inset(0 w-x 0 0)，就是「光缝划开」。
 */
export const slitX = (f: number, at: number, w: number, dur = 20) => w * ease((f - at) / dur) * 1.02;
export const SlitLine: React.FC<{f: number; at: number; w: number; h: number; dur?: number}> = ({f, at, w, h, dur = 20}) => {
  const t = (f - at) / dur;
  if (t < 0 || t > 1.15) return null;
  const x = slitX(f, at, w, dur);
  const o = t < 0.9 ? 1 : 1 - (t - 0.9) / 0.25;
  return (
    <div style={{position: 'absolute', left: x - 2, top: 0, width: 3, height: h, background: '#fff', opacity: o, boxShadow: '0 0 18px 4px rgba(255,255,255,0.75), 0 0 60px 12px rgba(180,190,255,0.35)'}} />
  );
};

/**
 * 收拢转场：整张画布向一点缩小、变暗、模糊（dur 帧，ease-in），收成一个亮点后下一画面从这个点重新长出来。
 * 返回给外层容器的 style。参考片里这是最主要的「换段」方式，硬切只在段落大换时用。
 */
export const collapse = (f: number, at: number, dur = 18, origin: [number, number] = [50, 45]): React.CSSProperties => {
  const t = clamp01((f - at) / dur);
  if (t <= 0) return {};
  const e = t * t * t;
  return {transform: `scale(${1 - 0.55 * e})`, transformOrigin: `${origin[0]}% ${origin[1]}%`, opacity: 1 - e, filter: `blur(${e * 8}px)`};
};

/** 慢镜头运动：一场里画布缓慢推近 + 跟着生长方向平移（参考片里线往上长，镜头就跟着往上走） */
export const camera = (f: number, at: number, len: number, zoom = 0.04, pan: [number, number] = [0, 0]): React.CSSProperties => {
  const t = clamp01((f - at) / Math.max(1, len));
  const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  return {transform: `translate(${pan[0] * e}px, ${pan[1] * e}px) scale(${1 + zoom * e})`};
};
