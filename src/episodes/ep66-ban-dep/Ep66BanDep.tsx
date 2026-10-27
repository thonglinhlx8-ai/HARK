import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, getInputProps, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp01} from '../../library/anim';
import {FilGrain} from '../../library/filament/stage';
import {ease} from '../../library/filament/theme';
import {BAR, BL, BP, D1, D2, END, MID, S, W, H} from './timeline';

/**
 * ep66 "Bản đẹp nhất của người khác" (Jordan et al., 2011 — underestimating others' negative emotions).
 * Thiết bị hình RIÊNG của tập: điện thoại to (bài đăng), tòa nhà ô cửa sáng / ô của mình tối,
 * ô cửa LẬT (scaleX) lộ "phần không đăng", giảng đường ghế sáng dần, ô cửa nhìn từ phía bên kia.
 * Xuất mặc định KHÔNG nhạc (user gắn nhạc thư viện từ 0:00). --props='{"withMusic":true}' để nghe thử.
 */

const WITH_MUSIC = Boolean((getInputProps() as {withMusic?: boolean}).withMusic);
const SUB = "'Ep66 Sub', sans-serif";
const DISP = "'Ep66 Display', serif";
if (typeof document !== 'undefined') {
  const h = delayRender('ep66 fonts');
  Promise.all([
    new FontFace('Ep66 Sub', `url(${staticFile('fonts/ep58/BeVietnamPro-ExtraBold.ttf')})`).load().then((l) => document.fonts.add(l)),
    new FontFace('Ep66 Display', `url(${staticFile('fonts/ep58/PlayfairDisplay.ttf')})`, {weight: '400 900'}).load().then((l) => document.fonts.add(l)),
  ]).catch(() => undefined).finally(() => continueRender(h));
}

const TXT = '#f6f3ea';
const RED = '#e0402f';
const RED_HOT = '#ff6a52';
const GOLD = '#f2c46d';
const WARM = '#ffb36b';
const CYAN = '#9fd4ff';
const INK = '#0b0807';

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
    if (t <= keys[i][0]) {
      const u = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
      const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      return lerp(keys[i - 1][1], keys[i][1], e);
    }
  }
  return keys[keys.length - 1][1];
};

/* ============================== DEFS ============================== */
const Defs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <linearGradient id="e66rimR" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor={WARM} />
        <stop offset="0.45" stopColor="#5a3a22" />
        <stop offset="1" stopColor={CYAN} />
      </linearGradient>
      <linearGradient id="e66rimW" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#ffd9a0" />
        <stop offset="1" stopColor="#7a4a28" />
      </linearGradient>
      <radialGradient id="e66phone" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="rgba(170,215,255,0.55)" />
        <stop offset="1" stopColor="rgba(170,215,255,0)" />
      </radialGradient>
      <radialGradient id="e66lamp" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="rgba(255,196,120,0.75)" />
        <stop offset="1" stopColor="rgba(255,196,120,0)" />
      </radialGradient>
      <filter id="e66glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="6" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="e66soft">
        <feGaussianBlur stdDeviation="14" />
      </filter>
    </defs>
  </svg>
);

