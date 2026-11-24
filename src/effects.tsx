import { createContext, useContext, useEffect, useId, useRef, type CSSProperties, type ReactNode } from 'react';
import { point } from './geography';
import type { Location } from './beats';

export const StillScene = createContext(false);

export function Anchor({ at, children }: { at: Location; children: ReactNode }) {
  const [x, y] = point(at);
  return <g transform={`translate(${x} ${y})`}><g className="inverse">{children}</g></g>;
}

export function delay(seconds: number): CSSProperties {
  return { '--delay': `${seconds}s` } as CSSProperties;
}

export function Pin({ at, label, tone = 'parchment', after = 0, dx = 14, dy = -9, pulse = false }: {
  at: Location; label?: string; tone?: 'parchment' | 'gold' | 'red'; after?: number; dx?: number; dy?: number; pulse?: boolean;
}) {
  return <Anchor at={at}>
    <g className={`pin reveal ${tone}`} style={delay(after)}>
      {pulse && <circle r="9" className="pin-pulse" />}
      <circle r="6" fill="var(--night)" stroke="currentColor" strokeWidth="1.5" />
      <circle r="2.2" fill="currentColor" />
      {label && <text x={dx} y={dy} className="place-label">{label}</text>}
    </g>
  </Anchor>;
}

export function Colony({ at, appear = 0, active = true, pulse = false }: { at: Location; appear?: number; active?: boolean; pulse?: boolean }) {
  return <Anchor at={at}>
    <g className={`colony ${active ? 'reveal' : 'colony-hidden'}`} style={delay(appear)}>
      <circle r="9" fill="url(#colony-halo)" />
      {pulse && <circle r="5" className="colony-pulse" />}
      <circle r="2.65" fill="var(--red)" />
    </g>
  </Anchor>;
}

export function Decree({ at, word }: { at: Location; word: string }) {
  return <Anchor at={at}>
    <g transform="translate(76 -237) rotate(-8)">
      <g className="refusal-impression">
        <path className="refusal-plate" d="M-252 -104 -223 -133H222L252 -103V103L222 133H-222L-252 103Z" />
        <g className="refusal-frame" aria-hidden="true">
          <path className="refusal-rim" d="M-252 -104 -223 -133H222L252 -103V103L222 133H-222L-252 103Z" />
          <path className="refusal-keyline" d="M-238 -98 -217 -119H216L238 -97V97L216 119H-216L-238 97Z" />
          <path className="refusal-corners" d="M-252 -81V-104L-223 -133H-188M188 -133H222L252 -103V-81M252 81V103L222 133H188M-188 133H-222L-252 103V81" />
        </g>
        <text className="refusal-word" y="64" textAnchor="middle" textLength="335" lengthAdjust="spacingAndGlyphs">{word}</text>
      </g>
    </g>
  </Anchor>;
}

function PassportStamp({ after }: { after: number }) {
  return <g className="stamp red" style={delay(after)}>
    <circle r="67" fill="var(--night)" fillOpacity=".46" stroke="currentColor" strokeWidth="3" />
    <circle r="58" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 3" />
    <path d="M-45 0H-33M33 0H45" stroke="currentColor" />
    <path d="M0 -29 8 -9 30 -8 13 6 18 28 0 16 -18 28 -13 6 -30 -8 -8 -9Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
  </g>;
}

type TravellerProps = {
  d: string;
  kind: 'paper' | 'ship' | 'harbor-ship' | 'coin' | 'clock';
  wait?: number;
  seconds: number;
  end?: number;
  repetitions?: number;
  offset?: number;
  cameraScaled?: boolean;
};

