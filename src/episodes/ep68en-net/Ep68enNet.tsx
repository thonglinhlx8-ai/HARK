import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile, useCurrentFrame, getInputProps} from 'remotion';
import {clamp01, rand} from '../../library/anim';
import {arc, curve, Fan, FilDefs, GrowLine, Node, Pt, Ring, Web} from '../../library/filament/charts';
import {BigNumber, collapse, countTo, FilBg, FilGrain, Footnote} from '../../library/filament/stage';
import {ease, F, FF, vietFont} from '../../library/filament/theme';
import BASS_DATA from './bass.json';
import {BEATS, CT, CUES, cueEnd, cueStart, DURATION, H, HITS, V, W, WORD} from './timeline';
import {PO, poseAt, run, STAND, Stick, StickDefs, walk} from './stick';

/**
 * ep59 Tấm lưới — 丝线星图风竖屏，无口播。一张画布上的长镜头：
 * 一根时间轴 → 18/22/25/30 岁四处被红字砸断，侧面长出新枝（30 岁卡 drop 1）→ 织成网 → 收拢成点 → 社会时钟刻度环
 * → 别人的一根线 / 69% → 没走的那条路 → 全部断掉，只剩你 → 从你身上长出新线 → 70% 点阵 → 磨损的绳（「chưa hề đứt」卡 drop 2）
 * → U 形曲线 → 打结修补 → 网铺满 → 收成一点，结尾句。
 * Chuyển động tinh tế: chỉ mọc có gia tốc, đầu sợi phát sáng, camera trôi chậm theo đầu sợi, chữ mờ → nét; chỉ 2 cú drop mới giật.
 */

const SUBFONT = "'Ep58 Sub', 'Filament Viet', sans-serif";
if (typeof document !== 'undefined') {
  const h = delayRender('ep59 sub font');
  new FontFace('Ep58 Sub', `url(${staticFile('fonts/ep58/BeVietnamPro-ExtraBold.ttf')})`).load().then((l) => { document.fonts.add(l); continueRender(h); }).catch(() => continueRender(h));
}

const cx = W / 2;
const GOLD = '#f2c46d';
const BASS = (BASS_DATA as [number, number][]).map(([t, s]) => [Math.round(t * 30), s] as [number, number]);
/** nhịp bass: 0..1, tắt dần trong ~10 khung sau mỗi cú bass */
const bassAt = (f: number) => {
  let v = 0;
  for (const [b, s] of BASS) {
    if (b > f) break;
    if (f - b < 14) v = Math.max(v, s * Math.exp(-(f - b) / 4.5));
  }
  return v;
};
const fmt = (s: string) => s;

const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible', ...style}}>
    <FilDefs />
    <StickDefs />
    {children}
  </svg>
);

