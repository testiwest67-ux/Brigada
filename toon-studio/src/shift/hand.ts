// Caveat (OFL), a handwriting font for Petrovich's note; ships in public/fonts like Montserrat.
import {continueRender, delayRender, staticFile} from 'remotion';

export const HAND = 'CaveatLocal';
let loaded = false;
export const ensureHand = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const faces = [
    ['caveat-700-cyrillic.woff2', 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116'],
    ['caveat-700-latin.woff2', 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'],
  ];
  const h = delayRender('hand-font');
  Promise.all(faces.map(([file, range]) => {
    const ff = new FontFace(HAND, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {weight: '700', unicodeRange: range});
    document.fonts.add(ff);
    return ff.load();
  })).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};
