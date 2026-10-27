import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, getInputProps, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp01} from '../../library/anim';
import {FilBg, FilGrain} from '../../library/filament/stage';
import {ease, F} from '../../library/filament/theme';
import {BAR, BP, MID, S, W, H} from './timeline';

/**
 * ep61 Việc của ai? — tách bài toán (Adler). Dựng bằng bộ Ep60 (nền ấm, line-art, trắc nghiệm, dấu đỏ, thẻ khái niệm).
 * Mở (giường 01:20) → Ch1 gia đình → khái niệm → Ch2 bạn cũ → Ch3 đồng nghiệp (dấu đỏ ở drop 93,36) → kết: 3 thẻ, sổ ghi, dám bị ghét, tagline, ngủ yên.
 */

const SUB = "'Ep61 Sub', 'Filament Viet', sans-serif";
const SERIF = "'Filament Viet Black', 'Filament Viet', serif";
const ITAL = "'Ep61 Ital', 'Filament Viet Display', serif";
if (typeof document !== 'undefined') {
  const h = delayRender('ep61 fonts');
  Promise.all([
    new FontFace('Ep61 Sub', `url(${staticFile('fonts/ep58/BeVietnamPro-ExtraBold.ttf')})`).load().then((l) => document.fonts.add(l)),
    new FontFace('Ep61 Ital', `url(${staticFile('fonts/ep58/PlayfairDisplay.ttf')})`, {style: 'normal'}).load().then((l) => document.fonts.add(l)),
  ]).catch(() => undefined).finally(() => continueRender(h));
}

const LINE = 'rgba(240,212,165,0.62)';
const LINE_DIM = 'rgba(240,212,165,0.28)';
const RED = F.red;
const RED_HOT = F.redHot;
const GOLD = '#f2c46d';
const cx = W / 2;
const DROP1 = 17.07;
const DROP2 = 93.36;

const io = (f: number, a: number, b: number, d = 10) => ease((f - a) / d) * (1 - ease((f - b) / d));
const blurV = (v: number) => (v >= 0.999 ? undefined : `blur(${((1 - v) * 10).toFixed(1)}px)`);

/* ============================== PHỤ ĐỀ ============================== */
const CAPS: [number, number, string][] = [
  [-2, BAR(2) - 0.15, 'Bố mẹ cãi nhau xong đi ngủ rồi. Mình vẫn còn thức.'],
  [BAR(2) + 0.05, BAR(4) - 0.15, 'Hồi nhỏ, mình học cách 【cố tình gây chuyện】 để bố mẹ ngừng cãi.'],
  [BAR(4) + 0.05, BAR(6) - 0.15, 'Lớn chút, mình thành 【cái loa】 truyền tin hai bên.'],
  [BAR(6) + 0.05, BAR(8) - 0.15, 'Lên đại học, bố mẹ chuyển sang cãi qua điện thoại.'],
  [BAR(8) + 0.05, BAR(10) - 0.15, 'Bố mẹ hòa hay không, là việc của ai?'],
  [BAR(10) + 0.05, BAR(11.5) - 0.1, 'Nói ra điều mình buồn, là 【việc của mình】.'],
  [BAR(11.5), BAR(13) - 0.15, 'Bố mẹ hòa hay không, mình thức tới sáng 【cũng không quyết được】.'],
  [BAR(15) + 0.05, BAR(17) - 0.15, 'Không phải bỏ mặc họ. Mà là làm phần 【mình làm được】.'],
  [BAR(18) + 0.05, BAR(20) - 0.15, 'Hồi cấp 3, tụi mình nhắn tới nửa đêm.'],
  [BAR(20) + 0.05, BAR(22) - 0.15, 'Giờ mình nhắn một đoạn dài, hai ngày sau nó trả lời: 【haha ừ】.'],
  [BAR(22) + 0.05, BAR(24) - 0.15, 'Có phải mình 【làm gì sai】 không?'],
  [BAR(24) + 0.05, BAR(26) - 0.15, 'Nó còn muốn thân như xưa không, là việc của ai?'],
  [BAR(26) + 0.05, BAR(27.5) - 0.1, 'Thật lòng với bạn, là 【việc của mình】.'],
  [BAR(27.5), BAR(29) - 0.15, 'Bạn có muốn lại gần không, mình nghĩ mấy 【cũng không quyết được】.'],
  [BAR(29) + 0.05, BAR(31) - 0.15, 'Có những xa cách, không phải ai làm sai. Chỉ là 【đời đã khác】.'],
  [BAR(32) + 0.05, BAR(34) - 0.15, 'Tuần này là 【lần thứ ba】 rồi.'],
  [BAR(34) + 0.05, BAR(36) - 0.15, 'Lần này, mình dừng lại 【trước khi gật đầu】.'],
  [BAR(36) + 0.05, BAR(38) - 0.15, 'Anh ấy chỉ đáp: “Ừ… thôi được.”'],
  [BAR(38) + 0.05, BAR(39.5) - 0.1, 'Rồi cả tối, mình cứ nghĩ mãi.'],
  [BAR(39.5), BAR(41) - 0.15, 'Anh ấy có giận không? Có nói xấu mình 【sau lưng】 không?'],
  [BAR(41) + 0.05, DROP2 - 0.15, 'Anh ấy vui hay không, là việc của ai?'],
  [DROP2 + 0.1, 96.0, 'Nói không, là 【việc của mình】.'],
  [96.1, BAR(47) - 0.15, 'Người ta vui hay không, mình lo cả ngày 【cũng không đổi được】.'],
  [BAR(47) + 0.05, BAR(48.5) - 0.15, 'Có thể giúp. Cũng có thể 【từ chối】.'],
  [BAR(48.5) + 0.05, BAR(50) - 0.15, 'Ba chuyện, cùng một câu hỏi.'],
  [BAR(50) + 0.05, BAR(52) - 0.15, 'Hiểu rồi, mà lòng vẫn 【để bụng】.'],
  [BAR(52) + 0.05, BAR(54) - 0.15, 'Không sao, 【từ từ】.'],
  [BAR(54) + 0.05, BAR(56) - 0.15, 'Lần sau, hỏi trước một câu: 【việc này của ai?】'],
  [BAR(56) + 0.05, BAR(58) - 0.15, 'Mình không thể làm ai cũng hài lòng. Sẽ luôn có người 【không thích mình】.'],
  [BAR(58) + 0.05, BAR(60) - 0.15, 'Chấp nhận điều đó, là'],
  [BAR(60) + 0.05, BAR(62) - 0.15, 'Không phải mặc kệ người khác, mà là 【không gánh hộ】 phần của người khác.'],
  [BAR(62) + 0.05, 134.6, 'Bạn đang gánh hộ việc của ai?'],
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
    <linearGradient id="e61body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#6a5643" />
      <stop offset="0.45" stopColor="#3a2f26" />
      <stop offset="1" stopColor="#15110d" />
    </linearGradient>
    <linearGradient id="e61bust" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2c241e" />
      <stop offset="1" stopColor="#120e0b" />
    </linearGradient>
    <radialGradient id="e61spot" cx="0.5" cy="0.3" r="0.7">
      <stop offset="0" stopColor="rgba(255,214,150,0.22)" />
      <stop offset="1" stopColor="rgba(255,214,150,0)" />
    </radialGradient>
    <linearGradient id="e61light" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="rgba(255,206,130,0.55)" />
      <stop offset="1" stopColor="rgba(255,206,130,0)" />
    </linearGradient>
  </defs>
);

