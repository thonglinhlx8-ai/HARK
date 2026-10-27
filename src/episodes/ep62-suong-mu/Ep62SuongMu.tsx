import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile, useCurrentFrame, getInputProps} from 'remotion';
import {clamp01} from '../../library/anim';
import {FilBg, FilGrain} from '../../library/filament/stage';
import {ease, F} from '../../library/filament/theme';
import {BAR, BP, MID, S, W, H} from './timeline';

/**
 * ep62 Chọn trong sương mù — thiên kiến nhìn lại (Fischhoff 1975). Vỏ kênh Ep58–61, thiết bị hình riêng: cảnh đời theo từng tuổi + thoại chữ vàng + bóng 'giá mà'.
 * 4 ngã rẽ "giá mà" → nhìn lại sáng rõ → khái niệm + thí nghiệm → quay lại hôm đó (dấu GIÁ MÀ lật thành TRONG SƯƠNG MÙ) → drop 93,36 → hối tiếc → sổ ghi → tha thứ → tagline.
 */

const SUB = "'Ep62 Sub', 'Filament Viet', sans-serif";
const SERIF = "'Filament Viet Black', 'Filament Viet', serif";
const ITAL = "'Ep62 Ital', 'Filament Viet Display', serif";
if (typeof document !== 'undefined') {
  const h = delayRender('ep62 fonts');
  Promise.all([
    new FontFace('Ep62 Sub', `url(${staticFile('fonts/ep58/BeVietnamPro-ExtraBold.ttf')})`).load().then((l) => document.fonts.add(l)),
    new FontFace('Ep62 Display', `url(${staticFile('fonts/ep58/PlayfairDisplay.ttf')})`, {weight: '400 900'}).load().then((l) => document.fonts.add(l)),
    new FontFace('Ep62 Ital', `url(${staticFile('fonts/ep58/PlayfairDisplay.ttf')})`, {style: 'normal'}).load().then((l) => document.fonts.add(l)),
  ]).catch(() => undefined).finally(() => continueRender(h));
}

const LINE = 'rgba(240,212,165,0.62)';
const LINE_DIM = 'rgba(240,212,165,0.28)';
const RED = F.red;
const RED_HOT = F.redHot;
const GOLD = '#f2c46d';
const cx = W / 2;

const io = (f: number, a: number, b: number, d = 10) => ease((f - a) / d) * (1 - ease((f - b) / d));
const blurV = (v: number) => (v >= 0.999 ? undefined : `blur(${((1 - v) * 10).toFixed(1)}px)`);


/* ============================== PHỤ ĐỀ ============================== */
const DROP1 = 17.07;
const DROP2 = 93.36;
const CAPS: [number, number, string][] = [
  [-2, BAR(2) - 0.15, '11 giờ đêm, nằm mãi chưa ngủ. Mấy câu 【giá mà】 lại bật ra.'],
  [BAR(2) + 0.05, BAR(4) - 0.15, 'Năm 17 tuổi, chọn ngành theo ý 【bố mẹ】.'],
  [BAR(4) + 0.05, BAR(6) - 0.15, 'Giờ nghĩ lại: lẽ ra hồi đó phải 【cãi lại】.'],
  [BAR(6) + 0.05, BAR(8) - 0.15, 'Năm 20 tuổi, thích một người mà 【không dám nói】.'],
  [BAR(8) + 0.05, BAR(10) - 0.15, 'Rồi người ấy có người yêu. Lẽ ra phải 【mở lời】.'],
  [BAR(10) + 0.05, BAR(12) - 0.15, 'Năm 23 tuổi, từ chối việc ở 【thành phố khác】.'],
  [BAR(12) + 0.05, BAR(14) - 0.15, 'Công ty đó giờ lớn lắm. Lẽ ra phải 【đi】.'],
  [BAR(14) + 0.05, BAR(16) - 0.15, 'Năm 25 tuổi, bán cổ phiếu khi 【vừa có lời】.'],
  [BAR(16) + 0.05, BAR(18) - 0.15, 'Hai tháng sau nó tăng 【gấp đôi】. Biết vậy giữ lại.'],
  [BAR(18) + 0.05, BAR(20) - 0.15, 'Nhìn lại bây giờ, đường nào đúng 【rõ mồn một】.'],
  [BAR(20) + 0.05, BAR(22) - 0.15, 'Vậy sao lúc đó mình lại 【dại】 vậy?'],
  [BAR(25) + 0.05, BAR(27) - 0.15, 'Thí nghiệm: 479 sinh viên đọc về một cuộc chiến ít ai biết.'],
  [BAR(27) + 0.05, BAR(29) - 0.15, 'Nhóm được báo trước kết cục thấy nó 【dễ đoán hơn hẳn】.'],
  [BAR(29) + 0.05, BAR(31) - 0.15, 'Và họ 【không hề nhận ra】 mình bị ảnh hưởng.'],
  [BAR(32) + 0.05, BAR(34) - 0.15, '17 tuổi, chưa đi làm ngày nào, chỉ biết 【tin bố mẹ】.'],
  [BAR(34) + 0.05, BAR(36) - 0.15, '20 tuổi, sợ nói ra thì 【mất luôn tình bạn】.'],
  [BAR(36) + 0.05, BAR(38) - 0.15, '23 tuổi, mẹ đang ốm, 【không nỡ đi xa】.'],
  [BAR(38) + 0.05, BAR(40) - 0.15, '25 tuổi, không ai biết trước giá 【sẽ lên】.'],
  [BAR(40) + 0.05, BAR(42) - 0.15, 'Bạn ngày đó 【không dại】.'],
  [BAR(42) + 0.05, DROP2 - 0.15, 'Bạn ngày đó chỉ đang chọn…'],
  [DROP2 + 0.1, BAR(47) - 0.15, 'Chỉ thấy vài mét trước mặt, và đã 【chọn hết sức】.'],
  [BAR(47) + 0.05, BAR(48.5) - 0.15, 'Trước mắt, ta hay tiếc 【việc đã làm】.'],
  [BAR(48.5) + 0.05, BAR(50) - 0.15, 'Nhưng nhìn cả đời, ta tiếc nhất 【việc đã không làm】.'],
  [BAR(50) + 0.05, BAR(52) - 0.15, 'Nên đừng tiêu sức trách 【ngã rẽ cũ】.'],
  [BAR(52) + 0.05, BAR(54) - 0.15, 'Để dành nó cho 【ngã rẽ trước mặt】.'],
  [BAR(54) + 0.05, BAR(56) - 0.15, 'Lần tới câu 【giá mà】 bật ra,'],
  [BAR(56) + 0.05, BAR(58) - 0.15, 'thử viết lại nó 【công bằng hơn】.'],
  [BAR(58) + 0.05, BAR(60) - 0.15, 'Mình của ngày đó, cũng đáng được'],
  [BAR(60) + 0.05, BAR(62) - 0.15, 'Đừng trách người đi trong sương, bằng 【ánh sáng của hôm nay】.'],
  [BAR(62) + 0.05, 134.6, 'Câu 【giá mà】 bạn hay tự nói nhất là gì?'],
];

