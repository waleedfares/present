import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { beats, cover } from './beats';
import { Copy } from './Copy';
import { StillScene } from './effects';
import { height, point, width } from './geography';
import { Atmosphere, Definitions, Frame, World } from './World';
import './styles.css';

const easing = [.65, 0, .35, 1] as const;
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
type Move = 'forward' | 'instant' | 'restart';
type Navigation = { index: number; move: Move; revision: number };

function App() {
  const [navigation, setNavigation] = useState<Navigation>({ index: -1, move: 'forward', revision: 0 });
  const [notes, setNotes] = useState(false);
  const [reduced, setReduced] = useState(motionPreference.matches);
  const [timelineYear, setTimelineYear] = useState(1878);
  const [fullscreenError, setFullscreenError] = useState(false);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(0);
  const stage = useRef<HTMLElement>(null);
  const onCover = navigation.index === -1;
  const beat = beats[Math.max(0, navigation.index)];
  const instant = navigation.move === 'instant';
  const [initialX, initialY] = point(beats[0].camera.center);
  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);
  const z = useMotionValue(beats[0].camera.zoom);
  const opacity = useMotionValue(1);
  const camera = useTransform(() => `translate(${width / 2 - x.get() * z.get()}px, ${height / 2 - y.get() * z.get()}px) scale(${z.get()})`);
  const inverse = useTransform(() => `scale(${1 / z.get()})`);

  useEffect(() => {
    const mediaChanged = (event: MediaQueryListEvent) => setReduced(event.matches);
    motionPreference.addEventListener('change', mediaChanged);
    return () => {
      motionPreference.removeEventListener('change', mediaChanged);
    };
  }, []);

  useLayoutEffect(() => {
    if (onCover) return;
    const { center, zoom, drift, duration = 2.6 } = beat.camera;
    const [targetX, targetY] = point(center);
    const active: ReturnType<typeof animate>[] = [];
    const jump = () => {
      x.jump(targetX);
      y.jump(targetY);
      z.jump(zoom);
    };
    const glide = () => {
      const timing = { duration, ease: easing };
      active.push(animate(x, targetX, timing), animate(y, targetY, timing), animate(z, zoom, timing));
    };
    if (reduced && !instant) {
      const fadeOut = animate(opacity, 0, { duration: .2, onComplete: () => {
        jump();
        active.push(animate(opacity, 1, { duration: .2 }));
      } });
      active.push(fadeOut);
    } else {
      opacity.jump(1);
      if (instant || navigation.move === 'restart') jump();
      else glide();
      if (drift && !instant) {
        const [driftX, driftY] = point(drift);
        const wait = navigation.move === 'restart' ? 0 : duration;
        const timing = { duration: 8, delay: wait, ease: 'easeInOut' as const };
        const startDrift = () => {
          active.push(animate(x, driftX, { ...timing, delay: 0 }), animate(y, driftY, { ...timing, delay: 0 }));
        };
        const timer = window.setTimeout(startDrift, timing.delay * 1000);
        return () => { clearTimeout(timer); active.forEach(animation => animation.stop()); };
      }
    }
    return () => active.forEach(animation => animation.stop());
  }, [beat, instant, onCover, navigation.move, navigation.revision, reduced, opacity, x, y, z]);

  useLayoutEffect(() => {
    if (beat.id !== 'colonies') return;
    if (instant || reduced) {
      setTimelineYear(1914);
      return;
    }
    setTimelineYear(1878);
    const animation = animate(1878, 1914, {
      duration: 14, delay: 2.15, ease: 'linear',
      onUpdate: (value) => setTimelineYear(Math.floor(value)),
      onComplete: () => setTimelineYear(1914),
    });
    return () => animation.stop();
  }, [beat, instant, navigation.revision, reduced]);

  function move(direction: -1 | 1) {
    setNavigation(previous => {
      const index = Math.min(beats.length - 1, Math.max(0, previous.index + direction));
      if (previous.index < 0) return direction === 1 ?
        { index: 0, move: 'restart', revision: previous.revision + 1 } : previous;
      return index === previous.index ? previous :
        { index, move: direction < 0 ? 'instant' : 'forward', revision: previous.revision + 1 };
    });
  }

  async function toggleFullscreen() {
    setFullscreenError(false);
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stage.current!.requestFullscreen();
    } catch {
      setFullscreenError(true);
    }
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const key = event.key.toLowerCase();
      if (!['enter', 'arrowright', 'arrowleft', ' ', 'pagedown', 'pageup', 'home', 'n', 'f'].includes(key)) return;
      if ((key === ' ' || key === 'enter') && (event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement)) return;
      event.preventDefault();
      if (event.repeat) return;
      if (key === 'enter' || key === 'arrowright' || key === ' ' || key === 'pagedown') move(1);
      else if (key === 'arrowleft' || key === 'pageup') move(-1);
      else if (key === 'home') {
        setNotes(false);
        setNavigation(previous => ({ index: -1, move: 'restart', revision: previous.revision + 1 }));
      }
      else if (key === 'n') setNotes(value => !value);
      else void toggleFullscreen();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function pointerDown(event: PointerEvent) {
    if (event.pointerType === 'touch') gesture.current = { x: event.clientX, y: event.clientY };
  }

  function pointerUp(event: PointerEvent) {
    const start = gesture.current;
    gesture.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const distance = Math.max(35, Math.min(80, window.innerWidth * .07));
    if (Math.abs(dx) > distance && Math.abs(dx) > Math.abs(dy) * 1.3) {
      suppressClick.current = performance.now() + 380;
      move(dx < 0 ? 1 : -1);
    }
  }

  const year = beat.id === 'colonies' ? String(timelineYear) : beat.year;
  const yearKey = beat.id === 'colonies' ? 'timeline' : year;
  const still = instant || reduced;
  const transition = instant ? 0 : reduced ? .4 : .63;

  return <main className={`viewport${onCover ? ' cover-viewport' : ''}`} ref={stage}>
    {onCover ? <div className="cover" data-beat="cover">
      <h1>{cover.byline}</h1>
    </div> : <div className={`stage beat-${beat.id}${instant ? ' instant' : ''}${reduced ? ' reduced' : ''}`}
      data-beat={beat.id}
      onClick={() => { if (performance.now() >= suppressClick.current) move(1); }}
      onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerCancel={() => { gesture.current = null; }}>
      <svg className="scene" viewBox={`0 0 ${width} ${height}`} aria-label="The Living Map">
        <Definitions />
        <rect width={width} height={height} fill="url(#sea-light)" />
        <g className="camera-shake">
          <motion.g style={{ opacity }}>
            <StillScene.Provider value={still}>
              <World beat={beat} camera={camera} inverse={inverse} timeline={beat.id === 'colonies'} />
            </StillScene.Provider>
          </motion.g>
        </g>
        <Atmosphere particles={!reduced} />
        <Frame />
        <AnimatePresence initial={false}>
          {year && <motion.g key={yearKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: transition }} className="year-indicator">
            <text x="105" y="180">{year}</text>
            <path d="M108 201h54" />
          </motion.g>}
        </AnimatePresence>
        <g key={navigation.revision} className="beat-copy">
          <Copy beat={beat} timelineYear={timelineYear} />
        </g>
        {notes && <foreignObject x="1279" y="932" width="534" height="112" onClick={event => event.stopPropagation()}>
          <aside className="notes" aria-label="Speaker notes">{beat.notes}</aside>
        </foreignObject>}
      </svg>
      {fullscreenError && <div className="fullscreen-feedback" role="status">Fullscreen is unavailable.</div>}
      <div className="progress" role="progressbar" aria-label="Presentation progress" aria-valuemin={1} aria-valuemax={beats.length} aria-valuenow={navigation.index + 1}>
        <div className="progress-fill" style={{ width: `${navigation.index / (beats.length - 1) * 100}%` }} />
        {beats.map((item, index) => <i key={item.id} className={index <= navigation.index ? 'visited' : ''} style={{ left: `${index / (beats.length - 1) * 100}%` }} />)}
      </div>
    </div>}
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
