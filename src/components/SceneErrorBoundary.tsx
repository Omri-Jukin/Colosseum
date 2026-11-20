import { Component, type ErrorInfo, type ReactNode } from 'react'

interface SceneErrorBoundaryProps {
  children: ReactNode
}

interface SceneErrorBoundaryState {
  hasError: boolean
}

export class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('The 3D Colosseum scene could not be loaded.', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="scene-failure"
          data-testid="scene-error"
          role="alert"
        >
          <div className="scene-failure__arch" aria-hidden="true" />
          <p className="eyebrow">3D scene unavailable</p>
          <h2>The amphitheatre could not be loaded.</h2>
          <p>
            Check your connection, then retry. The ticket controls remain
            available at the final station.
          </p>
          <button type="button" onClick={() => window.location.reload()}>
            Retry scene
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
