import {existsSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {VO, ANCHOR, B, CUES, cueStart, DARK2_FROM, DARK_FROM, DURATION, FPS, HIT, HIT2, SFX, SHOTS} from '../../src/episodes/ep54-song-sot/timeline';

describe('ep54 Thiên kiến kẻ sống sót', () => {
  it('两个重拍在实测小节线上（18.97 秒、61.63 秒），重拍前收暗', () => {
    expect(Math.abs(HIT - 18.97 * FPS)).toBeLessThanOrEqual(2);
    expect(Math.abs(HIT2 - 61.63 * FPS)).toBeLessThanOrEqual(2);
    expect(HIT - DARK_FROM).toBeGreaterThanOrEqual(18);
    expect(HIT2 - DARK2_FROM).toBeGreaterThanOrEqual(18);
  });
  it('字幕：递增、片长内、≤ 64 字符、无中文', () => {
    for (let i = 1; i < CUES.length; i++) expect(CUES[i][0]).toBeGreaterThan(CUES[i - 1][0]);
    CUES.forEach(([, t], i) => {
      expect(cueStart(i)).toBeLessThan(DURATION - FPS);
      expect(t.replace(/[【】]/g, '').length).toBeLessThanOrEqual(64);
      expect(t).not.toMatch(/[\u4e00-\u9fff]/);
    });
  });
  it('锚词：开场埋下、两个重拍前话说一半、结尾重新定义、最后提问', () => {
    expect(CUES.filter(([b]) => b < 7).some(([, t]) => t.includes(ANCHOR))).toBe(true);
    expect(CUES.filter(([b]) => b < 7).pop()![1]).toMatch(/—$/);
    expect(CUES.filter(([b]) => b < 23).pop()![1]).toMatch(/—$/);
    expect(CUES.some(([b, t]) => b >= 24 && t.includes(ANCHOR))).toBe(true);
    expect(CUES[CUES.length - 1][1]).toMatch(/\?$/);
  });
  it('镜头首尾相接', () => {
    const l = Object.values(SHOTS);
    for (let i = 1; i < l.length; i++) expect(l[i][0]).toBe(l[i - 1][1]);
    expect(l[l.length - 1][1]).toBe(DURATION);
    expect(SHOTS.silence[0]).toBe(B(23));
  });
  it('配音：不重叠、不压重拍、每个字都有时间', () => {
    for (let i = 1; i < VO.length; i++) expect(VO[i].start).toBeGreaterThan(VO[i - 1].end + 0.15);
    for (const h of [HIT, HIT2]) for (const v of VO) expect(v.end * FPS <= h || v.start * FPS >= h + 60).toBe(true);
    VO.forEach((v, i) => expect(v.times.length).toBe(CUES[i][1].replace(/[【】]/g, '').length));
  });
  it('音效存在', () => {
    if (!existsSync('public/audio/ep54-song-sot/bgm.wav')) return;
    for (const [file, at] of SFX) {
      expect(existsSync(`public/${file}`)).toBe(true);
      expect(at).toBeLessThan(DURATION);
    }
  });
});
