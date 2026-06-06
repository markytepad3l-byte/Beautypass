'use client'

import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { BodyZone } from './BodyZonePicker'

const C_BASE = '#f0eaf4'
const C_HOVER = '#dbbac8'
const C_SELECT = '#C06078'

function Zone({
  zone, selected, onSelect, position, rotation = [0, 0, 0], children,
}: {
  zone: BodyZone
  selected: boolean
  onSelect: (z: BodyZone) => void
  position: [number, number, number]
  rotation?: [number, number, number]
  children: React.ReactNode
}) {
  const [hov, setHov] = useState(false)
  return (
    <mesh
      position={position}
      rotation={rotation as [number, number, number]}
      onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(zone) }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHov(true); (document.body.style as CSSStyleDeclaration).cursor = 'pointer' }}
      onPointerOut={() => { setHov(false); (document.body.style as CSSStyleDeclaration).cursor = '' }}
    >
      {children}
      <meshStandardMaterial
        color={selected ? C_SELECT : hov ? C_HOVER : C_BASE}
        roughness={0.35}
        metalness={0.04}
      />
    </mesh>
  )
}

function BodyModel({ value, onSelect }: { value?: string; onSelect: (z: BodyZone) => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const [userMoved, setUserMoved] = useState(false)
  const s = (z: BodyZone) => z === value

  useFrame((_, dt) => {
    if (!userMoved && groupRef.current) groupRef.current.rotation.y += dt * 0.28
  })

  return (
    <>
      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={10}
        minPolarAngle={Math.PI * 0.1}
        maxPolarAngle={Math.PI * 0.9}
        onStart={() => setUserMoved(true)}
      />
      <group ref={groupRef}>
        {/* ── HEAD (visual only, face zones overlay it) ── */}
        <mesh position={[0, 3.5, 0]}>
          <sphereGeometry args={[0.36, 32, 32]} />
          <meshStandardMaterial color={C_BASE} roughness={0.35} metalness={0.04} />
        </mesh>

        {/* ── FACE ZONES (planes raised from sphere surface) ── */}
        <Zone zone="forehead" selected={s('forehead')} onSelect={onSelect} position={[0, 3.74, 0.26]} rotation={[-0.45, 0, 0]}>
          <planeGeometry args={[0.36, 0.14]} />
        </Zone>
        <Zone zone="eyes" selected={s('eyes')} onSelect={onSelect} position={[-0.12, 3.61, 0.32]} rotation={[-0.15, 0.25, 0]}>
          <planeGeometry args={[0.13, 0.08]} />
        </Zone>
        <Zone zone="eyes" selected={s('eyes')} onSelect={onSelect} position={[0.12, 3.61, 0.32]} rotation={[-0.15, -0.25, 0]}>
          <planeGeometry args={[0.13, 0.08]} />
        </Zone>
        <Zone zone="cheeks" selected={s('cheeks')} onSelect={onSelect} position={[-0.24, 3.5, 0.26]} rotation={[0, 0.55, 0]}>
          <planeGeometry args={[0.15, 0.15]} />
        </Zone>
        <Zone zone="cheeks" selected={s('cheeks')} onSelect={onSelect} position={[0.24, 3.5, 0.26]} rotation={[0, -0.55, 0]}>
          <planeGeometry args={[0.15, 0.15]} />
        </Zone>
        <Zone zone="nose" selected={s('nose')} onSelect={onSelect} position={[0, 3.5, 0.36]}>
          <planeGeometry args={[0.1, 0.13]} />
        </Zone>
        <Zone zone="lips" selected={s('lips')} onSelect={onSelect} position={[0, 3.38, 0.33]} rotation={[0.18, 0, 0]}>
          <planeGeometry args={[0.19, 0.09]} />
        </Zone>
        <Zone zone="jaw" selected={s('jaw')} onSelect={onSelect} position={[0, 3.27, 0.26]} rotation={[0.5, 0, 0]}>
          <planeGeometry args={[0.3, 0.1]} />
        </Zone>
        <Zone zone="chin" selected={s('chin')} onSelect={onSelect} position={[0, 3.17, 0.22]} rotation={[0.75, 0, 0]}>
          <planeGeometry args={[0.16, 0.09]} />
        </Zone>

        {/* ── NECK ── */}
        <Zone zone="neck" selected={s('neck')} onSelect={onSelect} position={[0, 3.06, 0]}>
          <cylinderGeometry args={[0.12, 0.14, 0.22, 16]} />
        </Zone>

        {/* ── SHOULDERS ── */}
        <Zone zone="shoulders" selected={s('shoulders')} onSelect={onSelect} position={[-0.64, 2.76, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
        </Zone>
        <Zone zone="shoulders" selected={s('shoulders')} onSelect={onSelect} position={[0.64, 2.76, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
        </Zone>

        {/* ── DECOLLETAGE ── */}
        <Zone zone="decolletage" selected={s('decolletage')} onSelect={onSelect} position={[0, 2.83, 0.11]}>
          <boxGeometry args={[0.7, 0.14, 0.17]} />
        </Zone>

        {/* ── CHEST ── */}
        <Zone zone="chest" selected={s('chest')} onSelect={onSelect} position={[0, 2.48, 0]}>
          <boxGeometry args={[0.76, 0.44, 0.3]} />
        </Zone>

        {/* ── ABDOMEN ── */}
        <Zone zone="abdomen" selected={s('abdomen')} onSelect={onSelect} position={[0, 1.94, 0]}>
          <boxGeometry args={[0.66, 0.54, 0.26]} />
        </Zone>

        {/* ── BACK (visible from rear) ── */}
        <Zone zone="back" selected={s('back')} onSelect={onSelect} position={[0, 2.3, -0.18]}>
          <boxGeometry args={[0.82, 0.86, 0.07]} />
        </Zone>

        {/* ── GLUTES ── */}
        <Zone zone="glutes" selected={s('glutes')} onSelect={onSelect} position={[0, 1.57, -0.16]}>
          <boxGeometry args={[0.64, 0.3, 0.2]} />
        </Zone>

        {/* ── UPPER ARMS ── */}
        <Zone zone="arms" selected={s('arms')} onSelect={onSelect} position={[-0.86, 2.22, 0]}>
          <cylinderGeometry args={[0.09, 0.075, 0.74, 12]} />
        </Zone>
        <Zone zone="arms" selected={s('arms')} onSelect={onSelect} position={[0.86, 2.22, 0]}>
          <cylinderGeometry args={[0.09, 0.075, 0.74, 12]} />
        </Zone>

        {/* ── FOREARMS ── */}
        <Zone zone="arms" selected={s('arms')} onSelect={onSelect} position={[-0.86, 1.65, 0]}>
          <cylinderGeometry args={[0.07, 0.055, 0.6, 12]} />
        </Zone>
        <Zone zone="arms" selected={s('arms')} onSelect={onSelect} position={[0.86, 1.65, 0]}>
          <cylinderGeometry args={[0.07, 0.055, 0.6, 12]} />
        </Zone>

        {/* ── HANDS ── */}
        <Zone zone="hands" selected={s('hands')} onSelect={onSelect} position={[-0.86, 1.27, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
        </Zone>
        <Zone zone="hands" selected={s('hands')} onSelect={onSelect} position={[0.86, 1.27, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
        </Zone>

        {/* ── THIGHS ── */}
        <Zone zone="thighs" selected={s('thighs')} onSelect={onSelect} position={[-0.22, 0.98, 0]}>
          <cylinderGeometry args={[0.16, 0.14, 0.65, 12]} />
        </Zone>
        <Zone zone="thighs" selected={s('thighs')} onSelect={onSelect} position={[0.22, 0.98, 0]}>
          <cylinderGeometry args={[0.16, 0.14, 0.65, 12]} />
        </Zone>

        {/* ── KNEES ── */}
        <Zone zone="knees" selected={s('knees')} onSelect={onSelect} position={[-0.22, 0.54, 0]}>
          <sphereGeometry args={[0.14, 12, 12]} />
        </Zone>
        <Zone zone="knees" selected={s('knees')} onSelect={onSelect} position={[0.22, 0.54, 0]}>
          <sphereGeometry args={[0.14, 12, 12]} />
        </Zone>

        {/* ── CALVES ── */}
        <Zone zone="calves" selected={s('calves')} onSelect={onSelect} position={[-0.22, 0.04, 0]}>
          <cylinderGeometry args={[0.11, 0.08, 0.7, 12]} />
        </Zone>
        <Zone zone="calves" selected={s('calves')} onSelect={onSelect} position={[0.22, 0.04, 0]}>
          <cylinderGeometry args={[0.11, 0.08, 0.7, 12]} />
        </Zone>

        {/* ── FEET ── */}
        <Zone zone="feet" selected={s('feet')} onSelect={onSelect} position={[-0.22, -0.41, 0.07]}>
          <boxGeometry args={[0.17, 0.1, 0.32]} />
        </Zone>
        <Zone zone="feet" selected={s('feet')} onSelect={onSelect} position={[0.22, -0.41, 0.07]}>
          <boxGeometry args={[0.17, 0.1, 0.32]} />
        </Zone>
      </group>
    </>
  )
}

export function Body3DPicker({ value, onSelect }: { value?: string; onSelect: (z: BodyZone) => void }) {
  return (
    <div
      className="relative w-full rounded-2xl border overflow-hidden"
      style={{ height: 480, background: 'var(--bp-bg)', borderColor: 'var(--bp-border)' }}
    >
      <Canvas
        shadows={false}
        camera={{ position: [0, 2.2, 6.5], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 6, 4]} intensity={1.4} />
        <directionalLight position={[-4, 2, -3]} intensity={0.4} />
        <Suspense fallback={null}>
          <BodyModel value={value} onSelect={onSelect} />
        </Suspense>
      </Canvas>
      <p
        className="absolute bottom-3 left-0 right-0 text-center text-xs pointer-events-none"
        style={{ color: 'var(--bp-muted)' }}
      >
        Drag to rotate · click to select zone
      </p>
    </div>
  )
}
