import React from 'react';
import {Composition} from 'remotion';
import {DyatlovUa, SCENE_COUNT, Storyboard, TOTAL} from './Shots';

export const DyatlovUaRoot: React.FC = () => (
  <>
    <Composition id="Storyboard" component={Storyboard} width={1920} height={1080} fps={30} durationInFrames={SCENE_COUNT} />
    <Composition id="DyatlovUa" component={DyatlovUa} width={1920} height={1080} fps={30} durationInFrames={Math.ceil(TOTAL * 30)} />
  </>
);
