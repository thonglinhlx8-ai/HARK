import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [,, comp, outDir, ...frames] = process.argv;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: comp});
for (const fr of frames) {
  await renderStill({serveUrl, composition, frame: Number(fr), output: `${outDir}/f${String(fr).padStart(4,'0')}.jpg`, imageFormat: 'jpeg', scale: 0.5});
  console.log('ok', fr);
}
