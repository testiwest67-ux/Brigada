import React from 'react';
import {Composition} from 'remotion';
import {ElevatorSheet} from './CharSheet';
import {LiftEpisode} from './Episode';
import {EP_SEC} from './shots';
import {Avatar} from '../brand/Avatar';
import {Banner, BannerGuides} from '../brand/Banner';

export const ElevatorRoot: React.FC = () => (
  <>
    <Composition id="LishniyEtazh" component={LiftEpisode} width={1080} height={1920} fps={30} durationInFrames={Math.round(EP_SEC * 30)} />
    <Composition id="Avatar" component={Avatar} width={1080} height={1080} fps={30} durationInFrames={1} />
    <Composition id="Banner" component={Banner} width={2560} height={1440} fps={30} durationInFrames={1} />
    <Composition id="BannerGuides" component={BannerGuides} width={2560} height={1440} fps={30} durationInFrames={1} />
    <Composition id="LiftSheet" component={ElevatorSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
  </>
);