const Person: React.FC<{x: number; y: number; s?: number; arm?: number; paper?: boolean; dim?: number}> = ({x, y, s = 1, arm, paper, dim = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={dim}>
    <path d="M-16,0 L-15,62 M16,0 L15,62" stroke="#2a221b" strokeWidth={13} strokeLinecap="round" />
    <path d="M-16,0 L-15,62 M16,0 L15,62" stroke={LINE_DIM} strokeWidth={1.2} fill="none" />
    <path d="M-36,4 L-31,-78 Q-28,-108 0,-110 Q28,-108 31,-78 L36,4 Z" fill="url(#e61body)" stroke={LINE} strokeWidth={1.5} />
    <circle cx={0} cy={-133} r={21} fill="url(#e61body)" stroke={LINE} strokeWidth={1.5} />
    {arm !== undefined ? <path d={`M26,-96 L${26 + 64 * Math.cos(arm)},${-96 - 64 * Math.sin(arm)}`} stroke="#4a3c30" strokeWidth={11} strokeLinecap="round" /> : null}
    {paper ? <rect x={14} y={-58} width={24} height={30} fill="#efe6d2" opacity={0.9} /> : null}
  </g>
);

/** Người ngồi (nhìn nghiêng), hướng phải. hunch: cúi đầu */
const Sitter: React.FC<{x: number; y: number; s?: number; hunch?: number; flip?: boolean; glow?: boolean}> = ({x, y, s = 1, hunch = 0, flip, glow}) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
    <path d="M-10,0 L44,0 L46,62" stroke="#2a221b" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M-10,0 L44,0 L46,62" stroke={LINE_DIM} strokeWidth={1.2} fill="none" />
    <path d={`M-28,6 L-26,-70 Q${-18 + hunch * 14},-104 ${8 + hunch * 16},-100 Q${26 + hunch * 12},-90 22,-60 L20,6 Z`} fill="url(#e61body)" stroke={LINE} strokeWidth={1.5} />
    <circle cx={6 + hunch * 26} cy={-124 + hunch * 14} r={20} fill="url(#e61body)" stroke={LINE} strokeWidth={1.5} style={glow ? {filter: 'drop-shadow(0 0 10px rgba(150,180,240,0.6))'} : undefined} />
    <path d="M14,-80 L52,-40" stroke="#4a3c30" strokeWidth={10} strokeLinecap="round" />
  </g>
);

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

