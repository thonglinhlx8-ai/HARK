/**
 * ep55 Thiên kiến xác nhận（越南语，暗金文献风，横屏 1920×1080，约 100 秒）。
 * 开场：观众亲自玩 Wason 2-4-6 游戏 → 三次「Đúng」→ 自信满格 → 「Sai」红叉砸碎假设 → THIÊN KIẾN XÁC NHẬN。
 * 中段：真规则只是「tăng dần」；1960 年 Wason：29 人里 6 人第一次就说对；只测「让自己对」的例子 → 自信涨、知识不涨。
 * 现代：股票只读好消息、怀疑恋人、算法 → 满屏金色勾 → TÌM CÁI SAI → 结尾提问。
 * 配音/字幕时间来自 audio/episodes/ep55-vo.py + ep55-layout.py；配乐 ep55-xac-nhan.mjs 读同一份 layout.json。
 */
import CUE_TEXT from './cues.json';
import LAYOUT from './layout.json';
import VO_DATA from './vo.json';

export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const BPM = 90;
export const BAR = (60 / BPM) * 4;
export const BAR0 = 0.3;
export const barSec = (k: number) => BAR0 + BAR * k;
export const fr = (sec: number) => Math.round(sec * FPS);
export const B = (k: number) => fr(barSec(k));

export const HIT = B(LAYOUT.hit1);
export const HIT2 = B(LAYOUT.hit2);
export const AFTER1 = HIT + fr(2.3) - 6; // 重拍字停留到第 8 句前
export const AFTER2 = HIT2 + fr(2.3) - 6;
export const DARK_FROM = HIT - 21;
export const DARK2_FROM = HIT2 - 21;
export const FREEZE = 3;
export const DURATION = fr(barSec(LAYOUT.bars) + 1);

/** 字幕：【】里的词变金 */
export const CUES: string[] = CUE_TEXT as string[];
export const VO = VO_DATA as {start: number; end: number; times: number[]}[];
export const V = (i: number) => fr(VO[i].start);
/** 第 i 句里第 j 个词开始的帧（来自 WordBoundary） */
export const WT = (i: number, j: number) => {
  const u = [...new Set(VO[i].times)];
  return fr(VO[i].start + u[Math.min(j, u.length - 1)]);
};
export const cueStart = (i: number) => V(i);
export const cueEnd = (i: number) => Math.min(i + 1 < CUES.length ? cueStart(i + 1) : DURATION, fr(VO[i].end + 1.2));

export const CITE = {
  original: 'On the failure to eliminate hypotheses in a conceptual task',
  title: 'Thí nghiệm dãy số 2 – 4 – 6',
  meta: 'P. C. Wason · Quarterly Journal of Experimental Psychology · 1960',
};

/* ---------- 动作事件（画面和音效共用） ---------- */
/** 三排「猜」：第 2/3/4 句；每排 3 个数字砸下 + 一个 ĐÚNG */
export const ROWS = [
  {cue: 2, nums: ['8', '10', '12'], tile: [0, 1, 2], ok: 3},
  {cue: 3, nums: ['20', '22', '24'], tile: [0, 1, 2], ok: 3},
  {cue: 4, nums: ['100', '102', '104'], tile: [0, 1, 2], ok: 4},
];
export const EV = {
  rule: () => [WT(0, 8), WT(0, 9), WT(0, 10)], // 2, 4, 6
  slots: () => V(1) + 20,
  tile: (r: number, k: number) => WT(ROWS[r].cue, ROWS[r].tile[k]),
  ok: (r: number) => WT(ROWS[r].cue, ROWS[r].ok),
  guess: () => V(5),
  sai: () => V(6),
  reveal: () => V(7) + 8,
  tiles2: () => [WT(8, 0), WT(8, 1), WT(8, 2), WT(8, 5), WT(8, 6), WT(8, 7)],
  ok2: () => [WT(8, 4), WT(8, 9)],
  people: () => V(9) + 10,
  verdict: (k: number) => V(10) + 4 + Math.round(k * 1.5), // 29 人逐个判定
  inner: (k: number) => V(11) + 24 + k * 9, // 「为了证明自己对」的测试落进小圈
  meters: () => V(12),
  outer: () => WT(13, 12), // 「có thể làm mình sai」：一个测试打到小圈外
  feed0: () => V(14),
  pull: (k: number) => V(15) + 26 + k * 8, // 好消息被吸进来 / 坏消息弹开
  chat: (k: number) => V(16) + 18 + k * 12,
  algo: (k: number) => V(17) + 10 + k * 5,
  checks: (k: number) => V(18) + 4 + k * 3,
  lens: () => V(19),
  crack: () => WT(20, 7),
  ask: () => V(22),
  final: () => V(24),
};
export const SLAMS = (): number[] => [
  ...EV.rule(),
  ...[0, 1, 2].map(EV.ok),
  EV.sai(),
  ...EV.tiles2().filter((_, i) => i % 3 === 0),
  EV.outer(),
  EV.crack(),
  EV.ask(),
];

