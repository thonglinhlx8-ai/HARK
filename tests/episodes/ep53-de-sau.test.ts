import {existsSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {ANCHOR, B, BURST, BURST_GAP, CUES, cueStart, DARK2_FROM, DARK_FROM, DAYS_AT_HOME, DAYS_LEFT, DURATION, EXCUSES, FPS, HIT, HIT2, SFX, SHOTS, USED_PCT, viNum, VISITS_LEFT, YEARS_LEFT} from '../../src/episodes/ep53-de-sau/timeline';

describe('ep53 Để sau', () => {
  it('两个重拍在实测小节线上（15.3 秒、37.8 秒），重拍前收暗', () => {
    expect(Math.abs(HIT - 15.3 * FPS)).toBeLessThanOrEqual(2);
    expect(Math.abs(HIT2 - 37.8 * FPS)).toBeLessThanOrEqual(2);
    expect(HIT - DARK_FROM).toBeGreaterThanOrEqual(18);
    expect(HIT2 - DARK2_FROM).toBeGreaterThanOrEqual(18);
  });
  it('字幕：递增、片长内、≤ 52 字符、无中文', () => {
    for (let i = 1; i < CUES.length; i++) expect(CUES[i][0]).toBeGreaterThan(CUES[i - 1][0]);
    CUES.forEach(([, t], i) => {
      expect(cueStart(i)).toBeLessThan(DURATION - FPS);
      expect(t.length).toBeLessThanOrEqual(52);
      expect(t).not.toMatch(/[\u4e00-\u9fff]/);
    });
  });
  it('锚词：第一句埋下、两个重拍前都话说一半、结尾重新定义、最后提问', () => {
    expect(CUES[0][1]).toContain(ANCHOR);
    expect(CUES.filter(([b]) => b < 6).pop()![1]).toMatch(/—$/);
    expect(CUES.filter(([b]) => b < 15).pop()![1]).toMatch(/—$/);
    expect(CUES.some(([b, t]) => b >= 19 && t.includes(ANCHOR))).toBe(true);
    expect(CUES[CUES.length - 1][1]).toMatch(/\?$/);
  });
  it('借口在第二重拍收暗前砸完', () => {
    expect(BURST + BURST_GAP * (EXCUSES.length + 1)).toBeLessThan(DARK2_FROM);
  });
  it('镜头首尾相接', () => {
    const l = Object.values(SHOTS);
    for (let i = 1; i < l.length; i++) expect(l[i][0]).toBe(l[i - 1][1]);
    expect(l[l.length - 1][1]).toBe(DURATION);
    expect(SHOTS.hit[0]).toBe(B(6));
  });
  it('数字', () => {
    expect(YEARS_LEFT).toBe(20);
    expect(VISITS_LEFT).toBe(40);
    expect(DAYS_LEFT).toBe(200);
    expect(DAYS_LEFT / 30).toBeLessThan(7);
    expect(DAYS_AT_HOME).toBe(6570);
    expect(Math.round(USED_PCT)).toBe(97);
    expect(viNum(6570)).toBe('6.570');
    expect(73 * 90).toBe(DAYS_AT_HOME);
  });
  it('音效存在', () => {
    if (!existsSync('public/audio/ep53-de-sau/bgm.wav')) return;
    for (const [file, at] of SFX) {
      expect(existsSync(`public/${file}`)).toBe(true);
      expect(at).toBeLessThan(DURATION);
    }
  });
});
