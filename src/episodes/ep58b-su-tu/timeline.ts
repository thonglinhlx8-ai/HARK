/**
 * ep58 Con sư tử không tới（越南语，「vibe 知识」竖屏风，1080×1920，约 116 秒）。
 * 参考 #vibe知识大赏「你是在给一只不会来的狮子站岗」：卧室夜景 ↔ 草原落日两套场景来回切，心跳线、红色想象狮子、计数器。
 * 配音 audio/episodes/ep58-vo.py + ep58-layout.py；配乐 ep58-su-tu.mjs。
 */
import CUE_TEXT from './cues.json';
import LAYOUT from './layout.json';
import VO_DATA from './vo.json';
import BEATS_DATA from './beats.json';

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const fr = (sec: number) => Math.round(sec * FPS);
export const DURATION = fr(LAYOUT.end);

export const CUES: string[] = CUE_TEXT as string[];
export const VO = VO_DATA as {start: number; end: number; times: number[]}[];
export const V = (i: number) => fr(VO[i].start);
export const VE = (i: number) => fr(VO[i].end);
/** 第 i 句第 j 个字符出现的帧 */
export const CT = (i: number, j: number) => fr(VO[i].start + (VO[i].times[Math.min(j, VO[i].times.length - 1)] ?? 0));
/** 第 i 句里某个词出现的帧 */
export const WORD = (i: number, w: string) => {
  const t = CUES[i].replace(/[【】]/g, '');
  const k = t.indexOf(w);
  return CT(i, Math.max(0, k));
};
export const cueStart = (i: number) => V(i) - 4;
export const cueEnd = (i: number) => (i + 1 < CUES.length ? Math.min(V(i + 1) - 6, VE(i) + fr(1.4)) : DURATION - 24);

/** Lưới nhịp = phách thật của nhạc nền (beats.json, ~112 BPM) — chuyển cảnh và cú nhấn canh theo phách */
/** Ep58b: lưới 128 BPM bài 0908 (phách 0 = 0,41 s), drop ô 8 = 15,41 s, ô 40 = 75,41 s, hết ô 56 */
export const BEATS: number[] = BEATS_DATA as number[];
export const barF = (k: number) => fr(BEATS[Math.min(4 * k, BEATS.length - 1)]);
export const beatF = (b: number) => fr(BEATS[Math.min(b, BEATS.length - 1)]);
export const BARS: number = LAYOUT.bars;
export const HITS: number[] = (LAYOUT.hits as number[]).map(barF);
