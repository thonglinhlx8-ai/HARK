/**
 * ep57 Chi phí chìm（越南语，暗金文献风 · 3D 空间版，横屏 1920×1080，约 86 秒）。
 * 一个连续的 3D 世界，镜头一路往深处飞：电影院（票掉进坑）→ 1985 Arkes & Blumer 两张滑雪票 → 坠入隧道「CHI PHÍ CHÌM」
 * → 钱/时间/力气沉下去 → Concorde 钱塔 → 三张生活卡片走廊 → 巨大的「0」环「BẮT ĐẦU TỪ SỐ 0」→ 回头看。
 * 配音 audio/episodes/ep57-vo.py + ep57-layout.py；配乐 ep57-chi-phi-chim.mjs。
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
export const AFTER1 = HIT + fr(2.3) - 6;
export const AFTER2 = HIT2 + fr(2.3) - 6;
export const DARK_FROM = HIT - 21;
export const DARK2_FROM = HIT2 - 21;
export const FREEZE = 3;
export const DURATION = fr(barSec(LAYOUT.bars) + 1);

export const CUES: string[] = CUE_TEXT as string[];
export const VO = VO_DATA as {start: number; end: number; times: number[]}[];
export const V = (i: number) => fr(VO[i].start);
export const WT = (i: number, j: number) => {
  const u = [...new Set(VO[i].times)];
  return fr(VO[i].start + u[Math.min(j, u.length - 1)]);
};
export const cueStart = (i: number) => V(i);
export const cueEnd = (i: number) => Math.min(i + 1 < CUES.length ? cueStart(i + 1) : DURATION, fr(VO[i].end + 1.2));

export const CITE = {
  original: 'The Psychology of Sunk Cost',
  title: 'Tâm lý học của chi phí chìm',
  meta: 'H. Arkes & C. Blumer · OBHDP · 1985',
};

export const EV = {
  ticket: () => WT(0, 2),
  price: () => WT(0, 5),
  screen: () => V(1),
  bad: () => WT(1, 7),
  signs: () => V(2),
  stay: () => V(3),
  regret: () => WT(3, 6),
  lost: () => WT(4, 1),
  sink: () => WT(4, 4),
  study: () => V(5),
  cards: () => V(6),
  c100: () => WT(6, 11),
  c50: () => WT(6, 15),
  fun: () => V(7),
  one: () => WT(7, 6),
  pick: () => V(8),
  pick100: () => WT(8, 6),
  tokens: (k: number) => V(8) + 4 + k * 4,
  three: (k: number) => WT(10, [0, 1, 3][k]),
  gone: () => WT(10, 8),
  pull: () => WT(10, 14),
  concorde: () => WT(11, 6),
  loss: () => V(12),
  pour: (k: number) => V(13) + 8 + k * 5,
  fallacy: () => WT(14, 6),
  card: (k: number) => V(15 + k),
  cardHit: (k: number) => WT(15 + k, [7, 9, 5][k]),
  zero: () => WT(19, 8),
  choose: () => WT(19, 11),
  keep: () => V(20),
  final: () => V(21),
};
export const SLAMS = (): number[] => [EV.ticket(), EV.bad(), EV.sink(), EV.c100(), EV.c50(), EV.pick100(), HIT, EV.pull(), EV.concorde(), EV.fallacy(), ...[0, 1, 2].map(EV.cardHit), HIT2, EV.zero()];
export const LIGHT = (): number[] => [EV.price(), EV.signs(), EV.regret(), EV.one(), ...[0, 1, 2].map(EV.three), ...Array.from({length: 12}, (_, k) => EV.pour(k)), ...[0, 1, 2].map(EV.card), EV.choose()];

const S = (n: string) => `audio/ep57-chi-phi-chim/sfx/${n}.wav`;
const L = (n: string) => `audio/sfx/${n}.wav`;
type Sfx = [string, number, number];
export const SFX: Sfx[] = [
  [L('whoosh'), 0, 0.3],
  [S('thud'), EV.ticket(), 0.4],
  [L('ding'), EV.price(), 0.3],
  [L('whoosh'), EV.screen() - 6, 0.25],
  [L('error'), EV.bad(), 0.3],
  [L('pop'), EV.signs(), 0.3],
  [L('pop'), EV.signs() + 8, 0.3],
  [L('click'), EV.stay(), 0.3],
  [L('paper'), EV.regret(), 0.3],
  [S('whistle'), EV.sink() - 16, 0.25],
  [S('thud'), EV.sink(), 0.45],
  [L('whoosh'), EV.study() - 10, 0.3],
  [L('paper'), EV.study() + 6, 0.3],
  [S('clank'), EV.c100(), 0.4],
  [S('clank'), EV.c50(), 0.4],
  [S('riser'), EV.fun() - 10, 0.2],
  [L('ding'), EV.fun() + 14, 0.3],
  [L('click'), EV.one(), 0.3],
  ...Array.from({length: 10}, (_, k): Sfx => [L('click'), EV.tokens(k) + 10, 0.18]),
  [L('stamp'), EV.pick100(), 0.4],
  [S('riser'), HIT - 42, 0.45],
  ['audio/ep57-chi-phi-chim/impact.wav', HIT, 0.8],
  [L('whoosh'), HIT + 4, 0.35],
  ...[0, 1, 2].map((k): Sfx => [L('pop'), EV.three(k), 0.3]),
  [S('whistle'), EV.gone() - 4, 0.25],
  [S('clank'), EV.pull(), 0.4],
  [L('whoosh'), V(11) - 8, 0.3],
  [S('thud'), EV.concorde(), 0.45],
  [L('error'), EV.loss() + 20, 0.3],
  ...Array.from({length: 12}, (_, k): Sfx => [S('clank'), EV.pour(k), 0.15]),
  [L('stamp'), EV.fallacy(), 0.45],
  ...[0, 1, 2].map((k): Sfx => [L('whoosh'), EV.card(k) - 6, 0.25]),
  ...[0, 1, 2].map((k): Sfx => [S('thud'), EV.cardHit(k), 0.35]),
  [S('riser'), HIT2 - 42, 0.45],
  ['audio/ep57-chi-phi-chim/impact.wav', HIT2, 0.75],
  [L('whoosh'), V(19) - 6, 0.3],
  [S('clank'), EV.zero(), 0.4],
  [L('question'), EV.choose(), 0.3],
  [L('whoosh'), EV.keep() - 4, 0.25],
  [L('magic'), EV.final(), 0.18],
];