/* ============================== NGƯỜI — silhouette mảnh, viền sáng (rim) ============================== */
/** Vẽ hai lượt: lượt 1 nét dày màu rim, lượt 2 tô đen không nét → chỉ còn viền ngoài phát sáng. */
type Part = {d?: string; line?: [number, number, number, number, number]; circle?: [number, number, number]; ellipse?: [number, number, number, number, number]};
const Rim: React.FC<{parts: Part[]; rim: string; fill?: string; w?: number; glow?: boolean}> = ({parts, rim, fill = INK, w = 5, glow = true}) => {
  const pass = (stroke: string | null, key: string) =>
    parts.map((p, i) => {
      const sw = stroke ? w * 2 : 0;
      const st = stroke ?? 'none';
      const fc = stroke ?? fill;
      if (p.d) return <path key={key + i} d={p.d} fill={fc} stroke={st} strokeWidth={sw} strokeLinejoin="round" />;
      if (p.line) {
        const [x1, y1, x2, y2, th] = p.line;
        return <line key={key + i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={fc} strokeWidth={th + sw} strokeLinecap="round" />;
      }
      if (p.circle) return <circle key={key + i} cx={p.circle[0]} cy={p.circle[1]} r={p.circle[2]} fill={fc} stroke={st} strokeWidth={sw} />;
      if (p.ellipse) {
        const [cx, cy, rx, ry, rot] = p.ellipse;
        return <ellipse key={key + i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${rot} ${cx} ${cy})`} fill={fc} stroke={st} strokeWidth={sw} />;
      }
      return null;
    });
  return (
    <g>
      <g filter={glow ? 'url(#e66glow)' : undefined}>{pass(rim, 'r')}</g>
      {pass(null, 'f')}
    </g>
  );
};

/** Ngồi khom, nhìn nghiêng sang phải, tay cầm điện thoại. Gốc = hông trên ghế. */
const SIT_PARTS = (hair: 'short' | 'long'): Part[] => [
  {line: [-6, 6, 150, -4, 40]},
  {line: [150, -4, 166, 196, 32]},
  {line: [166, 198, 212, 204, 18]},
  {d: 'M -34,6 C -50,-70 -46,-160 -14,-232 C 2,-262 34,-276 62,-266 C 74,-236 66,-180 46,-118 C 34,-70 30,-30 34,6 Z'},
  {line: [52, -244, 74, -276, 22]},
  {ellipse: [92, -306, 33, 37, 18]},
  ...(hair === 'long' ? [{d: 'M 62,-330 C 70,-352 112,-352 124,-322 C 116,-326 96,-328 84,-318 C 74,-290 70,-262 54,-238 C 48,-268 52,-306 62,-330 Z'} as Part] : [{d: 'M 60,-318 C 64,-346 108,-354 126,-324 C 110,-332 86,-330 66,-308 Z'} as Part]),
  {line: [34, -226, 76, -138, 26]},
  {line: [76, -138, 138, -190, 21]},
  {circle: [142, -194, 12]},
];
const FigSit: React.FC<{x: number; y: number; s?: number; hair?: 'short' | 'long'; phone?: number; rim?: string; mirror?: boolean}> = ({x, y, s = 1, hair = 'short', phone = 1, rim = 'url(#e66rimR)', mirror}) => (
  <g transform={`translate(${x},${y}) scale(${mirror ? -s : s},${s})`}>
    {phone > 0 ? <circle cx={150} cy={-200} r={150} fill="url(#e66phone)" opacity={phone} /> : null}
    <Rim parts={SIT_PARTS(hair)} rim={rim} />
    <rect x={136} y={-232} width={22} height={40} rx={4} transform="rotate(-34 147 -212)" fill={phone > 0 ? '#d8ebff' : '#171310'} opacity={0.4 + 0.6 * phone} />
  </g>
);

/** Nằm nghiêng trong chăn, giơ điện thoại trước mặt. Gốc = giữa đệm. */
const FigLie: React.FC<{x: number; y: number; s?: number; hair?: 'short' | 'long'; phone?: number}> = ({x, y, s = 1, hair = 'short', phone = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={250} cy={-34} rx={110} ry={34} fill="#1d1712" stroke="rgba(255,214,160,0.35)" strokeWidth={2} />
    {phone > 0 ? <circle cx={330} cy={-210} r={150} fill="url(#e66phone)" opacity={phone} /> : null}
    <Rim
      rim="url(#e66rimR)"
      parts={[
        {ellipse: [262, -92, 34, 38, -8]},
        hair === 'long' ? {d: 'M 228,-104 C 230,-138 280,-144 296,-112 C 300,-90 296,-60 286,-50 C 270,-70 250,-74 232,-64 C 224,-76 224,-92 228,-104 Z'} : {d: 'M 230,-102 C 232,-134 280,-142 296,-112 C 280,-118 252,-116 232,-92 Z'},
        {line: [214, -70, 258, -170, 22]},
        {line: [258, -170, 300, -206, 18]},
        {circle: [306, -210, 11]},
      ]}
    />
    <rect x={296} y={-246} width={24} height={42} rx={4} transform="rotate(-20 308 -225)" fill={phone > 0 ? '#d8ebff' : '#171310'} opacity={0.4 + 0.6 * phone} />
    {/* chăn phủ */}
    <path d="M -330,40 C -320,-36 -200,-70 -60,-66 C 60,-62 150,-80 214,-52 C 236,-40 240,-10 236,40 Z" fill="#17120e" stroke="url(#e66rimW)" strokeWidth={3} />
    <path d="M -250,-24 C -170,-40 -90,-30 -10,-40 M -120,4 C -40,-10 60,-6 160,-22" fill="none" stroke="rgba(255,214,160,0.18)" strokeWidth={2} />
  </g>
);

/** Đứng trên xe buýt, tay vịn tay nắm, tay kia cầm điện thoại. Gốc = giữa hai bàn chân. */
const FigStand: React.FC<{x: number; y: number; s?: number; sway?: number}> = ({x, y, s = 1, sway = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${sway})`}>
    <circle cx={74} cy={-400} r={120} fill="url(#e66phone)" opacity={0.9} />
    <Rim
      rim="url(#e66rimR)"
      parts={[
        {line: [-16, 0, -6, -250, 30]},
        {line: [26, 0, 18, -250, 30]},
        {d: 'M -34,-240 C -40,-330 -34,-420 -10,-468 C 6,-490 40,-492 52,-470 C 62,-420 54,-330 40,-240 Z'},
        {line: [10, -470, 18, -500, 20]},
        {ellipse: [26, -530, 31, 35, 14]},
        {d: 'M -2,-548 C 4,-574 46,-578 60,-552 C 44,-558 22,-556 4,-536 Z'},
        {line: [-8, -456, -24, -560, 20]},
        {line: [-24, -560, -14, -660, 17]},
        {line: [34, -448, 58, -370, 22]},
        {line: [58, -370, 86, -410, 18]},
        {circle: [90, -414, 11]},
      ]}
    />
    <rect x={80} y={-452} width={22} height={40} rx={4} transform="rotate(-18 91 -432)" fill="#d8ebff" />
  </g>
);

/** Người mini trong ô cửa (đứng / ngồi), tô đặc. */
const Mini: React.FC<{x: number; y: number; s?: number; c?: string; arm?: number; sit?: boolean; head?: string}> = ({x, y, s = 1, c = '#1a120c', arm = 0, sit, head}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {sit ? (
      <>
        <path d="M -10,0 C -14,-22 -12,-40 -4,-48 L 8,-48 C 14,-36 14,-18 12,0 Z" fill={c} />
        <path d="M -8,-2 L 22,-2 L 24,22 L 18,22 L 16,6 L -8,6 Z" fill={c} />
      </>
    ) : (
      <>
        <path d="M -10,0 L -9,-34 C -12,-46 -10,-58 -4,-62 L 6,-62 C 12,-58 12,-46 10,-34 L 10,0 L 3,0 L 1,-26 L -2,-26 L -4,0 Z" fill={c} />
        <line x1={6} y1={-56} x2={6 + 14 * Math.cos(arm)} y2={-56 - 14 * Math.sin(arm)} stroke={c} strokeWidth={5} strokeLinecap="round" />
      </>
    )}
    <circle cx={1} cy={sit ? -57 : -71} r={8.5} fill={head ?? c} />
  </g>
);

/* ============================== PHỤ ĐỀ ============================== */
const CAPS: [number, number, string][] = [
  [-1, BAR(2) - 0.12, '7 giờ sáng. Mình còn 【chưa dậy nổi】.'],
  [BAR(2) + 0.05, BAR(4) - 0.12, 'Trưa. Nó đang ở 【Đà Lạt】.'],
  [BAR(4) + 0.05, BAR(6) - 0.12, 'Chiều. Nó 【mua nhà】 rồi.'],
  [BAR(6) + 0.05, BAR(7) - 0.1, '11 giờ đêm. Hội cũ tụ tập, không ai rủ.'],
  [BAR(7) + 0.05, D1 - 0.08, 'Còn mình…?'],
  [BAR(9) + 0.05, BAR(10) - 0.05, 'Thử lật một ô cửa.'],
  [BAR(18) + 0.05, BAR(20) - 0.12, 'Mình đang so 【ngày thường】 của mình…'],
  [BAR(20) + 0.05, BAR(22) - 0.12, '…với 【khoảnh khắc đẹp nhất】 của họ.'],
  [BAR(22) + 0.05, BAR(24) - 0.12, 'Họ không giả. Chỉ là phần đó 【không ai đăng】.'],
  [BAR(24) + 0.05, BAR(26) - 0.1, 'Người ta hỏi sinh viên: tháng qua, bao nhiêu bạn cùng lớp từng 【khóc】?'],
  [BAR(26) + 0.05, BAR(28) - 0.08, 'Họ đoán:'],
  [BAR(28) - 0.02, BAR(29) - 0.08, 'Thật ra:'],
  [BAR(29) + 0.05, BAR(30.5) - 0.1, 'Nỗi buồn xảy ra sau 【cánh cửa đóng】. Niềm vui thì được chụp lại.'],
  [BAR(30.5) + 0.05, BAR(32) - 0.1, 'Nên mình tưởng 【chỉ mình mình】 như vậy.'],
  [BAR(32) + 0.05, BAR(34) - 0.1, 'Còn ô cửa của mình…'],
  [BAR(34) + 0.05, BAR(36) - 0.1, 'nhìn từ 【phía bên kia】 thì sao?'],
  [BAR(36) + 0.05, BAR(38) - 0.1, 'Tấm ảnh bạn đăng tuần trước, có người xem đi xem lại.'],
  [BAR(38) + 0.05, D2 - 0.08, 'và nghĩ: 【sao ai cũng ổn】…'],
  [BAR(42) + 0.05, BAR(44) - 0.1, 'Ai cũng có 【ô sáng】 và 【ô tối】.'],
  [BAR(44) + 0.05, BAR(47) - 0.1, 'Đừng đem 【hậu trường】 của mình so với 【sân khấu】 của người khác.'],
  [BAR(47) + 0.05, BAR(50) - 0.1, 'Ô tối của bạn không phải lỗi. Nó chỉ là 【phần không đăng】.'],
  [BAR(50) + 0.2, END + 1, 'Lần gần nhất bạn 【so mình】 với ai?'],
];

const Caption: React.FC<{f: number; a: number; b: number; text: string; top?: number}> = ({f, a, b, text, top = 230}) => {
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
    <div style={{position: 'absolute', left: 80, right: 80, top, textAlign: 'center', fontFamily: SUB, fontSize: 56, lineHeight: 1.4, color: TXT, opacity: out, filter: blurV(out)}}>
      {words.map((x, i) => {
        const v = a < 0 ? 1 : ease((f - fa - i * 2) / 7);
        return (
          <React.Fragment key={i}>
            {i > 0 ? ' ' : ''}
            <span style={{display: 'inline-block', opacity: v, filter: blurV(v), transform: `translateY(${((1 - v) * 14).toFixed(1)}px)`, color: x.hi ? RED_HOT : undefined, textShadow: x.hi ? '0 0 22px rgba(255,90,70,0.55), 0 3px 8px #000' : '0 3px 12px rgba(0,0,0,0.95)'}}>{x.w}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Foot: React.FC<{f: number; a: number; b: number; text: string}> = ({f, a, b, text}) => {
  const v = io(f, S(a), S(b), 10);
  if (v <= 0) return null;
  return <div style={{position: 'absolute', left: 60, right: 60, bottom: 110, textAlign: 'center', fontFamily: SUB, fontSize: 24, letterSpacing: 1, color: 'rgba(246,243,234,0.45)', opacity: v}}>{text}</div>;
};

/** Chữ đập (drop): mỗi dòng một phách, rơi từ to xuống + chớp. */
const Slam: React.FC<{f: number; lines: {t: number; text: string; color: string; size: number; serif?: boolean}[]; out: number; top: number}> = ({f, lines, out, top}) => {
  const o = 1 - ease((f - S(out)) / 8);
  if (f < S(lines[0].t) - 1 || o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: top - 60, padding: '60px 0 70px', textAlign: 'center', opacity: o, background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)'}}>
      {lines.map((L, i) => {
        const d = f - S(L.t);
        if (d < 0) return <div key={i} style={{height: L.size * 1.34}} />;
        const k = ease(d / 5);
        const sc = 1.6 - 0.6 * k;
        return (
          <div key={i} style={{fontFamily: L.serif === false ? SUB : DISP, fontWeight: 900, fontSize: L.size, lineHeight: 1.34, color: L.color, transform: `scale(${sc})`, opacity: k, filter: blurV(k), textShadow: L.color === TXT ? '0 4px 24px rgba(0,0,0,0.9)' : '0 0 40px rgba(255,70,50,0.65), 0 4px 18px rgba(0,0,0,0.9)'}}>{L.text}</div>
        );
      })}
    </div>
  );
};

/* ============================== ĐIỆN THOẠI (bài đăng) ============================== */
const Heart: React.FC<{c?: string; s?: number}> = ({c = '#ff5a6a', s = 34}) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 21 C 5 15, 1 11.5, 1 7.5 C 1 4.5, 3.5 2.5, 6.3 2.5 C 8.6 2.5, 10.6 3.8, 12 6 C 13.4 3.8, 15.4 2.5, 17.7 2.5 C 20.5 2.5, 23 4.5, 23 7.5 C 23 11.5, 19 15, 12 21 Z" fill={c} /></svg>
);

type Pic = 'run' | 'dalat' | 'house' | 'party' | 'cafe';
const PostPic: React.FC<{pic: Pic; t: number}> = ({pic, t}) => {
  if (pic === 'run')
    return (
      <svg viewBox="0 0 400 400" width="100%" height="100%">
        <defs>
          <linearGradient id="e66sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b2a5a" /><stop offset="0.55" stopColor="#f08a5d" /><stop offset="1" stopColor="#ffd28a" /></linearGradient>
        </defs>
        <rect width={400} height={400} fill="url(#e66sky1)" />
        <circle cx={250} cy={262} r={58} fill="#fff1c4" opacity={0.95} />
        <path d="M 0,300 L 0,250 L 30,250 L 30,220 L 60,220 L 60,260 L 90,260 L 90,200 L 120,200 L 120,240 L 160,240 L 160,214 L 190,214 L 190,262 L 300,262 L 300,226 L 330,226 L 330,250 L 370,250 L 370,232 L 400,232 L 400,300 Z" fill="#5a3048" opacity={0.75} />
        <rect y={296} width={400} height={104} fill="#2a1a24" />
        <path d="M 0,330 L 400,318" stroke="#ffcf8f" strokeOpacity={0.4} strokeWidth={3} />
        <g transform={`translate(150,300) scale(1.25)`} fill="#1a0f14">
          <circle cx={10} cy={-98} r={11} />
          <path d="M 2,-86 L 18,-86 L 22,-50 L 14,-48 L 8,-70 Z" />
          <path d="M 6,-52 L 16,-50 L 34,-18 L 30,0 L 22,-2 L 24,-18 Z" />
          <path d="M 10,-52 L 2,-28 L -20,-12 L -24,-18 L -8,-32 L 2,-54 Z" />
          <path d="M 14,-80 L 34,-66 L 40,-76" stroke="#1a0f14" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M 6,-80 L -12,-64 L -22,-70" stroke="#1a0f14" strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
        <rect x={20} y={20} width={150} height={44} rx={22} fill="rgba(0,0,0,0.35)" />
        <text x={95} y={50} textAnchor="middle" fontFamily={SUB} fontSize={22} fill="#fff">5:00 · 5 km</text>
      </svg>
    );
  if (pic === 'dalat')
    return (
      <svg viewBox="0 0 400 400" width="100%" height="100%">
        <defs>
          <linearGradient id="e66sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bcd6e6" /><stop offset="1" stopColor="#f3e2c8" /></linearGradient>
        </defs>
        <rect width={400} height={400} fill="url(#e66sky2)" />
        <path d="M 0,210 C 80,170 150,200 220,176 C 290,152 340,180 400,166 L 400,400 L 0,400 Z" fill="#7d9aa6" />
        <rect y={196} width={400} height={30} fill="#eef2f2" opacity={0.6} />
        <path d="M 0,262 C 90,236 170,262 250,240 C 320,222 360,236 400,230 L 400,400 L 0,400 Z" fill="#4f6d74" />
        {Array.from({length: 13}, (_, i) => {
          const x = 10 + i * 31 + rnd(i) * 10;
          const hh = 46 + rnd(i + 3) * 40;
          const y = 258 - Math.sin(i) * 8;
          return <path key={i} d={`M ${x},${y - hh} L ${x - 13},${y} L ${x + 13},${y} Z`} fill="#2c4146" />;
        })}
        <path d="M 0,330 C 100,300 200,320 260,306 C 320,292 370,300 400,296 L 400,400 L 0,400 Z" fill="#22312f" />
        <g transform="translate(290,300)" fill="#141c1b">
          <circle cx={0} cy={-62} r={9} />
          <path d="M -7,-52 L 7,-52 L 9,-20 L 4,0 L -4,0 L -9,-20 Z" />
          <path d="M -6,-48 L -30,-70 M 6,-48 L 30,-70" stroke="#141c1b" strokeWidth={5} strokeLinecap="round" />
        </g>
        <rect x={20} y={20} width={130} height={44} rx={22} fill="rgba(0,0,0,0.3)" />
        <text x={85} y={50} textAnchor="middle" fontFamily={SUB} fontSize={22} fill="#fff">Đà Lạt</text>
      </svg>
    );
  if (pic === 'house')
    return (
      <svg viewBox="0 0 400 400" width="100%" height="100%">
        <rect width={400} height={400} fill="#3a2a22" />
        <rect x={110} y={60} width={180} height={290} fill="#ffcf8a" />
        <rect x={110} y={60} width={180} height={290} fill="url(#e66lamp)" />
        <path d="M 290,60 L 350,90 L 350,380 L 290,350 Z" fill="#5a3a26" />
        <circle cx={336} cy={230} r={6} fill="#f5c46d" />
        <rect y={350} width={400} height={50} fill="#241914" />
        <rect x={30} y={300} width={70} height={56} fill="#8a6440" /><rect x={40} y={262} width={50} height={40} fill="#a07650" />
        <g transform="translate(200,250)">
          <path d="M -40,150 C -46,80 -30,40 -6,20 L 20,20 C 40,40 44,90 40,150 Z" fill="#2b1d16" />
          <circle cx={0} cy={-8} r={0} />
          <path d="M 4,30 C 10,-20 20,-60 24,-90" stroke="#2b1d16" strokeWidth={22} strokeLinecap="round" fill="none" />
          <g transform="translate(24,-104) rotate(-12)">
            <circle cx={0} cy={0} r={16} fill="none" stroke="#f2c46d" strokeWidth={6} />
            <rect x={-4} y={14} width={8} height={46} fill="#f2c46d" />
            <rect x={4} y={40} width={10} height={6} fill="#f2c46d" /><rect x={4} y={52} width={7} height={6} fill="#f2c46d" />
          </g>
        </g>
      </svg>
    );
  if (pic === 'party')
    return (
      <svg viewBox="0 0 400 400" width="100%" height="100%">
        <rect width={400} height={400} fill="#2a1a2e" />
        {Array.from({length: 14}, (_, i) => (
          <circle key={i} cx={20 + i * 28} cy={40 + Math.sin(i * 0.9) * 14} r={7} fill={['#ffd27a', '#ff8fa0', '#9fd4ff'][i % 3]} opacity={0.6 + 0.4 * Math.abs(Math.sin(t * 3 + i))} />
        ))}
        <path d="M 0,40 C 100,70 300,10 400,40" stroke="#5a4a5e" strokeWidth={2} fill="none" />
        <circle cx={200} cy={240} r={180} fill="url(#e66lamp)" opacity={0.6} />
        <rect y={318} width={400} height={82} fill="#1a1018" />
        <rect x={110} y={300} width={180} height={24} rx={6} fill="#4a3030" />
        {[70, 130, 200, 270, 330].map((x, i) => (
          <g key={i} transform={`translate(${x},${310}) scale(1.5)`}>
            <Mini x={0} y={0} c="#140c12" arm={i % 2 ? 1.2 : 2.1} />
          </g>
        ))}
        <rect x={20} y={340} width={170} height={40} rx={20} fill="rgba(0,0,0,0.35)" />
        <text x={105} y={367} textAnchor="middle" fontFamily={SUB} fontSize={20} fill="#fff">Hội cũ, đủ mặt!</text>
      </svg>
    );
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      <rect width={400} height={400} fill="#f1dcc0" />
      <rect x={40} y={30} width={320} height={230} fill="#fff6e4" />
      <path d="M 200,30 L 200,260 M 40,145 L 360,145" stroke="#c9a77f" strokeWidth={6} />
      <path d="M 40,30 L 230,260 L 120,260 Z" fill="#fff" opacity={0.45} />
      <rect y={270} width={400} height={130} fill="#b78a5e" />
      <g transform="translate(150,300)" fill="#3a2a22">
        <circle cx={0} cy={-120} r={22} />
        <path d="M -28,-96 C -40,-60 -40,-20 -34,10 L 34,10 C 40,-20 36,-66 22,-96 Z" />
        <path d="M 18,-80 C 40,-60 56,-50 76,-58" stroke="#3a2a22" strokeWidth={14} strokeLinecap="round" fill="none" />
      </g>
      <rect x={220} y={238} width={34} height={34} rx={6} fill="#fff" />
      <path d="M 230,232 C 226,222 236,216 232,206 M 242,232 C 238,222 248,216 244,206" stroke="#fff" strokeWidth={3} fill="none" opacity={0.7} />
      <path d="M 320,270 C 300,220 330,190 310,150 M 320,270 C 340,230 360,220 350,180" stroke="#4d6b3a" strokeWidth={8} fill="none" />
      <rect x={300} y={262} width={46} height={40} fill="#8a5a3a" />
    </svg>
  );
};

const POSTS: Record<Pic, {user: string; cap: string; likes: string; ago: string}> = {
  run: {user: 'khanh.vy', cap: '5km trước khi thành phố thức dậy.', likes: '1,2k', ago: '2 giờ'},
  dalat: {user: 'duc.anh', cap: 'Đà Lạt lại gọi tên.', likes: '3,4k', ago: '35 phút'},
  house: {user: 'thao.my', cap: 'Chìa khoá đầu tiên. Nhà của tụi mình.', likes: '5,1k', ago: '1 giờ'},
  party: {user: 'thu.trang', cap: 'Lâu lắm mới đủ mặt cả hội.', likes: '842', ago: '12 phút'},
  cafe: {user: 'minh.day', cap: 'Một sáng chủ nhật thật chậm.', likes: '96', ago: '1 tuần'},
};

const PhoneCard: React.FC<{f: number; t: number; pic: Pic; x: number; y: number; w?: number; inF: number; rot?: number; sc?: number}> = ({f, t, pic, x, y, w = 470, inF, rot = -2, sc = 1}) => {
  const v = ease((f - inF) / 10);
  const P = POSTS[pic];
  const hgt = w * 1.62;
  const liked = ease((f - inF - 34) / 8);
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, height: hgt, borderRadius: 46, background: '#0d0f14', border: '3px solid rgba(220,232,255,0.55)', boxShadow: '0 0 70px rgba(150,200,255,0.35), 0 30px 60px rgba(0,0,0,0.7)', overflow: 'hidden', opacity: v, transform: `translateY(${(1 - v) * 60}px) rotate(${rot}deg) scale(${sc * (0.94 + 0.06 * v)})`, filter: blurV(v)}}>
      <div style={{position: 'absolute', left: w / 2 - 50, top: 14, width: 100, height: 26, borderRadius: 13, background: '#000'}} />
      <div style={{position: 'absolute', left: 26, top: 62, display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{width: 54, height: 54, borderRadius: 27, background: 'linear-gradient(135deg,#ffb36b,#e0402f)', padding: 3}}>
          <div style={{width: '100%', height: '100%', borderRadius: 27, background: '#2a2a30'}} />
        </div>
        <div>
          <div style={{fontFamily: SUB, fontSize: 26, color: '#fff'}}>{P.user}</div>
          <div style={{fontFamily: SUB, fontSize: 18, color: 'rgba(255,255,255,0.5)'}}>{P.ago}</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 136, width: w, height: w}}>
        <PostPic pic={pic} t={t} />
      </div>
      <div style={{position: 'absolute', left: 26, top: 136 + w + 22, display: 'flex', gap: 22, alignItems: 'center'}}>
        <div style={{transform: `scale(${1 + 0.4 * Math.sin(Math.PI * liked)})`}}>
          <Heart c={liked > 0.5 ? '#ff4d62' : 'rgba(255,255,255,0.85)'} s={40} />
        </div>
        <svg width={38} height={38} viewBox="0 0 24 24"><path d="M3 11.5 C3 6.8 7 3.5 12 3.5 C17 3.5 21 6.8 21 11.5 C21 16.2 17 19.5 12 19.5 C10.8 19.5 9.6 19.3 8.6 18.9 L4 20.5 L5.3 16.6 C3.8 15.2 3 13.4 3 11.5 Z" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={2} /></svg>
        <div style={{fontFamily: SUB, fontSize: 24, color: '#fff'}}>{P.likes} lượt thích</div>
      </div>
      <div style={{position: 'absolute', left: 26, right: 26, top: 136 + w + 80, fontFamily: SUB, fontSize: 25, lineHeight: 1.35, color: 'rgba(255,255,255,0.92)'}}>
        <span style={{color: '#fff'}}>{P.user} </span>
        <span style={{fontWeight: 400, color: 'rgba(255,255,255,0.78)'}}>{P.cap}</span>
      </div>
    </div>
  );
};

/* ============================== HỒI 1: 4 lát cắt trong ngày ============================== */
const TimeTag: React.FC<{f: number; inF: number; text: string}> = ({f, inF, text}) => {
  const v = inF <= 0 ? 1 : ease((f - inF) / 8);
  return <div style={{position: 'absolute', left: 70, top: 1840 - 64, fontFamily: DISP, fontWeight: 700, fontSize: 44, letterSpacing: 4, color: GOLD, opacity: 0.85 * v}}>{text}</div>;
};

const Room1: React.FC<{f: number; t: number}> = ({f, t}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#1a130d 0%,#120d09 60%,#0a0705 100%)'}} />
    <svg width={W} height={H} style={{position: 'absolute'}}>
      {/* cửa sổ sáng sớm, rèm sọc */}
      <rect x={720} y={500} width={280} height={520} fill="#f7d9a2" opacity={0.85} />
      {Array.from({length: 13}, (_, i) => <rect key={i} x={720} y={510 + i * 40} width={280} height={16} fill="#3a2a1c" opacity={0.85} />)}
      <path d="M 720,1020 L 1000,1020 L 700,1600 L 240,1600 Z" fill="#ffcf8a" opacity={0.07} />
      {Array.from({length: 7}, (_, i) => <path key={i} d={`M ${730 + i * 38},${1020} L ${300 + i * 66},${1650}`} stroke="#ffd9a0" strokeOpacity={0.05} strokeWidth={18} />)}
      {/* giường */}
      <rect x={-20} y={1560} width={1120} height={80} fill="#1b140f" stroke="url(#e66rimW)" strokeWidth={3} />
      <rect x={-20} y={1640} width={1120} height={300} fill="#0d0907" />
      <FigLie x={380} y={1575} s={1.6} phone={1} />
    </svg>
    <PhoneCard f={f} t={t} pic="run" x={420} y={420} inF={-30} rot={-2} />
    <TimeTag f={f} inF={0} text="07:12" />
  </AbsoluteFill>
);

const Room2: React.FC<{f: number; t: number}> = ({f, t}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#151210 0%,#100c09 100%)'}} />
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <rect x={40} y={260} width={1000} height={700} fill="#e9e2cf" opacity={0.12} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={40 + i * 250} y={260} width={10} height={700} fill="#0d0a08" opacity={0.7} />)}
      {/* tòa nhà ngoài cửa sổ */}
      {Array.from({length: 9}, (_, i) => <rect key={i} x={60 + i * 112} y={520 - rnd(i) * 200} width={90} height={440 + rnd(i) * 200} fill="#2a2621" opacity={0.6} />)}
      {/* bàn */}
      <rect x={-20} y={1490} width={1120} height={26} fill="#2b2119" stroke="url(#e66rimW)" strokeWidth={3} />
      <rect x={-20} y={1516} width={1120} height={420} fill="#0c0907" />
      {/* màn hình */}
      <rect x={640} y={1180} width={360} height={230} rx={10} fill="#1a1d24" stroke="rgba(200,220,255,0.4)" strokeWidth={3} />
      <rect x={656} y={1196} width={328} height={198} fill="#2a3446" opacity={0.7} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={676} y={1214 + i * 34} width={200 + rnd(i) * 90} height={12} fill="#8aa0c0" opacity={0.35} />)}
      <rect x={800} y={1410} width={40} height={80} fill="#1a1d24" />
      {/* hộp cơm */}
      <rect x={430} y={1440} width={150} height={50} rx={8} fill="#c95b3a" opacity={0.85} />
      <rect x={440} y={1428} width={130} height={20} rx={6} fill="#f0d8a8" opacity={0.8} />
      <line x1={600} y1={1430} x2={690} y2={1470} stroke="#d8c3a0" strokeWidth={5} />
      {/* ghế + người */}
      <rect x={70} y={1500} width={210} height={22} rx={8} fill="#1e1712" />
      <FigSit x={170} y={1500} s={1.1} hair="long" phone={0.9} />
    </svg>
    <PhoneCard f={f} t={t} pic="dalat" x={560} y={420} inF={S(BAR(2))} rot={2} />
    <TimeTag f={f} inF={S(BAR(2))} text="12:30" />
  </AbsoluteFill>
);

