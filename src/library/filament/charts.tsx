import React from 'react';
import {clamp01, rand} from '../anim';
import {blurIn, ease, F, FF} from './theme';

/**
 * 丝线星图风的「图」：一切都是会生长的细线。
 * GrowLine 生长的线（带发光的线头）、Node 带光晕的节点 + 两侧标签、Spine 竖直时间轴、Fan 从一点散开的分叉、
 * Web 程序化织网（可收拢）、Ring 刻度环 + 中心大数字、Pill 消息气泡节点、Dots 散点。
 * 坐标都是画布像素，用 SVG 画；所有生长由帧号算出。
 */

export type Pt = [number, number];

/** 二次贝塞尔采样：p0 → p1，控制点 c，n 段 */
export const curve = (p0: Pt, c: Pt, p1: Pt, n = 40): Pt[] =>
  Array.from({length: n + 1}, (_, i) => {
    const t = i / n;
    const a = (1 - t) * (1 - t);
    const b = 2 * (1 - t) * t;
    const d = t * t;
    return [a * p0[0] + b * c[0] + d * p1[0], a * p0[1] + b * c[1] + d * p1[1]];
  });

/** 两点之间的柔和弧线：bend 是控制点往法线方向偏的比例 */
export const arc = (p0: Pt, p1: Pt, bend = 0.25, n = 40): Pt[] => {
  const mx = (p0[0] + p1[0]) / 2;
  const my = (p0[1] + p1[1]) / 2;
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  return curve(p0, [mx - dy * bend, my + dx * bend], p1, n);
};

const lens = (pts: Pt[]) => {
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return L;
};

/** 取折线前 p（0–1）那一段，返回点列和线头位置 */
export const partial = (pts: Pt[], p: number): {pts: Pt[]; head: Pt} => {
  const L = lens(pts);
  const target = L[L.length - 1] * clamp01(p);
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (L[i] <= target) out.push(pts[i]);
    else {
      const k = (target - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
      out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]);
      break;
    }
  }
  return {pts: out, head: out[out.length - 1]};
};

const d = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

/**
 * 生长的线：dur 帧内从起点长到终点（ease-out），线头一个亮点 + 光晕，长完后亮点慢慢熄掉。
 * width 主线 3、次线 1.2；dim 用于背景网。
 */
export const GrowLine: React.FC<{f: number; at: number; dur?: number; pts: Pt[]; width?: number; color?: string; head?: boolean; opacity?: number; glowR?: number}> = ({
  f,
  at,
  dur = 24,
  pts,
  width = 3,
  color = F.line,
  head = true,
  opacity = 1,
  glowR = 6,
}) => {
  if (f < at) return null;
  const p = ease((f - at) / dur);
  const {pts: seg, head: h} = partial(pts, p);
  const headO = head ? 1 - clamp01((f - at - dur) / 20) : 0;
  return (
    <g opacity={opacity}>
      <path d={d(seg)} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" style={{filter: `drop-shadow(0 0 ${glowR}px ${color})`}} />
      {headO > 0 ? (
        <>
          <circle cx={h[0]} cy={h[1]} r={width * 6} fill="url(#fl-halo)" opacity={headO} />
          <circle cx={h[0]} cy={h[1]} r={width * 1.6} fill="#fff" opacity={headO} />
        </>
      ) : null}
    </g>
  );
};

/** SVG 里放一次：节点和线头的柔光渐变 */
export const FilDefs: React.FC = () => (
  <defs>
    <radialGradient id="fl-halo">
      <stop offset="0%" stopColor="rgba(255,240,215,0.85)" />
      <stop offset="35%" stopColor="rgba(255,225,180,0.28)" />
      <stop offset="100%" stopColor="rgba(255,225,180,0)" />
    </radialGradient>
    <radialGradient id="fl-halo-red">
      <stop offset="0%" stopColor="rgba(255,90,70,0.9)" />
      <stop offset="100%" stopColor="rgba(255,60,40,0)" />
    </radialGradient>
  </defs>
);

/**
 * 节点：白色小圆点 + 柔光，左边一小行暗字（年龄 / 刻度），右边一行粗一点的白字（事件）。
 * 12 帧模糊渐显；hot 时光晕放大（「你现在在这里」）；red 时是断点（小红点）。
 */
