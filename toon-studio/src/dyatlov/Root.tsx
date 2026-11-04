import React from 'react';
import {Composition} from 'remotion';
import {DyatlovTest, PART} from './TestScene';
import {Dyatlov, SCENE_COUNT, Storyboard, TOTAL} from './Shots';
import {Thumbnail} from './Thumbnail';

export const DyatlovRoot: React.FC = () => (
  <>
    <Composition id="DyatlovTest" component={DyatlovTest} width={1920} height={1080} fps={30} durationInFrames={PART * 2 * 30} />
    <Composition id="Storyboard" component={Storyboard} width={1920} height={1080} fps={30} durationInFrames={SCENE_COUNT} />
    <Composition id="ThumbA" component={Thumbnail} defaultProps={{variant: 'A' as const}} width={1280} height={720} fps={30} durationInFrames={1} />
    <Composition id="ThumbB" component={Thumbnail} defaultProps={{variant: 'B' as const}} width={1280} height={720} fps={30} durationInFrames={1} />
    <Composition id="ThumbC" component={Thumbnail} defaultProps={{variant: 'C' as const}} width={1280} height={720} fps={30} durationInFrames={1} />
    <Composition id="Dyatlov" component={Dyatlov} width={1920} height={1080} fps={30} durationInFrames={Math.ceil(TOTAL * 30)} />
  </>
);
