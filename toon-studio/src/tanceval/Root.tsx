import React from 'react';
import {Composition} from 'remotion';
import VOICE from '../../public/tanceval-chuma/voice.json';
import {makeStory} from '../story/engine';
import {SCENES} from './scenes';
import {TCT} from './Trailer';
import {TcThumb} from './Thumbnail';

export const TC = makeStory({
  dir: 'tanceval-chuma',
  voice: VOICE,
  scenes: SCENES,
  fog: ['c0-09-silhouettes', 'c1-12-curse-vision', 'c3-05-night', 'c5-07-ritual', 'c6-10-map', 'c7-07-question', 'c8-06-trance', 'c9-01-today',
    'c0-08-rhine', 'c5-05-chapel', 'c2-10-saverne'],
  abc: ['СПОРЫНЬЯ', 'МАССОВЫЙ ПСИХОЗ', 'ОБРЯД'],
  red: ['кров', 'проклят', 'умира', 'погиб', 'смерт', 'голод', 'гнев', 'панике', 'ошибк', 'транс', 'запрещ'],
  redExact: ['никто', 'поздно', 'сотни', 'четыреста'],
});

export const TancevalRoot: React.FC = () => (
  <>
    <Composition id="Storyboard" component={TC.Storyboard} width={1920} height={1080} fps={30} durationInFrames={TC.SCENE_COUNT} />
    <Composition id="Tanceval" component={TC.Film} width={1920} height={1080} fps={30} durationInFrames={Math.ceil(TC.TOTAL * 30)} />
    <Composition id="TancevalClean" component={TC.Clean} width={1920} height={1080} fps={30} durationInFrames={Math.ceil(TC.TOTAL * 30)} />
    <Composition id="ThumbA" component={TcThumb} defaultProps={{variant: 'A' as const}} width={1280} height={720} fps={30} durationInFrames={1} />
    <Composition id="ThumbB" component={TcThumb} defaultProps={{variant: 'B' as const}} width={1280} height={720} fps={30} durationInFrames={1} />
    <Composition id="Trailer" component={TCT.Trailer} width={1080} height={1920} fps={30} durationInFrames={Math.round(TCT.TOTAL * 30)} />
    <Composition id="TrailerStoryboard" component={TCT.Storyboard} width={1080} height={1920} fps={30} durationInFrames={TCT.SCENES} />
  </>
);