export const Node: React.FC<{f: number; at: number; x: number; y: number; label?: string; side?: string; r?: number; hot?: boolean; red?: boolean; size?: number; out?: number; labelAt?: 'right' | 'left' | 'top' | 'bottom'}> = ({
  f,
  at,
  x,
  y,
  label,
  side,
  r = 6,
  hot,
  red,
  size = 40,
  out,
  labelAt = 'right',
}) => {
  const a = blurIn(f, at, 12, out);
  if (a.opacity <= 0) return null;
  const pulse = hot ? 1 + 0.12 * Math.sin((f - at) / 8) : 1;
  const lx = labelAt === 'right' ? x + r + size * 0.45 : labelAt === 'left' ? x - r - size * 0.45 : x;
  const ly = labelAt === 'top' ? y - size * 0.9 : labelAt === 'bottom' ? y + size * 1.2 : y + size * 0.35;
  const anchor = labelAt === 'right' ? 'start' : labelAt === 'left' ? 'end' : 'middle';
  return (
    <g opacity={a.opacity} style={{filter: a.filter}}>
      <circle cx={x} cy={y} r={r * (hot ? 9 : 5) * pulse} fill={red ? 'url(#fl-halo-red)' : 'url(#fl-halo)'} />
      <circle cx={x} cy={y} r={red ? r * 0.6 : r} fill={red ? F.redHot : '#fff'} />
      {side ? (
        <text x={x - r - size * 0.45} y={y + size * 0.3} textAnchor="end" style={{fontFamily: FF.cn}} fontSize={size * 0.78} fill={F.textDim}>
          {side}
        </text>
      ) : null}
      {label ? (
        <text x={lx} y={ly} textAnchor={anchor} fontSize={size} fill={F.text} style={{fontFamily: FF.cn, paintOrder: 'stroke'}} stroke="rgba(0,0,0,0.6)" strokeWidth={4}>
          {label}
        </text>
      ) : null}
    </g>
  );
};

/**
 * 竖直时间轴（「一根线」）：主线从下往上长，节点按 items 顺序每隔 gap 帧亮起一个。
 * items: [左侧暗字, 右侧事件]，从下到上。
 */
export const Spine: React.FC<{f: number; at: number; x: number; y0: number; y1: number; items: [string, string][]; gap?: number; size?: number; out?: number}> = ({f, at, x, y0, y1, items, gap = 14, size = 40, out}) => {
  const n = items.length;
  const o = out === undefined ? 1 : 1 - ease((f - out) / 12);
  return (
    <g opacity={o}>
      <GrowLine f={f} at={at} dur={gap * n + 10} pts={[[x, y0 + 40], [x, y1 - 40]]} width={2.5} head={false} />
      {items.map(([side, label], i) => (
        <Node key={i} f={f} at={at + 6 + i * gap} x={x} y={y0 - ((y0 - y1) * (i + 0.5)) / n} side={side} label={label} size={size} hot={i === 0} />
      ))}
    </g>
  );
};

/**
 * 分叉：从 (x,y) 向各个方向长出带弧度的细枝，枝头一个小点 + 标签，依次错开 stagger 帧。
 * branches: {a: 角度（度，0 向右，-90 向上）, len: 长度, label, bend?: 弯曲}
 */
export const Fan: React.FC<{f: number; at: number; x: number; y: number; branches: {a: number; len: number; label?: string; bend?: number}[]; stagger?: number; width?: number; size?: number; out?: number; main?: number}> = ({
  f,
  at,
  x,
  y,
  branches,
  stagger = 5,
  width = 1.6,
  size = 34,
  out,
  main,
}) => {
  const o = out === undefined ? 1 : 1 - ease((f - out) / 12);
  return (
    <g opacity={o}>
      {branches.map((b, i) => {
        const rad = (b.a * Math.PI) / 180;
        const end: Pt = [x + Math.cos(rad) * b.len, y + Math.sin(rad) * b.len];
        const s = at + i * stagger;
        const isMain = main === i;
        const la = Math.cos(rad) >= 0.2 ? 'right' : Math.cos(rad) <= -0.2 ? 'left' : Math.sin(rad) < 0 ? 'top' : 'bottom';
        return (
          <g key={i}>
            <GrowLine f={f} at={s} dur={18} pts={arc([x, y], end, b.bend ?? 0.18)} width={isMain ? width * 2.2 : width} />
            {b.label ? <Node f={f} at={s + 14} x={end[0]} y={end[1]} r={isMain ? 5 : 3.5} label={b.label} size={isMain ? size * 1.15 : size} labelAt={la} /> : null}
          </g>
        );
      })}
    </g>
  );
};

