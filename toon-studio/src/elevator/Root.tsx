import React from 'react';
import {Composition} from 'remotion';
import {ElevatorSheet} from './CharSheet';

export const ElevatorRoot: React.FC = () => (
  <>
    <Composition id="LiftSheet" component={ElevatorSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
  </>
);
