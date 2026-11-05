// Shared scene vocabulary for the long 16:9 «загадки» videos (Мэри Селест, Маяк Фланнан …).
// Same ideas as src/dyatlov/Shots.tsx, but generic: each video passes its own scenes, images and settings to makeStory().
export type Move = 'in' | 'out' | 'right' | 'left' | 'down' | 'up' | 'shake' | 'still';
export type Ov =
  | {k: 'plate'; a: string; b?: string}
  | {k: 'title'; n: string; a: string; b?: string}
  | {k: 'big'; a: string; red?: boolean; y?: number; size?: number}
  | {k: 'count'; to: number; from?: number; suf?: string; dec?: number; red?: boolean}
  | {k: 'card'; who: string; face?: number; body?: boolean; name?: string; sub?: string}
  | {k: 'seq'; items: {a: string; at: number; who?: string}[]; big?: boolean}
  | {k: 'quote'; a: string}
  | {k: 'stamp'; a: string}
  | {k: 'abc'; one?: 0 | 1 | 2};
export type Sc = {line: number; img: string; mv: Move; fx?: number; fy?: number; z?: number; dark?: number; blur?: boolean; ov?: Ov[]; name: string; title?: boolean};

export const sc = (line: number, img: string, mv: Move, name: string, o: Partial<Sc> = {}): Sc => ({line, img, mv, name, ...o});
export const card = (line: number, bgImg: string, who: string, name: string, sub?: string, face = 0): Sc =>
  sc(line, bgImg, 'still', name.toLowerCase(), {dark: 0.45, blur: true, ov: [{k: 'card', who, face, name, sub}]});
