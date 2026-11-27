import React from 'react';
import {Composition} from 'remotion';
import VOICE from '../../public/roopkund/voice.json';
import {makeStory} from '../story/engine';
import {SCENES} from './scenes';
import {RKT} from './Trailer';
import {RkThumb} from './Thumbnail';

export const RK = makeStory({
  dir: 'roopkund',
  voice: VOICE,
  scenes: SCENES,
  snow: {'r0-02-lake-ice': [1, 0.6], 'r1-08-rock-snow': [0.6, 0.5], 'r1-10-blizzard': [1.2, 0.9], 'r1-11-lake-frozen': [0.8, 0.4],
    'r1-09-steep-climb': [0.6, 0.4], 'r2-07-soldiers-snow': [1, 0.6], 'r4-08-hail': [1.4, 0.3], 'r4-07-sky-darkens': [0.6, 0.6],
    'r8-03-hail-pilgrims': [1.3, 0.5], 'r8-09-sudden-storm': [1, 0.7], 'r8-10-fallen': [0.8, 0.6], 'r5-02-army': [0.8, 0.6], 'r5-03-merchants': [0.8, 0.6]},
  drift: ['r0-02-lake-ice', 'r1-08-rock-snow', 'r1-11-lake-frozen'],
  fog: ['r0-01-peaks', 'r0-08-question', 'r3-06-travellers-ghost', 'r7-06-thousand-years', 'r9-06-final-lake', 'r4-02-goddess-snow', 'r1-06-trek-forest', 'r8-07-trap'],
  abc: ['ПАЛОМНИКИ', 'ЧУЖАКИ', 'ОЗЕРО-ЛОВУШКА'],
  red: ['кост', 'скелет', 'череп', 'град', 'ДНК', 'Средиземномор', 'тысяч', 'навсегда'],
  redExact: ['никто', 'нет', 'три', 'почти'],
});

export const RoopkundRoot: React.FC = () => (
  <>
    <Composition id="Storyboard" component={RK.Storyboard} width={1920} height={1080} fps={30} durationInFrames={RK.SCENE_COUNT} />
    <Composition id="Roopkund" component={RK.Film} width={1920} height={1080} fps={30} durationInFrames={Math.ceil(RK.TOTAL * 30)} />
    <Composition id="ThumbA" component={RkThumb} defaultProps={{variant: 'A' as const}} width={1280} height={720} fps={30} durationInFrames={1} />
    <Composition id="ThumbB" component={RkThumb} defaultProps={{variant: 'B' as const}} width={1280} height={720} fps={30} durationInFrames={1} />
    <Composition id="Trailer" component={RKT.Trailer} width={1080} height={1920} fps={30} durationInFrames={Math.round(RKT.TOTAL * 30)} />
    <Composition id="TrailerStoryboard" component={RKT.Storyboard} width={1080} height={1920} fps={30} durationInFrames={RKT.SCENES} />
  </>
);
