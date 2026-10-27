/**
 * ep61 Việc của ai? (bản Việt chủ đề 课题分离 của #vibe知识大赏) — dọc 1080×1920, không lời dẫn.
 * Dùng lại nhạc Ep60 (bgm.wav, 112,86 BPM, chu kỳ 0,53163 s, pha 0,0735 s). Drop bass: 17,07 s và 93,36 s.
 */
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const END = 134.5;
export const DURATION = Math.round(END * FPS);
export const BP = 0.53163;
export const PH = 0.0735;
export const S = (sec: number) => Math.round(sec * FPS);
/** đầu ô nhịp thứ k (4 phách) */
export const BAR = (k: number) => PH + k * 4 * BP;
/** phách 3 (giữa ô) của ô nhịp k */
export const MID = (k: number) => BAR(k) + 2 * BP;
