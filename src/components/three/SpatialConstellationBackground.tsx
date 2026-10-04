import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSpatialWorld } from '../../context/SpatialWorldContext.tsx';
import { ThreeErrorBoundary } from './ThreeErrorBoundary.tsx';
import { isWebGLAvailable } from '../../utils/webgl.ts';

// ----------------------------------------------------
// 1. Camera Controller with Smooth Route & Scroll Lerp
// ----------------------------------------------------
function CameraDirector() {
  const { camera } = useThree();
  const { vantage, scrollY, mousePos, reducedMotion } = useSpatialWorld();
  const currentPos = useRef(new THREE.Vector3(...vantage.camPos));
  const currentLookAt = useRef(new THREE.Vector3(...vantage.lookAt));

  useFrame((_, delta) => {
    if (reducedMotion) {
      // Instant snap or static if user prefers reduced motion
      camera.position.set(vantage.camPos[0], vantage.camPos[1], vantage.camPos[2]);
      camera.lookAt(vantage.lookAt[0], vantage.lookAt[1], vantage.lookAt[2]);
      return;
    }

    // Scroll modulation: translate camera backwards and slightly downwards with scroll
    const scrollZOffset = scrollY * 4.5;
    const scrollYOffset = -scrollY * 3.0;

    // Mouse parallax: subtle offset
    const parallaxX = mousePos.current.x * 0.45;
    const parallaxY = mousePos.current.y * 0.35;

    const targetPos = new THREE.Vector3(
      vantage.camPos[0] + parallaxX,
      vantage.camPos[1] + scrollYOffset + parallaxY,
      vantage.camPos[2] + scrollZOffset
    );

    const targetLookAt = new THREE.Vector3(
      vantage.lookAt[0] + parallaxX * 0.3,
      vantage.lookAt[1] + scrollYOffset * 0.3,
      vantage.lookAt[2]
    );

    // Smooth lerp (friction = 4.0 * delta)
    const factor = Math.min(1, delta * 3.5);
    currentPos.current.lerp(targetPos, factor);
    currentLookAt.current.lerp(targetLookAt, factor);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

// ----------------------------------------------------
// 2. Layer A: Deep Matrix Grid & Ambient Starfield
// ----------------------------------------------------
function DeepMatrixLayer() {
  const pointsRef = useRef<THREE.Points>(null);
  const { reducedMotion } = useSpatialWorld();

  const { positions, colors } = useMemo(() => {
    const count = 160;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const c1 = new THREE.Color('#0369a1');
    const c2 = new THREE.Color('#4338ca');
    const c3 = new THREE.Color('#0d9488');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 45;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 10;

      const choice = Math.random();
      const c = choice < 0.4 ? c1 : choice < 0.75 ? c2 : c3;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current || reducedMotion) return;
    pointsRef.current.rotation.y += delta * 0.015;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.14}
        vertexColors
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ----------------------------------------------------
// 3. Layer B: Midground Data Constellation (Real Skills)
// ----------------------------------------------------
function MidgroundSkillConstellation() {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { profile, currentRoute, scrollY, reducedMotion, hoveredSkill } = useSpatialWorld();

  // Generate constellation nodes based on user's real skills, supplemented by core industry anchors
  const { nodeData, linePositions } = useMemo(() => {
    const rawSkills = profile?.skills && profile.skills.length > 0
      ? profile.skills
      : ['System Architecture', 'Cloud Infrastructure', 'API Engineering', 'Data Systems', 'ML Modeling', 'Security', 'DevOps', 'Frontend Design'];

    const nodes: Array<{
      name: string;
      pos: [number, number, number];
      color: string;
      size: number;
    }> = [];

    const palette = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#38bdf8', '#a855f7'];

    const count = Math.min(36, Math.max(16, rawSkills.length));
    const radius = 7.5;

    for (let i = 0; i < count; i++) {
      const skillName = rawSkills[i % rawSkills.length];
      const theta = (i / count) * Math.PI * 2;
      const phi = (Math.sin(i * 1.7) * 0.4) * Math.PI;

      const x = radius * Math.cos(theta) * Math.cos(phi);
      const y = radius * Math.sin(phi) + Math.cos(i) * 1.2;
      const z = radius * Math.sin(theta) * Math.cos(phi);

      const color = palette[i % palette.length];
      const size = skillName ? 0.28 : 0.18;

      nodes.push({ name: skillName, pos: [x, y, z], color, size });
    }

    // Connect close neighbors
    const lines: number[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].pos[0] - nodes[j].pos[0];
        const dy = nodes[i].pos[1] - nodes[j].pos[1];
        const dz = nodes[i].pos[2] - nodes[j].pos[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 4.8) {
          lines.push(
            nodes[i].pos[0], nodes[i].pos[1], nodes[i].pos[2],
            nodes[j].pos[0], nodes[j].pos[1], nodes[j].pos[2]
          );
        }
      }
    }

    return {
      nodeData: nodes,
      linePositions: new Float32Array(lines)
    };
  }, [profile?.skills]);

  useFrame((_, delta) => {
    if (!groupRef.current || reducedMotion) return;
    // Gentle rotation, speed modulated by scroll
    const rotSpeed = 0.04 + scrollY * 0.08;
    groupRef.current.rotation.y += delta * rotSpeed;
    groupRef.current.rotation.x = Math.sin(groupRef.current.rotation.y * 0.5) * 0.08;
  });

  return (
    <group ref={groupRef}>
      {/* Constellation Connection Grid */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.14}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Individual Skill Anchor Spheres */}
      {nodeData.map((node, idx) => {
        const isHovered = hoveredSkill && node.name.toLowerCase().includes(hoveredSkill.toLowerCase());
        return (
          <mesh
            key={idx}
            position={node.pos}
            scale={isHovered ? [2.0, 2.0, 2.0] : [1, 1, 1]}
          >
            <sphereGeometry args={[node.size, 12, 12]} />
            <meshBasicMaterial
              color={isHovered ? '#ffffff' : node.color}
              transparent
              opacity={isHovered ? 0.95 : 0.65}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ----------------------------------------------------
// 4. Layer C: Stage-Adaptive Geometric Core
// ----------------------------------------------------
function StageAdaptiveGeometry() {
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const { currentRoute, scrollY, reducedMotion } = useSpatialWorld();

  useFrame((_, delta) => {
    if (reducedMotion) return;
    const scrollFactor = 1 + scrollY * 1.5;

    if (ringRef1.current) {
      ringRef1.current.rotation.z += delta * 0.12 * scrollFactor;
      ringRef1.current.rotation.x += delta * 0.05;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.y -= delta * 0.15 * scrollFactor;
      ringRef2.current.rotation.z += delta * 0.08;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.2;
      coreRef.current.rotation.x += delta * 0.1;
    }
  });

  // Stage-specific accent colors
  const isResilience = currentRoute === '/resilience';
  const isGaps = currentRoute === '/gaps';
  const isPaths = currentRoute === '/paths';
  const isRoadmap = currentRoute === '/roadmap';

  const ringColor = isResilience
    ? '#10b981'
    : isGaps
    ? '#f43f5e'
    : isPaths
    ? '#8b5cf6'
    : isRoadmap
    ? '#06b6d4'
    : '#0ea5e9';

  return (
    <group position={[0, 0, -2]}>
      {/* Outer Telemetry Ring */}
      <mesh ref={ringRef1} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[9.5, 0.03, 16, 80]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Mid Orbital Ring */}
      <mesh ref={ringRef2} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[6.2, 0.025, 16, 64]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Center Quantum Wireframe Glyph */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshBasicMaterial
          color={ringColor}
          wireframe
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// ----------------------------------------------------
// Main Persistent Background Export
// ----------------------------------------------------
export const SpatialConstellationBackground: React.FC = () => {
  const webGLReady = isWebGLAvailable();

  if (!webGLReady) {
    // Elegant CSS radial fallback if WebGL is disabled or unavailable
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.12),rgba(2,6,23,0.95))]"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-60"
    >
      <ThreeErrorBoundary fallback={<div className="hidden" />}>
        <Canvas
          camera={{ position: [0, 2, 16], fov: 55 }}
          gl={{
            antialias: false,
            powerPreference: 'high-performance',
            alpha: true,
            stencil: false,
            depth: true
          }}
          dpr={[1, 1.5]}
          style={{ width: '100%', height: '100%', background: 'transparent' }}
        >
          <CameraDirector />
          <ambientLight intensity={0.4} />
          <DeepMatrixLayer />
          <MidgroundSkillConstellation />
          <StageAdaptiveGeometry />
        </Canvas>
      </ThreeErrorBoundary>
    </div>
  );
};
