/**
 * ep56 Hiệu ứng mỏ neo（越南语，暗金文献风，横屏 1920×1080，约 84 秒）。
 * 开场：观众看着命运轮停在 65，再自己猜「非洲国家在联合国里占几成」→ 1974 年 Tversky & Kahneman：轮子被动过手脚（10 或 65）
 * → 两组中位数 25% vs 45% → HIỆU ỨNG MỎ NEO → 锚落下、一点点挪、停得太早 → 划线价、菜单、面试 → AI ĐẶT NEO? → 先写自己的数。
 * 配音/字幕时间来自 audio/episodes/ep56-vo.py + ep56-layout.py；配乐 ep56-mo-neo.mjs 读同一份 layout.json。
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
  original: 'Judgment under Uncertainty: Heuristics and Biases',
  title: 'Phán đoán trong bất định',
  meta: 'A. Tversky & D. Kahneman · Science · 1974',
};

export const EV = {
  spin: () => WT(0, 8),
  stop: () => WT(1, 2) - 2,
  question: () => V(2),
  guess: () => V(4),
  study: () => V(5),
  wheels: () => V(6),
  stopA: () => WT(6, 9) - 2, // 10
  stopB: () => WT(6, 11) - 2, // 65
  barA: () => WT(7, 6),
  barB: () => WT(8, 6),
  pull: () => V(9) + 6,
  anchor: () => WT(10, 6),
  steps: (k: number) => WT(11, 4) + k * 8,
  stopEarly: () => WT(11, 11),
  tug: (k: number) => V(12) + 14 + k * 18,
  tag: () => V(13),
  oldPrice: () => WT(13, 3),
  strike: () => WT(13, 5),
  newPrice: () => WT(13, 7),
  cheap: () => V(14) + 4,
  menu: () => V(15),
  menuTop: () => WT(15, 3),
  menuMid: () => WT(15, 12),
  interview: () => V(16),
  salary: () => WT(16, 7),
  tilt: () => WT(16, 9),
  rain: (k: number) => V(17) + 6 + k * 6,
  mine: () => WT(18, 7),
  counter: () => WT(19, 2),
  final: () => V(20),
};
export const SLAMS = (): number[] => [EV.stop(), EV.stopA(), EV.stopB(), EV.barA(), EV.barB(), HIT, EV.anchor(), EV.stopEarly(), EV.newPrice(), EV.cheap(), EV.menuTop(), EV.salary(), HIT2, EV.mine(), EV.counter()];
/** 轻震：小数字、每一步挪动、锚雨 */
export const LIGHT = (): number[] => [...[0, 1, 2, 3, 4].map(EV.steps), ...[0, 1, 2].map((k) => EV.tug(k) + 8), EV.strike(), EV.menuMid(), EV.tilt(), ...Array.from({length: 12}, (_, k) => EV.rain(k))];

const S = (n: string) => `audio/ep56-mo-neo/sfx/${n}.wav`;
const L = (n: string) => `audio/sfx/${n}.wav`;
type Sfx = [string, number, number];
const ticks = (from: number, to: number, slowEnd = true): Sfx[] => {
  const out: Sfx[] = [];
  let t = from;
  let gap = 2;
  while (t < to) {
    out.push([S('tick'), Math.round(t), 0.22]);
    const p = (t - from) / (to - from);
    gap = slowEnd ? 2 + 12 * p * p : 2;
    t += gap;
  }
  return out;
};
export const SFX: Sfx[] = [
  [L('whoosh'), EV.spin(), 0.3],
  ...ticks(EV.spin(), EV.stop()),
  [S('thud'), EV.stop(), 0.4],
  [L('ding'), EV.stop() + 2, 0.35],
  [L('question'), EV.question() + 10, 0.3],
  [L('click'), EV.guess() + 20, 0.25],
  [L('paper'), EV.study(), 0.35],
  ...ticks(EV.wheels(), EV.stopB()).map(([f, a, v]): Sfx => [f, a, v * 0.8]),
  [S('thud'), EV.stopA(), 0.3],
  [S('thud'), EV.stopB(), 0.4],
  [S('riser'), EV.barA() - 14, 0.18],
  [L('pop'), EV.barA(), 0.35],
  [S('riser'), EV.barB() - 14, 0.18],
  [L('pop'), EV.barB(), 0.35],
  [S('clank'), EV.pull(), 0.3],
  [S('riser'), HIT - 42, 0.45],
  ['audio/ep56-mo-neo/impact.wav', HIT, 0.8],
  [S('whistle'), EV.anchor() - 14, 0.25],
  [S('clank'), EV.anchor(), 0.5],
  [S('thud'), EV.anchor(), 0.4],
  ...[0, 1, 2, 3, 4].map((k): Sfx => [L('click'), EV.steps(k), 0.25]),
  [L('error'), EV.stopEarly(), 0.25],
  ...[0, 1, 2].map((k): Sfx => [L('boing'), EV.tug(k) + 8, 0.2]),
  [L('paper'), EV.tag(), 0.3],
  [L('snip'), EV.strike(), 0.35],
  [S('thud'), EV.newPrice(), 0.4],
  [L('stamp'), EV.cheap(), 0.35],
  [L('paper'), EV.menu(), 0.3],
  [S('clank'), EV.menuTop(), 0.3],
  [L('ding'), EV.menuMid(), 0.35],
  [L('whoosh'), EV.interview(), 0.25],
  [S('clank'), EV.salary(), 0.4],
  [S('thud'), EV.tilt(), 0.3],
  ...Array.from({length: 12}, (_, k): Sfx => [S('clank'), EV.rain(k), 0.16]),
  [S('riser'), HIT2 - 42, 0.45],
  ['audio/ep56-mo-neo/impact.wav', HIT2, 0.75],
  [L('type'), V(18) + 6, 0.25],
  [S('clank'), EV.mine(), 0.4],
  [S('clank'), EV.counter(), 0.4],
  [L('magic'), EV.final(), 0.18],
];
