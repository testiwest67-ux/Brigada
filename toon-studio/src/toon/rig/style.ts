// One look for every toon episode: a single ink colour and outline weight for characters and props.
export const INK = '#1f2236';
export const OW = 5; // outline width in px (screen space, never scaled)

export type Skin = {base: string; shade: string; light: string; blush: string; line: string};
export type Look = {
  skin: Skin;
  hair: string; hairLight: string;
  top: string; topShade: string; topLight: string; hood: string; cuff: string; strings: string;
  pants: string; shoes: string; shoeSole: string;
  eyeWhite: string; pupil: string; mouth: string; tongue: string;
  hairStyle?: 'boy' | 'bob' | 'bald'; // default 'boy'
  lashes?: boolean; mustache?: string; noHood?: boolean; // noHood: sweater/shirt with a round collar
};

// the "you" hero of the Blackout/What-if videos: young guy, navy hoodie
export const HERO: Look = {
  skin: {base: '#f1c3a0', shade: '#dea07f', light: '#f9d6b9', blush: '#ee8f86', line: '#b8775c'},
  hair: '#3b2a27', hairLight: '#56403a',
  top: '#33406a', topShade: '#262f50', topLight: '#43517f', hood: '#3c4a78', cuff: '#2a3457', strings: '#e6e9f0',
  pants: '#3a3f52', shoes: '#e9e4dc', shoeSole: '#9aa0ad',
  eyeWhite: '#ffffff', pupil: '#1f2236', mouth: '#5a2232', tongue: '#e0707a',
};

// second heroine: ginger bob, green sweater, beige trousers (lashes, no hood)
export const HEROINE: Look = {
  skin: {base: '#f6cdb0', shade: '#e3a98a', light: '#fde0c8', blush: '#f08c86', line: '#c0806a'},
  hair: '#c9582f', hairLight: '#e8814f',
  top: '#4f8a62', topShade: '#3d6f4f', topLight: '#63a077', hood: '#4f8a62', cuff: '#457a56', strings: '#e6e9f0',
  pants: '#cdb894', shoes: '#f1ece4', shoeSole: '#9aa0ad',
  eyeWhite: '#ffffff', pupil: '#1f2236', mouth: '#5a2232', tongue: '#e0707a',
  hairStyle: 'bob', lashes: true, noHood: true,
};

// older neighbour: bald, grey moustache, brick-red shirt
export const NEIGHBOR: Look = {
  skin: {base: '#efbf9c', shade: '#d89c7c', light: '#f7d3b6', blush: '#e88a80', line: '#b4745a'},
  hair: '#b9bcc8', hairLight: '#d9dbe3',
  top: '#a4513f', topShade: '#843e31', topLight: '#bb6450', hood: '#a4513f', cuff: '#8f4636', strings: '#e6e9f0',
  pants: '#3a3f52', shoes: '#5a4034', shoeSole: '#3a2a22',
  eyeWhite: '#ffffff', pupil: '#1f2236', mouth: '#5a2232', tongue: '#e0707a',
  hairStyle: 'bald', mustache: '#c9ccd6', noHood: true,
};
