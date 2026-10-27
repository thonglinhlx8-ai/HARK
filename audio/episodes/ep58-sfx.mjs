// ep58 — bộ SFX một-phát (wav) cho bản không lời dẫn. TSX tự đặt từng tiếng theo khung (Sequence + Audio).
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {boom, crash, swell, tick, lp1} from '../score.mjs';
import {SR, encodeWav, filterBuf, kick, mixInto, noise, setSeed, bell, reverb, normalize} from '../synth.mjs';
setSeed(580);
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'audio', 'ep58-su-tu', 'sfx');
mkdirSync(dir, {recursive: true});
const buf = (s) => new Float32Array(Math.round(s * SR));
const save = (name, b, peak = 0.9) => { normalize(b, peak); writeFileSync(join(dir, name + '.wav'), encodeWav(b, SR)); };
// nhịp tim lub-dub trầm
{ const o = buf(0.7); mixInto(o, lp1(kick(), 180), 0, 1); mixInto(o, lp1(kick(), 220), 0.19, 0.7); save('heart', o, 0.8); }
// whoosh chuyển cảnh
{ const o = buf(0.9); const s = swell(0.55, {from: 250, to: 3500}); mixInto(o, s, 0, 1); const tail = buf(0.35); for (let i = 0; i < tail.length; i++) tail[i] = noise() * Math.exp(-i / SR * 12); mixInto(o, filterBuf(tail, 'bp', 900, 0.7), 0.55, 0.6); save('whoosh', o, 0.7); }
// cú đập mạnh: boom + transient + crash
{ const o = buf(2.6); mixInto(o, boom(2.4, 90, 32), 0, 1); mixInto(o, kick(), 0, 0.9); mixInto(o, crash(2.2), 0, 0.12); save('impact', o, 0.95); }
// cú đập nhẹ
{ const o = buf(0.8); mixInto(o, boom(0.7, 120, 50), 0, 0.8); mixInto(o, kick(), 0, 0.6); save('thud', o, 0.8); }
// sư tử gầm: nhiễu lọc thấp + vibrato gầm
{ const n = Math.round(1.6 * SR); const o = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / SR; const f0 = 70 + 40 * Math.sin(t * 2.2) + 25 * Math.sin(t * 31); ph += f0 / SR;
    const env = Math.min(1, t / 0.12) * Math.exp(-Math.max(0, t - 0.5) * 2.4);
    o[i] = (Math.sign(Math.sin(2 * Math.PI * ph)) * 0.5 + noise() * 0.7) * env * (0.6 + 0.4 * Math.sin(2 * Math.PI * ph * 0.5)); }
  const g = filterBuf(o, 'lp', 700); mixInto(g, boom(1.2, 60, 35), 0, 0.5); save('roar', reverb(g, 0.25), 0.85); }
// tích tắc đồng hồ
{ const o = buf(0.12); mixInto(o, tick(true), 0, 1); save('tick', o, 0.6); }
// pop chữ hiện (mềm)
{ const n = Math.round(0.09 * SR); const o = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / SR; ph += (900 - 500 * t / 0.09) / SR; o[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 45); }
  save('pop', o, 0.5); }
// tiếng gõ chữ (từ khoá đỏ)
{ const o = buf(0.5); mixInto(o, bell(1320, 0.5), 0, 0.8); mixInto(o, bell(1980, 0.4), 0, 0.3); save('ding', reverb(o, 0.3), 0.55); }
// bình minh: chuông + swell sáng
{ const o = buf(3.2); mixInto(o, swell(1.2, {from: 400, to: 9000}), 0, 0.35); for (const [k, f] of [[0, 784], [0.18, 988], [0.36, 1175], [0.54, 1568]]) mixInto(o, bell(f, 2.2), 1.1 + k, 0.5); save('sunrise', reverb(o, 0.4), 0.6); }
// tắt đèn: click
{ const o = buf(0.15); for (let i = 0; i < 400; i++) o[i] = noise() * Math.exp(-i / 60); mixInto(o, kick(), 0, 0.2); save('click', filterBuf(o, 'bp', 2500, 1.2), 0.6); }
// tiếng đếm số tách tách
{ const o = buf(0.05); for (let i = 0; i < o.length; i++) o[i] = noise() * Math.exp(-i / SR * 300); save('count', filterBuf(o, 'bp', 4800, 3), 0.45); }
// vó ngựa
{ const o = buf(0.25); mixInto(o, lp1(kick(), 400), 0, 0.7); const c = buf(0.04); for (let i = 0; i < c.length; i++) c[i] = noise() * Math.exp(-i / SR * 150); mixInto(o, filterBuf(c, 'bp', 1200, 1), 0, 0.6); save('hoof', o, 0.55); }
// riser trước cú đập (0,9 s)
{ const o = swell(0.9, {from: 200, to: 8000}); save('riser', o, 0.6); }
console.log('sfx ok');
