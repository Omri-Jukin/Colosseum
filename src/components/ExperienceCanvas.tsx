import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useProgress } from '@react-three/drei'
import * as THREE from 'three'
import {
  APPROACH_SPUR_YAW,
  FINAL_CAMERA_POSITION,
  FINAL_ROUTE_DIRECTION,
  MODEL_YAW,
  PAVILION_POSITION,
  PAVILION_YAW,
  WALKWAY_CAMERA_RADIUS,
  WALKWAY_INNER_RADIUS,
  WALKWAY_OUTER_RADIUS,
  WALKWAY_X_SCALE,
  getEllipsePoint,
  getJourneyPose,
} from '../lib/journeyGeometry'

interface ExperienceCanvasProps {
  progress: number
  reducedMotion: boolean
}

function JourneyCamera({
  progress,
  reducedMotion,
}: ExperienceCanvasProps) {
  const { camera, size } = useThree()
  const smoothedProgress = useRef(progress)
  const destination = useMemo(() => new THREE.Vector3(), [])
  const destinationTarget = useMemo(() => new THREE.Vector3(), [])
  const isMobile = size.width < 720

  useFrame((_, delta) => {
    smoothedProgress.current = reducedMotion
      ? progress
      : THREE.MathUtils.damp(
          smoothedProgress.current,
          progress,
          3.6,
          delta,
        )

    const pose = getJourneyPose(smoothedProgress.current)
    destination.fromArray(pose.position)
    destinationTarget.fromArray(pose.target)

    if (isMobile) {
      const exteriorOffset = Math.max(
        0,
        1 - smoothedProgress.current * 4,
      )
      destination.y += exteriorOffset * 1.8
      destination.z += exteriorOffset * 5.8
    }

    camera.position.copy(destination)
    camera.lookAt(destinationTarget)
  })

  return null
}

function AmphitheatreModel() {
  const { scene } = useGLTF('/models/roman-amphitheatre.glb')

  const normalizedScene = useMemo(() => {
    const clone = scene.clone(true)
    const bounds = new THREE.Box3().setFromObject(clone)
    const size = bounds.getSize(new THREE.Vector3())
    const horizontalSize = Math.max(size.x, size.z)
    const scale = horizontalSize > 0 ? 18 / horizontalSize : 1

    clone.scale.setScalar(scale)
    const scaledBounds = new THREE.Box3().setFromObject(clone)
    const center = scaledBounds.getCenter(new THREE.Vector3())
    clone.position.set(-center.x, -scaledBounds.min.y, -center.z)
    clone.rotation.y = -0.25

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    return clone
  }, [scene])

  return <primitive object={normalizedScene} />
}

function Dust() {
  const points = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const values = new Float32Array(360 * 3)
    let seed = 81
    const random = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }

    for (let index = 0; index < 360; index += 1) {
      values[index * 3] = (random() - 0.5) * 30
      values[index * 3 + 1] = random() * 10 + 0.25
      values[index * 3 + 2] = (random() - 0.5) * 30
    }

    return values
  }, [])

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.008
      points.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.12) * 0.08
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#f2c98f"
        size={0.055}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </points>
  )
}

