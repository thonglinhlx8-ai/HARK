/**
 * ep65 "Kén thông tin" — dọc 1080×1920, không lời dẫn.
 * Nhạc: Supernatural - Dark Trap (Sascha Ende, CC BY 4.0), tăng tốc 3,6% → 112,86 BPM.
 * Drop đo được (bản đã kéo): 8,446 / 50,92 / 84,945 s. Lặng trước drop: ~48,7–50,9 và ~82,8–84,9.
 * BAR(0) = drop 1, BAR(20) ≈ drop 2, BAR(36) ≈ drop 3.
 */
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const BL = 2.12497;
export const BP = BL / 4;
export const BAR = (k: number) => 8.446 + k * BL;
export const MID = (k: number) => BAR(k) + 2 * BP;
export const D1 = 8.446;
export const D2 = 50.92;
export const D3 = 84.945;
export const END = BAR(42);
export const DURATION = Math.round(END * FPS);
export const S = (sec: number) => Math.round(sec * FPS);