const Room3: React.FC<{f: number; t: number}> = ({f, t}) => {
  const drift = (t - BAR(4)) * 90;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#1d1310 0%,#110b09 100%)'}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {/* cửa kính xe buýt + hoàng hôn kẹt xe */}
        <rect x={0} y={980} width={W} height={420} fill="#f08a4b" opacity={0.28} />
        {Array.from({length: 22}, (_, i) => {
          const x = ((i * 137 + drift * (0.6 + rnd(i) * 0.6)) % 1300) - 110;
          const c = i % 3 === 0 ? '#ff4a3a' : i % 3 === 1 ? '#ffc46a' : '#fff0d0';
          return <circle key={i} cx={x} cy={1150 + rnd(i + 2) * 200} r={10 + rnd(i + 5) * 26} fill={c} opacity={0.35} filter="url(#e66soft)" />;
        })}
        {[0, 1, 2].map((i) => <rect key={i} x={i * 380 - 20} y={970} width={26} height={450} fill="#0f0a08" />)}
        <rect x={0} y={960} width={W} height={20} fill="#0f0a08" />
        <rect x={0} y={1400} width={W} height={540} fill="#0c0806" />
        {/* thanh vịn */}
        <line x1={0} y1={880} x2={W} y2={880} stroke="#3a2e26" strokeWidth={14} />
        <line x1={0} y1={880} x2={W} y2={880} stroke="url(#e66rimW)" strokeWidth={2} />
        <path d="M 774,884 L 774,940 M 754,940 C 754,986 794,986 794,940 Z" stroke="#4a3a2e" strokeWidth={8} fill="none" />
        <FigStand x={780} y={1640} s={1.12} sway={Math.sin(t * 1.6) * 0.8} />
      </svg>
      <PhoneCard f={f} t={t} pic="house" x={330} y={420} w={440} inF={S(BAR(4))} rot={-3} />
      <TimeTag f={f} inF={S(BAR(4))} text="18:40" />
    </AbsoluteFill>
  );
};

