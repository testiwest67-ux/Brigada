import React from 'react';
import {Composition} from 'remotion';
import {RadistSheet, RadistSheet2, TaylorSheet, TaylorSheet2} from './CharSheet';

export const Flight19Root: React.FC = () => (
  <>
    <Composition id="TaylorSheet" component={TaylorSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
    <Composition id="RadistSheet" component={RadistSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
    <Composition id="TaylorSheet2" component={TaylorSheet2} width={1920} height={1080} fps={30} durationInFrames={30} />
    <Composition id="RadistSheet2" component={RadistSheet2} width={1920} height={1080} fps={30} durationInFrames={30} />
  </>
);
