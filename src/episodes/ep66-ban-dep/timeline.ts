/**
 * ep66 "Bản đẹp nhất của người khác" — dọc 1080×1920, không lời dẫn, XUẤT CHỈ SFX.
 * User tự gắn nhạc thư viện (file 0908) chạy từ 0:00 bài = khung 0 video.
 * Đo lại bài: 128,00 BPM, phách 0,46875 s, ô nhịp 1,875 s, phách 0 ≈ 0,41 s.
 * BAR(8)=15,41 drop 1 · BAR(24)=45,41 bass rút · BAR(32)=60,41 build · BAR(40)=75,41 drop 2 · BAR(56)=105,41 bass rút → hết.
 */
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const BP = 0.46875;
export const BL = BP * 4;
export const T0 = 0.41;
export const BAR = (k: number) => T0 + k * BL;
export const MID = (k: number) => BAR(k) + 2 * BP;
export const D1 = BAR(8);
export const D2 = BAR(40);
export const END = BAR(56);
export const DURATION = Math.round(END * FPS) + 6;
export const S = (sec: number) => Math.round(sec * FPS);
