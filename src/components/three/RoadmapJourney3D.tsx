import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { RoadmapMilestone, LearningRoadmap } from '../../types/roadmap.ts';
import { ThreeErrorBoundary } from './ThreeErrorBoundary.tsx';
import { isWebGLAvailable } from '../../utils/webgl.ts';
import { CheckCircle2, Clock, Award, BookOpen, ChevronRight } from 'lucide-react';

interface RoadmapJourney3DProps {
  roadmap: LearningRoadmap;
  milestones: RoadmapMilestone[];
  onSelectMilestone?: (milestone: RoadmapMilestone) => void;
  onToggleStatus?: (milestoneId: string) => void;
}

function MilestoneStepMesh({
  milestone,
  position,
  isHovered,
  onHover,
  onClick
}: {
  milestone: RoadmapMilestone;
  position: [number, number, number];
  isHovered: boolean;
  onHover: (m: RoadmapMilestone | null) => void;
  onClick: (m: RoadmapMilestone) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const isCompleted = milestone.status === 'completed';
  const isInProgress = milestone.status === 'in_progress';

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (meshRef.current) {
      if (isInProgress) {
        meshRef.current.rotation.y += delta * 1.2;
        const pulse = 1.0 + Math.sin(timeRef.current * 4) * 0.15;
        meshRef.current.scale.set(pulse, pulse, pulse);
      } else {
        meshRef.current.rotation.y += delta * 0.3;
      }
    }
    if (ringRef.current && isCompleted) {
      ringRef.current.rotation.z += delta * 0.5;
    }
  });

  const nodeColor = isCompleted
    ? '#10b981'
    : isInProgress
    ? '#38bdf8'
    : '#64748b';

  const scale = isHovered ? 1.5 : (isInProgress ? 1.2 : 1.0);

  return (
    <group position={position}>
      {/* Central Milestone Stepping Stone */}
      <mesh
        ref={meshRef}
        scale={[scale, scale, scale]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(milestone);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(milestone);
        }}
        onPointerOut={() => onHover(null)}
      >
        <octahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isHovered ? 1.4 : (isInProgress ? 0.9 : (isCompleted ? 0.7 : 0.25))}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Halo Ring for Active / Completed */}
      {(isCompleted || isInProgress) && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.95, 0.025, 16, 32]} />
          <meshBasicMaterial
            color={nodeColor}
            transparent
            opacity={0.65}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}

function JourneyScene({
  roadmap,
  milestones,
  hoveredMilestone,
  setHoveredMilestone,
  onSelectMilestone,
  onToggleStatus
}: {
  roadmap: LearningRoadmap;
  milestones: RoadmapMilestone[];
  hoveredMilestone: RoadmapMilestone | null;
  setHoveredMilestone: (m: RoadmapMilestone | null) => void;
  onSelectMilestone?: (milestone: RoadmapMilestone) => void;
  onToggleStatus?: (milestoneId: string) => void;
}) {
  const { nodePositions, lineCoords } = useMemo(() => {
    const count = milestones.length;
    const positions: Array<[number, number, number]> = [];
    const lines: number[] = [];

    const startX = -6;
    const endX = 6;
    const stepX = (endX - startX) / Math.max(1, count - 1);

    for (let i = 0; i < count; i++) {
      const x = startX + i * stepX;
      // Ascending curve
      const y = (i / Math.max(1, count - 1)) * 3.5 - 1.5;
      const z = Math.sin((i / count) * Math.PI) * 2.2;
      positions.push([x, y, z]);

      if (i > 0) {
        const prev = positions[i - 1];
        lines.push(prev[0], prev[1], prev[2], x, y, z);
      }
    }

    return {
      nodePositions: positions,
      lineCoords: new Float32Array(lines)
    };
  }, [milestones]);

  return (
    <group>
      <ambientLight intensity={0.7} />
      <pointLight position={[8, 8, 8]} intensity={2.0} color="#38bdf8" />
      <pointLight position={[-8, -6, -4]} intensity={1.2} color="#a855f7" />

      {/* Connecting Pathway Line Beam */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lineCoords, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Milestone Nodes */}
      {milestones.map((m, idx) => (
        <MilestoneStepMesh
          key={m.id}
          milestone={m}
          position={nodePositions[idx] || [0, 0, 0]}
          isHovered={hoveredMilestone?.id === m.id}
          onHover={setHoveredMilestone}
          onClick={(sel) => {
            if (onToggleStatus) onToggleStatus(sel.id);
            if (onSelectMilestone) onSelectMilestone(sel);
          }}
        />
      ))}

      {/* Target Role Summit Beacon at end */}
      {nodePositions.length > 0 && (
        <group position={[nodePositions[nodePositions.length - 1][0] + 1.6, nodePositions[nodePositions.length - 1][1] + 0.8, 0]}>
          <mesh>
            <icosahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={0.8}
              roughness={0.2}
              metalness={0.9}
            />
          </mesh>
        </group>
      )}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2 + 0.2}
        minPolarAngle={Math.PI / 4}
        rotateSpeed={0.5}
      />
    </group>
  );
}

