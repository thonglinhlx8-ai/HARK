import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, getInputProps, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
const NO_BGM = Boolean((getInputProps() as {noBgm?: boolean}).noBgm);
import {clamp01} from '../../library/anim';
import {FilBg, FilGrain} from '../../library/filament/stage';
import {ease, F} from '../../library/filament/theme';
import {BAR, BP, E, END, MID, S, W, H} from './timeline';

/**
 * ep63 "Ổn" — kìm nén cảm xúc (Gross & Levenson 1997; Wegner 1987; Lieberman 2007).
 * Thiết bị hình RIÊNG của tập: ấm nước ôm trước ngực + tấm "ỔN" chồng lên nắp + thanh soạn tin gõ câu thật rồi xoá.
 * Không import thiết bị hình của Ep60/Ep62 — chỉ dùng nền/hạt của kênh.
 */

const SUB = "'Ep63 Sub', 'Filament Viet', sans-serif";
const DISP = "'Ep63 Display', 'Filament Viet Display', serif";
if (typeof document !== 'undefined') {
  const h = delayRender('ep63 fonts');
  Promise.all([
    new FontFace('Ep63 Sub', `url(${staticFile('fonts/ep58/BeVietnamPro-ExtraBold.ttf')})`).load().then((l) => document.fonts.add(l)),
    new FontFace('Ep63 Display', `url(${staticFile('fonts/ep58/PlayfairDisplay.ttf')})`, {weight: '400 900'}).load().then((l) => document.fonts.add(l)),
  ]).catch(() => undefined).finally(() => continueRender(h));
}

const LINE = 'rgba(240,212,165,0.66)';
const LINE_DIM = 'rgba(240,212,165,0.3)';
const RED = F.red;
const RED_HOT = F.redHot;
const GOLD = '#f2c46d';
const TXT = F.text;
const cx = W / 2;

const io = (f: number, a: number, b: number, d = 8) => ease((f - a) / d) * (1 - ease((f - b) / d));
const blurV = (v: number) => (v >= 0.999 ? undefined : `blur(${((1 - v) * 10).toFixed(1)}px)`);
const rnd = (k: number) => {
  const x = Math.sin(k * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ============================== KỊCH BẢN ============================== */
type Msg = {at: number; text: string; side: 'in' | 'out' | 'sys'; red?: boolean};
type Sc = {
  id: string;
  a: number;
  b: number;
  clock: string;
  part: string;
  head: string;
  sub?: string;
  truth?: string;
  said?: string;
  truthAt?: number;
  stamp?: number;
  msgs: Msg[];
  art?: 'bank' | 'office' | 'story' | 'notif' | 'call';
};

const SCENES: Sc[] = [
  {id: 's1', a: 1, b: 5, clock: '6:50', part: 'SÁNG', head: 'Mẹ', sub: 'đang hoạt động', art: 'bank', truth: 'Con hết tiền rồi mẹ', said: 'Được mẹ, con ổn.', truthAt: BAR(3) + 0.55, stamp: MID(4), msgs: [{at: BAR(3) + 0.1, text: 'Tháng này gửi về được không con?', side: 'in'}]},
  {id: 's2', a: 5, b: 8, clock: '9:40', part: 'SÁNG', head: 'Phòng họp', sub: '12 người', truth: 'Không phải lỗi em', said: 'Dạ, em ổn, em sửa.', truthAt: BAR(6) + 0.25, stamp: MID(7), msgs: [{at: BAR(5) + 0.35, text: 'Sếp: Ai làm hỏng cái này vậy hả?!', side: 'in', red: true}]},
  {id: 's3', a: 8, b: 11, clock: '12:30', part: 'TRƯA', head: 'Nhóm Thân (4)', sub: 'story · 2 giờ trước', art: 'story', truth: 'Sao không rủ tao?', said: 'Vui ghê, tao ổn mà.', truthAt: BAR(9) + 0.3, stamp: MID(10), msgs: []},
  {id: 's4', a: 11, b: 13, clock: '17:55', part: 'CHIỀU', head: 'Thông báo', sub: '2 mới', art: 'notif', truth: 'Em cần đi khám', said: 'Ổn ạ.', truthAt: BAR(11) + 0.95, stamp: MID(12), msgs: []},
  {id: 's5', a: 13, b: 15, clock: '20:15', part: 'TỐI', head: 'Bố', sub: 'đang gọi · 02:14', truth: 'Con đã cố lắm rồi', said: 'Dạ, con biết rồi. Con ổn.', truthAt: BAR(13) + 0.75, stamp: MID(14), msgs: [{at: BAR(13) + 0.15, text: 'Bố: Con bác Tư mua nhà rồi đó.', side: 'in'}]},
  {id: 's6', a: 15, b: 18, clock: '22:30', part: 'ĐÊM', head: 'Người ấy', sub: 'đang hoạt động', truth: 'Mình mệt lắm', said: 'Ổn mà, đừng nghĩ nhiều.', truthAt: BAR(15) + 1.05, stamp: MID(16), msgs: [
    {at: BAR(15) + 0.2, text: 'Dạo này lạ lắm. Mình nói chuyện được không?', side: 'in'},
    {at: BAR(17) + 0.05, text: 'Lúc nào cũng ổn.', side: 'in'},
    {at: BAR(17) + 0.75, text: 'Đã xem · Người ấy đã offline', side: 'sys'},
  ]},
];
const FLASH = [
  {t: BAR(18) + BP, truth: 'Mình không ổn', clock: '22:41'},
  {t: BAR(18) + 2 * BP, truth: 'Ai hỏi lại mình đi', clock: '22:58'},
  {t: BAR(18) + 3 * BP, truth: 'Mình muốn khóc', clock: '23:15'},
];
const STAMPS = [...SCENES.map((s) => s.stamp as number), ...FLASH.map((x) => x.t)];
const TRUTHS = [...SCENES.map((s) => s.truth as string), ...FLASH.map((x) => x.truth)];
const REWIND_SEND = MID(38);

const CAPS: [number, number, string][] = [
  [-2, BAR(1) - 0.12, 'Hôm nay bạn đã nói 【ổn】 mấy lần?'],
  [BAR(1) + 0.05, BAR(3) - 0.12, 'Còn 9 ngày nữa mới có lương.'],
  [BAR(3) + 0.05, BAR(5) - 0.12, 'Mẹ hỏi tháng này 【gửi về】 được không.'],
  [BAR(5) + 0.05, BAR(8) - 0.12, 'Bị mắng trước cả phòng, vì lỗi của 【người khác】.'],
  [BAR(8) + 0.05, BAR(11) - 0.12, 'Cả nhóm đi chơi. 【Không ai rủ】.'],
  [BAR(11) + 0.05, BAR(13) - 0.12, 'Việc gấp mới. Lịch khám 【dời lần thứ ba】.'],
  [BAR(13) + 0.05, BAR(15) - 0.12, 'Bố gọi: “Con bác Tư mua nhà rồi đó.”'],
  [BAR(15) + 0.05, BAR(17) - 0.12, 'Người ấy hỏi: mình nói chuyện được không?'],
  [BAR(17) + 0.05, BAR(18) - 0.1, '【Đã xem】. Rồi offline.'],
  [BAR(24) + 0.05, BAR(26) - 0.12, 'Giấu suốt cả ngày như vậy, có một cái tên:'],
  [BAR(26) + 0.05, BAR(28) - 0.12, 'Giấu cảm xúc đi, nó 【không nhỏ lại】.'],
  [BAR(28) + 0.05, BAR(30) - 0.12, 'Bên ngoài bình thường. Bên trong 【căng hơn】.'],
  [BAR(30) + 0.05, BAR(31.5) - 0.12, 'Cảm xúc của bạn như một 【lò xo】.'],
  [BAR(31.5) + 0.05, BAR(33) - 0.12, 'Càng nén xuống, càng 【bật lại mạnh】.'],
  [BAR(33) + 0.05, BAR(34.5) - 0.12, 'Gọi đúng tên nó ra, dù chỉ một chữ,'],
  [BAR(34.5) + 0.05, BAR(36) - 0.12, 'vùng báo động trong não 【dịu xuống】.'],
  [BAR(36) + 0.05, BAR(38) - 0.12, 'Quay lại 22:30.'],
  [BAR(38) + 0.05, BAR(40) - 0.12, 'Lần này, nói 【thật】.'],
  [BAR(40) + 0.05, BAR(41) - 0.1, 'Không ổn cũng được.'],
  [BAR(41) + 0.05, BAR(42.5) - 0.12, 'Chỉ đừng nói 【“ổn”】 với chính mình.'],
  [BAR(42.5) + 0.05, END + 1, 'Lần gần nhất bạn nói “ổn” mà không ổn là khi nào?'],
];

/* ============================== CHỮ ============================== */
const Caption: React.FC<{f: number; a: number; b: number; text: string; top?: number}> = ({f, a, b, text, top = 262}) => {
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

/** Đồng hồ trên đầu khung: giờ + buổi */
const ClockTag: React.FC<{f: number; text: string; part: string; a: number; b: number; first?: boolean}> = ({f, text, part, a, b, first}) => {
  const v = first ? 1 - ease((f - S(b)) / 6) : io(f, S(a), S(b), 6);
  if (v <= 0) return null;
  const pop = first ? 1 : 1 + 0.12 * Math.exp(-Math.max(0, f - S(a)) / 4);
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 120, textAlign: 'center', opacity: v, transform: `scale(${pop})`}}>
      <span style={{fontFamily: DISP, fontWeight: 800, fontSize: 70, color: TXT, letterSpacing: 2, textShadow: '0 0 30px rgba(255,214,150,0.25)'}}>{text}</span>
      <span style={{fontFamily: SUB, fontSize: 24, color: GOLD, letterSpacing: 6, marginLeft: 18, verticalAlign: 18}}>{part}</span>
    </div>
  );
};

