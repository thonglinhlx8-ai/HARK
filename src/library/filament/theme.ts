import type React from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import '../vox/theme';
import {clamp01} from '../anim';

/**
 * 丝线星图风：近黑底、一根会自己长出来的象牙白细线，节点是带光晕的小亮点；
 * 整片几乎不剪，一张画布上线条生长、分叉、织网、收拢。强调只靠两样东西：一个红色宋体大字、一处变色关键词。
 * 两种底：warm（暖黑 + 中心暖光，人生 / 情感题）、cool（深蓝夜空 + 紫色星云 + 星点，思维 / 科学题）。
 */
export const F = {
  bgWarm: '#0a0806', // 暖底：四角 #040303，中心被暖光提亮到 #3a2f26 一带
  glowWarm: 'rgba(122,98,72,', // 暖光晕（拼透明度用）
  bgCool: '#04050c', // 冷底：夜空
  nebula: 'rgba(86,80,170,', // 紫色星云
  nebulaPink: 'rgba(150,80,120,', // 星云边缘的一点粉
  line: '#f2ead8', // 主线：象牙白
  lineDim: 'rgba(242,234,216,0.32)', // 次线 / 背景网
  lineFaint: 'rgba(242,234,216,0.12)',
  warmLine: '#e9c99a', // 暖底上的线偏金
  text: '#f6f3ea', // 字幕白
  textDim: 'rgba(246,243,234,0.58)', // 年龄 / 刻度等次要字
  textFaint: 'rgba(246,243,234,0.34)', // 出处脚注
  gold: '#e8c878', // 冷底上的关键词、人名
  red: '#d8392b', // 暖底强调字：红
  redHot: '#ff6a52', // 红字高光
  redDeep: '#7a1c14',
  pink: '#f85878', // 冷底强调：粉红（「输的一方」、风险数字）
  mint: '#a8f888', // 冷底上的消息气泡
  mintDeep: '#5fbf52',
};

const LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const VIET = 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB';
/** [字体名, 文件, unicode-range]。Filament Viet / Viet Black 是越南语版（Noto Serif 600 / 900，拉丁 + 越南语子集），越南语期数用 vietFont() 切过去 */
const FACES: [string, string, string?][] = [
  ['Filament Serif', 'fonts/filament/NotoSerifSC-SemiBold.woff'],
  ['Filament Serif Black', 'fonts/filament/NotoSerifSC-Black.woff'],
  ['Filament Viet', 'fonts/filament/NotoSerif-600-latin.woff', LATIN],
  ['Filament Viet', 'fonts/filament/NotoSerif-600-vietnamese.woff', VIET],
  ['Filament Viet Black', 'fonts/filament/NotoSerif-900-latin.woff', LATIN],
  ['Filament Viet Black', 'fonts/filament/NotoSerif-900-vietnamese.woff', VIET],
  // 越南语细一点的字幕体（Lora 500）和展示体（Cormorant Garamond 600），都是 OFL
  ['Filament Viet Text', 'fonts/filament/lora-latin-500-normal.woff', LATIN],
  ['Filament Viet Text', 'fonts/filament/lora-vietnamese-500-normal.woff', VIET],
  ['Filament Viet Display', 'fonts/filament/cormorant-garamond-latin-600-normal.woff', LATIN],
  ['Filament Viet Display', 'fonts/filament/cormorant-garamond-vietnamese-600-normal.woff', VIET],
];

if (typeof document !== 'undefined') {
  const handle = delayRender('load filament fonts');
  Promise.all(FACES.map(([name, file, range]) => new FontFace(name, `url(${staticFile(file)})`, range ? {unicodeRange: range} : {}).load().then((l) => document.fonts.add(l))))
    .catch((err) => console.error(err))
    .finally(() => continueRender(handle));
}

/** 字体：中文全用宋体（思源宋体 SemiBold 做字幕和标签，Black 做红色大字和标题），西文用 Garamond / Playfair 斜体 */
export const FF = {
  cn: `var(--fil-cn, 'Filament Serif'), 'Filament Serif', 'Songti SC', 'Noto Serif SC', serif`,
  cnBlack: `var(--fil-cn-black, 'Filament Serif Black'), 'Filament Serif Black', 'Filament Serif', 'Songti SC', serif`,
  latin: `'Vox Garamond', 'Filament Serif', serif`,
  latinItalic: `'Vox Playfair Italic', 'Vox Garamond', serif`,
};

/** 越南语期数：把这个 style 挂在作品根节点上，素材库里所有「中文字体」位置都换成越南语字体（Noto Serif） */
export const vietFont = {'--fil-cn': "'Filament Viet'", '--fil-cn-black': "'Filament Viet Black'"} as React.CSSProperties;

/** 字号层级（以 1080 宽的竖屏为基准，横屏乘 sizeScale） */
export const SIZE = {caption: 54, captionWide: 38, label: 40, labelSmall: 30, age: 30, slam: 128, title: 180, en: 26, foot: 22};

/** 竖 / 横屏判断：竖屏字幕在上方 10%，横屏字幕在下方 90% */
export const isTall = (w: number, h: number) => h > w;

export const ease = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/** 模糊渐显：这套风格所有字和节点的入场，默认 12 帧；out 起 10 帧模糊淡出 */
export const blurIn = (f: number, at: number, dur = 12, out?: number, outDur = 10) => {
  const v = ease((f - at) / dur) * (out === undefined ? 1 : 1 - ease((f - out) / outDur));
  return {opacity: v, filter: v >= 0.999 ? undefined : `blur(${(1 - v) * 12}px)`, v} as {opacity: number; filter?: string; v: number};
};

/** 发光：线和亮点外面一圈柔光 */
export const glow = (color: string, r = 10, a = 0.75): React.CSSProperties => ({filter: `drop-shadow(0 0 ${r}px ${color}) drop-shadow(0 0 ${r * 0.3}px rgba(255,255,255,${a * 0.6}))`});

/**
 * 卡点网格：两支参考片都在 ≈114.8 BPM（一小节 ≈2.09 秒 ≈ 63 帧）。
 * 画面节点（红字砸下、网织满、收拢）卡在小节线上，字幕换句卡在拍上。
 */
export const beatGrid = (bpm = 114.8, offsetSec = 0.02, fps = 30) => {
  const beat = (60 / bpm) * fps;
  return {beat, bar: beat * 4, atBeat: (k: number) => Math.round(offsetSec * fps + k * beat), atBar: (k: number) => Math.round(offsetSec * fps + k * beat * 4)};
};
