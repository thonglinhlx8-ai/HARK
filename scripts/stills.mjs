// node scripts/stills.mjs <compId> <outDir> <everySec> [fromSec] [toSec] — bundle 1 lần, render still mỗi N giây (scale 0.4)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
const [id, out, every = '2', from = '0', to = '9999'] = process.argv.slice(2);
mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id});
const last = comp.durationInFrames - 1;
for (let s = Number(from); s <= Math.min(Number(to), last / comp.fps); s += Number(every)) {
  const frame = Math.min(last, Math.round(s * comp.fps));
  await renderStill({serveUrl, composition: comp, frame, output: path.join(out, `f${String(frame).padStart(5, '0')}.jpg`), imageFormat: 'jpeg', scale: 0.4});
}
console.log('done');
