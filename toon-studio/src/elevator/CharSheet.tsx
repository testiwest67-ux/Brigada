// «Лишний этаж» character sheet: every puppet of the episode (no 3D, fast).
// Row 1: Alisa calm / scared / sitting / from behind / the double, Ded Misha, Mom (from «Не отвечай»).
// Row 2: face close-ups.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Mom} from '../horror/chars';
import {Alisa, ALISA_REST} from './Alisa';
import {Misha} from './Misha';
import {ensureFont, FONT} from '../horror/fonts';

const LIT = {bright: 1, warmRim: 0.5, coldRim: 0.55, cold: 0.2};
const DBL = {...LIT, warmRim: 0.2, cold: 0.45};
const Label: React.FC<{x: number; y: number; t: string}> = ({x, y, t}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill="#e8e6f0">{t}</text>
);
export const ElevatorSheet: React.FC = () => {
  ensureFont();
  const t = useCurrentFrame() / 30;
  const calm = {...ALISA_REST, t, mouth: 0.15, lookX: 0.2};
  const scared = {...ALISA_REST, t, fear: 0.9, mouth: 0.55, hands: 1, lookY: -0.2};
  const sit = {...ALISA_REST, t, fear: 0.4, sit: 1, hands: 0.8};
  const dbl = {...ALISA_REST, t, uncanny: 1, smile: 1};
  const misha = {t, blink: 1, mouth: 0.3, finger: 1, lookX: 0, narrow: 0.4, breathe: 0, torch: 1};
  return (
    <AbsoluteFill style={{background: '#4c5160'}}>
      <svg width={1920} height={1080}>
        <g transform="translate(130 1010) scale(0.3)"><Alisa s={calm} light={LIT} id="a" /></g>
        <g transform="translate(350 1010) scale(0.3)"><Alisa s={scared} light={LIT} id="b" /></g>
        <g transform="translate(570 1010) scale(0.3)"><Alisa s={sit} light={LIT} id="s" /></g>
        <g transform="translate(790 1010) scale(0.3)"><Alisa s={calm} light={LIT} id="c" view="back" /></g>
        <g transform="translate(1010 1010) scale(0.3)"><Alisa s={dbl} light={DBL} id="d" /></g>
        <g transform="translate(1290 1010) scale(0.3)"><Misha s={misha} light={LIT} id="m" /></g>
        <g transform="translate(1630 1010) scale(0.3)"><Mom s={{t, blink: 1, worry: 0, mouth: 0.3, breathe: 0, knock: 0, shiver: 0}} light={LIT} id="mom" /></g>
        <Label x={130} y={1060} t="Алиса" /><Label x={350} y={1060} t="испуг" /><Label x={570} y={1060} t="сидит" />
        <Label x={790} y={1060} t="со спины" /><Label x={1010} y={1060} t="двойник" /><Label x={1290} y={1060} t="дед Миша" /><Label x={1630} y={1060} t="мама" />
        {/* close-ups */}
        <clipPath id="top"><rect x={0} y={0} width={1920} height={420} /></clipPath>
        <g clipPath="url(#top)">
          <g transform="translate(330 840) scale(0.5)"><Alisa s={{...scared, hands: 0}} light={LIT} id="e" crop={-985} /></g>
          <g transform="translate(760 840) scale(0.5)"><Alisa s={dbl} light={DBL} id="f" crop={-985} /></g>
          <g transform="translate(1250 1010) scale(0.5)"><Misha s={{...misha, finger: 0}} light={LIT} id="m2" /></g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
