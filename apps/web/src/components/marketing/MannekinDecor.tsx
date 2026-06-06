'use client'

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Zones that are pre-highlighted to illustrate the feature
const HIGHLIGHTED = new Set(['forehead', 'cheeks', 'lips', 'decolletage', 'chest', 'arms'])

const C_BASE = '#e8dff0'
const C_LIT  = '#C06078'

function Body() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.35
  })

  const c = (zone: string) => HIGHLIGHTED.has(zone) ? C_LIT : C_BASE

  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 3.5, 0]}>
        <sphereGeometry args={[0.36, 32, 32]} />
        <meshStandardMaterial color={C_BASE} roughness={0.45} metalness={0.04} />
      </mesh>

      {/* Forehead highlight */}
      <Mesh zone="forehead" color={c('forehead')} position={[0, 3.74, 0.26]} rotation={[-0.45,0,0]}>
        <planeGeometry args={[0.36, 0.14]} />
      </Mesh>

      {/* Cheeks */}
      <Mesh color={c('cheeks')} position={[-0.24, 3.5, 0.26]} rotation={[0, 0.55, 0]}>
        <planeGeometry args={[0.15, 0.15]} />
      </Mesh>
      <Mesh color={c('cheeks')} position={[0.24, 3.5, 0.26]} rotation={[0, -0.55, 0]}>
        <planeGeometry args={[0.15, 0.15]} />
      </Mesh>

      {/* Lips */}
      <Mesh color={c('lips')} position={[0, 3.38, 0.33]} rotation={[0.18,0,0]}>
        <planeGeometry args={[0.19, 0.09]} />
      </Mesh>

      {/* Neck */}
      <Mesh color={C_BASE} position={[0, 3.06, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.22, 16]} />
      </Mesh>

      {/* Shoulders */}
      <Mesh color={C_BASE} position={[-0.64, 2.76, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
      </Mesh>
      <Mesh color={C_BASE} position={[0.64, 2.76, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
      </Mesh>

      {/* Decolletage */}
      <Mesh color={c('decolletage')} position={[0, 2.83, 0.11]}>
        <boxGeometry args={[0.7, 0.14, 0.17]} />
      </Mesh>

      {/* Chest */}
      <Mesh color={c('chest')} position={[0, 2.48, 0]}>
        <boxGeometry args={[0.76, 0.44, 0.3]} />
      </Mesh>

      {/* Abdomen */}
      <Mesh color={C_BASE} position={[0, 1.94, 0]}>
        <boxGeometry args={[0.66, 0.54, 0.26]} />
      </Mesh>

      {/* Back */}
      <Mesh color={C_BASE} position={[0, 2.3, -0.18]}>
        <boxGeometry args={[0.82, 0.86, 0.07]} />
      </Mesh>

      {/* Arms */}
      <Mesh color={c('arms')} position={[-0.86, 2.22, 0]}>
        <cylinderGeometry args={[0.09, 0.075, 0.74, 12]} />
      </Mesh>
      <Mesh color={c('arms')} position={[0.86, 2.22, 0]}>
        <cylinderGeometry args={[0.09, 0.075, 0.74, 12]} />
      </Mesh>
      <Mesh color={c('arms')} position={[-0.86, 1.65, 0]}>
        <cylinderGeometry args={[0.07, 0.055, 0.6, 12]} />
      </Mesh>
      <Mesh color={c('arms')} position={[0.86, 1.65, 0]}>
        <cylinderGeometry args={[0.07, 0.055, 0.6, 12]} />
      </Mesh>

      {/* Hands */}
      <Mesh color={C_BASE} position={[-0.86, 1.27, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
      </Mesh>
      <Mesh color={C_BASE} position={[0.86, 1.27, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
      </Mesh>

      {/* Thighs */}
      <Mesh color={C_BASE} position={[-0.22, 0.98, 0]}>
        <cylinderGeometry args={[0.16, 0.14, 0.65, 12]} />
      </Mesh>
      <Mesh color={C_BASE} position={[0.22, 0.98, 0]}>
        <cylinderGeometry args={[0.16, 0.14, 0.65, 12]} />
      </Mesh>

      {/* Knees */}
      <Mesh color={C_BASE} position={[-0.22, 0.54, 0]}>
        <sphereGeometry args={[0.14, 12, 12]} />
      </Mesh>
      <Mesh color={C_BASE} position={[0.22, 0.54, 0]}>
        <sphereGeometry args={[0.14, 12, 12]} />
      </Mesh>

      {/* Calves */}
      <Mesh color={C_BASE} position={[-0.22, 0.04, 0]}>
        <cylinderGeometry args={[0.11, 0.08, 0.7, 12]} />
      </Mesh>
      <Mesh color={C_BASE} position={[0.22, 0.04, 0]}>
        <cylinderGeometry args={[0.11, 0.08, 0.7, 12]} />
      </Mesh>

      {/* Feet */}
      <Mesh color={C_BASE} position={[-0.22, -0.41, 0.07]}>
        <boxGeometry args={[0.17, 0.1, 0.32]} />
      </Mesh>
      <Mesh color={C_BASE} position={[0.22, -0.41, 0.07]}>
        <boxGeometry args={[0.17, 0.1, 0.32]} />
      </Mesh>
    </group>
  )
}

// TypeScript helper — zone prop unused at runtime but keeps JSX clean
function Mesh({ color, position, rotation = [0,0,0], children, zone: _zone }: {
  color: string
  position: [number,number,number]
  rotation?: [number,number,number]
  children: React.ReactNode
  zone?: string
}) {
  return (
    <mesh position={position} rotation={rotation as [number,number,number]}>
      {children}
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.04} />
    </mesh>
  )
}

function Scene() {
  return (
    <Canvas
      shadows={false}
      camera={{ position: [0, 2.2, 6.5], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[4, 6, 4]} intensity={1.3} />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} />
      <Suspense fallback={null}>
        <Body />
      </Suspense>
    </Canvas>
  )
}

export function MannekinDecor() {
  return (
    <div className="relative w-full" style={{ height: 520 }}>
      <Scene />
      {/* Zone legend */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 pointer-events-none">
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--bp-muted)', fontFamily: 'monospace' }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: C_LIT, display: 'inline-block' }} />
          treatment zones
        </span>
      </div>
    </div>
  )
}
