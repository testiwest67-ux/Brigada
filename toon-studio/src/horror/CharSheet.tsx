// Character sheet: every puppet side by side, for design checks (no 3D, renders fast).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Tema} from './Tema';
import {Fist, Grandma, Mom, ReachHand, Thing} from './chars';

const LIT = {bright: 1, warmRim: 0.6, coldRim: 0.5, cold: 0.2};
export const CharSheet: React.FC = () => {
  const f = useCurrentFrame(), t = f / 30;
  const tema = {t, blink: 1, lookX: 0, lookY: 0, fear: 0.8, mouth: 0.3, breathe: 0, hands: 0, turn: 0, tremble: 0};
  return (
    <AbsoluteFill style={{background: '#55596a'}}>
      <svg width={1920} height={1080}>
        <g transform="translate(150 1040) scale(0.37)"><Tema s={tema} light={LIT} id="a" /></g>
        <g transform="translate(400 1040) scale(0.37)"><Tema s={tema} light={LIT} id="b" view="back" /></g>
        <g transform="translate(680 1040) scale(0.37)"><Mom s={{t, blink: 1, worry: 0.8, mouth: 0.4, breathe: 0, knock: 1, shiver: 0}} light={LIT} /></g>
        <g transform="translate(980 1040) scale(0.37)"><Grandma s={{t, blink: 1, worry: 0.4, mouth: 0.2, breathe: 0, shh: 1, narrow: 0.4}} light={LIT} /></g>
        <g transform="translate(1340 1040) scale(0.37)"><Thing s={{t, mouth: 0.4, smile: 1, tilt: 14, sway: 0, eyes: 1, breathe: 0}} light={{...LIT, warmRim: 0.3, coldRim: 0.6}} /></g>
        <g transform="translate(1720 300) scale(0.5)"><Fist sleeve="#b49a76" /></g>
        <g transform="translate(1720 600) scale(0.5)"><ReachHand curl={0.2} /></g>
      </svg>
    </AbsoluteFill>
  );
};
