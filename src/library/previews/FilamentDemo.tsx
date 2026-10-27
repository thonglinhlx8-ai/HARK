import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01} from '../anim';
import {curve, Dots, Fan, FilDefs, GrowLine, Pill, Pt, Ring, Spine, Web} from '../filament/charts';
import {BigNumber, camera, Caption, collapse, countTo, FilBg, FilGrain, Footnote, QuoteCard, Slam, SlitLine, slitX, TitleCard} from '../filament/stage';
import {F, FF, isTall} from '../filament/theme';

/**
 * 丝线星图风素材一览：每 150 帧一场，共 7 场。竖屏（library-filament，1080×1920）和横屏（library-filament-wide，1920×1080）共用这一份，
 * 排版按画幅自动换。示例题目是「复利 / 习惯」，文案全部自写，数字仅作版式演示。
 * 转场：0→1 光缝划开；1→2 同一根线接着长（不切）；3→4 整张网收拢成一点；4→5 光缝划开（暖底换冷底）；其余模糊交叉淡化。
 */
const LEN = 150;
export const FILAMENT_DEMO_FRAMES = LEN * 7;

type SceneOpt = {fadeIn?: boolean; fadeOut?: boolean; clip?: string; style?: React.CSSProperties};
const Scene: React.FC<{f: number; i: number; opt?: SceneOpt; children: (t: number) => React.ReactNode}> = ({f, i, opt = {}, children}) => {
  const at = i * LEN;
  const t = f - at;
  if (t < -20 || t > LEN + 20) return null;
  const vin = opt.fadeIn === false ? 1 : clamp01((t + 12) / 24);
  const vout = opt.fadeOut === false ? (t > LEN + 20 ? 0 : 1) : 1 - clamp01((t - LEN + 12) / 24);
  const v = vin * vout;
  return <AbsoluteFill style={{opacity: v, filter: v < 1 ? `blur(${(1 - v) * 8}px)` : undefined, clipPath: opt.clip, ...opt.style}}>{children(t)}</AbsoluteFill>;
};

const Svg: React.FC<{w: number; h: number; children: React.ReactNode}> = ({w, h, children}) => (
  <svg width={w} height={h} style={{position: 'absolute', overflow: 'visible'}}>
    <FilDefs />
    {children}
  </svg>
);

