import { memo, useLayoutEffect, useRef, type CSSProperties } from 'react';
import { useMotionValueEvent, type MotionValue } from 'framer-motion';
import { mapCopy, type Beat, type Location } from './beats';
import mapProjection from './map-projection.json';
import { Anchor, Colony, Decree, JaffaLens, MoneyArc, Pin, Thread, Traveller, delay } from './effects';
import {
  places, palestine, districts, colonies, decreeRoute, arrivalRoute, directRoute, provincialRoutes,
  moneyRoutes, donors, landPatches,
} from './geography';

const mapNames = mapCopy.places;
const sacredPins = ['jerusalem', 'hebron', 'safad', 'tiberias'] as const;
const pressPins = ['jerusalem', 'jaffa'] as const;

const mapImages = import.meta.glob<string>('./assets/map-*.webp', { eager: true, query: '?url', import: 'default' });
const MapSurface = memo(function MapSurface() {
  return <g pointerEvents="none" aria-hidden="true">
    {mapProjection.tiles.map(({ name, bounds: [x, y, width, height] }) => (
      <image key={name} href={mapImages[`./assets/${name}.webp`]} x={x} y={y} width={width} height={height} />
    ))}
  </g>;
});

function RouteLabel({ at, kind }: { at: Location; kind: 'dispatch' | 'arrivals' }) {
  const width = kind === 'dispatch' ? 253 : 193;
  return <Anchor at={at}>
    <g className={`route-label ${kind} reveal`} style={delay(2.45)}>
      <rect width={width} height="44" rx="15" />
      {kind === 'dispatch'
        ? <path d="M15 12h9l6 6v14H15z M24 12v7h6 M19 24h7m-7 4h6" />
        : <path d="M12 27h21l-6 7H17zM19 26V12l10 11H19" />}
      <text x="43" y="29">{mapCopy.comparison[kind]}</text>
    </g>
  </Anchor>;
}

export function Definitions() {
  return <defs>
    <radialGradient id="sea-light" cx="58%" cy="40%" r="72%">
      <stop stopColor="#142e48" /><stop offset=".56" stopColor="#0a1a2e" /><stop offset="1" stopColor="#06101d" />
    </radialGradient>
    <radialGradient id="gold-point"><stop stopColor="#ffe7a2" /><stop offset=".16" stopColor="#dbb450" stopOpacity=".85" /><stop offset=".5" stopColor="#d4a93a" stopOpacity=".28" /><stop offset="1" stopColor="#d4a93a" stopOpacity="0" /></radialGradient>
    <radialGradient id="colony-halo"><stop stopColor="#c8453a" stopOpacity=".72" /><stop offset="1" stopColor="#c8453a" stopOpacity="0" /></radialGradient>
    <radialGradient id="basel-light"><stop stopColor="#ede3cc" stopOpacity=".68" /><stop offset="1" stopColor="#ede3cc" stopOpacity="0" /></radialGradient>
    <linearGradient id="refusal-gold" x1="5%" y1="0%" x2="85%" y2="100%">
      <stop stopColor="#ffe7a0" /><stop offset=".44" stopColor="#e7bc59" /><stop offset="1" stopColor="#ab7629" />
    </linearGradient>
    <linearGradient id="lens-water" x1="0%" x2="100%" y2="85%"><stop stopColor="#19354c" /><stop offset="1" stopColor="#080f1c" /></linearGradient>
    <radialGradient id="vignette"><stop offset=".25" stopColor="#060e18" stopOpacity="0" /><stop offset=".72" stopColor="#060e18" stopOpacity=".18" /><stop offset="1" stopColor="#060e18" stopOpacity=".78" /></radialGradient>
    <radialGradient id="title-shadow"><stop stopColor="#050c17" stopOpacity=".86" /><stop offset=".64" stopColor="#050c17" stopOpacity=".45" /><stop offset="1" stopColor="#050c17" stopOpacity="0" /></radialGradient>
  </defs>;
}

