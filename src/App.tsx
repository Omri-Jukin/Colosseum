import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { journeyStops } from './data/journey'
import { SceneErrorBoundary } from './components/SceneErrorBoundary'
import { TicketPanel } from './components/TicketPanel'
import { useReducedMotion } from './hooks/useReducedMotion'

const ExperienceCanvas = lazy(() => import('./components/ExperienceCanvas'))

function ArrowIcon({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={direction === 'up' ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  )
}

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const sectionRefs = useRef<Array<HTMLElement | null>>([])
  const frame = useRef<number | null>(null)
  const reducedMotion = useReducedMotion()

  const updateJourneyPosition = useCallback(() => {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight
    const progress =
      maxScroll > 0
        ? Math.min(1, Math.max(0, window.scrollY / maxScroll))
        : 0

    setScrollProgress(progress)
    setActiveStep(
      Math.min(
        journeyStops.length - 1,
        Math.round(progress * (journeyStops.length - 1)),
      ),
    )
  }, [])

  useEffect(() => {
    const onScroll = () => {
      if (frame.current !== null) {
        return
      }

      frame.current = window.requestAnimationFrame(() => {
        updateJourneyPosition()
        frame.current = null
      })
    }

    frame.current = window.requestAnimationFrame(() => {
      updateJourneyPosition()
      frame.current = null
    })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame.current !== null) {
        window.cancelAnimationFrame(frame.current)
      }
    }
  }, [updateJourneyPosition])

  const goToStep = useCallback(
    (index: number) => {
      const safeIndex = Math.min(
        journeyStops.length - 1,
        Math.max(0, index),
      )
      const isCompactViewport = window.matchMedia(
        '(max-width: 680px)',
      ).matches
      sectionRefs.current[safeIndex]?.scrollIntoView({
        behavior: reducedMotion || isCompactViewport ? 'auto' : 'smooth',
        block: 'start',
      })
    },
    [reducedMotion],
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (
        target instanceof HTMLElement &&
        target.closest('input, select, button, textarea')
      ) {
        return
      }

      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault()
        goToStep(activeStep + 1)
      }

      if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault()
        goToStep(activeStep - 1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeStep, goToStep])

  return (
    <div className="journey-shell" data-testid="experience-root">
      <a className="skip-link" href="#tickets">
        Skip to ticket station
      </a>

      <div className="scene-region" aria-hidden="true">
        <SceneErrorBoundary>
          <Suspense
            fallback={
              <div className="scene-loading" role="status">
                <span className="scene-loading__ring" aria-hidden="true" />
                <p>Preparing the 3D journey</p>
              </div>
            }
          >
            <ExperienceCanvas
              progress={scrollProgress}
              reducedMotion={reducedMotion}
            />
          </Suspense>
        </SceneErrorBoundary>
      </div>

      <header className="site-header">
        <div className="wordmark">
          <span className="wordmark__seal" aria-hidden="true">
            C
          </span>
          <span>
            <strong>AMPHITHEATRVM</strong>
            <small>ROMA · 80 CE</small>
          </span>
        </div>
        <div className="header-status">
          <span aria-hidden="true" />
          Nine-stage perimeter
        </div>
      </header>

      <nav className="progress-rail" aria-label="Journey progress">
        <span className="progress-rail__line" aria-hidden="true">
          <i style={{ height: `${scrollProgress * 100}%` }} />
        </span>
        {journeyStops.map((stop, index) => (
          <button
            key={stop.id}
            type="button"
            aria-label={`Go to ${stop.title}`}
            aria-current={activeStep === index ? 'step' : undefined}
            data-testid={`progress-step-${index}`}
            onClick={() => goToStep(index)}
          >
            <span>{stop.numeral}</span>
          </button>
        ))}
      </nav>

      <main>
        {journeyStops.map((stop, index) => (
          <section
            key={stop.id}
            id={stop.id}
            ref={(element) => {
              sectionRefs.current[index] = element
            }}
            className={`journey-stop ${
              activeStep === index ? 'journey-stop--active' : ''
            }`}
            aria-labelledby={`${stop.id}-title`}
            data-testid={`journey-section-${index}`}
            data-kind={stop.kind}
          >
            <div className="chapter-copy">
              <div className="chapter-copy__index" aria-hidden="true">
                {stop.numeral}
              </div>
              <div>
                <p className="eyebrow">{stop.kicker}</p>
                {index === 0 ? (
                  <h1 id={`${stop.id}-title`}>
                    <span>THE</span>
                    <span>COLOSSEUM</span>
                  </h1>
                ) : (
                  <h2 id={`${stop.id}-title`}>{stop.title}</h2>
                )}
                <p className="chapter-datum">{stop.datum}</p>
                <p>{stop.copy}</p>
                {stop.source && (
                  <a
                    className="fact-source"
                    href={stop.source.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span aria-hidden="true">✓</span>
                    Verified source · {stop.source.label}
                    <span aria-hidden="true">↗</span>
                  </a>
                )}
                {index === 0 && (
                  <button
                    className="begin-button"
                    type="button"
                    onClick={() => goToStep(1)}
                  >
                    Begin the approach
                    <ArrowIcon direction="down" />
                  </button>
                )}
              </div>
            </div>
          </section>
        ))}
      </main>

      <TicketPanel visible={activeStep === journeyStops.length - 1} />

      <div className="journey-controls" aria-label="Section navigation">
        <button
          type="button"
          aria-label="Previous section"
          data-testid="previous-section"
          disabled={activeStep === 0}
          onClick={() => goToStep(activeStep - 1)}
        >
          <ArrowIcon direction="up" />
        </button>
        <output
          aria-live="polite"
          aria-label={`Section ${activeStep + 1} of ${journeyStops.length}`}
          data-testid="journey-step"
        >
          <strong>{String(activeStep + 1).padStart(2, '0')}</strong>
          <span>/</span>
          <small>{String(journeyStops.length).padStart(2, '0')}</small>
        </output>
        <button
          type="button"
          aria-label="Next section"
          data-testid="next-section"
          disabled={activeStep === journeyStops.length - 1}
          onClick={() => goToStep(activeStep + 1)}
        >
          <ArrowIcon direction="down" />
        </button>
      </div>

      <a
        className="asset-credit"
        href="https://sketchfab.com/3d-models/low-poly-roman-amphitheatre-wip-ee2aaad3ef1446ee9a69e5c9bde1fca4"
        target="_blank"
        rel="noreferrer"
      >
        3D model: AlexFerrart3D · CC BY 4.0
      </a>
    </div>
  )
}
