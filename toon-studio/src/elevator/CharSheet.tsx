// «Лишний этаж» character sheet: Alisa calm / scared / from behind / the double, plus face close-ups (no 3D, fast).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Alisa, ALISA_REST} from './Alisa';

const LIT = {bright: 1, warmRim: 0.5, coldRim: 0.55, cold: 0.2};
export const ElevatorSheet: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const calm = {...ALISA_REST, t, mouth: 0.15, lookX: 0.2};
  const scared = {...ALISA_REST, t, fear: 0.9, mouth: 0.55, hands: 1, lookY: -0.2};
  const dbl = {...ALISA_REST, t, uncanny: 1, smile: 1};
  return (
    <AbsoluteFill style={{background: '#4c5160'}}>
      <svg width={1920} height={1080}>
        <g transform="translate(170 1040) scale(0.36)"><Alisa s={calm} light={LIT} id="a" /></g>
        <g transform="translate(440 1040) scale(0.36)"><Alisa s={scared} light={LIT} id="b" /></g>
        <g transform="translate(710 1040) scale(0.36)"><Alisa s={calm} light={LIT} id="c" view="back" /></g>
        <g transform="translate(980 1040) scale(0.36)"><Alisa s={dbl} light={{...LIT, warmRim: 0.2, cold: 0.45}} id="d" /></g>
        <g transform="translate(1340 1000) scale(0.62)"><Alisa s={{...scared, hands: 0}} light={LIT} id="e" crop={-985} /></g>
        <g transform="translate(1720 1000) scale(0.62)"><Alisa s={dbl} light={{...LIT, warmRim: 0.2, cold: 0.45}} id="f" crop={-985} /></g>
      </svg>
    </AbsoluteFill>
  );
};
