// ep53 Để sau：配乐代码合成，96 BPM（一小节 2.5 秒），起音 0.30 秒，A 小调钢琴感拨弦 + pad，情绪向。
// 段落：0–5 小节安静（只有琶音 + pad）→ 第 5 小节后半换气 → 第 6 小节重拍（低频重击 + 低音、鼓进入）
//      → 14 小节爆发（底鼓每拍）→ 后半换气 → 第 15 小节第二重拍 → 18 小节后转大调变暖、收鼓 → 22 小节起淡出
import {execFileSync} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {boom, crash, lp1, pad, swell} from '../score.mjs';
import {SR, encodeWav, hat, kick, mixInto, mtof, pluck, setSeed} from '../synth.mjs';

const EP = 'ep53-de-sau';
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'audio', EP);
mkdirSync(dir, {recursive: true});
const BPM = 96;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const T0 = 0.3;
const bar = (k) => T0 + BAR * k;
const LEN = bar(23) + 1;
setSeed(53);
const out = new Float32Array(Math.round(LEN * SR));
const MINOR = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [52, 56, 59]]; // Am F C E
const MAJOR = [[48, 52, 55], [55, 59, 62], [57, 60, 64], [53, 57, 60]]; // C G Am F
const ROOT_MIN = [45, 41, 36, 40];
const ROOT_MAJ = [36, 43, 45, 41];
const MEL = [76, 74, 72, 71, 72, 76, 79, 76];
const breath = (k) => k === 5 || k === 14;
for (let k = 0; k < 23; k++) {
  const warm = k >= 18;
  const ch = (warm ? MAJOR : MINOR)[k % 4];
  const root = (warm ? ROOT_MAJ : ROOT_MIN)[k % 4];
  const t = bar(k);
  const full = k >= 6 && k < 18;
  const burst = k === 14;
  mixInto(out, pad(ch.map((m) => m - 12), breath(k) ? BAR * 0.45 : BAR * 1.05, {atk: 0.5, rel: 0.6, cut: full ? 1500 : 900}), t, k < 6 ? 0.5 : 0.65);
  for (let b = 0; b < 8; b++) {
    if (breath(k) && b >= 4) break;
    const m = ch[b % 3] + 12 + (b % 4 === 3 ? 12 : 0);
    mixInto(out, pluck(mtof(m), 1.1, 0.35), t + (b * BEAT) / 2, k < 6 ? 0.17 : 0.2);
  }
  if ((full || warm) && !breath(k)) {
    mixInto(out, pluck(mtof(MEL[k % 8]), 1.8, 0.6), t, 0.22);
    mixInto(out, pluck(mtof(MEL[(k + 3) % 8]), 1.4, 0.5), t + BEAT * 2, 0.16);
  }
  if (full && !breath(k)) {
    for (let b = 0; b < 4; b++) {
      if (b === 0 || b === 2 || burst) mixInto(out, kick(), t + b * BEAT, burst ? 0.55 : 0.42);
      mixInto(out, hat(), t + b * BEAT + BEAT / 2, 0.07);
    }
  }
  if ((full || warm) && !breath(k)) mixInto(out, lp1(pad([root - 12], BAR, {atk: 0.02, rel: 0.4, cut: 300}), 200), t, warm ? 0.6 : 0.9);
  if (breath(k)) mixInto(out, swell(BAR * 0.5), t + BAR * 0.5, 0.18);
}
for (const k of [6, 15]) {
  mixInto(out, boom(2.4, 90, 32), bar(k), 0.9);
  mixInto(out, crash(2.6), bar(k), 0.2);
}
const fadeFrom = bar(21);
for (let i = Math.round(fadeFrom * SR); i < out.length; i++) out[i] *= Math.max(0, 1 - (i / SR - fadeFrom) / (LEN - fadeFrom));
const raw = join(dir, 'bgm-raw.wav');
writeFileSync(raw, encodeWav(out, SR));
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);
ff(['-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,pan=stereo|c0=c0|c1=c0', join(dir, 'bgm.wav')]);
ff(['-f', 'lavfi', '-i', "aevalsrc='0.55*exp(-3.2*t)*sin(2*PI*(72*t-12*t*t))':s=48000:d=1.6", '-af', 'alimiter=limit=0.5,pan=stereo|c0=c0|c1=c0', join(dir, 'impact.wav')]);
// 消息提示音：两个短正弦「叮咚」
ff(['-f', 'lavfi', '-i', "aevalsrc='0.4*exp(-9*t)*sin(2*PI*1320*t)*lt(t,0.15)+0.4*exp(-7*(t-0.12))*sin(2*PI*990*t)*gte(t,0.12)':s=48000:d=0.6", '-af', 'pan=stereo|c0=c0|c1=c0', join(dir, 'msg.wav')]);
console.log(`wrote ${EP} bgm ${LEN.toFixed(2)}s`);
