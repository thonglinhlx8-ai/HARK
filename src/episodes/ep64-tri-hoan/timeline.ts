/**
 * ep64 "Trì hoãn" — dọc 1080×1920, không lời dẫn. Nhạc chữ ký Ep60 (bgm.wav, 112,86 BPM).
 * A: nhạc 0 → BAR(16) (ô 15 hạ nhỏ); B: drop 93,36 s đặt ở BAR(16) trong 4 ô; C: từ BAR(20) phát tiếp nhạc từ vị trí BAR(16).
 */
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const BP = 0.53163;
export const PH = 0.0735;
export const BARLEN = 4 * BP;
export const BAR = (k: number) => PH + k * BARLEN;
export const MID = (k: number) => BAR(k) + 2 * BP;
export const END = BAR(46) + 0.5;
export const DURATION = Math.round(END * FPS);
export const S = (sec: number) => Math.round(sec * FPS);
export const DROP = BAR(16);