const S = (n: string) => `audio/ep55-xac-nhan/sfx/${n}.wav`;
const L = (n: string) => `audio/sfx/${n}.wav`;
type Sfx = [string, number, number];
export const SFX: Sfx[] = [
  [L('paper'), 6, 0.35],
  ...EV.rule().map((t): Sfx => [S('thud'), t, 0.4]),
  [L('question'), EV.slots(), 0.3],
  ...[0, 1, 2].flatMap((r): Sfx[] => [
    ...[0, 1, 2].map((k): Sfx => [S('thud'), EV.tile(r, k), 0.3]),
    [L('ding'), EV.ok(r), 0.45],
    [L('stamp'), EV.ok(r), 0.3],
  ]),
  [L('type'), EV.guess(), 0.3],
  [S('riser'), EV.guess() + 20, 0.25],
  [L('error'), EV.sai(), 0.5],
  [S('debris'), EV.sai() + 4, 0.45],
  [S('riser'), HIT - 42, 0.45],
  ['audio/ep55-xac-nhan/impact.wav', HIT, 0.8],
  [L('paper'), EV.reveal(), 0.4],
  ...EV.tiles2().map((t): Sfx => [S('thud'), t, 0.28]),
  ...EV.ok2().map((t): Sfx => [L('ding'), t, 0.4]),
  [L('whoosh'), EV.people(), 0.3],
  ...Array.from({length: 29}, (_, k): Sfx => [S('tick'), EV.verdict(k), 0.2]),
  ...[0, 1, 2, 3].map((k): Sfx => [S('shot'), EV.inner(k), 0.18]),
  ...[0, 1, 2, 3].map((k): Sfx => [L('ding'), EV.inner(k) + 4, 0.15]),
  [L('click'), EV.meters(), 0.3],
  [S('shot'), EV.outer() - 6, 0.35],
  [S('clank'), EV.outer(), 0.45],
  [L('magic'), EV.outer() + 4, 0.25],
  [L('pop'), EV.feed0(), 0.3],
  ...[0, 1, 2, 3, 4, 5].map((k): Sfx => (k % 2 ? [L('boing'), EV.pull(k), 0.18] : [L('whoosh'), EV.pull(k), 0.2])),
  ...[0, 1, 2].map((k): Sfx => [L('question'), EV.chat(k), 0.25]),
  ...Array.from({length: 8}, (_, k): Sfx => [S('pop'), EV.algo(k), 0.22]),
  ...Array.from({length: 12}, (_, k): Sfx => [S('tick'), EV.checks(k), 0.22]),
  [S('riser'), HIT2 - 42, 0.45],
  ['audio/ep55-xac-nhan/impact.wav', HIT2, 0.75],
  [L('whoosh'), EV.lens(), 0.3],
  [S('clank'), EV.crack(), 0.4],
  [S('thud'), EV.ask(), 0.4],
  [L('magic'), EV.final(), 0.15],
];
