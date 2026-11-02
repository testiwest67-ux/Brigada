import React from 'react';
import {Composition} from 'remotion';
import {ElevatorSheet} from './CharSheet';
import {LiftEpisode} from './Episode';
import {EP_SEC} from './shots';
import {Avatar} from '../brand/Avatar';

export const ElevatorRoot: React.FC = () => (
  <>
    <Composition id="LishniyEtazh" component={LiftEpisode} width={1080} height={1920} fps={30} durationInFrames={Math.round(EP_SEC * 30)} />
    <Composition id="Avatar" component={Avatar} width={1080} height={1080} fps={30} durationInFrames={1} />
    <Composition id="LiftSheet" component={ElevatorSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
  </>
);