export function World({ beat, camera, inverse, timeline }: {
  beat: Beat; camera: MotionValue<string>; inverse: MotionValue<string>; timeline: boolean;
}) {
  const world = useRef<SVGGElement>(null);
  useMotionValueEvent(camera, 'change', value => { world.current?.style.setProperty('transform', value); });
  useMotionValueEvent(inverse, 'change', value => { world.current?.style.setProperty('--inverse-camera', value); });
  useLayoutEffect(() => {
    world.current!.style.transform = camera.get();
    world.current!.style.setProperty('--inverse-camera', inverse.get());
  }, [camera, inverse]);

  const has = (effect: Beat['effects'][number]) => beat.effects.includes(effect);
  const wide = ['title', 'outcome', 'europe', 'money'].includes(beat.id);
  const policy = ['title', 'refusal', 'gap', 'distance', 'closing'].includes(beat.id);
  const close = has('population') || has('lens') || has('press') || timeline;
  const districtsVisible = has('population') || has('press');
  return <g ref={world} className="camera">
      <MapSurface />
      <path d={palestine} className={`palestine-area${close ? ' palestine-close' : ''}`} />
      <g key={beat.id}>
        {close && <path d={palestine} pathLength="1" className="palestine-trace draw" style={delay(1.65)} />}
        {districtsVisible && districts.map((d, i) => <path key={d} d={d} pathLength="1" className="draw district" style={delay(1.85 + i * .27)} />)}
        {beat.id !== 'refusal' && <Anchor at={[35.02, 30.46]}>
          <g className="palestine-label reveal" style={delay(close ? 2.1 : 1.65)}>
            <path d={close ? 'M4 0h45l15-13h11' : 'M4 0h12l11 13h8'} aria-hidden="true" />
            <text x={close ? 85 : 44} y={close ? -8 : 22} className="place-label">{mapCopy.palestine}</text>
          </g>
        </Anchor>}
        {wide && <g className="reveal" style={delay(0.75)}>
          <Anchor at={[20.0, 34.7]}><text className="sea-name" textAnchor="middle">{mapCopy.seas[0]}</text></Anchor>
          <Anchor at={[33.9, 44.0]}><text className="sea-name" textAnchor="middle">{mapCopy.seas[1]}</text></Anchor>
        </g>}
        {policy && <Anchor at={places.istanbul}>
          <g className={beat.id === 'title' ? 'istanbul-intro' : 'istanbul-light'}>
            <circle r={beat.id === 'title' ? 110 : 78} fill="url(#gold-point)" opacity={beat.id === 'title' ? '.43' : '.45'} />
            <circle r="29" fill="url(#gold-point)" opacity=".9" />
            <circle r="12" stroke="var(--gold)" strokeOpacity=".36" fill="none" />
            <circle r="3.2" fill="var(--gold)" />
            {beat.id !== 'closing' && <text x="18" y="-13" className="place-label gold">{mapNames.istanbul}</text>}
          </g>
        </Anchor>}
        {beat.id === 'title' && <g opacity=".57">
          <Pin at={places.jaffa} label={mapNames.jaffa} dx={-54} dy={20} />
          <Pin at={places.jerusalem} label={mapNames.jerusalem} dx={15} dy={21} />
        </g>}
        {has('decree') && <Decree at={places.istanbul} word={mapCopy.stamp} />}
        {has('population') && sacredPins.map((city, i) => <Pin key={city} at={places[city]} label={mapNames[city]} pulse after={2.1 + i * .41}
          dy={city === 'tiberias' ? 18 : -8} />)}
        {has('basel') && <Anchor at={places.basel}>
          <g className="basel-focus reveal" style={delay(1.8)}>
            <circle r="108" fill="url(#basel-light)" opacity=".34" />
            <circle r="66" className="basel-guide" />
            <circle r="43" pathLength="1" className="basel-ring draw" style={delay(2.04)} />
            <path className="basel-guide" d="M-74 0h15m118 0h15M0 -74v15m0 118v15" />
            <circle r="20" className="basel-echo" />
            <path className="basel-pin" d="M0 -8 8 0 0 8 -8 0Z" />
            <text y="115" textAnchor="middle" className="place-label basel-label">{mapNames.basel}</text>
          </g>
        </Anchor>}
        {has('land') && landPatches.map((d, i) => <path key={d} d={d} className="land-patch reveal" style={delay(4.3 + i * .2)} />)}
        {has('colonies') && colonies.map((at, i) => <Colony key={i} at={at} appear={timeline ? 2.25 + i * .472 : 0} pulse={timeline} />)}
        {has('thread') && <>
          <Thread d={decreeRoute} />
          <RouteLabel at={[30.85, 38.45]} kind="dispatch" />
        </>}
        {has('dissolve') && <Thread d={decreeRoute} dissolving />}
        {has('administration') && <>
          <path d={directRoute} pathLength="1" className="draw admin-route admin-direct" style={delay(1.85)} />
          <Pin at={places.jerusalem} label={mapNames.jerusalem} tone="gold" after={2.6} dy={26} />
          {provincialRoutes.map(d => <path key={d} d={d} pathLength="1" className="draw admin-route" style={delay(3.05)} />)}
          <Pin at={places.beirut} label={mapNames.beirut} after={3.1} />
          <Pin at={places.acre} label={mapNames.acre} after={3.55} dx={-64} dy={-8} />
          <Pin at={places.nablus} label={mapNames.nablus} after={3.75} dx={16} dy={-2} />
        </>}
        {has('ships') && <>
          <path d={arrivalRoute} className="ship-track reveal" style={delay(1.8)} />
          <RouteLabel at={[24.25, 33.95]} kind="arrivals" />
          {[1, .94, .87].map((end, i) => <Traveller key={end} d={arrivalRoute} kind="ship" wait={1.7 + i * .72} seconds={3.15} end={end} />)}
        </>}
        {(has('ships') || has('lens')) && <Pin at={places.jaffa} label={mapNames.jaffa} dx={has('lens') ? -62 : 16} dy={has('lens') ? -14 : 22} after={1.25} tone={has('ships') ? 'red' : 'parchment'} />}
        {has('lens') && <JaffaLens at={places.jaffa} />}
        {has('money') && <>
          {moneyRoutes.map((d, index) => <MoneyArc key={d} d={d} index={index} />)}
          {donors.map((at, i) => <Anchor key={i} at={at}><g className="donor reveal" style={delay(1.65 + i * .44)}>
            <circle r="27" fill="url(#basel-light)" opacity=".6" /><circle r="5" fill="var(--money)" />
            <text x={i ? 16 : -14} y={i ? 32 : -17} textAnchor={i ? 'start' : 'end'} className="place-label">{mapCopy.donors[i]}</text>
          </g></Anchor>)}
        </>}
        {has('press') && pressPins.map((city, i) => <Pin key={city} at={places[city]} label={mapNames[city]} after={1.85 + i * .58} pulse
          dx={city === 'jaffa' ? -63 : 15} dy={-10} />)}
      </g>
  </g>;
}

