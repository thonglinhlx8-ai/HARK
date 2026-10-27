import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, getInputProps, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp01} from '../../library/anim';
import {FilBg, FilGrain} from '../../library/filament/stage';
import {ease, F} from '../../library/filament/theme';
import {BAR, BP, D1, D2, D3, END, MID, S, W, H} from './timeline';

/**
 * ep65 "Kén thông tin" (information cocoons — Sunstein; WSJ 2021).
 * Thiết bị hình RIÊNG của tập: kén sợi sáng quấn quanh đầu (mỗi lần dừng lại quấn thêm vòng),
 * điện thoại thử nghiệm đếm video, vòng lặp đỏ 4 nhãn, 3 dải lọc đám đông, thành phố chấm sáng, phố ban ngày.
 */

const NO_BGM = Boolean((getInputProps() as {noBgm?: boolean}).noBgm);
const SUB = "'Ep65 Sub', 'Filament Viet', sans-serif";
const DISP = "'Ep65 Display', 'Filament Viet Display', serif";
if (typeof document !== 'undefined') {
  const h = delayRender('ep65 fonts');
  Promise.all([
    new FontFace('Ep65 Sub', `url(${staticFile('fonts/ep58/BeVietnamPro-ExtraBold.ttf')})`).load().then((l) => document.fonts.add(l)),
    new FontFace('Ep65 Display', `url(${staticFile('fonts/ep58/PlayfairDisplay.ttf')})`, {weight: '400 900'}).load().then((l) => document.fonts.add(l)),
  ]).catch(() => undefined).finally(() => continueRender(h));
}

const LINE = 'rgba(240,212,165,0.7)';
const RED = F.red;
const RED_HOT = F.redHot;
const GOLD = '#f2c46d';
const TXT = F.text;
const BLUE = '#8cc6ff';
const ORANGE = '#ffb267';

const io = (f: number, a: number, b: number, d = 8) => ease((f - a) / d) * (1 - ease((f - b) / d));
const blurV = (v: number) => (v >= 0.999 ? undefined : `blur(${((1 - v) * 10).toFixed(1)}px)`);
const rnd = (k: number) => {
  const x = Math.sin(k * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], ease((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])));
  }
  return keys[keys.length - 1][1];
};

/* ============================== PHỤ ĐỀ ============================== */
const CAPS: [number, number, string][] = [
  [-1, BAR(-2) - 0.1, 'Cùng một app. Anh lướt ra:'],
  [BAR(-2) + 0.05, BAR(-1) - 0.1, 'Còn chị lướt ra:'],
  [BAR(-1) + 0.05, BAR(0) - 0.08, 'Sao hai người lướt ra 【ngược hẳn nhau】?'],
  [BAR(2) + 0.05, BAR(4) - 0.12, 'Bạn thích xem gì, thuật toán 【đẩy nấy】.'],
  [BAR(4) + 0.05, BAR(5.5) - 0.12, 'Đẩy lâu, bạn chỉ còn thấy những thứ đó.'],
  [BAR(5.5) + 0.05, BAR(7) - 0.12, 'Nên càng lướt, cả hai càng thấy 【mình đúng】.'],
  [BAR(7) + 0.05, BAR(8) - 0.1, 'Không chỉ chuyện nam nữ.'],
  [BAR(8) + 0.05, BAR(9.5) - 0.12, 'Bạn để tâm gì, bạn bị 【bọc】 trong cái đó.'],
  [BAR(9.5) + 0.05, BAR(11) - 0.12, 'Bạn cùng tuổi trên feed, ai cũng 【giỏi hơn】 bạn.'],
  [BAR(11) + 0.05, BAR(12.5) - 0.12, 'Vì bạn dừng lại ở đó thêm vài giây.'],
  [BAR(12.5) + 0.05, BAR(14) - 0.12, 'Không phải vì thích, mà vì 【hoảng】.'],
  [BAR(14) + 0.05, BAR(16) - 0.12, 'Thuật toán không phân biệt thích hay sợ. Nó chỉ biết bạn đã 【dừng lại】.'],
  [BAR(16) + 0.05, BAR(18) - 0.12, 'Wall Street Journal từng thử: một tài khoản chỉ xem video buồn 【lâu hơn một chút】.'],
  [BAR(18) + 0.05, D2 - 0.12, 'Không xem gì khác. Chỉ dừng lâu hơn.'],
  [D2 + 0.08, BAR(22) - 0.12, '224 video sau, 【93%】 đều nói về nỗi buồn.'],
  [BAR(22) + 0.05, BAR(24) - 0.12, 'Bạn càng lo điều gì, càng 【lướt ra】 điều đó.'],
  [BAR(24) + 0.05, BAR(25.5) - 0.12, 'Rõ ràng buồn ngủ rồi, sao tay vẫn lướt?'],
  [BAR(25.5) + 0.05, BAR(27) - 0.12, 'Vì cả một đội kỹ sư, ngày nào cũng tính xem bạn có 【xem hết】 không.'],
  [BAR(27) + 0.05, BAR(29) - 0.12, 'Nó đẩy càng chuẩn, bạn càng 【không dừng được】.'],
  [BAR(29) + 0.05, BAR(30) - 0.1, 'Thế giới bạn thấy đã qua 【3 lớp lọc】.'],
  [BAR(30) + 0.05, BAR(31) - 0.1, 'Lớp 1, người đăng: sống bình thường, ít ai đăng.'],
  [BAR(31) + 0.05, BAR(32) - 0.1, 'Lớp 2, thuật toán: chỉ đẩy thứ bạn dừng lại.'],
  [BAR(32) + 0.05, BAR(33) - 0.1, 'Lớp 3, chính bạn: chỉ dừng ở thứ quen.'],
  [BAR(33) + 0.05, BAR(34.3) - 0.1, 'Giam bạn không chỉ thuật toán, còn cả 【ngón tay】 bạn.'],
  [BAR(34.3) + 0.05, D3 - 0.08, 'Cái bạn tưởng là 【cả mạng】, chỉ là một góc nhỏ.'],
  [D3 + 0.06, BAR(37) - 0.1, 'Lướt ra, là đã 【lọc】.'],
  [BAR(37) + 0.05, BAR(39) - 0.12, 'Ngoài kén, mới là 【thế giới thật】.'],
  [BAR(39) + 0.15, END + 1, 'Gần đây, câu 【“trên mạng ai cũng nói vậy”】 nào bạn hay lướt thấy nhất?'],
];