function WayfindingStud({
  position,
  rotation = 0,
}: {
  position: [number, number, number]
  rotation?: number
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.045, 0]} receiveShadow>
        <boxGeometry args={[0.48, 0.07, 0.13]} />
        <meshStandardMaterial color="#72543a" metalness={0.55} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.087, 0]}>
        <boxGeometry args={[0.28, 0.015, 0.045]} />
        <meshStandardMaterial
          color="#f1b96d"
          emissive="#9a4f1d"
          emissiveIntensity={2.1}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function ExteriorPerimeter() {
  const routeStuds = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => {
        const angle = (index / 24) * Math.PI * 2
        return {
          position: getEllipsePoint(angle, WALKWAY_CAMERA_RADIUS, 0.02),
          rotation: MODEL_YAW - angle,
        }
      }),
    [],
  )
  const spurLength = Math.hypot(
    PAVILION_POSITION[0] - FINAL_CAMERA_POSITION[0],
    PAVILION_POSITION[2] - FINAL_CAMERA_POSITION[2],
  )
  const spurMidpoint: [number, number, number] = [
    (PAVILION_POSITION[0] + FINAL_CAMERA_POSITION[0]) / 2,
    0.055,
    (PAVILION_POSITION[2] + FINAL_CAMERA_POSITION[2]) / 2,
  ]
  const spurStuds = [0.14, 0.4, 0.66].map((amount) => ({
    position: [
      FINAL_CAMERA_POSITION[0] + FINAL_ROUTE_DIRECTION[0] * spurLength * amount,
      0.095,
      FINAL_CAMERA_POSITION[2] + FINAL_ROUTE_DIRECTION[2] * spurLength * amount,
    ] as [number, number, number],
    rotation: APPROACH_SPUR_YAW,
  }))

  return (
    <group>
      <group rotation={[0, MODEL_YAW, 0]}>
        <mesh
          position={[0, 0.015, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[WALKWAY_X_SCALE, 1, 1]}
          receiveShadow
        >
          <ringGeometry
            args={[WALKWAY_INNER_RADIUS, WALKWAY_OUTER_RADIUS, 128, 1]}
          />
          <meshStandardMaterial color="#76614d" roughness={0.96} />
        </mesh>
        <mesh
          position={[0, 0.032, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[WALKWAY_X_SCALE, 1, 1]}
          receiveShadow
        >
          <ringGeometry
            args={[
              WALKWAY_CAMERA_RADIUS - 0.12,
              WALKWAY_CAMERA_RADIUS + 0.12,
              128,
              1,
            ]}
          />
          <meshStandardMaterial color="#c5a77d" roughness={0.88} />
        </mesh>
        <mesh
          position={[0, 0.04, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[WALKWAY_X_SCALE, 1, 1]}
        >
          <ringGeometry
            args={[
              WALKWAY_INNER_RADIUS,
              WALKWAY_INNER_RADIUS + 0.07,
              128,
              1,
            ]}
          />
          <meshStandardMaterial
            color="#d5a15f"
            metalness={0.22}
            roughness={0.62}
          />
        </mesh>
      </group>
      {routeStuds.map((stud, index) => (
        <WayfindingStud
          key={index}
          position={stud.position}
          rotation={stud.rotation}
        />
      ))}
      <mesh
        position={spurMidpoint}
        rotation={[0, APPROACH_SPUR_YAW, 0]}
        receiveShadow
      >
        <boxGeometry args={[1.9, 0.08, spurLength]} />
        <meshStandardMaterial color="#8b7357" roughness={0.92} />
      </mesh>
      <mesh
        position={[spurMidpoint[0], 0.105, spurMidpoint[2]]}
        rotation={[0, APPROACH_SPUR_YAW, 0]}
      >
        <boxGeometry args={[0.09, 0.018, spurLength * 0.88]} />
        <meshStandardMaterial
          color="#e0b46f"
          emissive="#6f3518"
          emissiveIntensity={0.8}
        />
      </mesh>
      {spurStuds.map((stud, index) => (
        <WayfindingStud
          key={index}
          position={stud.position}
          rotation={stud.rotation}
        />
      ))}
    </group>
  )
}

function TicketPavilion() {
  const columnPositions = [
    [-1.38, 0.68],
    [1.38, 0.68],
    [-1.38, -0.68],
    [1.38, -0.68],
  ] as const

  return (
    <group position={PAVILION_POSITION} rotation={[0, PAVILION_YAW, 0]}>
      <mesh position={[0, 0.08, 0]} scale={[1, 1, 0.62]} receiveShadow>
        <cylinderGeometry args={[2.05, 2.05, 0.16, 64]} />
        <meshStandardMaterial color="#b9986e" roughness={0.88} />
      </mesh>
      <mesh
        position={[0, 0.18, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1, 0.62, 1]}
        receiveShadow
      >
        <ringGeometry args={[1.84, 2.04, 64]} />
        <meshStandardMaterial
          color="#d4aa6d"
          metalness={0.34}
          roughness={0.5}
        />
      </mesh>
      <mesh position={[0, 1.55, -0.7]} castShadow>
        <boxGeometry args={[2.85, 2.62, 0.12]} />
        <meshStandardMaterial color="#4b1f1b" roughness={0.74} />
      </mesh>
      <mesh position={[0, 1.08, 0.12]} castShadow receiveShadow>
        <boxGeometry args={[2.65, 1.04, 0.72]} />
        <meshStandardMaterial color="#2d1e17" roughness={0.78} />
      </mesh>
      <mesh position={[0, 1.63, 0.12]} castShadow>
        <boxGeometry args={[2.92, 0.11, 0.88]} />
        <meshStandardMaterial
          color="#bd8a50"
          metalness={0.34}
          roughness={0.44}
        />
      </mesh>
      {[-0.94, 0.94].map((x) => (
        <mesh key={x} position={[x, 1.56, -0.625]}>
          <boxGeometry args={[0.025, 2.48, 0.018]} />
          <meshStandardMaterial
            color="#a26f3e"
            metalness={0.45}
            roughness={0.5}
          />
        </mesh>
      ))}
      {columnPositions.map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 1.66, z]} castShadow>
          <cylinderGeometry args={[0.045, 0.065, 2.9, 12]} />
          <meshStandardMaterial
            color="#9e7547"
            metalness={0.58}
            roughness={0.38}
          />
        </mesh>
      ))}
      <mesh position={[0, 3.1, 0]} castShadow>
        <boxGeometry args={[3.34, 0.12, 1.78]} />
        <meshStandardMaterial
          color="#6a3d2e"
          metalness={0.18}
          roughness={0.6}
        />
      </mesh>
      <mesh position={[0, 3.015, 0.36]}>
        <boxGeometry args={[2.78, 0.025, 0.08]} />
        <meshStandardMaterial
          color="#f0c781"
          emissive="#8a421c"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 2.38, -0.625]}>
        <boxGeometry args={[2.12, 0.62, 0.04]} />
        <meshStandardMaterial
          color="#231711"
          metalness={0.2}
          roughness={0.66}
        />
      </mesh>
      <mesh position={[-0.7, 2.38, -0.595]}>
        <torusGeometry args={[0.17, 0.023, 8, 32]} />
        <meshStandardMaterial
          color="#e7ba72"
          emissive="#79411e"
          emissiveIntensity={1.35}
          metalness={0.38}
          roughness={0.4}
        />
      </mesh>
      {[
        [0.28, 2.5, 0.92],
        [0.2, 2.38, 0.76],
        [0.1, 2.26, 0.56],
      ].map(([x, y, width], index) => (
        <mesh key={index} position={[x, y, -0.595]}>
          <boxGeometry args={[width, 0.035, 0.022]} />
          <meshStandardMaterial
            color="#e7ba72"
            emissive="#79411e"
            emissiveIntensity={1.15}
            metalness={0.35}
            roughness={0.42}
          />
        </mesh>
      ))}
      {[-0.65, 0.65].map((x) => (
        <mesh key={x} position={[x, 1.7, 0.585]}>
          <boxGeometry args={[0.02, 0.06, 0.55]} />
          <meshStandardMaterial
            color="#efc47f"
            emissive="#7c3516"
            emissiveIntensity={1.7}
            toneMapped={false}
          />
        </mesh>
      ))}
      <mesh position={[-0.52, 1.68, 0.1]} rotation={[-0.16, 0.25, 0]}>
        <boxGeometry args={[0.76, 0.055, 0.5]} />
        <meshStandardMaterial color="#f0d7a7" roughness={0.86} />
      </mesh>
      {[-1.12, 1.12].flatMap((x) =>
        [1.55, 2.55].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            <mesh position={[0, 0.46, 0]} castShadow>
              <cylinderGeometry args={[0.045, 0.065, 0.82, 12]} />
              <meshStandardMaterial
                color="#9e7547"
                metalness={0.58}
                roughness={0.38}
              />
            </mesh>
            <mesh position={[0, 0.91, 0]}>
              <sphereGeometry args={[0.085, 12, 8]} />
              <meshStandardMaterial
                color="#d4aa6d"
                metalness={0.62}
                roughness={0.32}
              />
            </mesh>
          </group>
        )),
      )}
      {[-1.12, 1.12].map((x) => (
        <mesh key={x} position={[x, 0.72, 2.05]}>
          <boxGeometry args={[0.035, 0.035, 1]} />
          <meshStandardMaterial color="#6d3026" roughness={0.58} />
        </mesh>
      ))}
      <pointLight
        position={[0, 2.45, 1.25]}
        color="#e5a565"
        intensity={13}
        distance={7}
        decay={2}
      />
    </group>
  )
}

