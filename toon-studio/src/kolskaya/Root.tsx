import React from 'react';
import {Composition} from 'remotion';
import VOICE from '../../public/kolskaya/voice.json';
import {makeStory} from '../story/engine';
import {SCENES} from './scenes';
import {KlThumb} from './Thumbnail';

export const KL = makeStory({
  dir: 'kolskaya',
  voice: VOICE,
  scenes: SCENES,
  snow: {'k0-01-tundra': [1, 0.6], 'k0-02-ruins': [0.5, 0.3], 'k2-01-zapolyarny': [0.7, 0.3], 'k2-04-shift': [1, 0.4], 'k2-06-tower': [0.8, 0.5],
    'k9-04-abandoned': [0.8, 0.5], 'k9-09-cap-snow': [0.6, 0.2], 'k9-01-ussr-end': [0.5, 0.3]},
  drift: ['k0-01-tundra', 'k9-04-abandoned'],
  fog: ['k0-08-screams', 'k7-03-siberia', 'k7-04-void', 'k7-05-mic-lowered', 'k7-07-gas', 'k8-04-bat', 'k8-08-alaska', 'k6-02-hot-rock', 'k5-05-mud'],
  abc: ['ЗЕМЛЯ НЕ ПУСТИЛА', 'КОНЧИЛИСЬ ДЕНЬГИ', 'ЧТО-ТО СКРЫЛИ'],
  red: ['крик', 'жар', 'ад', 'расплав', 'оборвал', 'авари', 'розыгрыш', 'горяч', 'невозмож', 'заварил'],
  redExact: ['никто', 'навсегда', 'базальта', 'нет'],
});

export const KolskayaRoot: React.FC = () => (
  <>
    <Composition id="Storyboard" component={KL.Storyboard} width={1920} height={1080} fps={30} durationInFrames={KL.SCENE_COUNT} />
    <Composition id="Kolskaya" component={KL.Film} width={1920} height={1080} fps={30} durationInFrames={Math.ceil(KL.TOTAL * 30)} />
    <Composition id="KolskayaClean" component={KL.Clean} width={1920} height={1080} fps={30} durationInFrames={Math.ceil(KL.TOTAL * 30)} />
    <Composition id="ThumbA" component={KlThumb} defaultProps={{variant: 'A' as const}} width={1280} height={720} fps={30} durationInFrames={1} />
    <Composition id="ThumbB" component={KlThumb} defaultProps={{variant: 'B' as const}} width={1280} height={720} fps={30} durationInFrames={1} />
  </>
);
