import React from 'react';
import {Composition} from 'remotion';
import VOICE from '../../public/mary-celeste/voice.json';
import {makeStory} from '../story/engine';
import {SCENES} from './scenes';

const SHIPS = ['m0-01-drift', 'm0-03-deigratia', 'm0-04-boarding', 'm0-11-fog', 'm2-07-open-sea', 'm2-08-deigratia-port', 'm3-01-ocean', 'm3-05-night-sea',
  'm4-01-telescope', 'm4-02-climb', 'm4-03-sails', 'm4-09-two-ships', 'm7-01-waterspout', 'm7-05-lifeboat-island', 'm7-07-two-ships-far',
  'm8-05-lifeboat-horizon', 'm8-06-choice', 'm0-02-deck', 'm0-06-davits', 'm4-04-hatches', 'm4-06-pump', 'm4-07-compass', 'm3-03-santamaria'];

export const MC = makeStory({
  dir: 'mary-celeste',
  voice: VOICE,
  scenes: SCENES,
  sea: SHIPS,
  fog: ['m0-11-fog', 'm0-01-drift', 'm3-05-night-sea', 'm8-05-lifeboat-horizon', 'm8-06-choice', 'm2-06-anchor-dusk', 'm7-07-two-ships-far'],
  abc: ['ПАРЫ СПИРТА', 'ОШИБКА', 'ПРЕСТУПЛЕНИЕ'],
  red: ['никого', 'никто', 'шлюпк', 'пуст', 'исчез', 'спирт', 'крови', 'кровь', 'смерч', 'выдумк', 'проклят', 'обман', 'людей'],
  redExact: ['десять', 'девять'],
});

export const MaryCelesteRoot: React.FC = () => (
  <>
    <Composition id="Storyboard" component={MC.Storyboard} width={1920} height={1080} fps={30} durationInFrames={MC.SCENE_COUNT} />
    <Composition id="MaryCeleste" component={MC.Film} width={1920} height={1080} fps={30} durationInFrames={Math.ceil(MC.TOTAL * 30)} />
  </>
);
