import React from 'react';
import {Composition} from 'remotion';
import {DimaSheet, PeopleSheet} from './CharSheet';
import {ShiftEpisode} from './Episode';
import {EP_SEC} from './shots';

export const ShiftRoot: React.FC = () => (
  <>
    <Composition id="NochnayaSmena" component={ShiftEpisode} width={1080} height={1920} fps={30} durationInFrames={Math.round(EP_SEC * 30)} />
    <Composition id="DimaSheet" component={DimaSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
    <Composition id="PeopleSheet" component={PeopleSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
  </>
);
