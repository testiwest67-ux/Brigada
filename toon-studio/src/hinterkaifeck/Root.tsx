import React from 'react';
import {Composition} from 'remotion';
import VOICE from '../../public/hinterkaifeck/voice.json';
import {makeStory} from '../story/engine';
import {SCENES} from './scenes';
import {HKT} from './Trailer';
import {HkThumb} from './Thumbnail';

export const HK = makeStory({
  dir: 'hinterkaifeck',
  voice: VOICE,
  scenes: SCENES,
  snow: {'h0-01-farm-forest': [0.6, 0.3], 'h0-02-door-dawn': [0.4, 0.2], 'h0-03-footprints': [0.5, 0.2], 'h0-04-no-return': [0.6, 0.3],
    'h3-03-winter': [1, 0.5], 'h3-10-snow-falls': [1, 0.2], 'h3-11-tracks-close': [0.5, 0.2], 'h3-12-circle-house': [0.6, 0.3],
    'h9-03-last-tracks': [0.7, 0.3], 'h8-05-pow-camp': [0.8, 0.4]},
  drift: ['h0-04-no-return', 'h3-03-winter'],
  fog: ['h3-09-man-trees', 'h4-12-night-farm', 'h0-11-title', 'h9-04-final-farm', 'h8-06-version-c', 'h9-01-empty-field', 'h3-01-maid-leaves', 'h8-04-version-b'],
  abc: ['СОСЕД', 'МУЖ С ВОЙНЫ', 'ЧУЖАК ИЗ ЛЕСА'],
  red: ['следы', 'чердак', 'шаги', 'кирк', 'никого', 'убий', 'кров', 'нераскрыт'],
  redExact: ['никто', 'нет', 'один', 'четверо', 'двоих'],
});

export const HinterkaifeckRoot: React.FC = () => (
  <>
    <Composition id="Storyboard" component={HK.Storyboard} width={1920} height={1080} fps={30} durationInFrames={HK.SCENE_COUNT} />
    <Composition id="Hinterkaifeck" component={HK.Film} width={1920} height={1080} fps={30} durationInFrames={Math.ceil(HK.TOTAL * 30)} />
    <Composition id="ThumbA" component={HkThumb} defaultProps={{variant: 'A' as const}} width={1280} height={720} fps={30} durationInFrames={1} />
    <Composition id="ThumbB" component={HkThumb} defaultProps={{variant: 'B' as const}} width={1280} height={720} fps={30} durationInFrames={1} />
    <Composition id="Trailer" component={HKT.Trailer} width={1080} height={1920} fps={30} durationInFrames={Math.round(HKT.TOTAL * 30)} />
    <Composition id="TrailerStoryboard" component={HKT.Storyboard} width={1080} height={1920} fps={30} durationInFrames={HKT.SCENES} />
  </>
);
