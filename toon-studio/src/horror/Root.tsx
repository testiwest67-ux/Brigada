import React from 'react';
import {Composition} from 'remotion';
import {HorrorTest, TEST_SEC} from './HorrorTest';

export const HorrorRoot: React.FC = () => (
  <>
    <Composition id="HorrorTest" component={HorrorTest} width={1080} height={1920} fps={30} durationInFrames={TEST_SEC * 30} />
  </>
);