const dust = Array.from({ length: 48 }, (_, i) => ({
  x: (i * 491.619 + 118) % 1900, y: (i * 311.387 + 87) % 1050,
  size: .75 + (i % 5) * .22,
  opacity: .11 + i % 4 * .085,
}));

export function Atmosphere({ particles }: { particles: boolean }) {
  return <g pointerEvents="none" aria-hidden="true">
    <rect width="1920" height="1080" fill="url(#vignette)" />
    {particles && <g className="dust">{[0, 1, 2].map(layer => <g key={layer} style={{
      '--dust-delay': `-${layer * 8}s`, '--dust-time': `${23 + layer * 5}s`,
    } as CSSProperties}>{dust.filter((_, i) => i % 3 === layer).map(p =>
      <circle key={p.x} cx={p.x} cy={p.y} r={p.size} opacity={p.opacity} />)}</g>)}</g>}
  </g>;
}

export function Frame() {
  return <g className="frame" aria-hidden="true">
    <rect x="54" y="50" width="1812" height="980" />
    <path className="frame-corners" d="M54 77V50H82M1838 50H1866V77M1866 1003V1030H1838M82 1030H54V1003" />
    {Array.from({ length: 13 }, (_, index) => <path key={index} d={`M${120 + index * 140} 50v${index % 3 ? 5 : 9}M${120 + index * 140} 1030v-${index % 3 ? 5 : 9}`} />)}
    {Array.from({ length: 7 }, (_, index) => <path key={index} d={`M54 ${125 + index * 136}h${index % 3 ? 5 : 9}M1866 ${125 + index * 136}h-${index % 3 ? 5 : 9}`} />)}
    <g transform="translate(1786 138)" className="compass">
      <circle r="29" /><circle r="20" strokeDasharray="1 4" />
      <path d="M0 -37V37M-37 0H37 M0 -18 5 0 0 16 -5 0Z" />
      <path className="compass-north" d="M0 -18 5 0H-5Z" />
      <circle r="2" className="compass-north" />
    </g>
  </g>;
}
