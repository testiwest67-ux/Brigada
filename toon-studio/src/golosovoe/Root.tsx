import React from 'react';
import {Composition} from 'remotion';
import {DoubleSheet, KostyaSheet, LooksSheet} from './CharSheet';
import {GolosovoeEpisode, GolosovoeStoryboard} from './Episode';
import {GolosovoeCover} from './Cover';
import {EP_SEC, SHOTS} from './shots';

export const GolosovoeRoot: React.FC = () => (
  <>
    <Composition id="Golosovoe" component={GolosovoeEpisode} width={1080} height={1920} fps={30} durationInFrames={Math.round(EP_SEC * 30)} />
    <Composition id="Storyboard" component={GolosovoeStoryboard} width={1080} height={1920} fps={30} durationInFrames={SHOTS.length} />
    <Composition id="KostyaSheet" component={KostyaSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
    <Composition id="LooksSheet" component={LooksSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
    <Composition id="Cover" component={GolosovoeCover} width={1080} height={1920} fps={30} durationInFrames={1} />
    <Composition id="DoubleSheet" component={DoubleSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
  </>
);