/* ============================== THANH SOẠN TIN (thiết bị) ============================== */
const composerState = (t: number, s: Sc) => {
  if (!s.truth || s.truthAt === undefined || s.stamp === undefined) return {text: '', red: false};
  const tr = s.truth;
  const sd = s.said ?? 'Ổn.';
  const st = s.stamp;
  const typeEnd = s.truthAt + tr.length / 15;
  if (t < s.truthAt) return {text: '', red: false};
  if (t < st - 1.0) return {text: tr.slice(0, Math.min(tr.length, Math.floor((t - s.truthAt) * 15))), red: true, typing: t < typeEnd};
  if (t < st - 0.45) return {text: tr.slice(0, Math.max(0, Math.round(tr.length * (1 - (t - (st - 1.0)) / 0.55)))), red: true, del: true};
  if (t < st - 0.05) return {text: sd.slice(0, Math.ceil(sd.length * clamp01((t - (st - 0.45)) / 0.35))), red: false};
  return {text: '', red: false};
};

const Composer: React.FC<{f: number; text: string; red: boolean; del?: boolean; big?: boolean}> = ({f, text, red, del, big}) => {
  const blink = Math.floor(f / 8) % 2 === 0;
  return (
    <div style={{position: 'absolute', left: 26, right: 26, bottom: 24, height: big ? 110 : 84, borderRadius: 44, border: `2px solid ${red ? 'rgba(255,90,70,0.85)' : 'rgba(240,212,165,0.45)'}`, background: red ? 'rgba(80,18,12,0.55)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', padding: '0 30px', boxShadow: red ? '0 0 30px rgba(255,60,40,0.35)' : undefined}}>
      <span style={{fontFamily: SUB, fontSize: big ? 50 : 36, color: red ? RED_HOT : TXT, whiteSpace: 'nowrap', textDecoration: del ? 'line-through' : undefined, textDecorationColor: 'rgba(255,255,255,0.6)'}}>
        {text || <span style={{color: 'rgba(240,212,165,0.32)'}}>Nhập tin nhắn…</span>}
      </span>
      <span style={{width: 3, height: big ? 52 : 40, marginLeft: 4, background: red ? RED_HOT : TXT, opacity: blink ? 1 : 0}} />
      <span style={{marginLeft: 'auto', width: 58, height: 58, borderRadius: 29, background: text ? (red ? RED : GOLD) : 'rgba(240,212,165,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width={26} height={26} viewBox="0 0 26 26"><path d="M3,13 L22,4 L16,22 L13,14 Z" fill="#1a130e" /></svg>
      </span>
    </div>
  );
};

const Bub: React.FC<{f: number; at: number; text: string; side: 'in' | 'out' | 'sys'; red?: boolean; big?: boolean}> = ({f, at, text, side, red, big}) => {
  const d = f - S(at);
  if (d < 0) return null;
  const v = ease(d / 6);
  const pop = 1 + 0.12 * Math.exp(-d / 3) * (d < 12 ? 1 : 0);
  if (side === 'sys') return <div style={{alignSelf: 'center', fontFamily: SUB, fontSize: 26, color: 'rgba(240,212,165,0.5)', opacity: v, margin: '8px 0'}}>{text}</div>;
  const out = side === 'out';
  return (
    <div style={{alignSelf: out ? 'flex-end' : 'flex-start', maxWidth: '82%', margin: '9px 0', padding: big ? '22px 34px' : '16px 26px', borderRadius: 30, borderBottomRightRadius: out ? 8 : 30, borderBottomLeftRadius: out ? 30 : 8, background: out ? 'linear-gradient(180deg,#f2c46d,#d9a54c)' : red ? 'rgba(120,26,18,0.75)' : 'rgba(255,255,255,0.08)', border: out ? 'none' : `1.5px solid ${red ? 'rgba(255,90,70,0.8)' : 'rgba(240,212,165,0.3)'}`, color: out ? '#1d140c' : red ? RED_HOT : TXT, fontFamily: SUB, fontSize: big ? 44 : 34, lineHeight: 1.3, opacity: v, transform: `translateY(${((1 - v) * 20).toFixed(1)}px) scale(${pop})`, transformOrigin: out ? 'right bottom' : 'left bottom'}}>
      {text}
    </div>
  );
};

const Art: React.FC<{f: number; s: Sc}> = ({f, s}) => {
  const t = (f - S(BAR(s.a))) / 30;
  if (s.art === 'bank') {
    const v = ease((f - S(BAR(s.a) + 0.25)) / 8);
    return (
      <div style={{margin: '6px 0 10px', padding: '18px 24px', borderRadius: 22, background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(240,212,165,0.28)', opacity: v, transform: `translateY(${(1 - v) * -30}px)`}}>
        <div style={{fontFamily: SUB, fontSize: 24, color: 'rgba(240,212,165,0.6)'}}>NGÂN HÀNG · vừa xong</div>
        <div style={{fontFamily: SUB, fontSize: 36, color: TXT, marginTop: 6}}>
          Số dư: <span style={{color: RED_HOT}}>312.000đ</span>
        </div>
        <div style={{fontFamily: SUB, fontSize: 24, color: 'rgba(240,212,165,0.6)', marginTop: 4}}>Còn 9 ngày đến kỳ lương</div>
      </div>
    );
  }
  if (s.art === 'story') {
    const v = ease((f - S(BAR(s.a) + 0.2)) / 9);
    const prog = clamp01((f - S(BAR(s.a) + 0.2)) / S(5));
    return (
      <div style={{alignSelf: 'center', width: 520, height: 400, borderRadius: 26, overflow: 'hidden', position: 'relative', opacity: v, transform: `scale(${0.9 + 0.1 * v})`, border: '1.5px solid rgba(240,212,165,0.35)', background: 'linear-gradient(180deg, rgba(255,190,110,0.35), rgba(60,40,25,0.6))'}}>
        <div style={{position: 'absolute', left: 16, right: 16, top: 14, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.25)'}}>
          <div style={{width: `${prog * 100}%`, height: 5, borderRadius: 3, background: '#fff'}} />
        </div>
        <svg width={520} height={400} viewBox="-260 -200 520 400" style={{position: 'absolute', left: 0, top: 0}}>
          <circle cx={150} cy={-90} r={46} fill="rgba(255,226,160,0.8)" />
          <path d="M-260,90 Q-120,60 0,82 Q130,100 260,70 L260,200 L-260,200 Z" fill="rgba(30,22,16,0.7)" />
          {[-150, -60, 30, 120].map((x, i) => (
            <g key={i} transform={`translate(${x},${60 - (i % 2) * 8})`}>
              <path d="M-26,40 Q-26,-22 0,-26 Q26,-22 26,40 Z" fill="#1d1510" />
              <circle cx={0} cy={-44} r={16} fill="#1d1510" />
              <path d={`M20,-10 L${44},${-50 - i * 3}`} stroke="#1d1510" strokeWidth={8} strokeLinecap="round" />
            </g>
          ))}
        </svg>
        <div style={{position: 'absolute', left: 22, bottom: 16, fontFamily: SUB, fontSize: 26, color: '#fff', textShadow: '0 2px 8px #000'}}>Đà Lạt cuối tuần ✦ đủ bộ!</div>
      </div>
    );
  }
  if (s.art === 'notif') {
    const v1 = ease((f - S(BAR(s.a) + 0.1)) / 7);
    const v2 = ease((f - S(BAR(s.a) + 0.45)) / 7);
    const press = BAR(s.a) + 0.8;
    const pd = f - S(press);
    const pressed = pd >= 0;
    const card = (v: number, children: React.ReactNode, red?: boolean) => (
      <div style={{margin: '8px 0', padding: '16px 22px', borderRadius: 20, background: red ? 'rgba(90,20,14,0.6)' : 'rgba(255,255,255,0.06)', border: `1.5px solid ${red ? 'rgba(255,90,70,0.7)' : 'rgba(240,212,165,0.28)'}`, opacity: v, transform: `translateX(${(1 - v) * 60}px)`}}>{children}</div>
    );
    return (
      <div>
        {card(v1, <>
          <div style={{fontFamily: SUB, fontSize: 22, color: 'rgba(240,212,165,0.6)'}}>EMAIL · Sếp</div>
          <div style={{fontFamily: SUB, fontSize: 32, color: TXT}}>Gấp: nộp bản mới <span style={{color: RED_HOT}}>trước 8h sáng mai</span></div>
        </>, true)}
        {card(v2, <>
          <div style={{fontFamily: SUB, fontSize: 22, color: 'rgba(240,212,165,0.6)'}}>LỊCH · Khám bệnh · đã dời 2 lần</div>
          <div style={{display: 'flex', gap: 16, marginTop: 10}}>
            <div style={{flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 30, border: '1.5px solid rgba(240,212,165,0.4)', fontFamily: SUB, fontSize: 28, color: pressed ? 'rgba(240,212,165,0.35)' : TXT}}>Giữ lịch</div>
            <div style={{flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 30, background: pressed ? 'linear-gradient(180deg,#ff5a46,#c8261b)' : 'rgba(255,255,255,0.06)', border: pressed ? 'none' : '1.5px solid rgba(240,212,165,0.4)', fontFamily: SUB, fontSize: 28, color: '#fff', transform: `scale(${pressed ? 1 + 0.12 * Math.exp(-pd / 3) - (pd < 2 ? 0.08 : 0) : 1})`}}>{pressed ? 'Đã hủy' : 'Hủy'}</div>
          </div>
        </>)}
      </div>
    );
  }
  if (s.art === 'call') {
    return (
      <div style={{alignSelf: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0 6px'}}>
        <div style={{width: 110, height: 110, borderRadius: 55, border: `2px solid ${LINE}`, background: '#2a2119', boxShadow: `0 0 0 ${10 + 6 * Math.sin(t * 6)}px rgba(242,196,109,0.12)`}} />
        <svg width={420} height={70} viewBox="0 0 420 70" style={{marginTop: 12}}>
          {Array.from({length: 30}, (_, i) => {
            const h = 8 + 50 * Math.abs(Math.sin(t * 7 + i * 0.7) * Math.sin(i * 0.37 + t * 2));
            return <rect key={i} x={i * 14} y={35 - h / 2} width={7} height={h} rx={3} fill={GOLD} opacity={0.75} />;
          })}
        </svg>
      </div>
    );
  }
  return null;
};


/* ============================== BỐI CẢNH ĐỜI THẬT (line-art, khung 1080×820 đặt ở top 880) ============================== */
const ST = 880;
const KX = 540;
const KY = 1500;
const BODY = 'url(#e63body)';
const FLOOR = 760;

const Glow: React.FC<{x: number; y: number; r?: number; c?: string; o?: number}> = ({x, y, r = 120, c = '150,190,255', o = 0.5}) => (
  <circle cx={x} cy={y} r={r} fill={`url(#e63glow-${c.replace(/,/g, '-')})`} opacity={o} />
);

/** Người ngồi nhìn nghiêng (mặt hướng phải nếu dir=1), cầm điện thoại */
const Sitter: React.FC<{x: number; y: number; dir?: number; hunch?: number; phone?: boolean; f: number; s?: number; arms?: 'phone' | 'table' | 'cup'}> = ({x, y, dir = 1, hunch = 0, phone = true, f, s = 1, arms = 'phone'}) => {
  const hx = 22 + hunch * 34;
  const hy = -190 + hunch * 34;
  const breathe = Math.sin(f / 22) * 2;
  return (
    <g transform={`translate(${x},${y}) scale(${dir * s},${s})`}>
      <path d="M0,0 L96,4 L100,170" stroke="#2a221b" strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M0,0 L96,4 L100,170" stroke={LINE_DIM} strokeWidth={1.4} fill="none" />
      <path d={`M-34,10 L-30,-110 Q${-22 + hunch * 20},${-150 + breathe} ${10 + hunch * 26},${-150 + hunch * 14 + breathe} Q${40 + hunch * 20},${-136 + hunch * 10} 36,-90 L34,10 Z`} fill={BODY} stroke={LINE} strokeWidth={2} />
      <circle cx={hx} cy={hy + breathe} r={36} fill={BODY} stroke={LINE} strokeWidth={2} />
      {arms === 'phone' ? (
        <>
          <path d={`M14,-110 Q60,-60 ${84},${-86 + hunch * 10}`} stroke="#4a3c30" strokeWidth={16} fill="none" strokeLinecap="round" />
          {phone ? (
            <g transform={`translate(${92},${-104 + hunch * 10}) rotate(-20)`}>
              <rect x={-11} y={-20} width={22} height={38} rx={4} fill="#b8d0ff" opacity={0.9} />
              <circle cx={0} cy={0} r={70} fill="url(#e63phone)" />
            </g>
          ) : null}
        </>
      ) : arms === 'cup' ? (
        <path d="M14,-110 Q50,-50 110,-40" stroke="#4a3c30" strokeWidth={16} fill="none" strokeLinecap="round" />
      ) : (
        <path d="M14,-110 Q40,-40 120,-30" stroke="#4a3c30" strokeWidth={16} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
};

/** Người đứng nhìn nghiêng */
const Stander: React.FC<{x: number; y: number; dir?: number; bow?: number; point?: number; s?: number; f: number; red?: boolean}> = ({x, y, dir = 1, bow = 0, point, s = 1, f, red}) => (
  <g transform={`translate(${x},${y}) scale(${dir * s},${s})`}>
    <path d="M-14,-170 L-18,0 M16,-170 L18,0" stroke="#2a221b" strokeWidth={24} strokeLinecap="round" />
    <path d={`M-38,-160 L-34,-320 Q${-20 + bow * 20},${-362} ${6 + bow * 30},${-360 + bow * 14} Q${36 + bow * 20},${-350} 38,-310 L40,-160 Z`} fill={BODY} stroke={red ? 'rgba(255,110,90,0.8)' : LINE} strokeWidth={2} />
    <circle cx={10 + bow * 40} cy={-398 + bow * 40} r={40} fill={BODY} stroke={red ? 'rgba(255,110,90,0.8)' : LINE} strokeWidth={2} />
    {point !== undefined ? (
      <path d={`M24,-320 L${24 + 120 * Math.cos(point)},${-320 - 120 * Math.sin(point) + 6 * Math.sin(f / 2)}`} stroke={red ? RED : '#4a3c30'} strokeWidth={16} strokeLinecap="round" />
    ) : (
      <path d={`M14,-320 Q${30 + bow * 10},-250 ${20 + bow * 20},-200`} stroke="#4a3c30" strokeWidth={15} fill="none" strokeLinecap="round" />
    )}
  </g>
);

const SmallFig: React.FC<{x: number; y: number; s?: number; o?: number}> = ({x, y, s = 1, o = 0.7}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M-30,40 Q-30,-26 0,-30 Q30,-26 30,40 Z" fill="#2a2119" stroke={LINE_DIM} strokeWidth={1.5} />
    <circle cx={0} cy={-52} r={18} fill="#2a2119" stroke={LINE_DIM} strokeWidth={1.5} />
  </g>
);

const Window: React.FC<{x: number; y: number; w: number; h: number; sky: string; children?: React.ReactNode}> = ({x, y, w, h, sky, children}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={sky} stroke={LINE} strokeWidth={3} rx={6} />
    <g clipPath={`inset(0)`}>{children}</g>
    <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={LINE_DIM} strokeWidth={3} />
    <line x1={x} y1={y + h * 0.45} x2={x + w} y2={y + h * 0.45} stroke={LINE_DIM} strokeWidth={3} />
  </g>
);

const Desk: React.FC<{x1: number; x2: number; y: number}> = ({x1, x2, y}) => (
  <g>
    <rect x={x1} y={y} width={x2 - x1} height={16} fill="#3a2d22" stroke={LINE} strokeWidth={2} />
    <line x1={x1 + 20} y1={y + 16} x2={x1 + 20} y2={FLOOR} stroke={LINE_DIM} strokeWidth={4} />
    <line x1={x2 - 20} y1={y + 16} x2={x2 - 20} y2={FLOOR} stroke={LINE_DIM} strokeWidth={4} />
  </g>
);

const Chair: React.FC<{x: number; y: number; dir?: number}> = ({x, y, dir = 1}) => (
  <g transform={`translate(${x},${y}) scale(${dir},1)`}>
    <path d="M-60,0 L70,0 M-56,0 L-56,-190 M-50,0 L-50,170 M60,0 L60,170" stroke={LINE_DIM} strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);

type Place = 'home' | 'office' | 'cafe' | 'dusk' | 'dinner' | 'bed' | 'kitchen' | 'morning';
const Place: React.FC<{f: number; kind: Place; hunch: number; t: number}> = ({f, kind, hunch, t}) => {
  const floor = <line x1={0} y1={FLOOR} x2={W} y2={FLOOR} stroke={LINE_DIM} strokeWidth={3} />;
  if (kind === 'home' || kind === 'morning') {
    const sun = kind === 'morning';
    return (
      <g>
        <Window x={110} y={90} w={300} h={340} sky={sun ? 'rgba(255,206,130,0.28)' : 'rgba(190,210,240,0.12)'}>
          {sun ? <circle cx={260} cy={360 - 160 * ease(t / 5)} r={50} fill="rgba(255,214,150,0.9)" /> : <circle cx={330} cy={200} r={26} fill="rgba(230,235,245,0.5)" />}
        </Window>
        <path d={`M110,430 L${sun ? 520 : 380},${FLOOR} L${sun ? 820 : 600},${FLOOR} L410,430 Z`} fill={sun ? 'rgba(255,206,130,0.12)' : 'rgba(190,210,240,0.05)'} />
        {floor}
        <Desk x1={560} x2={1000} y={470} />
        <path d="M900,470 L900,380 L950,330" stroke={LINE} strokeWidth={4} fill="none" />
        <path d="M925,330 L985,330 L965,300 L945,300 Z" fill="#3a2d22" stroke={LINE} strokeWidth={2} />
        <rect x={780} y={430} width={40} height={40} rx={6} fill="#3a2d22" stroke={LINE} strokeWidth={2} />
        {sun ? <path d="M790,420 Q800,390 790,370 M810,420 Q820,390 810,370" stroke="rgba(240,226,200,0.5)" strokeWidth={3} fill="none" /> : null}
        <Chair x={470} y={590} />
        <Sitter f={f} x={470} y={580} hunch={sun ? 0 : hunch} phone={!sun} arms={sun ? 'cup' : 'phone'} />
      </g>
    );
  }
  if (kind === 'office') {
    const k = 0.5 + 0.5 * Math.sin(t * 8);
    return (
      <g>
        {floor}
        {[160, 470, 780].map((x, i) => (
          <g key={i} opacity={0.75}>
            <rect x={x} y={300} width={160} height={110} rx={8} fill="rgba(150,180,220,0.08)" stroke={LINE_DIM} strokeWidth={2} />
            <line x1={x + 80} y1={410} x2={x + 80} y2={440} stroke={LINE_DIM} strokeWidth={4} />
            <line x1={x - 30} y1={440} x2={x + 190} y2={440} stroke={LINE_DIM} strokeWidth={4} />
            <SmallFig x={x + (i === 1 ? 40 : 130)} y={420} s={1} o={0.65} />
          </g>
        ))}
        <Stander f={f} x={380} y={FLOOR} dir={1} bow={0.8 + hunch * 0.2} />
        <Stander f={f} x={700} y={FLOOR} dir={-1} point={0.25 + 0.15 * k} s={1.1} red />
      </g>
    );
  }
  if (kind === 'cafe') {
    return (
      <g>
        <rect x={60} y={60} width={960} height={400} fill="rgba(255,232,180,0.08)" stroke={LINE} strokeWidth={3} rx={6} />
        <path d="M60,380 L180,380 L180,250 L280,250 L280,330 L420,330 L420,200 L520,200 L520,360 L700,360 L700,280 L840,280 L840,380 L1020,380" stroke={LINE_DIM} strokeWidth={2} fill="none" />
        {[0, 1, 2].map((i) => {
          const x = ((t * 90 + i * 380) % 1200) - 100;
          return <g key={i} opacity={0.5} transform={`translate(${x},420)`}><SmallFig x={0} y={0} s={0.7} o={0.6} /></g>;
        })}
        {floor}
        <ellipse cx={600} cy={520} rx={130} ry={16} fill="#3a2d22" stroke={LINE} strokeWidth={2} />
        <line x1={600} y1={536} x2={600} y2={FLOOR} stroke={LINE_DIM} strokeWidth={5} />
        <rect x={630} y={480} width={34} height={40} rx={5} fill="#3a2d22" stroke={LINE} strokeWidth={2} />
        <Chair x={430} y={590} />
        <Chair x={810} y={590} dir={-1} />
        <Sitter f={f} x={430} y={580} hunch={hunch} />
      </g>
    );
  }
  if (kind === 'dusk') {
    return (
      <g>
        <Window x={110} y={90} w={300} h={340} sky="rgba(255,120,60,0.25)">
          <circle cx={260} cy={400} r={60} fill="rgba(255,140,70,0.85)" />
        </Window>
        {floor}
        <Desk x1={560} x2={1000} y={470} />
        <rect x={760} y={300} width={200} height={140} rx={8} fill="rgba(150,180,220,0.12)" stroke={LINE} strokeWidth={2} />
        <line x1={860} y1={440} x2={860} y2={470} stroke={LINE} strokeWidth={4} />
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={620} y={454 - i * 14} width={110} height={12} fill="#e9d7b0" opacity={0.6} stroke="#7a5a32" strokeWidth={1} />)}
        <Chair x={470} y={590} />
        <Sitter f={f} x={470} y={580} hunch={hunch} />
      </g>
    );
  }
  if (kind === 'dinner') {
    return (
      <g>
        <line x1={540} y1={0} x2={540} y2={150} stroke={LINE_DIM} strokeWidth={3} />
        <path d="M480,150 L600,150 L570,110 L510,110 Z" fill="#3a2d22" stroke={LINE} strokeWidth={2} />
        <path d="M480,150 L300,500 L780,500 L600,150 Z" fill="rgba(255,214,150,0.08)" />
        {floor}
        <rect x={250} y={500} width={580} height={16} fill="#3a2d22" stroke={LINE} strokeWidth={2} />
        <line x1={280} y1={516} x2={280} y2={FLOOR} stroke={LINE_DIM} strokeWidth={5} />
        <line x1={800} y1={516} x2={800} y2={FLOOR} stroke={LINE_DIM} strokeWidth={5} />
        {[400, 540, 680].map((x, i) => <path key={i} d={`M${x - 30},492 Q${x},530 ${x + 30},492 Z`} fill="#3a2d22" stroke={LINE} strokeWidth={2} />)}
        <Chair x={250} y={620} />
        <Chair x={830} y={620} dir={-1} />
        <Sitter f={f} x={250} y={610} hunch={0.4 + hunch * 0.6} phone={false} arms="table" />
        <Sitter f={f} x={830} y={610} dir={-1} s={1.12} phone={false} arms="table" />
      </g>
    );
  }
  if (kind === 'bed') {
    return (
      <g>
        <Window x={680} y={70} w={260} h={300} sky="rgba(120,140,190,0.12)">
          <circle cx={860} cy={150} r={30} fill="rgba(230,235,245,0.6)" />
        </Window>
        {floor}
        <rect x={110} y={330} width={40} height={330} fill="#3a2d22" stroke={LINE} strokeWidth={2} />
        <rect x={140} y={520} width={820} height={60} rx={10} fill="#3a2d22" stroke={LINE} strokeWidth={2} />
        <line x1={170} y1={580} x2={170} y2={FLOOR} stroke={LINE_DIM} strokeWidth={6} />
        <line x1={930} y1={580} x2={930} y2={FLOOR} stroke={LINE_DIM} strokeWidth={6} />
        <rect x={160} y={440} width={130} height={80} rx={30} fill="#4a3c30" stroke={LINE_DIM} strokeWidth={2} />
        <Sitter f={f} x={250} y={510} hunch={hunch} s={0.95} />
        <path d="M250,505 Q500,440 950,500 L950,530 L250,530 Z" fill="#52402f" stroke={LINE} strokeWidth={2} />
      </g>
    );
  }
  if (kind === 'kitchen') {
    return (
      <g>
        <rect x={820} y={180} width={180} height={580} rx={10} fill="rgba(200,210,230,0.06)" stroke={LINE_DIM} strokeWidth={3} />
        <line x1={840} y1={380} x2={980} y2={380} stroke={LINE_DIM} strokeWidth={3} />
        {floor}
        <Stander f={f} x={470} y={FLOOR} bow={0.5 + hunch * 0.2} />
      </g>
    );
  }
  return null;
};

/* ============================== THANH NĂNG LƯỢNG (thiết bị) ============================== */
const EnergyBar: React.FC<{f: number; v: number; n: number; o: number; lastHit: number}> = ({f, v, n, o, lastHit}) => {
  if (o <= 0) return null;
  const col = v > 0.6 ? '#4fd17a' : v > 0.3 ? '#f2c94c' : RED_HOT;
  const d = f - lastHit;
  const jolt = d >= 0 && d < 12 ? Math.exp(-d / 3) * 10 * Math.sin(d * 2.4) : 0;
  const empty = v <= 0.001;
  const blink = empty ? 0.4 + 0.6 * Math.abs(Math.sin(f / 4)) : 1;
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 1738, opacity: o, transform: `translateX(${jolt}px)`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: SUB, fontSize: 26, letterSpacing: 4, color: 'rgba(240,212,165,0.7)', marginBottom: 10}}>
        <span>NĂNG LƯỢNG</span>
        <span style={{color: col}}>{Math.round(v * 100)}%{n ? <span style={{color: 'rgba(240,212,165,0.6)', marginLeft: 18}}>“ổn” ×{n}</span> : null}</span>
      </div>
      <div style={{height: 44, borderRadius: 22, border: `2px solid ${empty ? RED : 'rgba(240,212,165,0.45)'}`, padding: 4, background: 'rgba(0,0,0,0.4)', opacity: blink}}>
        <div style={{width: `${Math.max(0, v) * 100}%`, height: '100%', borderRadius: 18, background: `linear-gradient(90deg, ${col}, ${col}cc)`, boxShadow: `0 0 24px ${col}88`}} />
      </div>
    </div>
  );
};

/** Chữ đỏ đập từng cụm theo 3 phách của drop */
const DOOM_W: [string, number, number][] = [['BẠN', 0, 120], ['CHƯA BAO GIỜ', 1, 104], ['ỔN', 2, 230]];
const Doom: React.FC<{f: number}> = ({f}) => {
  const a = S(E);
  const end = S(BAR(24));
  if (f < a - 3 || f > end + 6) return null;
  const out = 1 - ease((f - (end - 4)) / 8);
  const dLast = f - S(E + 2 * BP);
  const glitch = dLast >= 0 && dLast < 10 ? Math.exp(-dLast / 3) * 14 : 0;
  const breath = dLast > 10 ? 1 + 0.015 * Math.sin((f - a) / 3.4) : 1;
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 980, transform: `translateY(-50%) scale(${breath.toFixed(3)})`, textAlign: 'center', opacity: out}}>
      {DOOM_W.map(([w, k, fs], i) => {
        const d = f - S(E + k * BP);
        if (d < -2) return <div key={i} style={{height: fs * 1.08}} />;
        const fall = clamp01((d + 2) / 2);
        const sc = d < 0 ? 1.9 - 0.9 * fall : 1 + 0.12 * Math.exp(-d / 2.5) * Math.cos(d * 1.6);
        const last = i === 2;
        const dimPrev = !last && dLast >= 0 ? 0.55 + 0.45 * Math.exp(-dLast / 5) : 1;
        return (
          <div key={i} style={{position: 'relative', fontFamily: SUB, fontSize: fs, lineHeight: 1.08, color: last ? RED_HOT : '#f2e6d6', letterSpacing: last ? 6 : 3, opacity: fall * dimPrev, transform: `scale(${sc.toFixed(3)})`, textShadow: last ? '0 0 60px rgba(255,50,30,0.95), 0 0 120px rgba(255,40,20,0.6)' : '0 0 24px rgba(0,0,0,0.8)'}}>
            {last && glitch > 0.5 ? (
              <>
                <span style={{position: 'absolute', left: 0, right: 0, color: 'rgba(0,220,255,0.55)', transform: `translateX(${-glitch}px)`, mixBlendMode: 'screen'}}>{w}</span>
                <span style={{position: 'absolute', left: 0, right: 0, color: 'rgba(255,0,40,0.7)', transform: `translateX(${glitch}px)`, mixBlendMode: 'screen'}}>{w}</span>
              </>
            ) : null}
            <span style={{position: 'relative'}}>{w}</span>
          </div>
        );
      })}
      {dLast >= 0 ? <div style={{margin: '18px auto 0', height: 10, width: 640 * ease(dLast / 4), background: RED, boxShadow: '0 0 30px rgba(255,40,20,0.8)'}} /> : null}
    </div>
  );
};

/** Bán thân chính diện cho hồi giải thích */
const Bust: React.FC<{f: number; o?: number; split?: number; beat?: number}> = ({f, o = 1, split = 0, beat = 0}) => {
  const hb = 1 + 0.12 * beat * Math.max(0, Math.sin(f / (5 - 2 * beat)));
  return (
    <g opacity={o}>
      <path d="M-250,260 Q-240,40 -130,10 L-60,-14 Q0,-26 60,-14 L130,10 Q240,40 250,260 Z" fill={BODY} stroke={LINE} strokeWidth={2} />
      <rect x={-26} y={-60} width={52} height={50} fill="#2a2119" />
      <circle cx={0} cy={-130} r={78} fill={BODY} stroke={LINE} strokeWidth={2} />
      <circle cx={-26} cy={-138} r={5} fill={LINE} />
      <circle cx={26} cy={-138} r={5} fill={LINE} />
      <path d="M-24,-96 L24,-96" stroke={LINE} strokeWidth={4} strokeLinecap="round" />
      {split > 0 ? (
        <g opacity={split}>
          <path d="M0,-210 L0,260" stroke={GOLD} strokeWidth={2} strokeDasharray="8 7" />
          <path d="M0,-208 A78,78 0 0 1 0,-52 Z M0,-14 L60,-14 L130,10 Q240,40 250,260 L0,260 Z" fill={`rgba(200,40,24,${0.25 + 0.35 * beat})`} />
          <g transform={`translate(70,80) scale(${hb})`}>
            <path d="M0,30 C-50,-6 -40,-50 0,-26 C40,-50 50,-6 0,30 Z" fill={RED_HOT} stroke="#fff" strokeWidth={1.5} opacity={0.9} />
          </g>
        </g>
      ) : null}
    </g>
  );
};
const BigCount: React.FC<{f: number}> = ({f}) => {
  const a = S(BAR(19));
  const b = S(BAR(20));
  if (f < a - 2 || f > b + 8) return null;
  const v = io(f, a, b, 6);
  const hit = f - S(MID(19));
  const red = hit >= -2;
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 560, textAlign: 'center', opacity: v}}>
      <div style={{fontFamily: DISP, fontWeight: 900, fontSize: 132, color: TXT, transform: `scale(${1 + 0.1 * Math.exp(-(f - a) / 4)})`}}>“Ổn”: 9 lần</div>
      {red ? (
        <div style={{fontFamily: SUB, fontSize: 70, color: RED_HOT, marginTop: 16, textShadow: '0 0 40px rgba(255,60,40,0.7)', transform: `scale(${1 + 0.4 * Math.exp(-Math.max(0, hit) / 3)})`}}>Câu thật đã xoá: 9</div>
      ) : null}
    </div>
  );
};

