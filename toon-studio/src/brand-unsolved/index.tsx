// Channel art for «Неразгаданное»: npx remotion still src/brand-unsolved/index.ts <Banner|BannerGuides|Avatar> out.png
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Avatar} from './Avatar';
import {Banner} from './Banner';
import {LogoIdeas} from './LogoIdeas';
import {AvatarThread, AvatarThreadPreview} from './AvatarThread';

const Root: React.FC = () => (
  <>
    <Composition id="Banner" component={Banner} width={2560} height={1440} fps={30} durationInFrames={1} />
    <Composition id="BannerGuides" component={Banner} defaultProps={{guides: true}} width={2560} height={1440} fps={30} durationInFrames={1} />
    <Composition id="LogoIdeas" component={LogoIdeas} width={2500} height={1340} fps={30} durationInFrames={1} />
    <Composition id="AvatarThread" component={AvatarThread} width={800} height={800} fps={30} durationInFrames={1} />
    <Composition id="AvatarThreadPreview" component={AvatarThreadPreview} width={1100} height={500} fps={30} durationInFrames={1} />
    <Composition id="Avatar" component={Avatar} width={800} height={800} fps={30} durationInFrames={1} />
  </>
);
registerRoot(Root);
