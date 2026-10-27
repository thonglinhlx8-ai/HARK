import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile, useCurrentFrame, getInputProps} from 'remotion';
import {clamp01, rand} from '../../library/anim';
import {arc, curve, Fan, FilDefs, GrowLine, Node, Pt, Ring, Web} from '../../library/filament/charts';
import {BigNumber, collapse, countTo, FilBg, FilGrain, Footnote} from '../../library/filament/stage';
import {ease, F, FF, vietFont} from '../../library/filament/theme';
import BASS_DATA from './bass.json';
import {BEATS, CT, CUES, cueEnd, cueStart, DURATION, H, HITS, V, W, WORD} from './timeline';

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
const fmt = (s: string) => s.replace('.', ',');

const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible', ...style}}>
    <FilDefs />
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
        const v = i === 0 && wi === 0 ? 1 : ease((f - at) / 9);
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
  ['18 tuổi', 'Đỗ đại học'],
  ['22 tuổi', 'Tốt nghiệp'],
  ['25 tuổi', 'Việc tốt'],
  ['30 tuổi', 'Lập gia đình'],
];
type Ev = {cue: number; word: string; slam: string; sx: number; fan: {a: number; len: number; label: string; bend?: number}[]};
const EVENTS: Ev[] = [
  {cue: 3, word: 'trượt', slam: 'TRƯỢT', sx: 290, fan: [{a: -165, len: 300, label: 'Thi lại', bend: 0.2}, {a: -132, len: 330, label: 'Học nghề', bend: 0.15}, {a: -28, len: 300, label: 'Đi làm sớm', bend: -0.18}, {a: 168, len: 250, label: 'Tự học', bend: -0.2}]},
  {cue: 5, word: 'thất', slam: 'THẤT NGHIỆP', sx: 330, fan: [{a: -160, len: 290, label: 'Học lên', bend: 0.18}, {a: -30, len: 300, label: 'Đổi ngành', bend: -0.16}, {a: 170, len: 260, label: 'Làm tự do', bend: -0.2}]},
  {cue: 6, word: 'cắt', slam: 'CẮT GIẢM', sx: 310, fan: [{a: -152, len: 300, label: 'Khởi nghiệp', bend: 0.18}, {a: -32, len: 300, label: 'Đổi thành phố', bend: -0.16}, {a: 166, len: 250, label: 'Nghỉ một năm', bend: -0.2}]},
  {cue: 7, word: 'vẫn', slam: 'CHƯA CƯỚI', sx: cx, fan: [{a: -168, len: 260, label: 'Sống cho mình', bend: 0.2}, {a: -12, len: 250, label: 'Đi thật xa', bend: -0.18}]},
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
  const gapA = WORD(2, 'đứt');
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
      {EVENTS.map((e, k) => (
        <Stamp key={k} f={f} at={evAt(k)} text={e.slam} x={e.sx} y={nodeY(k) - (k === 3 ? 250 : 110)} size={k === 3 ? 140 : 96} out={k === 3 ? V(8) + 6 : evAt(Math.min(3, k + 1)) - 4} rot={k % 2 ? 3 : -3} />
      ))}
    </AbsoluteFill>
  );
};

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
  const marks: [number, string][] = [[0.1, '18 · Đại học'], [0.32, '22 · Ra trường'], [0.55, '25 · Việc tốt'], [0.78, '30 · Cưới']];
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
  {t: 0.2, text: 'Trượt bằng lái', side: 1},
  {t: 0.4, text: 'Lỗ chút tiền', side: -1},
  {t: 0.6, text: 'Bị cho leo cây', side: 1},
  {t: 0.8, text: 'Cãi nhau với sếp', side: -1},
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
export const Ep59bTamLuoi: React.FC = () => {
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

        {/* ---------- 3 收成一点 → 社会时钟 ---------- */}
        <Seg f={f} from={B1 - 4} to={C1 - 4} fade={12}>
          <AbsoluteFill style={{transform: `scale(${(1 + 0.05 * drift(f, B1, C1)).toFixed(4)})`, transformOrigin: '50% 52%'}}>
            <Svg>
              <SpineToRing f={f} at={B1 - 2} morphAt={V(11) - 22} ringAt={V(11) + 4} />
              {f >= V(11) + 4 ? (
                (() => {
                  const a = V(11) + 4;
                  const c0 = WORD(12, 'luôn');
                  const val = f < c0 ? countTo(f, a + 18, 40, 0, 25.2, 1) : countTo(f, c0, 46, 25.2, 27.3, 1);
                  return <Ring f={f} at={a} x={cx} y={1000} r={300} value={fmt(val)} title="Tuổi kết hôn lần đầu" sub={f < c0 + 20 ? 'trung bình cả nước · 2019' : 'năm 2024 · và vẫn đang tăng'} mark={f < c0 ? 0.36 : 0.36 + 0.08 * ease((f - c0) / 46)} markLabel="Bạn ở đâu?" />;
                })()
              ) : null}
            </Svg>
            <Footnote f={f} at={V(11) + 40} text="Tổng cục Thống kê · TĐT dân số 2019 & điều tra giữa kỳ 2024" w={W} h={H} />
          </AbsoluteFill>
        </Seg>

        {/* ---------- 4 别人的一根线 → 69% → 没走的路 ---------- */}
        <Seg f={f} from={C1 - 4} to={V(15) - 4} fade={12}>
          <AbsoluteFill style={{transform: `translateY(${(60 * drift(f, C1, V(15))).toFixed(1)}px) scale(${(1 + 0.04 * drift(f, C1, V(15))).toFixed(4)})`}}>
            <Svg>
              <g opacity={1 - 0.75 * clamp01((f - V(14)) / 14)}>
                <GrowLine f={f} at={C1} dur={34} pts={[[cx, 1620], [cx, 560]]} width={3} />
                <Node f={f} at={C1 + 30} x={cx} y={1620} label="Người khác" labelAt="bottom" size={36} />
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
                      <Node key={k} f={f} at={a + 18 + k * 16} x={p[0]} y={p[1]} red r={6} label={k ? 'một lời mời' : 'một lần tình cờ'} size={30} labelAt={k ? 'right' : 'left'} />
                    ))}
                  </>
                );
              })()}
            </Svg>
            <BigNumber f={f} at={V(14)} value={`${fmt(countTo(f, V(14), 40, 0, 69.1, 1))}%`} label="người trẻ" sub="N = 772" x={cx} y={560} size={190} color={F.text} />
            <Footnote f={f} at={V(14) + 30} text="Bright, Pryor & Harpham · 2005 · Journal of Vocational Behavior" w={W} h={H} />
          </AbsoluteFill>
        </Seg>

        <Seg f={f} from={V(15) - 4} to={D1 - 2} fade={12}>
          <AbsoluteFill style={{transform: `scale(${(1 + 0.04 * drift(f, V(15), D1)).toFixed(4)})`, transformOrigin: '50% 60%'}}>
            <Svg>
              {(() => {
                const a = V(15);
                const fork: Pt = [cx, 1180];
                const dimR = 1 - 0.75 * clamp01((f - WORD(15, 'tô') - 30) / 30);
                return (
                  <>
                    <GrowLine f={f} at={a} dur={24} pts={[[cx, 1640], fork]} width={2.6} head={false} />
                    <GrowLine f={f} at={a + 20} dur={30} pts={arc(fork, [cx - 260, 720], 0.12)} width={2.2} color={F.lineDim} />
                    <g opacity={dimR}>
                      <GrowLine f={f} at={a + 22} dur={30} pts={arc(fork, [cx + 260, 720], -0.12)} width={3.2} color={GOLD} glowR={18} />
                    </g>
                    <Node f={f} at={a + 46} x={cx - 260} y={720} label="Đường đã đi" labelAt="top" size={34} r={4} />
                    <g opacity={0.35 + 0.65 * dimR}>
                      <Node f={f} at={a + 50} x={cx + 260} y={720} label="Đường chưa đi" labelAt="top" size={34} hot={dimR > 0.6} />
                    </g>
                  </>
                );
              })()}
            </Svg>
          </AbsoluteFill>
        </Seg>

        {/* ---------- 5 全部断掉 → 只剩你 → 从你长出 ---------- */}
        <Seg f={f} from={D1 - 2} to={E1 - 4} fade={12}>
          {(() => {
            const cut = WORD(16, 'đứt');
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
                  <Node f={f} at={V(17)} x={cx} y={1000} hot label={f >= V(17) + 10 ? 'Bạn' : undefined} labelAt="bottom" size={40} />
                  {f >= V(18) ? <circle cx={cx} cy={1000} r={40 + 120 * ease((f - V(18)) / 50)} fill="none" stroke={F.lineDim} strokeWidth={1.5} opacity={1 - clamp01((f - V(18)) / 50)} /> : null}
                  {(() => {
                    const a = V(19);
                    const labels = ['Học lại', 'Đổi nghề', 'Về quê', 'Lên phố', 'Mở quán nhỏ', 'Làm thuê trước', 'Đi học thêm', 'Nghỉ ngơi'];
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
            <BigNumber f={f} at={E1 + 40} value={`${fmt(countTo(f, E1 + 40, 40, 0, 70.4, 1))}%`} label="từng gặp biến cố nặng" x={cx} y={430} size={150} color={F.redHot} out={V(22) - 4} />
            <BigNumber f={f} at={V(22)} value={`${fmt(countTo(f, V(22), 40, 70.4, 3.9, 1))}%`} label="mắc PTSD suốt đời" x={cx} y={430} size={150} color={GOLD} />
            <Footnote f={f} at={E1 + 50} text={f < V(22) ? 'Benjet et al. · 2016 · 24 quốc gia, 68.894 người' : 'Kessler et al. · 2017 · Khảo sát Sức khỏe Tâm thần Thế giới (WHO)'} w={W} h={H} />
          </AbsoluteFill>
        </Seg>

        {/* ---------- 7 磨损的绳：drop 2 ---------- */}
        <Seg f={f} from={F1 - 4} to={G1 - 4} fade={12}>
          <AbsoluteFill style={{transform: `translate(${(-30 * drift(f, F1, G1)).toFixed(1)}px, ${(20 * drift(f, F1, G1)).toFixed(1)}px) scale(${(1.02 + 0.05 * drift(f, F1, G1)).toFixed(4)})`}}>
            <Svg>
              <Rope f={f} at={F1} flash={f >= HITS[1] ? Math.exp(-(f - HITS[1]) / 18) : 0} />
            </Svg>
            {FRAYS.map((fr, k) => {
              const p = ropePt(fr.t, fr.side * 120);
              return <Label key={k} f={f} at={F1 + 50 + k * 16} x={p[0]} y={p[1]} text={fr.text} size={36} color={F.redHot} out={HITS[1] + 20} font={SUBFONT} />;
            })}
            <Stamp f={f} at={HITS[1]} text="CHƯA ĐỨT" x={cx} y={760} size={140} color={GOLD} rot={-3} out={G1 - 14} />
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
                        <circle cx={dp[0]} cy={dp[1]} r={36} fill="url(#fl-halo)" />
                        <circle cx={dp[0]} cy={dp[1]} r={9} fill={GOLD} />
                      </>
                    ) : null}
                  </>
                );
              })()}
            </Svg>
            <Label f={f} at={G1 + 8} x={170} y={640} text="Mức khổ sở" size={30} color={F.textDim} align="left" />
            <Label f={f} at={G1 + 20} x={220} y={1370} text="Chưa vấp" size={30} color={F.textDim} />
            <Label f={f} at={G1 + 26} x={cx} y={1370} text="Vấp vài lần" size={34} color={GOLD} />
            <Label f={f} at={G1 + 32} x={860} y={1370} text="Vấp rất nhiều" size={30} color={F.textDim} />
            <Footnote f={f} at={G1 + 30} text="Seery, Holman & Silver · 2010 · 2.398 người, theo dõi nhiều năm" w={W} h={H} />
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
                const a = WORD(29, 'một');
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
      {(getInputProps() as {withMusic?: boolean}).withMusic ? <Audio src={staticFile('audio/ep66-ban-dep/track0908.mp3')} volume={0.6} /> : null}
      {(() => {
        const list: [string, number, number][] = [];
        const add = (n: string, at: number, v: number) => { if (at >= 0 && at < DURATION) list.push([n, Math.round(at), v]); };
        // drop
        for (const h of HITS) { add('riser', h - 27, 0.45); add('impact', h, 0.95); }
        add('suck', HITS[0] - 20, 0.35);
        // một sợi chỉ: chuông nhỏ từng nút
        for (let k = 0; k < 4; k++) add('ping', V(0) + 8 + k * 9, 0.22);
        add('snap', WORD(2, 'đứt'), 0.55);
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
        { const c0 = WORD(12, 'luôn'); for (let k = c0; k < c0 + 46; k += 3) add('count', k, 0.2); add('ding', c0 + 46, 0.3); }
        // người khác / 69% / ngã ba
        add('whoosh', C1 - 8, 0.35);
        add('ping', C1 + 30, 0.25);
        for (let k = V(14); k < V(14) + 40; k += 3) add('count', k, 0.22);
        add('ding', V(14) + 40, 0.35);
        add('ping', V(14) + 28, 0.22);
        add('ping', V(14) + 44, 0.22);
        add('shimmer', V(15) + 22, 0.3);
        // tất cả đứt → còn bạn → mọc lại
        { const cut = WORD(16, 'đứt'); for (let k = 0; k < 5; k++) add('snap', cut + k * 5, 0.45 - k * 0.05); }
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
        add('snap', WORD(29, 'một'), 0.35);
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