const Kitchen: React.FC<{f: number}> = ({f}) => {
  const a = S(BAR(20));
  const b = S(E);
  if (f < a - 2 || f > b + 2) return null;
  const v = ease((f - a) / 10);
  const brk = S(BAR(21));
  const slip = clamp01((f - (brk - 14)) / 14);
  const fallen = f >= brk;
  const reach = clamp01((f - a) / (brk - 20 - a));
  return (
    <svg width={W} height={1100} viewBox={`0 0 ${W} 1100`} style={{position: 'absolute', left: 0, top: 700, opacity: v}}>
      <line x1={120} y1={600} x2={960} y2={600} stroke={LINE} strokeWidth={3} />
      <line x1={160} y1={600} x2={160} y2={980} stroke={LINE_DIM} strokeWidth={3} />
      <line x1={920} y1={600} x2={920} y2={980} stroke={LINE_DIM} strokeWidth={3} />
      <path d={`M494,620 Q560,600 ${590 + reach * 70},575`} stroke="#4a3c30" strokeWidth={16} strokeLinecap="round" fill="none" />
      {!fallen ? (
        <g transform={`translate(${700 + slip * 230},${600 + slip * slip * 330}) rotate(${slip * 120})`}>
          <path d="M-36,-110 L36,-110 L28,0 L-28,0 Z" fill="rgba(200,220,240,0.12)" stroke="rgba(230,240,255,0.8)" strokeWidth={2.5} />
          <path d="M-32,-60 L32,-60 L28,0 L-28,0 Z" fill="rgba(170,200,230,0.25)" />
        </g>
      ) : (
        Array.from({length: 16}, (_, i) => {
          const d = (f - brk) / 30;
          const dx = (rnd(i) - 0.5) * 360 * clamp01(d * 4);
          const dy = -Math.abs(rnd(i + 4) - 0.2) * 120 * Math.sin(Math.min(1, d * 3) * Math.PI);
          return <path key={i} d="M0,-14 L10,6 L-8,8 Z" transform={`translate(${930 + dx},${930 + dy}) rotate(${rnd(i + 9) * 360 + d * 200})`} fill="rgba(220,235,255,0.5)" stroke="rgba(240,248,255,0.9)" strokeWidth={1.5} />;
        })
      )}
      {fallen ? <ellipse cx={930} cy={940} rx={150 * clamp01((f - brk) / 10)} ry={18 * clamp01((f - brk) / 10)} fill="rgba(170,200,230,0.18)" /> : null}
    </svg>
  );
};

