import React from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile} from 'remotion';
import {FilGrain} from '../filament/stage';
import {F} from '../filament/theme';

/** Bìa kênh chuẩn (chốt 2026-10-23, Ep62): nền tối + vòng sáng tròn, nhãn nhỏ, 2 dòng hook, cụm khoá đỏ rất to, tên khái niệm nghiêng. */
if (typeof document !== 'undefined') {
  const h = delayRender('cover fonts');
  Promise.all([
    new FontFace('Cover Display', `url(${staticFile('fonts/ep58/PlayfairDisplay.ttf')})`, {weight: '400 900'}).load().then((l) => document.fonts.add(l)),
    new FontFace('Cover Sub', `url(${staticFile('fonts/ep58/BeVietnamPro-ExtraBold.ttf')})`).load().then((l) => document.fonts.add(l)),
  ]).catch(() => undefined).finally(() => continueRender(h));
}
const DISP = "'Cover Display', serif";
const W = 1080;
const H = 1920;
const cx = W / 2;
const fr = (x: number) => x - Math.floor(x);
const dust = Array.from({length: 70}, (_, k) => {
  const a = Math.sin(k * 12.9898) * 43758.5453;
  const b = Math.sin(k * 78.233) * 12345.678;
  const ang = fr(a) * Math.PI * 2;
  const rad = 120 + fr(b) * 520;
  return {x: cx + Math.cos(ang) * rad, y: 960 + Math.sin(ang) * rad * 1.1, r: 1 + fr(a * 3) * 2.6, o: 0.15 + fr(b * 7) * 0.5};
});

export const HookCover: React.FC<{kicker?: string; lines: string[]; hit: string; hitSize?: number; concept?: string}> = ({kicker = 'TÂM LÝ HỌC', lines, hit, hitSize = 200, concept}) => {
  const goldLine = 'linear-gradient(90deg, rgba(242,196,109,0), rgba(242,196,109,0.85), rgba(242,196,109,0))';
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #1a120c 0%, #0c0807 55%, #050303 100%)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: cx - 700, top: 960 - 700, width: 1400, height: 1400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,220,160,0.42) 0%, rgba(236,170,92,0.22) 26%, rgba(140,80,32,0.08) 48%, rgba(9,6,5,0) 66%)'}} />
      {[300, 400, 520].map((r, k) => (
        <div key={r} style={{position: 'absolute', left: cx - r, top: 960 - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `${k === 1 ? 2 : 1}px solid rgba(242,196,109,${[0.18, 0.3, 0.1][k]})`}} />
      ))}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        {dust.map((d, k) => <circle key={k} cx={d.x} cy={d.y} r={d.r} fill="#ffdca0" opacity={d.o} />)}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28}}>
        <div style={{width: 110, height: 2, background: goldLine}} />
        <div style={{fontFamily: "'Cover Sub', sans-serif", fontSize: 32, letterSpacing: 12, color: 'rgba(242,196,109,0.9)'}}>{kicker}</div>
        <div style={{width: 110, height: 2, background: goldLine}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', whiteSpace: 'nowrap'}}>
        <div style={{fontFamily: DISP, fontWeight: 500, fontSize: 92, lineHeight: 1.22, color: '#f6efe2', textShadow: '0 4px 30px rgba(0,0,0,0.8)'}}>
          {lines.map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <div style={{marginTop: 6, fontFamily: DISP, fontWeight: 900, fontSize: hitSize, lineHeight: 1.05, letterSpacing: 2, color: F.redHot, textShadow: '0 0 30px rgba(255,70,45,0.65), 0 0 90px rgba(255,50,30,0.35)'}}>{hit}</div>
      </div>
      {concept && <>
        <div style={{position: 'absolute', left: cx - 160, top: 1250, width: 320, height: 2, background: goldLine}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1285, textAlign: 'center', fontFamily: DISP, fontStyle: 'italic', fontWeight: 400, fontSize: 46, color: 'rgba(242,196,109,0.92)'}}>{concept}</div>
      </>}
      <FilGrain opacity={0.06} />
    </AbsoluteFill>
  );
};
