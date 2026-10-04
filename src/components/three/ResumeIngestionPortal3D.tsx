import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { ThreeErrorBoundary } from './ThreeErrorBoundary.tsx';
import { isWebGLAvailable } from '../../utils/webgl.ts';

interface ResumeIngestionPortal3DProps {
  status: 'idle' | 'reading' | 'gemini_extract' | 'normalizing' | 'complete' | 'error';
  isDragging: boolean;
}

// ----------------------------------------------------
// 1. Floating 3D Resume Document Card
// ----------------------------------------------------
function ResumeDocumentCard({
  status,
  isDragging
}: {
  status: ResumeIngestionPortal3DProps['status'];
  isDragging: boolean;
}) {
  const cardRef = useRef<THREE.Group>(null);
  const laserRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const isScanning = status === 'reading' || status === 'gemini_extract' || status === 'normalizing';
  const isComplete = status === 'complete';

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    if (cardRef.current) {
      // Perspective floating rotation
      if (isDragging) {
        cardRef.current.rotation.y = Math.sin(t * 4) * 0.35;
        cardRef.current.rotation.x = Math.cos(t * 3) * 0.2;
        cardRef.current.scale.lerp(new THREE.Vector3(1.15, 1.15, 1.15), 0.1);
      } else if (isScanning) {
        cardRef.current.rotation.y = Math.sin(t * 1.5) * 0.15;
        cardRef.current.rotation.x = 0.05 + Math.cos(t * 2) * 0.05;
        cardRef.current.scale.lerp(new THREE.Vector3(1.05, 1.05, 1.05), 0.1);
      } else {
        cardRef.current.rotation.y = Math.sin(t * 0.8) * 0.12;
        cardRef.current.rotation.x = 0.05;
        cardRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }

    // Laser beam vertical sweep
    if (laserRef.current) {
      if (isScanning) {
        laserRef.current.visible = true;
        // Sweep between y = -1.2 and +1.2
        laserRef.current.position.y = Math.sin(t * 4.5) * 1.15;
      } else {
        laserRef.current.visible = false;
      }
    }
  });

  const cardBorderColor = isComplete
    ? '#10b981'
    : isDragging
    ? '#38bdf8'
    : isScanning
    ? '#a855f7'
    : '#0ea5e9';

  return (
    <group ref={cardRef}>
      {/* Document Sheet Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.0, 2.6, 0.06]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.25}
          metalness={0.7}
        />
      </mesh>

      {/* Sheet Border Accent */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.04, 2.64, 0.04]} />
        <meshBasicMaterial
          color={cardBorderColor}
          wireframe
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Simulated Document Header Line */}
      <mesh position={[-0.45, 0.9, 0.04]}>
        <planeGeometry args={[0.8, 0.12]} />
        <meshBasicMaterial color={cardBorderColor} />
      </mesh>

      {/* Simulated Avatar / Photo Box */}
      <mesh position={[0.65, 0.85, 0.04]}>
        <planeGeometry args={[0.35, 0.35]} />
        <meshBasicMaterial color="#334155" />
      </mesh>

      {/* Simulated Text Lines */}
      {[-0.4, -0.15, 0.1, 0.35, 0.6].map((y, idx) => (
        <mesh key={idx} position={[0, -y, 0.04]}>
          <planeGeometry args={[1.5, 0.06]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
      ))}

      {/* Laser Scanning Beam Plane */}
      <mesh ref={laserRef} position={[0, 0, 0.08]} visible={false}>
        <planeGeometry args={[2.1, 0.08]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// ----------------------------------------------------
// 2. Extracted Skill Particle Stream
// ----------------------------------------------------
function ExtractedSkillStream({ status }: { status: ResumeIngestionPortal3DProps['status'] }) {
  const pointsRef = useRef<THREE.Points>(null);
  const isExtracting = status === 'gemini_extract' || status === 'normalizing';

  const { positions, velocities } = useMemo(() => {
    const count = 75;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2.0;
      pos[i * 3 + 2] = 0.2 + Math.random() * 0.5;

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      vel[i * 3] = Math.cos(angle) * speed;
      vel[i * 3 + 1] = Math.sin(angle) * speed;
      vel[i * 3 + 2] = 0.8 + Math.random() * 1.2;
    }

    return { positions: pos, velocities: vel };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current || !isExtracting) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < array.length / 3; i++) {
      array[i * 3] += velocities[i * 3] * delta;
      array[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      array[i * 3 + 2] += velocities[i * 3 + 2] * delta;

      // Reset when particle drifts too far
      if (array[i * 3 + 2] > 4.5 || Math.abs(array[i * 3]) > 3.5) {
        array[i * 3] = (Math.random() - 0.5) * 1.5;
        array[i * 3 + 1] = (Math.random() - 0.5) * 2.0;
        array[i * 3 + 2] = 0.2;
      }
    }
    posAttr.needsUpdate = true;
  });

  if (!isExtracting) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        color="#38bdf8"
        transparent
        opacity={0.85}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ----------------------------------------------------
// 3. Gyroscopic Ingestion Rings
// ----------------------------------------------------
function IngestionRings({
  status,
  isDragging
}: {
  status: ResumeIngestionPortal3DProps['status'];
  isDragging: boolean;
}) {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);

  const speed = isDragging ? 3.0 : (status === 'gemini_extract' ? 2.5 : 0.8);

  useFrame((_, delta) => {
    if (ring1.current) {
      ring1.current.rotation.z += delta * 0.4 * speed;
      ring1.current.rotation.x += delta * 0.2 * speed;
    }
    if (ring2.current) {
      ring2.current.rotation.y -= delta * 0.5 * speed;
      ring2.current.rotation.z -= delta * 0.3 * speed;
    }
  });

  const ringColor = status === 'complete'
    ? '#10b981'
    : status === 'gemini_extract'
    ? '#a855f7'
    : '#06b6d4';

  return (
    <group>
      <mesh ref={ring1} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.5, 0.025, 16, 64]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={ring2} rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[3.1, 0.02, 16, 64]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export const ResumeIngestionPortal3D: React.FC<ResumeIngestionPortal3DProps> = ({
  status,
  isDragging
}) => {
  const webGLReady = isWebGLAvailable();

  if (!webGLReady) {
    return null;
  }

  return (
    <div className="w-full h-56 sm:h-64 relative rounded-2xl overflow-hidden pointer-events-none select-none">
      <ThreeErrorBoundary fallback={<div className="hidden" />}>
        <Canvas
          camera={{ position: [0, 0, 6.2], fov: 46 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.7} />
          <pointLight position={[4, 5, 4]} intensity={1.8} color="#22d3ee" />
          <pointLight position={[-4, -4, -3]} intensity={1.2} color="#a855f7" />

          <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.35}>
            <ResumeDocumentCard status={status} isDragging={isDragging} />
            <ExtractedSkillStream status={status} />
            <IngestionRings status={status} isDragging={isDragging} />
          </Float>
        </Canvas>
      </ThreeErrorBoundary>
    </div>
  );
};
