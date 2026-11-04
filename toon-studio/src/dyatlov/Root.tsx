import React from 'react';
import {Composition} from 'remotion';
import {DyatlovTest, PART} from './TestScene';

export const DyatlovRoot: React.FC = () => (
  <>
    <Composition id="DyatlovTest" component={DyatlovTest} width={1920} height={1080} fps={30} durationInFrames={PART * 2 * 30} />
  </>
);