type Kind = 'bed' | 'sleep' | 'door' | 'relay' | 'office' | 'apart' | 'crowd';
const Art: React.FC<{kind: Kind; f: number; t?: number}> = ({kind, f, t = 0}) => {
  if (kind === 'bed' || kind === 'sleep') {
    const sleep = kind === 'sleep';
    return (
      <g>
        <ellipse cx={0} cy={-40} rx={300} ry={260} fill="url(#e61spot)" />
        <rect x={-250} y={-260} width={170} height={200} fill="#101521" stroke={LINE} strokeWidth={1.6} />
        <line x1={-165} x2={-165} y1={-260} y2={-60} stroke={LINE_DIM} />
        <line x1={-250} x2={-80} y1={-160} y2={-160} stroke={LINE_DIM} />
        <circle cx={-205} cy={-215} r={16} fill="rgba(240,230,200,0.85)" style={{filter: 'drop-shadow(0 0 10px rgba(255,240,200,0.8))'}} />
        <rect x={110} y={-120} width={130} height={60} rx={10} fill="#16110d" stroke={LINE} strokeWidth={1.5} />
        <text x={175} y={-79} textAnchor="middle" fontFamily={SUB} fontSize={34} fill={sleep ? 'rgba(246,243,234,0.55)' : RED_HOT} style={sleep ? undefined : {filter: 'drop-shadow(0 0 8px rgba(255,70,50,0.8))'}}>01:20</text>
        <rect x={-280} y={110} width={460} height={60} rx={8} fill="#2a221b" stroke={LINE} strokeWidth={1.6} />
        <rect x={-280} y={70} width={30} height={160} fill="#221b15" stroke={LINE} strokeWidth={1.4} />
        <rect x={-240} y={80} width={100} height={34} rx={14} fill="#3a3128" stroke={LINE} strokeWidth={1.3} />
        <path d="M-280,170 L-280,240 M180,170 L180,240" stroke={LINE_DIM} strokeWidth={2} />
        {sleep ? (
          <g>
            <path d="M-150,112 Q-20,60 170,104 L170,112 Z" fill="#4a3c30" stroke={LINE} strokeWidth={1.4} />
            <circle cx={-182} cy={84} r={22} fill="url(#e61body)" stroke={LINE} strokeWidth={1.5} />
            <text x={-130} y={30 - 6 * Math.sin(f / 18)} fontFamily={ITAL} fontSize={30} fill="rgba(246,243,234,0.5)">z</text>
            <text x={-104} y={6 - 6 * Math.sin(f / 18 + 1)} fontFamily={ITAL} fontSize={24} fill="rgba(246,243,234,0.35)">z</text>
          </g>
        ) : (
          <g>
            <path d="M-120,112 L60,112 L70,100 L-110,96 Z" fill="#4a3c30" stroke={LINE} strokeWidth={1.2} />
            <Sitter x={-40} y={108} s={1.2} hunch={0.8} />
          </g>
        )}
      </g>
    );
  }
  if (kind === 'door') {
    const o1 = clamp01((t - 0.4) / 0.3);
    const o2 = clamp01((t - 1.1) / 0.3);
    return (
      <g>
        <ellipse cx={80} cy={-20} rx={260} ry={260} fill="url(#e61spot)" />
        <rect x={120} y={-260} width={140} height={420} fill="#120e0b" stroke={LINE} strokeWidth={1.6} />
        <rect x={120} y={-260} width={22} height={420} fill="rgba(255,206,130,0.85)" style={{filter: 'drop-shadow(0 0 18px rgba(255,200,120,0.9))'}} />
        <path d="M120,160 L142,160 L60,320 L-60,320 Z" fill="url(#e61light)" />
        <rect x={-260} y={-40} width={170} height={16} fill="#221b15" stroke={LINE} strokeWidth={1.3} />
        <path d="M-245,-24 L-245,120 M-105,-24 L-105,120" stroke={LINE_DIM} strokeWidth={1.4} />
        <path d="M-220,-40 L-200,-110 L-150,-110 L-170,-40" fill="none" stroke={LINE_DIM} strokeWidth={1.4} />
        <Person x={40} y={100} s={0.78} arm={0.5} paper />
        <Bubble x={200} y={-150} text="!!" o={o1} red />
        <Bubble x={200} y={-80} text="……?!" o={o2} />
      </g>
    );
  }
  if (kind === 'relay') {
    const o1 = clamp01((t - 0.3) / 0.3);
    const o2 = clamp01((t - 1.0) / 0.3);
    return (
      <g>
        <path d="M-40,-280 L40,-280 L160,200 L-160,200 Z" fill="url(#e61light)" opacity={0.6} />
        <path d="M-50,-290 L50,-290 L30,-270 L-30,-270 Z" fill="#3a3128" stroke={LINE} strokeWidth={1.4} />
        <line x1={0} x2={0} y1={-320} y2={-290} stroke={LINE_DIM} />
        <rect x={-150} y={70} width={300} height={16} fill="#221b15" stroke={LINE} strokeWidth={1.3} />
        <Person x={-220} y={150} s={1.15} arm={0.1} />
        <Person x={220} y={150} s={1.15} />
        <Person x={0} y={160} s={0.72} arm={2.9} />
        <Bubble x={-150} y={-150} text="Mẹ bảo bố…" o={o1} />
        <Bubble x={130} y={-80} text="Bố con tính vậy đó…" o={o2} />
      </g>
    );
  }
  if (kind === 'office') {
    return (
      <g>
        <rect x={-300} y={-280} width={600} height={260} fill="#0f131c" stroke={LINE_DIM} strokeWidth={1.4} />
        {Array.from({length: 12}, (_, i) => {
          const h = 60 + ((i * 53) % 110);
          return <rect key={i} x={-290 + i * 50} y={-20 - h} width={36} height={h} fill="#1a2030" stroke="rgba(150,170,210,0.25)" />;
        })}
        {Array.from({length: 24}, (_, i) => <rect key={`w${i}`} x={-282 + (i % 12) * 50} y={-60 - Math.floor(i / 12) * 26} width={6} height={8} fill="rgba(255,214,150,0.5)" />)}
        <ellipse cx={0} cy={60} rx={300} ry={200} fill="url(#e61spot)" />
        <rect x={-290} y={90} width={250} height={14} fill="#221b15" stroke={LINE} strokeWidth={1.3} />
        <rect x={-230} y={10} width={110} height={74} rx={6} fill="#1a2230" stroke={LINE} strokeWidth={1.4} style={{filter: 'drop-shadow(0 0 14px rgba(150,180,230,0.35))'}} />
        <Sitter x={-110} y={150} s={1} glow flip />
        <rect x={60} y={90} width={240} height={14} fill="#221b15" stroke={LINE} strokeWidth={1.3} />
        <rect x={160} y={10} width={110} height={74} rx={6} fill="#1a2230" stroke={LINE} strokeWidth={1.4} />
        <Person x={20} y={140} s={1.05} paper arm={2.4} />
      </g>
    );
  }
  if (kind === 'crowd') {
    const pts: [number, number, boolean][] = [[-230, -120, false], [-120, -200, true], [0, -230, false], [120, -200, false], [230, -120, true], [-260, 60, false], [260, 60, false]];
    return (
      <g>
        <ellipse cx={0} cy={40} rx={200} ry={220} fill="url(#e61spot)" />
        {pts.map(([x, y, r], i) => {
          const v = clamp01((t - i * 0.18) / 0.3);
          return (
            <g key={i} opacity={v}>
              <Person x={x} y={y + 60} s={0.5} dim={0.8} />
              {r ? <text x={x} y={y - 30} textAnchor="middle" fontFamily={SUB} fontSize={30} fill={RED_HOT}>✕</text> : <text x={x} y={y - 30} textAnchor="middle" fontFamily={SUB} fontSize={30} fill={GOLD}>♥</text>}
            </g>
          );
        })}
        <Person x={0} y={190} s={1.2} />
      </g>
    );
  }
  // apart
  const sep = clamp01(t / 1.6);
  const dx = 70 + 160 * ease(sep);
  return (
    <g>
      <ellipse cx={-dx} cy={-20} rx={170} ry={200} fill="url(#e61spot)" />
      <ellipse cx={dx} cy={-20} rx={170} ry={200} fill="url(#e61spot)" />
      <line x1={-300} x2={300} y1={130} y2={130} stroke={LINE_DIM} strokeWidth={1.5} />
      <line x1={-dx + 30} x2={dx - 30} y1={-40} y2={-40} stroke="rgba(246,238,222,0.45)" strokeWidth={2} strokeDasharray="3 10" strokeLinecap="round" opacity={1 - 0.7 * sep} />
      <Person x={-dx} y={70} s={1.05} />
      <Person x={dx} y={70} s={1.05} />
    </g>
  );
};

