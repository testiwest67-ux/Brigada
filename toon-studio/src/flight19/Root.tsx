import React from 'react';
import {Audio, Composition, staticFile, useCurrentFrame} from 'remotion';
import {REPORT_CUES, ReportScene} from './Report';
import {SHOTS, Storyboard} from './Shots';
import {EP_SEC, Flight19Episode} from './Episode';
import {RadistSheet, RadistSheet2, TaylorSheet, TaylorSheet2} from './CharSheet';

const REPORT_FROM = REPORT_CUES.from - 0.6, REPORT_LEN = REPORT_CUES.to + 0.6 - REPORT_FROM;
const ReportTest: React.FC = () => {
  const f = useCurrentFrame();
  return (<><ReportScene t={REPORT_FROM + f / 30} /><Audio src={staticFile('reys-19/report-test.wav')} /></>);
};

export const Flight19Root: React.FC = () => (
  <>
    <Composition id="TaylorSheet" component={TaylorSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
    <Composition id="RadistSheet" component={RadistSheet} width={1920} height={1080} fps={30} durationInFrames={30} />
    <Composition id="TaylorSheet2" component={TaylorSheet2} width={1920} height={1080} fps={30} durationInFrames={30} />
    <Composition id="RadistSheet2" component={RadistSheet2} width={1920} height={1080} fps={30} durationInFrames={30} />
    <Composition id="ReportTest" component={ReportTest} width={1080} height={1920} fps={30} durationInFrames={Math.round(REPORT_LEN * 30)} />
    <Composition id="Storyboard" component={Storyboard} width={1080} height={1920} fps={30} durationInFrames={SHOTS.length} />
    <Composition id="Reys19" component={Flight19Episode} width={1080} height={1920} fps={30} durationInFrames={Math.round(EP_SEC * 30)} />
  </>
);