/**
 * 织网：在 w×h 里撒一层抖动网格点，相邻点用略弯的细线连起来，从 center 向外按距离依次长出（spread 帧铺满）。
 * collapseAt 起整张网向 center 收拢、变淡（20 帧）；broken 给出一部分边画成断开的红色短线。
 */
export const Web: React.FC<{f: number; at: number; w: number; h: number; center: Pt; step?: number; spread?: number; seed?: number; collapseAt?: number; broken?: number; color?: string}> = ({
  f,
  at,
  w,
  h,
  center,
  step = 150,
  spread = 50,
  seed = 3,
  collapseAt,
  broken = 0,
  color = F.line,
}) => {
  const cols = Math.ceil(w / step) + 2;
  const rows = Math.ceil(h / step) + 2;
  const pt = (i: number, j: number): Pt => [(i - 0.5) * step + (rand(seed * 1000 + i * 37 + j) - 0.5) * step * 0.7, (j - 0.5) * step + (rand(seed * 2000 + i * 53 + j) - 0.5) * step * 0.7];
  const maxD = Math.hypot(w, h) * 0.6;
  const c = collapseAt === undefined ? 0 : ease((f - collapseAt) / 20);
  const squeeze = (p: Pt): Pt => [p[0] + (center[0] - p[0]) * c * 0.85, p[1] + (center[1] - p[1]) * c * 0.85];
  const edges: React.ReactNode[] = [];
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const a = pt(i, j);
      const nbs: Pt[] = [];
      if (i + 1 < cols) nbs.push(pt(i + 1, j));
      if (j + 1 < rows) nbs.push(pt(i, j + 1));
      if (i + 1 < cols && j + 1 < rows && rand(seed + i * 7 + j * 11) > 0.55) nbs.push(pt(i + 1, j + 1));
      nbs.forEach((b, k) => {
        const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const dist = Math.hypot(mid[0] - center[0], mid[1] - center[1]);
        const s = at + (dist / maxD) * spread;
        const key = `${i}-${j}-${k}`;
        const isBroken = broken > 0 && rand(seed * 3 + i * 13 + j * 17 + k) < broken;
        const near = Math.pow(1 - clamp01(dist / (maxD * 0.85)), 2.2);
        const pts = arc(squeeze(a), squeeze(b), (rand(i * 3 + j * 5 + k) - 0.5) * 0.5, 16);
        if (isBroken) {
          edges.push(<GrowLine key={key} f={f} at={s} dur={14} pts={partial(pts, 0.42).pts} width={1.2} color={F.red} head={false} opacity={(1 - c) * 0.9} glowR={3} />);
        } else {
          edges.push(<GrowLine key={key} f={f} at={s} dur={14} pts={pts} width={0.7 + near * 2.6} color={color} head={false} opacity={(0.14 + near * 0.86) * (1 - c * 0.9)} glowR={1 + near * 7} />);
        }
      });
    }
  return <g>{edges}</g>;
};

/**
 * 刻度环：圆环 30 帧画满（从 12 点顺时针），外圈 60 个刻度依次亮起，中心大数字计数，环上一颗亮点走到 mark（0–1）处。
 */
