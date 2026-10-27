// ep52 人生的余地：配乐全部用代码合成（不依赖音乐库），112 BPM，起音 0.30 秒，一小节 60/112×4 ≈ 2.1429 秒。
// 段落：0–7 小节 安静铺底（钢琴感拨弦 + 长 pad）→ 第 7 小节后半「换气」（全部收掉，只剩噪声渐强）→ 第 8 小节重拍（低频重击 + 全编制进入）
//      → 14–15 小节 爆发段（底鼓每拍）→ 15 小节末再换气 → 16 小节第二重拍 → 之后舒缓收尾，30 小节淡出。
// 输出 public/audio/ep52-margin/bgm.wav（−16 LUFS）、impact.wav（重拍冲击）
import {execFileSync} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {boom, crash, lp1, pad, swell} from '../score.mjs';
import {SR, encodeWav, kick, mixInto, mtof, pluck, setSeed, hat} from '../synth.mjs';

const EP = 'ep52-margin';
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'audio', EP);
mkdirSync(dir, {recursive: true});

const BPM = 112;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const T0 = 0.3;
const bar = (k) => T0 + BAR * k;
const LEN = bar(31);
setSeed(52);

const out = new Float32Array(Math.round(LEN * SR));
// 和声：Am – F – C – G（每小节一个和弦）
const PROG = [
  [57, 60, 64],
  [53, 57, 60],
  [48, 52, 55],
  [55, 59, 62],
];
const ROOT = [45, 41, 36, 43];
const MEL = [76, 72, 74, 71, 72, 69, 67, 71];

const quiet = (k) => k < 8; // 钩子段
const breath = (k) => k === 7 || k === 15; // 换气小节：后半小节全部收掉

for (let k = 0; k < 30; k++) {
  const ch = PROG[k % 4];
  const t = bar(k);
  const full = k >= 8 && k < 26;
  const burst = k === 14 || k === 15;
  // pad：每小节一个和弦
  mixInto(out, pad(ch.map((m) => m - 12), breath(k) ? BAR * 0.45 : BAR * 1.05, {atk: 0.4, rel: 0.5, cut: full ? 1500 : 900}), t, quiet(k) ? 0.5 : 0.7);
  // 拨弦琶音：八分音符
  for (let b = 0; b < 8; b++) {
    if (breath(k) && b >= 4) break;
    const m = ch[b % 3] + 12 + (b >= 4 ? 12 * (b % 2) : 0);
    mixInto(out, pluck(mtof(m), 0.9, 0.4), t + (b * BEAT) / 2, quiet(k) ? 0.16 : 0.2);
  }
  // 旋律（满编段才有）
  if (full && !breath(k)) mixInto(out, pluck(mtof(MEL[k % 8]), 1.6, 0.6), t, 0.22);
  // 低音 + 鼓
  if (k >= 8 && !breath(k) && k < 28) {
    for (let b = 0; b < 4; b++) {
      if (b === 0 || burst) mixInto(out, kick(), t + b * BEAT, burst ? 0.55 : 0.45);
      mixInto(out, hat(), t + b * BEAT + BEAT / 2, 0.08);
    }
    mixInto(out, lp1(pad([ROOT[k % 4] - 12], BAR, {atk: 0.02, rel: 0.4, cut: 300}), 200), t, 0.9);
  }
  // 换气：后半小节噪声渐强推向重拍
  if (breath(k)) mixInto(out, swell(BAR * 0.5), t + BAR * 0.5, 0.18);
}
// 重拍：低频重击 + 镲
for (const k of [8, 16]) {
  mixInto(out, boom(2.2, 90, 32), bar(k), 0.9);
  mixInto(out, crash(2.4), bar(k), 0.22);
}
// 收尾淡出
const fadeFrom = bar(28);
for (let i = Math.round(fadeFrom * SR); i < out.length; i++) out[i] *= Math.max(0, 1 - (i / SR - fadeFrom) / (LEN - fadeFrom));

const raw = join(dir, 'bgm-raw.wav');
writeFileSync(raw, encodeWav(out, SR));
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);
ff(['-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,pan=stereo|c0=c0|c1=c0', join(dir, 'bgm.wav')]);
// 重拍冲击音效（画面里另外叠一层，峰值压到约 −6 dBFS）
ff([
  '-f', 'lavfi', '-i', "aevalsrc='0.55*exp(-3.2*t)*sin(2*PI*(72*t-12*t*t))':s=48000:d=1.6",
  '-af', 'alimiter=limit=0.5,pan=stereo|c0=c0|c1=c0', join(dir, 'impact.wav'),
]);
console.log(`wrote ${EP}/bgm.wav (${LEN.toFixed(2)}s), impact.wav`);
