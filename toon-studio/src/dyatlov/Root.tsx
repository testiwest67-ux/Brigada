import React from 'react';
import {Composition} from 'remotion';
import {DyatlovTest, PART} from './TestScene';
import {Dyatlov, SCENE_COUNT, Storyboard, TOTAL} from './Shots';

export const DyatlovRoot: React.FC = () => (
  <>
    <Composition id="DyatlovTest" component={DyatlovTest} width={1920} height={1080} fps={30} durationInFrames={PART * 2 * 30} />
    <Composition id="Storyboard" component={Storyboard} width={1920} height={1080} fps={30} durationInFrames={SCENE_COUNT} />
    <Composition id="Dyatlov" component={Dyatlov} width={1920} height={1080} fps={30} durationInFrames={Math.ceil(TOTAL * 30)} />
  </>
);
