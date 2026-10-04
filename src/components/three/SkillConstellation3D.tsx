import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { NormalizedSkill } from '../../types/skills.ts';
import { UserProfile } from '../../types/profile.ts';

interface SkillConstellation3DProps {
  skills: NormalizedSkill[];
  profile: UserProfile | null;
  selectedCategory: string;
  selectedSkill: NormalizedSkill | null;
  onSelectSkill: (skill: NormalizedSkill) => void;
}

interface ConstellationNode {
  skill: NormalizedSkill;
  position: [number, number, number];
  color: string;
  isUserSkill: boolean;
  size: number;
}

const DOMAIN_ANGLES: Record<string, number> = {
  Programming: 0,
  Backend: 0.8,
  Frontend: 1.6,
  Database: 2.4,
  Cloud: 3.2,
  DevOps: 4.0,
  AI: 4.8,
  ML: 5.2,
  GenAI: 5.6,
  Cybersecurity: 2.0,
  Data: 2.8,
  Architecture: 3.6,
  'Soft Skills': 1.2
};

const SkillNodeMesh: React.FC<{
  node: ConstellationNode;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (node: ConstellationNode | null) => void;
  onClick: (skill: NormalizedSkill) => void;
}> = ({ node, isSelected, isHovered, onHover, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;
    if (node.isUserSkill) {
      meshRef.current.rotation.y = timeRef.current * 0.5;
    }
  });

  const baseScale = node.size * (isSelected ? 1.6 : isHovered ? 1.35 : 1.0);

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        scale={[baseScale, baseScale, baseScale]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(node.skill);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(node);
        }}
        onPointerOut={() => onHover(null)}
      >
        {node.skill.isEmerging ? (
          <octahedronGeometry args={[1, 0]} />
        ) : node.isUserSkill ? (
          <icosahedronGeometry args={[1, 0]} />
        ) : (
          <sphereGeometry args={[1, 14, 10]} />
        )}

        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isSelected ? 0.95 : isHovered ? 0.75 : node.isUserSkill ? 0.6 : 0.25}
          roughness={0.2}
          metalness={0.8}
          wireframe={node.isUserSkill && isSelected}
        />
      </mesh>

      {/* Verified Candidate Skill Ring Indicator */}
      {node.isUserSkill && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[baseScale * 1.3, baseScale * 1.45, 24]} />
          <meshBasicMaterial
            color="#38bdf8"
            side={THREE.DoubleSide}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* Selected Orbit Ring */}
      {isSelected && (
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <ringGeometry args={[baseScale * 1.6, baseScale * 1.75, 28]} />
          <meshBasicMaterial
            color="#22d3ee"
            side={THREE.DoubleSide}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}
    </group>
  );
};

// Radial Constellation Lines connecting skills within the same technology domain
const DomainConstellationLines: React.FC<{
  nodes: ConstellationNode[];
}> = ({ nodes }) => {
  const lineData = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const colors: THREE.Color[] = [];

    // Group by category
    const byCategory = new Map<string, ConstellationNode[]>();
    nodes.forEach(n => {
      const list = byCategory.get(n.skill.category) || [];
      list.push(n);
      byCategory.set(n.skill.category, list);
    });

    byCategory.forEach(list => {
      for (let i = 0; i < list.length - 1; i++) {
        for (let j = i + 1; j < Math.min(i + 4, list.length); j++) {
          const p1 = new THREE.Vector3(...list[i].position);
          const p2 = new THREE.Vector3(...list[j].position);
          points.push(p1, p2);
          const col = new THREE.Color(list[i].color).multiplyScalar(0.4);
          colors.push(col, col);
        }
      }
    });

    if (points.length === 0) return null;

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const colorFloats = new Float32Array(colors.length * 3);
    for (let i = 0; i < colors.length; i++) {
      colorFloats[i * 3] = colors[i].r;
      colorFloats[i * 3 + 1] = colors[i].g;
      colorFloats[i * 3 + 2] = colors[i].b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colorFloats, 3));
    return geo;
  }, [nodes]);

  if (!lineData) return null;

  return (
    <lineSegments geometry={lineData}>
      <lineBasicMaterial vertexColors transparent opacity={0.35} />
    </lineSegments>
  );
};