function World({ progress, reducedMotion }: ExperienceCanvasProps) {
  return (
    <>
      <color attach="background" args={['#130d0a']} />
      <fog attach="fog" args={['#21140e', 15, 44]} />
      <ambientLight intensity={0.65} color="#d6c5ae" />
      <hemisphereLight args={['#bdcad4', '#342015', 1.25]} />
      <directionalLight
        position={[10, 17, 11]}
        intensity={2.8}
        color="#ffd6a2"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={45}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />
      <mesh
        position={[0, -0.18, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[28, 80]} />
        <meshStandardMaterial color="#5a493a" roughness={0.96} />
      </mesh>
      <AmphitheatreModel />
      <ExteriorPerimeter />
      <TicketPavilion />
      <Dust />
      <JourneyCamera progress={progress} reducedMotion={reducedMotion} />
    </>
  )
}

function SceneLoadingOverlay() {
  const { active, progress, total, loaded } = useProgress()
  const isReady = !active && total > 0 && loaded === total

  if (isReady) {
    return null
  }

  return (
    <div
      className="scene-loading"
      role="status"
      data-testid="scene-loading"
      aria-live="polite"
    >
      <span className="scene-loading__ring" aria-hidden="true" />
      <p>Reconstructing the amphitheatre</p>
      <strong>{Math.round(progress)}%</strong>
    </div>
  )
}

export default function ExperienceCanvas({
  progress,
  reducedMotion,
}: ExperienceCanvasProps) {
  return (
    <div className="scene-canvas">
      <Canvas
        data-testid="scene-canvas"
        dpr={[1, 1.5]}
        camera={{ fov: 42, near: 0.1, far: 100, position: [23, 9, 24] }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        shadows="basic"
      >
        <Suspense fallback={null}>
          <World progress={progress} reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
      <SceneLoadingOverlay />
    </div>
  )
}