const Caption: React.FC<{f: number; a: number; b: number; text: string; top?: number}> = ({f, a, b, text, top = 300}) => {
  const fa = S(a);
  const fb = S(b);
  if (f < fa - 2 || f > fb + 10) return null;
  const words: {w: string; hi: boolean}[] = [];
  let hi = false;
  for (const raw of text.split(' ')) {
    let w = raw;
    if (w.includes('【')) hi = true;
    const close = w.includes('】');
    w = w.replace(/[【】]/g, '');
    words.push({w, hi});
    if (close) hi = false;
  }
  const out = 1 - ease((f - fb) / 9);
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top, textAlign: 'center', fontFamily: SUB, fontSize: 54, lineHeight: 1.45, color: F.text, opacity: out, filter: blurV(out)}}>
      {words.map((x, i) => {
        const v = a < 0 ? 1 : ease((f - fa - i * 2.2) / 8);
        return (
          <React.Fragment key={i}>
            {i > 0 ? ' ' : ''}
            <span style={{display: 'inline-block', opacity: v, filter: blurV(v), transform: `translateY(${((1 - v) * 14).toFixed(1)}px)`, color: x.hi ? RED_HOT : undefined, textShadow: x.hi ? '0 0 22px rgba(255,90,70,0.55), 0 3px 8px #000' : '0 3px 10px rgba(0,0,0,0.95)'}}>{x.w}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ============================== LINE-ART ============================== */
const Defs: React.FC = () => (
  <defs>
    <linearGradient id="e62body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#6a5643" />
      <stop offset="0.45" stopColor="#3a2f26" />
      <stop offset="1" stopColor="#15110d" />
    </linearGradient>
    <linearGradient id="e62bust" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2c241e" />
      <stop offset="1" stopColor="#120e0b" />
    </linearGradient>
    <radialGradient id="e62spot" cx="0.5" cy="0.3" r="0.7">
      <stop offset="0" stopColor="rgba(255,214,150,0.22)" />
      <stop offset="1" stopColor="rgba(255,214,150,0)" />
    </radialGradient>
    <linearGradient id="e62light" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="rgba(255,206,130,0.55)" />
      <stop offset="1" stopColor="rgba(255,206,130,0)" />
    </linearGradient>
    <radialGradient id="e62fog" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="rgba(214,196,170,0.55)" />
      <stop offset="1" stopColor="rgba(214,196,170,0)" />
    </radialGradient>
    <linearGradient id="e62fogTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="rgba(150,134,114,0.95)" />
      <stop offset="0.7" stopColor="rgba(120,104,86,0.55)" />
      <stop offset="1" stopColor="rgba(120,104,86,0)" />
    </linearGradient>
    <linearGradient id="e62gold" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stopColor="rgba(242,196,109,0.95)" />
      <stop offset="1" stopColor="rgba(255,226,160,0.55)" />
    </linearGradient>
  </defs>
);

const Person: React.FC<{x: number; y: number; s?: number; arm?: number; paper?: boolean; dim?: number; ghost?: boolean}> = ({x, y, s = 1, arm, paper, dim = 1, ghost}) => {
  const fb = ghost ? 'rgba(242,196,109,0.10)' : 'url(#e62body)';
  const sk = ghost ? GOLD : LINE;
  const da = ghost ? '7 5' : undefined;
  return (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={dim}>
    <path d="M-16,0 L-15,62 M16,0 L15,62" stroke={ghost ? "rgba(242,196,109,0.25)" : "#2a221b"} strokeWidth={13} strokeLinecap="round" />
    <path d="M-16,0 L-15,62 M16,0 L15,62" stroke={LINE_DIM} strokeWidth={1.2} fill="none" />
    <path d="M-36,4 L-31,-78 Q-28,-108 0,-110 Q28,-108 31,-78 L36,4 Z" fill={fb} stroke={sk} strokeWidth={1.5} strokeDasharray={da} />
    <circle cx={0} cy={-133} r={21} fill={fb} stroke={sk} strokeWidth={1.5} strokeDasharray={da} />
    {arm !== undefined ? <path d={`M26,-96 L${26 + 64 * Math.cos(arm)},${-96 - 64 * Math.sin(arm)}`} stroke="#4a3c30" strokeWidth={11} strokeLinecap="round" /> : null}
    {paper ? <rect x={14} y={-58} width={24} height={30} fill="#efe6d2" opacity={0.9} /> : null}
  </g>
  );
};

/** Người ngồi (nhìn nghiêng), hướng phải. hunch: cúi đầu */
const Sitter: React.FC<{x: number; y: number; s?: number; hunch?: number; flip?: boolean; glow?: boolean; ghost?: boolean}> = ({x, y, s = 1, hunch = 0, flip, glow, ghost}) => {
  const fb = ghost ? 'rgba(242,196,109,0.10)' : 'url(#e62body)';
  const sk = ghost ? GOLD : LINE;
  const da = ghost ? '7 5' : undefined;
  return (
  <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
    <path d="M-10,0 L44,0 L46,62" stroke={ghost ? "rgba(242,196,109,0.25)" : "#2a221b"} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M-10,0 L44,0 L46,62" stroke={LINE_DIM} strokeWidth={1.2} fill="none" />
    <path d={`M-28,6 L-26,-70 Q${-18 + hunch * 14},-104 ${8 + hunch * 16},-100 Q${26 + hunch * 12},-90 22,-60 L20,6 Z`} fill={fb} stroke={sk} strokeWidth={1.5} strokeDasharray={da} />
    <circle cx={6 + hunch * 26} cy={-124 + hunch * 14} r={20} fill={fb} stroke={sk} strokeWidth={1.5} strokeDasharray={da} style={glow ? {filter: 'drop-shadow(0 0 10px rgba(150,180,240,0.6))'} : undefined} />
    <path d="M14,-80 L52,-40" stroke={ghost ? "rgba(242,196,109,0.35)" : "#4a3c30"} strokeWidth={10} strokeLinecap="round" />
  </g>
  );
};

const Bubble: React.FC<{x: number; y: number; text: string; o?: number; red?: boolean; w?: number}> = ({x, y, text, o = 1, red, w}) => {
  const ww = w ?? Math.max(90, text.length * 15 + 36);
  return (
    <g transform={`translate(${x},${y})`} opacity={o}>
      <rect x={-ww / 2} y={-26} width={ww} height={48} rx={14} fill="rgba(30,24,18,0.92)" stroke={red ? RED : LINE} strokeWidth={1.6} />
      <path d="M-8,22 L0,36 L8,22" fill="rgba(30,24,18,0.92)" stroke={red ? RED : LINE} strokeWidth={1.6} />
      <text x={0} y={7} textAnchor="middle" fontFamily={SUB} fontSize={24} fill={red ? RED_HOT : '#f3efe6'}>{text}</text>
    </g>
  );
};

type Fork = {i?: number; l: string; r: string; pick: 'L' | 'R'; fog: number; lit?: 'L' | 'R'; icon?: string; walk?: number; chips?: string[]; clear?: number};

const FogLayer: React.FC<{f: number; k: number; seed?: number}> = ({f, k, seed = 0}) => {
  if (k <= 0) return null;
  const blobs = [[-220, -200, 260, 120], [140, -240, 300, 130], [-60, -110, 340, 140], [230, -60, 220, 110], [-260, 10, 220, 100], [40, -300, 380, 120]];
  return (
    <g opacity={k}>
      <ellipse cx={0} cy={-190} rx={400} ry={230} fill="url(#e62fog)" opacity={0.9} />
      {blobs.map(([x, y, rx, ry], i) => (
        <ellipse key={i} cx={x + 26 * Math.sin(f / 70 + i * 1.7 + seed)} cy={y + 8 * Math.cos(f / 90 + i)} rx={rx} ry={ry} fill="url(#e62fog)" />
      ))}
    </g>
  );
};

/* ============================== THOẠI CHỮ VÀNG ============================== */
const Say: React.FC<{t: number; t0: number; x: number; y: number; who?: string; text: string; size?: number; o?: number; anchor?: 'start' | 'middle' | 'end'}> = ({t, t0, x, y, who, text, size = 24, o = 1, anchor = 'middle'}) => {
  const d = t - t0;
  if (d < 0) return null;
  const n = Math.floor(d * 20);
  const lines = text.split('\n');
  let left = n;
  const v = clamp01(d / 0.2) * o;
  return (
    <g opacity={v}>
      {who ? <text x={x} y={y - size * 1.25} textAnchor={anchor} fontFamily={SUB} fontSize={15} letterSpacing={2} fill="rgba(240,212,165,0.6)">{who}</text> : null}
      {lines.map((ln, i) => {
        const shown = ln.slice(0, Math.max(0, left));
        left -= ln.length;
        return (
          <text key={i} x={x} y={y + i * size * 1.3} textAnchor={anchor} fontFamily={SUB} fontSize={size} fill={GOLD} style={{filter: 'drop-shadow(0 0 8px rgba(242,196,109,0.55)) drop-shadow(0 2px 3px #000)'}}>{shown}</text>
        );
      })}
    </g>
  );
};

/* ============================== CẢNH ĐỜI THẬT ============================== */
type Line = {x: number; y: number; who?: string; text: string; at: number};
type Life = {base: (f: number, t: number) => React.ReactNode; lines: Line[]; ghost: (f: number) => React.ReactNode; ghostLine: Omit<Line, 'at'>; after?: (f: number, h: number) => React.ReactNode; think: [number, number]};

const LIVES: Life[] = [
  // 17 — bố mẹ chọn ngành
  {
    base: (f, t) => (
      <g>
        <ellipse cx={0} cy={0} rx={300} ry={260} fill="url(#e62spot)" />
        <path d="M-60,-300 L60,-300 L200,90 L-200,90 Z" fill="url(#e62light)" opacity={0.35} />
        <rect x={-200} y={66} width={400} height={14} fill="#221b15" stroke={LINE} strokeWidth={1.3} />
        <path d="M-180,80 L-180,190 M180,80 L180,190" stroke={LINE_DIM} strokeWidth={2} />
        <rect x={-50} y={50} width={70} height={16} fill="#efe6d2" opacity={0.85} transform="rotate(-4,-15,58)" />
        <Sitter x={-190} y={150} s={1.05} hunch={0.5 + 0.08 * Math.sin(f / 22)} />
        <Sitter x={150} y={150} s={1.05} flip />
        <Sitter x={240} y={150} s={1} flip hunch={0.2} />
      </g>
    ),
    lines: [
      {x: 170, y: -150, who: 'BỐ', text: 'Học kinh tế\ncho ổn định.', at: 0.5},
      {x: -170, y: -150, text: '…Dạ.', at: 2.2},
    ],
    ghost: () => <Person x={-120} y={110} s={1.05} arm={1.9} ghost />,
    ghostLine: {x: -110, y: -215, text: 'Con muốn học\nthiết kế!'},
    think: [-190, -40],
  },
  // 20 — không dám nói
  {
    base: (f) => (
      <g>
        <circle cx={210} cy={-230} r={34} fill="rgba(240,230,200,0.8)" style={{filter: 'drop-shadow(0 0 20px rgba(255,240,200,0.7))'}} />
        <ellipse cx={0} cy={40} rx={300} ry={220} fill="url(#e62spot)" />
        <rect x={-230} y={112} width={460} height={14} rx={4} fill="#2a221b" stroke={LINE} strokeWidth={1.4} />
        <path d="M-200,126 L-200,200 M200,126 L200,200" stroke={LINE_DIM} strokeWidth={2} />
        <Sitter x={-140} y={112} s={1} hunch={0.35 + 0.06 * Math.sin(f / 25)} />
        <Sitter x={140} y={112} s={1} flip />
      </g>
    ),
    lines: [
      {x: 140, y: -125, who: 'NGƯỜI ẤY', text: 'Dạo này\ncậu sao thế?', at: 0.5},
      {x: -140, y: -125, text: 'À… không\ncó gì đâu.', at: 2.2},
    ],
    ghost: () => <Sitter x={-40} y={112} s={1} hunch={-0.2} ghost />,
    ghostLine: {x: -40, y: -205, text: 'Tớ thích cậu\nlâu rồi.'},
    think: [-140, -60],
  },
  // 23 — mẹ ốm, thư mời việc
  {
    base: (f, t) => (
      <g>
        <ellipse cx={40} cy={20} rx={300} ry={240} fill="url(#e62spot)" />
        <rect x={20} y={110} width={270} height={50} rx={8} fill="#2a221b" stroke={LINE} strokeWidth={1.5} />
        <rect x={260} y={60} width={26} height={140} fill="#221b15" stroke={LINE} strokeWidth={1.3} />
        <path d="M60,112 Q160,70 255,104 L255,112 Z" fill="#4a3c30" stroke={LINE} strokeWidth={1.3} />
        <circle cx={232} cy={86} r={20} fill="url(#e62body)" stroke={LINE} strokeWidth={1.4} />
        <path d="M20,160 L20,210 M290,160 L290,210" stroke={LINE_DIM} strokeWidth={2} />
        <Person x={-170} y={130} s={1} arm={0.9} />
        <g transform={`translate(${-170 + 26 + 64 * Math.cos(0.9) - 12},${130 - 96 - 64 * Math.sin(0.9) - 30})`}>
          <rect x={0} y={0} width={28} height={44} rx={5} fill="#1a2230" stroke={LINE} strokeWidth={1.2} style={{filter: `drop-shadow(0 0 ${10 + 4 * Math.sin(f / 9)}px rgba(150,180,240,0.8))`}} />
        </g>
        <g opacity={clamp01((t - 0.2) / 0.3)}>
          <rect x={-300} y={-250} width={170} height={56} rx={12} fill="rgba(26,34,48,0.95)" stroke="rgba(150,180,240,0.6)" strokeWidth={1.3} />
          <text x={-215} y={-228} textAnchor="middle" fontFamily={SUB} fontSize={14} fill="rgba(200,215,240,0.8)">THƯ MỜI LÀM VIỆC</text>
          <text x={-215} y={-206} textAnchor="middle" fontFamily={SUB} fontSize={16} fill="#f3efe6">Sài Gòn · nhận ngay</text>
        </g>
      </g>
    ),
    lines: [
      {x: 160, y: -20, who: 'MẸ', text: 'Con cứ đi đi,\nmẹ ổn mà.', at: 0.9},
      {x: -150, y: -120, text: 'Con ở lại\nvới mẹ.', at: 2.4},
    ],
    ghost: () => (
      <g>
        <Person x={-250} y={130} s={1} ghost />
        <rect x={-215} y={140} width={46} height={58} rx={6} fill="rgba(242,196,109,0.1)" stroke={GOLD} strokeWidth={1.4} strokeDasharray="6 5" />
      </g>
    ),
    ghostLine: {x: -200, y: -150, text: 'Con đi nhé mẹ.'},
    think: [-170, -10],
  },
  // 25 — bán cổ phiếu
  {
    base: (f, t) => {
      const pts = [[-80, 60], [-50, 40], [-20, 48], [10, 20], [40, 26], [70, 0]];
      const k = clamp01((t - 0.2) / 1.4);
      const m = Math.max(1, Math.round(k * (pts.length - 1)));
      return (
        <g>
          <ellipse cx={0} cy={20} rx={300} ry={240} fill="url(#e62spot)" />
          <rect x={-290} y={96} width={330} height={14} fill="#221b15" stroke={LINE} strokeWidth={1.3} />
          <path d="M-270,110 L-270,200 M20,110 L20,200" stroke={LINE_DIM} strokeWidth={2} />
          <Sitter x={-210} y={150} s={1} hunch={0.6} glow />
          <g transform="translate(150,-60)">
            <rect x={-110} y={-150} width={220} height={300} rx={26} fill="#17120e" stroke={LINE} strokeWidth={1.6} />
            <text x={-86} y={-112} fontFamily={SUB} fontSize={16} fill="rgba(246,243,234,0.6)">Mã của bạn</text>
            <text x={86} y={-112} textAnchor="end" fontFamily={SUB} fontSize={16} fill="#7fe08a">+10%</text>
            <path d={pts.slice(0, m + 1).map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ')} fill="none" stroke="#7fe08a" strokeWidth={3} />
            <rect x={-70} y={96} width={140} height={36} rx={18} fill={RED} opacity={0.9} style={t > 2.2 && t < 2.6 ? {filter: 'drop-shadow(0 0 14px rgba(255,60,40,0.9))'} : undefined} />
            <text x={0} y={120} textAnchor="middle" fontFamily={SUB} fontSize={18} fill="#fff">BÁN</text>
          </g>
        </g>
      );
    },
    lines: [{x: -200, y: -150, text: 'Lời 10% rồi,\nchốt thôi.', at: 0.8}],
    ghost: () => <Sitter x={-130} y={150} s={1} hunch={0.1} ghost />,
    ghostLine: {x: -130, y: -205, text: 'Giữ thêm\nchút nữa…'},
    after: (f, h) => (
      <g transform="translate(150,-60)" opacity={h}>
        <path d={`M70,0 L${70 + 20 * h},${-40 * h} L${70 + 30 * h},${-30 * h} L${70 + 34 * h},${-110 * h}`} fill="none" stroke={GOLD} strokeWidth={3.5} style={{filter: 'drop-shadow(0 0 8px rgba(242,196,109,0.9))'}} />
        <text x={-20} y={-60} textAnchor="middle" fontFamily={SERIF} fontSize={46} fill={RED_HOT} style={{filter: 'drop-shadow(0 0 10px rgba(255,60,40,0.8))'}}>×2</text>
      </g>
    ),
    think: [-210, -30],
  },
];

const LifeArt: React.FC<{f: number; t: number; i: number; hind: number; fog: number; chips?: string[]; mini?: boolean}> = ({f, t, i, hind, fog, chips, mini}) => {
  const L = LIVES[i];
  const flip = !!chips;
  const hindAt = 4 * BP * 2;
  return (
    <g>
      {L.base(f, mini ? 9 : t)}
      {L.after ? L.after(f, hind) : null}
      {hind > 0.01 ? (
        <g opacity={hind * (0.75 + 0.25 * Math.sin(f / 7))} style={{filter: 'drop-shadow(0 0 10px rgba(242,196,109,0.6))'}}>
          {L.ghost(f)}
        </g>
      ) : null}
      <FogLayer f={f} k={fog} />
      {!mini && !flip ? L.lines.map((ln, k) => <Say key={k} t={t} t0={ln.at} x={ln.x} y={ln.y} who={ln.who} text={ln.text} o={1 - 0.85 * hind} />) : null}
      {!mini && !flip && hind > 0.01 ? <Say t={t} t0={hindAt + 0.25} x={L.ghostLine.x} y={L.ghostLine.y} text={L.ghostLine.text} size={26} /> : null}
      {flip
        ? chips!.map((c, k) => <Say key={k} t={t} t0={0.35 + k * 0.7} x={0} y={-235 + k * 66} who={k === 0 ? 'LÚC ĐÓ MÌNH NGHĨ' : ''} text={c} size={23} />)
        : null}
    </g>
  );
};

const WalkFog: React.FC<{f: number; t: number; fog: number; walk: number; lit?: boolean}> = ({f, t, fog, walk, lit}) => (
  <g>
    <ellipse cx={0} cy={60} rx={300} ry={260} fill="url(#e62spot)" />
    <path d="M-200,320 L-16,-120 L16,-120 L200,320 Z" fill="#1d1712" stroke={LINE_DIM} strokeWidth={1.2} />
    {lit ? <path d="M-40,320 L-6,-120 L6,-120 L40,320 Z" fill="url(#e62gold)" opacity={0.35 * clamp01(t / 1.5)} /> : null}
    <ellipse cx={0} cy={210 - 160 * walk} rx={120 - 50 * walk} ry={34 - 12 * walk} fill="rgba(255,206,130,0.16)" />
    <FogLayer f={f} k={fog} />
    <Person x={0} y={200 - 160 * walk} s={1 - 0.35 * walk} />
  </g>
);

const GRID = [0, 1, 2, 3];
const AGES = ['17', '20', '23', '25'];
type Kind = 'bed' | 'sleep' | 'life' | 'grid' | 'walk';
const Art: React.FC<{kind: Kind; f: number; t?: number; p?: Fork; clock?: string; gridFog?: number; gridLit?: boolean; id: string}> = ({kind, f, t = 0, p, clock = '23:00', gridFog = 0, gridLit = true}) => {
  if (kind === 'bed' || kind === 'sleep') {
    const sleep = kind === 'sleep';
    return (
      <g>
        <ellipse cx={0} cy={-40} rx={300} ry={260} fill="url(#e62spot)" />
        <rect x={-250} y={-260} width={170} height={200} fill="#101521" stroke={LINE} strokeWidth={1.6} />
        <line x1={-165} x2={-165} y1={-260} y2={-60} stroke={LINE_DIM} />
        <line x1={-250} x2={-80} y1={-160} y2={-160} stroke={LINE_DIM} />
        <circle cx={-205} cy={-215} r={16} fill="rgba(240,230,200,0.85)" style={{filter: 'drop-shadow(0 0 10px rgba(255,240,200,0.8))'}} />
        <rect x={110} y={-120} width={130} height={60} rx={10} fill="#16110d" stroke={LINE} strokeWidth={1.5} />
        <text x={175} y={-79} textAnchor="middle" fontFamily={SUB} fontSize={34} fill={sleep ? 'rgba(246,243,234,0.55)' : RED_HOT} style={sleep ? undefined : {filter: 'drop-shadow(0 0 8px rgba(255,70,50,0.8))'}}>{clock}</text>
        <rect x={-280} y={110} width={460} height={60} rx={8} fill="#2a221b" stroke={LINE} strokeWidth={1.6} />
        <rect x={-280} y={70} width={30} height={160} fill="#221b15" stroke={LINE} strokeWidth={1.4} />
        <rect x={-240} y={80} width={100} height={34} rx={14} fill="#3a3128" stroke={LINE} strokeWidth={1.3} />
        <path d="M-280,170 L-280,240 M180,170 L180,240" stroke={LINE_DIM} strokeWidth={2} />
        {sleep ? (
          <g>
            <path d="M-150,112 Q-20,60 170,104 L170,112 Z" fill="#4a3c30" stroke={LINE} strokeWidth={1.4} />
            <circle cx={-182} cy={84} r={22} fill="url(#e62body)" stroke={LINE} strokeWidth={1.5} />
            <text x={-130} y={30 - 6 * Math.sin(f / 18)} fontFamily={ITAL} fontSize={30} fill="rgba(246,243,234,0.5)">z</text>
            <text x={-104} y={6 - 6 * Math.sin(f / 18 + 1)} fontFamily={ITAL} fontSize={24} fill="rgba(246,243,234,0.35)">z</text>
          </g>
        ) : (
          <g>
            <path d="M-120,112 L60,112 L70,100 L-110,96 Z" fill="#4a3c30" stroke={LINE} strokeWidth={1.2} />
            <Sitter x={-40} y={108} s={1.2} hunch={0.8} glow />
            <rect x={6} y={30} width={22} height={36} rx={4} fill="#1a2230" stroke={LINE} strokeWidth={1.2} style={{filter: 'drop-shadow(0 0 10px rgba(150,180,240,0.7))'}} />
          </g>
        )}
      </g>
    );
  }
  if (kind === 'grid') {
    return (
      <g>
        {GRID.map((i) => {
          const v = clamp01((t - i * 0.25) / 0.35);
          const h = gridLit ? clamp01((t - i * 0.25 - 0.3) / 0.4) : 0;
          const x = i % 2 === 0 ? -158 : 158;
          const y = i < 2 ? -150 : 170;
          return (
            <g key={i} transform={`translate(${x},${y}) scale(${0.47 * (0.92 + 0.08 * v)})`} opacity={v}>
              <rect x={-320} y={-320} width={640} height={640} rx={30} fill="rgba(20,15,11,0.9)" stroke={LINE_DIM} strokeWidth={3} />
              <LifeArt f={f} t={9} i={i} hind={h} fog={gridFog} mini />
              <text x={-290} y={-262} fontFamily={SERIF} fontSize={44} fill="rgba(246,243,234,0.8)">{AGES[i]}</text>
            </g>
          );
        })}
      </g>
    );
  }
  if (kind === 'walk') return <WalkFog f={f} t={t} fog={p?.fog ?? 1} walk={p?.walk ?? 0} lit={p?.lit === 'R'} />;
  return p ? <LifeArt f={f} t={t} i={p.i ?? 0} hind={p.clear ?? 0} fog={p.fog} chips={p.chips} /> : null;
};

const Scene: React.FC<{f: number; a: number; b: number; kind: Kind; y?: number; size?: number; children?: React.ReactNode; hardIn?: boolean; first?: boolean; p?: Fork | ((t: number) => Fork); clock?: string; gridFog?: number; gridLit?: boolean}> = ({f, a, b, kind, y = 860, size = 820, children, hardIn, first, p, clock, gridFog, gridLit}) => {
  const fa = S(a);
  const fb = S(b);
  if (f < fa - 2 || f > fb + 10) return null;
  const vin = first || hardIn ? 1 : ease((f - fa) / 9);
  const vout = 1 - ease((f - fb) / 9);
  const v = vin * vout;
  const sc = (0.94 + 0.06 * vin) * (1 + 0.04 * clamp01((f - fa) / Math.max(1, fb - fa)));
  const t = (f - fa) / 30;
  return (
    <div style={{position: 'absolute', left: cx - size / 2, top: y - size / 2, width: size, height: size, opacity: v, filter: blurV(v), transform: `scale(${sc.toFixed(4)})`}}>
      <svg width={size} height={size} viewBox="-320 -320 640 640" style={{position: 'absolute', overflow: 'visible'}}>
        <Defs />
        <Art id={`${kind}${Math.round(a * 100)}`} kind={kind} f={f} t={t} p={typeof p === 'function' ? p(t) : p} clock={clock} gridFog={gridFog} gridLit={gridLit} />
      </svg>
      <div style={{position: 'absolute', left: '50%', top: '52%'}}>{children}</div>
    </div>
  );
};

/* ============================== LẬT DẤU ============================== */
const Flip: React.FC<{f: number; at: number; text?: string; to?: string}> = ({f, at, text = 'GIÁ MÀ…', to = 'TRONG SƯƠNG MÙ'}) => {
  const d = f - at;
  const k = clamp01((d + 4) / 8);
  const sx = Math.abs(Math.cos(k * Math.PI));
  const after = k >= 0.5;
  const pop = after ? 1 + 0.12 * Math.exp(-Math.max(0, d) / 4) : 1;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(-50%,-50%) scaleX(${sx.toFixed(3)}) scale(${pop.toFixed(3)})`}}>
      {after ? (
        <div style={{whiteSpace: 'nowrap', fontFamily: SUB, fontSize: 46, color: '#21180f', padding: '14px 40px', borderRadius: 999, background: 'linear-gradient(180deg,#f6d38a,#e2b25e)', boxShadow: '0 0 40px rgba(242,196,109,0.7)'}}>{to}</div>
      ) : (
        <div style={{whiteSpace: 'nowrap', fontFamily: SERIF, fontSize: 80, lineHeight: 1, color: RED, padding: '13px 22px', border: `5px solid ${RED}`, borderRadius: 10, background: 'rgba(40,6,4,0.6)', transform: 'rotate(-7deg)', textShadow: '0 0 24px rgba(255,60,40,0.85)'}}>{text}</div>
      )}
    </div>
  );
};

/* ============================== BIỂU ĐỒ ============================== */
const Bars: React.FC<{f: number; a: number; b: number; grow: number}> = ({f, a, b, grow}) => {
  const fa = S(a);
  const fb = S(b);
  if (f < fa - 2 || f > fb + 10) return null;
  const v = io(f, fa, fb, 9);
  const g1 = ease((f - S(grow) + 10) / 14);
  const g2 = ease((f - S(grow)) / 14);
  const col = (x: number, h: number, g: number, label: string, hot: boolean) => (
    <div style={{position: 'absolute', left: x, bottom: 0, width: 260, textAlign: 'center'}}>
      <div style={{margin: '0 auto', width: 150, height: h * g, borderRadius: '14px 14px 0 0', background: hot ? 'linear-gradient(180deg,#ff5a46,#a81f15)' : 'linear-gradient(180deg,#6a5643,#3a2f26)', border: `1.5px solid ${hot ? RED_HOT : LINE}`, boxShadow: hot ? '0 0 34px rgba(255,60,40,0.55)' : undefined}} />
      <div style={{position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 22, fontFamily: SUB, fontSize: 30, lineHeight: 1.3, color: hot ? RED_HOT : '#f3efe6'}}>{label}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: cx - 340, top: 700, width: 680, height: 560, opacity: v, filter: blurV(v)}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', fontFamily: SUB, fontSize: 30, color: 'rgba(246,243,234,0.6)'}}>Thấy kết cục đó “dễ đoán” cỡ nào</div>
      <div style={{position: 'absolute', left: 40, right: 40, bottom: 0, height: 2, background: LINE}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 460}}>
        {col(60, 190, g1, 'Không biết trước', false)}
        {col(360, 380, g2, 'Được báo trước', true)}
      </div>
    </div>
  );
};

/* ============================== DẤU ĐỎ ============================== */
const Stamp: React.FC<{f: number; land: number; size?: number; text?: string; instant?: boolean; out?: number}> = ({f, land, size = 84, text = 'GIÁ MÀ…', instant, out}) => {
  const t = instant ? 99 : f - land + 6;
  if (t < 0) return null;
  const fall = clamp01(t / 6);
  const l = t - 6;
  const sc = l < 0 ? 2.6 - 1.6 * fall * fall : 1 + 0.07 * Math.exp(-l / 3) * Math.cos(l * 1.5);
  const o = clamp01(t / 2) * (out === undefined ? 1 : 1 - ease((f - out) / 8));
  if (o <= 0) return null;
  const ring = clamp01(l / 18);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transform: 'translate(-50%,-50%)', opacity: o}}>
      {l >= 0 && ring < 1 && !instant ? <div style={{position: 'absolute', left: '50%', top: '50%', width: size * 7 * (0.5 + ring), height: size * 2 * (0.5 + ring), transform: 'translate(-50%,-50%)', borderRadius: '50%', border: `3px solid ${RED}`, opacity: (1 - ring) * 0.7}} /> : null}
      <div style={{whiteSpace: 'nowrap', fontFamily: SERIF, fontSize: size, lineHeight: 1, color: RED, padding: `${size * 0.16}px ${size * 0.28}px`, border: `${size * 0.06}px solid ${RED}`, borderRadius: size * 0.12, background: 'rgba(40,6,4,0.6)', transform: `scale(${sc.toFixed(4)}) rotate(-7deg)`, filter: l < 0 ? `blur(${((1 - fall) * 14).toFixed(1)}px)` : undefined, textShadow: `0 0 ${size * 0.3}px rgba(255,60,40,0.85)`, boxShadow: `0 0 ${size * 0.4}px rgba(255,50,30,0.55), inset 0 0 ${size * 0.25}px rgba(255,50,30,0.35)`}}>
        {text}
      </div>
    </div>
  );
};

/* ============================== TRẮC NGHIỆM ============================== */
const Poll: React.FC<{f: number; a: number; ch: number; out: number; q?: string; l?: string; r?: string}> = ({f, a, ch, out, q = 'Lẽ ra phải biết?', l = 'Không thể', r = 'Phải biết'}) => {
  const v = io(f, S(a), S(out), 8);
  if (v <= 0) return null;
  const pressed = f >= S(ch);
  const pt = f - S(ch);
  const num = f < S(ch) - S(2 * BP) ? 3 : f < S(ch) - S(BP) ? 2 : 1;
  const btn = (on: boolean, dim: boolean): React.CSSProperties => ({width: 220, height: 74, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SUB, fontSize: 34, color: dim ? 'rgba(255,255,255,0.35)' : '#fff', border: on ? 'none' : '1.5px solid rgba(255,255,255,0.45)', background: on ? 'linear-gradient(180deg,#ff5a46,#c8261b)' : 'rgba(255,255,255,0.05)', boxShadow: on ? '0 0 34px rgba(255,60,40,0.75)' : undefined});
  const press = pressed ? 1 + 0.14 * Math.exp(-pt / 3) * Math.cos(pt * 1.2) - (pt < 2 ? 0.1 : 0) : 1;
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 1330, opacity: v, filter: blurV(v), textAlign: 'center'}}>
      <div style={{fontFamily: SUB, fontSize: 40, color: F.text, textShadow: '0 2px 10px #000'}}>{q}</div>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30, marginTop: 30}}>
        <div style={btn(false, pressed)}>{l}</div>
        <div style={{width: 58, height: 58, borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SUB, fontSize: 28, color: '#fff', opacity: pressed ? 0.25 : 1}}>{num}</div>
        <div style={{...btn(pressed, false), transform: `scale(${press.toFixed(3)})`}}>{r}</div>
      </div>
    </div>
  );
};

/* ============================== HAI CỘT ============================== */
const TwoCol: React.FC<{f: number; a: number; b: number; mine: string; theirs: string; tm: number; tt: number; lm?: string; lt?: string}> = ({f, a, b, mine, theirs, tm, tt, lm = 'Việc của mình', lt = 'Việc của họ'}) => {
  const fa = S(a);
  const fb = S(b);
  if (f < fa - 2 || f > fb + 10) return null;
  const v = io(f, fa, fb, 9);
  const col = (left: boolean, label: string, item: string, at: number) => {
    const c = left ? GOLD : RED;
    const iv = ease((f - S(at)) / 7);
    const pop = 1 + 0.1 * Math.exp(-(f - S(at)) / 4) * (iv > 0 ? 1 : 0);
    return (
      <div style={{position: 'absolute', left: left ? 90 : 560, top: 0, width: 430, height: 620, borderRadius: 26, border: `2px solid ${c}`, background: 'rgba(26,20,15,0.82)', boxShadow: `0 0 34px ${left ? 'rgba(242,196,109,0.18)' : 'rgba(255,60,40,0.22)'}`}}>
        <div style={{margin: '34px auto 0', width: 'fit-content', fontFamily: SUB, fontSize: 30, color: left ? GOLD : RED_HOT, border: `1.5px solid ${c}`, borderRadius: 999, padding: '6px 24px'}}>{label}</div>
        {[0, 1, 2, 3].map((k) => <div key={k} style={{position: 'absolute', left: 40, right: 40, top: 200 + k * 100, height: 1.5, background: 'rgba(240,212,165,0.14)'}} />)}
        <div style={{position: 'absolute', left: 36, right: 30, top: 150, display: 'flex', gap: 18, alignItems: 'flex-start', opacity: iv, filter: blurV(iv), transform: `scale(${pop.toFixed(3)})`, transformOrigin: '0% 50%'}}>
          <div style={{flex: 'none', width: 40, height: 40, marginTop: 4, borderRadius: 8, border: `2.5px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {left ? <svg width={30} height={30} viewBox="0 0 30 30"><path d="M5,15 L12,22 L26,6" stroke={GOLD} strokeWidth={4} fill="none" strokeDasharray={40} strokeDashoffset={40 * (1 - ease((f - S(at) - 6) / 8))} /></svg> : null}
          </div>
          <div style={{fontFamily: SUB, fontSize: 36, lineHeight: 1.35, color: '#f3efe6'}}>{item}</div>
        </div>
      </div>
    );
  };
  return (
    <div style={{position: 'absolute', left: 0, top: 720, width: W, height: 620, opacity: v, filter: blurV(v)}}>
      {col(true, lm, mine, tm)}
      {col(false, lt, theirs, tt)}
    </div>
  );
};

/* ============================== THẺ KHÁI NIỆM / CHƯƠNG ============================== */
const Concept: React.FC<{f: number; a: number; b: number; tag: string; title: string[]; en: string; sub: string}> = ({f, a, b, tag, title, en, sub}) => {
  const fa = S(a);
  const fb = S(b);
  if (f < fa - 2 || f > fb + 12) return null;
  const r = (d: number) => io(f, fa + d, fb, 12);
  const pop = 1 + 0.06 * Math.exp(-(f - fa) / 5);
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 640, textAlign: 'center'}}>
      <div style={{display: 'inline-block', fontFamily: SUB, fontSize: 24, color: RED_HOT, border: `1.5px solid ${RED}`, borderRadius: 999, padding: '4px 18px', opacity: r(0), filter: blurV(r(0))}}>{tag}</div>
      <div style={{marginTop: 26, fontFamily: SERIF, fontSize: 112, lineHeight: 1.12, color: F.text, textShadow: '0 0 34px rgba(255,240,215,0.25)', opacity: r(2), filter: blurV(r(2)), transform: `scale(${pop.toFixed(3)})`}}>
        {title.map((t, i) => <div key={i}>{t}</div>)}
      </div>
      <div style={{marginTop: 18, fontFamily: ITAL, fontStyle: 'italic', fontSize: 36, color: 'rgba(246,243,234,0.6)', opacity: r(10), filter: blurV(r(10))}}>{en}</div>
      <div style={{margin: '22px auto 0', width: 300 * ease((f - fa - 12) / 16), height: 3, background: `linear-gradient(90deg, rgba(216,57,43,0), ${RED}, rgba(216,57,43,0))`}} />
      <div style={{marginTop: 34, padding: '0 100px', fontFamily: SUB, fontSize: 42, lineHeight: 1.45, color: F.text, opacity: r(22), filter: blurV(r(22))}}>{sub}</div>
    </div>
  );
};

