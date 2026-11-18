import React from 'react';
import {Composition} from 'remotion';
import VOICE from '../../public/eldorado/voice.json';
import {makeStory} from '../story/engine';
import {SCENES} from './scenes';
import {ElThumb} from './Thumbnail';
import {ElTrailer, ElTrailerStoryboard, TR_SCENES, TR_TOTAL} from './Trailer';

export const EL = makeStory({
  dir: 'eldorado',
  voice: VOICE,
  scenes: SCENES,
  fog: ['e0-01-graves', 'e0-08-mirage', 'e1-01-andes', 'e1-06-raft-lake', 'e2-04-vision', 'e2-06-ranges', 'e3-05-graves', 'e4-05-empty',
    'e6-01-guatavita', 'e8-06-night', 'e10-a', 'e10-c', 'e10-final', 'e3-02-column'],
  abc: ['ОБРЯД', 'ГОРОДА АМАЗОНИИ', 'ЕЩЁ НЕ НАЙДЕНО'],
  red: ['погиб', 'сжига', 'казни', 'исчез', 'убива', 'убил', 'умира', 'голод', 'лжец', 'предал', 'обруш', 'отрубают', 'болезн', 'выкосили', 'безум', 'сходит'],
  redExact: ['Гнев', 'Божий', 'тысячами', 'никто', 'никого'],
});

export const ElRoot: React.FC = () => (
  <>
    <Composition id="Storyboard" component={EL.Storyboard} width={1920} height={1080} fps={30} durationInFrames={EL.SCENE_COUNT} />
    <Composition id="ThumbA" component={ElThumb} defaultProps={{variant: 'A' as const}} width={1280} height={720} fps={30} durationInFrames={1} />
    <Composition id="ThumbB" component={ElThumb} defaultProps={{variant: 'B' as const}} width={1280} height={720} fps={30} durationInFrames={1} />
    <Composition id="Trailer" component={ElTrailer} width={1080} height={1920} fps={30} durationInFrames={Math.ceil(TR_TOTAL * 30)} />
    <Composition id="TrailerStoryboard" component={ElTrailerStoryboard} width={1080} height={1920} fps={30} durationInFrames={TR_SCENES} />
    <Composition id="Eldorado" component={EL.Film} width={1920} height={1080} fps={30} durationInFrames={Math.ceil(EL.TOTAL * 30)} />
  </>
);
