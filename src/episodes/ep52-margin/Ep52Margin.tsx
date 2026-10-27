import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp01} from '../../library/anim';
import {arc, curve, Fan, FilDefs, GrowLine, Node, partial, Pt, Ring, Web} from '../../library/filament/charts';
import {camera, collapse, countTo, FilBg, FilGrain, Slam} from '../../library/filament/stage';
import {ease, F, FF, vietFont} from '../../library/filament/theme';
import {ANCHOR, ANCHOR_SUB, barSec, BURST, BURST_GAP, BURST_WORDS, CUES, cueEnd, cueStart, DARK2_FROM, DARK_FROM, DURATION, FPS, FREEZE, fr, H, HIT, HIT2, SFX, viNum, W} from './timeline';

/**
 * ep52 人生的余地（丝线星图风，竖屏）。一张画布上的连续长镜头：路线 → 余地砸出 → 改道 → 刻度环 → 连砸 → 94% → 河流绕石 → 三角洲 → 收成一点。
 * 所有时间来自 timeline.ts；f 是全局帧号。
 */

const B = (k: number) => fr(barSec(k));
const cx = W / 2;

/** 重拍前 FREEZE 帧冻结画面：返回「画面用的帧号」 */
const freezeAt = (f: number) => {
  for (const h of [HIT, HIT2]) if (f >= h - FREEZE && f < h) return h - FREEZE;
  return f;
};
/** 重拍前收暗：0 → 0.94 */
const darkness = (f: number) => {
  for (const [from, h] of [
    [DARK_FROM, HIT],
    [DARK2_FROM, HIT2],
  ])
    if (f >= from && f < h) return 0.94 * ease((f - from) / (h - FREEZE - from));
  return 0;
};

/** 段落容器：模糊交叉淡化 */
const Seg: React.FC<{f: number; from: number; to: number; fade?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({f, from, to, fade = 12, style, children}) => {
  if (f < from - fade || f > to + fade) return null;
  const v = clamp01((f - from + fade) / (fade * 2)) * (1 - clamp01((f - to + fade) / (fade * 2)));
  return <AbsoluteFill style={{opacity: v, filter: v < 1 ? `blur(${(1 - v) * 8}px)` : undefined, ...style}}>{children}</AbsoluteFill>;
};

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
    <FilDefs />
    {children}
  </svg>
);