const Caption: React.FC<{f: number; a: number; b: number; text: string; top?: number}> = ({f, a, b, text, top = 250}) => {
  const fa = S(a);
  const fb = S(b);
  if (f < fa - 2 || f > fb + 10) return null;
  const words: {w: string; hi: boolean}[] = [];
  let hi = false;
  for (const raw of text.split(' ')) {
    if (raw.includes('【')) hi = true;
    const close = raw.includes('】');
    words.push({w: raw.replace(/[【】]/g, ''), hi});
    if (close) hi = false;
  }
  const out = 1 - ease((f - fb) / 8);
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top, textAlign: 'center', fontFamily: SUB, fontSize: 54, lineHeight: 1.42, color: TXT, opacity: out, filter: blurV(out)}}>
      {words.map((x, i) => {
        const v = a < 0 ? 1 : ease((f - fa - i * 2) / 7);
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

const Foot: React.FC<{f: number; a: number; b: number; text: string}> = ({f, a, b, text}) => {
  const v = io(f, S(a), S(b), 10);
  if (v <= 0) return null;
  return <div style={{position: 'absolute', left: 60, right: 60, bottom: 120, textAlign: 'center', fontFamily: SUB, fontSize: 24, letterSpacing: 1, color: 'rgba(246,243,234,0.42)', opacity: v}}>{text}</div>;
};

/* ============================== NGƯỜI (line-art ngồi, nhìn nghiêng) ============================== */
const Person: React.FC<{x: number; y: number; s?: number; mirror?: boolean; hair?: 'bun' | 'short'; day?: boolean; phone?: number; tone?: string}> = ({x, y, s = 1, mirror, hair = 'short', day, phone = 1, tone = GOLD}) => {
  const stroke = day ? 'rgba(0,0,0,0)' : LINE;
  const fill = day ? '#2b2130' : 'url(#e65body)';
  return (
    <g transform={`translate(${x},${y}) scale(${(mirror ? -1 : 1) * s},${s})`}>
      {/* chân */}
      <path d="M -66,398 L 168,392 L 172,446 L -72,456 Z" fill={fill} stroke={stroke} strokeWidth={2.4} />
      <path d="M 136,404 L 176,412 L 168,636 L 128,636 Z" fill={fill} stroke={stroke} strokeWidth={2.4} />
      <path d="M 124,636 L 196,636 L 200,652 L 122,652 Z" fill={fill} stroke={stroke} strokeWidth={2} />
      {/* thân */}
      <path d="M -26,74 C -80,126 -96,262 -82,424 L 92,424 C 104,330 76,226 44,146 C 32,108 26,90 18,76 Z" fill={fill} stroke={stroke} strokeWidth={2.6} />
      {/* tay */}
      <path d="M 8,140 C 22,210 34,262 44,286 C 70,262 98,236 122,212" fill="none" stroke={day ? fill : '#2a221b'} strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 8,140 C 22,210 34,262 44,286 C 70,262 98,236 122,212" fill="none" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" />
      {/* điện thoại + ánh màn hình */}
      {phone > 0 && !day ? <circle cx={120} cy={150} r={120} fill="url(#e65phone)" opacity={phone} /> : null}
      <rect x={110} y={184} width={30} height={52} rx={6} transform="rotate(-28 125 210)" fill={day ? fill : phone > 0 ? '#cfe2ff' : '#1a1512'} opacity={day ? 1 : 0.55 + 0.45 * phone} stroke={stroke} strokeWidth={1.5} />
      {/* đầu */}
      <ellipse cx={0} cy={0} rx={56} ry={60} fill={fill} stroke={stroke} strokeWidth={2.6} />
      {hair === 'bun' ? (
        <>
          <circle cx={-52} cy={-42} r={26} fill={fill} stroke={stroke} strokeWidth={2.4} />
          <path d="M -58,-6 C -62,-56 -20,-72 18,-58 C 40,-50 52,-30 56,-10 C 30,-30 -10,-30 -58,-6 Z" fill={day ? fill : '#3b3027'} stroke={stroke} strokeWidth={1.8} />
        </>
      ) : (
        <path d="M -58,0 C -62,-52 -18,-70 22,-60 C 44,-52 56,-34 58,-16 C 34,-34 -6,-40 -58,0 Z" fill={day ? fill : '#3b3027'} stroke={stroke} strokeWidth={1.8} />
      )}
      {!day ? <ellipse cx={0} cy={0} rx={64} ry={68} fill="none" stroke={tone} strokeOpacity={0.18} strokeWidth={8} filter="url(#e65soft)" /> : null}
    </g>
  );
};

/* ============================== KÉN SỢI ============================== */
const N_LOOP = 30;
const Cocoon: React.FC<{f: number; x: number; y: number; r: number; prog: number; color: string; seed?: number; spin?: number; o?: number; burst?: number; red?: number}> = ({f, x, y, r, prog, color, seed = 1, spin = 1, o = 1, burst = 0, red = 0}) => {
  if (o <= 0 || prog <= 0) return null;
  const n = prog * N_LOOP;
  const loops: React.ReactNode[] = [];
  for (let i = 0; i < N_LOOP; i++) {
    if (i >= n) break;
    const part = Math.min(1, n - i);
    const k = seed * 31 + i;
    const rx = r * (0.78 + 0.32 * rnd(k)) * (1 + burst * (1.5 + rnd(k + 9) * 2));
    const ry = r * (0.5 + 0.42 * rnd(k + 3)) * (1 + burst * (1.5 + rnd(k + 7) * 2));
    const rot = rnd(k + 5) * 180 + (f / 30) * spin * (12 + 30 * rnd(k + 2)) * (rnd(k + 4) > 0.5 ? 1 : -1);
    const dx = (rnd(k + 6) - 0.5) * r * 0.16;
    const dy = (rnd(k + 8) - 0.5) * r * 0.16;
    const c = red > 0 && rnd(k + 11) < red ? RED_HOT : color;
    loops.push(
      <ellipse key={i} cx={dx} cy={dy} rx={rx} ry={ry} transform={`rotate(${rot.toFixed(1)})`} fill="none" stroke={c} strokeWidth={1.6 + rnd(k + 1) * 1.6} strokeOpacity={(0.45 + 0.4 * rnd(k + 10)) * (1 - burst)} pathLength={1} strokeDasharray={part < 1 ? `${part} 1` : undefined} />,
    );
  }
  return (
    <g transform={`translate(${x},${y})`} opacity={o} style={{mixBlendMode: 'screen'}}>
      <g filter="url(#e65glow)">{loops}</g>
      <g>{loops}</g>
    </g>
  );
};

/* ============================== THẺ FEED ============================== */
const Card: React.FC<{f: number; at: number; text: string; x: number; y: number; w?: number; tone?: string; hot?: boolean; out?: number; small?: boolean}> = ({f, at, text, x, y, w = 400, tone = GOLD, hot, out, small}) => {
  const v = ease((f - S(at)) / 7) * (out !== undefined ? 1 - ease((f - S(out)) / 8) : 1);
  if (v <= 0) return null;
  const pop = 1 + 0.1 * Math.exp(-Math.max(0, f - S(at)) / 3.5);
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, opacity: v, transform: `translateY(${(1 - v) * 26}px) scale(${pop})`, filter: blurV(v)}}>
      <div style={{border: `2px solid ${hot ? 'rgba(255,100,80,0.85)' : tone}`, borderRadius: 18, background: hot ? 'rgba(70,16,10,0.75)' : 'rgba(22,17,13,0.86)', padding: small ? '14px 20px' : '18px 24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: `0 0 26px ${hot ? 'rgba(255,70,50,0.35)' : 'rgba(255,200,130,0.16)'}`}}>
        <div style={{width: small ? 44 : 56, height: small ? 44 : 56, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg, ${tone}55, ${tone}11)`, border: `1px solid ${tone}88`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width={20} height={20} viewBox="0 0 20 20"><path d="M6,4 L16,10 L6,16 Z" fill={tone} /></svg>
        </div>
        <span style={{fontFamily: SUB, fontSize: small ? 28 : 34, lineHeight: 1.25, color: hot ? RED_HOT : TXT}}>{text}</span>
      </div>
    </div>
  );
};

/* ============================== CẢNH ============================== */
const Fade: React.FC<{f: number; a: number; b: number; d?: number; children: React.ReactNode; first?: boolean; last?: boolean}> = ({f, a, b, d = 10, children, first, last}) => {
  const vin = first ? 1 : ease((f - S(a)) / d);
  const vout = last ? 1 : 1 - ease((f - S(b)) / d);
  const v = vin * vout;
  if (v <= 0) return null;
  const sc = 1 + (1 - vin) * 0.05 - (1 - vout) * 0.04;
  return <AbsoluteFill style={{opacity: v, transform: `scale(${sc})`, filter: v < 0.999 ? `blur(${((1 - v) * 8).toFixed(1)}px)` : undefined}}>{children}</AbsoluteFill>;
};

const Defs = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <linearGradient id="e65body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#56463a" />
        <stop offset="0.55" stopColor="#2c241d" />
        <stop offset="1" stopColor="#110d0a" />
      </linearGradient>
      <radialGradient id="e65phone" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="rgba(170,200,255,0.42)" />
        <stop offset="1" stopColor="rgba(170,200,255,0)" />
      </radialGradient>
      <filter id="e65glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
      <filter id="e65soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" /></filter>
    </defs>
  </svg>
);

/** Hồi 1: hai người ngồi quay lưng, feed trên đầu → kén */
const Bench: React.FC<{f: number; t: number}> = ({f, t}) => {
  const P = [
    {x: 330, mirror: true, hair: 'short' as const, color: BLUE, seed: 3, cards: ['Làm đàn ông khổ quá', 'Đàn ông khóc là bị cười', 'Vợ nói gì cũng phải nghe'], at: [BAR(-3.6), BAR(-3.1), BAR(-2.6)]},
    {x: 750, mirror: false, hair: 'bun' as const, color: ORANGE, seed: 7, cards: ['Yêu đương đáng sợ lắm', 'Anh ta chơi game, không rep tin', 'Đừng tin đàn ông'], at: [BAR(-1.75), BAR(-1.4), BAR(-1.05)]},
  ];
  const hy = 1010;
  const cocoonP = seg(t, [[D1 - 0.05, 0], [D1 + 0.9, 0.42], [BAR(2), 0.5], [BAR(4), 0.62], [BAR(5.5), 0.78], [BAR(7), 0.86]]);
  const cardsOut = D1 - 0.1;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <rect x={110} y={hy + 422} width={860} height={22} rx={6} fill="#241c16" stroke={LINE} strokeWidth={2} />
        <rect x={150} y={hy + 444} width={16} height={190} fill="#1c1611" stroke={LINE} strokeWidth={1.5} />
        <rect x={914} y={hy + 444} width={16} height={190} fill="#1c1611" stroke={LINE} strokeWidth={1.5} />
        {P.map((p, i) => <Person key={i} x={p.x} y={hy} mirror={p.mirror} hair={p.hair} tone={p.color} phone={1} />)}
        {P.map((p, i) => (
          <Cocoon key={`c${i}`} f={f} x={p.x} y={hy} r={150} prog={cocoonP} color={p.color} seed={p.seed} />
        ))}
      </svg>
      {/* feed trên đầu */}
      {P.map((p, i) =>
        p.cards.map((c, j) => {
          // khi drop: thẻ bị hút vào đầu
          const suck = clamp01((t - (cardsOut - 0.25)) / 0.35);
          const cardTop = 520 + j * 104;
          return (
            <div key={`${i}-${j}`} style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translate(${(p.x - p.x) * suck}px, ${(hy - cardTop - 40) * suck * suck}px) scale(${1 - 0.7 * suck})`, transformOrigin: `${p.x}px ${cardTop + 40}px`, opacity: 1 - suck}}>
              <Card f={f} at={p.at[j]} text={c} x={p.x} y={cardTop} w={410} tone={p.color} small />
            </div>
          );
        }),
      )}
      {/* nhãn “Mình đúng” */}
      {P.map((p, i) => {
        const at = MID(6) + i * BP * 0.5;
        const v = io(f, S(at), S(BAR(7)), 5);
        if (v <= 0) return null;
        const pop = 1 + 0.35 * Math.exp(-Math.max(0, f - S(at)) / 3);
        return (
          <div key={`tag${i}`} style={{position: 'absolute', left: p.x - 130, width: 260, top: hy - 250, textAlign: 'center', opacity: v, transform: `scale(${pop})`}}>
            <span style={{display: 'inline-block', padding: '12px 26px', borderRadius: 40, border: `2px solid ${p.color}`, background: 'rgba(15,12,10,0.85)', fontFamily: SUB, fontSize: 36, color: p.color, boxShadow: `0 0 30px ${p.color}55`}}>✓ Mình đúng</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Tiêu đề tại drop 1 */
const Title: React.FC<{f: number}> = ({f}) => {
  const a = S(D1);
  const b = S(BAR(2) - 0.05);
  const v = io(f, a, b, 6);
  if (v <= 0) return null;
  const pop = 1 + 0.16 * Math.exp(-Math.max(0, f - a) / 4);
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 210, textAlign: 'center', opacity: v, transform: `scale(${pop})`}}>
      <div style={{fontFamily: DISP, fontStyle: 'italic', fontWeight: 500, fontSize: 40, color: GOLD, letterSpacing: 2}}>Information Cocoons</div>
      <div style={{fontFamily: DISP, fontWeight: 900, fontSize: 116, lineHeight: 1.05, whiteSpace: 'nowrap', color: RED_HOT, textShadow: '0 0 40px rgba(255,80,60,0.55)', marginTop: 8}}>KÉN THÔNG TIN</div>
      <div style={{fontFamily: SUB, fontSize: 26, color: 'rgba(246,243,234,0.55)', letterSpacing: 4, marginTop: 14}}>CASS R. SUNSTEIN · 2006</div>
    </div>
  );
};

/** Hồi 1b: 6 kén nhỏ */
const GRID = ['Thi cử', 'Bạn cùng tuổi', 'Vóc dáng', 'Điểm số', 'Công việc', 'Nhan sắc'];
const Grid6: React.FC<{f: number; t: number}> = ({f, t}) => {
  const cols = [220, 540, 860];
  const rows = [880, 1300];
  const tones = [ORANGE, GOLD, '#ff9a7a', BLUE, '#c9a2ff', '#ffd27a'];
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {GRID.map((g, i) => {
          const at = BAR(8) + i * BP;
          const x = cols[i % 3];
          const y = rows[Math.floor(i / 3)];
          const v = clamp01((t - at + 0.25) / 0.25);
          if (v <= 0) return null;
          const p = seg(t, [[at - 0.1, 0], [at + 0.5, 0.55], [BAR(9.5), 0.8]]);
          return (
            <g key={i} opacity={v}>
              <g transform={`translate(${x},${y}) scale(0.42)`}>
                <ellipse cx={0} cy={0} rx={56} ry={60} fill="url(#e65body)" stroke={LINE} strokeWidth={4} />
                <path d="M -40,70 C -100,110 -130,180 -136,260 L 136,260 C 130,180 100,110 40,70 Z" fill="url(#e65body)" stroke={LINE} strokeWidth={4} />
              </g>
              <Cocoon f={f} x={x} y={y} r={92} prog={p} color={tones[i]} seed={20 + i} />
            </g>
          );
        })}
      </svg>
      {GRID.map((g, i) => {
        const at = BAR(8) + i * BP;
        const v = clamp01((t - at + 0.25) / 0.25);
        if (v <= 0) return null;
        return (
          <div key={i} style={{position: 'absolute', left: cols[i % 3] - 150, width: 300, top: rows[Math.floor(i / 3)] + 150, textAlign: 'center', opacity: v, fontFamily: SUB, fontSize: 36, color: TXT, textShadow: '0 2px 8px #000'}}>{g}</div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Hồi 2: một người, feed bạn cùng tuổi, đồng hồ dừng */
const Peer: React.FC<{f: number; t: number}> = ({f, t}) => {
  const hx = 440;
  const hy = 1110;
  const prog = seg(t, [[BAR(9.5), 0.3], [BAR(10) + 0.7, 0.42], [BAR(10.5) + 0.7, 0.52], [BAR(11) + 0.7, 0.6], [BAR(12.5), 0.7], [MID(14), 0.72], [MID(14) + 0.4, 0.9], [BAR(16), 0.92]]);
  const red = seg(t, [[BAR(12.5), 0], [BAR(12.5) + 0.6, 0.45], [BAR(16), 0.45]]);
  const cards = [
    {at: BAR(9.5) + 0.55, text: 'Năm 3 đã có offer công ty lớn'},
    {at: BAR(10) + 0.55, text: '22 tuổi, lương 30 triệu/tháng'},
    {at: BAR(10.5) + 0.55, text: 'Ra trường 1 năm, mua xe'},
  ];
  // đồng hồ dừng
  const tm = seg(t, [[BAR(11), 1.7], [BAR(12.5), 3.2]]);
  const tv = io(f, S(BAR(11)), S(BAR(16)), 6);
  const hot = t >= BAR(12.5);
  const heart = t >= BAR(12.5) ? Math.exp(-((t - BAR(12.5)) % BP) / 0.1) : 0;
  const logV = io(f, S(MID(14)), S(BAR(16)), 5);
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <Person x={hx} y={hy} s={1.02} tone={hot ? RED_HOT : GOLD} />
        <Cocoon f={f} x={hx} y={hy} r={160 + heart * 6} prog={prog} color={ORANGE} seed={41} red={red} />
      </svg>
      {cards.map((c, i) => (
        <Card key={i} f={f} at={c.at} text={c.text} x={560} y={500 + i * 116} w={720} hot={hot && i === 2} />
      ))}
      {tv > 0 ? (
        <div style={{position: 'absolute', right: 70, top: 840, opacity: tv, textAlign: 'right'}}>
          <div style={{fontFamily: SUB, fontSize: 26, color: 'rgba(246,243,234,0.6)', letterSpacing: 3}}>ĐÃ DỪNG</div>
          <div style={{fontFamily: DISP, fontWeight: 900, fontSize: 96, color: hot ? RED_HOT : TXT, textShadow: hot ? '0 0 30px rgba(255,80,60,0.6)' : undefined}}>{tm.toFixed(1).replace('.', ',')}<span style={{fontFamily: SUB, fontSize: 48, marginLeft: 6}}>giây</span></div>
        </div>
      ) : null}
      {logV > 0 ? (
        <div style={{position: 'absolute', right: 70, top: 1010, opacity: logV, transform: `scale(${1 + 0.2 * Math.exp(-Math.max(0, f - S(MID(14))) / 3)})`, transformOrigin: 'right center'}}>
          <span style={{display: 'inline-block', padding: '10px 20px', borderRadius: 12, border: `2px solid ${RED_HOT}`, color: RED_HOT, fontFamily: SUB, fontSize: 28, background: 'rgba(60,14,10,0.8)'}}>đã ghi: thích ✓</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Hồi 3: điện thoại thử nghiệm WSJ */
const FEED: [string, boolean][] = [
  ['Mèo nhảy múa', false], ['Công thức mì trộn', false], ['Hoàng hôn buồn', true], ['Hài tình huống', false], ['Lại mất ngủ', true], ['Review điện thoại', false], ['Không muốn đi làm', true], ['Một mình cũng quen', true], ['Du lịch Đà Lạt', false], ['Chẳng ai hiểu mình', true], ['Mệt lắm rồi', true], ['Khóc một mình', true], ['Lại một ngày tệ', true], ['Không ai hỏi han', true], ['Chán tất cả', true], ['Mình có ổn không', true],
];
const Phone: React.FC<{f: number; t: number}> = ({f, t}) => {
  const a = BAR(16);
  const u = clamp01((t - a) / (D2 - a));
  const cnt = Math.max(1, Math.round(1 + 223 * Math.pow(u, 2.2)));
  const sad = t >= D2 ? 93 : Math.round(93 * Math.pow(u, 1.6));
  // tốc độ lướt tăng dần
  const idx = Math.floor(Math.pow(u, 1.5) * 34);
  const after = t >= D2;
  const dim = after ? 0.1 + 0.9 * Math.exp(-(t - D2) / 0.15) : 1;
  const sc = after ? 1 - 0.12 * ease((t - D2) / 0.4) : 1;
  const linger = (i: number) => FEED[i % FEED.length][1];
  const items = [idx, idx + 1, idx + 2].map((i) => FEED[i % FEED.length]);
  const frac = (Math.pow(u, 1.5) * 34) % 1;
  return (
    <AbsoluteFill style={{opacity: dim, transform: `scale(${sc})`}}>
      <div style={{position: 'absolute', left: 250, top: 560, width: 580, height: 1040, borderRadius: 64, border: `3px solid ${LINE}`, background: 'linear-gradient(180deg, #17120e, #0c0a08)', boxShadow: '0 0 60px rgba(255,200,140,0.12)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', fontFamily: SUB, fontSize: 24, letterSpacing: 4, color: GOLD}}>TÀI KHOẢN THỬ</div>
        <div style={{position: 'absolute', left: 40, right: 40, top: 76, display: 'flex', justifyContent: 'space-between', fontFamily: SUB, fontSize: 30, color: TXT}}>
          <span>Video #{cnt}</span>
          <span style={{color: RED_HOT}}>buồn {sad}%</span>
        </div>
        <div style={{position: 'absolute', left: 40, right: 40, top: 128, height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.08)'}}>
          <div style={{width: `${sad}%`, height: '100%', borderRadius: 7, background: `linear-gradient(90deg, ${RED}, ${RED_HOT})`, boxShadow: '0 0 16px rgba(255,80,60,0.6)'}} />
        </div>
        {items.map(([txt, s], i) => {
          const y = 180 + (i - frac) * 290;
          const isLinger = s && i === 0 && t < D2;
          return (
            <div key={`${idx + i}`} style={{position: 'absolute', left: 36, right: 36, top: y, height: 270, borderRadius: 26, border: `2px solid ${s ? 'rgba(255,110,90,0.7)' : 'rgba(240,212,165,0.35)'}`, background: s ? 'linear-gradient(160deg, rgba(70,26,30,0.9), rgba(20,14,22,0.9))' : 'linear-gradient(160deg, rgba(60,48,34,0.9), rgba(22,18,14,0.9))', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 26}}>
              <span style={{fontFamily: SUB, fontSize: 38, color: s ? RED_HOT : TXT}}>{txt}</span>
              <span style={{fontFamily: SUB, fontSize: 22, color: 'rgba(246,243,234,0.45)', marginTop: 6}}>{s ? (isLinger ? '▶ xem lại · dừng lâu' : '#buồn') : '#vui'}</span>
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 170, background: 'linear-gradient(180deg, #17120e 70%, rgba(23,18,14,0))'}} />
      </div>
      {linger(idx) ? null : null}
    </AbsoluteFill>
  );
};

const Big93: React.FC<{f: number}> = ({f}) => {
  const a = S(D2);
  const v = io(f, a, S(BAR(22)), 5);
  if (v <= 0) return null;
  const pop = 1 + 0.4 * Math.exp(-Math.max(0, f - a) / 3.5);
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 820, textAlign: 'center', opacity: v, transform: `scale(${pop})`}}>
      <div style={{fontFamily: DISP, fontWeight: 900, fontSize: 330, lineHeight: 1, color: RED_HOT, textShadow: '0 0 60px rgba(255,70,50,0.7), 0 0 140px rgba(255,40,20,0.4)'}}>93%</div>
      <div style={{fontFamily: SUB, fontSize: 40, color: TXT, marginTop: 10, textShadow: '0 3px 10px #000'}}>là video buồn</div>
    </div>
  );
};

/** Hồi 4: kén siết, vòng lặp, bảng tính */
const Loop: React.FC<{f: number; t: number}> = ({f, t}) => {
  const hx = 540;
  const hy = 1120;
  const r = seg(t, [[BAR(22), 175], [BAR(24), 128], [BAR(29), 122]]);
  const prog = seg(t, [[BAR(22), 0.75], [BAR(23), 1]]);
  const red = seg(t, [[BAR(22), 0.2], [BAR(24), 0.5]]);
  const ringV = io(f, S(BAR(27) - 0.1), S(BAR(29) + 1), 8);
  const LABELS = ['Bạn dừng lại', 'Nó đẩy chuẩn hơn', 'Bạn hoảng hơn', 'Bạn lại dừng'];
  const R = 300;
  const pos = [
    [hx, hy - R],
    [hx + R, hy],
    [hx, hy + R],
    [hx - R, hy],
  ];
  const step = BP * 2;
  const k = t >= BAR(27) ? Math.floor((t - BAR(27)) / step) : -1;
  const ang = t >= BAR(27) ? ((t - BAR(27)) / (step * 4)) * Math.PI * 2 - Math.PI / 2 : -Math.PI / 2;
  const clock = io(f, S(BAR(24)), S(BAR(27)), 6);
  const stV = io(f, S(BAR(25.5)), S(BAR(27) + 0.2), 6);
  const dayV = io(f, S(BAR(28)), S(BAR(29)), 5);
  const day = t < BAR(28.5) ? 13 : 34;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <Person x={hx - 60} y={hy} s={0.95} tone={RED_HOT} />
        <Cocoon f={f} x={hx - 60} y={hy} r={r} prog={prog} color={ORANGE} seed={77} red={red} spin={1 + clamp01((t - BAR(27)) / 4) * 2} />
        {ringV > 0 ? (
          <g opacity={ringV}>
            <circle cx={hx} cy={hy} r={R} fill="none" stroke={RED} strokeWidth={4} strokeOpacity={0.75} strokeDasharray="18 12" strokeDashoffset={-f * 2} />
            {[0, 1, 2, 3].map((i) => {
              const a0 = -Math.PI / 2 + i * (Math.PI / 2) + 0.55;
              const ax = hx + R * Math.cos(a0);
              const ay = hy + R * Math.sin(a0);
              const rot = (a0 * 180) / Math.PI + 90;
              return <path key={i} d="M -14,-10 L 10,0 L -14,10 Z" fill={RED_HOT} transform={`translate(${ax},${ay}) rotate(${rot})`} />;
            })}
            <circle cx={hx + R * Math.cos(ang)} cy={hy + R * Math.sin(ang)} r={14} fill={RED_HOT} filter="url(#e65glow)" />
            <circle cx={hx + R * Math.cos(ang)} cy={hy + R * Math.sin(ang)} r={8} fill="#fff" />
          </g>
        ) : null}
      </svg>
      {ringV > 0
        ? LABELS.map((l, i) => {
            const lit = k >= 0 && k % 4 === i;
            const litAge = lit ? t - (BAR(27) + k * step) : 9;
            return (
              <div key={i} style={{position: 'absolute', left: pos[i][0] - 170, width: 340, top: pos[i][1] - 32, textAlign: 'center', opacity: ringV}}>
                <span style={{display: 'inline-block', padding: '10px 20px', borderRadius: 14, border: `2px solid ${lit ? RED_HOT : 'rgba(255,110,90,0.45)'}`, background: lit ? 'rgba(90,18,12,0.92)' : 'rgba(18,12,10,0.88)', color: lit ? '#fff' : 'rgba(255,190,170,0.8)', fontFamily: SUB, fontSize: 32, transform: `scale(${1 + 0.18 * Math.exp(-litAge / 0.12)})`, boxShadow: lit ? '0 0 30px rgba(255,70,50,0.5)' : undefined}}>{l}</span>
              </div>
            );
          })
        : null}
      {clock > 0 ? (
        <div style={{position: 'absolute', left: 640, top: 900, opacity: clock, fontFamily: DISP, fontWeight: 800, fontSize: 64, color: TXT}}>
          01:47 <span style={{fontFamily: SUB, fontSize: 22, color: GOLD, letterSpacing: 4}}>ĐÊM</span>
        </div>
      ) : null}
      {stV > 0 ? (
        <div style={{position: 'absolute', left: 150, right: 150, top: 470, opacity: stV, border: `2px solid ${LINE}`, borderRadius: 22, background: 'rgba(16,12,9,0.9)', padding: '20px 30px'}}>
          <div style={{fontFamily: SUB, fontSize: 24, letterSpacing: 4, color: GOLD, marginBottom: 10}}>NÓ ĐANG TÍNH VỀ BẠN</div>
          {[['xem hết', 87], ['bình luận', 41], ['chia sẻ', 12]].map(([lb, val], i) => {
            const at = BAR(25.5) + 0.25 + i * BP;
            const g = ease((f - S(at)) / 10);
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, margin: '10px 0'}}>
                <span style={{width: 180, fontFamily: SUB, fontSize: 30, color: TXT}}>{lb}</span>
                <div style={{flex: 1, height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.08)'}}>
                  <div style={{width: `${(val as number) * g}%`, height: '100%', borderRadius: 8, background: i === 0 ? RED_HOT : GOLD}} />
                </div>
                <span style={{width: 90, textAlign: 'right', fontFamily: SUB, fontSize: 30, color: i === 0 ? RED_HOT : TXT}}>{Math.round((val as number) * g)}%</span>
              </div>
            );
          })}
        </div>
      ) : null}
      {dayV > 0 ? (
        <div style={{position: 'absolute', left: 0, width: W, top: 470, textAlign: 'center', opacity: dayV}}>
          <span style={{display: 'inline-block', padding: '12px 30px', borderRadius: 16, border: `2px solid ${LINE}`, background: 'rgba(16,12,9,0.9)', fontFamily: SUB, fontSize: 36, color: TXT}}>
            Ngày <span style={{color: RED_HOT}}>{day}</span> · vẫn là mấy thứ đó
          </span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Hồi 5: đám đông + 3 lớp lọc */
const BANDS = [
  {y: 900, label: 'Lớp 1 · Người đăng', on: BAR(30), tone: GOLD, pass: 0.32},
  {y: 1060, label: 'Lớp 2 · Thuật toán', on: BAR(31), tone: BLUE, pass: 0.4},
  {y: 1220, label: 'Lớp 3 · Chính bạn', on: BAR(32), tone: ORANGE, pass: 0.5},
];
const CROWD_C = ['#e9c37a', '#d9776b', '#8fb2e6', '#b99be0', '#e7a873', '#9fd1a8'];
const Filters: React.FC<{f: number; t: number}> = ({f, t}) => {
  const a = BAR(29);
  const finger = t >= BAR(33);
  const parts: React.ReactNode[] = [];
  for (let i = 0; i < 160; i++) {
    const t0 = a + 0.2 + i * 0.055;
    const age = t - t0;
    if (age < 0) break;
    const x = 140 + rnd(i * 3 + 1) * 800;
    let y = 780 + age * 420;
    let alive = 1;
    let stopAt = 9999;
    for (let b = 0; b < 3; b++) {
      const B = BANDS[b];
      const tHit = t0 + (B.y - 780) / 420;
      if (tHit >= B.on && rnd(i * 7 + b) > B.pass && stopAt === 9999) stopAt = b;
    }
    if (stopAt < 9) {
      const By = BANDS[stopAt].y;
      if (y > By) {
        const over = (y - By) / 420;
        y = By + 6;
        alive = 1 - clamp01(over / 0.35);
      }
    }
    if (y > 1480) alive *= 1 - clamp01((y - 1480) / 60);
    if (alive <= 0) continue;
    const c = CROWD_C[i % CROWD_C.length];
    parts.push(<circle key={i} cx={x + Math.sin(age * 3 + i) * 6} cy={y} r={7} fill={c} opacity={alive * 0.9} />);
  }
  const ck = seg(t, [[a, 0.35], [BAR(33), 0.85]]);
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {/* đám đông */}
        {Array.from({length: 26 * 4}, (_, i) => {
          const cx = 70 + (i % 26) * 37.6;
          const cy = 560 + Math.floor(i / 26) * 52;
          const c = CROWD_C[Math.floor(rnd(i + 0.3) * 6)];
          return (
            <g key={i} opacity={0.85}>
              <circle cx={cx} cy={cy} r={9} fill={c} />
              <path d={`M ${cx - 13},${cy + 30} C ${cx - 12},${cy + 14} ${cx + 12},${cy + 14} ${cx + 13},${cy + 30} Z`} fill={c} />
            </g>
          );
        })}
        {parts}
        {BANDS.map((B, i) => {
          const v = clamp01((t - B.on + 0.2) / 0.3);
          const hot = finger && i === 2;
          const pts = Array.from({length: 41}, (_, k) => `${40 + k * 25},${B.y + Math.sin(k * 0.6 + f / 9 + i) * 6}`).join(' ');
          return (
            <g key={i} opacity={0.25 + 0.75 * v}>
              <polyline points={pts} fill="none" stroke={hot ? RED_HOT : B.tone} strokeWidth={hot ? 7 : 4} filter="url(#e65glow)" />
              <polyline points={pts} fill="none" stroke={hot ? RED_HOT : B.tone} strokeWidth={2.5} />
              <polyline points={pts} fill="none" stroke={hot ? RED_HOT : B.tone} strokeWidth={1} strokeOpacity={0.5} transform="translate(0,14)" />
            </g>
          );
        })}
        <Cocoon f={f} x={540} y={1560} r={110} prog={ck} color={ORANGE} seed={91} />
        <g transform="translate(540,1560) scale(0.42)">
          <ellipse cx={0} cy={0} rx={56} ry={60} fill="url(#e65body)" stroke={LINE} strokeWidth={4} />
        </g>
      </svg>
      {BANDS.map((B, i) => {
        const v = clamp01((t - B.on + 0.2) / 0.3);
        if (v <= 0) return null;
        const hot = finger && i === 2;
        const pop = 1 + 0.25 * Math.exp(-Math.max(0, f - S(B.on)) / 3);
        return (
          <div key={i} style={{position: 'absolute', left: 50, top: B.y - 70, opacity: v, transform: `scale(${pop})`, transformOrigin: 'left center'}}>
            <span style={{display: 'inline-block', padding: '8px 18px', borderRadius: 10, border: `2px solid ${hot ? RED_HOT : B.tone}`, background: 'rgba(14,11,9,0.92)', color: hot ? RED_HOT : B.tone, fontFamily: SUB, fontSize: 28}}>{B.label}</span>
          </div>
        );
      })}
      {finger ? (
        <div style={{position: 'absolute', right: 80, top: 1140, opacity: io(f, S(BAR(33)), S(BAR(34.3)), 5)}}>
          <svg width={120} height={150} viewBox="0 0 120 150">
            <path d="M 50,140 L 50,60 C 50,44 72,44 72,60 L 72,96 L 96,100 C 108,102 112,112 110,124 L 104,140" fill="none" stroke={RED_HOT} strokeWidth={5} strokeLinecap="round" />
            <path d={`M 61,${36 - (f % 20)} L 61,${6 - (f % 20)} M 50,${18 - (f % 20)} L 61,${4 - (f % 20)} L 72,${18 - (f % 20)}`} stroke={RED_HOT} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.9} />
          </svg>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Hồi 6: thành phố đêm, một chấm “bạn” */
const City: React.FC<{f: number; t: number}> = ({f, t}) => {
  const a = BAR(34.3);
  const z = seg(t, [[a, 1.9], [D3, 1.0]]);
  const blds = Array.from({length: 22}, (_, i) => ({x: i * 50 - 10 + rnd(i) * 12, w: 40 + rnd(i + 1) * 26, h: 300 + rnd(i + 2) * 700}));
  return (
    <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '540px 1300px'}}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {blds.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={1720 - b.h} width={b.w} height={b.h} fill="#0f0c0a" stroke="rgba(240,212,165,0.18)" strokeWidth={1} />
            {Array.from({length: Math.floor(b.h / 26)}, (_, r) =>
              [0, 1, 2].map((c) => {
                const k = i * 97 + r * 7 + c;
                if (rnd(k) < 0.45) return null;
                const tw = 0.5 + 0.5 * Math.sin(f / (20 + rnd(k + 1) * 40) + k);
                return <rect key={`${r}-${c}`} x={b.x + 6 + c * ((b.w - 12) / 3)} y={1720 - b.h + 10 + r * 26} width={5} height={8} fill={CROWD_C[k % 6]} opacity={0.35 + 0.5 * tw} />;
              }),
            )}
          </g>
        ))}
        <circle cx={540} cy={1300} r={40} fill="none" stroke={GOLD} strokeOpacity={0.5} strokeWidth={2} />
        <circle cx={540} cy={1300} r={12} fill="#fff" filter="url(#e65glow)" />
        <circle cx={540} cy={1300} r={7} fill="#fff" />
      </svg>
      <div style={{position: 'absolute', left: 440, width: 200, top: 1350, textAlign: 'center', fontFamily: SUB, fontSize: 32, color: TXT}}>bạn</div>
    </AbsoluteFill>
  );
};

/** Hồi 7: ngoài kén — phố ban ngày */
const Day: React.FC<{f: number; t: number; bench?: boolean}> = ({f, t, bench}) => {
  const blds = Array.from({length: 14}, (_, i) => ({x: i * 82 - 20 + rnd(i + 40) * 20, w: 70 + rnd(i + 41) * 40, h: 260 + rnd(i + 42) * 520}));
  const walkers = Array.from({length: 7}, (_, i) => ({x0: rnd(i + 60) * 1200 - 60, sp: (rnd(i + 61) > 0.5 ? 1 : -1) * (40 + rnd(i + 62) * 50), s: 0.8 + rnd(i + 63) * 0.4}));
  const tt = t - D3;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #2b2340 0%, #6a4a62 38%, #d98f6d 70%, #f2c08a 100%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 64%, rgba(255,226,170,0.75) 0%, rgba(255,200,140,0.25) 18%, rgba(0,0,0,0) 40%)'}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {Array.from({length: 6}, (_, i) => {
          const bx = ((rnd(i + 80) * 1100 + tt * (30 + i * 6)) % 1200) - 60;
          const by = 520 + rnd(i + 81) * 260;
          const fl = Math.sin(f / 4 + i) * 6;
          return <path key={i} d={`M ${bx - 12},${by + fl} Q ${bx - 5},${by - 6} ${bx},${by} Q ${bx + 5},${by - 6} ${bx + 12},${by + fl}`} stroke="#2b2130" strokeWidth={2.5} fill="none" />;
        })}
        {blds.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={1500 - b.h} width={b.w} height={b.h} fill="#3a2b3c" />
            {Array.from({length: Math.floor(b.h / 60)}, (_, r) =>
              [0, 1].map((c) => (rnd(i * 31 + r * 3 + c) > 0.5 ? <rect key={`${r}-${c}`} x={b.x + 12 + c * (b.w / 2 - 6)} y={1500 - b.h + 20 + r * 60} width={b.w / 2 - 24} height={30} fill="#ffcf8a" opacity={0.75} /> : null)),
            )}
          </g>
        ))}
        <rect x={0} y={1500} width={W} height={420} fill="#2b2130" />
        {!bench
          ? walkers.map((w, i) => {
              const x = ((w.x0 + tt * w.sp) % 1260 + 1260) % 1260 - 90;
              const step = Math.sin(f / 4 + i * 2) * 10;
              return (
                <g key={i} transform={`translate(${x},1500) scale(${w.s})`} fill="#1e1722">
                  <circle cx={0} cy={-190} r={20} />
                  <path d="M -20,-166 L 20,-166 L 24,-80 L -24,-80 Z" />
                  <path d={`M -14,-82 L ${-14 + step},0 L ${-4 + step},0 L 0,-70 L ${4 - step},0 L ${14 - step},0 L 14,-82 Z`} />
                </g>
              );
            })
          : null}
        {bench ? (
          <>
            <rect x={110} y={1062 + 422} width={860} height={22} rx={6} fill="#2b2130" />
            <Person x={330} y={1062} day phone={0} />
            <Person x={750} y={1062} mirror hair="bun" day phone={0} />
          </>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

const Burst: React.FC<{f: number; t: number}> = ({f, t}) => {
  const u = clamp01((t - D3 + 0.1) / 0.8);
  if (u <= 0 || u >= 1) return null;
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <Cocoon f={f} x={540} y={1100} r={150} prog={1} color={BLUE} seed={99} burst={ease(u)} />
    </svg>
  );
};

/* ============================== SFX ============================== */
type Fx = [number, string, number];
const FX: Fx[] = [];
[BAR(-3.6), BAR(-3.1), BAR(-2.6), BAR(-1.75), BAR(-1.4), BAR(-1.05)].forEach((x) => FX.push([x, 'pop', 0.4]));
FX.push([D1 - 0.35, 'suck', 0.55], [D1, 'impact', 0.75], [D1 + 0.05, 'shimmer', 0.45]);
FX.push([MID(6), 'ding', 0.45], [MID(6) + BP * 0.5, 'ding', 0.4]);
FX.push([BAR(7), 'whoosh', 0.45]);
GRID.forEach((_, i) => FX.push([BAR(8) + i * BP, 'pop', 0.4]));
FX.push([BAR(9.5), 'whoosh', 0.45]);
[BAR(9.5) + 0.55, BAR(10) + 0.55, BAR(10.5) + 0.55].forEach((x) => FX.push([x, 'pop', 0.45]));
for (let k = 0; k < 6; k++) FX.push([BAR(11) + k * BP, 'tick', 0.4]);
FX.push([BAR(12.5), 'heart', 0.6], [MID(14), 'click', 0.6], [MID(14) + 0.05, 'suck', 0.35]);
FX.push([BAR(16), 'whoosh', 0.45]);
{
  let last = -1;
  for (let fr = S(BAR(16)); fr < S(D2); fr++) {
    const u = clamp01((fr / 30 - BAR(16)) / (D2 - BAR(16)));
    const idx = Math.floor(Math.pow(u, 1.5) * 34);
    if (idx !== last) {
      FX.push([fr / 30, 'tick', 0.3]);
      last = idx;
    }
  }
}
FX.push([D2, 'impact', 1], [D2, 'stamp', 0.6]);
FX.push([BAR(22), 'whoosh', 0.4], [BAR(22) + 0.1, 'suck', 0.4], [BAR(24), 'ping', 0.35]);
[0, 1, 2].forEach((i) => FX.push([BAR(25.5) + 0.25 + i * BP, 'click', 0.45]));
for (let k = 0; k < 4; k++) FX.push([BAR(27) + k * BP * 2, 'thud', 0.5]);
FX.push([BAR(29), 'whoosh', 0.45]);
BANDS.forEach((B) => FX.push([B.on, 'thud', 0.55]));
FX.push([BAR(33), 'click', 0.5], [BAR(34.3), 'whoosh', 0.35]);
FX.push([D3 - 0.08, 'snap', 0.6], [D3, 'impact', 0.9], [D3 + 0.05, 'sunrise', 0.55]);
FX.push([BAR(37), 'shimmer', 0.35], [BAR(39), 'whoosh', 0.35]);
const fxSrc = (n: string) => `audio/ep60-troi-sap/sfx/${n}.wav`;

/* ============================== CHÍNH ============================== */
export const Ep65Ken: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const HITS: [number, number][] = [[D1, 22], [MID(6), 9], [D2, 26], [MID(14), 9], [BAR(22), 9], [D3, 24], [BAR(30), 8], [BAR(31), 8], [BAR(32), 8]];
  let shake = 0;
  let punch = 0;
  for (const [h, amp] of HITS) {
    const d = f - S(h);
    if (d >= 0 && d < 16) {
      shake += Math.exp(-d / 3.5) * amp;
      punch += Math.exp(-d / 3) * amp * 0.0032;
    }
  }
  const sx = shake * Math.sin(f * 2.3);
  const sy = shake * Math.cos(f * 3.1) * 0.7;
  const flash = (h: number, c: string, a = 0.4) => (f >= S(h) && f < S(h) + 12 ? <AbsoluteFill key={`fl${h}`} style={{background: c.replace('A', String(a * Math.exp(-(f - S(h)) / 4))), mixBlendMode: 'screen'}} /> : null);
  const isDay = t >= D3 - 0.05;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Defs />
      <FilBg f={f} w={W} h={H} tone="warm" glow={[50, 58]} strength={0.95} />
      <AbsoluteFill style={{transform: `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) scale(${1 + punch})`}}>
        <Fade f={f} a={0} b={BAR(7)} first><Bench f={f} t={t} /></Fade>
        <Fade f={f} a={BAR(7)} b={BAR(9.5)}><Grid6 f={f} t={t} /></Fade>
        <Fade f={f} a={BAR(9.5)} b={BAR(16)}><Peer f={f} t={t} /></Fade>
        <Fade f={f} a={BAR(16)} b={BAR(22)}><Phone f={f} t={t} /></Fade>
        <Big93 f={f} />
        <Fade f={f} a={BAR(22)} b={BAR(29)}><Loop f={f} t={t} /></Fade>
        <Fade f={f} a={BAR(29)} b={BAR(34.3)}><Filters f={f} t={t} /></Fade>
        <Fade f={f} a={BAR(34.3)} b={D3 - 0.05} d={4}><City f={f} t={t} /></Fade>
        {isDay ? (
          <Fade f={f} a={D3 - 0.05} b={BAR(39)} d={6}><Day f={f} t={t} /></Fade>
        ) : null}
        {t >= BAR(39) - 0.5 ? (
          <Fade f={f} a={BAR(39)} b={END + 5} last><Day f={f} t={t} bench /></Fade>
        ) : null}
        <Burst f={f} t={t} />
        <Title f={f} />
        {CAPS.map(([a, b, tx], i) => <Caption key={i} f={f} a={a} b={b} text={tx} />)}
        <Foot f={f} a={D2 + 0.3} b={BAR(22)} text="Wall Street Journal, 2021 · tài khoản thử kentucky_96 · ~36 phút xem" />
        <Foot f={f} a={BAR(39) + 0.5} b={END + 5} text="Tham khảo: Wall Street Journal (2021) · Cass R. Sunstein, Infotopia (2006)" />
      </AbsoluteFill>
      {flash(D1, 'rgba(255,190,120,A)', 0.35)}
      {flash(D2, 'rgba(255,60,40,A)', 0.4)}
      {flash(D3, 'rgba(255,230,190,A)', 0.7)}
      <FilGrain opacity={0.07} />
      {!NO_BGM && <Audio src={staticFile('audio/ep65-ken/bgm.wav')} volume={0.9} />}
      {FX.map(([tm, nm, g], i) => (
        <Sequence key={i} from={Math.max(0, S(tm))} durationInFrames={S(2.5)}>
          <Audio src={staticFile(fxSrc(nm))} volume={g * 0.85} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