const Room4: React.FC<{f: number; t: number}> = ({f, t}) => {
  const pull = seg(t, [[BAR(7), 0], [D1, 1]]);
  return (
    <AbsoluteFill style={{transform: `scale(${1 - 0.08 * pull})`}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#0d0a0c 0%,#080608 100%)'}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <rect x={620} y={260} width={380} height={520} fill="#0f1424" stroke="rgba(160,190,255,0.25)" strokeWidth={4} />
        {Array.from({length: 40}, (_, i) => <rect key={i} x={630 + rnd(i) * 350} y={420 + rnd(i + 9) * 340} width={8} height={10} fill={i % 4 ? '#ffd27a' : '#9fd4ff'} opacity={0.5 * (0.5 + 0.5 * Math.sin(t + i))} />)}
        <line x1={810} y1={260} x2={810} y2={780} stroke="#1a1520" strokeWidth={8} />
        <rect x={-20} y={1580} width={1120} height={60} fill="#151018" stroke="rgba(160,190,255,0.3)" strokeWidth={2} />
        <rect x={-20} y={1640} width={1120} height={300} fill="#07050a" />
        <FigSit x={330} y={1585} s={1.2} phone={1} />
      </svg>
      <PhoneCard f={f} t={t} pic="party" x={620} y={420} w={440} inF={S(BAR(6))} rot={2} />
      <TimeTag f={f} inF={S(BAR(6))} text="23:04" />
    </AbsoluteFill>
  );
};

/* ============================== TÒA NHÀ & Ô CỬA LẬT ============================== */
const COLS = 5;
const ROWS = 11;
const WW = 170;
const WH = 214;
const CW = 210;
const CH = 284;
const FW = COLS * CW + 40;
const FH = ROWS * CH + 70;
const wx = (c: number) => 40 + c * CW;
const wy = (r: number) => 70 + r * CH;
const MY = {c: 2, r: 5};
type Front = 'party' | 'couple' | 'cake' | 'gym' | 'grad' | 'travel' | 'guitar' | 'dinner' | 'run' | 'dalat' | 'house' | 'friends' | 'cafe' | 'lamp';
type Back = 'phone' | 'curl' | 'desk' | 'knees' | 'stare' | 'bus' | 'retake' | 'bills' | 'alone' | 'dark';
const FRONTS: Front[] = ['party', 'couple', 'cake', 'gym', 'grad', 'travel', 'guitar', 'dinner'];
const BACKS: Back[] = ['phone', 'curl', 'desk', 'knees', 'stare'];
const FEAT: {c: number; r: number; front: Front; back: Back; tag: string; at: number}[] = [
  {c: 0, r: 2, front: 'dalat', back: 'bus', tag: '4 giờ sáng, ngủ gật trên xe khách', at: BAR(10)},
  {c: 4, r: 3, front: 'run', back: 'retake', tag: 'chụp lại 6 lần mới ưng', at: BAR(12)},
  {c: 1, r: 8, front: 'house', back: 'bills', tag: 'khoản vay 25 năm', at: BAR(14)},
  {c: 3, r: 9, front: 'friends', back: 'alone', tag: 'về tới nhà, ngồi một mình', at: BAR(16)},
];
const featAt = (c: number, r: number) => FEAT.find((q) => q.c === c && q.r === r);

const RoomBg: React.FC<{warm: boolean; dim?: number}> = ({warm, dim = 0}) => (
  <>
    <rect width={WW} height={WH} fill={warm ? '#e9a95c' : '#1b2234'} />
    <rect width={WW} height={WH} fill={warm ? 'url(#e66lamp)' : 'url(#e66phone)'} opacity={warm ? 0.9 : 0.35} />
    <rect y={WH - 40} width={WW} height={40} fill={warm ? '#7a4a28' : '#0f131e'} opacity={0.85} />
    {dim > 0 ? <rect width={WW} height={WH} fill="#000" opacity={dim} /> : null}
  </>
);

const FrontScene: React.FC<{k: Front; t: number}> = ({k, t}) => {
  const c = '#2a160c';
  switch (k) {
    case 'party':
      return (<g><RoomBg warm />{[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={20 + i * 26} cy={26 + (i % 2) * 6} r={5} fill={['#fff3c4', '#ff8fa0', '#9fd4ff'][i % 3]} />)}<Mini x={45} y={178} c={c} arm={2} /><Mini x={85} y={180} c={c} arm={1.1} /><Mini x={125} y={178} c={c} arm={2.3} /></g>);
    case 'couple':
      return (<g><RoomBg warm /><circle cx={130} cy={60} r={20} fill="#fff1c4" opacity={0.8} /><Mini x={70} y={180} c={c} arm={0.2} /><Mini x={95} y={180} c={c} arm={2.9} /></g>);
    case 'cake':
      return (<g><RoomBg warm /><rect x={60} y={140} width={50} height={28} rx={4} fill="#fff" />{[0, 1, 2].map((i) => <rect key={i} x={70 + i * 14} y={126} width={3} height={14} fill="#ffd27a" />)}<Mini x={36} y={182} c={c} sit /><Mini x={134} y={182} c={c} sit /><Mini x={85} y={176} c={c} arm={2} /></g>);
    case 'gym':
      return (<g><RoomBg warm /><line x1={50} y1={100} x2={120} y2={100} stroke={c} strokeWidth={5} /><rect x={42} y={88} width={10} height={24} fill={c} /><rect x={118} y={88} width={10} height={24} fill={c} /><Mini x={85} y={180} c={c} arm={1.57} /></g>);
    case 'grad':
      return (<g><RoomBg warm /><circle cx={40} cy={60} r={12} fill="#ff8fa0" /><circle cx={56} cy={46} r={12} fill="#9fd4ff" /><line x1={40} y1={72} x2={70} y2={150} stroke="#fff" strokeOpacity={0.5} /><Mini x={85} y={180} c={c} arm={1.9} /><rect x={74} y={96} width={24} height={6} fill={c} /></g>);
    case 'travel':
      return (<g><rect width={WW} height={WH} fill="#f3a46a" /><circle cx={110} cy={110} r={34} fill="#fff1c4" /><rect y={130} width={WW} height={84} fill="#4a6a86" /><rect x={110} y={156} width={22} height={26} rx={3} fill={c} /><Mini x={80} y={186} c={c} arm={2.2} /></g>);
    case 'guitar':
      return (<g><RoomBg warm /><Mini x={70} y={182} c={c} sit /><ellipse cx={98} cy={160} rx={16} ry={11} fill={c} /><line x1={104} y1={156} x2={140} y2={124} stroke={c} strokeWidth={4} /></g>);
    case 'dinner':
      return (<g><RoomBg warm /><rect x={40} y={150} width={90} height={8} fill={c} /><circle cx={70} cy={146} r={6} fill="#fff" /><circle cx={100} cy={146} r={6} fill="#fff" /><Mini x={30} y={184} c={c} sit /><Mini x={140} y={184} c={c} sit /></g>);
    case 'friends':
      return (<g><RoomBg warm />{[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={20 + i * 26} cy={26} r={5} fill={['#fff3c4', '#ff8fa0', '#9fd4ff'][i % 3]} />)}<Mini x={36} y={180} c={c} arm={2.4} /><Mini x={66} y={178} c={c} arm={1.6} /><Mini x={100} y={180} c={c} arm={2.6} /><Mini x={134} y={178} c={c} arm={1} /></g>);
    case 'dalat':
      return (<g><rect width={WW} height={WH} fill="#c9dbe4" /><path d="M 0,110 C 50,90 100,112 170,92 L 170,214 L 0,214 Z" fill="#6f8c96" />{Array.from({length: 7}, (_, i) => <path key={i} d={`M ${8 + i * 26},${150 - (i % 3) * 8} l -10,34 l 20,0 Z`} fill="#2c4146" />)}<path d="M 0,170 C 60,156 120,172 170,160 L 170,214 L 0,214 Z" fill="#22312f" /><Mini x={120} y={168} c="#141c1b" arm={2.4} /></g>);
    case 'run':
      return (<g><rect width={WW} height={WH} fill="#f08a5d" /><rect width={WW} height={90} fill="#5a3a6a" opacity={0.6} /><circle cx={110} cy={130} r={26} fill="#fff1c4" /><rect y={150} width={WW} height={64} fill="#2a1a24" /><g transform="translate(70,186) scale(0.9)"><circle cx={8} cy={-78} r={9} fill="#1a0f14" /><path d="M 2,-68 L 14,-68 L 18,-40 L 30,-14 L 26,0 L 18,-12 L 8,-38 L -4,-20 L -16,-12 L -18,-18 L -6,-28 Z" fill="#1a0f14" /></g></g>);
    case 'house':
      return (<g><rect width={WW} height={WH} fill="#3a2a22" /><rect x={50} y={30} width={70} height={150} fill="#ffcf8a" /><Mini x={68} y={180} c="#2b1d16" arm={1.7} /><Mini x={100} y={180} c="#2b1d16" arm={1.4} /><circle cx={76} cy={100} r={6} fill="none" stroke="#f2c46d" strokeWidth={2.5} /></g>);
    case 'cafe':
      return (<g><rect width={WW} height={WH} fill="#f1dcc0" /><rect x={14} y={14} width={142} height={110} fill="#fff6e4" /><path d="M 85,14 L 85,124 M 14,69 L 156,69" stroke="#c9a77f" strokeWidth={3} /><rect y={130} width={WW} height={84} fill="#b78a5e" /><Mini x={70} y={170} c="#3a2a22" sit /><rect x={100} y={140} width={14} height={14} rx={2} fill="#fff" /><path d="M 140,170 C 130,140 150,126 142,100" stroke="#4d6b3a" strokeWidth={4} fill="none" /></g>);
    case 'lamp':
      return (<g><RoomBg warm /><circle cx={130} cy={70} r={46} fill="#fff1c4" opacity={0.35} /><path d="M 116,60 L 144,60 L 152,82 L 108,82 Z" fill="#ffe2a8" /><line x1={130} y1={82} x2={130} y2={150} stroke={c} strokeWidth={3} /><rect x={100} y={150} width={60} height={6} fill={c} /><Mini x={60} y={178} c={c} sit /><rect x={110} y={142} width={14} height={8} rx={2} fill="#111" /></g>);
  }
  return null;
};

const BackScene: React.FC<{k: Back; t: number; my?: boolean}> = ({k, t}) => {
  const c = '#05070c';
  const glow = (x: number, y: number, r = 34) => <circle cx={x} cy={y} r={r} fill="url(#e66phone)" />;
  switch (k) {
    case 'phone':
      return (<g><RoomBg warm={false} />{glow(96, 128)}<Mini x={80} y={186} c={c} sit /><rect x={94} y={124} width={8} height={12} fill="#cfe2ff" /></g>);
    case 'curl':
      return (<g><RoomBg warm={false} /><rect x={20} y={160} width={130} height={22} fill="#0c111c" /><ellipse cx={80} cy={154} rx={44} ry={14} fill={c} /><circle cx={130} cy={150} r={9} fill={c} />{glow(118, 146, 22)}</g>);
    case 'desk':
      return (<g><RoomBg warm={false} /><rect x={30} y={140} width={110} height={8} fill="#0c111c" /><rect x={110} y={110} width={30} height={30} fill="#9fb4d8" opacity={0.5} /><Mini x={70} y={184} c={c} sit /><circle cx={74} cy={132} r={9} fill={c} /></g>);
    case 'knees':
      return (<g><RoomBg warm={false} /><path d="M 60,186 C 56,160 64,140 80,136 L 104,146 C 110,160 108,176 104,186 Z" fill={c} /><circle cx={80} cy={128} r={10} fill={c} /></g>);
    case 'stare':
      return (<g><RoomBg warm={false} /><rect x={110} y={30} width={44} height={70} fill="#2a3a5a" opacity={0.6} /><Mini x={90} y={184} c={c} /></g>);
    case 'bus':
      return (<g><rect width={WW} height={WH} fill="#151b2a" />{[0, 1, 2].map((i) => <rect key={i} x={10 + i * 54} y={40} width={46} height={60} fill="#22304a" />)}<circle cx={40} cy={70} r={4} fill="#ffcf8a" opacity={0.6} /><rect x={20} y={120} width={130} height={60} fill="#0d111b" /><Mini x={80} y={176} c={c} sit /><circle cx={92} cy={124} r={9} fill={c} /><text x={20} y={30} fontFamily={SUB} fontSize={16} fill="#8aa0c0">04:02</text></g>);
    case 'retake':
      return (<g><RoomBg warm={false} />{[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={14 + (i % 3) * 50} y={20 + Math.floor(i / 3) * 52} width={42} height={44} fill="#3a4a66" opacity={0.6} stroke="#9fb4d8" strokeOpacity={0.4} />)}<path d="M 60,186 C 56,170 62,158 74,156 L 96,160 L 120,186 Z" fill={c} /><circle cx={70} cy={146} r={9} fill={c} /></g>);
    case 'bills':
      return (<g><RoomBg warm={false} /><rect x={30} y={130} width={110} height={8} fill="#0c111c" />{[0, 1, 2].map((i) => <rect key={i} x={50 + i * 12} y={104 - i * 4} width={44} height={28} fill="#d8dde8" opacity={0.7} transform={`rotate(${-6 + i * 5} 70 118)`} />)}<Mini x={84} y={182} c={c} sit /><circle cx={88} cy={120} r={9} fill={c} /><text x={14} y={30} fontFamily={SUB} fontSize={15} fill="#ff8f80">-25 năm</text></g>);
    case 'alone':
      return (<g><RoomBg warm={false} /><rect x={20} y={150} width={130} height={30} fill="#0c111c" /><Mini x={86} y={176} c={c} sit />{glow(100, 118, 26)}</g>);
    case 'dark':
      return (<g><rect width={WW} height={WH} fill="#0a0d16" /><circle cx={90} cy={140} r={40} fill="url(#e66phone)" opacity={0.7} /><Mini x={80} y={186} c="#020306" sit /><rect x={92} y={124} width={8} height={12} fill="#cfe2ff" opacity={0.9} /></g>);
  }
  return null;
};

/** Một ô cửa. p = tiến trình lật 0..1 (0 mặt trước, 1 mặt sau). */
const Win: React.FC<{x: number; y: number; front: Front; back: Back; p: number; t: number; dim?: number; frontFirst?: boolean}> = ({x, y, front, back, p, t, dim = 0}) => {
  const a = clamp01(p) * Math.PI;
  const sx = Math.max(0.02, Math.abs(Math.cos(a)));
  const showBack = p >= 0.5;
  return (
    <g transform={`translate(${x + WW / 2},${y}) scale(${sx},1) translate(${-WW / 2},0)`}>
      <rect x={-8} y={-8} width={WW + 16} height={WH + 16} fill="#1a1612" />
      <svg x={0} y={0} width={WW} height={WH} viewBox={`0 0 ${WW} ${WH}`}>
        {showBack ? <BackScene k={back} t={t} /> : <FrontScene k={front} t={t} />}
        {dim > 0 ? <rect width={WW} height={WH} fill="#000" opacity={dim} /> : null}
        {p > 0.02 && p < 0.98 ? <rect width={WW} height={WH} fill="#fff" opacity={0.35 * Math.sin(a)} /> : null}
      </svg>
      <rect x={0} y={0} width={WW} height={WH} fill="none" stroke="#2c241d" strokeWidth={6} />
      <line x1={WW / 2} y1={0} x2={WW / 2} y2={WH} stroke="#2c241d" strokeWidth={4} />
      <rect x={-12} y={WH + 6} width={WW + 24} height={10} fill="#2a231c" />
    </g>
  );
};

type Cam = {s: number; x: number; y: number};
const camAt = (t: number): Cam => {
  const wide = {s: 0.64, x: FW / 2, y: wy(5) + WH / 2 + 40};
  const my = (s: number) => ({s, x: wx(MY.c) + WW / 2, y: wy(MY.r) + WH / 2});
  const ft = (i: number) => ({s: 2.9, x: wx(FEAT[i].c) + WW / 2, y: wy(FEAT[i].r) + WH / 2 + 30});
  const keys: [number, Cam][] = [
    [D1 - 0.01, my(5)],
    [D1 + 1.2, wide],
    [BAR(9), wide],
    [BAR(9.7), ft(0)],
    [BAR(11), ft(0)],
    [BAR(11.7), ft(1)],
    [BAR(13), ft(1)],
    [BAR(13.7), ft(2)],
    [BAR(15), ft(2)],
    [BAR(15.7), ft(3)],
    [BAR(17), ft(3)],
    [BAR(17.8), wide],
    [BAR(24), {...wide, s: 0.7}],
    [BAR(30.5), my(1.6)],
    [BAR(32), my(2.2)],
    [BAR(38), my(2.4)],
    [D2, my(2.8)],
    [D2 + 1.4, wide],
    [BAR(50), {...wide, s: 0.66}],
    [BAR(51.5), my(3.0)],
    [END, my(3.2)],
  ];
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, c0] = keys[i - 1];
      const [t1, c1] = keys[i];
      const u = (t - t0) / (t1 - t0);
      const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      // zoom theo log để bay mượt
      const s = Math.exp(lerp(Math.log(c0.s), Math.log(c1.s), e));
      return {s, x: lerp(c0.x, c1.x, e), y: lerp(c0.y, c1.y, e)};
    }
  }
  return keys[keys.length - 1][1];
};

