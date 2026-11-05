import React from 'react';
import {Composition} from 'remotion';
import {DoublesSheet, KostyaSheet, MomSheet} from './CharSheet';
import {TrainCover} from './Cover';
import {TrainEpisode, TrainStoryboard} from './Episode';
import {EP_SEC, SHOTS} from './shots';

export const TrainRoot: React.FC = () => (
  <>
    <Composition id="PoslednyayaElektrichka" component={TrainEpisode} width={1080} height={1920} fps={30} durationInFrames={Math.round(EP_SEC * 30)} />
    <Composition id="Storyboard" component={TrainStoryboard} width={1080} height={1920} fps={30} durationInFrames={SHOTS.length} />
    <Composition id="TrainCover" component={TrainCover} width={1080} height={1920} fps={30} durationInFrames={1} />
    <Composition id="KostyaSheet" component={KostyaSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
    <Composition id="DoublesSheet" component={DoublesSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
    <Composition id="MomSheet" component={MomSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
  </>
);