export const SkillConstellation3D: React.FC<SkillConstellation3DProps> = ({
  skills,
  profile,
  selectedCategory,
  selectedSkill,
  onSelectSkill
}) => {
  const [hoveredNode, setHoveredNode] = useState<ConstellationNode | null>(null);

  const userSkillSet = useMemo(() => {
    return new Set(profile?.skills.map(s => s.toLowerCase().trim()) || []);
  }, [profile]);

  const nodes: ConstellationNode[] = useMemo(() => {
    const activeSkills = skills.filter(
      s => selectedCategory === 'All' || s.category === selectedCategory
    );

    return activeSkills.map((s, idx) => {
      const isUserSkill = userSkillSet.has(s.name.toLowerCase().trim());
      const baseAngle = DOMAIN_ANGLES[s.category] ?? (idx * 0.4);
      const angle = baseAngle + ((idx % 7) - 3) * 0.12;
      const radius = 3.2 + (s.baselineDemandIndex / 100) * 2.8;

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      // Z maps inverted AI Automation Exposure: lower exposure = higher positive altitude
      const z = ((100 - s.aiExposureScore) / 100) * 3.5 - 1.75;

      let color = '#38bdf8'; // Default technology cyan
      if (s.isEmerging) {
        color = '#10b981'; // Emerald emerging
      } else if (s.aiExposureScore >= 60) {
        color = '#f43f5e'; // Rose automation exposed
      } else if (isUserSkill) {
        color = '#06b6d4'; // Bright verified candidate skill
      } else {
        color = '#60a5fa'; // Blue benchmark
      }

      return {
        skill: s,
        position: [x, y, z],
        color,
        isUserSkill,
        size: isUserSkill ? 0.38 : s.isEmerging ? 0.34 : 0.28
      };
    });
  }, [skills, selectedCategory, userSkillSet]);

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] bg-slate-950/90 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <Canvas
        camera={{ position: [0, 0, 11], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#38bdf8" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />

        <DomainConstellationLines nodes={nodes} />

        {nodes.map(n => (
          <SkillNodeMesh
            key={n.skill.id}
            node={n}
            isSelected={selectedSkill?.id === n.skill.id}
            isHovered={hoveredNode?.skill.id === n.skill.id}
            onHover={setHoveredNode}
            onClick={onSelectSkill}
          />
        ))}

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          maxDistance={17}
          minDistance={5}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3.2}
          autoRotate={false}
        />
      </Canvas>

      {/* Floating HUD: Interactive Node Details */}
      <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-1.5 z-10">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-750 text-[11px] font-mono text-slate-300 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Spatial Taxonomy Constellation</span>
        </div>
        {hoveredNode ? (
          <div className="bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-cyan-500/40 text-xs shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold">
                {hoveredNode.skill.category}
              </span>
              {hoveredNode.isUserSkill && (
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">
                  In Your Profile
                </span>
              )}
            </div>
            <span className="font-bold text-white text-sm block mt-0.5">{hoveredNode.skill.name}</span>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300 mt-1">
              <span>Demand: <strong className="text-cyan-400">{hoveredNode.skill.baselineDemandIndex}/100</strong></span>
              <span>AI Exposure: <strong className={hoveredNode.skill.aiExposureScore >= 60 ? 'text-rose-400' : 'text-emerald-400'}>{hoveredNode.skill.aiExposureScore}%</strong></span>
              <span>Portability: <strong className="text-purple-400">{hoveredNode.skill.transferabilityScore}/100</strong></span>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 font-mono bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-850">
            Click any skill to inspect analytics • Z-Altitude = Automation Resistance
          </div>
        )}
      </div>

      {/* Legend Bar */}
      <div className="absolute bottom-3 right-3 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 shadow-lg z-10">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full ring-2 ring-cyan-400/80 bg-cyan-400" /> In Profile
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Emerging Frontier
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400" /> Automation Exposed (&ge;60%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400" /> Benchmark Skill
        </span>
      </div>
    </div>
  );
};
