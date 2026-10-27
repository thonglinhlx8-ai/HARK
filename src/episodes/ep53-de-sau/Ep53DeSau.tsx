import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp01} from '../../library/anim';
import {curve, FilDefs, GrowLine, Node, partial, Pill, Pt, Web} from '../../library/filament/charts';
import {camera, collapse, FilBg, FilGrain, Slam, SlitLine} from '../../library/filament/stage';
import {ease, F, FF, vietFont} from '../../library/filament/theme';
import {ANCHOR, B, BURST, BURST_GAP, CUES, cueEnd, cueStart, DARK2_FROM, DARK_FROM, DAYS_LEFT, DURATION, EXCUSES, FOOTNOTE, FPS, FREEZE, H, HIT, HIT2, HIT_TEXT, SFX, USED_PCT, viNum, VISITS_LEFT, W} from './timeline';

/**
 * ep53 Để sau（丝线星图风，竖屏，越南语）。tin nhắn → 40 điểm → 40 LẦN → 200 ngày → 6.570 điểm → 97% → các lý do → ĐỂ SAU → 40 thành 39 → các đường về một ngọn đèn「nhà」。
 */
const cx = W / 2;
/** 越南语字幕体 / 展示体（比 Noto Serif 600 细、更像参考片的宋体字幕） */
const TXT = "'Filament Viet Text', serif";
const DISP = "'Filament Viet Display', serif";
const IVORY = '#efe6d3';
const path = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
const lerpPts = (a: Pt, b: Pt, n = 10): Pt[] => Array.from({length: n + 1}, (_, i) => [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n]);

const freezeAt = (f: number) => {
  for (const h of [HIT, HIT2]) if (f >= h - FREEZE && f < h) return h - FREEZE;
  return f;
};
const darkness = (f: number) => {
  for (const [from, h] of [
    [DARK_FROM, HIT],
    [DARK2_FROM, HIT2],
  ])
    if (f >= from && f < h) return 0.94 * ease((f - from) / (h - FREEZE - from));
  return 0;
};

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

