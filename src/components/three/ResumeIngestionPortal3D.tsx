import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { ThreeErrorBoundary } from './ThreeErrorBoundary.tsx';

interface ResumeIngestionPortal3DProps {
  status: 'idle' | 'reading' | 'gemini_extract' | 'normalizing' | 'complete' | 'error';
  isDragging: boolean;
}

function IngestionScene({ status, isDragging }: ResumeIngestionPortal3DProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const ring3Ref = useRef<THREE.Group>(null);
  const scanPlaneRef = useRef<THREE.Mesh>(null);

  // Speed multiplier based on state
  const speed = isDragging ? 3.5 : (status === 'gemini_extract' ? 2.5 : (status === 'normalizing' ? 1.8 : 0.8));
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.4 * speed;
      coreRef.current.rotation.y += delta * 0.6 * speed;
      // Pulse scale when extracting
      if (status === 'gemini_extract') {
        const pulse = 1.0 + Math.sin(t * 8) * 0.12;
        coreRef.current.scale.set(pulse, pulse, pulse);
      } else {
        coreRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.5 * speed;
      ring1Ref.current.rotation.x += delta * 0.2 * speed;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.7 * speed;
      ring2Ref.current.rotation.z += delta * 0.3 * speed;
    }

    if (ring3Ref.current) {
      ring3Ref.current.rotation.x -= delta * 0.4 * speed;
      ring3Ref.current.rotation.y += delta * 0.5 * speed;
    }

    // Laser scan animation during Gemini extraction
    if (scanPlaneRef.current) {
      if (status === 'gemini_extract' || status === 'reading') {
        scanPlaneRef.current.visible = true;
        scanPlaneRef.current.position.y = Math.sin(t * 4) * 1.8;
      } else {
        scanPlaneRef.current.visible = false;
      }
    }
  });

  const coreColor = isDragging
    ? '#38bdf8'
    : (status === 'gemini_extract'
      ? '#a855f7'
      : (status === 'normalizing' ? '#10b981' : '#06b6d4'));

  return (
    <group>
      <ambientLight intensity={0.7} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#22d3ee" />
      <pointLight position={[-5, -5, -3]} intensity={1.0} color="#a855f7" />

      {/* Central Quantum Ingestion Crystal */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={coreRef}>
          <octahedronGeometry args={[1.1, 0]} />
          <meshStandardMaterial
            color={coreColor}
            wireframe
            emissive={coreColor}
            emissiveIntensity={0.4}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </Float>

      {/* Inner Glowing Core */}
      <mesh scale={[0.6, 0.6, 0.6]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial
          color={coreColor}
          transparent
          opacity={status === 'gemini_extract' ? 0.8 : 0.35}
        />
      </mesh>

      {/* Orbital Ring 1: Primary Horizon */}
      <group ref={ring1Ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.0, 0.02, 16, 64]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Orbital Ring 2: Polar Ring */}
      <group ref={ring2Ref}>
        <mesh rotation={[0, Math.PI / 4, Math.PI / 6]}>
          <torusGeometry args={[2.4, 0.025, 16, 64]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.45} />
        </mesh>
      </group>

      {/* Orbital Ring 3: Tilted Outer Ring */}
      <group ref={ring3Ref}>
        <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
          <torusGeometry args={[2.8, 0.02, 16, 64]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.35} />
        </mesh>
      </group>

      {/* Gemini AI Scanning Beam */}
      <mesh ref={scanPlaneRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 2.6, 32]} />
        <meshBasicMaterial
          color="#c084fc"
          side={THREE.DoubleSide}
          transparent
          opacity={0.45}
        />
      </mesh>
    </group>
  );
}

export const ResumeIngestionPortal3D: React.FC<ResumeIngestionPortal3DProps> = ({
  status,
  isDragging
}) => {
  return (
    <div className="w-full h-44 sm:h-52 relative flex items-center justify-center overflow-hidden rounded-2xl select-none">
      <ThreeErrorBoundary
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-cyan-950/20 text-cyan-400 text-xs font-mono">
            3D Ingestion Core Active
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 0, 6], fov: 48 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%', background: 'transparent' }}
        >
          <IngestionScene status={status} isDragging={isDragging} />
        </Canvas>
      </ThreeErrorBoundary>

      {/* Subtle Bottom Holographic Ground Shadow */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-48 h-4 rounded-full bg-cyan-500/20 blur-xl pointer-events-none" />
    </div>
  );
};
