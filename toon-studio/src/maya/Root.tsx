import React from 'react';
import {Composition} from 'remotion';
import VOICE from '../../public/maya/voice.json';
import {makeStory} from '../story/engine';
import {SCENES} from './scenes';
import {MYThumb} from './Thumbnail';

export const MY = makeStory({
  dir: 'maya',
  voice: VOICE,
  scenes: SCENES,
  clips: ['e01-three-doors', 'e02-calakmul', 'e03-copan-stairs', 'e04-palenque', 'e05-causeway', 'e06-reservoir', 'e07-terraces', 'e08-stelae-row', 'e09-long-count', 'e10-tonina', 'e11-jade-found', 'e12-warriors-march', 'e13-obsidian', 'e14-king-sky', 'e15-rain-ritual', 'e16-cenote', 'e17-lake-retreat', 'e18-stalagmite-bands', 'e19-mayapan', 'e20-children-ruins', 'e21-slash-burn', 'm0-01-explorers', 'm0-02-stone-face', 'm0-03-empty-city', 'm0-04-roots', 'm0-05-aerial-ruins', 'm0-06-question', 'm1-02-tikal-peak', 'm1-03-king-temple', 'm1-04-ballgame', 'm1-05-builders', 'm1-06-scribe', 'm1-07-astronomer', 'm1-08-stela', 'm2-01-lidar-plane', 'm2-03-landscape', 'm2-05-forest-returns', 'm3-01-scholar', 'm3-02-glyphs', 'm3-03-lights-out', 'm3-05-silence', 'm4-01-cancuen', 'm4-02-dig', 'm4-03-jade', 'm4-04-night-attack', 'm4-05-wall', 'm4-06-burned', 'm5-01-king-ritual', 'm5-02-dry-corn', 'm5-03-squatters', 'm5-04-leaving', 'm6-01-lake', 'm6-03-gypsum', 'm6-04-drought', 'm6-05-exodus', 'm6-06-cave', 'm6-07-rain-to-dust', 'm7-01-chichen', 'm7-02-spanish', 'm7-03-burning', 'm7-04-codex', 'm7-05-nojpeten', 'm7-06-weaver', 'm7-07-today', 'm8-01-drought', 'm8-02-war', 'm8-03-overpop', 'm8-04-final'],
  fog: ['m0-03-empty-city', 'm0-05-aerial-ruins', 'm0-06-question', 'm3-05-silence', 'm2-05-forest-returns', 'm6-01-lake', 'm8-04-final', 'm3-04-tonina'],
  abc: ['ЗАСУХА', 'ВОЙНА', 'СЛИШКОМ МНОГО ЛЮДЕЙ'],
  red: ['исчез', 'пуст', 'засух', 'войн', 'голод', 'убил', 'сжечь', 'тишин', 'ушли', 'опустел'],
  redExact: ['кости', 'сотни'],
});

export const MayaRoot: React.FC = () => (
  <>
    <Composition id="Storyboard" component={MY.Storyboard} width={1920} height={1080} fps={30} durationInFrames={MY.SCENE_COUNT} />
    <Composition id="ThumbA" component={MYThumb} defaultProps={{variant: 'A' as const}} width={1280} height={720} fps={30} durationInFrames={1} />
    <Composition id="ThumbB" component={MYThumb} defaultProps={{variant: 'B' as const}} width={1280} height={720} fps={30} durationInFrames={1} />
    <Composition id="Maya"component={MY.Film} width={1920} height={1080} fps={30} durationInFrames={Math.ceil(MY.TOTAL * 30)} />
  </>
);