const Scene: React.FC<{f: number; a: number; b: number; kind: Kind; y?: number; size?: number; children?: React.ReactNode; hardIn?: boolean; first?: boolean}> = ({f, a, b, kind, y = 860, size = 820, children, hardIn, first}) => {
  const fa = S(a);
  const fb = S(b);
  if (f < fa - 2 || f > fb + 10) return null;
  const vin = first || hardIn ? 1 : ease((f - fa) / 9);
  const vout = 1 - ease((f - fb) / 9);
  const v = vin * vout;
  const sc = (0.94 + 0.06 * vin) * (1 + 0.04 * clamp01((f - fa) / Math.max(1, fb - fa)));
  return (
    <div style={{position: 'absolute', left: cx - size / 2, top: y - size / 2, width: size, height: size, opacity: v, filter: blurV(v), transform: `scale(${sc.toFixed(4)})`}}>
      <svg width={size} height={size} viewBox="-320 -320 640 640" style={{position: 'absolute', overflow: 'visible'}}>
        <Defs />
        <Art kind={kind} f={f} t={(f - fa) / 30} />
      </svg>
      <div style={{position: 'absolute', left: '50%', top: '52%'}}>{children}</div>
    </div>
  );
};

/* ============================== ĐIỆN THOẠI ============================== */
type Msg = {me?: boolean; text: string; at: number; div?: string};
const Phone: React.FC<{f: number; a: number; b: number; name: string; sub: string; msgs: Msg[]; scroll?: [number, number, number]; y?: number}> = ({f, a, b, name, sub, msgs, scroll, y = 1010}) => {
  const fa = S(a);
  const fb = S(b);
  if (f < fa - 2 || f > fb + 10) return null;
  const v = io(f, fa, fb, 9);
  const sc = scroll ? scroll[2] * ease((f - S(scroll[0])) / (S(scroll[1]) - S(scroll[0]))) : 0;
  return (
    <div style={{position: 'absolute', left: cx - 290, top: y - 450, width: 580, height: 900, borderRadius: 54, background: '#17120e', border: '2px solid rgba(240,212,165,0.55)', boxShadow: '0 0 60px rgba(255,214,150,0.12)', opacity: v, filter: blurV(v), transform: `scale(${(0.95 + 0.05 * v).toFixed(3)})`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 130, borderBottom: '1px solid rgba(240,212,165,0.2)', background: 'rgba(30,24,18,0.95)', zIndex: 2, textAlign: 'center'}}>
        <div style={{marginTop: 46, fontFamily: SUB, fontSize: 32, color: '#f3efe6'}}>{name}</div>
        <div style={{marginTop: 2, fontFamily: SUB, fontSize: 20, color: 'rgba(246,243,234,0.45)'}}>{sub}</div>
      </div>
      <div style={{position: 'absolute', left: 28, right: 28, bottom: 40, display: 'flex', flexDirection: 'column', gap: 16, transform: `translateY(${sc.toFixed(1)}px)`}}>
        {msgs.map((m, i) => {
          const mv = m.at < 0 ? 1 : ease((f - S(m.at)) / 6);
          if (mv <= 0) return null;
          if (m.div) return <div key={i} style={{textAlign: 'center', fontFamily: SUB, fontSize: 19, color: 'rgba(246,243,234,0.4)', opacity: mv}}>{m.div}</div>;
          return (
            <div key={i} style={{alignSelf: m.me ? 'flex-end' : 'flex-start', maxWidth: '78%', padding: '14px 22px', borderRadius: 24, fontFamily: SUB, fontSize: 27, lineHeight: 1.4, color: m.me ? '#21180f' : '#f3efe6', background: m.me ? 'linear-gradient(180deg,#f6d38a,#e2b25e)' : 'rgba(255,255,255,0.09)', border: m.me ? 'none' : '1px solid rgba(240,212,165,0.3)', opacity: mv, transform: `translateY(${((1 - mv) * 18).toFixed(1)}px) scale(${(0.9 + 0.1 * mv).toFixed(3)})`, transformOrigin: m.me ? '100% 100%' : '0% 100%'}}>{m.text}</div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================== DẤU ĐỎ ============================== */
const Stamp: React.FC<{f: number; land: number; size?: number; text?: string; instant?: boolean; out?: number}> = ({f, land, size = 84, text = 'VIỆC CỦA HỌ', instant, out}) => {
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
const Poll: React.FC<{f: number; a: number; ch: number; out: number}> = ({f, a, ch, out}) => {
  const v = io(f, S(a), S(out), 8);
  if (v <= 0) return null;
  const pressed = f >= S(ch);
  const pt = f - S(ch);
  const num = f < S(ch) - S(2 * BP) ? 3 : f < S(ch) - S(BP) ? 2 : 1;
  const btn = (on: boolean, dim: boolean): React.CSSProperties => ({width: 220, height: 74, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SUB, fontSize: 34, color: dim ? 'rgba(255,255,255,0.35)' : '#fff', border: on ? 'none' : '1.5px solid rgba(255,255,255,0.45)', background: on ? 'linear-gradient(180deg,#ff5a46,#c8261b)' : 'rgba(255,255,255,0.05)', boxShadow: on ? '0 0 34px rgba(255,60,40,0.75)' : undefined});
  const press = pressed ? 1 + 0.14 * Math.exp(-pt / 3) * Math.cos(pt * 1.2) - (pt < 2 ? 0.1 : 0) : 1;
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 1330, opacity: v, filter: blurV(v), textAlign: 'center'}}>
      <div style={{fontFamily: SUB, fontSize: 40, color: F.text, textShadow: '0 2px 10px #000'}}>Việc của ai?</div>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30, marginTop: 30}}>
        <div style={btn(false, pressed)}>Của mình</div>
        <div style={{width: 58, height: 58, borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SUB, fontSize: 28, color: '#fff', opacity: pressed ? 0.25 : 1}}>{num}</div>
        <div style={{...btn(pressed, false), transform: `scale(${press.toFixed(3)})`}}>Của họ</div>
      </div>
    </div>
  );
};

/* ============================== HAI CỘT ============================== */
const TwoCol: React.FC<{f: number; a: number; b: number; mine: string; theirs: string; tm: number; tt: number}> = ({f, a, b, mine, theirs, tm, tt}) => {
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
      {col(true, 'Việc của mình', mine, tm)}
      {col(false, 'Việc của họ', theirs, tt)}
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

/* ============================== 3 THẺ ============================== */
const STACK: [string, string][] = [
  ['Nói ra điều mình buồn', 'Bố mẹ hòa hay không'],
  ['Thật lòng với bạn', 'Bạn muốn lại gần hay không'],
  ['Nói không', 'Người ta vui hay không'],
];
const Stack: React.FC<{f: number; a: number; b: number}> = ({f, a, b}) => {
  const fa = S(a);
  const fb = S(b);
  if (f < fa - 2 || f > fb + 10) return null;
  return (
    <div style={{position: 'absolute', left: 0, top: 640, width: W}}>
      {STACK.map(([m, t], i) => {
        const v = io(f, fa + S(i * BP * 2), fb, 9);
        return (
          <div key={i} style={{position: 'absolute', left: 120, width: 840, top: i * 250, height: 220, borderRadius: 24, border: '1.5px solid rgba(240,212,165,0.45)', background: 'rgba(26,20,15,0.82)', opacity: v, filter: blurV(v), transform: `translateY(${((1 - v) * 40).toFixed(1)}px)`, padding: '34px 44px', boxSizing: 'border-box'}}>
            <div style={{fontFamily: SUB, fontSize: 36, color: '#f3efe6'}}><span style={{color: GOLD}}>✓ </span>{m}<span style={{fontSize: 26, color: GOLD}}>  · của mình</span></div>
            <div style={{marginTop: 26, fontFamily: SUB, fontSize: 36, color: 'rgba(246,243,234,0.75)'}}><span style={{color: RED_HOT}}>→ </span>{t}<span style={{fontSize: 26, color: RED_HOT}}>  · của họ</span></div>
          </div>
        );
      })}
    </div>
  );
};

/* ============================== SỔ GHI ============================== */
const Note: React.FC<{f: number; a: number; b: number; strike: number; write: number}> = ({f, a, b, strike, write}) => {
  const fa = S(a);
  const fb = S(b);
  if (f < fa - 2 || f > fb + 10) return null;
  const v = io(f, fa, fb, 9);
  const st = ease((f - S(strike)) / 12);
  const l1 = 'Từ nay không nghĩ nhiều nữa.';
  const l2 = 'Lần sau, hỏi trước: việc này của ai?';
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

/* ============================== SFX ============================== */
type Fx = [number, string, number];
const FX: Fx[] = [];
const POLLS = [
  {a: BAR(8) + 0.3, ch: MID(9) - BP * 1.5, stamp: MID(9), out: BAR(10) - 0.4},
  {a: BAR(24) + 0.3, ch: MID(25) - BP * 1.5, stamp: MID(25), out: BAR(26) - 0.4},
  {a: BAR(41) + 0.3, ch: DROP2 - BP * 1.5, stamp: DROP2, out: DROP2 + 0.2},
];
POLLS.forEach((p) => FX.push([p.ch - 2 * BP, 'tick', 0.5], [p.ch - BP, 'tick', 0.5], [p.ch, 'click', 0.8], [p.stamp - 0.2, 'dropin', 0.45], [p.stamp, 'stamp', 1]));
FX.push([DROP1, 'impact', 0.5], [DROP2, 'impact', 0.75]);
for (const k of [2, 4, 6, 10, 13, 15, 17, 18, 20, 22, 26, 29, 31, 32, 34, 36, 38, 47, 48.5, 50, 52, 54, 56, 60, 62]) FX.push([BAR(k) - 0.2, 'whoosh', 0.3]);
// tin nhắn
const MOM: Msg[] = [
  {text: 'Bố con hôm nay lại say rồi', at: BAR(6) + 0.5},
  {text: 'Mẹ chán lắm rồi con ạ', at: BAR(6) + 1.4},
  {me: true, text: 'Mẹ đừng giận nữa, để con nói bố', at: BAR(6) + 2.6},
];
const OLD: Msg[] = [
  {text: 'Thi xong rồiii!!!', at: BAR(18) + 0.3},
  {me: true, text: 'Đi ăn mừng điii', at: BAR(18) + 0.75},
  {text: 'Mai 7h quán chè cổng trường nha', at: BAR(18) + 1.25},
  {me: true, text: 'Chốt!!!', at: BAR(18) + 1.7},
  {text: 'Lên đại học vẫn phải nhắn mỗi ngày đó', at: BAR(18) + 2.4},
  {me: true, text: 'Hứa luôn', at: BAR(18) + 3.0},
];
const NOW: Msg[] = [
  ...OLD.map((m) => ({...m, at: -1})),
  {div: 'Thứ Hai 21:14', text: '', at: BAR(20) + 0.2},
  {me: true, text: 'Dạo này sao rồi? Tết này về quê không, tụi mình đi ăn chè cổng trường như hồi xưa nha, quán vẫn còn đó…', at: BAR(20) + 0.4},
  {div: 'Thứ Tư 13:02', text: '', at: BAR(20) + 2.2},
  {text: 'haha ừ', at: BAR(20) + 2.7},
];
[...MOM, ...OLD, ...NOW].forEach((m) => {
  if (m.at > 0 && !m.div) FX.push([m.at, 'pop', 0.45]);
});
FX.push([BAR(13), 'impact', 0.55], [BAR(13) + 0.2, 'shimmer', 0.35], [BAR(17), 'thud', 0.5], [BAR(31), 'thud', 0.5]);
FX.push([BAR(32) + 0.6, 'pop', 0.45], [BAR(34) + 0.6, 'pop', 0.45], [BAR(36) + 0.6, 'pop', 0.45], [BAR(39.5) + 0.3, 'heart', 0.4]);
FX.push(...[0, 1, 2].map((i) => [BAR(48.5) + i * 2 * BP, 'pop', 0.5] as Fx));
FX.push([BAR(52) + 0.6, 'curl', 0.45], [BAR(54) + 0.3, 'shimmer', 0.35], [MID(58), 'stamp', 1], [MID(58), 'impact', 0.7], [BAR(62), 'sunrise', 0.55]);
// bổ sung SFX: tick ô (của mình) + dấu nhẹ (của họ), bong bóng thoại, gạch sổ, gõ chữ, poll hiện
POLLS.forEach((p) => FX.push([p.a, 'ping', 0.4], [p.ch - 3 * BP, 'tick', 0.45]));
for (const [tm, tt] of [[BAR(10) + 0.3, BAR(11.5) + 0.2], [BAR(26) + 0.3, BAR(27.5) + 0.2], [DROP2 + 0.4, 96.2]]) FX.push([tm, 'pop', 0.5], [tm + 0.25, 'click', 0.7], [tt, 'thud', 0.55], [tt, 'snap', 0.4]);
FX.push([BAR(2) + 0.4, 'boing', 0.4], [BAR(2) + 1.1, 'pop', 0.4], [BAR(4) + 0.3, 'pop', 0.4], [BAR(4) + 1.0, 'pop', 0.4]);
FX.push([BAR(32) + 1.2, 'error', 0.35], [BAR(39.5) + 1.1, 'pop', 0.45], [BAR(31) + 0.05, 'impact', 0.4], [BAR(17) + 0.05, 'impact', 0.4]);
FX.push([BAR(52) + 0.5, 'snip', 0.6], [BAR(50) + 0.2, 'type', 0.35], [BAR(54) + 0.3, 'type', 0.45], [BAR(55) + 0.0, 'type', 0.45]);
FX.push(...[0, 1, 2, 3, 4, 5, 6].map((i) => [BAR(56) + i * 0.18, i === 1 || i === 4 ? 'error' : 'ding', 0.25] as Fx), [MID(58) - 0.2, 'dropin', 0.5], [BAR(60), 'whoosh', 0.4], [BAR(62) + 0.4, 'heal', 0.4]);
const GLOBAL = new Set(['paper', 'type', 'boing', 'error', 'snip', 'ding', 'pop', 'click', 'whoosh', 'stamp', 'magic', 'confetti', 'shake', 'question']);
const LOCAL = new Set(['pop', 'click', 'whoosh', 'stamp', 'ding']);
const fxSrc = (n: string) => (LOCAL.has(n) || !GLOBAL.has(n) ? `audio/ep60-troi-sap/sfx/${n}.wav` : `audio/sfx/${n}.wav`);

/* ============================== MAIN ============================== */
export const Ep61ViecCuaAi: React.FC = () => {
  const f = useCurrentFrame();

  const hits = [...POLLS.map((p) => p.stamp), DROP1, MID(58), BAR(13)];
  let shake = 0;
  for (const h of hits) {
    const d = f - S(h);
    if (d >= 0 && d < 14) shake += Math.exp(-d / 3.5) * (h === DROP1 || h === BAR(13) ? 8 : 16);
  }
  const sx = shake * Math.sin(f * 2.3);
  const sy = shake * Math.cos(f * 3.1) * 0.7;

  const nodes: React.ReactNode[] = [];

  /* ---- Mở + Chương 1 ---- */
  nodes.push(<Scene key="s0" f={f} a={0} b={BAR(2)} kind="bed" first />);
  nodes.push(<Scene key="s1" f={f} a={BAR(2)} b={BAR(4)} kind="door" />);
  nodes.push(<Scene key="s2" f={f} a={BAR(4)} b={BAR(6)} kind="relay" />);
  nodes.push(<Phone key="ph1" f={f} a={BAR(6)} b={BAR(8)} name="Mẹ" sub="23:40" msgs={MOM} />);
  nodes.push(
    <Scene key="s3" f={f} a={BAR(8)} b={BAR(10)} kind="relay" y={820} hardIn>
      <Stamp f={f} land={S(POLLS[0].stamp)} />
    </Scene>,
  );
  nodes.push(<TwoCol key="tc1" f={f} a={BAR(10)} b={BAR(13)} mine="Nói ra điều mình buồn" theirs="Bố mẹ hòa hay không" tm={BAR(10) + 0.3} tt={BAR(11.5) + 0.2} />);
  nodes.push(<Concept key="k1" f={f} a={BAR(13)} b={BAR(15) - 0.1} tag="TÂM LÝ HỌC ADLER" title={['Tách', 'bài toán']} en="Separation of Tasks" sub="Việc gì ai quyết định, ai gánh hậu quả, thì đó là bài toán của người đó." />);
  nodes.push(<Foot key="ft1" f={f} a={BAR(13) + 1.2} b={BAR(15) - 0.1} text="Kishimi Ichiro & Koga Fumitake, “Dám bị ghét” (2013)" />);
  nodes.push(<Scene key="s4" f={f} a={BAR(15)} b={BAR(17)} kind="bed" />);

  /* ---- Chương 2 ---- */
  nodes.push(<Chapter key="c2" f={f} a={BAR(17)} b={BAR(18)} no="CHUYỆN THỨ HAI" title="Bạn cũ" sub="bạn cùng bàn · 23:30" />);
  nodes.push(<Phone key="ph2" f={f} a={BAR(18)} b={BAR(20)} name="Bạn cùng bàn" sub="lớp 12" msgs={OLD} />);
  nodes.push(<Phone key="ph3" f={f} a={BAR(20)} b={BAR(24)} name="Bạn cùng bàn" sub="năm 3 đại học" msgs={NOW} scroll={[BAR(22) + 0.3, BAR(23.6), 420]} />);
  nodes.push(
    <Scene key="s5" f={f} a={BAR(24)} b={BAR(26)} kind="apart" y={820}>
      <Stamp f={f} land={S(POLLS[1].stamp)} />
    </Scene>,
  );
  nodes.push(<TwoCol key="tc2" f={f} a={BAR(26)} b={BAR(29)} mine="Thật lòng với bạn" theirs="Bạn muốn lại gần hay không" tm={BAR(26) + 0.3} tt={BAR(27.5) + 0.2} />);
  nodes.push(<Scene key="s6" f={f} a={BAR(29)} b={BAR(31)} kind="apart" />);

  /* ---- Chương 3 ---- */
  nodes.push(<Chapter key="c3" f={f} a={BAR(31)} b={BAR(32)} no="CHUYỆN THỨ BA" title="Đồng nghiệp" sub="năm đầu đi làm · 18:40" />);
  const officeBub = (a: number, b: number, text: string, me: boolean, y = -330) => {
    const v = io(f, S(a), S(b), 7);
    if (v <= 0) return null;
    return (
      <div style={{position: 'absolute', left: me ? -330 : -10, top: y, width: 340, padding: '16px 22px', borderRadius: 22, fontFamily: SUB, fontSize: 26, lineHeight: 1.4, color: me ? '#21180f' : '#f3efe6', background: me ? 'linear-gradient(180deg,#f6d38a,#e2b25e)' : 'rgba(30,24,18,0.94)', border: me ? 'none' : `1.5px solid ${LINE}`, opacity: v, transform: `scale(${(0.9 + 0.1 * v).toFixed(3)})`}}>{text}</div>
    );
  };
  if (f >= S(BAR(32)) - 2 && f <= S(BAR(43.9)) + 10) {
    const tally = io(f, S(BAR(32) + 1.2), S(BAR(34)), 7);
    nodes.push(
      <Scene key="s7" f={f} a={BAR(32)} b={DROP2 + 0.25} kind="office" y={900}>
        {officeBub(BAR(32) + 0.6, BAR(34) - 0.2, 'Em làm giúp anh cái báo cáo nhé, anh kẹt quá.', false)}
        <div style={{position: 'absolute', left: -60, top: -470, fontFamily: SUB, fontSize: 28, color: RED_HOT, border: `1.5px solid ${RED}`, borderRadius: 999, padding: '4px 18px', opacity: tally, whiteSpace: 'nowrap'}}>T2 ✓ · T4 ✓ · T6 ?</div>
        {officeBub(BAR(34) + 0.6, BAR(36) - 0.2, 'Em xin lỗi, hôm nay em cũng kín việc rồi.', true)}
        {officeBub(BAR(36) + 0.6, BAR(38) - 0.2, 'Ừ… thôi được.', false)}
        {officeBub(BAR(39.5) + 0.3, BAR(41) - 0.2, 'Anh ấy giận không?', true, -390)}
        {officeBub(BAR(39.5) + 1.1, BAR(41) - 0.2, 'Có nói xấu mình không?', true, -280)}
        <Stamp f={f} land={S(DROP2)} size={92} />
      </Scene>,
    );
  }
  nodes.push(<TwoCol key="tc3" f={f} a={DROP2 + 0.25} b={BAR(47)} mine="Nói không" theirs="Người ta vui hay không" tm={DROP2 + 0.4} tt={96.2} />);
  nodes.push(<Scene key="s9" f={f} a={BAR(47)} b={BAR(48.5)} kind="office" />);

  /* ---- Kết ---- */
  nodes.push(<Stack key="st" f={f} a={BAR(48.5)} b={BAR(50)} />);
  nodes.push(<Note key="nt" f={f} a={BAR(50)} b={BAR(56)} strike={BAR(52) + 0.5} write={BAR(54) + 0.3} />);
  nodes.push(<Scene key="s12" f={f} a={BAR(56)} b={BAR(58)} kind="crowd" y={1020} />);
  if (f >= S(BAR(58)) - 2 && f <= S(BAR(60)) + 10) {
    const fa = S(MID(58));
    const v = io(f, fa, S(BAR(60)), 4);
    nodes.push(
      <div key="big" style={{position: 'absolute', left: cx, top: 900, transform: 'translate(-50%,-50%)', opacity: f >= fa ? 1 - ease((f - S(BAR(60))) / 9) : 0}}>
        {f >= fa - 6 ? <Stamp f={f} land={fa} size={112} text="DÁM BỊ GHÉT" /> : null}
        <div style={{position: 'absolute', left: '50%', top: 170, transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: ITAL, fontStyle: 'italic', fontSize: 34, color: 'rgba(246,243,234,0.55)', opacity: v * ease((f - fa - 12) / 10)}}>The Courage to Be Disliked</div>
      </div>,
    );
  }
  nodes.push(<Scene key="s10" f={f} a={BAR(60)} b={BAR(62)} kind="apart" />);
  nodes.push(<Scene key="s11" f={f} a={BAR(62)} b={140} kind="sleep" />);

  const endFade = 1 - ease((f - S(133.4)) / 30);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <FilBg f={f} w={W} h={H} tone="warm" glow={[50, 48]} strength={0.95} />
      <AbsoluteFill style={{transform: `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px)`, opacity: endFade}}>
        {nodes}
        {POLLS.map((p, i) => <Poll key={`p${i}`} f={f} a={p.a} ch={p.ch} out={p.out} />)}
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