const Burst: React.FC<{f: number}> = ({f}) => {
  const a = S(E);
  if (f < a || f > S(BAR(24)) + 8) return null;
  const dim = 0.45 - 0.25 * ease((f - S(BAR(23))) / 12);
  const out = 1 - ease((f - S(BAR(24))) / 8);
  const pos = [[330, 440, -6], [740, 530, 5], [360, 630, 3], [720, 730, -4], [340, 830, 6], [730, 930, -3], [360, 1030, -2], [720, 1130, 5], [540, 1230, -5]];
  return (
    <>
      {TRUTHS.map((t, i) => {
        const d = f - a - i * 2;
        if (d < 0) return null;
        const v = ease(d / 5);
        const [x, y, r] = pos[i];
        const fly = 1 - Math.exp(-d / 6);
        const sx = KX + (x - KX) * fly;
        const sy = KY - 250 + (y - KY + 250) * fly;
        const pop = 1 + 0.5 * Math.exp(-d / 3);
        return (
          <div key={i} style={{position: 'absolute', left: sx, top: sy, transform: `translate(-50%,-50%) rotate(${r}deg) scale(${pop * (0.4 + 0.6 * v)})`, fontFamily: SUB, fontSize: 50 + (i % 3) * 6, color: RED_HOT, whiteSpace: 'nowrap', opacity: v * dim * out, textShadow: '0 0 30px rgba(255,60,40,0.8), 0 4px 10px #000'}}>
            {t}
          </div>
        );
      })}
    </>
  );
};