/** đoạn: mờ chéo (blur cross-fade) */
const Seg: React.FC<{f: number; from: number; to: number; fade?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({f, from, to, fade = 12, style, children}) => {
  if (f < from - fade || f > to + fade) return null;
  const v = clamp01((f - from + fade) / (fade * 2)) * (1 - clamp01((f - to + fade) / (fade * 2)));
  return <AbsoluteFill style={{opacity: v, filter: v < 1 ? `blur(${(1 - v) * 8}px)` : undefined, ...style}}>{children}</AbsoluteFill>;
};

/** camera trôi: e từ 0..1 theo easeInOut */
const drift = (f: number, a: number, b: number) => {
  const t = clamp01((f - a) / Math.max(1, b - a));
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

/** nhãn chữ nhỏ (HTML) mờ → nét */
const Label: React.FC<{f: number; at: number; x: number; y: number; text: string; size?: number; color?: string; out?: number; align?: 'left' | 'center' | 'right'; font?: string}> = ({f, at, x, y, text, size = 34, color = F.text, out, align = 'center', font}) => {
  const v = ease((f - at) / 12) * (out === undefined ? 1 : 1 - ease((f - out) / 12));
  if (v <= 0) return null;
  const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(${tx},-50%)`, whiteSpace: 'nowrap', fontFamily: font ?? FF.cn, fontSize: size, color, opacity: v, filter: v < 1 ? `blur(${(1 - v) * 10}px)` : undefined, textShadow: '0 2px 12px rgba(0,0,0,0.95)'}}>{text}</div>;
};

/** chữ đỏ ĐÓNG DẤU: rơi từ rất to + mờ xuống trong 7 khung, nảy nhẹ, vòng sóng + tàn lửa */
const Stamp: React.FC<{f: number; at: number; text: string; x: number; y: number; size?: number; color?: string; out?: number; rot?: number}> = ({f, at, text, x, y, size = 96, color = F.red, out, rot = -3}) => {
  const t = f - at + 6;
  if (t < 0) return null;
  const fall = clamp01(t / 6);
  const land = t - 6;
  const scale = land < 0 ? 3 - 2 * fall * fall : 1 + 0.06 * Math.exp(-land / 3) * Math.cos(land * 1.4);
  const o = clamp01(t / 3) * (out === undefined ? 1 : 1 - ease((f - out) / 12));
  const ring = clamp01(land / 20);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: o}}>
      <svg width={size * 6} height={size * 3} style={{position: 'absolute', left: -size * 3, top: -size * 1.5, overflow: 'visible'}}>
        {land >= 0 ? [0, 0.3].map((d, i) => {
          const r = clamp01(ring - d);
          return r > 0 && r < 1 ? <ellipse key={i} cx={size * 3} cy={size * 1.5} rx={size * (0.7 + 3 * ease(r))} ry={size * (0.25 + 0.8 * ease(r))} fill="none" stroke={color} strokeWidth={2.4} opacity={(1 - r) * 0.8} /> : null;
        }) : null}
        {Array.from({length: 14}, (_, i) => {
          const life = clamp01((land - i) / 36);
          if (life <= 0 || life >= 1) return null;
          const ang = rand(i + at) * Math.PI * 2;
          const d = size * (0.6 + 1.6 * ease(life)) * (0.6 + rand(i + 3) * 0.6);
          return <circle key={i} cx={size * 3 + Math.cos(ang) * d * 1.6} cy={size * 1.5 + Math.sin(ang) * d * 0.6 - life * 30} r={1.5 + rand(i + 9) * 2} fill={F.redHot} opacity={(1 - life) * 0.9} />;
        })}
      </svg>
      <div style={{position: 'relative', whiteSpace: 'nowrap', fontFamily: FF.cnBlack, fontSize: size, lineHeight: 1, color, transform: `scale(${scale.toFixed(4)}) rotate(${rot}deg)`, filter: land < 0 ? `blur(${(1 - fall) * 16}px)` : undefined, textShadow: `0 0 ${size * 0.25}px ${color}, 0 0 ${size * 0.6}px rgba(200,40,30,0.55), 0 ${size * 0.05}px 0 ${F.redDeep}`}}>
        {text}
      </div>
    </div>
  );
};

/* ===================== phụ đề: từng từ bật lên ===================== */
const Subs: React.FC<{f: number}> = ({f}) => {
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
  const last = i === CUES.length - 1;
  const top = last ? 800 : 190;
  const words: {chars: {c: string; hi: boolean; k: number}[]}[] = [];
  parts.forEach((p, k) => {
    if (p.c === ' ' || !words.length) words.push({chars: []});
    if (p.c !== ' ') words[words.length - 1].chars.push({...p, k});
  });
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top, textAlign: 'center', fontFamily: SUBFONT, fontWeight: 800, fontSize: last ? 66 : 56, lineHeight: 1.42, opacity: o, filter: o < 1 ? `blur(${(1 - o) * 8}px)` : undefined}}>
      {words.map((w, wi) => {
        if (!w.chars.length) return null;
        const at = CT(i, w.chars[0].k);
        const v = ease((f - at) / 9);
        const isHi = w.chars.some((c) => c.hi);
        return (
          <React.Fragment key={wi}>
            {wi > 0 ? ' ' : ''}
            <span style={{display: 'inline-block', whiteSpace: 'nowrap', opacity: v, transform: `translateY(${((1 - v) * 22).toFixed(1)}px)`, filter: v < 1 ? `blur(${(1 - v) * 12}px)` : undefined}}>
              {w.chars.map((c) => (
                <span key={c.k} style={{color: c.hi ? (isHi && i === 24 ? GOLD : F.redHot) : F.text, textShadow: c.hi ? `0 0 22px ${i === 24 ? 'rgba(242,196,109,0.6)' : 'rgba(255,90,70,0.55)'}, 0 3px 8px rgba(0,0,0,1)` : '0 3px 8px rgba(0,0,0,1), 0 2px 20px rgba(0,0,0,0.9)'}}>{c.c}</span>
              ))}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ===================== 1 一根线：时间轴 + 四处被砸断 ===================== */
const SP0 = 1560;
const SP1 = 600;
const nodeY = (k: number) => SP0 - ((SP0 - SP1) * (k + 0.5)) / 4;
const SPINE: [string, string][] = [
  ['Age 18', 'College'],
  ['Age 22', 'Graduate'],
  ['Age 25', 'Good job'],
  ['Age 30', 'Married'],
];
type Ev = {cue: number; word: string; slam: string; sx: number; fan: {a: number; len: number; label: string; bend?: number}[]};
const EVENTS: Ev[] = [
  {cue: 3, word: 'Rejected', slam: 'REJECTED', sx: cx, fan: [{a: -165, len: 300, label: 'Reapply', bend: 0.2}, {a: -132, len: 330, label: 'Trade school', bend: 0.15}, {a: -28, len: 300, label: 'Start working', bend: -0.18}, {a: 168, len: 250, label: 'Self-taught', bend: -0.2}]},
  {cue: 5, word: 'No', slam: 'NO OFFERS', sx: cx, fan: [{a: -160, len: 290, label: 'Grad school', bend: 0.18}, {a: -30, len: 300, label: 'Switch fields', bend: -0.16}, {a: 170, len: 260, label: 'Freelance', bend: -0.2}]},
  {cue: 6, word: 'Laid', slam: 'LAID OFF', sx: cx, fan: [{a: -152, len: 300, label: 'Own business', bend: 0.18}, {a: -32, len: 300, label: 'New city', bend: -0.16}, {a: 166, len: 250, label: 'Take a year off', bend: -0.2}]},
  {cue: 7, word: 'Still', slam: 'STILL SINGLE', sx: cx, fan: [{a: -168, len: 260, label: 'Live for you', bend: 0.2}, {a: -12, len: 250, label: 'Go far', bend: -0.18}]},
];
/** cú đóng dấu rơi đúng phách: phách đầu tiên ngay sau (hoặc trùng) lúc chữ hiện */
const onBeat = (fr0: number) => {
  for (const t of BEATS) { const b = Math.round(t * 30); if (b >= fr0 - 2) return b; }
  return fr0;
};
const evAt = (k: number) => (k === 3 ? HITS[0] : onBeat(WORD(EVENTS[k].cue, EVENTS[k].word)));

const SpineScene: React.FC<{f: number}> = ({f}) => {
  const at0 = V(0);
  // camera bám nút đang có chuyện: đi lên dần theo thân chỉ
  const pans = [0, ...EVENTS.map((_, k) => 0.55 * (1020 - nodeY(k)))];
  let pan = 0;
  for (let k = 0; k < EVENTS.length; k++) {
    const a = evAt(k) - 14;
    if (f >= a) pan = pans[k] + (pans[k + 1] - pans[k]) * drift(f, a, a + 26);
  }
  const zoom = 1 + 0.07 * drift(f, at0, HITS[0]);
  const A1 = V(8);
  const gapA = WORD(2, 'snaps');
  const gap = clamp01((f - gapA) / 8) * (1 - clamp01((f - (V(3) - 10)) / 16));
  return (
    <AbsoluteFill style={{transform: `translateY(${pan.toFixed(1)}px) scale(${zoom.toFixed(4)})`, transformOrigin: '50% 55%'}}>
      <Svg>
        {/* lưới mọc ra từ chính cái cây: lan dần ra ngoài, cây vẫn sáng ở giữa */}
        {f >= A1 - 8 ? (
          <g transform="translate(-700,-900)">
            <Web f={f} at={A1 - 6} w={W + 1400} h={H + 1800} center={[cx + 700, 1080 + 900]} step={165} spread={150} broken={0.05} seed={5} />
          </g>
        ) : null}
        {(() => {
          const a = V(9);
          const p: Pt = [cx + 230, 1180];
          return f >= a ? (
            <>
              <GrowLine f={f} at={a} dur={10} pts={[[p[0] - 70, p[1] + 30], [p[0] - 20, p[1] + 8]]} width={2.6} color={F.red} head={false} glowR={6} />
              <Fan f={f} at={a + 12} x={p[0]} y={p[1]} size={30} stagger={4} branches={[{a: -80, len: 170}, {a: -30, len: 200}, {a: 20, len: 160}]} />
            </>
          ) : null;
        })()}
        {/* thân chỉ, bị cắt một đoạn ở câu 2 */}
        <GrowLine f={f} at={at0} dur={50} pts={[[cx, SP0 + 60], [cx, SP1 - 60]]} width={2.6} head={false} />
        {gap > 0 ? (
          <g opacity={gap}>
            <rect x={cx - 8} y={nodeY(1) + 50} width={16} height={90 * gap} fill={F.bgWarm} />
            <circle cx={cx} cy={nodeY(1) + 50} r={22} fill="url(#fl-halo-red)" />
            <circle cx={cx} cy={nodeY(1) + 50 + 90 * gap} r={22} fill="url(#fl-halo-red)" />
            <circle cx={cx} cy={nodeY(1) + 50} r={3.5} fill={F.redHot} />
            <circle cx={cx} cy={nodeY(1) + 50 + 90 * gap} r={3.5} fill={F.redHot} />
          </g>
        ) : null}
        {SPINE.map(([side, label], k) => {
          const ev = evAt(k);
          const broke = f >= ev;
          return (
            <g key={k}>
              <Node f={f} at={at0 + 8 + k * 9} x={cx} y={nodeY(k)} side={side} size={40} hot={!broke && k === 0} red={broke} />
              <g opacity={broke ? 1 - 0.62 * clamp01((f - ev) / 10) : 1}>
                <Node f={f} at={at0 + 12 + k * 9} x={cx} y={nodeY(k)} r={0.01} label={label} size={40} />
              </g>
              {broke ? <GrowLine f={f} at={ev + 2} dur={8} pts={[[cx + 26, nodeY(k) + 2], [cx + 34 + label.length * 21, nodeY(k) + 2]]} width={3} color={F.red} head={false} glowR={5} /> : null}
              <Fan f={f} at={ev + 10} x={cx} y={nodeY(k)} size={32} stagger={5} branches={EVENTS[k].fan} />
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};


/* ===================== người que: 4 lát cắt đời thật dưới đáy khung ===================== */
const FLOOR = 1790;
const VS = 0.82;
const Vignettes: React.FC<{f: number}> = ({f}) => {
  const e0 = evAt(0), e1 = evAt(1), e2 = evAt(2), e3 = evAt(3);
  const s0 = V(3) - 8, s1 = V(5) - 6, s2 = V(6) - 4, s3 = V(7) - 4, end = V(8) + 14;
  if (f < s0 - 10 || f > end + 14) return null;
  const panelO = ease((f - s0 + 10) / 10) * (1 - ease((f - end) / 14));
  // mỗi lát: trượt vào từ phải, ra sang trái
  const slot = (a: number, b: number) => {
    const vin = ease((f - a) / 8);
    const vout = ease((f - b) / 8);
    return {o: vin * (1 - vout), dx: (1 - vin) * 140 - vout * 140, on: f >= a - 2 && f <= b + 10};
  };
  const jolt = (at: number) => (f >= at && f < at + 10 ? -18 * Math.sin(((f - at) / 10) * Math.PI) : 0);
  const sc0 = slot(s0, s1), sc1 = slot(s1, s2), sc2 = slot(s2, s3), sc3 = slot(s3, end);
  return (
    <AbsoluteFill style={{opacity: panelO}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,8,6,0) 62%, rgba(10,8,6,0.92) 70%, rgba(10,8,6,0.96) 100%)'}} />
      <Svg>
        <line x1={60} y1={FLOOR + 2} x2={W - 60} y2={FLOOR + 2} stroke={F.lineDim} strokeWidth={2} />
        {/* 18 · thư báo trượt */}
        {sc0.on ? (
          <g opacity={sc0.o} transform={`translate(${sc0.dx},0)`}>
            {/* hộp thư */}
            <g transform={`translate(760,${FLOOR})`} stroke={F.line} strokeWidth={5} fill="none">
              <line x1={0} y1={0} x2={0} y2={-150} />
              <path d="M-60,-150 L-60,-230 Q0,-280 60,-230 L60,-150 Z" fill="rgba(14,10,8,0.95)" />
              <line x1={60} y1={-226} x2={60 + 0} y2={-226} />
              <path d={`M60,-200 L60,-260 L96,-246 L60,-232`} fill={f < e0 ? F.red : 'none'} stroke={F.red} />
            </g>
            {(() => {
              const dropT = clamp01((f - e0 - 4) / 14);
              const holding = f < e0 + 4;
              return (
                <>
                  <Stick f={f} x={460} y={FLOOR} s={VS} bob={jolt(e0)} prop={holding ? 'paper' : undefined} pose={poseAt(f, [[s0, PO.look], [s0 + 12, PO.paper], [e0, PO.paper], [e0 + 8, PO.slump], [V(4) + 10, PO.slump], [V(4) + 34, PO.lookUp]], 9)} />
                  {!holding && dropT < 1.01 ? (
                    <g transform={`translate(${530 + dropT * 60},${FLOOR - 230 + 220 * dropT * dropT}) rotate(${-8 + dropT * 80})`}>
                      <rect x={-25} y={-32} width={50} height={64} rx={4} fill="rgba(246,243,234,0.9)" />
                    </g>
                  ) : null}
                </>
              );
            })()}
          </g>
        ) : null}
        {/* 22 · mũ tốt nghiệp, gửi CV, điện thoại im */}
        {sc1.on ? (
          <g opacity={sc1.o} transform={`translate(${sc1.dx},0)`}>
            {[0, 1, 2].map((k) => {
              const a = s1 + 6 + k * 7;
              const u = clamp01((f - a) / 26);
              if (u <= 0 || u >= 1) return null;
              const x = 470 + u * 520;
              const y = FLOOR - 300 - Math.sin(u * Math.PI) * 140 - k * 30;
              return <path key={k} d="M-26,0 L26,-10 L-10,12 Z M-10,12 L-4,0" transform={`translate(${x},${y}) rotate(${-14 + u * 20})`} fill="rgba(246,243,234,0.9)" stroke={F.line} strokeWidth={2} opacity={1 - u * 0.6} />;
            })}
            <Stick f={f} x={400} y={FLOOR} s={VS} cap bob={jolt(e1)} prop={f < e1 - 4 && f > s1 + 26 ? 'phone' : undefined} pose={poseAt(f, [[s1, PO.throw], [s1 + 8, PO.stand], [s1 + 12, PO.throw], [s1 + 18, PO.stand], [s1 + 26, PO.phone], [e1 - 2, PO.phone], [e1 + 6, PO.headHands]], 6)} />
            {f > s1 + 26 && f < e1 ? <text x={470} y={FLOOR - 340} fill={F.textDim} fontSize={34} style={{fontFamily: SUBFONT}}>0 new messages</text> : null}
          </g>
        ) : null}
        {/* 25 · văn phòng, bị mời ra cửa */}
        {sc2.on ? (
          <g opacity={sc2.o} transform={`translate(${sc2.dx},0)`}>
            <g stroke={F.line} strokeWidth={5} fill="none">
              <rect x={560} y={FLOOR - 170} width={240} height={14} fill="rgba(14,10,8,0.95)" />
              <line x1={580} y1={FLOOR - 156} x2={580} y2={FLOOR} />
              <line x1={780} y1={FLOOR - 156} x2={780} y2={FLOOR} />
              <rect x={620} y={FLOOR - 290} width={130} height={90} rx={6} fill="rgba(14,10,8,0.95)" />
              <line x1={685} y1={FLOOR - 200} x2={685} y2={FLOOR - 170} />
              <rect x={90} y={FLOOR - 400} width={150} height={400} fill="rgba(14,10,8,0.6)" />
              <text x={165} y={FLOOR - 410} textAnchor="middle" fill={F.textDim} stroke="none" fontSize={30} style={{fontFamily: SUBFONT}}>EXIT</text>
            </g>
            <Stick f={f} x={900} y={FLOOR} s={VS} flip seed={3} color={F.textDim} pose={poseAt(f, [[s2, PO.stand], [e2 - 6, PO.stand], [e2, PO.point]], 6)} />
            {(() => {
              const w = clamp01((f - e2 - 6) / 40);
              const x = 520 - w * 260;
              const moving = f > e2 + 6 && w < 1;
              return <Stick f={f} x={x} y={FLOOR} s={VS} flip={f > e2 + 4} bob={jolt(e2)} prop={f > e2 + 2 ? 'box' : undefined} pose={moving ? walk((f - e2) / 16, PO.carry, false) : poseAt(f, [[s2, PO.stand], [e2 - 2, PO.look], [e2 + 4, PO.carry]], 6)} />;
            })()}
          </g>
        ) : null}
        {/* 30 · đám cưới bạn bè, mình đứng một góc */}
        {sc3.on ? (
          <g opacity={sc3.o} transform={`translate(${sc3.dx},0)`}>
            <Stick f={f} x={700} y={FLOOR} s={VS} seed={1} color={F.textDim} pose={{...STAND, armR: [[28, -222], [56, -170]]}} />
            <Stick f={f} x={800} y={FLOOR} s={VS} seed={2} flip color={F.textDim} pose={{...STAND, armR: [[28, -222], [56, -170]]}} />
            <path d="M750,1430 c-20,-30 -60,-10 -40,20 l40,36 l40,-36 c20,-30 -20,-50 -40,-20 Z" fill={F.red} opacity={0.8 + 0.2 * Math.sin(f * 0.3)} />
            {Array.from({length: 10}, (_, k) => {
              const y = ((f * 3 + k * 70) % 560) + 1180;
              return <rect key={k} x={620 + rand(k) * 260} y={y} width={8} height={14} fill={k % 2 ? GOLD : F.line} opacity={0.6} transform={`rotate(${f * 4 + k * 40} ${620 + rand(k) * 260} ${y})`} />;
            })}
            <Stick f={f} x={330} y={FLOOR} s={VS} prop="cup" bob={jolt(e3)} pose={poseAt(f, [[s3, PO.hold], [e3 - 2, SH_LOOK], [e3 + 8, PO.down]], 6)} />
          </g>
        ) : null}
      </Svg>
      {[e0, e1, e2, e3].map((at, k) => (
        <Stamp key={k} f={f} at={at} text={EVENTS[k].slam} x={cx} y={k === 3 ? 1290 : 1400} size={k === 3 ? 124 : 100} out={k === 3 ? V(8) + 6 : [e1, e2, e3][k] - 4} rot={k % 2 ? 3 : -3} />
      ))}
    </AbsoluteFill>
  );
};
const SH_LOOK = {...PO.hold, head: [14, -322] as [number, number]};

/* ===================== sợi chỉ thẳng cong lại thành vòng đồng hồ ===================== */
const RING_C: Pt = [cx, 1000];
const RING_R = 300;
const LINE_B = 1460;
const LINE_T = 540;
const SpineToRing: React.FC<{f: number; at: number; morphAt: number; ringAt: number}> = ({f, at, morphAt, ringAt}) => {
  const m = ease((f - morphAt) / 26);
  const P = (s: number): Pt => {
    const L: Pt = [cx, LINE_B - (LINE_B - LINE_T) * s];
    const th = Math.PI + s * Math.PI * 2; // bắt đầu ở đáy vòng, đi theo chiều kim đồng hồ
    const C: Pt = [RING_C[0] + Math.sin(th) * RING_R, RING_C[1] - Math.cos(th) * RING_R];
    // cuộn: điểm xa gốc cong muộn hơn một chút → như sợi chỉ uốn dần
    const k = clamp01(m * 1.25 - s * 0.25);
    const kk = k * k * (3 - 2 * k);
    return [L[0] + (C[0] - L[0]) * kk, L[1] + (C[1] - L[1]) * kk];
  };
  const pts = Array.from({length: 121}, (_, i) => P(i / 120));
  const fadeOut = clamp01((f - ringAt - 26) / 14);
  const marks: [number, string][] = [[0.1, '18 · College'], [0.32, '22 · Graduate'], [0.55, '25 · Good job'], [0.78, '30 · Married']];
  return (
    <g>
      <g opacity={1 - fadeOut}>
        <GrowLine f={f} at={at} dur={30} pts={pts} width={2.6} head={m < 0.02} />
      </g>
      {marks.map(([s, label], k) => {
        const p = P(s);
        const v = ease((f - at - 14 - k * 6) / 12);
        if (v <= 0) return null;
        const dx = p[0] - RING_C[0];
        const dy = p[1] - RING_C[1];
        const d = Math.hypot(dx, dy) || 1;
        // nhãn: lúc thẳng nằm bên phải; khi thành vòng thì đẩy ra ngoài vòng
        const lx = p[0] + (1 - m) * 26 + m * (dx / d) * 44;
        const ly = p[1] + m * (dy / d) * 44;
        const anchor = m > 0.5 ? (dx < -40 ? 'end' : dx > 40 ? 'start' : 'middle') : 'start';
        return (
          <g key={k} opacity={v}>
            <circle cx={p[0]} cy={p[1]} r={16} fill="url(#fl-halo)" />
            <circle cx={p[0]} cy={p[1]} r={5} fill={F.text} />
            <text x={lx} y={ly + 11} textAnchor={anchor} style={{fontFamily: SUBFONT}} fontSize={30} fill={F.textDim}>{label}</text>
          </g>
        );
      })}
    </g>
  );
};

/* ===================== sợi dây sờn ===================== */
const ROPE_A: Pt = [120, 1520];
const ROPE_B: Pt = [960, 640];
const ropePt = (t: number, off = 0): Pt => {
  const dx = ROPE_B[0] - ROPE_A[0];
  const dy = ROPE_B[1] - ROPE_A[1];
  const L = Math.hypot(dx, dy);
  return [ROPE_A[0] + dx * t + (-dy / L) * off, ROPE_A[1] + dy * t + (dx / L) * off];
};
const FRAYS = [
  {t: 0.2, text: 'Failed the driving test', side: 1},
  {t: 0.4, text: 'Lost some money', side: -1},
  {t: 0.6, text: 'Got stood up', side: 1},
  {t: 0.8, text: 'Fight with the boss', side: -1},
];
const Rope: React.FC<{f: number; at: number; flash: number}> = ({f, at, flash}) => {
  const strands = [0, 1, 2].map((s) => Array.from({length: 120}, (_, i) => ropePt(i / 119, 7 * Math.sin((i / 119) * 50 + (s * Math.PI * 2) / 3))));
  const col = flash > 0 ? `rgba(255,${Math.round(234 + 10 * flash)},${Math.round(216 - 60 * flash)},1)` : F.line;
  return (
    <g>
      {strands.map((p, s) => (
        <GrowLine key={s} f={f} at={at + s * 3} dur={40} pts={p} width={2 + flash * 2} color={col} head={s === 0} glowR={4 + flash * 16} />
      ))}
      {FRAYS.map((fr, k) => {
        const a = at + 46 + k * 16;
        const v = ease((f - a) / 10);
        if (v <= 0) return null;
        const base = ropePt(fr.t);
        return (
          <g key={k} opacity={v * (1 - 0.5 * flash)}>
            {Array.from({length: 7}, (_, j) => {
              const ang = (rand(k * 10 + j) - 0.5) * 1.6 + (fr.side > 0 ? -2.4 : 0.7);
              const len = (12 + rand(k * 7 + j) * 26) * v;
              const s0 = ropePt(fr.t + (rand(j + k) - 0.5) * 0.04);
              return <line key={j} x1={s0[0]} y1={s0[1]} x2={s0[0] + Math.cos(ang) * len} y2={s0[1] + Math.sin(ang) * len} stroke={F.lineDim} strokeWidth={1.1} />;
            })}
            <circle cx={base[0]} cy={base[1]} r={26} fill="url(#fl-halo-red)" opacity={0.6} />
          </g>
        );
      })}
    </g>
  );
};

/* ===================== 主组件 ===================== */
export const Ep68enNet: React.FC = () => {
  const f = useCurrentFrame();
  const bp = bassAt(f);
  // 2 cú drop: giật nhẹ + lóe + rung ngắn; trước drop ~20 khung tối dần
  let punch = 0;
  let flash = 0;
  let shake = 0;
  let dark = 0;
  for (const h of HITS) {
    if (f >= h && f < h + 40) {
      const k = Math.exp(-(f - h) / 6);
      punch = Math.max(punch, k);
      flash = Math.max(flash, Math.exp(-(f - h) / 4));
      shake = Math.max(shake, k);
    }
    if (f >= h - 22 && f < h) dark = Math.max(dark, 0.55 * ease((f - (h - 22)) / 20));
  }
  // 3 cú đóng dấu trước drop: nảy + rung ngắn, nhẹ hơn drop
  for (let k = 0; k < 3; k++) {
    const h = evAt(k);
    if (f >= h && f < h + 20) {
      const kk = Math.exp(-(f - h) / 4);
      punch = Math.max(punch, 0.45 * kk);
      shake = Math.max(shake, 0.55 * kk);
      flash = Math.max(flash, 0.35 * Math.exp(-(f - h) / 3));
    }
  }
  const sx = shake * 14 * Math.sin(f * 2.3);
  const sy = shake * 10 * Math.cos(f * 3.1);
  const sc = 1 + 0.06 * punch + 0.006 * bp;

  // các mốc đoạn
  const A1 = V(8);
  const B1 = V(10);
  const C1 = V(13);
  const D1 = V(16);
  const E1 = V(21);
  const F1 = V(23);
  const G1 = V(25);
  const H1 = V(27);
  const I1 = V(28);

  return (
    <AbsoluteFill style={{background: F.bgWarm, fontFamily: FF.cn, ...vietFont}}>
      <FilBg f={f} w={W} h={H} tone="warm" glow={[50, 50]} strength={1 + 0.4 * bp + 0.6 * flash} />
      <AbsoluteFill style={{transform: `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) scale(${sc.toFixed(4)})`}}>
        {/* ---------- 1 一根线 + 断 ---------- */}
        <Seg f={f} from={0} to={B1 - 10} fade={16}>
          <AbsoluteFill style={{transform: `scale(${(1 - 0.5 * drift(f, A1 + 10, B1 + 6)).toFixed(4)})`, transformOrigin: '50% 52%'}}>
            <SpineScene f={f} />
          </AbsoluteFill>
        </Seg>
        <Vignettes f={f} />

        {/* ---------- 3 收成一点 → 社会时钟 ---------- */}
        <Seg f={f} from={B1 - 4} to={C1 - 4} fade={12}>
          <AbsoluteFill style={{transform: `scale(${(1 + 0.05 * drift(f, B1, C1)).toFixed(4)})`, transformOrigin: '50% 52%'}}>
            <Svg>
              <SpineToRing f={f} at={B1 - 2} morphAt={V(11) - 22} ringAt={V(11) + 4} />
              {f >= V(11) + 4 ? (
                (() => {
                  const a = V(11) + 4;
                  const c0 = WORD(12, 'keeps');
                  const val = f < c0 ? countTo(f, a + 18, 40, 0, 23.5, 1) : countTo(f, c0, 46, 23.5, 30.8, 1);
                  return <Ring f={f} at={a} x={cx} y={1000} r={300} value={fmt(val)} title="Median age at first marriage" sub={f < c0 + 20 ? 'U.S. men · 1975' : '2025 · and still rising'} mark={f < c0 ? 0.36 : 0.36 + 0.08 * ease((f - c0) / 46)} markLabel="Where are you?" />;
                })()
              ) : null}
            </Svg>
            <Svg>
              {(() => {
                const a = V(11) + 4;
                if (f < B1 + 6) return null;
                const o = ease((f - B1 - 6) / 12);
                const c0 = WORD(12, 'keeps');
                const running = f >= a;
                const x = running ? cx - 20 + 12 * Math.sin(f * 0.05) : cx + 160;
                return (
                  <g opacity={o}>
                    {running ? Array.from({length: 4}, (_, k) => <line key={k} x1={x - 150 - ((f * 9 + k * 50) % 160)} y1={1500 - k * 40} x2={x - 110 - ((f * 9 + k * 50) % 160)} y2={1500 - k * 40} stroke={F.lineDim} strokeWidth={3} />) : null}
                    <line x1={cx - 180} y1={1622} x2={cx + 180} y2={1622} stroke={F.lineDim} strokeWidth={3} />
                    <Stick f={f} x={x} y={1620} s={0.62} pose={running ? (f > c0 + 50 ? walk(f / 22) : run(f / (f > c0 ? 12 : 16))) : PO.lookUp} flip={!running} />
                  </g>
                );
              })()}
            </Svg>
            <Footnote f={f} at={V(11) + 40} text="U.S. Census Bureau · Table MS-2" w={W} h={H} />
          </AbsoluteFill>
        </Seg>

        {/* ---------- 4 别人的一根线 → 69% → 没走的路 ---------- */}
        <Seg f={f} from={C1 - 4} to={V(15) - 4} fade={12}>
          <AbsoluteFill style={{transform: `translateY(${(60 * drift(f, C1, V(15))).toFixed(1)}px) scale(${(1 + 0.04 * drift(f, C1, V(15))).toFixed(4)})`}}>
            <Svg>
              <g opacity={1 - 0.75 * clamp01((f - V(14)) / 14)}>
                <GrowLine f={f} at={C1} dur={34} pts={[[cx, 1620], [cx, 560]]} width={3} />
                <Node f={f} at={C1 + 30} x={cx} y={1620} label="Someone else" labelAt="bottom" size={36} />
                {/* những nhánh đứt bị giấu đi: hiện rất mờ */}
                {Array.from({length: 9}, (_, k) => {
                  const y = 1500 - k * 105;
                  const dir = k % 2 ? 1 : -1;
                  const end: Pt = [cx + dir * (120 + rand(k + 2) * 120), y - 60 - rand(k) * 60];
                  return (
                    <g key={k} opacity={0.45}>
                      <GrowLine f={f} at={C1 + 70 + k * 4} dur={16} pts={arc([cx, y], end, 0.2 * dir)} width={1.1} color={F.lineDim} head={false} glowR={1} />
                      {f > C1 + 86 + k * 4 ? <circle cx={end[0]} cy={end[1]} r={3} fill={F.redHot} opacity={0.8} /> : null}
                    </g>
                  );
                })}
              </g>
              {/* đường nghề nghiệp bị chuyện tình cờ bẻ hướng */}
              {(() => {
                const a = V(14) + 10;
                const pts: Pt[] = [...curve([cx - 300, 1560], [cx - 260, 1300], [cx - 120, 1200], 20), ...curve([cx - 120, 1200], [cx + 20, 1120], [cx + 160, 1180], 20), ...curve([cx + 160, 1180], [cx + 300, 1240], [cx + 230, 960], 20)];
                return (
                  <>
                    <GrowLine f={f} at={a} dur={50} pts={pts} width={2.6} color={F.line} />
                    {[pts[20], pts[40]].map((p, k) => (
                      <Node key={k} f={f} at={a + 18 + k * 16} x={p[0]} y={p[1]} red r={6} label={k ? 'an offer' : 'a chance meeting'} size={30} labelAt={k ? 'right' : 'left'} />
                    ))}
                  </>
                );
              })()}
            </Svg>
            <Svg>
              <g opacity={ease((f - C1 - 20) / 14)}>
                <Stick f={f} x={230} y={1760} s={0.6} bob={f > V(14) + 40 && f < V(14) + 60 ? 6 * Math.sin((f - V(14) - 40) * 0.6) : 0} pose={poseAt(f, [[C1, PO.look], [C1 + 40, PO.lookUp], [V(14), PO.lookUp], [V(14) + 30, PO.look]], 12)} />
              </g>
            </Svg>
            <BigNumber f={f} at={V(14)} value={`${fmt(countTo(f, V(14), 40, 0, 69.1, 1))}%`} label="of young people" sub="N = 772" x={cx} y={560} size={190} color={F.text} />
            <Footnote f={f} at={V(14) + 30} text="Bright, Pryor & Harpham · 2005 · Journal of Vocational Behavior" w={W} h={H} />
          </AbsoluteFill>
        </Seg>

        <Seg f={f} from={V(15) - 4} to={D1 - 2} fade={12}>
          <AbsoluteFill style={{transform: `scale(${(1 + 0.04 * drift(f, V(15), D1)).toFixed(4)})`, transformOrigin: '50% 60%'}}>
            <Svg>
              {(() => {
                const a = V(15);
                const fork: Pt = [cx, 1180];
                const dimR = 1 - 0.75 * clamp01((f - WORD(15, 'romanticize') - 30) / 30);
                return (
                  <>
                    <GrowLine f={f} at={a} dur={24} pts={[[cx, 1640], fork]} width={2.6} head={false} />
                    <GrowLine f={f} at={a + 20} dur={30} pts={arc(fork, [cx - 260, 720], 0.12)} width={2.2} color={F.lineDim} />
                    <g opacity={dimR}>
                      <GrowLine f={f} at={a + 22} dur={30} pts={arc(fork, [cx + 260, 720], -0.12)} width={3.2} color={GOLD} glowR={18} />
                    </g>
                    <Node f={f} at={a + 46} x={cx - 260} y={720} label="Road taken" labelAt="top" size={34} r={4} />
                    <g opacity={0.35 + 0.65 * dimR}>
                      <Node f={f} at={a + 50} x={cx + 260} y={720} label="Road not taken" labelAt="top" size={34} hot={dimR > 0.6} />
                    </g>
                    {(() => {
                      const turn = WORD(15, 'romanticize') + 30;
                      const w = clamp01((f - turn - 8) / 30);
                      return (
                        <g opacity={ease((f - a - 6) / 12)}>
                          <Stick f={f} x={cx - 50 - w * 120} y={1780} s={0.6} flip={f > turn} pose={w > 0 && w < 1 ? walk((f - turn) / 16) : poseAt(f, [[a, PO.lookUp], [turn - 20, PO.lookUp], [turn, PO.look]], 12)} />
                        </g>
                      );
                    })()}
                  </>
                );
              })()}
            </Svg>
          </AbsoluteFill>
        </Seg>

        {/* ---------- 5 全部断掉 → 只剩你 → 从你长出 ---------- */}
        <Seg f={f} from={D1 - 2} to={E1 - 4} fade={12}>
          {(() => {
            const cut = WORD(16, 'breaks');
            const pull = drift(f, V(19), E1);
            return (
              <AbsoluteFill style={{transform: `scale(${(1.04 - 0.12 * pull).toFixed(4)})`, transformOrigin: '50% 52%'}}>
                <Svg>
                  <g opacity={1 - clamp01((f - cut - 6) / 34)}>
                    <Web f={f} at={D1 - 30} w={W} h={H} center={[cx, 1000]} step={160} spread={26} seed={9} />
                    <g opacity={f >= cut ? 0.5 + 0.5 * Math.sin((f - cut) * 1.7) : 0}>
                      <Web f={f} at={D1 - 30} w={W} h={H} center={[cx, 1000]} step={160} spread={26} seed={9} broken={0.55} color="rgba(0,0,0,0)" />
                    </g>
                  </g>
                  <Node f={f} at={V(17)} x={cx} y={1000} hot />
                  {(() => {
                    const cutF = WORD(16, 'breaks');
                    const look = Math.sin((f - D1) * 0.12) > 0;
                    return (
                      <g opacity={ease((f - D1 + 2) / 12)}>
                        <Stick f={f} x={cx - 20} y={1110} s={0.5} flip={f < cutF && look} pose={poseAt(f, [[D1, PO.look], [cutF, PO.look], [cutF + 8, PO.headHands], [V(17) - 6, PO.headHands], [V(17) + 6, PO.huddle], [V(18) + 10, PO.huddle], [V(18) + 34, PO.stand], [V(19) - 2, PO.stand], [V(19) + 8, PO.stretch]], 9)} />
                      </g>
                    );
                  })()}
                  {f >= V(18) ? <circle cx={cx} cy={1000} r={40 + 120 * ease((f - V(18)) / 50)} fill="none" stroke={F.lineDim} strokeWidth={1.5} opacity={1 - clamp01((f - V(18)) / 50)} /> : null}
                  {(() => {
                    const a = V(19);
                    const labels = ['Back to school', 'New career', 'Move home', 'Move to the city', 'A small shop', 'Any job for now', 'Learn a skill', 'Rest'];
                    const angs = [-90, -45, 0, 45, 90, 135, 180, -135];
                    const br = angs.map((a2, k) => ({a: a2 + (rand(k) - 0.5) * 12, len: 290 + rand(k + 4) * 70, label: labels[k], bend: (rand(k + 7) - 0.5) * 0.4}));
                    return (
                      <>
                        <Fan f={f} at={a} x={cx} y={1000} size={32} stagger={4} branches={br} />
                        {br.map((b, k) => {
                          const rad = (b.a * Math.PI) / 180;
                          const ex = cx + Math.cos(rad) * b.len;
                          const ey = 1000 + Math.sin(rad) * b.len;
                          return <Fan key={k} f={f} at={V(20) + k * 3} x={ex} y={ey} stagger={3} width={1.1} branches={[{a: b.a - 35, len: 140 + rand(k) * 60}, {a: b.a + 30, len: 120 + rand(k + 1) * 70}, {a: b.a + 2, len: 170}]} />;
                        })}
                      </>
                    );
                  })()}
                </Svg>
              </AbsoluteFill>
            );
          })()}
        </Seg>

        {/* ---------- 6 70% 点阵 ---------- */}
        <Seg f={f} from={E1 - 4} to={F1 - 4} fade={12}>
          <AbsoluteFill style={{transform: `scale(${(1 + 0.04 * drift(f, E1, F1)).toFixed(4)})`, transformOrigin: '50% 55%'}}>
            <Svg>
              {Array.from({length: 100}, (_, k) => {
                const i = k % 10;
                const j = Math.floor(k / 10);
                const x = cx - 279 + i * 62;
                const y = 760 + j * 62;
                const at = E1 + 4 + k * 0.5;
                const v = ease((f - at) / 10);
                if (v <= 0) return null;
                const order = rand(k * 3.7 + 11);
                const red = order < 0.704;
                const redOn = red ? ease((f - (E1 + 50 + order * 40)) / 10) : 0;
                const keep = order < 0.039;
                const heal = red && !keep ? ease((f - (V(22) + 10 + order * 60)) / 14) : 0;
                const rc = redOn * (1 - heal);
                const fill = rc > 0 ? `rgba(${Math.round(242 + 13 * rc)},${Math.round(234 - 140 * rc)},${Math.round(216 - 150 * rc)},1)` : heal > 0 ? GOLD : F.line;
                return (
                  <g key={k} opacity={v}>
                    <circle cx={x} cy={y} r={20} fill={rc > 0.5 ? 'url(#fl-halo-red)' : 'url(#fl-halo)'} opacity={0.35 + 0.4 * Math.max(rc, heal)} />
                    <circle cx={x} cy={y} r={7 + 2 * heal} fill={fill} />
                  </g>
                );
              })}
            </Svg>
          </AbsoluteFill>
        </Seg>

        {/* ---------- 7 磨损的绳：drop 2 ---------- */}
        <Seg f={f} from={F1 - 4} to={G1 - 4} fade={12}>
          <AbsoluteFill style={{transform: `translate(${(-30 * drift(f, F1, G1)).toFixed(1)}px, ${(20 * drift(f, F1, G1)).toFixed(1)}px) scale(${(1.02 + 0.05 * drift(f, F1, G1)).toFixed(4)})`}}>
            <Svg>
              <Rope f={f} at={F1} flash={f >= HITS[1] ? Math.exp(-(f - HITS[1]) / 18) : 0} />
              {(() => {
                const a = F1 + 30;
                const u = clamp01((f - a) / Math.max(1, HITS[1] - a - 6));
                const p = ropePt(0.06 + 0.7 * u);
                const wob = FRAYS.reduce((acc, fr, k) => { const t0 = F1 + 50 + k * 16; return acc + (f >= t0 && f < t0 + 12 ? Math.sin(((f - t0) / 12) * Math.PI) : 0); }, 0);
                const done = f >= HITS[1] - 4;
                return (
                  <g opacity={ease((f - a + 10) / 10)}>
                    <Stick f={f} x={p[0]} y={p[1] + 4} s={0.6} rot={wob * 10 * Math.sin(f * 0.9)} bob={wob * -6} pose={done ? poseAt(f, [[HITS[1] - 4, PO.balance], [HITS[1] + 8, PO.stretch]], 8) : walk((f - a) / 22, PO.balance, false)} />
                  </g>
                );
              })()}
            </Svg>
            {FRAYS.map((fr, k) => {
              const p = ropePt(fr.t, fr.side * 120);
              return <Label key={k} f={f} at={F1 + 50 + k * 16} x={p[0]} y={p[1]} text={fr.text} size={36} color={F.redHot} out={HITS[1] + 20} font={SUBFONT} />;
            })}
            <Stamp f={f} at={HITS[1]} text="NEVER BROKE" x={cx} y={760} size={104} color={GOLD} rot={-3} out={G1 - 14} />
          </AbsoluteFill>
        </Seg>

        {/* ---------- 8 U 形曲线 ---------- */}
        <Seg f={f} from={G1 - 4} to={H1 - 4} fade={12}>
          <AbsoluteFill style={{transform: `scale(${(1 + 0.04 * drift(f, G1, H1)).toFixed(4)})`, transformOrigin: '50% 60%'}}>
            <Svg>
              {(() => {
                const a = G1;
                const x0 = 170;
                const x1 = 910;
                const y0 = 680;
                const y1 = 1320;
                const u = [...curve([x0 + 40, y0 + 70], [x0 + 150, y1 - 40], [cx, y1 - 60], 30), ...curve([cx, y1 - 60], [x1 - 150, y1 - 40], [x1 - 40, y0 + 90], 30)];
                const dotT = ease((f - a - 40) / 40);
                const dp = u[Math.round(dotT * 30)];
                return (
                  <>
                    <GrowLine f={f} at={a} dur={16} pts={[[x0, y0 - 40], [x0, y1]]} width={1.4} color={F.lineDim} head={false} />
                    <GrowLine f={f} at={a + 4} dur={16} pts={[[x0, y1], [x1 + 30, y1]]} width={1.4} color={F.lineDim} head={false} />
                    <GrowLine f={f} at={a + 10} dur={36} pts={u} width={3} color={F.line} />
                    {f > a + 40 ? (
                      <>
                        <circle cx={dp[0]} cy={dp[1] - 50} r={60} fill="url(#fl-halo)" />
                        <Stick f={f} x={dp[0]} y={dp[1]} s={0.32} color={GOLD} pose={dotT < 1 ? walk((f - a) / 14) : PO.stretch} />
                      </>
                    ) : null}
                  </>
                );
              })()}
            </Svg>
            <Label f={f} at={G1 + 8} x={170} y={640} text="How much it hurts" size={30} color={F.textDim} align="left" />
            <Label f={f} at={G1 + 20} x={220} y={1370} text="Never stumbled" size={30} color={F.textDim} />
            <Label f={f} at={G1 + 26} x={cx} y={1370} text="A few times" size={34} color={GOLD} />
            <Label f={f} at={G1 + 32} x={860} y={1370} text="A lot" size={30} color={F.textDim} />
            <Footnote f={f} at={G1 + 30} text="Seery, Holman & Silver · 2010 · 2,398 people, followed for years" w={W} h={H} />
          </AbsoluteFill>
        </Seg>

        {/* ---------- 9 打结修补 ---------- */}
        <Seg f={f} from={H1 - 4} to={I1 + 4} fade={10}>
          <AbsoluteFill style={{transform: `scale(${(1 + 0.06 * drift(f, H1, I1)).toFixed(4)})`, transformOrigin: '50% 52%'}}>
            <Svg>
              {(() => {
                const a = H1;
                const k0 = 1000;
                const g = ease((f - a - 24) / 20);
                return (
                  <>
                    <GrowLine f={f} at={a} dur={20} pts={[[cx, 560], [cx, k0 - 18]]} width={2.6 + g * 1.4} head={false} />
                    <GrowLine f={f} at={a + 4} dur={20} pts={[[cx, 1500], [cx, k0 + 18]]} width={2.6 + g * 1.4} head={false} />
                    {[0, 1, 2].map((r) => (
                      <GrowLine key={r} f={f} at={a + 14 + r * 4} dur={14} pts={Array.from({length: 40}, (_, i) => [cx + Math.cos((i / 39) * Math.PI * 2) * (16 + r * 2), k0 - 14 + r * 14 + Math.sin((i / 39) * Math.PI * 2) * 7] as Pt)} width={2.2} color={GOLD} head={false} glowR={8 + g * 10} />
                    ))}
                    <circle cx={cx} cy={k0} r={30 + 50 * g} fill="url(#fl-halo)" opacity={0.6 + 0.4 * g} />
                    <g opacity={ease((f - a) / 10)}>
                      <Stick f={f} x={cx + 150} y={k0 + 190} s={0.62} flip pose={poseAt(f, [[a, PO.stand], [a + 12, PO.reach], [a + 24, PO.reach], [a + 32, PO.tug], [a + 40, PO.reach], [a + 48, PO.tug], [I1, PO.look]], 7)} />
                    </g>
                  </>
                );
              })()}
            </Svg>
          </AbsoluteFill>
        </Seg>

        {/* ---------- 10 网铺满 → 收成一点 ---------- */}
        <Seg f={f} from={I1 - 4} to={DURATION} fade={10} style={collapse(f, V(30) - 20, 22, [50, 52])}>
          <AbsoluteFill style={{transform: `scale(${(1.08 - 0.12 * drift(f, I1, V(30))).toFixed(4)})`, transformOrigin: '50% 52%'}}>
            <Svg>
              <Web f={f} at={I1} w={W} h={H} center={[cx, 1000]} step={140} spread={70} seed={12} />
              {(() => {
                const stop = V(30) - 30;
                const u = clamp01((f - I1 - 6) / Math.max(1, stop - I1 - 6));
                const x = 180 + (cx - 180) * u;
                return (
                  <g opacity={ease((f - I1 - 4) / 12)}>
                    <circle cx={x} cy={1280} r={110} fill="url(#fl-halo)" opacity={0.5} />
                    <Stick f={f} x={x} y={1380} s={0.6} pose={u < 1 ? walk((f - I1) / 18) : PO.look} />
                  </g>
                );
              })()}
              {(() => {
                const a = WORD(29, 'one');
                const v = 1 - clamp01((f - a - 10) / 30);
                return f >= a ? <GrowLine f={f} at={a} dur={8} pts={[[cx + 80, 1060], [cx + 170, 1120]]} width={2.4} color={F.red} head={false} glowR={6} opacity={v} /> : null;
              })()}
            </Svg>
          </AbsoluteFill>
        </Seg>
        {f >= V(30) ? (
          <Svg>
            <Node f={f} at={V(30)} x={cx} y={1080} hot />
          </Svg>
        ) : null}
      </AbsoluteFill>

      {dark > 0 ? <AbsoluteFill style={{background: '#000', opacity: dark}} /> : null}
      {flash > 0.01 ? <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,226,180,1) 0%, rgba(255,190,120,0) 70%)', mixBlendMode: 'screen', opacity: 0.7 * flash}} /> : null}
      <Subs f={f} />
      <FilGrain opacity={0.07} />
      {/* fade đen cuối */}
      <AbsoluteFill style={{background: '#000', opacity: clamp01((f - (DURATION - 30)) / 28)}} />

      {/* ---------- 声音 ---------- */}
      <Audio src={staticFile(((getInputProps() as {bgm?: string}).bgm) || 'audio/ep59-tam-luoi/bgm.wav')} volume={0.75} />
      {(() => {
        const list: [string, number, number][] = [];
        const add = (n: string, at: number, v: number) => { if (at >= 0 && at < DURATION) list.push([n, Math.round(at), v]); };
        // drop
        for (const h of HITS) { add('riser', h - 27, 0.45); add('impact', h, 0.95); }
        add('suck', HITS[0] - 20, 0.35);
        // một sợi chỉ: chuông nhỏ từng nút
        for (let k = 0; k < 4; k++) add('ping', V(0) + 8 + k * 9, 0.22);
        add('snap', WORD(2, 'snaps'), 0.55);
        // ba cú đứt trước drop
        for (let k = 0; k < 3; k++) { add('dropin', evAt(k) - 7, 0.5); add('stamp', evAt(k), 1); add('snap', evAt(k) + 1, 0.3); add('shimmer', evAt(k) + 12, 0.2); }
        add('dropin', HITS[0] - 7, 0.5); add('stamp', HITS[0], 0.8);
        add('dropin', HITS[1] - 7, 0.5); add('stamp', HITS[1], 0.8);
        add('shimmer', HITS[0] + 10, 0.3);
        // lưới
        add('shimmer', V(8), 0.4);
        add('snap', V(9), 0.4);
        add('shimmer', V(9) + 12, 0.25);
        add('whoosh', B1 - 24, 0.25);
        for (let k = 0; k < 4; k++) add('ping', B1 + 12 + k * 6, 0.2);
        add('curl', V(11) - 22, 0.55);
        // đồng hồ xã hội
        for (let k = V(11) + 22; k < V(11) + 58; k += 3) add('count', k, 0.22);
        add('ding', V(11) + 62, 0.35);
        { const c0 = WORD(12, 'keeps'); for (let k = c0; k < c0 + 46; k += 3) add('count', k, 0.2); add('ding', c0 + 46, 0.3); }
        // người khác / 69% / ngã ba
        add('whoosh', C1 - 8, 0.35);
        add('ping', C1 + 30, 0.25);
        for (let k = V(14); k < V(14) + 40; k += 3) add('count', k, 0.22);
        add('ding', V(14) + 40, 0.35);
        add('ping', V(14) + 28, 0.22);
        add('ping', V(14) + 44, 0.22);
        add('shimmer', V(15) + 22, 0.3);
        // tất cả đứt → còn bạn → mọc lại
        { const cut = WORD(16, 'breaks'); for (let k = 0; k < 5; k++) add('snap', cut + k * 5, 0.45 - k * 0.05); }
        add('ping', V(17), 0.35);
        add('heart', V(18), 0.5);
        add('heart', V(18) + 26, 0.35);
        add('shimmer', V(19), 0.5);
        for (let k = 0; k < 8; k += 2) add('ping', V(19) + 14 + k * 4, 0.16);
        add('shimmer', V(20), 0.35);
        // điểm 70%
        for (let k = E1 + 4; k < E1 + 54; k += 3) add('pop', k, 0.14);
        for (let k = E1 + 40; k < E1 + 80; k += 3) add('count', k, 0.2);
        add('ding', E1 + 80, 0.35);
        add('heal', V(22) + 8, 0.5);
        // sợi dây sờn
        add('whoosh', F1 - 8, 0.35);
        for (let k = 0; k < 4; k++) add('thud', F1 + 50 + k * 16, 0.28);
        // U, nút vá, lưới cuối
        add('whoosh', G1 - 6, 0.3);
        add('ping', G1 + 80, 0.3);
        add('heal', H1 + 22, 0.55);
        add('shimmer', I1, 0.5);
        add('snap', WORD(29, 'one'), 0.35);
        add('suck', V(30) - 20, 0.45);
        add('ping', V(30) + 2, 0.4);
        return list.map(([n, at, v], i) => (
          <Sequence key={`sfx${i}`} from={at} durationInFrames={100}>
            <Audio src={staticFile(`audio/ep59-tam-luoi/sfx/${n}.wav`)} volume={v} />
          </Sequence>
        ));
      })()}
    </AbsoluteFill>
  );
};