/** 字幕（越南语）：逐词模糊扫入，上方 7%；最后一句的提问放在画面中部。重拍那一刻（锚词）不出字幕 */
const Subs: React.FC<{f: number}> = ({f}) => {
  const i = CUES.findIndex((_, k) => f >= cueStart(k) - 2 && f < cueEnd(k));
  if (i < 0 || (f >= HIT && f < B(9))) return null;
  const at = cueStart(i);
  const end = cueEnd(i);
  const [, text] = CUES[i];
  const o = 1 - clamp01((f - (end - 8)) / 8);
  const isLast = i === CUES.length - 1;
  const words = text.split(' ');
  const per = Math.min(4, 22 / words.length);
  return (
    <div style={{position: 'absolute', left: 70, width: W - 140, top: isLast ? H * 0.34 : H * 0.07, textAlign: 'center', opacity: o, filter: o < 1 ? `blur(${(1 - o) * 10}px)` : undefined}}>
      <div style={{fontFamily: FF.cn, fontSize: isLast ? 60 : 54, lineHeight: 1.4, color: F.text, textShadow: '0 2px 16px rgba(0,0,0,0.95)'}}>
        {words.map((w, k) => {
          const t = clamp01((f - at - k * per) / 9);
          const e = ease(t);
          return (
            <span key={k} style={{opacity: e, filter: t < 1 ? `blur(${(1 - e) * 12}px)` : undefined}}>
              {w}
              {k < words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** 大号发光字（数字、结论）：从 1.25 倍 + 模糊收到原大（10 帧），外发光很强 */
const Glow: React.FC<{f: number; at: number; text: string; y: number; size: number; color?: string; sub?: string; out?: number}> = ({f, at, text, y, size, color = F.text, sub, out}) => {
  const t = f - at;
  if (t < 0) return null;
  const p = ease(t / 10);
  const o = clamp01(t / 3) * (out === undefined ? 1 : 1 - ease((f - out) / 10));
  const so = clamp01((t - 12) / 12) * o;
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: y, textAlign: 'center', opacity: o}}>
      <div
        style={{
          fontFamily: FF.latin,
          fontWeight: 600,
          fontSize: size,
          lineHeight: 1,
          color,
          transform: `scale(${1.25 - 0.25 * p})`,
          filter: p < 1 ? `blur(${(1 - p) * 12}px)` : undefined,
          textShadow: `0 0 ${size * 0.12}px ${color}, 0 0 ${size * 0.35}px ${color}88, 0 0 ${size * 0.8}px ${color}44`,
        }}
      >
        {text}
      </div>
      {sub ? <div style={{marginTop: size * 0.12, fontFamily: FF.cn, fontSize: 34, color: F.textDim, opacity: so}}>{sub}</div> : null}
    </div>
  );
};

/** 路线：起点在下、终点在上的一条 S 形导航线 */
const ROUTE: Pt[] = [...curve([cx, 1560], [cx + 260, 1300], [cx, 1080], 40), ...curve([cx, 1080], [cx - 260, 860], [cx, 640], 40).slice(1), ...curve([cx, 640], [cx + 160, 500], [cx, 380], 30).slice(1)];
const BREAKS = [0.3, 0.52, 0.74];
const BREAK_LABELS = ['Chọn sai ngành', 'Lỡ một người', 'Việc ba tháng'];
const at01 = (p: number) => partial(ROUTE, p).head;

const RouteShot: React.FC<{f: number}> = ({f}) => {
  const dim = 1 - 0.55 * clamp01((f - B(4)) / 30);
  return (
    <AbsoluteFill style={camera(f, 0, HIT, 0.08, [0, 120])}>
      <Svg>
        <GrowLine f={f} at={10} dur={B(3)} pts={ROUTE} width={3} color={F.warmLine} opacity={dim} />
        <Node f={f} at={0} x={cx} y={1560} hot label="Xuất phát" labelAt="right" size={38} />
        <Node f={f} at={B(2)} x={cx} y={380} label="Đích" labelAt="right" size={34} r={4} />
        {BREAKS.map((p, i) => {
          const [x, y] = at01(p);
          const s = B(4 + i);
          const ring = clamp01((f - s) / 16);
          return (
            <g key={i}>
              {ring > 0 && ring < 1 ? <circle cx={x} cy={y} r={20 + ring * 90} fill="none" stroke={F.red} strokeWidth={2} opacity={1 - ring} /> : null}
              <Node f={f} at={s} x={x} y={y} red r={9} label={BREAK_LABELS[i]} labelAt={i % 2 ? 'left' : 'right'} size={36} />
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

/** 改道：从第一个断点长出几条新路线，一条最亮，通往上方 */
const Reroute: React.FC<{f: number}> = ({f}) => {
  const [x, y] = at01(BREAKS[0]);
  return (
    <Svg>
      <GrowLine f={f} at={-100} dur={1} pts={ROUTE} width={2} color={F.warmLine} opacity={0.25} head={false} />
      <Node f={f} at={-100} x={x} y={y} red r={9} />
      <Fan
        f={f}
        at={B(9) + 4}
        x={x}
        y={y}
        stagger={6}
        main={2}
        size={32}
        branches={[
          {a: -165, len: 330, label: 'Đổi hướng', bend: 0.25},
          {a: -130, len: 420, label: 'Đi làm trước', bend: 0.2},
          {a: -95, len: 560, label: 'Bắt đầu lại', bend: -0.15},
          {a: -55, len: 400, label: 'Đổi ngành', bend: -0.2},
          {a: -20, len: 300, label: 'Chậm lại', bend: -0.25},
        ]}
      />
    </Svg>
  );
};

/** 河流：上方一股流线撞上石头，左右分开绕过，再汇合、散成三角洲 */
const River: React.FC<{f: number; s: number}> = ({f, s}) => {
  const stone: Pt = [cx, 760];
  const strands = [-36, -18, 0, 18, 36];
  const widen = clamp01((f - B(20)) / 40);
  return (
    <Svg>
      {strands.map((dx, i) => (
        <GrowLine key={`in${i}`} f={f} at={s + i * 2} dur={30} pts={curve([cx + dx * 2.2, 440], [cx + dx * 1.6, 560], [cx + dx, 640], 30)} width={i === 2 ? 3 : 1.4} color={F.warmLine} head={i === 2} />
      ))}
      {/* 石头 */}
      <g opacity={clamp01((f - s - 10) / 14)}>
        <ellipse cx={stone[0]} cy={stone[1]} rx={96} ry={78} fill="#0d0a07" stroke={F.lineDim} strokeWidth={2} />
        <ellipse cx={stone[0] - 20} cy={stone[1] - 22} rx={40} ry={18} fill="rgba(242,234,216,0.05)" />
      </g>
      {/* 左右绕过 */}
      {strands.map((dx, i) => {
        const side = dx <= 0 ? -1 : 1;
        const spread = 130 + Math.abs(dx) * 1.6;
        return (
          <g key={`around${i}`}>
            <GrowLine f={f} at={s + 30 + i * 2} dur={34} pts={curve([cx + dx, 640], [cx + side * spread * 1.3, 760], [cx + dx * 0.6, 900], 30)} width={i === 2 ? 2.6 : 1.3} color={F.warmLine} head={i === 0 || i === 4} />
            {i === 2 ? <GrowLine f={f} at={s + 32} dur={34} pts={curve([cx, 640], [cx - 160, 760], [cx, 900], 30)} width={2.6} color={F.warmLine} head /> : null}
          </g>
        );
      })}
      {/* 汇合往下 */}
      <GrowLine f={f} at={s + 60} dur={24} pts={[[cx, 900], [cx, 1150]]} width={3 + widen * 3} color={F.warmLine} />
      {/* 三角洲 */}
      <Fan
        f={f}
        at={B(20)}
        x={cx}
        y={1150}
        stagger={3}
        width={1.4 + widen}
        branches={Array.from({length: 11}, (_, i) => ({a: 35 + i * 11, len: 330 + ((i * 53) % 5) * 45, bend: (i - 5) * 0.03}))}
      />
      {Array.from({length: 11}, (_, i) => {
        const a = ((35 + i * 11) * Math.PI) / 180;
        const L = 330 + ((i * 53) % 5) * 45;
        const end: Pt = [cx + Math.cos(a) * L, 1150 + Math.sin(a) * L];
        return <GrowLine key={`sub${i}`} f={f} at={B(20) + 30 + i * 2} dur={20} pts={arc(end, [end[0] + Math.cos(a + 0.4) * 120, end[1] + Math.sin(a + 0.4) * 120], 0.2, 12)} width={0.9} color={F.warmLine} opacity={0.6} head={false} />;
      })}
    </Svg>
  );
};

export const Ep52Margin: React.FC = () => {
  const real = useCurrentFrame();
  const f = freezeAt(real);
  const dark = darkness(real);
  const flash = (h: number) => (real >= h ? Math.max(0, 1 - (real - h) / 24) : 0);
  const glowBoost = 1 + 1.4 * Math.max(flash(HIT), flash(HIT2));

  return (
    <AbsoluteFill style={{background: F.bgWarm, fontFamily: FF.cn, ...vietFont}}>
      <Audio src={staticFile('audio/ep52-margin/bgm.wav')} />
      {SFX.map(([file, at, vol], i) => (
        <Sequence key={i} from={at}>
          <Audio src={staticFile(file)} volume={vol} />
        </Sequence>
      ))}

      <FilBg f={f} w={W} h={H} tone="warm" glow={[50, 50]} strength={glowBoost} />

      {/* 路线（0 → HIT） */}
      <Seg f={f} from={0} to={HIT + 6} fade={6}>
        <RouteShot f={f} />
      </Seg>

      {/* 锚词砸出 */}
      <Seg f={f} from={HIT} to={B(9)} fade={6}>
        <Slam f={f} at={HIT} text={ANCHOR.toUpperCase()} x={cx} y={900} size={138} rot={-2} />
        <div style={{position: 'absolute', left: 0, width: W, top: 1120, textAlign: 'center', fontFamily: FF.latinItalic, fontSize: 44, color: F.textDim, opacity: clamp01((f - HIT - 18) / 12)}}>
          {ANCHOR_SUB}
        </div>
      </Seg>

      {/* 改道 */}
      <Seg f={f} from={B(9)} to={B(11)}>
        <AbsoluteFill style={camera(f, B(9), B(11) - B(9), 0.05, [0, 80])}>
          <Reroute f={f} />
        </AbsoluteFill>
      </Seg>

      {/* 刻度环 */}
      <Seg f={f} from={B(11)} to={BURST}>
        <Svg>
          <Ring f={f} at={B(11)} x={cx} y={820} r={330} value={viNum(Number(countTo(f, B(11) + 18, 40, 0, 30000)))} title="Một đời khoảng" sub="ngày" mark={f < B(13) ? 0.004 : 0.012} markLabel={f < B(13) ? '1 ngày' : '1 năm'} />
        </Svg>
        <Glow f={f} at={B(12)} text="0,003%" y={1300} size={170} color={F.gold} sub="Sai một ngày" out={B(13) - 6} />
        <Glow f={f} at={B(13)} text="1,2%" y={1300} size={190} color={F.gold} sub="Sai trọn một năm" />
      </Seg>

      {/* 连砸 */}
      <Seg f={f} from={BURST} to={HIT2 + 4} fade={6}>
        <Svg>
          <Web f={f} at={BURST} w={W} h={H} center={[cx, 960]} step={160} spread={22} broken={0.08} />
        </Svg>
        {BURST_WORDS.map((w, i) => {
          const pos: Pt[] = [
            [360, 640],
            [700, 900],
            [380, 1230],
            [680, 1520],
          ];
          return <Slam key={w} f={f} at={BURST + BURST_GAP * (2 + i)} text={w} x={pos[i][0]} y={pos[i][1]} size={104} rot={i % 2 ? 3 : -4} />;
        })}
      </Seg>

      {/* 94% */}
      <Seg f={f} from={HIT2} to={B(18)} fade={6}>
        <Glow f={f} at={HIT2} text={`${Math.round(100 - (365 * 5 * 100) / 30000)}%`} y={720} size={380} color={F.text} sub="1.825 ngày ÷ 30.000 ngày — chỉ mất 6%" />
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {[0, 0.3].map((d, i) => {
            const r = clamp01((f - HIT2) / 24 - d);
            return r > 0 && r < 1 ? <ellipse key={i} cx={cx} cy={900} rx={200 + 700 * ease(r)} ry={80 + 260 * ease(r)} fill="none" stroke={F.text} strokeWidth={2} opacity={(1 - r) * 0.6} /> : null;
          })}
        </svg>
      </Seg>

      {/* 河流 + 三角洲 + 锚词重新定义 */}
      <Seg f={f} from={B(18)} to={B(27)} fade={12}>
        <AbsoluteFill style={{...camera(f, B(18), B(27) - B(18), 0.06, [0, -60]), ...collapse(f, B(26) + 30, 24, [50, 60])}}>
          <River f={f} s={B(18)} />
        </AbsoluteFill>
        <div style={{position: 'absolute', left: 0, width: W, top: 1500, textAlign: 'center', opacity: clamp01((f - B(23)) / 14) * (1 - clamp01((f - B(26) - 30) / 14))}}>
          <div style={{fontFamily: FF.cnBlack, fontSize: 118, color: F.gold, letterSpacing: '0.02em', textShadow: `0 0 30px ${F.gold}, 0 0 80px rgba(232,200,120,0.45)`, filter: `blur(${(1 - clamp01((f - B(23)) / 14)) * 10}px)`}}>{ANCHOR}</div>
        </div>
      </Seg>

      {/* 收成一点 */}
      <Seg f={f} from={B(27)} to={DURATION + 20}>
        <Svg>
          <Node f={f} at={B(27)} x={cx} y={1100} hot r={8} />
        </Svg>
      </Seg>

      <Subs f={f} />
      <AbsoluteFill style={{background: '#000', opacity: dark, pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: '#000', opacity: clamp01((real - (DURATION - FPS)) / FPS), pointerEvents: 'none'}} />
      <FilGrain />
    </AbsoluteFill>
  );
};