/** Thẻ treo vào quai ấm — tên khái niệm */
const Tag: React.FC<{f: number}> = ({f}) => {
  const a = S(BAR(24));
  const b = S(BAR(26));
  if (f < a - 2 || f > b + 8) return null;
  const v = io(f, a, b, 8);
  const sw = 6 * Math.exp(-(f - a) / 20) * Math.sin((f - a) / 5);
  return (
    <div style={{position: 'absolute', left: cx, top: 470, transform: `translateX(-50%) rotate(${sw}deg)`, transformOrigin: '50% -400px', opacity: v}}>
      <svg width={4} height={420} style={{position: 'absolute', left: '50%', top: 360, marginLeft: -2}}><line x1={2} y1={0} x2={2} y2={420} stroke={LINE_DIM} strokeWidth={2} strokeDasharray="5 6" /></svg>
      <div style={{width: 760, padding: '46px 40px 40px', background: 'linear-gradient(180deg,#efe2c4,#dbc79f)', clipPath: 'polygon(9% 0, 91% 0, 100% 14%, 100% 100%, 0 100%, 0 14%)', textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
        <div style={{width: 34, height: 34, borderRadius: 17, margin: '0 auto 18px', background: '#1a130e'}} />
        <div style={{fontFamily: SUB, fontSize: 24, letterSpacing: 8, color: '#8a3a22'}}>HIỆN TƯỢNG</div>
        <div style={{fontFamily: DISP, fontWeight: 900, fontSize: 92, color: '#2a1a10', lineHeight: 1.05, marginTop: 10}}>Kìm nén<br />cảm xúc</div>
        <div style={{fontFamily: DISP, fontStyle: 'italic', fontSize: 40, color: '#8a3a22', marginTop: 12}}>Expressive Suppression</div>
        <div style={{fontFamily: SUB, fontSize: 28, color: '#4a3424', marginTop: 18}}>Trong lòng một đằng, bên ngoài tỏ ra một nẻo.</div>
      </div>
    </div>
  );
};

const Foot: React.FC<{f: number; a: number; b: number; text: string}> = ({f, a, b, text}) => {
  const v = io(f, S(a), S(b), 10);
  if (v <= 0) return null;
  return <div style={{position: 'absolute', left: 60, right: 60, top: 1560, textAlign: 'center', fontFamily: SUB, fontSize: 26, color: 'rgba(246,243,234,0.5)', opacity: v}}>{text}</div>;
};

/** Gấu trắng bật ra khỏi nắp */
const Bear: React.FC<{f: number; at: number; s: number}> = ({f, at, s}) => {
  const d = f - S(at);
  if (d < 0) return null;
  const up = d < 30 ? Math.min(1, d / 5) * (1 + 0.25 * Math.exp(-d / 4) * Math.cos(d)) : 1;
  return (
    <g transform={`translate(0,${-170 - up * 150 * s}) scale(${s * up})`}>
      <circle cx={-46} cy={-62} r={24} fill="#f4efe6" stroke="#cfc6b6" strokeWidth={2} />
      <circle cx={46} cy={-62} r={24} fill="#f4efe6" stroke="#cfc6b6" strokeWidth={2} />
      <circle cx={0} cy={0} r={74} fill="#f4efe6" stroke="#cfc6b6" strokeWidth={2} />
      <ellipse cx={0} cy={24} rx={30} ry={22} fill="#e2d9c8" />
      <ellipse cx={0} cy={14} rx={10} ry={7} fill="#2a1a10" />
      <circle cx={-26} cy={-14} r={7} fill="#2a1a10" />
      <circle cx={26} cy={-14} r={7} fill="#2a1a10" />
    </g>
  );
};

const Thought: React.FC<{f: number; at: number; s: number}> = ({f, at, s}) => {
  const d = f - S(at);
  if (d < 0 || d > S(BP * 2) + 16) return null;
  const v = ease(d / 5);
  const sc = s * (0.4 + 0.6 * v + 0.2 * Math.exp(-d / 3));
  return (
    <g transform={`scale(${sc})`} opacity={v}>
      <rect x={-170} y={-46} width={340} height={84} rx={42} fill="rgba(120,26,18,0.8)" stroke={RED_HOT} strokeWidth={2.5} />
      <text x={0} y={12} textAnchor="middle" fontFamily={SUB} fontSize={40} fill="#fff">Mình mệt lắm</text>
    </g>
  );
};

const Concept63: React.FC<{f: number}> = ({f}) => {
  const fa = S(BAR(24));
  const fb = S(BAR(26));
  if (f < fa - 2 || f > fb + 12) return null;
  const r = (d: number) => io(f, fa + d, fb, 10);
  const pop = 1 + 0.06 * Math.exp(-(f - fa) / 5);
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 700, textAlign: 'center'}}>
      <div style={{display: 'inline-block', fontFamily: SUB, fontSize: 26, color: RED_HOT, border: `1.5px solid ${RED}`, borderRadius: 999, padding: '4px 20px', opacity: r(0)}}>HIỆN TƯỢNG TÂM LÝ</div>
      <div style={{marginTop: 26, fontFamily: DISP, fontWeight: 900, fontSize: 120, lineHeight: 1.1, color: TXT, textShadow: '0 0 34px rgba(255,240,215,0.25)', opacity: r(2), filter: blurV(r(2)), transform: `scale(${pop.toFixed(3)})`}}>Kìm nén<br />cảm xúc</div>
      <div style={{marginTop: 18, fontFamily: DISP, fontStyle: 'italic', fontSize: 40, color: 'rgba(246,243,234,0.6)', opacity: r(10)}}>Expressive Suppression</div>
      <div style={{margin: '22px auto 0', width: 320 * ease((f - fa - 12) / 16), height: 3, background: `linear-gradient(90deg, rgba(216,57,43,0), ${RED}, rgba(216,57,43,0))`}} />
      <div style={{marginTop: 34, padding: '0 110px', fontFamily: SUB, fontSize: 42, lineHeight: 1.45, color: TXT, opacity: r(22)}}>Trong lòng một đằng, bên ngoài tỏ ra một nẻo.</div>
    </div>
  );
};

