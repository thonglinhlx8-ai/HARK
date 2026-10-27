// ep56 Hiệu ứng mỏ neo（结构同 ep54，小节数和两个重拍读 layout.json）
// ep54 原注释：配乐代码合成，90 BPM（一小节 ≈2.667 秒），起音 0.30 秒，D 小调，纪录片感。
// 0–6 小节：低 pad + 稀疏钢琴 + 时钟滴答；第 6 小节后半换气 → 第 7 小节重拍（低频重击、打击进入）
// 8–16 档案段：打击轻、低音走动；17–21 现代段加密；22 小节后半换气 → 23 小节第二重拍；24 起只剩 pad + 钢琴，28 起淡出
import {execFileSync} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {boom, crash, lp1, pad, swell, tick} from '../score.mjs';
import {SR, encodeWav, hat, kick, mixInto, mtof, pluck, setSeed} from '../synth.mjs';

const EP = 'ep56-mo-neo';
import {readFileSync} from 'node:fs';
const L = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'src', 'episodes', EP, 'layout.json'), 'utf8'));
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'audio', EP);
mkdirSync(dir, {recursive: true});
const BPM = 90;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const T0 = 0.3;
const bar = (k) => T0 + BAR * k;
const BARS = L.bars;
const LEN = bar(BARS) + 1;
setSeed(56);
const out = new Float32Array(Math.round(LEN * SR));
const CH = [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]]; // Dm Bb Gm A
const ROOT = [38, 34, 31, 33];
const MEL = [74, 72, 69, 70, 69, 65, 67, 69];
const breath = (k) => k === L.hit1 - 1 || k === L.hit2 - 1;
for (let k = 0; k < BARS; k++) {
  const ch = CH[k % 4];
  const t = bar(k);
  const drums = k >= L.hit1 && k < L.hit2;
  const busy = k >= L.hit2 - 7 && k < L.hit2;
  const calm = k >= L.hit2;
  mixInto(out, pad(ch.map((m) => m - 12), breath(k) ? BAR * 0.45 : BAR * 1.05, {atk: 0.7, rel: 0.7, cut: drums ? 1300 : 800}), t, 0.6);
  // 钢琴：每拍一个音（安静段每两拍）
  const step = drums ? 1 : 2;
  for (let b = 0; b < 4; b += step) {
    if (breath(k) && b >= 2) break;
    mixInto(out, pluck(mtof(ch[(b / step) % 3] + 12), 1.6, 0.4), t + b * BEAT, 0.2);
  }
  if ((drums || calm) && !breath(k)) mixInto(out, pluck(mtof(MEL[k % 8]), 2.2, 0.55), t + BEAT * (k % 2 ? 2 : 0), calm ? 0.2 : 0.17);
  if (!drums && !breath(k)) for (let b = 0; b < 4; b++) mixInto(out, tick(b % 2 === 0), t + b * BEAT, 0.12);
  if (drums && !breath(k)) {
    for (let b = 0; b < 4; b++) {
      if (b === 0 || (busy && b === 2)) mixInto(out, kick(), t + b * BEAT, 0.42);
      mixInto(out, hat(), t + b * BEAT + BEAT / 2, busy ? 0.08 : 0.05);
    }
    mixInto(out, lp1(pad([ROOT[k % 4] - 12], BAR, {atk: 0.02, rel: 0.4, cut: 260}), 180), t, 0.9);
  }
  if (breath(k)) mixInto(out, swell(BAR * 0.5), t + BAR * 0.5, 0.17);
}
for (const k of [L.hit1, L.hit2]) {
  mixInto(out, boom(2.6, 85, 30), bar(k), 0.95);
  mixInto(out, crash(2.8), bar(k), 0.18);
}
const fadeFrom = bar(BARS - 3);
for (let i = Math.round(fadeFrom * SR); i < out.length; i++) out[i] *= Math.max(0, 1 - (i / SR - fadeFrom) / (LEN - fadeFrom));
const raw = join(dir, 'bgm-raw.wav');
writeFileSync(raw, encodeWav(out, SR));
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);
ff(['-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,pan=stereo|c0=c0|c1=c0', join(dir, 'bgm.wav')]);
ff(['-f', 'lavfi', '-i', "aevalsrc='0.55*exp(-3*t)*sin(2*PI*(66*t-10*t*t))':s=48000:d=1.8", '-af', 'alimiter=limit=0.5,pan=stereo|c0=c0|c1=c0', join(dir, 'impact.wav')]);
console.log(`wrote ${EP} bgm ${LEN.toFixed(2)}s`);
