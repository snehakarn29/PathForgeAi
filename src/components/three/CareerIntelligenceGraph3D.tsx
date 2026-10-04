import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { UserProfile } from '../../types/profile.ts';
import { TransitionRecommendation } from '../../types/transitions.ts';
import { LearningRoadmap } from '../../types/roadmap.ts';

export interface GraphNode {
  id: string;
  label: string;
  category: 'profile' | 'current_skill' | 'transferable' | 'emerging' | 'gap' | 'target_role' | 'resource';
  position: [number, number, number];
  color: string;
  size: number;
  data: any;
}

export interface GraphLink {
  source: string;
  target: string;
  color: string;
  width?: number;
  highlighted?: boolean;
}

interface CareerIntelligenceGraph3DProps {
  profile: UserProfile;
  recommendations: TransitionRecommendation[];
  roadmap: LearningRoadmap | null;
  selectedRoleTitle?: string | null;
  onSelectNode: (node: GraphNode) => void;
}

// Single 3D Node Mesh with gentle hover animation
const SceneNode: React.FC<{
  node: GraphNode;
  isSelected: boolean;
  isHovered: boolean;
  isHighlighted: boolean;
  onHover: (node: GraphNode | null) => void;
  onClick: (node: GraphNode) => void;
}> = ({ node, isSelected, isHovered, isHighlighted, onHover, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;
    const t = timeRef.current;
    if (node.category === 'profile') {
      meshRef.current.rotation.y = t * 0.4;
    } else if (node.category === 'target_role') {
      meshRef.current.rotation.y = t * 0.3;
      meshRef.current.rotation.x = Math.sin(t * 0.5) * 0.1;
    }
  });

  const baseScale = isSelected ? 1.4 : isHovered ? 1.25 : isHighlighted ? 1.15 : 1;

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        scale={[node.size * baseScale, node.size * baseScale, node.size * baseScale]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(node);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(node);
        }}
        onPointerOut={() => onHover(null)}
      >
        {node.category === 'target_role' ? (
          <octahedronGeometry args={[1, 0]} />
        ) : node.category === 'profile' ? (
          <icosahedronGeometry args={[1, 1]} />
        ) : node.category === 'resource' ? (
          <dodecahedronGeometry args={[1, 0]} />
        ) : (
          <sphereGeometry args={[1, 16, 12]} />
        )}

        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isSelected ? 0.9 : isHovered ? 0.7 : isHighlighted ? 0.5 : 0.25}
          roughness={0.2}
          metalness={0.8}
          wireframe={node.category === 'profile'}
        />
      </mesh>

      {/* Orbiting selection indicator ring */}
      {(isSelected || isHovered) && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[node.size * baseScale * 1.3, node.size * baseScale * 1.45, 32]} />
          <meshBasicMaterial
            color={node.color}
            side={THREE.DoubleSide}
            transparent
            opacity={isSelected ? 0.8 : 0.5}
          />
        </mesh>
      )}
    </group>
  );
};

// Line connection rendering
const ConnectionLines: React.FC<{
  links: GraphLink[];
  nodesMap: Map<string, GraphNode>;
}> = ({ links, nodesMap }) => {
  const lineData = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const colors: THREE.Color[] = [];

    for (const link of links) {
      const srcNode = nodesMap.get(link.source);
      const tgtNode = nodesMap.get(link.target);
      if (srcNode && tgtNode) {
        const p1 = new THREE.Vector3(...srcNode.position);
        const p2 = new THREE.Vector3(...tgtNode.position);
        points.push(p1, p2);

        const col = new THREE.Color(link.highlighted ? '#38bdf8' : link.color);
        colors.push(col, col);
      }
    }

    if (points.length === 0) {
      return null;
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const colorFloats = new Float32Array(colors.length * 3);
    for (let i = 0; i < colors.length; i++) {
      colorFloats[i * 3] = colors[i].r;
      colorFloats[i * 3 + 1] = colors[i].g;
      colorFloats[i * 3 + 2] = colors[i].b;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colorFloats, 3));
    return geometry;
  }, [links, nodesMap]);

  React.useEffect(() => {
    return () => {
      lineData?.dispose();
    };
  }, [lineData]);

  if (!lineData) return null;

  return (
    <lineSegments geometry={lineData}>
      <lineBasicMaterial vertexColors transparent opacity={0.45} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
};