const Chapter: React.FC<{f: number; a: number; b: number; no: string; title: string; sub: string}> = ({f, a, b, no, title, sub}) => {
  const fa = S(a);
  const fb = S(b);
  if (f < fa - 2 || f > fb + 10) return null;
  const r = (d: number) => io(f, fa + d, fb, 10);
  const pop = 1 + 0.08 * Math.exp(-(f - fa) / 4);
  return (
    <div style={{position: 'absolute', left: cx - 300, top: 620, width: 600, height: 640, borderRadius: 30, border: '1.5px solid rgba(240,212,165,0.45)', background: 'rgba(26,20,15,0.7)', opacity: r(0), filter: blurV(r(0)), transform: `scale(${pop.toFixed(3)})`, textAlign: 'center'}}>
      <div style={{marginTop: 150, fontFamily: SUB, fontSize: 28, letterSpacing: '0.3em', color: 'rgba(246,243,234,0.55)'}}>{no}</div>
      <div style={{marginTop: 30, fontFamily: SERIF, fontSize: 132, lineHeight: 1.05, color: F.text, textShadow: '0 0 30px rgba(255,240,215,0.25)', opacity: r(3)}}>{title}</div>
      <div style={{margin: '30px auto 0', width: 220, height: 2, background: `linear-gradient(90deg, rgba(216,57,43,0), ${RED}, rgba(216,57,43,0))`}} />
      <div style={{marginTop: 26, fontFamily: SUB, fontSize: 28, color: 'rgba(246,243,234,0.6)', opacity: r(6)}}>{sub}</div>
    </div>
  );
};

