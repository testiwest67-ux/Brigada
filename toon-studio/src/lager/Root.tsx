import React from 'react';
import {Composition} from 'remotion';
import {CounsellorSheet, SquadSheet, SuspectsSheet} from './CharSheet';
import {LagerEpisode, LagerStoryboard} from './Episode';
import {EP_SEC, SHOTS} from './shots';

export const LagerRoot: React.FC = () => (
  <>
    <Composition id="KtoLishniy" component={LagerEpisode} width={1080} height={1920} fps={30} durationInFrames={Math.round(EP_SEC * 30)} />
    <Composition id="Storyboard" component={LagerStoryboard} width={1080} height={1920} fps={30} durationInFrames={SHOTS.length} />
    <Composition id="CounsellorSheet" component={CounsellorSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
    <Composition id="SuspectsSheet" component={SuspectsSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
    <Composition id="SquadSheet" component={SquadSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
  </>
);
