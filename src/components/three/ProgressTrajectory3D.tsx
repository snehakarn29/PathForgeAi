import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { UserProgress, TrackedSkill } from '../../types/progress.ts';
import { ThreeErrorBoundary } from './ThreeErrorBoundary.tsx';
import { isWebGLAvailable } from '../../utils/webgl.ts';
import { TrendingUp, Award, CheckCircle2, Clock } from 'lucide-react';

interface ProgressTrajectory3DProps {
  progress: UserProgress;
}

function TrajectoryScene({
  progress,
  hoveredSkill,
  setHoveredSkill
}: {
  progress: UserProgress;
  hoveredSkill: TrackedSkill | null;
  setHoveredSkill: (s: TrackedSkill | null) => void;
}) {
  const curveRef = useRef<THREE.Group>(null);

  const skillsList = Object.values(progress.trackedSkills);

  const { curvePoints, skillPositions } = useMemo(() => {
    const points: [number, number, number][] = [];
    const positions: Array<{ skill: TrackedSkill; pos: [number, number, number] }> = [];

    const totalSteps = Math.max(8, skillsList.length);
    for (let i = 0; i <= totalSteps; i++) {
      const t = i / totalSteps;
      const x = (t - 0.5) * 11;
      const y = Math.pow(t, 1.4) * 4.5 - 2;
      const z = Math.sin(t * Math.PI) * 2;
      points.push([x, y, z]);
    }

    skillsList.forEach((skill, idx) => {
      const t = (idx + 1) / (skillsList.length + 1);
      const x = (t - 0.5) * 11;
      const y = Math.pow(t, 1.4) * 4.5 - 2;
      const z = Math.sin(t * Math.PI) * 2;
      positions.push({ skill, pos: [x, y, z] });
    });

    const flatPoints: number[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      flatPoints.push(
        points[i][0], points[i][1], points[i][2],
        points[i + 1][0], points[i + 1][1], points[i + 1][2]
      );
    }

    return {
      curvePoints: new Float32Array(flatPoints),
      skillPositions: positions
    };
  }, [skillsList]);

  useFrame((_, delta) => {
    if (curveRef.current) {
      curveRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={curveRef}>
      <ambientLight intensity={0.7} />
      <pointLight position={[6, 8, 6]} intensity={1.8} color="#10b981" />
      <pointLight position={[-6, -4, -4]} intensity={1.2} color="#06b6d4" />

      {/* Trajectory Velocity Arc Line */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[curvePoints, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color="#10b981"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Trajectory Milestone Spheres */}
      {skillPositions.map(({ skill, pos }, idx) => {
        const isCompleted = skill.status === 'completed';
        const isInProgress = skill.status === 'in_progress';
        const isHovered = hoveredSkill?.name === skill.name;

        const color = isCompleted ? '#10b981' : isInProgress ? '#38bdf8' : '#64748b';
        const scale = isHovered ? 1.5 : (isInProgress ? 1.25 : 1.0);

        return (
          <group key={idx} position={pos}>
            <mesh
              scale={[scale, scale, scale]}
              onPointerOver={() => setHoveredSkill(skill)}
              onPointerOut={() => setHoveredSkill(null)}
            >
              <octahedronGeometry args={[0.38, 0]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={isHovered ? 1.3 : (isInProgress ? 0.8 : (isCompleted ? 0.6 : 0.2))}
                roughness={0.2}
              />
            </mesh>
          </group>
        );
      })}

      <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 4} />
    </group>
  );
}

export const ProgressTrajectory3D: React.FC<ProgressTrajectory3DProps> = ({ progress }) => {
  const [hoveredSkill, setHoveredSkill] = useState<TrackedSkill | null>(null);
  const webGLReady = isWebGLAvailable();

  if (!webGLReady) {
    return null;
  }

  const completed = Object.values(progress.trackedSkills).filter(s => s.status === 'completed').length;
  const inProgress = Object.values(progress.trackedSkills).filter(s => s.status === 'in_progress').length;

  return (
    <div className="w-full h-64 sm:h-72 relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-b from-slate-950/80 via-slate-900/40 to-slate-950/90 shadow-2xl select-none">
      {/* Top Banner */}
      <div className="absolute top-3.5 left-5 right-5 flex items-center justify-between text-xs font-mono text-slate-400 z-10 pointer-events-none">
        <span className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider">
          <TrendingUp className="w-4 h-4" /> 3D Skill Velocity Arc
        </span>
        <span className="text-slate-400">
          {completed} Verified Mastered • {inProgress} In Orbit
        </span>
      </div>

      <ThreeErrorBoundary fallback={<div className="hidden" />}>
        <Canvas
          camera={{ position: [0, 1.5, 9.5], fov: 48 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%' }}
        >
          <TrajectoryScene
            progress={progress}
            hoveredSkill={hoveredSkill}
            setHoveredSkill={setHoveredSkill}
          />
        </Canvas>
      </ThreeErrorBoundary>

      {/* Floating Hover Card (HTML Overlay) */}
      {hoveredSkill && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-20 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/95 border border-emerald-400 text-xs text-white shadow-2xl text-center">
            <div className="font-bold flex items-center gap-1.5 justify-center">
              {hoveredSkill.status === 'completed' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
              )}
              {hoveredSkill.name}
            </div>
            <div className="text-[10px] text-slate-300 font-mono mt-0.5">
              {hoveredSkill.hoursSpent} hrs logged • {hoveredSkill.category}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Subtitle */}
      <div className="absolute bottom-2.5 left-0 right-0 text-center pointer-events-none text-[10px] font-mono text-slate-500">
        Hover nodes to inspect individual competency velocity
      </div>
    </div>
  );
};
