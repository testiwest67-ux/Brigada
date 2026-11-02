import React from 'react';
import {Composition} from 'remotion';
import {DimaSheet, PeopleSheet} from './CharSheet';

export const ShiftRoot: React.FC = () => (
  <>
    <Composition id="DimaSheet" component={DimaSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
    <Composition id="PeopleSheet" component={PeopleSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
  </>
);