/** 字幕：逐字模糊扫入（每字约 1.6 帧，单字 8 帧收清）；引号里的「để sau」变红；重拍那一小节不出字幕；最后一句放中部 */
const Subs: React.FC<{f: number}> = ({f}) => {
  const i = CUES.findIndex((_, k) => f >= cueStart(k) - 2 && f < cueEnd(k));
  if (i < 0 || (f >= HIT && f < B(7)) || (f >= HIT2 && f < B(16))) return null;
  const at = cueStart(i);
  const o = 1 - clamp01((f - (cueEnd(i) - 8)) / 8);
  const isLast = i === CUES.length - 1;
  const chars = [...CUES[i][1]];
  const per = Math.min(1.8, 26 / chars.length);
  let inQuote = false;
  return (
    <div style={{position: 'absolute', left: 80, width: W - 160, top: isLast ? H * 0.3 : H * 0.075, textAlign: 'center', opacity: o, filter: o < 1 ? `blur(${(1 - o) * 10}px)` : undefined}}>
      <div style={{fontFamily: TXT, fontWeight: 500, fontSize: isLast ? 58 : 46, lineHeight: 1.45, letterSpacing: '0.015em', color: IVORY, textShadow: '0 0 22px rgba(255,222,170,0.22), 0 1px 3px rgba(0,0,0,0.85)'}}>
        {chars.map((c, k) => {
          if (c === '"') inQuote = !inQuote;
          const t = clamp01((f - at - k * per) / 8);
          const e = ease(t);
          return (
            <span key={k} style={{opacity: e, filter: t < 1 ? `blur(${(1 - e) * 12}px)` : undefined, color: inQuote || c === '"' ? F.redHot : undefined, textShadow: inQuote ? '0 0 18px rgba(216,57,43,0.6)' : undefined}}>
              {c}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** 大号发光字 */
const Glow: React.FC<{f: number; at: number; text: string; y: number; size: number; color?: string; sub?: string; out?: number; font?: string}> = ({f, at, text, y, size, color = IVORY, sub, out, font = DISP}) => {
  const t = f - at;
  if (t < 0) return null;
  const p = ease(t / 10);
  const o = clamp01(t / 3) * (out === undefined ? 1 : 1 - ease((f - out) / 10));
  const so = clamp01((t - 12) / 12) * o;
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: y, textAlign: 'center', opacity: o}}>
      <div
        style={{
          fontFamily: font,
          fontWeight: 600,
          fontSize: size,
          lineHeight: 1,
          color,
          whiteSpace: 'nowrap',
          transform: `scale(${1.25 - 0.25 * p})`,
          filter: p < 1 ? `blur(${(1 - p) * 12}px)` : undefined,
          letterSpacing: '0.01em',
          fontVariantNumeric: 'lining-nums',
          fontFeatureSettings: '"lnum" 1',
          textShadow: `0 0 ${size * 0.06}px ${color}cc, 0 0 ${size * 0.25}px ${color}66, 0 0 ${size * 0.7}px ${color}2a`,
        }}
      >
        {text}
      </div>
      {sub ? <div style={{marginTop: size * 0.1, fontFamily: TXT, fontSize: 38, letterSpacing: '0.12em', color: 'rgba(239,230,211,0.62)', opacity: so}}>{sub}</div> : null}
    </div>
  );
};

const Ripple: React.FC<{f: number; at: number; y: number; color?: string}> = ({f, at, y, color = F.text}) => (
  <svg width={W} height={H} style={{position: 'absolute'}}>
    {[0, 0.3].map((d, i) => {
      const r = clamp01((f - at) / 24 - d);
      return r > 0 && r < 1 ? <ellipse key={i} cx={cx} cy={y} rx={200 + 700 * ease(r)} ry={70 + 240 * ease(r)} fill="none" stroke={color} strokeWidth={2} opacity={(1 - r) * 0.6} /> : null;
    })}
  </svg>
);

/** 40 个点：8 行 × 5 列，蛇形排序；一根线匀速穿过每个点，线头到了点才亮（参考片「线自己长」的语法）。
 *  split：每个点长出 5 根短丝 → 200 天；killAt：最后一段线变红断开、最后一个点往下坠落熄灭 */
const GRID: Pt[] = Array.from({length: VISITS_LEFT}, (_, i) => {
  const row = Math.floor(i / 5);
  const col = row % 2 ? 4 - (i % 5) : i % 5;
  return [cx - 240 + col * 120, 470 + row * 100];
});
const THREAD: Pt[] = GRID.flatMap((p, i) => (i ? lerpPts(GRID[i - 1], p).slice(1) : [p]));
const VisitGrid: React.FC<{f: number; showFrom: number; showDur: number; dim?: number; split?: number; killAt?: number}> = ({f, showFrom, showDur, dim = 1, split, killAt}) => {
  const prog = clamp01((f - showFrom) / showDur);
  const reach = prog * (VISITS_LEFT - 1); // 线头到了第几个点
  const sp = split === undefined ? 0 : ease((f - split) / 26);
  const k = killAt === undefined ? 0 : clamp01((f - killAt) / 22);
  const cut = killAt !== undefined && f >= killAt - 14;
  const n = THREAD.length - 1;
  const head = Math.floor(reach * 10);
  const threadPts = THREAD.slice(0, Math.min(n, head) + 1);
  const mainPts = cut ? threadPts.slice(0, n - 9) : threadPts;
  const redPts = cut ? THREAD.slice(n - 10) : [];
  const hp = THREAD[Math.min(n, head)];
  return (
    <Svg>
      <g opacity={dim * (1 - 0.6 * sp)}>
        <path d={path(mainPts)} fill="none" stroke={F.warmLine} strokeWidth={1.6} opacity={0.55} style={{filter: `drop-shadow(0 0 5px ${F.warmLine})`}} />
        {redPts.length ? <path d={path(redPts.map(([x, y], j) => [x + j * 1.5 * k, y + 60 * k * (j / 10)] as Pt))} fill="none" stroke={F.redHot} strokeWidth={2} opacity={1 - k} strokeDasharray={k > 0 ? '10 8' : undefined} /> : null}
        {prog > 0 && prog < 1 ? (
          <>
            <circle cx={hp[0]} cy={hp[1]} r={26} fill="url(#fl-halo)" />
            <circle cx={hp[0]} cy={hp[1]} r={4} fill="#fff" />
          </>
        ) : null}
      </g>
      {GRID.map(([x, y], i) => {
        const a = clamp01((reach - i + 0.15) / 0.4);
        if (a <= 0) return null;
        const pop = 1 + 0.6 * Math.max(0, 1 - (reach - i) / 0.6) * (prog < 1 ? 1 : 0);
        const last = i === VISITS_LEFT - 1;
        const red = last && cut;
        const fall = last ? 70 * k * k : 0;
        const o = a * dim * (last ? 1 - k : 1);
        if (sp > 0)
          return (
            <g key={i} opacity={o}>
              {Array.from({length: 5}, (_, j) => {
                const ang = (j / 5) * Math.PI * 2 - Math.PI / 2 + i * 0.4;
                const ex = x + Math.cos(ang) * 30 * sp;
                const ey = y + Math.sin(ang) * 30 * sp;
                return (
                  <g key={j}>
                    <line x1={x} y1={y} x2={ex} y2={ey} stroke={F.warmLine} strokeWidth={1.2} opacity={0.6} />
                    <circle cx={ex} cy={ey} r={4.5} fill={IVORY} style={{filter: 'drop-shadow(0 0 5px rgba(255,236,200,0.9))'}} />
                  </g>
                );
              })}
              <circle cx={x} cy={y} r={3} fill={IVORY} />
            </g>
          );
        return (
          <g key={i} opacity={o} transform={`translate(0 ${fall})`}>
            <circle cx={x} cy={y} r={24 * pop} fill={red ? 'url(#fl-halo-red)' : 'url(#fl-halo)'} opacity={0.7} />
            <circle cx={x} cy={y} r={8} fill={red ? F.redHot : IVORY} />
          </g>
        );
      })}
    </Svg>
  );
};

/** 6570 个点（73 × 90）铺满：一条 path 画完，逐行出现；dimAt 后变暗表示「已经用掉」 */
const FCOLS = 73;
const FROWS = 90;
const FSTEP = 13.4;
const FX0 = (W - (FCOLS - 1) * FSTEP) / 2;
const FY0 = 330;
const dotPath = (pts: Pt[], r: number) => pts.map(([x, y]) => `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`).join('');
const ORIGIN: Pt = [cx, FY0 + (FROWS - 1) * FSTEP];
const Field: React.FC<{f: number; at: number; dimAt: number}> = ({f, at, dimAt}) => {
  // 从底部中间（「nhà」）像水波一样一圈圈铺开，波前一道亮弧
  const R = 1450 * ease((f - at) / 50);
  const pts: Pt[] = [];
  const hot: Pt[] = [];
  for (let r = 0; r < FROWS; r++)
    for (let c = 0; c < FCOLS; c++) {
      const x = FX0 + c * FSTEP;
      const y = FY0 + r * FSTEP;
      const dist = Math.hypot(x - ORIGIN[0], y - ORIGIN[1]);
      if (dist < R) (dist > R - 70 ? hot : pts).push([x, y]);
    }
  const d = ease((f - dimAt) / 20);
  const cl: Pt[] = [];
  const show = clamp01((f - dimAt - 6) / 14);
  for (let i = 0; i < DAYS_LEFT; i++) cl.push([cx - 9.5 * FSTEP + (i % 20) * FSTEP, FY0 + FROWS * FSTEP + 40 + Math.floor(i / 20) * FSTEP]);
  return (
    <Svg>
      <path d={dotPath(pts, 2.4)} fill={IVORY} opacity={0.6 - 0.46 * d} />
      {hot.length ? <path d={dotPath(hot, 3)} fill="#fff" opacity={0.95} style={{filter: 'drop-shadow(0 0 6px rgba(255,236,200,0.9))'}} /> : null}
      {show > 0 ? <path d={dotPath(cl, 2.8)} fill={F.gold} opacity={show} style={{filter: 'drop-shadow(0 0 6px rgba(232,200,120,0.9))'}} /> : null}
      {show > 0 ? (
        <text x={cx + 10.5 * FSTEP + 16} y={FY0 + FROWS * FSTEP + 40 + 4.5 * FSTEP + 10} style={{fontFamily: TXT}} fontSize={30} fill={F.gold} opacity={show}>
          còn lại
        </text>
      ) : null}
    </Svg>
  );
};

/** 四面八方的线收拢到一盏灯 */
const HOME: Pt = [cx, 1080];
const SOURCES: Pt[] = [
  [-40, 420],
  [1120, 380],
  [-40, 1500],
  [1120, 1620],
  [200, 1960],
  [880, 1960],
  [-40, 900],
  [1120, 1100],
];
const Home: React.FC<{f: number; at: number}> = ({f, at}) => (
  <Svg>
    {SOURCES.map((s, i) => {
      const mid: Pt = [(s[0] + HOME[0]) / 2 + (i % 2 ? 120 : -120), (s[1] + HOME[1]) / 2 + (i % 3 ? -80 : 80)];
      return <GrowLine key={i} f={f} at={at + i * 4} dur={40} pts={curve(s, mid, HOME, 40)} width={i % 3 === 0 ? 2.6 : 1.4} color={F.warmLine} opacity={0.85} />;
    })}
    <Node f={f} at={at + 40} x={HOME[0]} y={HOME[1]} hot r={10} label="nhà" labelAt="bottom" size={40} />
  </Svg>
);

const Foot: React.FC<{f: number; from: number; to: number}> = ({f, from, to}) => {
  const o = clamp01((f - from) / 14) * (1 - clamp01((f - to) / 14));
  return o > 0 ? <div style={{position: 'absolute', left: 60, width: W - 120, top: H * 0.93, textAlign: 'center', fontFamily: FF.cn, fontSize: 22, color: F.textFaint, opacity: o}}>{FOOTNOTE}</div> : null;
};

export const Ep53DeSau: React.FC = () => {
  const real = useCurrentFrame();
  const f = freezeAt(real);
  const dark = darkness(real);
  const flash = (h: number) => (real >= h ? Math.max(0, 1 - (real - h) / 24) : 0);
  const glowBoost = 1 + 1.4 * Math.max(flash(HIT), flash(HIT2));
  const minusFlip = B(16) + 30;

  return (
    <AbsoluteFill style={{background: F.bgWarm, fontFamily: FF.cn, ...vietFont}}>
      <Audio src={staticFile('audio/ep53-de-sau/bgm.wav')} />
      {SFX.map(([file, at, vol], i) => (
        <Sequence key={i} from={at}>
          <Audio src={staticFile(file)} volume={vol} />
        </Sequence>
      ))}
      <FilBg f={f} w={W} h={H} tone="warm" glow={[50, 48]} strength={glowBoost} />

      {/* 第一秒：消息 */}
      <Seg f={f} from={0} to={B(2)} fade={8}>
        <AbsoluteFill style={camera(f, 0, B(2), 0.07, [0, -24])}>
        <AbsoluteFill style={collapse(f, B(2) - 16, 16, [50, 50])}>
          <Pill f={f} at={2} x={cx - 110} y={800} text="Bao giờ con về?" sub="Mẹ" size={44} />
          <Pill f={f} at={38} x={cx + 120} y={1000} text={`Con bận, ${ANCHOR} ạ`} size={44} />
        </AbsoluteFill>
        </AbsoluteFill>
      </Seg>

      {/* 40 个点 */}
      <Seg f={f} from={B(2)} to={HIT + 4} fade={8}>
        <AbsoluteFill style={camera(f, B(2), HIT - B(2), 0.07, [0, -40])}>
          <AbsoluteFill style={collapse(f, DARK_FROM, 18, [50, 42])}>
            <VisitGrid f={f} showFrom={B(2) + 20} showDur={B(5) + 30 - B(2) - 20} />
            <div style={{position: 'absolute', left: cx - 410, top: 452, fontFamily: TXT, fontSize: 30, color: F.textDim, opacity: clamp01((f - B(2) - 20) / 12)}}>55 tuổi</div>
            <div style={{position: 'absolute', left: cx - 410, top: 1152, fontFamily: TXT, fontSize: 30, color: F.textDim, opacity: clamp01((f - B(5) - 20) / 12)}}>~75 tuổi</div>
          </AbsoluteFill>
        </AbsoluteFill>
      </Seg>

      {/* 40 LẦN */}
      <Seg f={f} from={HIT} to={B(10)} fade={8}>
        <AbsoluteFill style={camera(f, HIT, B(10) - HIT, 0.06, [0, -30])}>
          <AbsoluteFill style={collapse(f, B(10) - 18, 18, [50, 80])}>
            <VisitGrid f={f} showFrom={-999} showDur={1} dim={f < B(7) ? 0.18 + 0.82 * ease((f - (B(7) - 10)) / 16) : 1} split={B(7) + 6} />
            <Glow f={f} at={HIT} text={HIT_TEXT} y={690} size={250} out={B(7) - 6} />
            <Ripple f={f} at={HIT} y={820} />
            <Glow f={f} at={B(8)} text={`${DAYS_LEFT} ngày`} y={1300} size={190} color={F.gold} sub="chưa tới 7 tháng" />
          </AbsoluteFill>
        </AbsoluteFill>
      </Seg>

      {/* 6570 点 → 97% */}
      <Seg f={f} from={B(10)} to={BURST + 4} fade={10}>
        <AbsoluteFill style={camera(f, B(10), BURST - B(10), 0.08, [0, 30])}>
          <Field f={f} at={B(10)} dimAt={B(12)} />
          <Glow f={f} at={B(13)} text={`${Math.round(USED_PCT)}%`} y={740} size={360} color={F.gold} sub="đã dùng hết" />
        </AbsoluteFill>
      </Seg>
      <Foot f={f} from={B(2)} to={BURST} />

      <SlitLine f={f} at={BURST - 8} w={W} h={H} />
      {/* 借口连砸 */}
      <Seg f={f} from={BURST} to={HIT2 + 4} fade={6} style={camera(f, BURST, HIT2 - BURST, 0.1)}>
        <Svg>
          <Web f={f} at={BURST} w={W} h={H} center={[cx, 960]} step={160} spread={18} broken={0.1} />
        </Svg>
        {EXCUSES.map((w, i) => {
          const pos: Pt[] = [
            [330, 620],
            [720, 880],
            [360, 1180],
            [700, 1460],
          ];
          return <Slam key={w} f={f} at={BURST + BURST_GAP * (1 + i)} text={w} x={pos[i][0]} y={pos[i][1]} size={108} rot={i % 2 ? 3 : -4} />;
        })}
      </Seg>

      {/* ĐỂ SAU */}
      <Seg f={f} from={HIT2} to={B(16)} fade={6}>
        <Slam f={f} at={HIT2} text={ANCHOR.toUpperCase()} x={cx} y={900} size={210} rot={-3} />
      </Seg>

      {/* 40 → 39 */}
      <Seg f={f} from={B(16)} to={B(18)} fade={10} style={camera(f, B(16), B(18) - B(16), 0.05, [0, -20])}>
        <VisitGrid f={f} showFrom={B(16) - 40} showDur={20} killAt={minusFlip} />
        <Glow f={f} at={B(16) + 4} text="40" y={1290} size={240} out={minusFlip} />
        <Glow f={f} at={minusFlip + 6} text="39" y={1290} size={240} color={F.redHot} />
      </Seg>

      {/* 回家 */}
      <Seg f={f} from={B(18)} to={DURATION + 20} fade={12}>
        <AbsoluteFill style={camera(f, B(18), B(21) - B(18), 0.1, [0, -50])}>
          <AbsoluteFill style={collapse(f, B(21) - 20, 24, [50, 56])}>
            <Home f={f} at={B(18)} />
          </AbsoluteFill>
        </AbsoluteFill>
      </Seg>
      <Seg f={f} from={B(21)} to={DURATION + 20}>
        <Svg>
          <Node f={f} at={B(21)} x={cx} y={1100} hot r={10} label="nhà" labelAt="bottom" size={40} />
        </Svg>
      </Seg>

      <Subs f={f} />
      <AbsoluteFill style={{background: '#000', opacity: dark, pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: '#000', opacity: clamp01((real - (DURATION - FPS)) / FPS), pointerEvents: 'none'}} />
      <FilGrain />
    </AbsoluteFill>
  );
};
