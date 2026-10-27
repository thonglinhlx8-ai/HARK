import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [id,out,...secs]=process.argv.slice(2);
const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts')});
const comp=await selectComposition({serveUrl,id});
for(const s of secs){const fr=Math.round(Number(s)*30);await renderStill({serveUrl,composition:comp,frame:fr,output:`${out}/t${s}.jpg`,imageFormat:'jpeg',scale:0.4});}
console.log('ok');
