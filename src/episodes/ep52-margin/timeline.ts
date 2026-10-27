/**
 * ep52 人生的余地：约 66 秒、无口播，丝线星图风（src/library/filament/），竖屏 1080×1920。
 * 选题「人生容错率」，文案、比喻（导航改道、河流绕石）和数字全部自写；节奏骨架借参考片：长镜头 → 约 2 秒的连砸爆发 → 长镜头。
 * 锚词「khoảng lùi」（余地 / 退一步的空间）：开头埋下、第 8 小节重拍砸出、结尾重新定义（「Khoảng lùi không phải để lùi, mà để còn được chọn」）。
 * 越南语版：字幕、标签、大字全部越南语（字体 Noto Serif，见 library/filament/theme.ts 的 vietFont）。所有时间挂在配乐的小节线上，画面组件和测试共用这一份。
 */
export const FPS = 30;
export const W = 1080;
export const H = 1920;

/** 配乐 audio/episodes/ep52-margin.mjs 代码合成：112 BPM，起音 0.30 秒，一小节 60/112×4 ≈ 2.1429 秒 */
export const BPM = 112;
export const BAR = (60 / BPM) * 4;
export const BAR0 = 0.3;
export const barSec = (k: number) => BAR0 + BAR * k;
export const fr = (sec: number) => Math.round(sec * FPS);

/**
 * 实测（bgm.wav 每 0.1 秒 RMS）：第 8 小节线前 0.6 秒 −34 dB（换气）→ 小节线上 −7 dB；第 16 小节线前 −42 dB → −7 dB。
 * 两个重拍正好落在小节线上。
 */
export const HIT = fr(barSec(8));
export const HIT2 = fr(barSec(16));
/** 重拍前约 0.7 秒起收暗，最后 FREEZE 帧完全静止 */
export const DARK_FROM = HIT - 21;
export const DARK2_FROM = HIT2 - 21;
export const FREEZE = 3;
/** 爆发段：第 14 小节起，四个词每隔半拍砸一个（第一个在第 14 小节第 2 拍） */
export const BURST = fr(barSec(14));
export const BURST_GAP = Math.round(((60 / BPM) * FPS) / 2); // 半拍 ≈ 8 帧

export const DURATION = fr(barSec(30) + 1.5);

export const ANCHOR = 'khoảng lùi';
/** 锚词砸出时下方的小字 */
export const ANCHOR_SUB = 'dung sai của đời người';

/** 字幕（越南语，全片唯一语言）：[小节号, 字幕]。每句 ≤ 52 个字符，竖屏最多两行 */
export const CUES: [number, string][] = [
  [0, 'Bạn cứ nghĩ, đời chẳng chừa chút khoảng lùi nào.'],
  [2, 'Chỉ một lộ trình, sai một bước là hỏng.'],
  [4, 'Chọn sai ngành học,'],
  [5, 'lỡ mất một người,'],
  [6, 'công việc đầu tiên chỉ làm ba tháng.'],
  [7, 'Bạn tưởng mình chẳng còn chút —'],
  [9, 'Nhưng khi đi lệch, bản đồ chỉ làm một việc:'],
  [10, 'Tìm đường mới.'],
  [11, 'Một đời người khoảng 30.000 ngày.'],
  [12, 'Sai một ngày, chỉ chiếm 0,003%.'],
  [13, 'Sai trọn một năm, cũng chỉ 1,2%.'],
  [14, 'Kể cả sai liền mấy bước —'],
  [16, 'Sai năm năm, đời vẫn còn 94%.'],
  [18, 'Dòng sông gặp đá, không dừng lại.'],
  [20, 'Nó vòng qua, rồi rộng thêm ra.'],
  [22, 'Những đường vòng bạn từng đi,'],
  [23, 'về sau đều thành khoảng lùi của bạn.'],
  [25, 'Khoảng lùi không phải để lùi, mà để còn được chọn.'],
  [27, 'Đường vòng đáng giá nhất bạn từng đi là đoạn nào?'],
];
export const cueStart = (i: number) => fr(barSec(CUES[i][0]));
export const cueEnd = (i: number) => (i + 1 < CUES.length ? cueStart(i + 1) : DURATION);

/** 爆发段连砸的四个词（自写，和参考片不同） */
export const BURST_WORDS = ['TRƯỢT', 'CHIA TAY', 'ĐỔI NGHỀ', 'LÀM LẠI'];

/** 镜头段落（同一张画布上的连续长镜头），见 Ep52Margin.tsx */
export const SHOTS = {
  route: [0, HIT], // 起点亮点 → 一条路线往上长，三个节点依次断成红点；DARK_FROM 起收暗、最后 FREEZE 帧静止
  hit: [HIT, fr(barSec(9))], // 锚词砸出
  reroute: [fr(barSec(9)), fr(barSec(11))], // 断点处长出几条新路线，一条最亮
  days: [fr(barSec(11)), BURST], // 刻度环：30000 天，1 天、1 年在环上占多少
  burst: [BURST, HIT2], // 背景织网 + 四个红字连砸；收暗、静止
  remain: [HIT2, fr(barSec(18))], // 94% 大号发光字
  river: [fr(barSec(18)), fr(barSec(22))], // 河流撞石、绕过去、散成三角洲
  redefine: [fr(barSec(22)), fr(barSec(27))], // 三角洲收拢，锚词重新出现
  close: [fr(barSec(27)), DURATION], // 收成一个亮点，抛问题
} as const;

/** 越南语数字写法：千分位用点、小数用逗号 */
export const viNum = (v: number, digits = 0) => v.toFixed(digits).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** 数字：一生按 30000 天（约 82 岁）算 */
export const LIFE_DAYS = 30000;
export const pct = (days: number) => (days / LIFE_DAYS) * 100;
export const ONE_DAY_PCT = pct(1); // 0.00333…%
export const ONE_YEAR_PCT = pct(365); // 1.2167%
export const FIVE_YEARS_LEFT_PCT = 100 - pct(365 * 5); // 93.92%

/** 音效：[文件, 帧, 音量] */
export const SFX: [string, number, number][] = [
  ['audio/ep52-margin/impact.wav', HIT, 0.8],
  ['audio/sfx/whoosh.wav', fr(barSec(9)), 0.16],
  ['audio/sfx/ding.wav', fr(barSec(11)), 0.18],
  ['audio/ep52-margin/impact.wav', HIT2, 0.6],
  ['audio/sfx/whoosh.wav', fr(barSec(18)), 0.15],
  ['audio/sfx/magic.wav', fr(barSec(23)), 0.18],
  ['audio/sfx/ding.wav', fr(barSec(27)) + 20, 0.2],
];
