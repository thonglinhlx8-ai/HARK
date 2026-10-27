// ep59 — bộ SFX (kế thừa ep58 + tiếng dây đứt, lấp lánh, chuông nút) một-phát (wav) cho bản không lời dẫn. TSX tự đặt từng tiếng theo khung (Sequence + Audio).
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {boom, crash, swell, tick, lp1} from '../score.mjs';
import {SR, encodeWav, filterBuf, kick, mixInto, noise, setSeed, bell, reverb, normalize} from '../synth.mjs';
setSeed(590);
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'audio', 'ep59-tam-luoi', 'sfx');
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

// dây đứt: tưng một tiếng kim loại rơi cao độ + tiếng búng nhiễu
{ const n = Math.round(0.6 * SR); const o = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / SR; const f0 = 1400 * Math.exp(-t * 3) + 300; ph += f0 / SR; o[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 9) * 0.6 + (i < 900 ? noise() * Math.exp(-i / 120) : 0); }
  save('snap', reverb(filterBuf(o, 'hp', 300, 0.7), 0.2), 0.7); }
// lấp lánh khi lưới mọc: chuỗi chuông cao lăn tăn
{ const o = buf(2.4); const notes = [1568, 1760, 2093, 2349, 2637, 3136, 2637, 3520];
  notes.forEach((fq, k) => mixInto(o, bell(fq, 1.2), k * 0.11 + Math.random() * 0.03, 0.35 - k * 0.02));
  mixInto(o, swell(1.2, {from: 2000, to: 9000}), 0, 0.12); save('shimmer', reverb(o, 0.45), 0.5); }
// chuông nút nhỏ (khi một nút sáng)
{ const o = buf(0.9); mixInto(o, bell(1760, 0.8), 0, 0.7); mixInto(o, bell(2640, 0.5), 0, 0.2); save('ping', reverb(o, 0.35), 0.45); }
// hút lại (thu lưới thành một điểm)
{ const s = swell(0.7, {from: 6000, to: 300}); const o = buf(0.9); mixInto(o, s, 0, 1); save('suck', o, 0.6); }
// hợp âm ấm khi vá lại / hồi phục
{ const o = buf(3); for (const [k, fq] of [[0, 392], [0.05, 494], [0.1, 587], [0.15, 784]]) mixInto(o, bell(fq, 2.6), k, 0.4); save('heal', reverb(o, 0.5), 0.55); }

// cú ĐÓNG DẤU chữ đỏ (kiểu bản gốc): sub boom + kick + tiếng rắc giòn (nhiễu méo lọc dải) + đuôi vang ngắn
{ const o = buf(1.6);
  mixInto(o, boom(1.4, 120, 36), 0, 1);
  mixInto(o, kick(), 0, 1);
  mixInto(o, kick(), 0.004, 0.5);
  const cr = buf(0.22); for (let i = 0; i < cr.length; i++) { const t = i / SR; cr[i] = Math.tanh(noise() * 3) * Math.exp(-t * 22); }
  mixInto(o, filterBuf(cr, 'bp', 2600, 0.7), 0, 0.9);
  mixInto(o, filterBuf(cr, 'hp', 5000, 0.7), 0, 0.5);
  const body = buf(0.3); let ph = 0; for (let i = 0; i < body.length; i++) { const t = i / SR; ph += (220 * Math.exp(-t * 8) + 70) / SR; body[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 10); }
  mixInto(o, body, 0, 0.6);
  save('stamp', reverb(o, 0.18), 0.97); }
// chữ rơi xuống trước cú dấu (0,22 s, cao → thấp)
{ const o = swell(0.22, {from: 5000, to: 600}); save('dropin', o, 0.55); }
// sợi chỉ cong lại thành vòng: quét tông mượt
{ const o = buf(1.4); mixInto(o, swell(1.0, {from: 300, to: 2400}), 0, 0.5); for (const [k, fq] of [[0.7, 1175], [0.85, 1568]]) mixInto(o, bell(fq, 0.6), k, 0.35); save('curl', reverb(o, 0.35), 0.55); }
console.log('sfx ok');
