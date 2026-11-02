// Entry for «Ночная смена» only: TOON_ENTRY=src/shift/index.ts node scripts/render.mjs ...
import {registerRoot} from 'remotion';
import {ShiftRoot} from './Root';

registerRoot(ShiftRoot);