/** Gross & Levenson 1997: 3 chỉ số, mũi tên lên/xuống */
const StudyRows: React.FC<{f: number; a: number; b: number}> = ({f, a, b}) => {
  const fa = S(a);
  const fb = S(b);
  if (f < fa - 2 || f > fb + 10) return null;
  const v = io(f, fa, fb, 9);
  const rows: {l: string; r: string; dir: 1 | -1 | 0; at: number}[] = [
    {l: 'Nét mặt bên ngoài', r: 'giảm', dir: -1, at: a + 0.5},
    {l: 'Nỗi buồn bên trong', r: 'không giảm', dir: 0, at: a + 1.5},
    {l: 'Hệ tim mạch', r: 'căng hơn', dir: 1, at: BAR(28) + 0.2},
  ];
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 640, opacity: v, filter: blurV(v)}}>
      <div style={{textAlign: 'center', fontFamily: SUB, fontSize: 32, color: 'rgba(246,243,234,0.65)', marginBottom: 30}}>Khi cố giấu cảm xúc lúc xem phim buồn</div>
      {rows.map((x, i) => {
        const iv = ease((f - S(x.at)) / 7);
        const pop = 1 + 0.08 * Math.exp(-(f - S(x.at)) / 4) * (iv > 0 ? 1 : 0);
        const c = x.dir === 1 ? RED_HOT : x.dir === -1 ? '#9fb7d8' : GOLD;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '30px 36px', marginBottom: 22, borderRadius: 24, border: `2px solid ${x.dir === 1 ? RED : 'rgba(240,212,165,0.3)'}`, background: x.dir === 1 ? 'rgba(80,16,10,0.6)' : 'rgba(26,20,15,0.8)', opacity: iv, transform: `scale(${pop.toFixed(3)})`, boxShadow: x.dir === 1 ? '0 0 34px rgba(255,60,40,0.3)' : undefined}}>
            <span style={{fontFamily: SUB, fontSize: 40, color: TXT}}>{x.l}</span>
            <span style={{fontFamily: SUB, fontSize: 40, color: c}}>{x.dir === 1 ? '▲ ' : x.dir === -1 ? '▼ ' : '= '}{x.r}</span>
          </div>
        );
      })}
    </div>
  );
};

type BarD = {label: string; value: number; txt: string; hot?: boolean; calm?: boolean};
const Chart: React.FC<{f: number; a: number; b: number; grow: number; title: string; sub: string; bars: BarD[]}> = ({f, a, b, grow, title, sub, bars}) => {
  const fa = S(a);
  const fb = S(b);
  if (f < fa - 2 || f > fb + 10) return null;
  const v = io(f, fa, fb, 9);
  const max = Math.max(...bars.map((x) => x.value));
  return (
    <div style={{position: 'absolute', left: cx - 360, top: 640, width: 720, height: 760, opacity: v, filter: blurV(v)}}>
      <div style={{textAlign: 'center', fontFamily: SUB, fontSize: 34, color: TXT}}>{title}</div>
      <div style={{textAlign: 'center', fontFamily: SUB, fontSize: 26, color: 'rgba(246,243,234,0.55)', marginTop: 6}}>{sub}</div>
      <div style={{position: 'absolute', left: 40, right: 40, bottom: 120, height: 2, background: LINE}} />
      {bars.map((x, i) => {
        const g = ease((f - S(i === 0 ? a + 0.4 : grow)) / 14);
        const h = (x.value / max) * 420 * g;
        const bg = x.hot ? 'linear-gradient(180deg,#ff5a46,#a81f15)' : x.calm ? 'linear-gradient(180deg,#8fc7a0,#3d6b4c)' : 'linear-gradient(180deg,#6a5643,#3a2f26)';
        return (
          <div key={i} style={{position: 'absolute', left: 90 + i * 300, bottom: 120, width: 240, textAlign: 'center'}}>
            <div style={{fontFamily: SUB, fontSize: 46, color: x.hot ? RED_HOT : x.calm ? '#9fe0b4' : TXT, marginBottom: 12, opacity: g}}>{x.txt}</div>
            <div style={{margin: '0 auto', width: 160, height: h, borderRadius: '14px 14px 0 0', background: bg, border: `1.5px solid ${x.hot ? RED_HOT : LINE}`, boxShadow: x.hot ? '0 0 34px rgba(255,60,40,0.5)' : undefined}} />
            <div style={{position: 'absolute', top: '100%', left: -20, right: -20, marginTop: 22, fontFamily: SUB, fontSize: 32, lineHeight: 1.3, color: x.hot ? RED_HOT : TXT}}>{x.label}</div>
          </div>
        );
      })}
    </div>
  );
};

/** Lò xo: 9 tấm "ổn" nén xuống, rồi bật tung (Wegner 1987) */
const SP_A = BAR(30);
const SP_SNAP = BAR(31.5);
const SP_B = BAR(33);
const SP_PLATE = (i: number) => SP_A + 0.15 + i * BP * 0.6;
const Spring: React.FC<{f: number}> = ({f}) => {
  const fa = S(SP_A);
  const fb = S(SP_B);
  if (f < fa - 2 || f > fb + 10) return null;
  const v = io(f, fa, fb, 8);
  const snap = S(SP_SNAP);
  const ds = f - snap;
  const base = 1300;
  let comp = 0;
  for (let i = 0; i < 9; i++) comp += ease((f - S(SP_PLATE(i))) / 4);
  const restH = 460;
  let h = restH - comp * 36;
  let tremble = 0;
  if (ds < 0) tremble = (comp / 9) * 4 * Math.sin(f * 3.7);
  if (ds >= 0) {
    const sprung = restH * 1.25;
    h = sprung + (h - sprung) * Math.exp(-ds / 3) * Math.cos(ds * 0.9);
  }
  const top = base - h;
  const turns = 9;
  const pts: string[] = [];
  for (let k = 0; k <= turns * 2; k++) {
    const y = base - (h * k) / (turns * 2);
    const x = cx + (k === 0 || k === turns * 2 ? 0 : k % 2 ? -150 : 150) + tremble;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const heat = ds < 0 ? comp / 9 : Math.max(0, 1 - ds / 20);
  const col = `rgb(${Math.round(240 - 0 * heat)},${Math.round(212 - 150 * heat)},${Math.round(165 - 125 * heat)})`;
  const dataV = ease((f - snap - 10) / 10);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: v}}>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <rect x={cx - 230} y={base} width={460} height={22} rx={8} fill="#2a2119" stroke={LINE} strokeWidth={2} />
        <polyline points={pts.join(' ')} fill="none" stroke={col} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" style={{filter: `drop-shadow(0 0 ${8 + 22 * heat}px rgba(255,70,40,${0.25 + 0.6 * heat}))`}} />
        <rect x={cx - 200} y={top - 18} width={400} height={18} rx={6} fill="#3a2f26" stroke={LINE} strokeWidth={2} />
      </svg>
      {Array.from({length: 9}, (_, i) => {
        const d = f - S(SP_PLATE(i));
        if (d < -4) return null;
        const drop = clamp01((d + 4) / 4);
        const stackY = top - 18 - (i + 1) * 46;
        let y = stackY - (1 - drop) * 220;
        let x = cx;
        let rot = (i % 2 ? 1 : -1) * 2;
        let o = drop;
        if (ds >= 0) {
          const ang = (i - 4) * 0.32;
          const sp = 26 + (i % 3) * 7;
          x += Math.sin(ang) * sp * ds;
          y = stackY - Math.cos(ang) * sp * ds + 0.9 * ds * ds;
          rot += (i - 4) * 9 * ds * 0.3;
          o = 1 - ease(ds / 22);
        }
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, width: 300, height: 40, marginLeft: -150, borderRadius: 10, background: 'rgba(26,20,15,0.92)', border: `2px solid ${ds >= 0 ? RED_HOT : 'rgba(240,212,165,0.55)'}`, transform: `rotate(${rot.toFixed(1)}deg)`, opacity: o, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SUB, fontSize: 28, color: TXT}}>“ổn” {i + 1}</div>
        );
      })}
      {ds >= 0 && ds < 10 ? <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, background: `rgba(255,60,30,${0.3 * Math.exp(-ds / 3)})`, mixBlendMode: 'screen'}} /> : null}
      <div style={{position: 'absolute', left: 0, width: W, top: 1400, textAlign: 'center', opacity: dataV, fontFamily: SUB}}>
        <div style={{fontSize: 30, color: 'rgba(246,243,234,0.6)'}}>Ý nghĩ từng bị cố gạt đi, quay lại trong 5 phút</div>
        <div style={{fontSize: 64, color: TXT, marginTop: 8}}>15 <span style={{color: 'rgba(246,243,234,0.5)'}}>→</span> <span style={{color: RED_HOT, textShadow: '0 0 30px rgba(255,60,40,0.7)'}}>34 lần</span></div>
      </div>
    </div>
  );
};

