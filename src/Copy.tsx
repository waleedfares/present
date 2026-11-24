import { type ReactNode } from 'react';
import { beats, mapCopy, milestones, refusalPortraits, type Beat } from './beats';
import { delay } from './effects';

import sultan from './assets/abd-al-hamid-ii.webp';
import filastin from './assets/filastin.webp';
import herzl from './assets/theodor-herzl.webp';

const portraitImages = [sultan, herzl] as const;

type Entrance = 'west' | 'east' | 'north' | 'south';

function Box({ x, y, w, h, children, className = '', after = 0, from }: {
  x: number; y: number; w: number; h: number; children: ReactNode;
  className?: string; after?: number; from?: Entrance;
}) {
  return <foreignObject x={x} y={y} width={w} height={h}
    className={`${from ? `cue-enter cue-from-${from}` : 'reveal'} ${className}`} style={delay(after)}>
    <div className="box-content">{children}</div>
  </foreignObject>;
}

function Caption({ title, text, tone = '' }: { title: string; text: string; tone?: 'policy' | 'reality' | '' }) {
  return <section className={`cue-caption ${tone}`}>
    <h2>{title}</h2>
    <p>{text}</p>
  </section>;
}

function Topics({ topics }: { topics: readonly string[] }) {
  return <ul className="cue-topics">
    {topics.map((topic, i) => <li key={topic} className="reveal" style={delay(.25 + i * .19)}>{topic}</li>)}
  </ul>;
}

function Letters({ text }: { text: string }) {
  let position = 0;
  const words = text.split(' ');
  return <span aria-label={text}>
    {words.map((word, index) => <span key={index} className={`word ${index === words.length - 1 ? 'title-no' : ''}`}>
      {Array.from(word).map((letter, i) => <span key={i} aria-hidden="true" className="letter" style={delay(.16 + position++ * .035)}>{letter}</span>)}
      {index < words.length - 1 && <span aria-hidden="true"> </span>}
    </span>)}
  </span>;
}

function Intro({ beat }: { beat: Beat }) {
  return <>
    <ellipse cx="955" cy="508" rx="825" ry="375" fill="url(#title-shadow)" />
    <Box x={185} y={358} w={1550} h={329} className="title-box">
      <div className="title-lockup">
        <div className="title-divider" aria-hidden="true"><span /></div>
        <h1><Letters text={beat.title} /></h1>
        <p className="reveal intro-question" style={delay(2)}>{beat.lines[0]}</p>
      </div>
    </Box>
  </>;
}

function ColonyTimeline({ year }: { year: number }) {
  const progress = (year - 1878) / 36;
  return <Box x={108} y={868} w={1704} h={155} after={2.15} from="south">
    <div className="timeline" aria-label={beats[4].year + '–' + milestones.at(-1)?.year}>
      <div className="timeline-rail" aria-hidden="true">
        <div className="timeline-progress" style={{ width: `${progress * 100}%` }} />
        {milestones.map(m => <i key={m.year} className={m.year <= year ? 'passed' : ''} style={{ left: `${(m.year - 1878) / 36 * 100}%` }} />)}
      </div>
      <ol className="timeline-events">
        {milestones.map(m => <li key={m.year} className={m.year > year ? 'pending' : ''} aria-hidden={m.year > year}>{m.label}</li>)}
      </ol>
    </div>
  </Box>;
}

function Newspaper() {
  const issue = mapCopy.newspaper;
  return <Box x={1512} y={558} w={294} h={369} after={2.9} from="east">
    <figure className="newspaper-cue">
      <img src={filastin} alt={issue.alt} />
      <figcaption><strong>{issue.title}</strong><span>{issue.date}</span>
        <a href={issue.archive} target="_blank" rel="noreferrer" onClick={event => event.stopPropagation()}>Internet Archive</a>
      </figcaption>
    </figure>
  </Box>;
}

function RefusalPortraits() {
  return <Box x={142} y={181} w={602} h={450} after={1.85} from="west">
    <div className="portrait-frame">
      {refusalPortraits.map(({ name, role }, i) => <figure key={name}>
        <div className="portrait-print"><img src={portraitImages[i]} alt="" /></div>
        <figcaption><strong>{name}</strong><span>{role}</span></figcaption>
      </figure>)}
    </div>
  </Box>;
}

export function Copy({ beat, timelineYear }: { beat: Beat; timelineYear: number }) {
  const caption = <Caption title={beat.title} text={beat.lines[0]} />;
  switch (beat.id) {
    case 'title':
      return <Intro beat={beat} />;
    case 'refusal':
      return <>
        <RefusalPortraits />
        <Box x={108} y={700} w={618} h={250} after={2.25} from="west">
          <Caption title={beat.title} text={beat.lines[0]} tone="policy" />
        </Box>
      </>;
    case 'population':
      return <Box x={108} y={257} w={607} h={230} after={1.65} from="north">{caption}</Box>;
    case 'europe':
      return <Box x={775} y={148} w={644} h={238} after={2.15} from="east">{caption}</Box>;
    case 'colonies':
      return <>
        <Box x={108} y={268} w={600} h={238} after={1.85} from="west">{caption}</Box>
        <ColonyTimeline year={timelineYear} />
      </>;
    case 'gap':
      return <>
        <Box x={108} y={146} w={683} h={105} after={1.4} from="north" className="cue-heading">
          <h2>{beat.title}</h2>
        </Box>
        <Box x={108} y={277} w={483} h={216} after={1.9} from="west">
          <Caption title={beat.topics![0]} text={beat.lines[0]} tone="policy" />
        </Box>
        <Box x={1433} y={590} w={374} h={232} after={2.35} from="east">
          <Caption title={beat.topics![1]} text={beat.lines[1]} tone="reality" />
        </Box>
      </>;
    case 'capitulations':
      return <Box x={108} y={664} w={631} h={252} after={1.85} from="south">{caption}</Box>;
    case 'distance':
      return <Box x={1320} y={198} w={486} h={252} after={1.75} from="east">{caption}</Box>;
    case 'money':
      return <Box x={108} y={721} w={650} h={245} after={1.95} from="south">{caption}</Box>;
    case 'response':
      return <>
        <Box x={108} y={162} w={618} h={218} after={1.55} from="north">{caption}</Box>
        <Box x={108} y={776} w={978} h={128} after={2.5} from="south"><Topics topics={beat.topics!} /></Box>
        <Newspaper />
      </>;
    case 'outcome':
      return <Box x={119} y={569} w={761} h={314} after={1.95} from="south" className="outcome">
        <strong className="outcome-number">{beat.title}</strong>
        <p>{beat.lines[0]}</p>
      </Box>;
    case 'closing':
      return <>
        <Box x={110} y={275} w={973} h={315} after={1.65} from="west" className="closing-box">
          <h1>{beat.title}</h1>
        </Box>
        <Box x={111} y={646} w={971} h={148} after={2.55} from="south"><Topics topics={beat.topics!} /></Box>
      </>;
  }
}
