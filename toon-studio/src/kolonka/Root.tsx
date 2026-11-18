import React from 'react';
import {Composition} from 'remotion';
import {MaxSheet, TenantSheet} from './CharSheet';
import {KolonkaCover} from './Cover';
import {KolonkaEpisode, KolonkaStoryboard} from './Episode';
import {EP_SEC, SHOTS} from './shots';

export const KolonkaRoot: React.FC = () => (
  <>
    <Composition id="Kolonka" component={KolonkaEpisode} width={1080} height={1920} fps={30} durationInFrames={Math.round(EP_SEC * 30)} />
    <Composition id="Storyboard" component={KolonkaStoryboard} width={1080} height={1920} fps={30} durationInFrames={SHOTS.length} />
    <Composition id="Cover" component={KolonkaCover} width={1080} height={1920} fps={30} durationInFrames={1} />
    <Composition id="MaxSheet" component={MaxSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
    <Composition id="TenantSheet" component={TenantSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
  </>
);
