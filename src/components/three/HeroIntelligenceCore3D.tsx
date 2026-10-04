import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { ThreeErrorBoundary } from './ThreeErrorBoundary.tsx';
import { isWebGLAvailable } from '../../utils/webgl.ts';
import { FileText, Cpu, Wifi, ShieldCheck, GitFork, BookOpen, ArrowRight } from 'lucide-react';

interface HeroSatellite {
  id: string;
  label: string;
  subtitle: string;
  route: string;
  icon: React.ReactNode;
  color: string;
  initialAngle: number;
  elevation: number;
  distance: number;
}

const SATELLITES: HeroSatellite[] = [
  {
    id: 'resume',
    label: 'Resume Ingestion',
    subtitle: 'Multimodal Gemini Parsing',
    route: '/onboarding',
    icon: <FileText className="w-3.5 h-3.5" />,
    color: '#06b6d4',
    initialAngle: 0,
    elevation: 0.8,
    distance: 4.8
  },
  {
    id: 'skills',
    label: 'Skill Constellation',
    subtitle: 'Taxonomy Normalization',
    route: '/skills',
    icon: <Cpu className="w-3.5 h-3.5" />,
    color: '#3b82f6',
    initialAngle: (Math.PI * 2) / 6,
    elevation: -0.6,
    distance: 5.2
  },
  {
    id: 'market',
    label: 'Market Signals',
    subtitle: 'Real Adzuna Demand',
    route: '/command-center',
    icon: <Wifi className="w-3.5 h-3.5" />,
    color: '#10b981',
    initialAngle: ((Math.PI * 2) / 6) * 2,
    elevation: 1.0,
    distance: 4.9
  },
  {
    id: 'resilience',
    label: 'Resilience Engine',
    subtitle: '5-Factor Deterministic Audit',
    route: '/resilience',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    color: '#38bdf8',
    initialAngle: ((Math.PI * 2) / 6) * 3,
    elevation: -0.7,
    distance: 5.4
  },
  {
    id: 'paths',
    label: 'Career Pathways',
    subtitle: 'RF ML Transition Fit',
    route: '/paths',
    icon: <GitFork className="w-3.5 h-3.5" />,
    color: '#a855f7',
    initialAngle: ((Math.PI * 2) / 6) * 4,
    elevation: 0.9,
    distance: 5.1
  },
  {
    id: 'roadmap',
    label: 'Learning Roadmap',
    subtitle: '10-Week Adaptive Sprints',
    route: '/roadmap',
    icon: <BookOpen className="w-3.5 h-3.5" />,
    color: '#f59e0b',
    initialAngle: ((Math.PI * 2) / 6) * 5,
    elevation: -0.5,
    distance: 4.7
  }
];

function SatelliteMesh({
  satellite,
  isHovered,
  onHover,
  onClick
}: {
  satellite: HeroSatellite;
  isHovered: boolean;
  onHover: (s: HeroSatellite | null) => void;
  onClick: (route: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const angle = satellite.initialAngle;
  const x = Math.cos(angle) * satellite.distance;
  const z = Math.sin(angle) * satellite.distance;
  const y = satellite.elevation;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;
    meshRef.current.rotation.y += delta * 0.4;
    meshRef.current.rotation.x = Math.sin(timeRef.current) * 0.2;
  });

  const scale = isHovered ? 1.5 : 1.0;

  return (
    <group position={[x, y, z]}>
      {/* Connector line to central core */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([-x, -y, -z, 0, 0, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={satellite.color}
          transparent
          opacity={isHovered ? 0.75 : 0.2}
          blending={THREE.AdditiveBlending}
        />
      </line>

      <mesh
        ref={meshRef}
        scale={[scale, scale, scale]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(satellite.route);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(satellite);
        }}
        onPointerOut={() => onHover(null)}
      >
        <octahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial
          color={satellite.color}
          emissive={satellite.color}
          emissiveIntensity={isHovered ? 1.4 : 0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}

function HeroScene({
  hoveredSatellite,
  setHoveredSatellite,
  onNavigate
}: {
  hoveredSatellite: HeroSatellite | null;
  setHoveredSatellite: (s: HeroSatellite | null) => void;
  onNavigate: (route: string) => void;
}) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.25;
      coreRef.current.rotation.x += delta * 0.12;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.15;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.18;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.8} />
      <pointLight position={[6, 8, 6]} intensity={2.0} color="#38bdf8" />
      <pointLight position={[-6, -6, -4]} intensity={1.5} color="#a855f7" />

      {/* Central Holographic Nexus Core */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[1.5, 1]} />
          <meshStandardMaterial
            color="#0ea5e9"
            emissive="#0284c7"
            emissiveIntensity={0.6}
            roughness={0.15}
            metalness={0.9}
            wireframe
          />
        </mesh>
      </Float>

      {/* Primary Gyroscopic Rings */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.5, 0.03, 16, 64]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>

      <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[3.4, 0.025, 16, 64]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Orbiting Satellites */}
      {SATELLITES.map((sat) => (
        <SatelliteMesh
          key={sat.id}
          satellite={sat}
          isHovered={hoveredSatellite?.id === sat.id}
          onHover={setHoveredSatellite}
          onClick={onNavigate}
        />
      ))}
    </group>
  );
}

