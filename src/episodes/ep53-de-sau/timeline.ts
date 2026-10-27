/**
 * ep53 Để sau（越南语，丝线星图风，竖屏 1080×1920，约 59 秒，无口播）。
 * 选题：跟父母见面的次数还剩多少（自写文案和画面）。
 * 锚词「để sau」（以后再说）：第一秒妈妈的消息里埋下 → 第 15 小节红字砸出（罪魁祸首）→ 结尾重新定义「Đừng để "để sau" thành lần cuối」。
 * 第一个重拍（第 6 小节）是数字「40 LẦN」发光砸出。
 */
export const FPS = 30;
export const W = 1080;
export const H = 1920;

/** 配乐 audio/episodes/ep53-de-sau.mjs：96 BPM，一小节 2.5 秒，起音 0.30 秒 */
export const BPM = 96;
export const BAR = (60 / BPM) * 4;
export const BAR0 = 0.3;
export const barSec = (k: number) => BAR0 + BAR * k;
export const fr = (sec: number) => Math.round(sec * FPS);
export const B = (k: number) => fr(barSec(k));

/** 实测 bgm.wav：15.3 秒前 0.6 秒 −34 dB → 小节线上 −6.7 dB；37.8 秒前 −39 dB → −7.3 dB */
export const HIT = B(6);
export const HIT2 = B(15);
export const DARK_FROM = HIT - 21;
export const DARK2_FROM = HIT2 - 21;
export const FREEZE = 3;
export const BURST = B(14);
export const BURST_GAP = Math.round(((60 / BPM) * FPS) / 2); // 半拍 ≈ 9 帧

export const DURATION = fr(barSec(23) + 1);

export const ANCHOR = 'để sau';
export const HIT_TEXT = '40 LẦN';

/** 字幕（越南语）：[小节号, 字幕]；≤ 52 字符 */
export const CUES: [number, string][] = [
  [0, 'Mẹ hỏi bao giờ về. Bạn bảo: "để sau".'],
  [2, 'Bố mẹ năm nay 55 tuổi.'],
  [3, 'Mỗi năm, bạn về nhà hai lần.'],
  [4, 'Tuổi thọ trung bình người Việt: 74,7.'],
  [5, 'Từ giờ, bạn chỉ còn gặp bố mẹ —'],
  [7, 'Mỗi lần, chừng 5 ngày.'],
  [8, 'Cộng lại: 200 ngày. Chưa tới 7 tháng.'],
  [10, '18 năm sống chung một mái nhà'],
  [11, 'là 6.570 ngày.'],
  [12, 'Năm 18 tuổi xách balo đi,'],
  [13, 'bạn đã dùng hết 97% thời gian ấy.'],
  [14, 'Vậy mà câu ta nói nhiều nhất vẫn là —'],
  [16, 'Mỗi lần "để sau", 40 lại thành 39.'],
  [18, '40 lần không nhiều. Nhưng vẫn còn kịp.'],
  [19, 'Đừng để "để sau" thành lần cuối.'],
  [21, 'Lần gần nhất bạn về nhà là khi nào?'],
];
export const cueStart = (i: number) => B(CUES[i][0]);
export const cueEnd = (i: number) => (i + 1 < CUES.length ? cueStart(i + 1) : DURATION);

/** 爆发段连砸的借口 */
export const EXCUSES = ['BẬN', 'TĂNG CA', 'XA QUÁ', 'NĂM SAU'];

export const SHOTS = {
  chat: [0, B(2)], // 第一秒：妈妈的消息气泡 + 回复「để sau」
  count: [B(2), HIT], // 20 年时间线，40 个点逐个亮起；收暗、静止
  hit: [HIT, B(7)], // 40 LẦN 发光砸出
  days: [B(7), B(10)], // 每点裂成 5 个 → 200 ngày
  field: [B(10), BURST], // 6570 个点铺满全屏，200 天缩在角落 → 97%
  burst: [BURST, HIT2], // 借口连砸，收暗、静止
  slam: [HIT2, B(16)], // ĐỂ SAU 红字砸下
  minus: [B(16), B(18)], // 40 个点灭掉一个，40 → 39
  home: [B(18), B(21)], // 四面八方的线收拢到一盏灯「nhà」
  close: [B(21), DURATION], // 一盏灯 + 提问
} as const;

/** 数字（估算口径写进画面脚注） */
export const PARENT_AGE = 55;
export const LIFE_EXPECTANCY = 74.7; // Cục Thống kê, 2025
export const YEARS_LEFT = Math.round(LIFE_EXPECTANCY - PARENT_AGE); // 20
export const VISITS_PER_YEAR = 2;
export const DAYS_PER_VISIT = 5;
export const VISITS_LEFT = YEARS_LEFT * VISITS_PER_YEAR; // 40
export const DAYS_LEFT = VISITS_LEFT * DAYS_PER_VISIT; // 200
export const DAYS_AT_HOME = 18 * 365; // 6570
export const USED_PCT = (DAYS_AT_HOME / (DAYS_AT_HOME + DAYS_LEFT)) * 100; // 97.05

export const FOOTNOTE = 'Ước tính: bố mẹ 55 tuổi, tuổi thọ TB 74,7 (Cục Thống kê, 2025), về nhà 2 lần/năm, mỗi lần 5 ngày';

/** 越南语数字：千分位点、小数逗号 */
export const viNum = (v: number, digits = 0) => {
  const [i, d] = v.toFixed(digits).split('.');
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (d ? ',' + d : '');
};

export const SFX: [string, number, number][] = [
  ['audio/ep53-de-sau/msg.wav', 4, 0.5],
  ['audio/ep53-de-sau/msg.wav', 40, 0.4],
  ['audio/ep53-de-sau/impact.wav', HIT, 0.8],
  ['audio/sfx/whoosh.wav', B(7), 0.15],
  ['audio/sfx/ding.wav', B(13), 0.18],
  ['audio/ep53-de-sau/impact.wav', HIT2, 0.7],
  ['audio/sfx/whoosh.wav', B(18), 0.14],
  ['audio/sfx/magic.wav', B(19), 0.16],
];
