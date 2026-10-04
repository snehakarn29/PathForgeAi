import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ThreeErrorBoundary } from './ThreeErrorBoundary.tsx';

function AmbientStarfield({ mousePos }: { mousePos: React.MutableRefObject<{ x: number; y: number }> }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Generate 250 spatial skill nodes across 3D space
  const { positions, linePositions, colors } = useMemo(() => {
    const count = 180;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const cyan = new THREE.Color('#06b6d4');
    const blue = new THREE.Color('#3b82f6');
    const purple = new THREE.Color('#8b5cf6');
    const emerald = new THREE.Color('#10b981');
    const colorPalette = [cyan, blue, purple, emerald];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 35;
      const y = (Math.random() - 0.5) * 25;
      const z = (Math.random() - 0.5) * 20 - 5;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    // Connect close neighbors with constellation line segments
    const lines: number[] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 4.2) {
          lines.push(
            pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2],
            pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]
          );
        }
      }
    }

    return {
      positions: pos,
      linePositions: new Float32Array(lines),
      colors: col
    };
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.03;
      pointsRef.current.rotation.x = THREE.MathUtils.lerp(
        pointsRef.current.rotation.x,
        mousePos.current.y * 0.08,
        0.05
      );
      pointsRef.current.rotation.y = THREE.MathUtils.lerp(
        pointsRef.current.rotation.y,
        mousePos.current.x * 0.08,
        0.05
      );
    }
    if (linesRef.current) {
      linesRef.current.rotation.y += delta * 0.03;
      linesRef.current.rotation.x = THREE.MathUtils.lerp(
        linesRef.current.rotation.x,
        mousePos.current.y * 0.08,
        0.05
      );
      linesRef.current.rotation.y = THREE.MathUtils.lerp(
        linesRef.current.rotation.y,
        mousePos.current.x * 0.08,
        0.05
      );
    }
  });

  return (
    <group>
      {/* Skill Points */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          vertexColors
          transparent
          opacity={0.65}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Constellation Connection Grid */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.09}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

export const SpatialConstellationBackground: React.FC = () => {
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40 select-none"
    >
      <ThreeErrorBoundary fallback={<div className="hidden" />}>
        <Canvas
          camera={{ position: [0, 0, 15], fov: 60 }}
          gl={{ antialias: false, powerPreference: 'low-power', alpha: true }}
          style={{ width: '100%', height: '100%', background: 'transparent' }}
        >
          <AmbientStarfield mousePos={mousePos} />
        </Canvas>
      </ThreeErrorBoundary>
    </div>
  );
};