export const CareerIntelligenceGraph3D: React.FC<CareerIntelligenceGraph3DProps> = ({
  profile,
  recommendations,
  roadmap,
  selectedRoleTitle,
  onSelectNode
}) => {
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Compute 3D spatial layout of nodes and links
  const { nodes, links, nodesMap } = useMemo(() => {
    const nodesList: GraphNode[] = [];
    const linksList: GraphLink[] = [];
    const map = new Map<string, GraphNode>();

    // 0. User Profile Node (Origin / Center-Left)
    const profileNode: GraphNode = {
      id: 'node-profile',
      label: profile.fullName || 'Candidate Profile',
      category: 'profile',
      position: [-8, 0, 0],
      color: '#38bdf8', // Cyan
      size: 0.9,
      data: profile
    };
    nodesList.push(profileNode);
    map.set(profileNode.id, profileNode);

    // 1. Current Skills (Column 1: x = -4.5)
    const activeSkills = profile.skills.slice(0, 10);
    activeSkills.forEach((skillName, idx) => {
      const angle = (idx / Math.max(1, activeSkills.length)) * Math.PI * 2;
      const y = Math.sin(angle) * 3.2;
      const z = Math.cos(angle) * 2.2;
      const isEmerging = ['LLM APIs & Prompt Engineering', 'Retrieval Augmented Generation (RAG)', 'Vector Databases', 'MLOps', 'Docker', 'Kubernetes'].includes(skillName);

      const skillNode: GraphNode = {
        id: `skill-${skillName}`,
        label: skillName,
        category: isEmerging ? 'emerging' : 'current_skill',
        position: [-4.5, y, z],
        color: isEmerging ? '#c084fc' : '#22d3ee', // Purple or Cyan
        size: 0.42,
        data: { name: skillName, type: 'Current Skill' }
      };
      nodesList.push(skillNode);
      map.set(skillNode.id, skillNode);

      // Connect profile to skill
      linksList.push({
        source: profileNode.id,
        target: skillNode.id,
        color: '#1e293b'
      });
    });

    // 2. Transferable Core Skills (Column 2: x = -1.2)
    const transferableSkills = activeSkills.filter(s =>
      ['SQL', 'Java', 'Python', 'JavaScript', 'TypeScript', 'REST APIs', 'Microservices', 'Docker', 'Git', 'Linux'].includes(s)
    ).slice(0, 6);

    transferableSkills.forEach((skillName, idx) => {
      const y = (idx - transferableSkills.length / 2) * 1.3;
      const z = Math.sin(idx * 1.5) * 1.2;

      const transNode: GraphNode = {
        id: `trans-${skillName}`,
        label: `${skillName} (Transferable)`,
        category: 'transferable',
        position: [-1.2, y, z],
        color: '#3b82f6', // Blue
        size: 0.45,
        data: { name: skillName, type: 'High Transferability' }
      };
      nodesList.push(transNode);
      map.set(transNode.id, transNode);

      // Connect from current skill
      const sourceSkill = map.get(`skill-${skillName}`);
      if (sourceSkill) {
        linksList.push({
          source: sourceSkill.id,
          target: transNode.id,
          color: '#2563eb'
        });
      }
    });

    // 3. Target Career Roles (Column 4: x = 4.5)
    const targetRecs = recommendations.slice(0, 3);
    targetRecs.forEach((rec, idx) => {
      const y = (idx - 1) * 2.8;
      const isTargetSelected = selectedRoleTitle && rec.targetRole.title.toLowerCase() === selectedRoleTitle.toLowerCase();

      const roleNode: GraphNode = {
        id: `role-${rec.targetRole.id}`,
        label: rec.targetRole.title,
        category: 'target_role',
        position: [4.5, y, 0],
        color: isTargetSelected ? '#38bdf8' : '#a855f7', // Bright Cyan or Violet
        size: 0.75,
        data: rec
      };
      nodesList.push(roleNode);
      map.set(roleNode.id, roleNode);

      // Connect transferable skills to target roles
      transferableSkills.forEach(sName => {
        const transNode = map.get(`trans-${sName}`);
        if (transNode && rec.alreadyHaveSkills.includes(sName)) {
          linksList.push({
            source: transNode.id,
            target: roleNode.id,
            color: isTargetSelected ? '#38bdf8' : '#334155',
            highlighted: Boolean(isTargetSelected)
          });
        }
      });
    });

    // 4. Skill Gaps (Column 3: x = 1.6)
    // Connect to selected or top target role
    const activeRec = targetRecs.find(r => selectedRoleTitle && r.targetRole.title.toLowerCase() === selectedRoleTitle.toLowerCase()) || targetRecs[0];
    if (activeRec) {
      const gaps = activeRec.needToDevelopSkills.slice(0, 6);
      gaps.forEach((gap, idx) => {
        const y = (idx - gaps.length / 2) * 1.2;
        const z = Math.cos(idx * 1.5) * 1.4;

        const gapNode: GraphNode = {
          id: `gap-${gap.skill}`,
          label: `Gap: ${gap.skill}`,
          category: 'gap',
          position: [1.6, y, z],
          color: gap.priority === 'High' ? '#f43f5e' : '#fbbf24', // Rose / Amber
          size: 0.4,
          data: gap
        };
        nodesList.push(gapNode);
        map.set(gapNode.id, gapNode);

        // Connect Gap to Target Role
        const roleNode = map.get(`role-${activeRec.targetRole.id}`);
        if (roleNode) {
          linksList.push({
            source: gapNode.id,
            target: roleNode.id,
            color: '#e11d48',
            highlighted: true
          });
        }
      });
    }

    // 5. Learning Path Milestones / Resources (Column 5: x = 7.5)
    if (roadmap && roadmap.milestones) {
      roadmap.milestones.forEach((m, idx) => {
        const y = (idx - 1) * 2.2;
        const z = Math.sin(idx * 2) * 1.0;

        const milestoneNode: GraphNode = {
          id: `milestone-${m.id}`,
          label: `Phase ${idx + 1}: ${m.targetSkills.join(', ')}`,
          category: 'resource',
          position: [7.5, y, z],
          color: '#10b981', // Emerald
          size: 0.5,
          data: m
        };
        nodesList.push(milestoneNode);
        map.set(milestoneNode.id, milestoneNode);

        // Connect from the matching Target Role
        const activeRoleNode = map.get(`role-${roadmap.targetRoleId}`);
        if (activeRoleNode) {
          linksList.push({
            source: activeRoleNode.id,
            target: milestoneNode.id,
            color: '#059669',
            highlighted: true
          });
        }
      });
    }

    return { nodes: nodesList, links: linksList, nodesMap: map };
  }, [profile, recommendations, roadmap, selectedRoleTitle]);

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    onSelectNode(node);
  };

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [0, 2, 14], fov: 48 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 15, 30]} />

        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 15, 10]} intensity={1.2} />
        <pointLight position={[-10, -5, -5]} intensity={0.5} color="#38bdf8" />
        <pointLight position={[10, 5, 5]} intensity={0.6} color="#c084fc" />

        {/* Node Meshes */}
        <group>
          {nodes.map(node => (
            <SceneNode
              key={node.id}
              node={node}
              isSelected={selectedNode?.id === node.id}
              isHovered={hoveredNode?.id === node.id}
              isHighlighted={
                hoveredNode?.category === 'target_role'
                  ? links.some(l => (l.source === node.id && l.target === hoveredNode.id) || (l.target === node.id && l.source === hoveredNode.id))
                  : false
              }
              onHover={setHoveredNode}
              onClick={handleNodeClick}
            />
          ))}

          {/* Connection Lines */}
          <ConnectionLines links={links} nodesMap={nodesMap} />
        </group>

        {/* Smooth Orbit Controls with damping */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxDistance={24}
          minDistance={6}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3.5}
        />
      </Canvas>

      {/* Dynamic Hover/Select HUD Floating Overlay */}
      {hoveredNode && (
        <div className="absolute top-4 left-4 z-20 pointer-events-none bg-slate-900/95 border border-slate-700/80 px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in duration-150">
          <div
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: hoveredNode.color }}
          />
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{hoveredNode.label}</span>
              {hoveredNode.category === 'target_role' && hoveredNode.data?.fitScore && (
                <span className="text-cyan-400 font-mono text-[11px] font-bold">
                  {hoveredNode.data.fitScore}% Fit
                </span>
              )}
            </div>
            <span
              className="text-[10px] font-mono uppercase font-semibold block"
              style={{ color: hoveredNode.color }}
            >
              {hoveredNode.category.replace('_', ' ')}
            </span>
          </div>
        </div>
      )}

      {/* Interactive Category Legend */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex flex-col gap-1.5 p-3 rounded-xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md text-[10px] font-mono pointer-events-none">
        <span className="text-slate-400 uppercase font-bold text-[9px] mb-0.5">Topology Dimension</span>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span>Profile / Candidate</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Transferable Core</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
          <span>Emerging Tech</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Skill Gaps</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
          <span>Target Roles</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Learning Milestones</span>
        </div>
      </div>

      {/* Camera Guidance Tooltip */}
      <div className="absolute bottom-3 left-4 text-[10px] font-mono text-slate-500 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800/80 pointer-events-none">
        Rotate: Left Click + Drag • Zoom: Scroll • Pan: Right Click • Select: Click Node
      </div>
    </div>
  );
};