/* ============================== SFX ============================== */
type Fx = [number, string, number];
const FX: Fx[] = [];
SCENES.forEach((s) => {
  FX.push([BAR(s.a) - 0.18, 'whoosh', 0.32]);
  s.msgs.forEach((m) => FX.push([m.at, m.side === 'sys' ? 'tick' : 'ping', 0.4]));
  if (s.truthAt !== undefined && s.stamp !== undefined && s.truth) {
    const n = Math.ceil(s.truth.length / 4);
    for (let i = 0; i < n; i++) FX.push([s.truthAt + i * 0.26, 'type', 0.32]);
    for (let i = 0; i < 6; i++) FX.push([s.stamp - 1.0 + i * 0.09, 'bksp', 0.35]);
    FX.push([s.stamp - 0.4, 'type', 0.3], [s.stamp - 0.04, 'pop', 0.45]);
    FX.push([s.stamp - 0.18, 'dropin', 0.45], [s.stamp, 'stamp', 1], [s.stamp + 0.02, 'thud', 0.45], [s.stamp + 0.1, 'hiss', 0.18 + 0.05 * SCENES.indexOf(s)]);
  }
});
FX.push([BAR(1) + 0.25, 'ping', 0.45], [BAR(11) + 0.8, 'click', 0.8]);
FLASH.forEach((x) => FX.push([x.t - 0.3, 'bksp', 0.35], [x.t - 0.2, 'bksp', 0.35], [x.t, 'stamp', 1], [x.t + 0.02, 'thud', 0.5], [x.t + 0.05, 'hiss', 0.4]));
FX.push([BAR(18) - 0.18, 'whoosh', 0.35], [BAR(19), 'impact', 0.55], [MID(19), 'stamp', 1], [MID(19), 'impact', 0.6]);
FX.push([BAR(20), 'hum', 0.45], [BAR(21) - 0.45, 'curl', 0.3], [BAR(21), 'glass', 1], [BAR(21) + 0.6, 'hiss', 0.35], [E - 0.9, 'hiss', 0.6]);
FX.push([E, 'impact', 1], [E, 'stamp', 0.9], [E + BP, 'stamp', 0.75], [E + BP, 'thud', 0.5], [E + 2 * BP, 'impact', 1], [E + 2 * BP, 'stamp', 1]);
for (let i = 0; i < 9; i++) FX.push([SP_A + 0.15 + i * BP * 0.6, 'thud', 0.28 + i * 0.03]);
FX.push([BAR(24) - 0.2, 'whoosh', 0.3], [BAR(24) + 0.1, 'paper', 0.6], [BAR(24) + 0.15, 'impact', 0.4]);
FX.push([BAR(26) - 0.2, 'whoosh', 0.3], [MID(27), 'heart', 0.55], [MID(29), 'heart', 0.55], [MID(29), 'hiss', 0.3]);
FX.push([BAR(26) + 0.5, 'thud', 0.45], [BAR(26) + 1.5, 'thud', 0.45], [BAR(28) + 0.2, 'impact', 0.55], [BAR(30) - 0.2, 'whoosh', 0.3], [BAR(30) + 0.4, 'thud', 0.4], [BAR(31.5) - 0.25, 'whoosh', 0.35], [BAR(31.5), 'impact', 0.9], [BAR(31.5), 'boing', 0.55], [BAR(33) - 0.2, 'whoosh', 0.3], [BAR(33) + 0.4, 'thud', 0.4], [BAR(34.5), 'shimmer', 0.5]);
FX.push([BAR(36) - 0.1, 'suck', 0.55], [BAR(36) + 0.2, 'whoosh', 0.35], [BAR(37) + 0.1, 'ping', 0.4]);
for (let i = 0; i < 6; i++) FX.push([BAR(37) + 0.6 + i * 0.26, 'type', 0.3]);
FX.push([REWIND_SEND, 'pop', 0.55], [REWIND_SEND + 0.05, 'heal', 0.45], [BAR(39) + 0.25, 'ding', 0.45]);
FX.push([BAR(40) - 0.2, 'whoosh', 0.3], [BAR(40), 'sunrise', 0.55], [BAR(42.5), 'shimmer', 0.35]);
const GLOBAL = new Set(['paper', 'type', 'boing', 'error', 'snip', 'magic', 'confetti', 'shake', 'question']);
const LOCAL = new Set(['bksp', 'glass', 'hiss', 'hum', 'whistle']);
const fxSrc = (n: string) => (LOCAL.has(n) ? `audio/ep63-on/sfx/${n}.wav` : GLOBAL.has(n) ? `audio/sfx/${n}.wav` : `audio/ep60-troi-sap/sfx/${n}.wav`);


/* ============================== MAIN ============================== */
const TINT: [number, number, string, number][] = [
  [0, BAR(5), '200,215,240', 0.12],
  [BAR(5), BAR(8), '220,230,245', 0.1],
  [BAR(8), BAR(11), '255,232,180', 0.2],
  [BAR(11), BAR(13), '255,130,60', 0.24],
  [BAR(13), BAR(15), '255,200,130', 0.12],
  [BAR(40), END + 1, '255,200,130', 0.26],
];
const PLACES: [number, number, Place][] = [
  [0, BAR(5), 'home'],
  [BAR(5), BAR(8), 'office'],
  [BAR(8), BAR(11), 'cafe'],
  [BAR(11), BAR(13), 'dusk'],
  [BAR(13), BAR(15), 'dinner'],
  [BAR(15), BAR(20), 'bed'],
  [BAR(20), E, 'kitchen'],
  [BAR(36), BAR(40), 'bed'],
  [BAR(40), END + 2, 'morning'],
];

