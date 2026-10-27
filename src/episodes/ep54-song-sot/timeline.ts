/**
 * ep54 Thiên kiến kẻ sống sót（越南语，暗金文献风，横屏 1920×1080，约 84 秒，无口播）。
 * 文案自写：开场用「nhà xưa bền hơn / nhạc xưa hay hơn」，中段 1943 年 Wald 的备忘录，现代段换成投资群截图和「bỏ học vẫn thành tỷ phú」。
 * 锚词「im lặng」：开场第 5 句埋下 → 第 23 小节砸出 → 结尾「phần im lặng」重新定义，最后抛问题。
 */
import VO_DATA from './vo.json';

export const FPS = 30;
export const W = 1920;
export const H = 1080;

/** 配乐 audio/episodes/ep54-song-sot.mjs：90 BPM，一小节 ≈2.667 秒，起音 0.30 秒 */
export const BPM = 90;
export const BAR = (60 / BPM) * 4;
export const BAR0 = 0.3;
export const barSec = (k: number) => BAR0 + BAR * k;
export const fr = (sec: number) => Math.round(sec * FPS);
export const B = (k: number) => fr(barSec(k));

/** 实测 bgm.wav：18.97 秒前 0.6 秒 −34 dB → 小节线 −5 dB；61.63 秒前 −36 dB → −6.5 dB */
export const HIT = B(7);
export const HIT2 = B(23);
export const DARK_FROM = HIT - 21;
export const DARK2_FROM = HIT2 - 21;
export const FREEZE = 3;
export const DURATION = fr(barSec(31) + 1);

export const ANCHOR = 'im lặng';

/** 字幕：[小节, 字幕]；【】里的词变金；≤ 60 字符（横屏一行） */
export const CUES: [number, string][] = [
  [0, 'Người ta hay nói: nhà ngày xưa xây 【bền hơn】 bây giờ.'],
  [1.5, 'Nhạc ngày xưa cũng 【hay hơn】.'],
  [3, 'Nghe rất đúng. Nhưng thiếu một thứ.'],
  [4, 'Những căn nhà đã sập, những bài hát đã bị quên —'],
  [5, 'chúng 【im lặng】, không còn ở đây để lên tiếng.'],
  [6, 'Ta chỉ nghe được những gì còn sống sót —'],
  [8, 'Thế chiến II. Máy bay ném bom trở về, đầy lỗ đạn.'],
  [9.5, 'Lỗ đạn dày nhất ở 【cánh】 và 【thân】.'],
  [10.5, 'Ý kiến đầu tiên: bọc thép thêm vào những chỗ đó.'],
  [12, 'Nhà thống kê Abraham Wald nghĩ ngược lại.'],
  [13, 'Đạn bắn khắp nơi. Chỗ 【không có lỗ】 trên máy bay trở về'],
  [14.5, 'là chỗ trúng đạn thì máy bay 【không về được】.'],
  [16, 'Cần bọc thép ở 【động cơ】.'],
  [17, 'Hôm nay, ta vẫn chỉ nhìn những chiếc máy bay trở về.'],
  [18, 'Nhóm đầu tư toàn ảnh chụp 【lãi】.'],
  [19, 'Người cháy tài khoản thì lặng lẽ rời nhóm.'],
  [20, '"Bỏ học vẫn thành tỷ phú": bạn nghe 【một người】,'],
  [21, 'không nghe hàng triệu người bỏ học khác.'],
  [22, 'Họ không sai. Họ chỉ —'],
  [24, 'Nên trước khi tin một câu chuyện thành công,'],
  [25, 'hãy nhìn vào 【phần im lặng】.'],
  [26.5, 'Sự thật thường nằm ở chỗ 【không có lỗ đạn】.'],
  [28, 'Lời khuyên nào bạn từng tin, chỉ vì người nói đã thành công?'],
];
/** 配音（Edge TTS vi-VN-NamMinhNeural +6%）：每句的起止秒数 + 每个字出现的时间（相对句首，来自 WordBoundary） */
export const VO = VO_DATA as {start: number; end: number; times: number[]}[];
export const V = (i: number) => fr(VO[i].start);
export const cueStart = (i: number) => V(i);
/** 字幕停留到下一句开始，或念完后 1.2 秒 */
export const cueEnd = (i: number) => Math.min(i + 1 < CUES.length ? cueStart(i + 1) : DURATION, fr(VO[i].end + 1.2));

export const SHOTS = {
  hook: [0, HIT], // 3 栋老房子 + 3 张唱片 → 周围长出一大片倒掉的 / 被忘掉的虚影
  hit: [HIT, B(8)], // THIÊN KIẾN KẺ SỐNG SÓT
  wald: [B(8), B(17)], // 1943 年份抬头 + 文献引用；轰炸机金线图、弹孔、装甲、引擎变红、没回来的飞机往下坠
  invest: [B(17), B(20)], // 盈利截图卡片 → 群成员点阵一个个熄灭
  dropout: [B(20), HIT2], // 一个金点 vs 一大片暗点
  silence: [HIT2, B(24)], // IM LẶNG
  close: [B(24), DURATION], // 飞机回来：引擎金色发光 + 提问
} as const;

