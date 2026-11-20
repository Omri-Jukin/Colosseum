export type Point3 = [number, number, number]

export const MODEL_YAW = -0.25
export const WALKWAY_X_SCALE = 0.82
export const WALKWAY_INNER_RADIUS = 9.6
export const WALKWAY_OUTER_RADIUS = 11.6
export const WALKWAY_CAMERA_RADIUS = 10.95

const HERO_POSITION: Point3 = [23, 9, 24]
const APPROACH_ANGLE = Math.PI / 6
const APPROACH_RADIUS = 16.5
const EYE_HEIGHT = 1.72
const LOOK_AHEAD_DISTANCE = 7
const LOOK_INWARD_DISTANCE = 0.9
const WALK_STAGE_ANGLES = [30, 70, 110, 150, 190, 230, 240].map(
  (degrees) => (degrees * Math.PI) / 180,
)

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function easeInOut(value: number): number {
  const t = clamp01(value)
  return t * t * (3 - 2 * t)
}

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount
}

function lerpPoint(start: Point3, end: Point3, amount: number): Point3 {
  return [
    lerp(start[0], end[0], amount),
    lerp(start[1], end[1], amount),
    lerp(start[2], end[2], amount),
  ]
}

function normalizeHorizontal(point: Point3): Point3 {
  const length = Math.hypot(point[0], point[2])
  return length > 0
    ? [point[0] / length, 0, point[2] / length]
    : [0, 0, 1]
}

export function getEllipsePoint(
  angle: number,
  radius = WALKWAY_CAMERA_RADIUS,
  y = EYE_HEIGHT,
): Point3 {
  const localX = Math.cos(angle) * radius * WALKWAY_X_SCALE
  const localZ = Math.sin(angle) * radius
  const cosine = Math.cos(MODEL_YAW)
  const sine = Math.sin(MODEL_YAW)

  return [
    cosine * localX + sine * localZ,
    y,
    -sine * localX + cosine * localZ,
  ]
}

export function getEllipseTangent(angle: number): Point3 {
  const localX = -Math.sin(angle) * WALKWAY_CAMERA_RADIUS * WALKWAY_X_SCALE
  const localZ = Math.cos(angle) * WALKWAY_CAMERA_RADIUS
  const cosine = Math.cos(MODEL_YAW)
  const sine = Math.sin(MODEL_YAW)

  return normalizeHorizontal([
    cosine * localX + sine * localZ,
    0,
    -sine * localX + cosine * localZ,
  ])
}

export const FINAL_CAMERA_POSITION = getEllipsePoint(
  WALK_STAGE_ANGLES.at(-1) ?? 0,
)
export const FINAL_ROUTE_DIRECTION = getEllipseTangent(
  WALK_STAGE_ANGLES.at(-1) ?? 0,
)
export const PAVILION_POSITION: Point3 = [
  FINAL_CAMERA_POSITION[0] + FINAL_ROUTE_DIRECTION[0] * 5.2,
  0.07,
  FINAL_CAMERA_POSITION[2] + FINAL_ROUTE_DIRECTION[2] * 5.2,
]
export const PAVILION_YAW = Math.atan2(
  -FINAL_ROUTE_DIRECTION[0],
  -FINAL_ROUTE_DIRECTION[2],
)
export const APPROACH_SPUR_YAW = Math.atan2(
  FINAL_ROUTE_DIRECTION[0],
  FINAL_ROUTE_DIRECTION[2],
)

export interface JourneyPose {
  position: Point3
  target: Point3
}

function getWalkingTarget(angle: number, position: Point3): Point3 {
  const tangent = getEllipseTangent(angle)
  const inward = normalizeHorizontal([
    -position[0],
    0,
    -position[2],
  ])

  return [
    position[0] +
      tangent[0] * LOOK_AHEAD_DISTANCE +
      inward[0] * LOOK_INWARD_DISTANCE,
    1.65,
    position[2] +
      tangent[2] * LOOK_AHEAD_DISTANCE +
      inward[2] * LOOK_INWARD_DISTANCE,
  ]
}

export function getJourneyPose(progress: number): JourneyPose {
  const stageProgress = clamp01(progress) * 8
  const segment = Math.min(7, Math.floor(stageProgress))
  const amount = easeInOut(stageProgress - segment)
  const approachPosition = getEllipsePoint(
    APPROACH_ANGLE,
    APPROACH_RADIUS,
    3.4,
  )
  const monumentTarget: Point3 = [0, 2.8, 0]

  if (segment === 0) {
    return {
      position: lerpPoint(HERO_POSITION, approachPosition, amount),
      target: monumentTarget,
    }
  }

  if (segment === 1) {
    const radius = lerp(APPROACH_RADIUS, WALKWAY_CAMERA_RADIUS, amount)
    const position = getEllipsePoint(
      APPROACH_ANGLE,
      radius,
      lerp(3.4, EYE_HEIGHT, amount),
    )
    const walkingTarget = getWalkingTarget(APPROACH_ANGLE, position)

    return {
      position,
      target: lerpPoint(monumentTarget, walkingTarget, amount),
    }
  }

  const startAngle = WALK_STAGE_ANGLES[segment - 2]
  const endAngle = WALK_STAGE_ANGLES[segment - 1]
  const angle = lerp(startAngle, endAngle, amount)
  const position = getEllipsePoint(angle)
  const walkingTarget = getWalkingTarget(angle, position)

  if (segment === 7) {
    return {
      position,
      target: lerpPoint(
        walkingTarget,
        [PAVILION_POSITION[0], 1.48, PAVILION_POSITION[2]],
        amount,
      ),
    }
  }

  return {
    position,
    target: walkingTarget,
  }
}