const Building: React.FC<{f: number; t: number}> = ({f, t}) => {
  const cam = camAt(t);
  const FOCUS_Y = 1060;
  const cascadeP = (c: number, r: number) => {
    const dist = Math.hypot(c - MY.c, (r - MY.r) * 0.8);
    const at = BAR(18) + 0.2 + dist * 0.42;
    return clamp01((t - at) / 0.32);
  };
  const dimAll = seg(t, [[BAR(22), 0], [BAR(23.5), 0.45], [BAR(30.5), 0.45], [BAR(32), 0.7], [D2, 0.7], [D2 + 0.6, 0]]);
  const endMix = t >= BAR(42);
  const myLit = t >= D2;
  const lamp = t >= BAR(50);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#07060a 0%,#120d0c 100%)'}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <g transform={`translate(${W / 2},${FOCUS_Y}) scale(${cam.s}) translate(${-cam.x},${-cam.y})`}>
          <rect x={-60} y={-40} width={FW + 120} height={FH + 400} fill="#16120f" />
          {Array.from({length: ROWS + 1}, (_, r) => <line key={r} x1={-60} y1={wy(r) - 34} x2={FW + 60} y2={wy(r) - 34} stroke="#211b16" strokeWidth={3} />)}
          <rect x={-60} y={-40} width={FW + 120} height={FH + 400} fill="none" stroke="url(#e66rimW)" strokeWidth={3} opacity={0.5} />
          {Array.from({length: ROWS}, (_, r) =>
            Array.from({length: COLS}, (_, c) => {
              const isMy = c === MY.c && r === MY.r;
              const idx = r * COLS + c;
              const fe = featAt(c, r);
              let front: Front = fe ? fe.front : FRONTS[idx % FRONTS.length];
              let back: Back = fe ? fe.back : BACKS[(idx * 3 + 1) % BACKS.length];
              let p = 0;
              if (isMy) {
                // ô của mình: mặt "tối" là mặt sau; tới drop 2 lật sang "cafe"
                back = 'dark';
                front = lamp ? 'lamp' : 'cafe';
                p = myLit ? 1 - clamp01((t - D2) / 0.3) : 1;
              } else if (fe) {
                p = clamp01((t - fe.at) / 0.34);
                if (t >= BAR(18)) p = 1;
              } else {
                p = cascadeP(c, r);
              }
              if (!isMy && t >= D2) {
                // sau drop 2: mặt sáng trở lại
                p = 1 - clamp01((t - D2 - 0.2 - rnd(idx) * 0.6) / 0.3);
              }
              if (endMix && !isMy) {
                // cuối: mỗi ô lật qua lại chậm — ai cũng có cả hai mặt
                const ph = rnd(idx + 7) * 4;
                const cyc = ((t - BAR(42) + ph) / (BL * 2)) % 2;
                const u = cyc < 1 ? cyc : 2 - cyc;
                p = clamp01((u - 0.35) / 0.3);
              }
              const dim = isMy ? 0 : dimAll;
              return <Win key={idx} x={wx(c)} y={wy(r)} front={front} back={back} p={p} t={t} dim={dim} />;
            }),
          )}
          {/* quầng đèn ô mình khi bật đèn */}
          {lamp ? <circle cx={wx(MY.c) + WW / 2} cy={wy(MY.r) + WH / 2} r={260} fill="url(#e66lamp)" opacity={0.35 * ease((t - BAR(50)) / 0.6)} /> : null}
        </g>
      </svg>
      {/* nhãn cho ô nổi bật */}
      {FEAT.map((q, i) => {
        const vFront = io(f, S(BAR(9.7 + i * 2)), S(q.at), 6);
        const vBack = io(f, S(q.at + 0.15), S(BAR(11 + i * 2)), 6);
        return (
          <React.Fragment key={i}>
            {vFront > 0 ? (
              <div style={{position: 'absolute', left: 0, right: 0, top: 1490, textAlign: 'center', opacity: vFront}}>
                <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 30px', borderRadius: 40, background: 'rgba(0,0,0,0.72)', fontFamily: SUB, fontSize: 34, color: TXT}}>
                  <Heart s={34} /> bản đăng · {POSTS[(['dalat', 'run', 'house', 'party'] as Pic[])[i]].likes}
                </div>
              </div>
            ) : null}
            {vBack > 0 ? (
              <div style={{position: 'absolute', left: 0, right: 0, top: 1440, padding: '26px 60px 34px', textAlign: 'center', opacity: vBack, filter: blurV(vBack), background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.78) 22%, rgba(0,0,0,0.78) 78%, rgba(0,0,0,0) 100%)'}}>
                <div style={{fontFamily: DISP, fontStyle: 'italic', fontWeight: 600, fontSize: 34, color: GOLD, letterSpacing: 2}}>phần không đăng</div>
                <div style={{fontFamily: SUB, fontSize: 46, color: TXT, marginTop: 8, textShadow: '0 3px 10px #000'}}>{q.tag}</div>
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
      {/* phủ tối phía trên cho chữ */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.45) 22%, rgba(0,0,0,0) 36%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.6) 100%)'}} />
    </AbsoluteFill>
  );
};

/* ============================== GIẢNG ĐƯỜNG: ghế sáng dần ============================== */
const SEATS = (() => {
  const out: {x: number; y: number; s: number; order: number}[] = [];
  for (let r = 0; r < 10; r++) {
    const span = 560 + r * 46;
    const s = 0.62 + r * 0.06;
    for (let c = 0; c < 10; c++) out.push({x: W / 2 - span / 2 + (c + 0.5) * (span / 10), y: 720 + r * 90 + r * r * 1.4, s, order: 0});
  }
  const perm = out.map((_, i) => i).sort((a, b) => rnd(a + 0.37) - rnd(b + 0.37));
  perm.forEach((i, k) => (out[i].order = k));
  return out;
})();

const Hall: React.FC<{f: number; t: number}> = ({f, t}) => {
  const nAmber = Math.floor(43 * clamp01((t - BAR(26) - 0.1) / (BL * 0.9)));
  const nRed = Math.floor(23 * clamp01((t - BAR(28)) / 0.45));
  const show = ease((f - S(BAR(24))) / 12);
  const num = t < BAR(28) ? Math.round(43 * clamp01((t - BAR(26) - 0.1) / (BL * 0.9))) : 43 + nRed;
  const isRed = t >= BAR(28);
  const k = isRed ? ease((f - S(BAR(28))) / 5) : 1;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 50% 60%, #2a1f17 0%, #0c0907 70%)'}} />
      <svg width={W} height={H} style={{position: 'absolute', opacity: show}}>
        {/* bậc ghế */}
        {Array.from({length: 10}, (_, r) => {
          const span = 560 + r * 46;
          const y = 720 + r * 90 + r * r * 1.4 + 24;
          return <path key={r} d={`M ${W / 2 - span / 2 - 30},${y} L ${W / 2 + span / 2 + 30},${y}`} stroke="rgba(255,214,160,0.16)" strokeWidth={3} />;
        })}
        {SEATS.map((q, i) => {
          const amber = q.order < nAmber;
          const red = !amber && q.order >= 43 && q.order < 43 + nRed;
          const lit = amber || red;
          const col = red ? '#ff5a45' : '#ffbe6e';
          return (
            <g key={i} transform={`translate(${q.x},${q.y}) scale(${q.s})`}>
              {lit ? <circle cx={0} cy={-26} r={46} fill={col} opacity={0.32} filter="url(#e66soft)" /> : null}
              <path d="M -26,20 C -26,-4 -14,-12 0,-12 C 14,-12 26,-4 26,20 Z" fill={INK} stroke={lit ? col : 'rgba(255,214,160,0.3)'} strokeWidth={2.5} />
              <circle cx={0} cy={-26} r={13} fill={INK} stroke={lit ? col : 'rgba(255,214,160,0.3)'} strokeWidth={2.5} />
            </g>
          );
        })}
      </svg>
      {t >= BAR(26) ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 390, textAlign: 'center', fontFamily: DISP, fontWeight: 900, fontSize: isRed ? 220 : 180, lineHeight: 1, color: isRed ? RED_HOT : GOLD, transform: `scale(${isRed ? 1.5 - 0.5 * k : 1})`, textShadow: isRed ? '0 0 50px rgba(255,70,50,0.7)' : '0 0 30px rgba(255,190,110,0.45)'}}>
          {num}%
        </div>
      ) : null}
      {t >= BAR(28) + 0.5 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', fontFamily: SUB, fontSize: 30, color: 'rgba(246,243,234,0.6)', opacity: ease((f - S(BAR(28) + 0.5)) / 8)}}>đoán 43% · thực tế 66%</div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ============================== PHÍA BÊN KIA: người khác xem ảnh của bạn ============================== */
const Across: React.FC<{f: number; t: number}> = ({f, t}) => {
  const push = seg(t, [[BAR(32), 1], [BAR(38), 1.12]]);
  return (
    <AbsoluteFill style={{transform: `scale(${push})`}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#0c0a10 0%,#07060a 100%)'}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {/* khung cửa sổ nhìn từ ngoài vào */}
        <rect x={60} y={1120} width={960} height={640} fill="#141a2a" />
        <circle cx={600} cy={1380} r={380} fill="url(#e66phone)" opacity={0.55} />
        <rect x={60} y={1640} width={960} height={120} fill="#0d111c" />
        <FigLie x={420} y={1650} s={1.15} hair="long" phone={1} />
        <rect x={60} y={1120} width={960} height={640} fill="none" stroke="#2c241d" strokeWidth={22} />
        <line x1={540} y1={1120} x2={540} y2={1760} stroke="#2c241d" strokeWidth={14} />
        <rect x={30} y={1760} width={1020} height={26} fill="#2a231c" />
        {/* tường gạch quanh */}
        {Array.from({length: 8}, (_, i) => <line key={i} x1={0} y1={1080 - i * 0 + 0} x2={0} y2={0} />)}
      </svg>
      <PhoneCard f={f} t={t} pic="cafe" x={540} y={400} w={470} inF={S(BAR(32))} rot={0} sc={t >= BAR(36) ? 1 + 0.04 * Math.sin((t - BAR(36)) * 2) : 1} />
      {t >= BAR(36) ? (
        <div style={{position: 'absolute', left: 300, top: 400 + 136 + 470 + 12, fontFamily: SUB, fontSize: 22, color: 'rgba(255,255,255,0.0)'}} />
      ) : null}
    </AbsoluteFill>
  );
};

/* ============================== CẢNH (fade cứng theo phách) ============================== */
const Fade: React.FC<{f: number; a: number; b: number; d?: number; first?: boolean; last?: boolean; children: React.ReactNode}> = ({f, a, b, d = 5, first, last, children}) => {
  const fa = S(a);
  const fb = S(b);
  if (f < fa - (first ? 0 : d) || f > fb + d) return null;
  const vin = first ? 1 : ease((f - fa + d) / d);
  const vout = last ? 1 : 1 - ease((f - fb) / d);
  return <AbsoluteFill style={{opacity: Math.min(vin, vout)}}>{children}</AbsoluteFill>;
};

/* ============================== SFX ============================== */
type Fx = [number, string, number];
const FX: Fx[] = [];
FX.push([0.05, 'ping', 0.5], [BAR(2), 'ping', 0.5], [BAR(4), 'ping', 0.5], [BAR(6), 'ping', 0.5]);
FX.push([BAR(2) - 0.08, 'whoosh', 0.3], [BAR(4) - 0.08, 'whoosh', 0.3], [BAR(6) - 0.08, 'whoosh', 0.3]);
FX.push([1.2, 'heart', 0.35], [BAR(2) + 1.2, 'heart', 0.35], [BAR(4) + 1.2, 'heart', 0.35], [BAR(6) + 1.2, 'heart', 0.35]);
FX.push([D1 - 0.9, 'riser', 0.55], [D1 - 0.9, 'suck', 0.35]);
FX.push([D1, 'impact', 1], [D1, 'stamp', 0.6], [MID(8), 'stamp', 0.85], [MID(8), 'thud', 0.5]);
[9, 11, 13, 15].forEach((k) => FX.push([BAR(k), 'whoosh', 0.4]));
FEAT.forEach((q) => FX.push([q.at, 'snap', 0.65], [q.at, 'thud', 0.5]));
FX.push([BAR(17), 'whoosh', 0.45]);
for (let k = 0; k < 14; k++) FX.push([BAR(18) + 0.2 + k * (BP / 2) * 1.3, 'pop', 0.32]);
FX.push([BAR(22), 'shimmer', 0.3]);
FX.push([BAR(24) - 0.05, 'whoosh', 0.35]);
for (let k = 0; k < 43; k += 2) FX.push([BAR(26) + 0.1 + (k / 43) * BL * 0.9, 'tick', 0.3]);
FX.push([BAR(28), 'impact', 0.6], [BAR(28), 'stamp', 0.45]);
for (let k = 0; k < 8; k++) FX.push([BAR(28) + 0.04 + k * 0.055, 'pop', 0.3]);
FX.push([BAR(30.5), 'heart', 0.5], [BAR(31), 'heart', 0.5], [BAR(31.5), 'heart', 0.45]);
FX.push([BAR(32), 'whoosh', 0.35], [BAR(36), 'ping', 0.45], [BAR(36) + 0.9, 'heart', 0.4]);
FX.push([D2 - 0.9, 'riser', 0.6], [D2 - 0.9, 'suck', 0.35]);
FX.push([D2, 'impact', 1], [D2, 'sunrise', 0.45], [MID(40), 'stamp', 0.85], [BAR(41), 'thud', 0.55]);
[42, 44, 46, 48].forEach((k) => FX.push([BAR(k), 'snap', 0.22]));
FX.push([BAR(50), 'click', 0.75], [BAR(50) + 0.1, 'shimmer', 0.3]);
const fxSrc = (n: string) => `audio/ep60-troi-sap/sfx/${n}.wav`;

/* ============================== CHÍNH ============================== */
export const Ep66BanDep: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const HITS: [number, number][] = [[D1, 24], [MID(8), 20], ...FEAT.map((q) => [q.at, 10] as [number, number]), [BAR(28), 14], [D2, 26], [MID(40), 18], [BAR(41), 9], [BAR(50), 6]];
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
  const inBuilding = (t >= D1 - 0.02 && t < BAR(24) + 0.2) || (t >= BAR(30.5) - 0.2 && t < BAR(32) + 0.2) || t >= BAR(38) - 0.2;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Defs />
      <AbsoluteFill style={{transform: `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) scale(${1 + punch})`}}>
        <Fade f={f} a={0} b={BAR(2)} first><Room1 f={f} t={t} /></Fade>
        <Fade f={f} a={BAR(2)} b={BAR(4)}><Room2 f={f} t={t} /></Fade>
        <Fade f={f} a={BAR(4)} b={BAR(6)}><Room3 f={f} t={t} /></Fade>
        <Fade f={f} a={BAR(6)} b={D1} d={2}><Room4 f={f} t={t} /></Fade>
        {inBuilding ? (
          <>
            <Fade f={f} a={D1} b={BAR(24)} d={2}><Building f={f} t={t} /></Fade>
            <Fade f={f} a={BAR(30.5)} b={BAR(32)}><Building f={f} t={t} /></Fade>
            <Fade f={f} a={BAR(38)} b={END + 5} last><Building f={f} t={t} /></Fade>
          </>
        ) : null}
        <Fade f={f} a={BAR(24)} b={BAR(30.5)}><Hall f={f} t={t} /></Fade>
        <Fade f={f} a={BAR(32)} b={BAR(38)}><Across f={f} t={t} /></Fade>
        <Slam f={f} top={330} out={BAR(9) - 0.05} lines={[{t: D1, text: 'AI CŨNG ỔN.', color: TXT, size: 132}, {t: MID(8), text: 'TRỪ MÌNH.', color: RED_HOT, size: 170}]} />
        <Slam f={f} top={300} out={BAR(42) - 0.05} lines={[{t: D2, text: 'MÌNH CŨNG LÀ', color: TXT, size: 96}, {t: MID(40), text: 'BẢN ĐẸP NHẤT', color: RED_HOT, size: 120}, {t: BAR(41), text: 'trong mắt ai đó.', color: TXT, size: 66, serif: true}]} />
        {CAPS.map(([a, b, tx], i) => <Caption key={i} f={f} a={a} b={b} text={tx} />)}
        <Foot f={f} a={BAR(28) + 0.4} b={BAR(30.5)} text="Jordan và cộng sự (2011), Personality and Social Psychology Bulletin · khảo sát sinh viên một đại học Mỹ" />
      </AbsoluteFill>
      {flash(D1, 'rgba(255,190,120,A)', 0.4)}
      {flash(BAR(28), 'rgba(255,60,40,A)', 0.3)}
      {flash(D2, 'rgba(255,220,170,A)', 0.6)}
      <FilGrain opacity={0.06} />
      {WITH_MUSIC && <Audio src={staticFile('audio/ep66-ban-dep/track0908.mp3')} volume={0.8} />}
      {FX.map(([tm, nm, g], i) => (
        <Sequence key={i} from={Math.max(0, S(tm))} durationInFrames={S(3.2)}>
          <Audio src={staticFile(fxSrc(nm))} volume={Math.round(g * 0.9 * 20) / 20} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