export const RoadmapJourney3D: React.FC<RoadmapJourney3DProps> = ({
  roadmap,
  milestones,
  onSelectMilestone,
  onToggleStatus
}) => {
  const [hoveredMilestone, setHoveredMilestone] = useState<RoadmapMilestone | null>(null);
  const webGLReady = isWebGLAvailable();

  if (!webGLReady) {
    return null;
  }

  return (
    <div className="w-full relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-b from-slate-950/90 via-slate-900/60 to-slate-950/90 shadow-2xl select-none">
      {/* Top Banner */}
      <div className="flex items-center justify-between p-4 px-5 text-xs font-mono text-slate-400 border-b border-slate-850">
        <span className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" /> 3D Ascending Roadmap Trajectory
        </span>
        <span className="text-amber-400 font-bold">
          🎯 Target: {roadmap.targetRoleTitle}
        </span>
      </div>

      {/* 3D Canvas Area */}
      <div className="w-full h-[280px] sm:h-[320px] relative">
        <ThreeErrorBoundary fallback={<div className="hidden" />}>
          <Canvas
            camera={{ position: [0, 1.8, 12.5], fov: 48 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            style={{ width: '100%', height: '100%' }}
          >
            <JourneyScene
              roadmap={roadmap}
              milestones={milestones}
              hoveredMilestone={hoveredMilestone}
              setHoveredMilestone={setHoveredMilestone}
              onSelectMilestone={onSelectMilestone}
              onToggleStatus={onToggleStatus}
            />
          </Canvas>
        </ThreeErrorBoundary>

        {/* Hover Milestone Details Floating Overlay */}
        {hoveredMilestone && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none z-20 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-2 rounded-xl backdrop-blur-md border border-cyan-400 bg-slate-900/95 shadow-2xl text-center">
              <div className="flex items-center gap-2 justify-center">
                {hoveredMilestone.status === 'completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : hoveredMilestone.status === 'in_progress' ? (
                  <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                )}
                <span className="text-xs font-bold text-white">
                  Week {hoveredMilestone.weekStart}-{hoveredMilestone.weekEnd}: {hoveredMilestone.phaseTitle}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-300 mt-0.5">
                Target: {hoveredMilestone.targetSkills.join(', ')} • Click 3D node to toggle status
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Milestone Step Strip (HTML Layer) */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-850 flex items-center justify-between overflow-x-auto gap-2 text-xs">
        {milestones.map((m) => {
          const isHovered = hoveredMilestone?.id === m.id;
          const isDone = m.status === 'completed';
          const isInProgress = m.status === 'in_progress';
          return (
            <button
              key={m.id}
              onClick={() => {
                if (onToggleStatus) onToggleStatus(m.id);
                if (onSelectMilestone) onSelectMilestone(m);
              }}
              onMouseEnter={() => setHoveredMilestone(m)}
              onMouseLeave={() => setHoveredMilestone(null)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono transition-all shrink-0 ${
                isDone
                  ? 'bg-emerald-950/70 border-emerald-600/50 text-emerald-300'
                  : isInProgress
                  ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300 ring-1 ring-cyan-500/40'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              } ${isHovered ? 'scale-105 shadow-md' : ''}`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : isInProgress ? (
                <Clock className="w-3 h-3 text-cyan-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-600" />
              )}
              <span>W{m.weekStart}-{m.weekEnd}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
