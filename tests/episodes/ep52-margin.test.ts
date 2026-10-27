import {existsSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {ANCHOR, BAR, barSec, BURST, BURST_GAP, BURST_WORDS, CUES, cueStart, DARK_FROM, DARK2_FROM, DURATION, FIVE_YEARS_LEFT_PCT, FPS, FREEZE, HIT, HIT2, ONE_DAY_PCT, ONE_YEAR_PCT, SFX, SHOTS, viNum} from '../../src/episodes/ep52-margin/timeline';

describe('ep52 人生的余地', () => {
  it('112 BPM 网格；两个重拍都在小节线上（第 8、16 小节），重拍前先收暗再静止', () => {
    expect(BAR).toBeCloseTo((60 / 112) * 4, 6);
    expect(HIT).toBe(Math.round(barSec(8) * FPS));
    expect(HIT2).toBe(Math.round(barSec(16) * FPS));
    expect(Math.abs(HIT - 17.44 * FPS)).toBeLessThanOrEqual(2); // 实测：17.44 秒 −34 dB → −7 dB
    expect(Math.abs(HIT2 - 34.59 * FPS)).toBeLessThanOrEqual(2);
    expect(HIT - DARK_FROM).toBeGreaterThanOrEqual(18);
    expect(HIT2 - DARK2_FROM).toBeGreaterThanOrEqual(18);
    expect(FREEZE).toBe(3);
  });
  it('字幕（越南语）：按小节递增、在片长内、每句 ≤ 52 字符、不含中文', () => {
    for (let i = 1; i < CUES.length; i++) expect(CUES[i][0]).toBeGreaterThan(CUES[i - 1][0]);
    CUES.forEach(([, vi], i) => {
      expect(cueStart(i)).toBeLessThan(DURATION - FPS);
      expect(vi.length).toBeLessThanOrEqual(52);
      expect(vi).not.toMatch(/[\u4e00-\u9fff]/);
    });
  });
  it('锚词：开头埋下、重拍前话说一半、结尾重新定义、最后抛问题', () => {
    expect(CUES[0][1].toLowerCase()).toContain(ANCHOR);
    expect(CUES.filter(([bar]) => bar < 8).pop()![1]).toMatch(/—$/);
    expect(CUES.filter(([bar]) => bar < 16).pop()![1]).toMatch(/—$/);
    expect(CUES.some(([bar, vi]) => bar >= 22 && vi.toLowerCase().includes(ANCHOR))).toBe(true);
    expect(CUES[CUES.length - 1][1]).toMatch(/\?$/);
  });
  it('爆发段：四个词都在第二个重拍前砸完', () => {
    expect(BURST_WORDS).toHaveLength(4);
    expect(BURST + BURST_GAP * 5).toBeLessThan(DARK2_FROM);
  });
  it('镜头段落首尾相接', () => {
    const list = Object.values(SHOTS);
    for (let i = 1; i < list.length; i++) expect(list[i][0]).toBe(list[i - 1][1]);
    expect(list[list.length - 1][1]).toBe(DURATION);
  });
  it('越南语数字写法', () => {
    expect(viNum(30000)).toBe('30.000');
    expect(viNum(ONE_DAY_PCT, 3)).toBe('0,003');
    expect(viNum(ONE_YEAR_PCT, 1)).toBe('1,2');
  });
  it('数字算对了（一生按 30000 天）', () => {
    expect(ONE_DAY_PCT.toFixed(3)).toBe('0.003');
    expect(ONE_YEAR_PCT.toFixed(1)).toBe('1.2');
    expect(Math.round(FIVE_YEARS_LEFT_PCT)).toBe(94);
  });
  it('音效文件存在（本地已生成音频时）', () => {
    if (!existsSync('public/audio/ep52-margin/bgm.wav')) return;
    for (const [file, at] of SFX) {
      expect(existsSync(`public/${file}`)).toBe(true);
      expect(at).toBeLessThan(DURATION);
    }
  });
});
