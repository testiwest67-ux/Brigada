import React from 'react';
import {Composition} from 'remotion';
import {HorrorTest, TEST_SEC} from './HorrorTest';
import {CharSheet} from './CharSheet';
import {Episode} from './Episode';
import {EP_SEC} from './shots';

export const HorrorRoot: React.FC = () => (
  <>
    <Composition id="NeOtvechai" component={Episode} width={1080} height={1920} fps={30} durationInFrames={EP_SEC * 30} />
    <Composition id="HorrorTest" component={HorrorTest} width={1080} height={1920} fps={30} durationInFrames={TEST_SEC * 30} />
    <Composition id="CharSheet" component={CharSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
  </>
);