export const Ring: React.FC<{f: number; at: number; x: number; y: number; r: number; value: string; title?: string; sub?: string; mark?: number; markLabel?: string; out?: number; color?: string}> = ({
  f,
  at,
  x,
  y,
  r,
  value,
  title,
  sub,
  mark = 0.8,
  markLabel,
  out,
  color = F.line,
}) => {
  const o = out === undefined ? 1 : 1 - ease((f - out) / 12);
  const pts: Pt[] = Array.from({length: 121}, (_, i) => {
    const t = (i / 120) * Math.PI * 2 - Math.PI / 2;
    return [x + Math.cos(t) * r, y + Math.sin(t) * r];
  });
  const m = ease((f - at - 30) / 30) * mark;
  const mt = m * Math.PI * 2 - Math.PI / 2;
  const t1 = blurIn(f, at + 18, 14);
  return (
    <g opacity={o}>
      <GrowLine f={f} at={at} dur={30} pts={pts} width={2.5} color={color} head={false} />
      {Array.from({length: 60}, (_, i) => {
        const t = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const len = i % 5 === 0 ? 18 : 8;
        const on = clamp01((f - at - 10 - i * 0.5) / 8);
        return <line key={i} x1={x + Math.cos(t) * (r + 14)} y1={y + Math.sin(t) * (r + 14)} x2={x + Math.cos(t) * (r + 14 + len)} y2={y + Math.sin(t) * (r + 14 + len)} stroke={F.lineDim} strokeWidth={1.5} opacity={on} />;
      })}
      {f > at + 30 ? (
        <>
          <circle cx={x + Math.cos(mt) * r} cy={y + Math.sin(mt) * r} r={40} fill="url(#fl-halo)" />
          <circle cx={x + Math.cos(mt) * r} cy={y + Math.sin(mt) * r} r={9} fill={F.gold} />
          {markLabel ? (
            <text x={x + Math.cos(mt) * (r + 70)} y={y + Math.sin(mt) * (r + 70) + 12} textAnchor="middle" style={{fontFamily: FF.cn}} fontSize={r * 0.12} fill={F.text} opacity={clamp01((f - at - 60) / 10)}>
              {markLabel}
            </text>
          ) : null}
        </>
      ) : null}
      <g opacity={t1.opacity}>
        {title ? (
          <text x={x} y={y - r * 0.33} textAnchor="middle" style={{fontFamily: FF.cn}} fontSize={r * 0.14} fill={F.text}>
            {title}
          </text>
        ) : null}
        <text x={x} y={y + r * 0.14} textAnchor="middle" fontSize={r * 0.42} fill={F.text} style={{fontFamily: FF.cnBlack, filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.25))'}}>
          {value}
        </text>
        {sub ? (
          <text x={x} y={y + r * 0.38} textAnchor="middle" style={{fontFamily: FF.cn}} fontSize={r * 0.09} fill={F.textDim}>
            {sub}
          </text>
        ) : null}
      </g>
    </g>
  );
};

/** 消息气泡节点（冷底）：薄荷绿圆角气泡 + 黑字 + 一圈绿光，像一条消息挂在网的起点。12 帧从 0.85 倍弹到原大 */
export const Pill: React.FC<{f: number; at: number; x: number; y: number; text: string; size?: number; out?: number; sub?: string}> = ({f, at, x, y, text, size = 34, out, sub}) => {
  const a = blurIn(f, at, 12, out);
  if (a.opacity <= 0) return null;
  const s = 0.85 + 0.15 * a.v;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, opacity: a.opacity, filter: a.filter}}>
      <div style={{padding: `${size * 0.42}px ${size * 0.7}px`, borderRadius: size * 0.45, background: `linear-gradient(180deg, ${F.mint}, #8ee874)`, color: '#0e2a0c', fontFamily: FF.cn, fontSize: size, whiteSpace: 'nowrap', boxShadow: `0 0 ${size}px rgba(168,248,136,0.45), 0 0 ${size * 0.3}px rgba(168,248,136,0.8)`}}>{text}</div>
      {sub ? <div style={{marginTop: size * 0.3, textAlign: 'center', fontFamily: FF.latin, fontSize: size * 0.5, color: F.textFaint, letterSpacing: '0.12em'}}>{sub}</div> : null}
    </div>
  );
};

/** 散点：一串带光晕的小点依次亮起（每点 gap 帧），用来摆「观测到的事实」 */
export const Dots: React.FC<{f: number; at: number; pts: Pt[]; gap?: number; r?: number; out?: number}> = ({f, at, pts, gap = 4, r = 5, out}) => (
  <g>
    {pts.map((p, i) => (
      <Node key={i} f={f} at={at + i * gap} x={p[0]} y={p[1]} r={r} out={out} />
    ))}
  </g>
);
