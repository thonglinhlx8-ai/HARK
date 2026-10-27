// ep58 Con sư tử không tới — nhạc nền = bài user gửi (public/audio/ep58-su-tu/user-bgm.mp3, ~112 BPM).
// Phách thật đọc bằng librosa -> src/episodes/ep58-su-tu/beats.json; ep58-layout.py đặt lời/chuyển cảnh lên phách đó.
// Ở đây: cắt bài theo layout.end, fade 3 s cuối, chồng boom + crash nhẹ đúng 4 cú nhấn (hits), master -16 LUFS.
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {boom, crash} from '../score.mjs';
import {SR, encodeWav, mixInto} from '../synth.mjs';

const EP = 'ep58-su-tu';
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const L = JSON.parse(readFileSync(join(root, 'src', 'episodes', EP, 'layout.json'), 'utf8'));
const B = JSON.parse(readFileSync(join(root, 'src', 'episodes', EP, 'beats.json'), 'utf8'));
const dir = join(root, 'public', 'audio', EP);
const LEN = L.end + 0.5;
const fx = new Float32Array(Math.round(LEN * SR));
for (const [k, g] of []) {
  mixInto(fx, boom(2.6, 85, 30), B[4 * k], g);
  mixInto(fx, crash(2.8), B[4 * k], 0.12 * g);
}
const fxw = join(dir, 'bgm-hits.wav');
writeFileSync(fxw, encodeWav(fx, SR));
const fade = (LEN - 3).toFixed(2);
// layout.splice = [A, C]: bỏ đoạn nhạc A→C (đúng vạch ô nhịp) để video ngắn lại mà drop 2 vẫn đúng chỗ
const SP = L.splice;
const SRC = SP
  ? `[0:a]asplit[s1][s2];[s1]atrim=0:${SP[0]},afade=t=out:st=${(SP[0] - 0.03).toFixed(3)}:d=0.03[p1];[s2]atrim=start=${SP[1]},asetpts=PTS-STARTPTS,afade=t=in:d=0.03[p2];[p1][p2]concat=n=2:v=0:a=1[cat];[cat]`
  : '[0:a]';
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', join(dir, 'user-bgm.mp3'), '-i', fxw, '-filter_complex',
  `${SRC}atrim=0:${LEN},aresample=48000,loudnorm=I=-16:TP=-1.5:LRA=11[m];[1:a]aresample=48000,pan=stereo|c0=c0|c1=c0[h];[m][h]amix=inputs=2:normalize=0,afade=t=out:st=${fade}:d=3[o]`,
  '-map', '[o]', '-ar', '48000', '-ac', '2', join(dir, 'bgm.wav')]);
console.log(`wrote ${EP} bgm ${LEN.toFixed(2)}s from user track, hits at bars ${L.hits}`);
