/**
 * ep63 "Ổn" (kìm nén cảm xúc) — dọc 1080×1920, không lời dẫn.
 * Nhạc chữ ký Ep60 (bgm.wav, 112,86 BPM, phách 0,53163 s, pha 0,0735 s).
 * Đoạn A: nhạc 0 → 42,6 s; im lặng 42,6 → 46,86 (ly vỡ); đoạn B: nhạc từ drop 93,36 s đặt đúng E = BAR(22);
 * đoạn C: từ BAR(28) phát nhạc từ vị trí 42,6 s.
 */
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const BP = 0.53163;
export const PH = 0.0735;
export const BARLEN = 4 * BP;
export const BAR = (k: number) => PH + k * BARLEN;
export const MID = (k: number) => BAR(k) + 2 * BP;
export const END = BAR(44) + 0.5;
export const DURATION = Math.round(END * FPS);
export const S = (sec: number) => Math.round(sec * FPS);
export const E = BAR(22);