export const FilamentDemo: React.FC = () => {
  const f = useCurrentFrame();
  const {width: w, height: h} = useVideoConfig();
  const tall = isTall(w, h);
  const k = Math.min(w, h) / 1080;
  const cx = w / 2;
  const spineY0 = tall ? h * 0.8 : h * 0.8;
  const spineY1 = tall ? h * 0.24 : h * 0.17;
  const spine: [string, string][] = [
    ['第 1 天', '开始'],
    ['第 30 天', '有点样子'],
    ['第 100 天', '稳下来'],
    ['第 365 天', '变成习惯'],
  ];
  const nodeY = (i: number) => spineY0 - ((spineY0 - spineY1) * (i + 0.5)) / spine.length;
  const lab = 40 * k;
  const cool = f >= LEN * 5 - 10;

  // 0→1、4→5 的光缝：新画面在亮线左边，旧画面在右边
  const s1 = LEN - 10;
  const s5 = LEN * 5 - 10;
  const clipNew = (at: number) => (f >= at && f < at + 24 ? `inset(0 ${Math.max(0, w - slitX(f, at, w))}px 0 0)` : f < at ? 'inset(0 100% 0 0)' : undefined);
  const clipOld = (at: number) => (f >= at && f < at + 24 ? `inset(0 0 0 ${slitX(f, at, w)}px)` : undefined);

  return (
    <AbsoluteFill style={{background: F.bgWarm, fontFamily: FF.cn}}>
      <AbsoluteFill style={{clipPath: f >= s5 && f < s5 + 24 ? clipOld(s5) : undefined, opacity: f >= s5 + 24 ? 0 : 1}}>
        <FilBg f={f} w={w} h={h} tone="warm" />
      </AbsoluteFill>
      {cool ? (
        <AbsoluteFill style={{clipPath: clipNew(s5)}}>
          <FilBg f={f} w={w} h={h} tone="cool" />
        </AbsoluteFill>
      ) : null}

      {/* 0 标题卡 */}
      <Scene f={f} i={0} opt={{fadeOut: false, clip: clipOld(s1), style: f >= s1 + 24 ? {opacity: 0} : undefined}}>
        {(t) => (
          <>
            <Svg w={w} h={h}>
              <GrowLine f={t} at={0} dur={40} pts={[[cx, h * 0.5 + 200 * k], [cx, h * 0.5 + 420 * k]]} width={2} />
            </Svg>
            <TitleCard f={t} at={6} title="复利" en="Compounding" w={w} h={h} />
          </>
        )}
      </Scene>

      {/* 1 一根线：竖直时间轴，节点自下而上亮起 */}
      <Scene f={f} i={1} opt={{fadeIn: false, fadeOut: false, clip: clipNew(s1)}}>
        {(t) =>
          t < LEN + 1 ? (
            <AbsoluteFill style={camera(t, 0, LEN, 0.03)}>
              <Svg w={w} h={h}>
                <Spine f={t} at={4} x={cx} y0={spineY0} y1={spineY1} items={spine} gap={16} size={lab} />
              </Svg>
              <Caption f={t} at={12} text="我们以为，坚持是一根不能断的线。" w={w} h={h} />
            </AbsoluteFill>
          ) : null
        }
      </Scene>

      {/* 2 同一根线接着演：第二个节点被红字砸断，旁边长出几条新枝 */}
      <Scene f={f} i={2} opt={{fadeIn: false}}>
        {(t) => (
          <AbsoluteFill style={camera(t, 0, LEN, 0.05, [0, tall ? 80 * k : 40 * k])}>
            <Svg w={w} h={h}>
              <g opacity={1 - 0.65 * clamp01((t - 10) / 14)}>
                <Spine f={t + 200} at={4} x={cx} y0={spineY0} y1={spineY1} items={spine} gap={16} size={lab} />
              </g>
              <Fan
                f={t}
                at={34}
                x={cx}
                y={nodeY(1)}
                size={34 * k}
                main={1}
                branches={[
                  {a: -160, len: 300 * k, label: '换个时间', bend: 0.2},
                  {a: -125, len: 360 * k, label: '降低难度', bend: 0.15},
                  {a: -55, len: 340 * k, label: '找个同伴', bend: -0.15},
                  {a: -18, len: 290 * k, label: '先歇两天', bend: -0.2},
                  {a: 150, len: 260 * k, label: '换种练法', bend: -0.2},
                ]}
              />
            </Svg>
            <Slam f={t} at={10} text="断了" x={cx - 120 * k} y={nodeY(1) - 110 * k} size={150 * k} />
            <Caption f={t} at={0} text="第 21 天，断了。" w={w} h={h} />
          </AbsoluteFill>
        )}
      </Scene>

      {/* 3 织网：从断点向外长满一张网，少数边是断开的红线；120 帧起整张网收拢成一点 */}
      <Scene f={f} i={3} opt={{fadeOut: false}}>
        {(t) =>
          t < LEN + 2 ? (
            <AbsoluteFill style={{...camera(t, 0, 110, 0.06), ...collapse(t, 124, 22, [50, 50])}}>
              <Svg w={w} h={h}>
                <Web f={t} at={4} w={w} h={h} center={[cx, h * 0.52]} step={170 * k} spread={60} broken={0.06} collapseAt={112} />
                <GrowLine f={t} at={0} dur={1} pts={[[cx, h * 0.52], [cx, h * 0.52 + 1]]} width={4} />
              </Svg>
              <Caption f={t} at={8} text="可每一次重来，都在织一张网。" w={w} h={h} out={112} />
            </AbsoluteFill>
          ) : null
        }
      </Scene>

      {/* 4 刻度环：从上一场收拢出来的那一点重新长成一个环 */}
      <Scene f={f} i={4} opt={{fadeIn: false, fadeOut: false, clip: clipOld(s5), style: f >= s5 + 24 ? {opacity: 0} : undefined}}>
        {(t) => (
          <>
            <Svg w={w} h={h}>
              <Ring f={t} at={4} x={cx} y={h * 0.52} r={(tall ? 300 : 280) * k} value="66 天" title="养成一个习惯" sub="示例数据 · 仅作版式演示" mark={0.72} markLabel="第 21 天" />
            </Svg>
            <Caption f={t} at={10} text="它只是一个平均数，不是截止日期。" w={w} h={h} />
            <Footnote f={t} at={40} text="数字为虚构示例，仅用于演示脚注版式" w={w} h={h} />
          </>
        )}
      </Scene>

      {/* 5 冷底：消息气泡起点 → 一串点连成线 → 右上角粉红大数字计数 */}
      <Scene f={f} i={5} opt={{fadeIn: false, clip: clipNew(s5)}}>
        {(t) => {
          const x0 = tall ? w * 0.22 : w * 0.16;
          const y0 = tall ? h * 0.62 : h * 0.6;
          const x1 = tall ? w * 0.88 : w * 0.82;
          const y1 = tall ? h * 0.42 : h * 0.3;
          const path = curve([x0 + 120 * k, y0], [x0 + (x1 - x0) * 0.75, y0 + 30 * k], [x1, y1], 60);
          const dots: Pt[] = [0.12, 0.27, 0.42, 0.56, 0.7, 0.82, 0.93].map((p) => path[Math.round(p * 60)]);
          return (
            <>
              <Svg w={w} h={h}>
                <GrowLine f={t} at={20} dur={60} pts={path} width={2.4} color={F.line} />
                <Dots f={t} at={26} pts={dots} gap={7} r={5} />
              </Svg>
              <Pill f={t} at={8} x={x0} y={y0} text="今天练了吗？" size={34 * k} sub="DAY 1" />
              <BigNumber f={t} at={40} value={countTo(t, 40, 70, 1, 37.8, 1)} label="每天进步 1%，一年以后" sub="1.01 ^ 365" x={tall ? w * 0.5 : w * 0.8} y={tall ? h * 0.2 : h * 0.06} size={150 * k} color={F.pink} />
              <Caption f={t} at={14} text="每天【多一点】，一年后差得很远。" w={w} h={h} hiColor={F.gold} y={tall ? h * 0.78 : undefined} />
            </>
          );
        }}
      </Scene>

      {/* 6 引文卡 */}
      <Scene f={f} i={6} opt={{fadeOut: false}}>
        {(t) => <QuoteCard f={t} at={6} who="示例人物" meta="Exemplum · Proverbium" original="Gutta cavat lapidem." text="水滴石穿。" w={w} h={h} />}
      </Scene>

      <SlitLine f={f} at={s1} w={w} h={h} />
      <SlitLine f={f} at={s5} w={w} h={h} />
      <FilGrain />
    </AbsoluteFill>
  );
};
