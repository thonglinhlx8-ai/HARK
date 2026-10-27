import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp01, rand} from '../../library/anim';
import {FilBg, FilGrain} from '../../library/filament/stage';
import {ease, F} from '../../library/filament/theme';
import {E4, E8, H, S, W} from './timeline';

/**
 * ep60 Trời sập — dựng lại 1:1 nhịp bản gốc (#vibe知识大赏, Nico), chữ tiếng Việt.
 * 1 năm lát cắt tuổi (trắc nghiệm "Chuyện lớn không?" → dấu TRỜI SẬP) → 2 "Sau đó thì sao?" lật dấu thành "Chuyện nhỏ" mỗi 2 ô nhịp
 * → 3 trục tuổi → 4 thẻ HIỆN TƯỢNG + nghiên cứu biên chế → 5 thẻ GIẢI THÍCH + trích dẫn → 6 tám ô đời sống ép nhỏ (drop 2)
 * → 7 thẻ PHƯƠNG PHÁP + bản thân 36 tuổi → 8 trục 8→80, chấm "bạn bây giờ" hoá khăn quàng đỏ.
 */

const SUB = "'Ep60 Sub', 'Filament Viet', sans-serif";
const SERIF = "'Filament Viet Black', 'Filament Viet', serif";
const SERIF_M = "'Filament Viet', serif";
const ITAL = "'Ep60 Ital', 'Filament Viet Display', serif";
if (typeof document !== 'undefined') {
  const h = delayRender('ep60 fonts');
  Promise.all([
    new FontFace('Ep60 Sub', `url(${staticFile('fonts/ep58/BeVietnamPro-ExtraBold.ttf')})`).load().then((l) => document.fonts.add(l)),
    new FontFace('Ep60 Ital', `url(${staticFile('fonts/ep58/PlayfairDisplay.ttf')})`, {style: 'normal'}).load().then((l) => document.fonts.add(l)),
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

/* ============================== MỐC THỜI GIAN (giây, = bản gốc) ============================== */
type Kind = 'scarf' | 'class' | 'rank' | 'phone' | 'pitch';
const VIG: {cap: string; a: number; b: number; stamp: number; kind: Kind}[] = [
  {cap: '8 tuổi, quên đeo 【khăn quàng đỏ】.', a: 0, b: 6.55, stamp: E8(2.2), kind: 'scarf'},
  {cap: '14 tuổi, chưa làm xong bài tập.', a: 7.15, b: 11.75, stamp: E8(9.87), kind: 'class'},
  {cap: '17 tuổi, thi thử tụt 【80 hạng】.', a: 12.05, b: 16.55, stamp: E8(14.13), kind: 'rank'},
  {cap: '22 tuổi, trượt phỏng vấn.', a: 17.07, b: 21.6, stamp: E8(19.07), kind: 'phone'},
  {cap: '26 tuổi, phương án bị trả về.', a: 21.95, b: 26.2, stamp: E8(25.83), kind: 'pitch'},
];
const choose = (i: number) => VIG[i].stamp - 0.8;
const FL0 = E8(29.314);
const FLIP_STEP = 4 * 2 * 0.53163; // 2 ô nhịp
const FLIPS = [
  {cap: 'Cô chỉ nói một câu: lần sau nhớ đeo.', kind: 'class' as Kind, alt: 'teacher'},
  {cap: 'Bài tập, hôm sau nộp bù.', kind: 'class' as Kind, alt: 'after'},
  {cap: 'Kỳ thi thử sau, gỡ lại.', kind: 'rank' as Kind, alt: 'after'},
  {cap: 'Sau đó, tìm được công việc hợp hơn.', kind: 'phone' as Kind, alt: 'after'},
].map((x, i) => ({...x, t: FL0 + i * FLIP_STEP, flip: FL0 + i * FLIP_STEP + 4 * 0.53163}));
const DROP1 = 17.07;
const DROP2 = 93.36; // bass vào thật ở 93,36 s (đo dải <150 Hz)

/** Phụ đề: [vào, ra, chữ]. 【…】 = chữ đỏ. */
const CAPS: [number, number, string][] = [
  ...VIG.map((v, i) => [i === 0 ? -2 : v.a + 0.05, v.b - 0.15, v.cap] as [number, number, string]),
  [E8(27.6), FL0 - 0.2, 'Sau đó thì sao?'],
  ...FLIPS.map((x, i) => [x.t, (i < 3 ? FLIPS[i + 1].t : 46.2) - 0.2, x.cap] as [number, number, string]),
  [47.5, 50.3, 'Bốn chuyện trước, giờ nghĩ lại đều thấy buồn cười.'],
  [50.6, 54.3, 'Nhưng chuyện trước mắt, cậu ấy vẫn thấy: 【lần này khác】.'],
  [54.6, 57.8, 'Cảm giác "không qua nổi" này, các nhà tâm lý học đã đo rồi.'],
  [62.0, 65.7, 'Thí nghiệm: giảng viên đại học trẻ đang chờ xét 【biên chế】.'],
  [66.0, 69.8, 'Trượt biên chế gần như đồng nghĩa phải rời trường.'],
  [70.2, 75.5, 'Hỏi trước kết quả: nếu trượt, 5 năm tới bạn vui cỡ nào? Họ đoán: 【buồn hơn hẳn】.'],
  [75.8, 79.7, 'Mấy năm sau đo lại: người trượt vui 【gần bằng】 người đậu.'],
  [80.3, 83.6, 'Vì sao lúc đó lại thấy như 【trời sập】?'],
  [93.5, 98.8, 'Nhưng cuộc sống không dừng lại. Những chuyện sau này sẽ lần lượt chen vào,'],
  [99.1, 103.0, 'ép nó thành 【một ô thật nhỏ】.'],
  [103.4, 106.8, 'Nhìn quá gần thì nó phóng to. Vậy hãy chủ động 【lùi ra】.'],
  [111.3, 115.6, 'Khi bị kẹt, tự hỏi: mười năm sau, mình sẽ nhìn hôm nay thế nào?'],
  [115.9, 119.7, 'Nghiên cứu cho thấy: người nghĩ như vậy 【đỡ khổ hơn】.'],
  [121.3, 125.0, 'Từ 8 đến 22 tuổi, trời sập bốn lần, đường 【chưa đứt lần nào】.'],
  [125.3, 128.7, 'Dung sai của cuộc đời 【lớn hơn nhiều】 so với bạn tưởng lúc trời sập.'],
  [129.0, 133.6, 'Chuyện bây giờ, sau này nhìn lại, cũng sẽ như chiếc 【khăn quàng đỏ】 hồi tiểu học.'],
];

/* ============================== PHỤ ĐỀ ============================== */
const Caption: React.FC<{f: number; a: number; b: number; text: string; top?: number}> = ({f, a, b, text, top = 300}) => {
  const fa = S(a);
  const fb = S(b);
  if (f < fa - 2 || f > fb + 10) return null;
  const words: {w: string; hi: boolean}[] = [];
  let hi = false;
  for (const raw of text.split(' ')) {
    let w = raw;
    const open = w.includes('【');
    if (open) hi = true;
    const close = w.includes('】');
    w = w.replace(/[【】]/g, '');
    words.push({w, hi});
    if (close) hi = false;
  }
  const out = 1 - ease((f - fb) / 9);
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top, textAlign: 'center', fontFamily: SUB, fontSize: 54, lineHeight: 1.45, color: F.text, opacity: out, filter: blurV(out)}}>
      {words.map((x, i) => {
        const v = ease((f - fa - i * 2.2) / 8);
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

/* ============================== ĐỒ HOẠ LINE-ART ============================== */
const Defs: React.FC = () => (
  <defs>
    <linearGradient id="e60body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#6a5643" />
      <stop offset="0.45" stopColor="#3a2f26" />
      <stop offset="1" stopColor="#15110d" />
    </linearGradient>
    <linearGradient id="e60bust" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2c241e" />
      <stop offset="1" stopColor="#120e0b" />
    </linearGradient>
    <radialGradient id="e60spot" cx="0.5" cy="0.3" r="0.7">
      <stop offset="0" stopColor="rgba(255,214,150,0.22)" />
      <stop offset="1" stopColor="rgba(255,214,150,0)" />
    </radialGradient>
  </defs>
);

const Person: React.FC<{x: number; y: number; s?: number; arm?: number; book?: boolean; paper?: boolean; scarf?: boolean; dim?: number}> = ({x, y, s = 1, arm, book, paper, scarf, dim = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={dim}>
    <path d="M-16,0 L-15,62 M16,0 L15,62" stroke="#2a221b" strokeWidth={13} strokeLinecap="round" />
    <path d="M-16,0 L-15,62 M16,0 L15,62" stroke={LINE_DIM} strokeWidth={1.2} fill="none" />
    <path d="M-36,4 L-31,-78 Q-28,-108 0,-110 Q28,-108 31,-78 L36,4 Z" fill="url(#e60body)" stroke={LINE} strokeWidth={1.5} />
    <circle cx={0} cy={-133} r={21} fill="url(#e60body)" stroke={LINE} strokeWidth={1.5} />
    {arm !== undefined ? <path d={`M26,-96 L${26 + 64 * Math.cos(arm)},${-96 - 64 * Math.sin(arm)}`} stroke="#4a3c30" strokeWidth={11} strokeLinecap="round" /> : null}
    {book ? <rect x={10} y={-80} width={40} height={30} fill="#efe6d2" stroke={LINE} strokeWidth={1} transform="rotate(-8)" /> : null}
    {paper ? <rect x={14} y={-58} width={24} height={30} fill="#efe6d2" opacity={0.9} /> : null}
    {scarf ? <path d="M0,-108 L-9,-72 L-3,-71 L0,-90 L3,-71 L9,-72 Z" fill={RED} /> : null}
  </g>
);

const Head: React.FC<{x: number; y: number; s?: number; scarf?: boolean}> = ({x, y, s = 1, scarf}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-34,40 Q-32,0 0,-2 Q32,0 34,40 Z" fill="url(#e60body)" stroke={LINE} strokeWidth={1.3} />
    <circle cx={0} cy={-22} r={19} fill="url(#e60body)" stroke={LINE} strokeWidth={1.3} />
    {scarf ? <path d="M-14,4 L0,14 L14,4 L6,30 L0,18 L-6,30 Z" fill={RED} opacity={0.9} /> : null}
  </g>
);

const ScarfIcon: React.FC<{x: number; y: number; s?: number; o?: number}> = ({x, y, s = 1, o = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o} style={{filter: 'drop-shadow(0 0 6px rgba(255,80,60,0.8))'}}>
    <path d="M-14,-8 L14,-8 L4,2 L13,20 L5,20 L0,8 L-5,20 L-13,20 L-4,2 Z" fill={RED} stroke={RED_HOT} strokeWidth={1} />
  </g>
);

/** Cảnh vẽ trong hệ toạ độ -320..320 */
const Art: React.FC<{kind: Kind; alt?: string; f: number}> = ({kind, alt, f}) => {
  const after = alt === 'after';
  if (kind === 'scarf') {
    return (
      <g>
        <ellipse cx={0} cy={-60} rx={300} ry={260} fill="url(#e60spot)" />
        <path d="M-300,320 L-280,90 Q-262,12 -120,-8 L120,-8 Q262,12 280,90 L300,320" fill="url(#e60bust)" stroke={LINE} strokeWidth={2} />
        <rect x={-38} y={-60} width={76} height={60} fill="url(#e60bust)" stroke={LINE} strokeWidth={2} />
        <circle cx={0} cy={-150} r={100} fill="url(#e60bust)" stroke={LINE} strokeWidth={2.2} />
        <path d="M-78,-8 L-6,44 L-46,74 Z M78,-8 L6,44 L46,74 Z" fill="#1a1511" stroke="rgba(255,240,220,0.85)" strokeWidth={2} />
        <path d="M0,46 L-52,236 L-18,246 L0,104 L18,246 L52,236 Z" fill="rgba(216,57,43,0.10)" stroke={RED} strokeWidth={3} strokeDasharray="12 9" strokeDashoffset={-f * 0.6} style={{filter: 'drop-shadow(0 0 8px rgba(255,70,50,0.8))'}} />
      </g>
    );
  }
  if (kind === 'class') {
    if (alt === 'teacher') {
      return (
        <g>
          <ellipse cx={0} cy={-80} rx={280} ry={230} fill="url(#e60spot)" />
          <rect x={-250} y={-250} width={500} height={34} fill="#2a221b" stroke={LINE} strokeWidth={1.5} />
          <rect x={-60} y={-286} width={120} height={36} rx={6} fill="#1d1813" stroke={LINE} strokeWidth={1.4} />
          <rect x={-215} y={-200} width={430} height={200} fill="#14100d" stroke={LINE_DIM} strokeWidth={1.4} />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={-190 + i * 100} y={-160} width={70} height={60} fill="#2a241e" stroke={LINE_DIM} />)}
          <Person x={0} y={-10} s={1.15} arm={2.6} />
          {[-200, -120, -40, 40, 120, 200].map((x, i) => <Head key={i} x={x} y={200} s={1.05} scarf={i === 4} />)}
          <rect x={-300} y={250} width={600} height={70} fill="#120e0b" />
        </g>
      );
    }
    return (
      <g>
        <ellipse cx={0} cy={-40} rx={300} ry={260} fill="url(#e60spot)" />
        <rect x={-170} y={-280} width={340} height={140} fill="#14100d" stroke={LINE} strokeWidth={1.6} />
        {[0, 1, 2].map((i) => <line key={i} x1={-140} x2={-140 + 220 - i * 50} y1={-245 + i * 30} y2={-245 + i * 30} stroke={LINE_DIM} strokeWidth={3} />)}
        {[0, 1, 2].map((r) =>
          [-1, 0, 1].map((c) => {
            const x = c * (150 + r * 25);
            const y = -90 + r * 115;
            const mine = r === 2 && c === 1;
            return (
              <g key={`${r}${c}`}>
                <Person x={x} y={y + 6} s={0.42 + r * 0.06} />
                <rect x={x - 55 - r * 8} y={y} width={110 + r * 16} height={34} fill="#221b15" stroke={LINE} strokeWidth={1.3} />
                <path d={`M${x - 55 - r * 8},${y + 34} L${x - 55 - r * 8},${y + 90} M${x + 55 + r * 8},${y + 34} L${x + 55 + r * 8},${y + 90}`} stroke={LINE_DIM} strokeWidth={1.3} />
                {mine ? (
                  <g>
                    <rect x={x - 32} y={y - 18} width={64} height={30} fill="#f2ead8" stroke="#fff" strokeWidth={1} />
                    <line x1={x} x2={x} y1={y - 18} y2={y + 12} stroke="#998" strokeWidth={1} />
                    {after ? <path d={`M${x + 4},${y - 4} L${x + 13},${y + 6} L${x + 28},${y - 14}`} stroke={RED} strokeWidth={4} fill="none" /> : null}
                  </g>
                ) : null}
              </g>
            );
          }),
        )}
        <Person x={240} y={30} s={1} book />
      </g>
    );
  }
  if (kind === 'rank') {
    const hy = after ? -170 : -10;
    return (
      <g>
        <ellipse cx={0} cy={-80} rx={280} ry={240} fill="url(#e60spot)" />
        <rect x={-170} y={-290} width={340} height={330} fill="#14100d" stroke={LINE} strokeWidth={1.8} />
        <line x1={-60} x2={60} y1={-266} y2={-266} stroke="rgba(255,240,220,0.8)" strokeWidth={4} />
        {Array.from({length: 26}, (_, i) => {
          const y = -240 + i * 10.5;
          return (
            <g key={i}>
              <line x1={-150} x2={-20 - rand(i) * 30} y1={y} y2={y} stroke={LINE_DIM} strokeWidth={2} />
              <line x1={10} x2={140 - rand(i + 4) * 30} y1={y} y2={y} stroke={LINE_DIM} strokeWidth={2} />
            </g>
          );
        })}
        <rect x={-160} y={hy - 9} width={320} height={18} rx={9} fill={after ? 'rgba(242,196,109,0.22)' : 'rgba(216,57,43,0.22)'} stroke={after ? GOLD : RED} strokeWidth={2.5} style={{filter: `drop-shadow(0 0 8px ${after ? 'rgba(242,196,109,0.8)' : 'rgba(255,70,50,0.8)'})`}} />
        <text x={150} y={hy - 18} textAnchor="end" fontFamily={SUB} fontSize={22} fill={after ? GOLD : RED_HOT}>{after ? '↑' : '↓80'}</text>
        {[-150, -75, 0, 75].map((x, i) => <Person key={i} x={x} y={150} s={0.62} />)}
        <Person x={230} y={170} s={0.9} />
      </g>
    );
  }
  if (kind === 'phone') {
    return (
      <g>
        <ellipse cx={0} cy={-60} rx={260} ry={240} fill={after ? 'url(#e60spot)' : 'rgba(80,110,160,0.06)'} />
        <rect x={-290} y={-190} width={130} height={150} fill="#16130f" stroke={LINE_DIM} strokeWidth={1.5} />
        <line x1={-225} x2={-225} y1={-190} y2={-40} stroke={LINE_DIM} />
        <line x1={-290} x2={-160} y1={-115} y2={-115} stroke={LINE_DIM} />
        <rect x={-210} y={130} width={460} height={26} fill="#221b15" stroke={LINE} strokeWidth={1.3} />
        <path d="M-180,156 L-180,300 M220,156 L220,300" stroke={LINE_DIM} strokeWidth={1.5} />
        <rect x={-110} y={-250} width={220} height={330} rx={30} fill={after ? '#262019' : '#1a2230'} stroke={LINE} strokeWidth={2.2} style={{filter: 'drop-shadow(0 0 20px rgba(150,180,230,0.25))'}} />
        <text x={0} y={-150} textAnchor="middle" fontFamily={SERIF_M} fontSize={58} fill="#f3efe6">{after ? '09:30' : '23:47'}</text>
        {after ? (
          <g>
            <rect x={-92} y={-110} width={184} height={74} rx={12} fill="#3a3128" stroke={LINE} />
            <text x={-78} y={-82} fontFamily={SUB} fontSize={15} fill={GOLD}>Thư mời nhận việc</text>
            <text x={-78} y={-56} fontFamily={SUB} fontSize={13} fill="#f3efe6">Chúc mừng, bạn đã trúng tuyển.</text>
          </g>
        ) : null}
      </g>
    );
  }
  // pitch
  return (
    <g>
      <ellipse cx={0} cy={-90} rx={280} ry={220} fill="url(#e60spot)" />
      <rect x={-185} y={-270} width={370} height={220} fill="#14100d" stroke={LINE} strokeWidth={2} />
      <line x1={-155} x2={-60} y1={-240} y2={-240} stroke="rgba(255,240,220,0.75)" strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-120 + i * 52} y={-150 - [40, 75, 55, 95][i]} width={30} height={[40, 75, 55, 95][i] + 60} fill="none" stroke={LINE_DIM} strokeWidth={2} />)}
      {[0, 1, 2].map((i) => <line key={i} x1={80} x2={160} y1={-200 + i * 22} y2={-200 + i * 22} stroke={LINE_DIM} strokeWidth={2} />)}
      <ellipse cx={5} cy={-160} rx={160} ry={88} fill="none" stroke={RED} strokeWidth={4} transform="rotate(-4)" style={{filter: 'drop-shadow(0 0 8px rgba(255,70,50,0.8))'}} />
      <text x={150} y={-85} textAnchor="middle" fontFamily={SUB} fontSize={30} fill={RED_HOT} transform="rotate(-8 150 -85)">LÀM LẠI</text>
      <rect x={-200} y={60} width={400} height={14} fill="#221b15" stroke={LINE} strokeWidth={1.2} />
      <Person x={-235} y={80} s={1} arm={0.35} />
      {[-120, -40, 40, 120].map((x, i) => <Head key={i} x={x} y={150} s={0.95} />)}
      <Person x={245} y={80} s={1.05} />
    </g>
  );
};

/* ============================== DẤU ĐỎ / VIÊN "CHUYỆN NHỎ" ============================== */
const Stamp: React.FC<{f: number; land: number; size?: number; out?: number; label?: boolean; instant?: boolean}> = ({f, land, size = 92, out, label, instant}) => {
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
      {l >= 0 && ring < 1 && !instant ? <div style={{position: 'absolute', left: '50%', top: '50%', width: size * 5 * (0.5 + ring), height: size * 1.9 * (0.5 + ring), transform: 'translate(-50%,-50%)', borderRadius: '50%', border: `3px solid ${RED}`, opacity: (1 - ring) * 0.7}} /> : null}
      <div style={{whiteSpace: 'nowrap', fontFamily: SERIF, fontSize: size, lineHeight: 1, color: RED, padding: `${size * 0.14}px ${size * 0.26}px`, border: `${size * 0.06}px solid ${RED}`, borderRadius: size * 0.12, background: 'rgba(40,6,4,0.55)', transform: `scale(${sc.toFixed(4)}) rotate(-7deg)`, filter: l < 0 ? `blur(${((1 - fall) * 14).toFixed(1)}px)` : undefined, textShadow: `0 0 ${size * 0.3}px rgba(255,60,40,0.85)`, boxShadow: `0 0 ${size * 0.4}px rgba(255,50,30,0.55), inset 0 0 ${size * 0.25}px rgba(255,50,30,0.35)`}}>
        TRỜI SẬP
      </div>
      {label ? (
        <div style={{position: 'absolute', left: '50%', top: '100%', marginTop: size * 0.18, transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: SUB, fontSize: size * 0.24, color: '#fff', background: 'rgba(20,14,10,0.9)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 6, padding: '3px 10px', opacity: ease((f - land - 8) / 8)}}>hồi đó</div>
      ) : null}
    </div>
  );
};

const Pill: React.FC<{f: number; at: number; size?: number}> = ({f, at, size = 44}) => {
  const t = (f - at) / 9;
  if (t < 0) return null;
  const v = clamp01(t);
  const sc = v < 1 ? 0.5 + 0.62 * ease(v) : 1 + 0.12 * Math.exp(-(f - at - 9) / 4) * Math.cos((f - at - 9) * 0.9);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(-50%,-50%) scale(${Math.min(sc, 1.12).toFixed(3)})`, opacity: v, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: size * 0.4, padding: `${size * 0.32}px ${size * 0.6}px`, borderRadius: 999, background: 'rgba(250,244,232,0.12)', border: '1.5px solid rgba(255,248,235,0.75)', boxShadow: '0 0 30px rgba(255,236,200,0.35)', backdropFilter: 'blur(2px)'}}>
      <span style={{fontFamily: SUB, fontSize: size, color: '#fff'}}>Chuyện nhỏ</span>
      <span style={{width: 1.5, height: size * 0.9, background: 'rgba(255,255,255,0.5)'}} />
      <span style={{fontFamily: SUB, fontSize: size * 0.62, color: 'rgba(255,255,255,0.7)'}}>trời không sập</span>
    </div>
  );
};

/* ============================== THẺ CẢNH ============================== */
const Card: React.FC<{size: number; x: number; y: number; kind: Kind; alt?: string; f: number; frame?: number; o?: number; children?: React.ReactNode; scale?: number}> = ({size, x, y, kind, alt, f, frame = 1, o = 1, children}) => (
  <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, opacity: o, borderRadius: size * 0.05, border: frame > 0 ? `1.5px solid rgba(240,212,165,${0.45 * frame})` : undefined, background: frame > 0 ? `rgba(26,20,15,${0.75 * frame})` : undefined, boxShadow: frame > 0 ? `0 0 ${size * 0.08}px rgba(240,200,140,${0.12 * frame})` : undefined, overflow: frame > 0.5 ? 'hidden' : 'visible'}}>
    <svg width={size} height={size} viewBox="-320 -320 640 640" style={{position: 'absolute', overflow: 'visible'}}>
      <Defs />
      <Art kind={kind} alt={alt} f={f} />
    </svg>
    <div style={{position: 'absolute', left: '50%', top: '58%'}}>{children}</div>
  </div>
);

/* ============================== TRẮC NGHIỆM ============================== */
const Poll: React.FC<{f: number; a: number; ch: number; out: number}> = ({f, a, ch, out}) => {
  const v = io(f, S(a), S(out), 8);
  if (v <= 0) return null;
  const pressed = f >= S(ch);
  const pt = f - S(ch);
  const num = f < S(ch) - S(0.53) ? 2 : 1;
  const btn = (txt: string, on: boolean, dim: boolean): React.CSSProperties => ({width: 168, height: 70, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SUB, fontSize: 34, color: dim ? 'rgba(255,255,255,0.35)' : '#fff', border: on ? 'none' : '1.5px solid rgba(255,255,255,0.45)', background: on ? 'linear-gradient(180deg,#ff5a46,#c8261b)' : 'rgba(255,255,255,0.05)', boxShadow: on ? '0 0 34px rgba(255,60,40,0.75)' : undefined});
  const press = pressed ? 1 + 0.14 * Math.exp(-pt / 3) * Math.cos(pt * 1.2) - (pt < 2 ? 0.1 : 0) : 1;
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 1280, opacity: v, filter: blurV(v), textAlign: 'center'}}>
      <div style={{fontFamily: SUB, fontSize: 40, color: F.text, textShadow: '0 2px 10px #000'}}>Chuyện lớn không?</div>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 34, marginTop: 30}}>
        <div style={btn('Nhỏ', false, pressed)}>Nhỏ</div>
        <div style={{width: 54, height: 54, borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SUB, fontSize: 26, color: '#fff', opacity: pressed ? 0.25 : 1}}>{num}</div>
        <div style={{...btn('Lớn', pressed, false), transform: `scale(${press.toFixed(3)})`}}>Lớn</div>
      </div>
    </div>
  );
};

/* ============================== THẺ KHÁI NIỆM / TRÍCH DẪN ============================== */
const Concept: React.FC<{f: number; a: number; b: number; tag: string; title: string[]; en: string; sub: string}> = ({f, a, b, tag, title, en, sub}) => {
  const fa = S(a);
  const fb = S(b);
  if (f < fa - 2 || f > fb + 12) return null;
  const r = (d: number) => io(f, fa + d, fb, 12);
  const pop = 1 + 0.06 * Math.exp(-(f - fa) / 5);
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 760, textAlign: 'center'}}>
      <div style={{display: 'inline-block', fontFamily: SUB, fontSize: 24, color: RED_HOT, border: `1.5px solid ${RED}`, borderRadius: 999, padding: '4px 18px', opacity: r(0), filter: blurV(r(0))}}>{tag}</div>
      <div style={{marginTop: 26, fontFamily: SERIF, fontSize: 104, lineHeight: 1.12, color: F.text, textShadow: '0 0 34px rgba(255,240,215,0.25)', opacity: r(2), filter: blurV(r(2)), transform: `scale(${pop.toFixed(3)})`}}>
        {title.map((t, i) => <div key={i}>{t}</div>)}
      </div>
      <div style={{marginTop: 18, fontFamily: ITAL, fontStyle: 'italic', fontSize: 34, color: 'rgba(246,243,234,0.6)', opacity: r(10), filter: blurV(r(10))}}>{en}</div>
      <div style={{margin: '22px auto 0', width: 300 * ease((f - fa - 12) / 16), height: 3, background: `linear-gradient(90deg, rgba(216,57,43,0), ${RED}, rgba(216,57,43,0))`}} />
      <div style={{marginTop: 34, padding: '0 90px', fontFamily: SUB, fontSize: 40, lineHeight: 1.45, color: F.text, opacity: r(22), filter: blurV(r(22))}}>{sub}</div>
    </div>
  );
};

const Foot: React.FC<{f: number; a: number; b: number; text: string}> = ({f, a, b, text}) => {
  const v = io(f, S(a), S(b), 12);
  if (v <= 0) return null;
  return <div style={{position: 'absolute', left: 0, width: W, top: 1690, textAlign: 'center', fontFamily: SUB, fontSize: 24, color: 'rgba(246,243,234,0.42)', opacity: v}}>{text}</div>;
};

/* ============================== BIỂU ĐỒ ============================== */
const Bars: React.FC<{f: number; at: number; x: number; title: string; h: [number, number]; o: number; note: string; noteC: string}> = ({f, at, x, title, h, o, note, noteC}) => {
  const g = (d: number) => ease((f - S(at) - d) / 22);
  const nv = ease((f - S(at) - 40) / 10);
  return (
    <div style={{position: 'absolute', left: x - 200, top: 900, width: 400, height: 640, opacity: o}}>
      <div style={{textAlign: 'center', fontFamily: SUB, fontSize: 46, color: F.text, opacity: g(0)}}>{title}</div>
      <div style={{textAlign: 'center', fontFamily: SUB, fontSize: 26, color: 'rgba(246,243,234,0.6)', marginTop: 6, opacity: g(0)}}>mức vui 5 năm sau</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: SUB, fontSize: 36, color: noteC, opacity: nv, transform: `scale(${(1 + 0.15 * Math.exp(-(f - S(at) - 40) / 4) * (nv > 0 ? 1 : 0)).toFixed(3)})`, textShadow: '0 0 18px rgba(0,0,0,0.9)'}}>{note}</div>
      <div style={{position: 'absolute', left: 30, right: 30, top: 560, height: 1.5, background: LINE_DIM}} />
      {[0, 1].map((i) => (
        <div key={i}>
          <div style={{position: 'absolute', left: 80 + i * 150, width: 90, top: 560 - 420 * h[i] * g(6 + i * 8), height: 420 * h[i] * g(6 + i * 8), borderRadius: '6px 6px 0 0', background: i === 0 ? 'linear-gradient(180deg,#f6efe0,#cfc5b0)' : 'linear-gradient(180deg,#ef4a3a,#a8231a)', boxShadow: i === 0 ? '0 0 24px rgba(255,240,215,0.25)' : '0 0 24px rgba(255,60,40,0.4)'}} />
          <div style={{position: 'absolute', left: 60 + i * 150, width: 130, top: 576, textAlign: 'center', fontFamily: SUB, fontSize: 26, color: 'rgba(246,243,234,0.7)'}}>{i === 0 ? 'Đậu' : 'Trượt'}</div>
        </div>
      ))}
    </div>
  );
};

/* ============================== Ô ĐỜI SỐNG ============================== */
const ICONS: [string, string][] = [
  ['Dự án mới', 'M-12,-16 h24 v32 h-24 Z M-6,-6 h12 M-6,2 h12 M-6,10 h7'],
  ['Cuối tuần', 'M0,-7 a7,7 0 1,0 0.01,0 M0,-18 v5 M0,13 v5 M-18,0 h5 M13,0 h5 M-13,-13 l3.5,3.5 M9.5,9.5 l3.5,3.5 M13,-13 l-3.5,3.5 M-9.5,9.5 l-3.5,3.5'],
  ['Bạn bè', 'M-8,-8 a6,6 0 1,0 0.01,0 M8,-8 a6,6 0 1,0 0.01,0 M-18,14 q10,-16 20,0 M-2,14 q10,-16 20,0'],
  ['Cơ hội mới', 'M-10,-18 h20 v36 h-20 Z M-10,-18 l12,6 v36 l-12,-6 M0,0 h2'],
  ['', ''],
  ['Du lịch', 'M-18,14 l12,-20 l8,10 l6,-8 l10,18 Z M8,-12 a4,4 0 1,0 0.01,0'],
  ['Bữa ăn ngon', 'M-16,0 h32 q0,14 -16,14 q-16,0 -16,-14 Z M-6,-6 q-3,-5 0,-10 M2,-6 q-3,-5 0,-10 M10,-6 q-3,-5 0,-10'],
  ['Gia đình', 'M-16,0 l16,-14 l16,14 M-12,-2 v16 h24 v-16 M-4,14 v-8 h8 v8'],
  ['Sở thích mới', 'M-6,10 a5,4 0 1,1 0.01,0 M-1,10 v-24 l14,-4 v20 M13,6 a5,4 0 1,1 0.01,0'],
];
const TILE = 176;
const GAP = 16;
const tilePos = (i: number) => [cx + ((i % 3) - 1) * (TILE + GAP), 1000 + (Math.floor(i / 3) - 1) * (TILE + GAP)];
const Tile: React.FC<{i: number; v: number}> = ({i, v}) => {
  const [x, y] = tilePos(i);
  const [label, d] = ICONS[i];
  return (
    <div style={{position: 'absolute', left: x - TILE / 2, top: y - TILE / 2, width: TILE, height: TILE, borderRadius: 18, border: '1.5px solid rgba(240,212,165,0.55)', background: 'rgba(30,24,18,0.85)', opacity: v, transform: `scale(${(0.6 + 0.4 * v).toFixed(3)})`, filter: blurV(v), boxShadow: '0 0 18px rgba(240,200,140,0.12)'}}>
      <svg width={TILE} height={TILE} viewBox="-50 -50 100 100" style={{position: 'absolute'}}>
        <path d={d} transform="translate(0,-10) scale(1.3)" fill="none" stroke="rgba(246,238,222,0.9)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 20, textAlign: 'center', fontFamily: SUB, fontSize: 20, color: 'rgba(246,243,234,0.85)'}}>{label}</div>
    </div>
  );
};

/* ============================== TRỤC TUỔI ============================== */
const ageY = (age: number, top: number, bot: number, maxAge: number) => bot - ((age - 8) / (maxAge - 8)) * (bot - top);
const AgeAxis: React.FC<{f: number; x: number; top: number; bot: number; maxAge: number; o: number; at: number; nowLabel?: string; nowScarf?: number}> = ({f, x, top, bot, maxAge, o, at, nowLabel, nowScarf = 0}) => {
  if (o <= 0) return null;
  const grow = ease((f - S(at)) / 18);
  const ticks = maxAge > 40 ? [20, 30, 40, 50, 60, 70, 80] : [];
  return (
    <svg width={W} height={H} style={{position: 'absolute', opacity: o}}>
      <line x1={x} x2={x} y1={bot + 30} y2={bot + 30 - (bot + 30 - (top - 20)) * grow} stroke="rgba(246,238,222,0.55)" strokeWidth={2} />
      {ticks.map((a) => {
        const y = ageY(a, top, bot, maxAge);
        return (
          <g key={a} opacity={grow}>
            <line x1={x - 8} x2={x + 8} y1={y} y2={y} stroke="rgba(246,238,222,0.4)" strokeWidth={1.5} />
            {a % 20 === 0 && a > 20 ? <text x={x - 22} y={y + 8} textAnchor="end" fontFamily={SUB} fontSize={22} fill="rgba(246,243,234,0.4)">{a} tuổi</text> : null}
          </g>
        );
      })}
      {[8, 14, 17, 22].map((a, i) => {
        const y = ageY(a, top, bot, maxAge);
        const v = ease((f - S(at) - 6 - i * 4) / 8);
        return (
          <g key={a} opacity={v}>
            <ScarfIcon x={x} y={y} s={1.2 * (0.6 + 0.4 * v)} />
            <text x={x - 30} y={y + 8} textAnchor="end" fontFamily={SUB} fontSize={24} fill="rgba(246,243,234,0.6)">{a} tuổi</text>
          </g>
        );
      })}
      <g opacity={ease((f - S(at) - 22) / 8)}>
        {nowScarf < 1 ? <circle cx={x} cy={ageY(26, top, bot, maxAge)} r={9 * (1 - nowScarf)} fill="#fff" style={{filter: 'drop-shadow(0 0 8px #fff)'}} /> : null}
        {nowScarf > 0 ? <ScarfIcon x={x} y={ageY(26, top, bot, maxAge)} s={2.2 * ease(nowScarf) * (1 + 0.25 * Math.exp(-nowScarf * 6))} /> : null}
        <text x={x - 30} y={ageY(26, top, bot, maxAge) + 8} textAnchor="end" fontFamily={SUB} fontSize={24} fill="#fff">{nowLabel ?? '26 tuổi'}</text>
      </g>
    </svg>
  );
};

/* ============================== SFX ============================== */
type Fx = [number, string, number];
const FX: Fx[] = [];
VIG.forEach((v, i) => {
  if (i > 0) FX.push([v.a + 0.35, 'tick', 0.5]);
  FX.push([choose(i) - 0.53, 'tick', 0.5], [choose(i), 'click', 0.8], [v.stamp - 0.2, 'dropin', 0.45], [v.stamp, 'stamp', 1]);
  if (i < 4) FX.push([v.b - 0.35, 'whoosh', 0.35]);
});
FX.push([DROP1, 'impact', 0.45], [26.0, 'suck', 0.4], [E8(27.6), 'ping', 0.5]);
FLIPS.forEach((x) => FX.push([x.t, 'thud', 0.5], [x.flip, 'ping', 0.65], [x.flip, 'heal', 0.35], [x.flip - 0.25, 'whoosh', 0.25]));
FX.push([47.0, 'whoosh', 0.4], ...[0, 1, 2, 3].map((i) => [47.2 + i * 0.133, 'pop', 0.5] as Fx), [51.6, 'whoosh', 0.45], [54.6, 'heart', 0.5]);
FX.push([58.5, 'impact', 0.6], [58.7, 'shimmer', 0.35], [62.0, 'whoosh', 0.35], [66.0, 'paper', 0.6], [70.4, 'tick', 0.5], [70.7, 'tick', 0.5], [76.0, 'tick', 0.5], [76.3, 'tick', 0.5], [77.5, 'ding', 0.45]);
FX.push([80.3, 'whoosh', 0.35], [84.0, 'impact', 0.6], [84.2, 'shimmer', 0.35], [88.1, 'ding', 0.5]);
FX.push([DROP2 - 0.2, 'dropin', 0.45], [DROP2, 'stamp', 1], [DROP2, 'impact', 0.7], ...Array.from({length: 8}, (_, i) => [E4(94.4) + i * 0.53163, 'pop', 0.55] as Fx), [99.2, 'suck', 0.4], [103.4, 'whoosh', 0.4]);
FX.push([107.2, 'impact', 0.6], [107.4, 'shimmer', 0.35], [111.3, 'whoosh', 0.35], [112.0, 'curl', 0.4], [120.0, 'suck', 0.45], ...[0, 1, 2, 3].map((i) => [120.4 + i * 0.133, 'pop', 0.45] as Fx), [E4(131.4), 'sunrise', 0.6]);
const fxSrc = (n: string) => (n === 'paper' ? 'audio/sfx/paper.wav' : `audio/ep60-troi-sap/sfx/${n}.wav`);

/* ============================== MAIN ============================== */
export const Ep60TroiSap: React.FC = () => {
  const f = useCurrentFrame();
  const sec = f / 30;

  // rung màn hình theo dấu đỏ & cú drop
  const hits = [...VIG.map((v) => v.stamp), DROP2, 58.5, 84.0, 107.2];
  let shake = 0;
  for (const h of hits) {
    const d = f - S(h);
    if (d >= 0 && d < 14) shake += Math.exp(-d / 3.5) * (VIG.some((v) => v.stamp === h) || h === DROP2 ? 16 : 9);
  }
  const sx = shake * Math.sin(f * 2.3);
  const sy = shake * Math.cos(f * 3.1) * 0.7;

  const nodes: React.ReactNode[] = [];

  /* ---- 1 năm lát cắt ---- */
  VIG.forEach((v, i) => {
    const fa = S(v.a);
    const fb = S(v.b);
    if (f < fa - 2 || f > fb + 14) return;
    const inV = i === 0 ? 1 : ease((f - fa) / 9);
    const last = i === 4;
    const outT = ease((f - (fb - 10)) / 12);
    // ra: thu nhỏ bay lên thành thumbnail (lát 26 tuổi giữ lại ở trên)
    const sc = (0.94 + 0.06 * inV) * (1 + 0.04 * clamp01((f - fa) / (fb - fa))) * (1 - outT * 0.8);
    const y = 820 + (560 - 820) * outT;
    const o = last ? inV : inV * (1 - ease((f - fb) / 8));
    nodes.push(
      <div key={`v${i}`} style={{position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: o, filter: blurV(inV)}}>
        <div style={{position: 'absolute', left: cx, top: y, transform: `translate(-50%,-50%) scale(${sc.toFixed(4)})`}}>
          <div style={{position: 'relative', width: 820, height: 820}}>
            <Card size={820} x={410} y={410} kind={v.kind} f={f} frame={outT}>
              <Stamp f={f} land={S(v.stamp)} size={100} label={f < fb - 6} />
            </Card>
          </div>
        </div>
      </div>,
    );
    nodes.push(<Poll key={`p${i}`} f={f} a={i === 0 ? -1 : v.a + 0.3} ch={choose(i)} out={v.b - 0.5} />);
  });

  /* ---- thumbnail 26 tuổi ghim trên (26,2 → 46,4) ---- */
  if (sec > 26.2 && sec < 47.2) {
    const o = 1 - ease((f - S(46.6)) / 10);
    nodes.push(<Card key="thumb" size={164} x={cx} y={560} kind="pitch" f={f} frame={1} o={o}><div style={{transform: 'scale(0.2)'}}><Stamp f={f} land={0} size={100} instant /></div></Card>);
  }

  /* ---- 2 sau đó thì sao: lật dấu ---- */
  FLIPS.forEach((x, i) => {
    const fa = S(x.t);
    const fb = S((i < 3 ? FLIPS[i + 1].t : 46.3) - 0.15);
    if (f < fa - 2 || f > fb + 10) return;
    const v = io(f, fa, fb, 8);
    const pop = 0.92 + 0.08 * ease((f - fa) / 8);
    nodes.push(
      <div key={`fl${i}`} style={{position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: v, filter: blurV(v), transform: `scale(${pop.toFixed(3)})`, transformOrigin: '50% 52%'}}>
        <Card size={660} x={cx} y={1000} kind={x.kind} alt={x.alt} f={f}>
          <Stamp f={f} land={fa} size={84} instant out={S(x.flip) - 3} />
          <Pill f={f} at={S(x.flip)} size={40} />
        </Card>
      </div>,
    );
  });

  /* ---- 3 trục tuổi (47 → 58) ---- */
  if (sec > 46.6 && sec < 58.4) {
    const zoom = ease((f - S(51.6)) / 22);
    const o = io(f, S(46.8), S(57.8), 10);
    nodes.push(<AgeAxis key="ax1" f={f} x={200} top={700} bot={1460} maxAge={30} o={o * (1 - zoom)} at={47.0} />);
    const size = 480 + (900 - 480) * zoom;
    const x = 640 + (cx - 640) * zoom;
    const y = 1000 + (1060 - 1000) * zoom;
    nodes.push(
      <div key="c26" style={{position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: o * ease((f - S(47.4)) / 10)}}>
        <Card size={size} x={x} y={y} kind="pitch" f={f} frame={1 - zoom}>
          <Stamp f={f} land={0} size={size * 0.15} instant />
        </Card>
      </div>,
    );
  }

  /* ---- 4 hiện tượng + nghiên cứu ---- */
  nodes.push(<Concept key="k1" f={f} a={58.5} b={61.7} tag="HIỆN TƯỢNG" title={['Sai lệch', 'dự báo cảm xúc']} en="Affective Forecasting" sub="Ta luôn đánh giá quá cao chuyện xấu sẽ khiến mình khổ bao lâu." />);
  if (sec > 61.8 && sec < 66.2) {
    const o = io(f, S(62.0), S(65.8), 10);
    nodes.push(
      <svg key="bld" width={W} height={H} style={{position: 'absolute', opacity: o, filter: blurV(o)}}>
        <Defs />
        <g transform={`translate(${cx},${900}) scale(${(1.25 + 0.04 * clamp01((f - S(62)) / 120)).toFixed(4)})`}>
          <ellipse cx={0} cy={-60} rx={260} ry={200} fill="url(#e60spot)" />
          <path d="M-190,-140 L0,-240 L190,-140 Z" fill="#1d1813" stroke={LINE} strokeWidth={2} />
          <rect x={-170} y={-140} width={340} height={18} fill="#221b15" stroke={LINE} strokeWidth={1.5} />
          {Array.from({length: 7}, (_, i) => <rect key={i} x={-150 + i * 48} y={-118} width={16} height={180} fill={i % 2 ? '#3a2f26' : '#2a221b'} stroke={LINE_DIM} />)}
          {[0, 1, 2].map((i) => <rect key={i} x={-180 - i * 14} y={62 + i * 14} width={360 + i * 28} height={14} fill="#1a1511" stroke={LINE} strokeWidth={1.3} />)}
          {[-200, -120, -40, 40, 120, 200].map((x, i) => <Person key={i} x={x} y={140} s={0.62} paper />)}
          <text x={0} y={-262} textAnchor="middle" fontFamily={SUB} fontSize={30} fill={GOLD}>ĐẠI HỌC</text>
          <text x={0} y={250} textAnchor="middle" fontFamily={SUB} fontSize={26} fill="rgba(246,243,234,0.8)">giảng viên trẻ · chờ kết quả{'.'.repeat(1 + (Math.floor(f / 10) % 3))}</text>
        </g>
      </svg>,
    );
  }
  if (sec > 65.8 && sec < 70.2) {
    const o = io(f, S(66.0), S(69.8), 10);
    const lift = 1 + 0.05 * ease((f - S(66)) / 30);
    nodes.push(
      <div key="env" style={{position: 'absolute', left: cx, top: 920, width: 620, height: 400, transform: `translate(-50%,-50%) scale(${lift.toFixed(3)}) rotate(-1.5deg)`, opacity: o, filter: blurV(o), background: 'linear-gradient(180deg,#f3ead6,#ddd0b4)', borderRadius: 10, boxShadow: '0 0 60px rgba(255,230,190,0.25), 0 0 0 2px rgba(216,57,43,0.4)'}}>
        <svg width={620} height={400} style={{position: 'absolute'}}><path d="M0,0 L310,220 L620,0" fill="none" stroke="rgba(120,100,70,0.55)" strokeWidth={2} /></svg>
        <div style={{position: 'absolute', left: '50%', top: 270, transform: 'translateX(-50%)', background: '#fffaf0', border: '1px solid rgba(120,100,70,0.4)', padding: '10px 26px', fontFamily: SUB, fontSize: 30, letterSpacing: '0.12em', color: '#3a2f26', whiteSpace: 'nowrap'}}>XÉT BIÊN CHẾ</div>
      </div>,
    );
  }
  if (sec > 70.0 && sec < 80.0) {
    const o = io(f, S(70.2), S(79.7), 10);
    const two = ease((f - S(75.8)) / 16);
    nodes.push(<Bars key="b1" f={f} at={70.4} x={cx - 230 * two} title="Họ dự đoán" h={[0.9, 0.42]} o={o} note="chênh rất xa" noteC={RED_HOT} />);
    nodes.push(<Bars key="b2" f={f} at={76.0} x={cx + 230} title="Thực tế" h={[0.72, 0.66]} o={o * two} note="gần như bằng nhau" noteC={GOLD} />);
    nodes.push(<Foot key="ft1" f={f} a={77.6} b={79.6} text="Gilbert và cộng sự, 1998 · vẽ theo xu hướng kết quả bài báo" />);
  }

  /* ---- 5 giải thích ---- */
  if (sec > 80.1 && sec < 84.0) {
    const o = io(f, S(80.3), S(83.6), 10);
    nodes.push(<div key="c26b" style={{position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: o, filter: blurV(o)}}><Card size={560} x={cx} y={1020} kind="pitch" f={f}><Stamp f={f} land={0} size={84} instant /></Card></div>);
  }
  nodes.push(<Concept key="k2" f={f} a={84.0} b={87.8} tag="MỘT LỜI GIẢI THÍCH" title={['Ảo giác', 'tập trung']} en="Focalism" sub="Khi nhìn chằm chằm một việc, nó là cả thế giới của bạn." />);
  if (sec > 87.9 && sec < 93.2) {
    const fa = S(88.1);
    const fb = S(92.7);
    const r = (d: number) => io(f, fa + d, fb, 12);
    nodes.push(
      <div key="q" style={{position: 'absolute', left: 0, width: W, top: 760, textAlign: 'center'}}>
        <div style={{fontFamily: SERIF, fontSize: 130, lineHeight: 0.6, color: RED, opacity: r(0), textShadow: '0 0 30px rgba(255,60,40,0.6)'}}>“</div>
        <div style={{marginTop: 40, padding: '0 100px', fontFamily: SUB, fontSize: 58, lineHeight: 1.45, color: F.text, opacity: r(6), filter: blurV(r(6))}}>Không có gì trong đời quan trọng như bạn nghĩ, khi bạn đang nghĩ về nó.</div>
        <div style={{marginTop: 40, fontFamily: SUB, fontSize: 30, color: GOLD, opacity: r(20)}}>— Daniel Kahneman</div>
        <div style={{marginTop: 8, fontFamily: SUB, fontSize: 22, color: 'rgba(246,243,234,0.5)', opacity: r(24)}}>Nobel Kinh tế 2002</div>
      </div>,
    );
  }

  /* ---- 6 tám ô đời sống ép nhỏ (drop 2) ---- */
  if (f >= S(DROP2) && sec < 107.0) { // khung + dấu hiện CỨNG đúng khung bass, không fade trước
    const fa = S(DROP2);
    const o = 1 - ease((f - S(106.8)) / 8);
    const t0 = E4(94.4);
    const squeeze = ease((f - S(t0)) / S(4.6));
    const back = ease((f - S(103.4)) / 20);
    const size = (520 + (TILE - 520) * squeeze) * (1 - back) + 400 * back;
    const punch = 1 + 0.12 * Math.exp(-(f - fa) / 3.5);
    nodes.push(
      <div key="grid" style={{position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: o, transform: `scale(${punch.toFixed(3)})`}}>
        {ICONS.map((_, i) => (i === 4 ? null : <Tile key={i} i={i} v={ease((f - S(t0 + [0, 1, 2, 5, 0, 3, 6, 7, 4][i] * 0.53163)) / 7) * (1 - back)} />))}
        <Card size={size} x={cx} y={1000} kind="pitch" f={f}><Stamp f={f} land={fa} size={size * 0.16} /></Card>
      </div>,
    );
  }

  /* ---- 7 phương pháp + bản thân 36 tuổi ---- */
  nodes.push(<Concept key="k3" f={f} a={107.2} b={110.9} tag="PHƯƠNG PHÁP" title={['Khoảng cách', 'thời gian']} en="Temporal Distancing" sub="Đứng ở sau này, nhìn về bây giờ." />);
  if (sec > 111.0 && sec < 121.5) {
    const o = io(f, S(111.3), S(122), 10);
    const down = ease((f - S(120.0)) / 24);
    const line = ease((f - S(112.0)) / 30);
    nodes.push(
      <div key="fut" style={{position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: o}}>
        <svg width={W} height={H} style={{position: 'absolute', opacity: 1 - down}}>
          <Defs />
          <ellipse cx={cx} cy={850} rx={120} ry={22} fill="rgba(255,214,150,0.18)" />
          <Person x={cx} y={790} s={1.25} />
          <text x={cx + 90} y={640} fontFamily={SUB} fontSize={26} fill="rgba(246,243,234,0.6)">36 tuổi</text>
          <line x1={cx} x2={cx} y1={870} y2={870 + 260 * line} stroke="rgba(246,238,222,0.6)" strokeWidth={2.5} strokeDasharray="3 10" strokeLinecap="round" />
        </svg>
        <Card size={360 * (1 - down) + 70 * down} x={cx + (650 - cx) * 0} y={1320 + (ageY(26, 600, 1612, 80) - 1320) * down} kind="pitch" f={f} o={1 - down * 0.9}><Stamp f={f} land={0} size={56 * (1 - down) + 12 * down} instant /></Card>
      </div>,
    );
    nodes.push(<Foot key="ft2" f={f} a={116.6} b={119.7} text="Bruehlman-Senecal & Ayduk, 2015" />);
  }

  /* ---- 8 trục 8 → 80 ---- */
  if (sec > 119.8) {
    const o = ease((f - S(120.0)) / 12) * (1 - ease((f - S(133.4)) / 26));
    const sc = clamp01((f - S(E4(131.4))) / 20);
    nodes.push(<AgeAxis key="ax2" f={f} x={cx} top={600} bot={1612} maxAge={80} o={o} at={120.2} nowLabel={sec > 129.0 ? 'Bạn bây giờ' : '26 tuổi'} nowScarf={sc} />);
  }

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <FilBg f={f} w={W} h={H} tone="warm" glow={[50, 48]} strength={0.95} />
      <AbsoluteFill style={{transform: `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px)`}}>
        {nodes}
        {CAPS.map(([a, b, t], i) => <Caption key={i} f={f} a={a} b={b} text={t} />)}
      </AbsoluteFill>
      <FilGrain opacity={0.07} />
      <Audio src={staticFile('audio/ep60-troi-sap/bgm.wav')} volume={0.9} />
      {FX.map(([t, n, g], i) => (
        <Sequence key={i} from={Math.max(0, S(t))} durationInFrames={S(3.5)}>
          <Audio src={staticFile(fxSrc(n))} volume={g * 0.85} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/* ============================== BÌA ============================== */
import {HookCover} from '../../library/cover/HookCover';
export const Ep60Cover: React.FC = () => (
  <HookCover lines={['Có chuyện nào từng', 'khiến bạn tưởng']} hit="trời sập?" hitSize={184} concept="Sai lệch dự báo cảm xúc" />
);
