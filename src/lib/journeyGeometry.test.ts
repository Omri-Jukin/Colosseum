import { describe, expect, it } from 'vitest'
import {
  FINAL_CAMERA_POSITION,
  MODEL_YAW,
  PAVILION_POSITION,
  PAVILION_YAW,
  WALKWAY_CAMERA_RADIUS,
  WALKWAY_X_SCALE,
  getEllipseTangent,
  getJourneyPose,
} from './journeyGeometry'

function toModelLocal(x: number, z: number): [number, number] {
  const cosine = Math.cos(MODEL_YAW)
  const sine = Math.sin(MODEL_YAW)
  return [cosine * x - sine * z, sine * x + cosine * z]
}

describe('journey geometry', () => {
  it('keeps the walking camera outside the measured model envelope', () => {
    for (let sample = 0; sample <= 120; sample += 1) {
      const progress = 0.25 + (sample / 120) * 0.75
      const { position } = getJourneyPose(progress)
      const [localX, localZ] = toModelLocal(position[0], position[2])
      const envelopeDistance = Math.hypot(localX / 7.4, localZ / 9.2)

      expect(envelopeDistance).toBeGreaterThan(1.18)
    }
  })

  it('uses the model-aligned long axis for the visible route', () => {
    expect(WALKWAY_CAMERA_RADIUS * WALKWAY_X_SCALE).toBeLessThan(
      WALKWAY_CAMERA_RADIUS,
    )
  })

  it('places the final camera at human eye height', () => {
    expect(getJourneyPose(1).position).toEqual(FINAL_CAMERA_POSITION)
    expect(FINAL_CAMERA_POSITION[1]).toBeCloseTo(1.72)
  })

  it('keeps the walking sightline aligned with the path', () => {
    for (const progress of [0.28, 0.34, 0.42, 0.53, 0.66, 0.78]) {
      const { position, target } = getJourneyPose(progress)
      const [localX, localZ] = toModelLocal(position[0], position[2])
      const angle = Math.atan2(
        localZ / WALKWAY_CAMERA_RADIUS,
        localX / (WALKWAY_CAMERA_RADIUS * WALKWAY_X_SCALE),
      )
      const tangent = getEllipseTangent(angle)
      const view = [
        target[0] - position[0],
        target[2] - position[2],
      ]
      const viewLength = Math.hypot(...view)
      const alignment =
        tangent[0] * (view[0] / viewLength) +
        tangent[2] * (view[1] / viewLength)

      expect(alignment).toBeGreaterThan(0.99)
    }
  })

  it('faces the pavilion customer side toward the arriving camera', () => {
    const frontDirection = [Math.sin(PAVILION_YAW), Math.cos(PAVILION_YAW)]
    const cameraDirection = [
      FINAL_CAMERA_POSITION[0] - PAVILION_POSITION[0],
      FINAL_CAMERA_POSITION[2] - PAVILION_POSITION[2],
    ]
    const cameraLength = Math.hypot(...cameraDirection)
    const alignment =
      frontDirection[0] * (cameraDirection[0] / cameraLength) +
      frontDirection[1] * (cameraDirection[1] / cameraLength)

    expect(alignment).toBeGreaterThan(0.999)
  })
})
