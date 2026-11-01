// One <Composition> per episode. Add new episodes here (2D and 3D, 16:9 and 9:16).
import React from 'react';
import {Composition} from 'remotion';
import {Example, EX_FPS, EX_SEC} from './toon/episodes/Example';
import {Example3D} from './toon/episodes/Example3D';
import {StickExample, StickPoses, InfoCards, SX_FPS, SX_SEC} from './toon/episodes/StickExample';

export const Root: React.FC = () => (
  <>
    <Composition id="Example" component={Example} width={1920} height={1080} fps={EX_FPS} durationInFrames={Math.round(EX_SEC * EX_FPS)} defaultProps={{vertical: false}} />
    <Composition id="ExampleVertical" component={Example} width={1080} height={1920} fps={EX_FPS} durationInFrames={Math.round(EX_SEC * EX_FPS)} defaultProps={{vertical: true}} />
    <Composition id="Example3D" component={Example3D} width={1920} height={1080} fps={EX_FPS} durationInFrames={Math.round(EX_SEC * EX_FPS)} />
    <Composition id="StickExample" component={StickExample} width={1920} height={1080} fps={SX_FPS} durationInFrames={Math.round(SX_SEC * SX_FPS)} />
    <Composition id="StickPoses" component={StickPoses} width={1920} height={1080} fps={30} durationInFrames={30} />
    <Composition id="InfoCards" component={InfoCards} width={1920} height={1080} fps={30} durationInFrames={240} />
  </>
);
