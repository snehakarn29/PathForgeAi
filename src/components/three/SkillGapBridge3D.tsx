import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { TransitionRecommendation, SkillGapItem } from '../../types/transitions.ts';

interface SkillGapBridge3DProps {
  recommendation: TransitionRecommendation;
  onSelectGap?: (gap: SkillGapItem) => void;
}

const GapPillarMesh: React.FC<{
  gap: SkillGapItem;
  position: [number, number, number];
  isSelected: boolean;
  isHovered: boolean;
  onHover: (gap: SkillGapItem | null) => void;
  onClick: (gap: SkillGapItem) => void;
}> = ({ gap, position, isSelected, isHovered, onHover, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const effortWeeks = gap.estimatedEffortWeeks || 4;
  const height = Math.max(0.8, (effortWeeks / 10) * 3.5);
  const color = gap.priority === 'High' ? '#f43f5e' : gap.priority === 'Medium' ? '#fbbf24' : '#38bdf8';

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;
    if (isSelected || isHovered) {
      meshRef.current.rotation.y = timeRef.current * 0.8;
    }
  });

  return (
    <group position={position}>
      {/* Vertical Column representing Learning Effort */}
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(gap);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(gap);
        }}
        onPointerOut={() => onHover(null)}
      >
        <cylinderGeometry args={[0.22, 0.22, height, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.9 : isHovered ? 0.7 : 0.3}
          roughness={0.25}
          metalness={0.8}
        />
      </mesh>

      {/* Floating Head Node */}
      <mesh
        position={[0, height + 0.3, 0]}
        scale={isSelected ? [0.45, 0.45, 0.45] : [0.35, 0.35, 0.35]}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Selection Base Indicator */}
      {(isSelected || isHovered) && (
        <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.65, 24]} />
          <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};

export const SkillGapBridge3D: React.FC<SkillGapBridge3DProps> = ({
  recommendation,
  onSelectGap
}) => {
  const [hoveredGap, setHoveredGap] = useState<SkillGapItem | null>(null);
  const [selectedGapSkill, setSelectedGapSkill] = useState<string | null>(null);

  const gaps = recommendation.needToDevelopSkills;

  const gapNodes = useMemo(() => {
    return gaps.slice(0, 10).map((gap, i) => {
      const total = Math.min(10, gaps.length);
      const angle = (i / total) * Math.PI - Math.PI / 2;
      const radius = 3.6;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * 1.8;
      return {
        gap,
        position: [x, 0, z] as [number, number, number]
      };
    });
  }, [gaps]);

  const handleGapClick = (gap: SkillGapItem) => {
    setSelectedGapSkill(gap.skill);
    if (onSelectGap) onSelectGap(gap);
  };

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] bg-slate-950/90 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <Canvas
        camera={{ position: [0, 4, 9], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#38bdf8" />
        <pointLight position={[-10, 10, -5]} intensity={0.8} color="#f43f5e" />

        {/* Origin Platform (Current Capability Anchor) */}
        <group position={[-4.5, 0, 0]}>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[1.0, 1.2, 0.2, 32]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <icosahedronGeometry args={[0.5, 1]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={0.6}
              roughness={0.2}
              metalness={0.8}
              wireframe
            />
          </mesh>
        </group>

        {/* Destination Platform (Target Role Target) */}
        <group position={[4.5, 0, 0]}>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[1.0, 1.2, 0.2, 32]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <octahedronGeometry args={[0.6, 0]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#7e22ce"
              emissiveIntensity={0.7}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        </group>

        {/* Gap Pillars bridging the transition distance */}
        {gapNodes.map(gn => (
          <GapPillarMesh
            key={gn.gap.skill}
            gap={gn.gap}
            position={gn.position}
            isSelected={selectedGapSkill === gn.gap.skill}
            isHovered={hoveredGap?.skill === gn.gap.skill}
            onHover={setHoveredGap}
            onClick={handleGapClick}
          />
        ))}

        {/* Ground Reference Grid Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <ringGeometry args={[1.2, 5.5, 48]} />
          <meshBasicMaterial color="#1e293b" wireframe transparent opacity={0.3} />
        </mesh>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          maxDistance={15}
          minDistance={6}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 4}
          autoRotate={false}
        />
      </Canvas>

      {/* Floating HUD: Skill Gap Inspection Details */}
      <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-1.5 z-10">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-750 text-[11px] font-mono text-slate-300 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          <span>Spatial Skill Distance & Effort</span>
        </div>
        {hoveredGap ? (
          <div className="bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-rose-500/40 text-xs shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 block font-bold">
              {hoveredGap.category} • {hoveredGap.priority} Priority
            </span>
            <span className="font-bold text-white text-sm block mt-0.5">{hoveredGap.skill}</span>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300 mt-1">
              <span>Effort: <strong className="text-amber-400">{hoveredGap.estimatedEffortWeeks || 4} weeks</strong></span>
              <span>Reason: <span className="text-slate-400">{hoveredGap.whyNeeded || 'Essential competency requirement'}</span></span>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 font-mono bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-850">
            Pillar Altitude = Learning Effort (Weeks) • Left: Origin → Right: Target
          </div>
        )}
      </div>

      {/* Legend Bar */}
      <div className="absolute bottom-3 right-3 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 shadow-lg z-10">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-rose-400" /> High Priority Gap
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-amber-400" /> Medium Priority
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-sky-400" /> Foundational Gap
        </span>
      </div>
    </div>
  );
};
