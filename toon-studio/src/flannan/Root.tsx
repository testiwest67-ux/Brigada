import React from 'react';
import {Composition} from 'remotion';
import VOICE from '../../public/flannan/voice.json';
import {makeStory} from '../story/engine';
import {SCENES} from './scenes';
import {FLThumb} from './Thumbnail';

const SEA = ['f0-01-ship-approach', 'f0-02-flare', 'f4-01-hesperus', 'f3-03-archtor', 'f3-05-hesperus-port'];

export const FL = makeStory({
  dir: 'flannan',
  voice: VOICE,
  scenes: SCENES,
  sea: SEA,
  fog: ['f1-01-islands-aerial', 'f3-04-dark-light', 'f8-03-memorial-light', 'f8-04-three-figures', 'f8-05-choice', 'f2-04-routine-night', 'f1-04-lighthouse-dusk'],
  abc: ['ОГРОМНАЯ ВОЛНА', 'ЦЕПОЧКА', 'ССОРА'],
  red: ['исчез', 'никого', 'никто', 'плащ', 'волн', 'выдумк', 'огонь', 'ссор', 'шторм'],
  redExact: ['трое', 'один', 'тишина'],
});

export const FlannanRoot: React.FC = () => (
  <>
    <Composition id="Storyboard" component={FL.Storyboard} width={1920} height={1080} fps={30} durationInFrames={FL.SCENE_COUNT} />
    <Composition id="ThumbA" component={FLThumb} defaultProps={{variant: 'A' as const}} width={1280} height={720} fps={30} durationInFrames={1} />
    <Composition id="ThumbB" component={FLThumb} defaultProps={{variant: 'B' as const}} width={1280} height={720} fps={30} durationInFrames={1} />
    <Composition id="Flannan" component={FL.Film} width={1920} height={1080} fps={30} durationInFrames={Math.ceil(FL.TOTAL * 30)} />
  </>
);
