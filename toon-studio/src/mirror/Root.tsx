import React from 'react';
import {Composition} from 'remotion';
import {AnyaSheet, MirrorSheet} from './CharSheet';
import {MirrorCover} from './Cover';
import {MirrorEpisode, MirrorStoryboard} from './Episode';
import {EP_SEC, SHOTS} from './shots';

export const MirrorRoot: React.FC = () => (
  <>
    <Composition id="Otrazhenie" component={MirrorEpisode} width={1080} height={1920} fps={30} durationInFrames={Math.round(EP_SEC * 30)} />
    <Composition id="Storyboard" component={MirrorStoryboard} width={1080} height={1920} fps={30} durationInFrames={SHOTS.length} />
    <Composition id="MirrorCover" component={MirrorCover} width={1080} height={1920} fps={30} durationInFrames={1} />
    <Composition id="AnyaSheet" component={AnyaSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
    <Composition id="MirrorSheet" component={MirrorSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
  </>
);