export function Traveller({ d, kind, wait = 0, seconds, end = 1, repetitions = 1, offset = 0, cameraScaled = true }: TravellerProps) {
  const path = useRef<SVGPathElement>(null);
  const marker = useRef<SVGGElement>(null);
  const still = useContext(StillScene);
  useEffect(() => {
    const rail = path.current!;
    const glyph = marker.current!;
    const length = rail.getTotalLength();
    if (!length) return;
    let frame = 0;
    let start: number | undefined;
    function draw(timestamp: number) {
      start ??= timestamp;
      const elapsed = (timestamp - start) / 1000 - wait;
      const complete = elapsed >= seconds * repetitions;
      if (still || elapsed >= 0) {
        const progress = still || complete ? end : ((elapsed % seconds) / seconds) * end;
        const current = rail.getPointAtLength(progress * length);
        const previous = rail.getPointAtLength(Math.max(0, progress * length - 1));
        const ship = kind === 'ship' || kind === 'harbor-ship';
        const angle = ship ? Math.atan2(current.y - previous.y, current.x - previous.x) * 180 / Math.PI : 0;
        glyph.setAttribute('transform', `translate(${current.x} ${current.y}) rotate(${angle})`);
        const fade = ship || kind === 'coin';
        const cycle = end ? progress / end : 0;
        glyph.style.opacity = !still && fade && !complete ? String(Math.max(0.12, Math.min(cycle * 15, (1 - cycle) * 12, 1))) : '1';
      }
      if (!still && !complete) frame = requestAnimationFrame(draw);
    }
    glyph.style.opacity = '0';
    if (still) draw(0);
    else frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [d, kind, wait, seconds, end, repetitions, still]);
  return <>
    <path ref={path} d={d} visibility="hidden" />
    <g ref={marker} opacity="0" aria-hidden="true">
      <g className={cameraScaled ? 'inverse' : undefined}>
        <g transform={`translate(0 ${offset})`}>
          {kind === 'paper' && <g className="gold"><path d="M-8 -10H2L8 -4V10H-8Z M2 -10V-4H8" fill="var(--night)" stroke="currentColor" strokeWidth="1.5" /><path d="M-4 -1H4M-4 3H4M-4 6H1" stroke="currentColor" /></g>}
          {kind === 'ship' && <g><path d="M-2 -1 -30 -4 -10 0 -30 4 -2 1Z" fill="var(--red)" opacity=".55" /><path d="M8 0 -6 -4 -4 0 -6 4Z" fill="#f2e9dd" stroke="var(--red)" strokeWidth="1.4" /></g>}
          {kind === 'harbor-ship' && <g className="harbor-ship">
            <path d="M-18 -3Q-26 -6 -37 -5M-18 3Q-26 6 -37 5" fill="none" stroke="#9cb9ca" strokeOpacity=".48" strokeWidth="1" />
            <path d="M-18 -6Q-18 -9 -14 -9H7Q14 -8 21 0Q14 8 7 9H-14Q-18 9 -18 6Z" fill="#dbded6" stroke="#091321" strokeWidth="2.5" />
            <path d="M-15 -7H7Q12 -6 17 0Q12 6 7 7H-15Z" fill="none" stroke="#bd534a" strokeWidth="1.4" />
            <rect x="-10" y="-4" width="13" height="8" rx="1.5" fill="#33546b" />
            <path d="M-6 -4v8m6-8v8M7 -3v6" stroke="#edf2eb" strokeWidth=".9" strokeOpacity=".8" />
          </g>}
          {kind === 'coin' && <g stroke="var(--money)" fill="var(--sea)"><circle r="5.6" /><circle r="3.9" opacity=".65" /><path d="M0 -2V2" /></g>}
          {kind === 'clock' && <g className="gold" fill="var(--night)" stroke="currentColor" strokeWidth="1.4"><circle r="8" /><path d="M0 -6V0H4" className="clock-hand" /></g>}
        </g>
      </g>
    </g>
  </>;
}

export function Thread({ d, clock = false, dissolving = false }: { d: string; clock?: boolean; dissolving?: boolean }) {
  const id = useId();
  if (dissolving) return <path d={d} className="thread dissolving" vectorEffect="non-scaling-stroke" />;
  return <>
    <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
      <path d={d} pathLength="1" className="draw thread-mask" style={{ ...delay(1.7), '--draw-time': '13s' } as CSSProperties} />
    </mask>
    <path d={d} className="thread thread-base" vectorEffect="non-scaling-stroke" />
    <path d={d} className="thread" mask={`url(#${id})`} vectorEffect="non-scaling-stroke" />
    <Traveller kind="paper" d={d} wait={1.7} seconds={13} end={clock ? .43 : .82} />
    {clock && <Traveller kind="clock" d={d} wait={1.75} seconds={13} end={.43} offset={-24} />}
  </>;
}

export function MoneyArc({ d, index }: { d: string; index: number }) {
  const after = 1.65 + index * .37;
  return <>
    <path d={d} pathLength="1" className="draw money-base" style={delay(after)} vectorEffect="non-scaling-stroke" />
    <path d={d} className="money-flow reveal" style={delay(after + .45)} vectorEffect="non-scaling-stroke" />
    <Traveller d={d} kind="coin" wait={after} seconds={4.6} repetitions={4} end={.95} />
    <Traveller d={d} kind="coin" wait={after + 1.55} seconds={4.6} repetitions={4} end={.98} />
  </>;
}

const harborRoutes = ['M233 -43 C169 -35 128 -12 58 -11', 'M225 104 C154 85 98 62 24 67', 'M208 -126 C174 -96 148 -55 131 -22'];
const harborCoast = 'M-214 -213H43L29 -173 39 -154 16 -136 25 -116 13 -94 35 -77 38 -54 18 -39 17 -15 -4 -4 -1 11 -21 28 -18 51 -34 73 -28 108 -48 136 -43 169 -70 213H-214Z';

export function JaffaLens({ at }: { at: Location }) {
  return <Anchor at={at}>
    <g className="lens-scene">
      <path d="M0 0 56 -43 110 -66" fill="none" stroke="var(--gold)" strokeOpacity=".7" strokeDasharray="3 5" />
      <g transform="translate(215 36)">
        <g className="lens" style={delay(2.15)}>
          <defs>
            <clipPath id="harbor-clip"><circle r="208" /></clipPath>
            <pattern id="harbor-grid" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0V26" stroke="#7791a6" opacity=".20" fill="none" /></pattern>
          </defs>
          <g clipPath="url(#harbor-clip)">
            <circle r="210" fill="url(#lens-water)" />
            <circle r="210" fill="url(#harbor-grid)" />
            <path d={harborCoast} fill="#1a3044" stroke="#9cb5c8" strokeWidth="2" />
            <g fill="none" stroke="#69859d" opacity=".5">
              <path d="M-212 -163H-43L-1 -111 -40 -72 -62 -21 -92 13 -104 74 -140 123 -148 212" />
              <path d="M-213 -117H-80L-43 -81 -52 -54 -91 -22 -131 -21 -213 -52 M-213 32 -104 33 M-213 70 -108 69 M-213 104 -124 104 M-213 151 -150 150 M-171 -200 -177 190 M-129 -163 -128 60 M-90 -164 -90 -22" />
              <path d="M59 -215Q85 -153 55 -110T57 -43L43 -25M76 -215Q108 -143 77 -105T79 -43M1 86Q15 115 -5 157L-18 225M25 86Q41 121 20 178L15 225" />
            </g>
            <g fill="#627a8e" opacity=".27">
              <path d="M-151 -106h14v18h-14zM-122 -99h24v11h-24zM-150 -70h14v21h-14zM-114 -63h16v18h-16zM-77 -57h12v8h-12zM-160 -5h15v27h-15zM-150 40h16v19h-16zM-127 40h16v11h-16zM-162 82h31v10h-31zM-164 119h15v21h-15z" />
            </g>
            <path d="M-13 16 58 3 84 12 86 20 61 15 -17 29 M-21 42 42 35 62 47 60 55 38 47 -25 54" fill="#6e8598" stroke="#b0c0cb" strokeWidth="1.4" />
            <path d="M-126 -160 -104 -121 -117 -68 -91 -36" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="3 5" opacity=".64" />
            <g transform="translate(-114 -103) rotate(-18)" className="gold">
              <path d="M-8 -11H3L9 -5V11H-8Z M3 -11V-5H9 M-4 -1H5M-4 3H5M-4 7H1" fill="var(--night)" stroke="currentColor" strokeWidth="1.4" />
            </g>
            {harborRoutes.map((d, index) => <g key={d}>
              <path d={d} fill="none" stroke="var(--red)" opacity=".45" strokeDasharray="3 6" />
              <Traveller d={d} kind="harbor-ship" wait={2.25 + index * .38} seconds={1.8 + index * .3} cameraScaled={false} />
            </g>)}
            <g transform="translate(102 102) rotate(-16) scale(.82)" opacity=".91"><PassportStamp after={3.0} /></g>
          </g>
          <circle r="209" fill="none" stroke="var(--gold)" strokeWidth="2.25" />
          <circle r="202" fill="none" stroke="var(--gold)" strokeOpacity=".45" strokeDasharray="2 7" />
          <path d="M-219 0H-199M199 0H219M0 -219V-199M0 199V219" stroke="var(--gold)" strokeWidth="1.5" />
        </g>
      </g>
    </g>
  </Anchor>;
}