export const Ep63On: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;

  const hits: [number, number][] = [...STAMPS.map((x, i) => [x, 9 + i * 1.4] as [number, number]), [MID(19), 14], [BAR(21), 12], [E, 32], [E + BP, 14], [E + 2 * BP, 30], [BAR(31.5), 22], [BAR(28) + 0.2, 6], [BAR(24) + 0.1, 6]];
  let shake = 0;
  let punch = 0;
  for (const [h, amp] of hits) {
    const d = f - S(h);
    if (d >= 0 && d < 16) {
      shake += Math.exp(-d / 3.5) * amp;
      punch += Math.exp(-d / 3) * amp * 0.0028;
    }
  }
  if (f >= S(BAR(21)) && f < S(E)) shake += 1 + 3 * clamp01((f - S(BAR(21))) / (S(E) - S(BAR(21))));
  const sx = shake * Math.sin(f * 2.3);
  const sy = shake * Math.cos(f * 3.1) * 0.7;

  const n = STAMPS.filter((x) => f >= S(x)).length;
  const lastHit = Math.max(-999, ...STAMPS.filter((x) => f >= S(x)).map((x) => S(x)), f >= S(BAR(21)) ? S(BAR(21)) : -999);
  // năng lượng: 100% → mỗi "ổn" tụt ~11% → ly vỡ về 0 → nói thật hồi 35% → sáng hôm sau 60%
  let energy = 1 - n * 0.105;
  for (const x of STAMPS) {
    const d = f - S(x);
    if (d >= 0 && d < 8) energy += 0.105 * (1 - ease(d / 8));
  }
  if (f >= S(BAR(21))) energy = Math.max(0, energy * (1 - ease((f - S(BAR(21))) / 8)));
  if (f >= S(BAR(36))) energy = 0.35 * ease((f - S(REWIND_SEND)) / 24) + 0.25 * ease((f - S(BAR(40))) / 60);
  const barO = Math.max(io(f, S(BAR(1)) - 30, S(E) + 20, 8), io(f, S(BAR(36)), S(END + 2), 10), f < S(BAR(1)) ? 1 : 0);
  const hunchDay = Math.min(1, n / 9);

  const nodes: React.ReactNode[] = [];
  for (const [a, b, c, k] of TINT) {
    const v = io(f, S(a), S(b), 12);
    if (v > 0) nodes.push(<AbsoluteFill key={`tint${a}`} style={{background: `radial-gradient(ellipse 80% 45% at 50% 60%, rgba(${c},${k * v}) 0%, rgba(${c},0) 100%)`, mixBlendMode: 'screen'}} />);
  }

  // bối cảnh
  PLACES.forEach(([a, b, kind], i) => {
    const fa = S(a);
    const fb = S(b);
    if (f < fa - 1 || f > fb + 8) return;
    const vin = a === 0 ? 1 : ease((f - fa) / 7);
    const vout = ease((f - fb) / 7);
    const o = Math.min(vin, 1 - vout);
    const zoom = 1.06 - 0.06 * vin + 0.03 * clamp01((f - fa) / Math.max(1, fb - fa));
    const dim = kind === 'bed' && f >= S(BAR(18)) && f < S(BAR(20)) ? 0.55 : 1;
    nodes.push(
      <svg key={`pl${i}`} width={W} height={820} viewBox={`0 0 ${W} 820`} style={{position: 'absolute', left: 0, top: ST, opacity: o * dim, transform: `scale(${zoom}) translateX(${(1 - vin) * 120 - vout * 140}px)`, filter: blurV(o)}}>
        <Place f={f} kind={kind} hunch={hunchDay} t={(f - fa) / 30} />
      </svg>,
    );
  });

  // đồng hồ
  nodes.push(<ClockTag key="c0" f={f} text="6:45" part="SÁNG" a={0} b={BAR(1)} first />);
  SCENES.forEach((s) => nodes.push(<ClockTag key={`c${s.id}`} f={f} text={s.clock} part={s.part} a={BAR(s.a)} b={BAR(s.b)} />));
  FLASH.forEach((x, i) => nodes.push(<ClockTag key={`cf${i}`} f={f} text={x.clock} part="ĐÊM" a={i === 0 ? BAR(18) : x.t - 0.25} b={i === 2 ? BAR(19) : FLASH[i + 1].t - 0.25} />));
  nodes.push(<ClockTag key="c40" f={f} text="23:40" part="ĐÊM" a={BAR(19)} b={BAR(20)} />);
  nodes.push(<ClockTag key="c47" f={f} text="23:47" part="ĐÊM" a={BAR(20)} b={E} />);
  {
    const a = S(BAR(36));
    if (f >= a - 2 && f <= S(BAR(40)) + 8) {
      const k = ease((f - a) / 40);
      const mins = Math.round(23 * 60 + 47 - k * 77);
      nodes.push(<ClockTag key="crw" f={f} text={`${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`} part={k < 1 ? 'TUA LẠI' : 'ĐÊM'} a={BAR(36)} b={BAR(40)} />);
    }
  }
  nodes.push(<ClockTag key="cend" f={f} text="6:50" part="HÔM SAU" a={BAR(40)} b={END + 2} />);

  // tin nhắn trong cảnh (vùng trên, 450 → 870)
  const Chat: React.FC<{a: number; b: number; children: React.ReactNode; composer?: React.ReactNode}> = ({a, b, children, composer}) => {
    const v = io(f, S(a), S(b), 7);
    if (v <= 0) return null;
    return (
      <div style={{position: 'absolute', left: 90, right: 90, top: 430, height: 450, opacity: v, transform: `translateY(${(1 - v) * 30}px)`}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: composer ? 104 : 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>{children}</div>
        {composer}
      </div>
    );
  };
  SCENES.forEach((s) => {
    const cs = composerState(t, s);
    const sent = s.stamp !== undefined && f >= S(s.stamp);
    nodes.push(
      <Chat key={`ch${s.id}`} a={BAR(s.a)} b={BAR(s.b)} composer={<Composer f={f} text={cs.text} red={cs.red} del={'del' in cs ? cs.del : false} />}>
        <Art f={f} s={s} />
        {s.msgs.filter((m) => !(s.id === 's6' && m.at > (s.stamp ?? 0))).map((m, i) => <Bub key={i} f={f} at={m.at} text={m.text} side={m.side} red={m.red} />)}
        {sent ? <Bub f={f} at={s.stamp as number} text={s.said ?? 'Ổn.'} side="out" /> : null}
        {s.msgs.filter((m) => s.id === 's6' && m.at > (s.stamp ?? 0)).map((m, i) => <Bub key={`r${i}`} f={f} at={m.at} text={m.text} side={m.side} />)}
      </Chat>,
    );
  });
  {
    const cur = FLASH.findIndex((x, i) => t < (i === 2 ? x.t + 2 : FLASH[i + 1].t - 0.3));
    const x = FLASH[Math.max(0, cur)];
    const showTruth = t < x.t && t >= x.t - 0.38;
    const txt = showTruth ? (t < x.t - 0.16 ? x.truth : x.truth.slice(0, Math.round((x.truth.length * (x.t - t)) / 0.16))) : '';
    nodes.push(
      <Chat key="flash" a={BAR(18)} b={BAR(19)} composer={<Composer f={f} text={txt} red={showTruth} big />}>
        {FLASH.map((y, i) => (f >= S(y.t) ? <Bub key={i} f={f} at={y.t} text="Ổn." side="out" big /> : null))}
      </Chat>,
    );
  }
  nodes.push(<BigCount key="bc" f={f} />);
  nodes.push(<Kitchen key="kit" f={f} />);
  nodes.push(<Doom key="doom" f={f} />);
  if (f >= S(E) && f < S(E) + 12) nodes.push(<AbsoluteFill key="flashred" style={{background: `rgba(255,50,30,${0.4 * Math.exp(-(f - S(E)) / 4)})`, mixBlendMode: 'screen'}} />);

  // hồi 3: thẻ nghiên cứu + biểu đồ
  nodes.push(<StudyRows key="gross" f={f} a={BAR(26)} b={BAR(30)} />);
  nodes.push(<Spring key="spring" f={f} />);
  nodes.push(<Chart key="lieb" f={f} a={BAR(33)} b={BAR(36)} grow={BAR(34.5)} title="Phản ứng của hạch hạnh nhân" sub="(“chuông báo động” của não) khi xem ảnh tiêu cực" bars={[{label: 'Chỉ nhìn', value: 1, txt: 'cao', hot: true}, {label: 'Gọi tên cảm xúc', value: 0.62, txt: 'giảm rõ', calm: true}]} />);
  nodes.push(<Concept63 key="tag" f={f} />);
  nodes.push(<Foot key="ft1" f={f} a={BAR(26) + 0.5} b={BAR(30)} text="Gross & Levenson, 1997 · 180 người xem phim buồn/vui · J. Abnormal Psychology" />);
  nodes.push(<Foot key="ft2" f={f} a={BAR(30) + 0.5} b={BAR(33)} text="Wegner và cộng sự, 1987 · Thí nghiệm 2 · J. Personality & Social Psychology" />);
  nodes.push(<Foot key="ft3" f={f} a={BAR(33) + 0.5} b={BAR(36)} text="Lieberman và cộng sự, 2007 · chụp fMRI · Psychological Science" />);

  // tua lại 22:30 — nói thật
  {
    const said = 'Hôm nay mình hơi mệt.';
    const typeA = BAR(37) + 0.6;
    const typed = t < typeA ? '' : t < REWIND_SEND - 0.1 ? said.slice(0, Math.min(said.length, Math.floor((t - typeA) * 16))) : '';
    nodes.push(
      <Chat key="rw" a={BAR(36) + 1.0} b={BAR(40)} composer={<Composer f={f} text={typed} red={false} />}>
        <Bub f={f} at={BAR(37) + 0.1} text="Dạo này lạ lắm. Mình nói chuyện được không?" side="in" />
        {f >= S(REWIND_SEND) ? <Bub f={f} at={REWIND_SEND} text={said} side="out" /> : null}
        <Bub f={f} at={BAR(39) + 0.25} text="Ừ. Kể mình nghe đi." side="in" />
      </Chat>,
    );
  }

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <FilBg f={f} w={W} h={H} tone="warm" glow={[50, 62]} strength={f >= S(E) && f < S(BAR(24)) ? 1.3 : 0.95} />
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="e63body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a4938" />
            <stop offset="0.5" stopColor="#30271f" />
            <stop offset="1" stopColor="#120e0b" />
          </linearGradient>
          <radialGradient id="e63phone" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="rgba(160,195,255,0.45)" />
            <stop offset="1" stopColor="rgba(160,195,255,0)" />
          </radialGradient>
        </defs>
      </svg>
      <AbsoluteFill style={{transform: `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) scale(${1 + punch})`}}>
        {nodes}
        <EnergyBar f={f} v={Math.max(0, energy)} n={f < S(E) ? n : 0} o={barO} lastHit={lastHit} />
        {CAPS.map(([a, b, tx], i) => <Caption key={i} f={f} a={a} b={b} text={tx} />)}
      </AbsoluteFill>
      <FilGrain opacity={0.07} />
      {!NO_BGM && (<>
      <Sequence from={0} durationInFrames={S(BAR(20)) + 2}>
        <Audio src={staticFile('audio/ep60-troi-sap/bgm.wav')} volume={(fr) => 0.9 * (1 - clamp01((fr - (S(BAR(20)) - 5)) / 5))} />
      </Sequence>
      <Sequence from={S(E)} durationInFrames={S(BAR(24) - E) + 12}>
        <Audio src={staticFile('audio/ep60-troi-sap/bgm.wav')} startFrom={S(93.36)} volume={(fr) => Math.round(20 * (1 - clamp01((fr - (S(BAR(24) - E) - 2)) / 14))) / 20} />
      </Sequence>
      <Sequence from={S(BAR(24)) - 2} durationInFrames={S(END - BAR(24)) + 4}>
        <Audio
          src={staticFile('audio/ep60-troi-sap/bgm.wav')}
          startFrom={S(BAR(20))}
          volume={(fr) => {
            const g = fr < 12 ? fr / 12 : 1;
            const lift = interpolate(fr, [S(BAR(40) - BAR(24)), S(BAR(41) - BAR(24))], [0.85, 1.2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const tail = 1 - clamp01((fr - (S(END - BAR(24)) - 90)) / 90);
            return Math.round(g * lift * tail * 20) / 20;
          }}
        />
      </Sequence>
      </>)}
      {FX.map(([tm, nm, g], i) => (
        <Sequence key={i} from={Math.max(0, S(tm))} durationInFrames={S(nm === 'hum' ? 4.6 : nm === 'whistle' ? 3.3 : 2.5)}>
          <Audio src={staticFile(fxSrc(nm))} volume={g * 0.85} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