const Foot: React.FC<{f: number; a: number; b: number; text: string}> = ({f, a, b, text}) => {
  const v = io(f, S(a), S(b), 12);
  if (v <= 0) return null;
  return <div style={{position: 'absolute', left: 0, width: W, top: 1690, textAlign: 'center', fontFamily: SUB, fontSize: 26, color: 'rgba(246,243,234,0.45)', opacity: v}}>{text}</div>;
};

/* ============================== SỔ GHI ============================== */
const Note: React.FC<{f: number; a: number; b: number; strike: number; write: number; l1: string; l2: string}> = ({f, a, b, strike, write, l1, l2}) => {
  const fa = S(a);
  const fb = S(b);
  if (f < fa - 2 || f > fb + 10) return null;
  const v = io(f, fa, fb, 9);
  const st = ease((f - S(strike)) / 12);
  const n1 = Math.round(l1.length * clamp01((f - fa - 6) / 30));
  const n2 = Math.round(l2.length * clamp01((f - S(write)) / 45));
  return (
    <div style={{position: 'absolute', left: cx - 400, top: 760, width: 800, height: 620, borderRadius: 18, background: 'linear-gradient(180deg,#2a221b,#1c1712)', border: '1.5px solid rgba(240,212,165,0.5)', boxShadow: '0 0 50px rgba(255,214,150,0.12)', opacity: v, filter: blurV(v), transform: `rotate(-1.5deg) scale(${(0.95 + 0.05 * v).toFixed(3)})`}}>
      <div style={{position: 'absolute', left: 40, right: 40, top: -18, display: 'flex', justifyContent: 'space-between'}}>
        {Array.from({length: 11}, (_, i) => <div key={i} style={{width: 16, height: 36, borderRadius: 8, border: '2px solid rgba(240,212,165,0.6)', background: '#120e0b'}} />)}
      </div>
      {[0, 1, 2, 3, 4].map((k) => <div key={k} style={{position: 'absolute', left: 50, right: 50, top: 150 + k * 96, height: 1.5, background: 'rgba(240,212,165,0.16)'}} />)}
      <div style={{position: 'absolute', left: 60, top: 92, fontFamily: SUB, fontSize: 40, color: st > 0 ? 'rgba(246,243,234,0.4)' : '#f3efe6'}}>
        <span style={{position: 'relative'}}>
          {l1.slice(0, n1)}
          <span style={{position: 'absolute', left: 0, top: '55%', height: 4, width: `${(st * 100).toFixed(1)}%`, background: RED_HOT, boxShadow: '0 0 10px rgba(255,70,50,0.8)'}} />
        </span>
      </div>
      <div style={{position: 'absolute', left: 60, right: 40, top: 284, fontFamily: SUB, fontSize: 44, lineHeight: 1.75, color: GOLD, textShadow: '0 0 18px rgba(242,196,109,0.4)'}}>{l2.slice(0, n2)}</div>
    </div>
  );
};

