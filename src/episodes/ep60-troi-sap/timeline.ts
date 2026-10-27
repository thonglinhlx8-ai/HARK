/**
 * ep60 Trời sập (bản Việt của #vibe知识大赏「人生的容错率…」) — dọc 1080×1920, không lời dẫn.
 * Nhạc = bài user gửi (user-bgm.mp3) cắt bỏ 0,459 s đầu → trùng khít nhạc bản gốc, nên mọi mốc giây ở đây = mốc của bản gốc.
 * Lưới phách đo từ bản gốc: chu kỳ 0,53163 s, pha 0,0735 s (112,86 BPM… librosa ~112,35).
 */
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const END = 134.6;
export const DURATION = Math.round(END * FPS);
export const BP = 0.53163;
export const PH = 0.0735;
/** giây → khung */
export const S = (sec: number) => Math.round(sec * FPS);
/** nắn về nốt móc đơn gần nhất (nửa phách) */
export const E8 = (t: number) => PH + (BP / 2) * Math.round((t - PH) / (BP / 2));
/** nắn về phách gần nhất */
export const E4 = (t: number) => PH + BP * Math.round((t - PH) / BP);