export const CITE = {
  original: 'A Method of Estimating Plane Vulnerability Based on Damage of Survivors',
  title: 'Phương pháp ước tính điểm yếu của máy bay',
  meta: 'Abraham Wald · Statistical Research Group, Columbia · 1943',
};

/* ---------- 动作事件（画面和音效共用） ---------- */
export const W0 = () => V(6);
export const EV = {
  houseRise: (k: number) => V(3) + k * 4,
  houseFall: (k: number) => V(3) + 24 + k * 5,
  flak: () => [10, 22, 31, 40, 52, 63, 75, 88, 100, 112].map((d) => V(6) + d),
  fallers: () => [
    {plane: 3, at: V(6) + 31},
    {plane: 9, at: V(6) + 63},
    {plane: 12, at: V(6) + 100},
  ],
  holes: 48,
  hole: (i: number) => V(7) + 4 + Math.round(i * 1.25),
  plate: (k: number) => V(8) + 14 + k * 11,
  overload: () => V(8) + 56,
  platesFall: () => V(9) + 26,
  grid: () => V(10),
  ghosts: () => V(10) + 48,
  ghostFall: (k: number) => V(11) + 6 + k * 6,
  plane2: () => V(12) - 10,
  engPlate: (k: number) => V(12) + 4 + k * 7,
  check: () => V(12) + 36,
  card: (k: number) => V(14) + k * 8,
  leave: () => V(15),
  count: () => V(17),
  closePlate: (k: number) => V(20) + k * 7,
};
export const SLAMS = (): number[] => [
  ...[0, 1, 2].map(EV.plate),
  EV.overload(),
  EV.platesFall() + 18,
  ...[0, 1, 2, 3].map(EV.engPlate),
  ...[0, 1, 2].map(EV.card),
  ...[0, 1, 2, 3].map(EV.closePlate),
  ...Array.from({length: 8}, (_, k) => EV.houseFall(k) + 12).filter((_, k) => k % 3 === 0),
];

const S = (n: string) => `audio/ep54-song-sot/sfx/${n}.wav`;
export const SFX: [string, number, number][] = [
  ...[0, 1, 2].map((i): [string, number, number] => [S('pop'), 4 + i * 8, 0.35]),
  ...[0, 1, 2].map((i): [string, number, number] => [S('pop'), V(1) + i * 8, 0.3]),
  ...Array.from({length: 8}, (_, k): [string, number, number] => [S('debris'), EV.houseFall(k) + 8, 0.32]),
  [S('riser'), HIT - 42, 0.45],
  ['audio/ep54-song-sot/impact.wav', HIT, 0.8],
  ...EV.flak().map((t, i): [string, number, number] => [S('flak'), t, 0.32 + (i % 3) * 0.06]),
  ...EV.fallers().map(({at}): [string, number, number] => [S('whistle'), at + 6, 0.35]),
  ...Array.from({length: EV.holes}, (_, i) => i)
    .filter((i) => i % 3 === 0)
    .map((i): [string, number, number] => [S('shot'), EV.hole(i), 0.3]),
  ...[0, 1, 2].map((k): [string, number, number] => [S('clank'), EV.plate(k), 0.5]),
  ['audio/sfx/stamp.wav', EV.overload(), 0.5],
  [S('whistle'), EV.platesFall(), 0.25],
  [S('thud'), EV.platesFall() + 18, 0.55],
  ...Array.from({length: 12}, (_, k): [string, number, number] => [S('tick'), EV.grid() + 8 + k * 2, 0.25]),
  [S('pop'), EV.ghosts(), 0.4],
  ...[0, 2, 4].map((k): [string, number, number] => [S('whistle'), EV.ghostFall(k), 0.3]),
  ...[0, 1, 2, 3].map((k): [string, number, number] => [S('clank'), EV.engPlate(k), 0.5]),
  ['audio/sfx/ding.wav', EV.check(), 0.25],
  ...[0, 1, 2].map((k): [string, number, number] => [S('thud'), EV.card(k), 0.4]),
  ...Array.from({length: 8}, (_, k): [string, number, number] => [S('tick'), EV.leave() + 20 + k * 5, 0.22]),
  ['audio/sfx/ding.wav', V(16), 0.2],
  ...Array.from({length: 14}, (_, k): [string, number, number] => [S('tick'), EV.count() + Math.round(40 * Math.sqrt(k / 14)), 0.22]),
  [S('riser'), HIT2 - 42, 0.45],
  ['audio/ep54-song-sot/impact.wav', HIT2, 0.75],
  ...[0, 1, 2, 3].map((k): [string, number, number] => [S('clank'), EV.closePlate(k), 0.45]),
  ['audio/sfx/magic.wav', V(21), 0.15],
];
