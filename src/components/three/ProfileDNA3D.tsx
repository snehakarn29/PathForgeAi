import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { UserProfile } from '../../types/profile.ts';
import { ThreeErrorBoundary } from './ThreeErrorBoundary.tsx';
import { isWebGLAvailable } from '../../utils/webgl.ts';
import { ShieldCheck, Award, Briefcase, Cpu } from 'lucide-react';

interface ProfileDNA3DProps {
  profile: UserProfile | null;
}

function CandidateGlyphScene({
  profile,
  hoveredMetric,
  setHoveredMetric
}: {
  profile: UserProfile | null;
  hoveredMetric: string | null;
  setHoveredMetric: (m: string | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const skillsCount = profile?.skills?.length || 0;
  const experienceYears = profile?.yearsOfExperience || 0;
  const domainsCount = profile?.domains?.length || Math.min(5, Math.ceil(skillsCount / 3));

  // Visual metric heights
  const skillPillarHeight = Math.max(0.6, Math.min(3.2, (skillsCount / 20) * 2.8));
  const expPillarHeight = Math.max(0.6, Math.min(3.2, (experienceYears / 12) * 2.8));
  const domainPillarHeight = Math.max(0.6, Math.min(3.2, (domainsCount / 6) * 2.8));

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.35;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.7} />
      <pointLight position={[5, 6, 5]} intensity={1.8} color="#38bdf8" />
      <pointLight position={[-5, -4, -3]} intensity={1.2} color="#a855f7" />

      {/* Central Identity Monolith */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh position={[0, 0, 0]}>
          <octahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial
            color="#0ea5e9"
            emissive="#0284c7"
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.8}
            wireframe
          />
        </mesh>
      </Float>

      {/* Orbiting Verification Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.2, 0.02, 16, 64]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Pillar 1: Verified Skills Breadth */}
      <group position={[-1.4, 0, 0]}>
        <mesh
          position={[0, skillPillarHeight / 2 - 1.2, 0]}
          onPointerOver={() => setHoveredMetric('skills')}
          onPointerOut={() => setHoveredMetric(null)}
        >
          <cylinderGeometry args={[0.22, 0.22, skillPillarHeight, 16]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={hoveredMetric === 'skills' ? 1.0 : 0.4}
            roughness={0.25}
          />
        </mesh>
      </group>

      {/* Pillar 2: Verified Experience Depth */}
      <group position={[0, 0, 1.4]}>
        <mesh
          position={[0, expPillarHeight / 2 - 1.2, 0]}
          onPointerOver={() => setHoveredMetric('exp')}
          onPointerOut={() => setHoveredMetric(null)}
        >
          <cylinderGeometry args={[0.22, 0.22, expPillarHeight, 16]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#059669"
            emissiveIntensity={hoveredMetric === 'exp' ? 1.0 : 0.4}
            roughness={0.25}
          />
        </mesh>
      </group>

      {/* Pillar 3: Domain Breadth */}
      <group position={[1.4, 0, 0]}>
        <mesh
          position={[0, domainPillarHeight / 2 - 1.2, 0]}
          onPointerOver={() => setHoveredMetric('domains')}
          onPointerOut={() => setHoveredMetric(null)}
        >
          <cylinderGeometry args={[0.22, 0.22, domainPillarHeight, 16]} />
          <meshStandardMaterial
            color="#a855f7"
            emissive="#7e22ce"
            emissiveIntensity={hoveredMetric === 'domains' ? 1.0 : 0.4}
            roughness={0.25}
          />
        </mesh>
      </group>
    </group>
  );
}

export const ProfileDNA3D: React.FC<ProfileDNA3DProps> = ({ profile }) => {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const webGLReady = isWebGLAvailable();

  if (!webGLReady) {
    return null;
  }

  const skillsCount = profile?.skills?.length || 0;
  const experienceYears = profile?.yearsOfExperience || 0;
  const domainsCount = profile?.domains?.length || Math.min(5, Math.ceil(skillsCount / 3));

  return (
    <div className="w-full h-56 sm:h-64 relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/70 select-none">
      {/* Top Banner */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-400 z-10 pointer-events-none">
        <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" /> Candidate DNA Glyph
        </span>
        <span className="text-slate-500">Real Profile Coordinates</span>
      </div>

      <ThreeErrorBoundary fallback={<div className="hidden" />}>
        <Canvas
          camera={{ position: [0, 1.8, 6.0], fov: 46 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%' }}
        >
          <CandidateGlyphScene
            profile={profile}
            hoveredMetric={hoveredMetric}
            setHoveredMetric={setHoveredMetric}
          />
        </Canvas>
      </ThreeErrorBoundary>

      {/* Interactive 3-Metric Pillar Indicators (HTML Overlay) */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-center gap-3 z-10">
        <div
          onMouseEnter={() => setHoveredMetric('skills')}
          onMouseLeave={() => setHoveredMetric(null)}
          className={`px-2.5 py-1 rounded-xl border backdrop-blur-md transition-all text-xs font-mono cursor-default ${
            hoveredMetric === 'skills'
              ? 'bg-cyan-950 border-cyan-400 text-cyan-300 scale-105 shadow-md shadow-cyan-900/30'
              : 'bg-slate-900/80 border-slate-800 text-slate-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block mr-1.5" />
          {skillsCount} Skills Breadth
        </div>

        <div
          onMouseEnter={() => setHoveredMetric('exp')}
          onMouseLeave={() => setHoveredMetric(null)}
          className={`px-2.5 py-1 rounded-xl border backdrop-blur-md transition-all text-xs font-mono cursor-default ${
            hoveredMetric === 'exp'
              ? 'bg-emerald-950 border-emerald-400 text-emerald-300 scale-105 shadow-md shadow-emerald-900/30'
              : 'bg-slate-900/80 border-slate-800 text-slate-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1.5" />
          {experienceYears} Yrs Experience
        </div>

        <div
          onMouseEnter={() => setHoveredMetric('domains')}
          onMouseLeave={() => setHoveredMetric(null)}
          className={`px-2.5 py-1 rounded-xl border backdrop-blur-md transition-all text-xs font-mono cursor-default ${
            hoveredMetric === 'domains'
              ? 'bg-purple-950 border-purple-400 text-purple-300 scale-105 shadow-md shadow-purple-900/30'
              : 'bg-slate-900/80 border-slate-800 text-slate-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400 inline-block mr-1.5" />
          {domainsCount} Domain Scope
        </div>
      </div>
    </div>
  );
};