export const HeroIntelligenceCore3D: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const [hoveredSatellite, setHoveredSatellite] = useState<HeroSatellite | null>(null);
  const webGLReady = isWebGLAvailable();

  if (!webGLReady) {
    return (
      <div className="w-full h-80 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center justify-center p-6 text-center">
        <div className="space-y-2">
          <Cpu className="w-10 h-10 text-cyan-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">PathForge Intelligence Nexus</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Deterministic career resilience & multimodal skill gap intelligence engine.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative rounded-3xl overflow-hidden border border-slate-800/80 bg-gradient-to-b from-slate-950/80 via-slate-900/40 to-slate-950/90 shadow-2xl">
      {/* Top Banner Telemetry */}
      <div className="flex items-center justify-between p-4 px-5 text-[11px] font-mono text-slate-400 border-b border-slate-850">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-slate-300 uppercase tracking-wider">Spatial Intelligence Nexus</span>
        </div>
        <span className="hidden sm:inline text-slate-500">Interactive 3D Engine • Click any satellite</span>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="w-full h-[320px] sm:h-[380px] relative">
        <ThreeErrorBoundary fallback={<div className="hidden" />}>
          <Canvas
            camera={{ position: [0, 1.5, 9.5], fov: 48 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            style={{ width: '100%', height: '100%' }}
          >
            <HeroScene
              hoveredSatellite={hoveredSatellite}
              setHoveredSatellite={setHoveredSatellite}
              onNavigate={onNavigate}
            />
          </Canvas>
        </ThreeErrorBoundary>

        {/* Center Hover Spotlight Card (Overlaid smoothly in HTML without ReactDOM subroot) */}
        {hoveredSatellite && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-20 animate-in fade-in zoom-in-95 duration-150">
            <div
              className="px-4 py-2 rounded-xl backdrop-blur-md border shadow-2xl text-center bg-slate-900/95"
              style={{ borderColor: hoveredSatellite.color }}
            >
              <div className="flex items-center gap-2 justify-center">
                <span style={{ color: hoveredSatellite.color }}>{hoveredSatellite.icon}</span>
                <span className="text-xs font-bold text-white tracking-tight">{hoveredSatellite.label}</span>
              </div>
              <p className="text-[11px] font-mono text-cyan-300 mt-0.5">
                {hoveredSatellite.subtitle} →
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Satellite Navigation Grid (HTML Layer below Canvas) */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-850 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {SATELLITES.map((sat) => {
          const isHovered = hoveredSatellite?.id === sat.id;
          return (
            <button
              key={sat.id}
              onClick={() => onNavigate(sat.route)}
              onMouseEnter={() => setHoveredSatellite(sat)}
              onMouseLeave={() => setHoveredSatellite(null)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isHovered
                  ? 'bg-slate-900 border-cyan-400 scale-[1.02] shadow-lg shadow-cyan-900/20'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1" style={{ color: sat.color }}>
                {sat.icon}
                <span className="text-xs font-bold text-white tracking-tight truncate">{sat.label}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono truncate">{sat.subtitle}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