/* ============================== DỮ LIỆU ============================== */
const SLICES: {a: number; l: string; r: string}[] = [
  {a: 2, l: 'Ngành bố mẹ chọn', r: 'Ngành mình thích'},
  {a: 6, l: 'Im lặng', r: 'Nói ra'},
  {a: 10, l: 'Ở lại', r: 'Đi xa'},
  {a: 14, l: 'Bán', r: 'Giữ'},
];
const CHIPS: string[][] = [
  ['Chưa đi làm ngày nào', 'Bố mẹ lo cho mình'],
  ['Sợ mất tình bạn', 'Không biết người ấy nghĩ gì'],
  ['Mẹ đang ốm', 'Lương chưa chắc cao hơn'],
  ['Không ai biết giá sẽ lên', 'Đang cần tiền'],
];
const POLLS = SLICES.map((s) => ({a: BAR(s.a + 2) + 0.3, ch: MID(s.a + 3) - BP * 1.5, stamp: MID(s.a + 3), out: BAR(s.a + 4) - 0.4}));

/* ============================== SFX ============================== */
type Fx = [number, string, number];
const FX: Fx[] = [];
POLLS.forEach((p) => FX.push([p.stamp - 0.2, 'dropin', 0.45], [p.stamp, 'stamp', 1]));
SLICES.forEach((s, i) => { LIVES[i].lines.forEach((ln) => FX.push([BAR(s.a) + ln.at, 'type', 0.3])); FX.push([BAR(s.a + 2) + 0.25, 'type', 0.3]); });
CHIPS.forEach((_, i) => FX.push([BAR(32 + 2 * i) + 0.35, 'type', 0.28], [BAR(32 + 2 * i) + 1.05, 'type', 0.28]));
SLICES.forEach((s) => FX.push([BAR(s.a + 2) + 0.1, 'shimmer', 0.45], [BAR(s.a + 2), 'whoosh', 0.3]));
FX.push([DROP1, 'impact', 0.5], [DROP2, 'impact', 0.8], [DROP2 - 0.2, 'dropin', 0.5], [DROP2, 'stamp', 1]);
for (const k of [2, 6, 10, 14, 18, 22, 25, 31, 32, 34, 36, 38, 40, 42, 47, 50, 54, 58, 60, 62]) FX.push([BAR(k) - 0.2, 'whoosh', 0.3]);
FX.push(...[0, 1, 2, 3].map((i) => [BAR(18) + i * 0.25, 'pop', 0.45] as Fx), [BAR(18) + 0.6, 'shimmer', 0.45], [BAR(20) + 0.3, 'question', 0.35]);
FX.push(...[0, 1, 2, 3].map((i) => [BAR(40) + i * 0.25, 'pop', 0.4] as Fx));
FX.push([BAR(22), 'impact', 0.55], [BAR(22) + 0.2, 'shimmer', 0.35], [MID(27) - 0.6, 'riser', 0.35], [MID(27), 'impact', 0.5], [BAR(29) + 0.4, 'error', 0.3], [BAR(31), 'thud', 0.5], [BAR(31) + 0.05, 'impact', 0.4]);
[0, 1, 2, 3].forEach((i) => {
  const b = BAR(32 + 2 * i);
  FX.push([MID(32 + 2 * i) - 0.13, 'snap', 0.5], [MID(32 + 2 * i), 'shimmer', 0.45], [MID(32 + 2 * i), 'ding', 0.35]);
});
FX.push([BAR(42) + 0.4, 'heart', 0.35]);
FX.push([BAR(47) + 0.3, 'pop', 0.5], [BAR(47) + 0.55, 'click', 0.7], [BAR(48.5) + 0.2, 'thud', 0.55], [BAR(48.5) + 0.2, 'snap', 0.4]);
FX.push([BAR(50) + 0.5, 'curl', 0.35], [BAR(54) + 0.2, 'type', 0.4], [BAR(55) + 0.5, 'snip', 0.6], [BAR(56) + 0.05, 'type', 0.45], [BAR(57), 'type', 0.45]);
FX.push([MID(58) - 0.2, 'dropin', 0.5], [MID(58), 'stamp', 1], [MID(58), 'impact', 0.7], [BAR(60), 'sunrise', 0.55], [BAR(62) + 0.4, 'heal', 0.4]);
const GLOBAL = new Set(['paper', 'type', 'boing', 'error', 'snip', 'magic', 'confetti', 'shake', 'question']);
const fxSrc = (n: string) => (GLOBAL.has(n) ? `audio/sfx/${n}.wav` : `audio/ep60-troi-sap/sfx/${n}.wav`);

