import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp01} from '../anim';
import {G} from './theme';

/**
 * 真实人物照片：去色 + 暖褐，边缘渐隐进黑底，像档案馆里的旧照片浮在背景里（用户要求：提到真实人物时「ghép ảnh kiểu nhạt mờ」）。
 * src 放在 public/img/people/；at 出现，out 消失；o = 最大不透明度（主角 0.5，退到背景 0.18）。
 */
export const Portrait: React.FC<{
  f: number;
  src: string;
  at: number;
  out?: number;
  x: number; // 照片中心
  y: number;
  size: number;
  o?: number;
  name?: string;
  sub?: string;
  dim?: number; // 从这一帧起退到背景
}> = ({f, src, at, out, x, y, size, o = 0.5, name, sub, dim}) => {
  const t = f - at;
  if (t < -2 || (out !== undefined && f > out + 20)) return null;
  const vin = clamp01(t / 20);
  const vout = out === undefined ? 1 : 1 - clamp01((f - out) / 18);
  const dimK = dim === undefined ? 1 : 1 - 0.62 * clamp01((f - dim) / 20);
  const a = vin * vout * o * dimK;
  const zoom = 1.08 - 0.08 * clamp01(t / 240); // 慢推 Ken Burns
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          opacity: a,
          filter: `grayscale(1) sepia(0.55) contrast(1.05) brightness(0.9) blur(${(1 - vin) * 12}px)`,
          WebkitMaskImage: 'radial-gradient(ellipse 50% 52% at 50% 46%, #000 38%, rgba(0,0,0,0.5) 62%, transparent 76%)',
          maskImage: 'radial-gradient(ellipse 50% 52% at 50% 46%, #000 38%, rgba(0,0,0,0.5) 62%, transparent 76%)',
        }}
      >
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`}} />
      </div>
      {name ? (
        <div style={{position: 'absolute', left: x - 300, top: y + size * 0.36, width: 600, textAlign: 'center', opacity: vin * vout * dimK * clamp01((t - 10) / 14)}}>
          <div style={{fontFamily: "'Filament Viet Display', serif", fontWeight: 600, fontSize: 40, color: G.goldBright, letterSpacing: 2, textShadow: '0 2px 14px rgba(0,0,0,0.9)'}}>{name}</div>
          {sub ? <div style={{fontFamily: "'Filament Viet Text', serif", fontSize: 22, color: G.ivoryDim, marginTop: 4}}>{sub}</div> : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