/* ============================== MAIN ============================== */
export const Ep62SuongMu: React.FC = () => {
  const f = useCurrentFrame();

  const hits = [...POLLS.map((p) => p.stamp), DROP1, DROP2, MID(58), BAR(22), MID(27)];
  let shake = 0;
  for (const h of hits) {
    const d = f - S(h);
    if (d >= 0 && d < 14) shake += Math.exp(-d / 3.5) * (h === DROP1 || h === BAR(22) || h === MID(27) ? 8 : 16);
  }
  const sx = shake * Math.sin(f * 2.3);
  const sy = shake * Math.cos(f * 3.1) * 0.7;

  const nodes: React.ReactNode[] = [];

  /* ---- Mở + 4 ngã rẽ ---- */
  nodes.push(<Scene key="s0" f={f} a={0} b={BAR(2)} kind="bed" y={960} size={900} clock="23:00" first />);
  SLICES.forEach((s, i) => {
    const hind = ease((f - S(BAR(s.a + 2))) / 14);
    nodes.push(
      <Scene key={`sl${i}`} f={f} a={BAR(s.a)} b={BAR(s.a + 4)} kind="life" y={960} size={900} p={{i, l: s.l, r: s.r, pick: 'L', fog: 0, clear: hind}}>
        <div style={{position: 'absolute', left: 0, top: 330}}>
          <Stamp f={f} land={S(POLLS[i].stamp)} out={S(BAR(s.a + 4)) - 4} />
        </div>
      </Scene>,
    );
    // nhãn tuổi
    const v = io(f, S(BAR(s.a)), S(BAR(s.a + 4)), 9);
    nodes.push(<div key={`age${i}`} style={{position: 'absolute', left: 0, width: W, top: 170, textAlign: 'center', fontFamily: SERIF, fontSize: 48, color: 'rgba(246,243,234,0.85)', opacity: v, filter: blurV(v)}}>{[17, 20, 23, 25][i]} tuổi</div>);
  });

  /* ---- Nhìn lại + khái niệm + thí nghiệm ---- */
  nodes.push(<Scene key="g1" f={f} a={BAR(18)} b={BAR(22)} kind="grid" y={960} gridFog={0} gridLit />);
  nodes.push(<Concept key="k1" f={f} a={BAR(22)} b={BAR(25) - 0.1} tag="HIỆN TƯỢNG" title={['Thiên kiến', 'nhìn lại']} en="Hindsight Bias" sub="Biết kết quả rồi, ta tưởng mình lẽ ra đã đoán được từ đầu." />);
  nodes.push(<Foot key="ft1" f={f} a={BAR(22) + 1.2} b={BAR(25) - 0.1} text="Baruch Fischhoff, 1975 · Journal of Experimental Psychology" />);
  nodes.push(<Bars key="bars" f={f} a={BAR(25)} b={BAR(31)} grow={MID(27)} />);
  nodes.push(<Foot key="ft2" f={f} a={BAR(25) + 0.6} b={BAR(31)} text="Fischhoff, 1975 · chiến tranh Anh – Gurkha 1814 · vẽ theo xu hướng kết quả" />);
  nodes.push(<Chapter key="c1" f={f} a={BAR(31)} b={BAR(32)} no="QUAY LẠI" title="Hôm đó" sub="đứng đúng chỗ mình từng đứng" />);

  /* ---- Lật dấu ---- */
  SLICES.forEach((s, i) => {
    const a = BAR(32 + 2 * i);
    nodes.push(
      <Scene key={`fl${i}`} f={f} a={a} b={a + 4 * BP * 2} kind="life" y={960} size={900} p={{i, l: s.l, r: s.r, pick: 'L', fog: 0.6, chips: CHIPS[i]}}>
        <div style={{position: 'absolute', left: 0, top: 330}}>
          <Flip f={f} at={S(MID(32 + 2 * i))} />
        </div>
      </Scene>,
    );
  });
  nodes.push(<Scene key="g2" f={f} a={BAR(40)} b={BAR(42)} kind="grid" y={960} gridFog={1} gridLit={false} />);
  nodes.push(
    <Scene key="fd" f={f} a={BAR(42)} b={BAR(47)} kind="walk" y={960} size={900} p={{l: '', r: '', pick: 'L', fog: 1}}>
      <div style={{position: 'absolute', left: 0, top: -170}}>
        <Stamp f={f} land={S(DROP2)} size={76} text="TRONG SƯƠNG MÙ" />
      </div>
    </Scene>,
  );

  /* ---- Hối tiếc + kết ---- */
  nodes.push(<TwoCol key="tc" f={f} a={BAR(47)} b={BAR(50)} lm="Trước mắt" lt="Cả đời" mine="Tiếc việc đã làm" theirs="Tiếc việc đã không làm" tm={BAR(47) + 0.3} tt={BAR(48.5) + 0.2} />);
  nodes.push(<Foot key="ft3" f={f} a={BAR(47) + 0.6} b={BAR(50)} text="Gilovich & Medvec, 1995 · Psychological Review" />);
  nodes.push(<Scene key="f5" f={f} a={BAR(50)} b={BAR(54)} kind="walk" y={960} size={900} p={{l: '', r: '', pick: 'R', fog: 0.8, walk: ease((f - S(BAR(50))) / 200) * 0.5}} />);
  nodes.push(<Note key="nt" f={f} a={BAR(54)} b={BAR(58)} strike={BAR(55) + 0.5} write={BAR(56)} l1="Lẽ ra mình phải biết." l2="Hồi đó, mình đã chọn tốt nhất với những gì mình biết." />);
  if (f >= S(BAR(58)) - 2 && f <= S(BAR(60)) + 10) {
    const fa = S(MID(58));
    nodes.push(
      <div key="big" style={{position: 'absolute', left: cx, top: 900, transform: 'translate(-50%,-50%)', opacity: f >= fa - 6 ? 1 - ease((f - S(BAR(60))) / 9) : 0}}>
        {f >= fa - 6 ? <Stamp f={f} land={fa} size={124} text="THA THỨ" /> : null}
      </div>,
    );
  }
  nodes.push(<Scene key="f6" f={f} a={BAR(60)} b={BAR(62)} kind="walk" y={960} size={900} p={{l: '', r: '', pick: 'R', fog: 0.7, lit: 'R', walk: 0.5 + ease((f - S(BAR(60))) / 120) * 0.4}} />);
  nodes.push(<Scene key="s11" f={f} a={BAR(62)} b={140} kind="sleep" y={960} size={900} clock="23:30" />);

  const endFade = 1 - ease((f - S(133.4)) / 30);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <FilBg f={f} w={W} h={H} tone="warm" glow={[50, 48]} strength={0.95} />
      <AbsoluteFill style={{transform: `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px)`, opacity: endFade}}>
        {nodes}
        {CAPS.map(([a, b, t], i) => <Caption key={i} f={f} a={a} b={b} text={t} />)}
      </AbsoluteFill>
      <FilGrain opacity={0.07} />
      <Audio src={staticFile(((getInputProps() as {bgm?: string}).bgm) || 'audio/ep60-troi-sap/bgm.wav')} volume={0.9} />
      {FX.map(([t, n, g], i) => (
        <Sequence key={i} from={Math.max(0, S(t))} durationInFrames={S(3.5)}>
          <Audio src={staticFile(fxSrc(n))} volume={g * 0.85} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/* ============================== BÌA (THUMBNAIL) ============================== */
const DISP = "'Ep62 Display', serif";
const coverDust = Array.from({length: 70}, (_, k) => {
  const a = Math.sin(k * 12.9898) * 43758.5453;
  const b = Math.sin(k * 78.233) * 12345.678;
  const fr = (x: number) => x - Math.floor(x);
  const ang = fr(a) * Math.PI * 2;
  const rad = 120 + fr(b) * 520;
  return {x: cx + Math.cos(ang) * rad, y: 960 + Math.sin(ang) * rad * 1.1, r: 1 + fr(a * 3) * 2.6, o: 0.15 + fr(b * 7) * 0.5};
});
export const Ep62Cover: React.FC = () => {
  const goldLine = 'linear-gradient(90deg, rgba(242,196,109,0), rgba(242,196,109,0.85), rgba(242,196,109,0))';
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #1a120c 0%, #0c0807 55%, #050303 100%)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: cx - 700, top: 960 - 700, width: 1400, height: 1400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,220,160,0.42) 0%, rgba(236,170,92,0.22) 26%, rgba(140,80,32,0.08) 48%, rgba(9,6,5,0) 66%)'}} />
      {[300, 400, 520].map((r, k) => (
        <div key={r} style={{position: 'absolute', left: cx - r, top: 960 - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `${k === 1 ? 2 : 1}px solid rgba(242,196,109,${[0.18, 0.3, 0.1][k]})`}} />
      ))}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        {coverDust.map((d, k) => <circle key={k} cx={d.x} cy={d.y} r={d.r} fill="#ffdca0" opacity={d.o} />)}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28}}>
        <div style={{width: 110, height: 2, background: goldLine}} />
        <div style={{fontFamily: SUB, fontSize: 32, letterSpacing: 12, color: 'rgba(242,196,109,0.9)'}}>TÂM LÝ HỌC</div>
        <div style={{width: 110, height: 2, background: goldLine}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', whiteSpace: 'nowrap'}}>
        <div style={{fontFamily: DISP, fontWeight: 500, fontSize: 92, lineHeight: 1.22, color: '#f6efe2', textShadow: '0 4px 30px rgba(0,0,0,0.8)'}}>
          Vì sao nhìn lại,<br />ta luôn thấy mình
        </div>
        <div style={{marginTop: 6, fontFamily: DISP, fontWeight: 900, fontSize: 200, lineHeight: 1.05, letterSpacing: 2, color: RED_HOT, textShadow: '0 0 30px rgba(255,70,45,0.65), 0 0 90px rgba(255,50,30,0.35)'}}>
          đã sai?
        </div>
      </div>
      <div style={{position: 'absolute', left: cx - 160, top: 1250, width: 320, height: 2, background: goldLine}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1285, textAlign: 'center', fontFamily: DISP, fontStyle: 'italic', fontWeight: 400, fontSize: 46, color: 'rgba(242,196,109,0.92)'}}>Thiên kiến nhìn lại</div>
      <FilGrain opacity={0.06} />
    </AbsoluteFill>
  );
};
