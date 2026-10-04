import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { TransitionRecommendation } from '../../types/transitions.ts';
import { UserProfile } from '../../types/profile.ts';

export interface TransitionNode3D {
  id: string;
  label: string;
  type: 'current_role' | 'target_role' | 'have_skill' | 'need_skill';
  position: [number, number, number];
  color: string;
  size: number;
  data: any;
}

export interface TransitionLink3D {
  source: string;
  target: string;
  color: string;
  highlighted: boolean;
  dashed?: boolean;
}

interface CareerTransitionGraph3DProps {
  profile: UserProfile | null;
  recommendations: TransitionRecommendation[];
  selectedRecId: string | null;
  onSelectRec: (recId: string) => void;
  onSelectNode?: (node: TransitionNode3D) => void;
}

// 3D Node Mesh with organic hover & focus pulsing
const NodeMesh: React.FC<{
  node: TransitionNode3D;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (node: TransitionNode3D | null) => void;
  onClick: (node: TransitionNode3D) => void;
}> = ({ node, isSelected, isHovered, onHover, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;
    const t = timeRef.current;

    if (node.type === 'target_role') {
      meshRef.current.rotation.y = t * 0.4;
      meshRef.current.rotation.z = Math.sin(t * 0.6) * 0.1;
    } else if (node.type === 'current_role') {
      meshRef.current.rotation.y = t * 0.2;
    }
  });

  const scale = (node.size * (isSelected ? 1.5 : isHovered ? 1.3 : 1.0));

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        scale={[scale, scale, scale]}
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
        {node.type === 'target_role' ? (
          <octahedronGeometry args={[1, 0]} />
        ) : node.type === 'current_role' ? (
          <icosahedronGeometry args={[1, 1]} />
        ) : node.type === 'have_skill' ? (
          <sphereGeometry args={[1, 14, 10]} />
        ) : (
          <boxGeometry args={[1.2, 1.2, 1.2]} />
        )}

        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isSelected ? 0.9 : isHovered ? 0.7 : 0.3}
          roughness={0.25}
          metalness={0.8}
          wireframe={node.type === 'current_role'}
        />
      </mesh>

      {/* Orbiting selection indicator ring */}
      {(isSelected || isHovered) && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 1.35, scale * 1.55, 32]} />
          <meshBasicMaterial
            color={node.color}
            side={THREE.DoubleSide}
            transparent
            opacity={isSelected ? 0.85 : 0.5}
          />
        </mesh>
      )}
    </group>
  );
};

// Animated Data Packet Pulses travelling along active transition vectors
const DataPackets: React.FC<{
  links: TransitionLink3D[];
  nodesMap: Map<string, TransitionNode3D>;
}> = ({ links, nodesMap }) => {
  const packetCount = 12;
  const packets = useRef<THREE.Mesh[]>([]);
  const progresses = useRef<number[]>(Array.from({ length: packetCount }, (_, i) => i / packetCount));

  const activeLinks = useMemo(() => {
    return links.filter(l => l.highlighted);
  }, [links]);

  useFrame((_, delta) => {
    if (activeLinks.length === 0) return;

    for (let i = 0; i < packetCount; i++) {
      const mesh = packets.current[i];
      if (!mesh) continue;

      progresses.current[i] = (progresses.current[i] + delta * 0.35) % 1;
      const progress = progresses.current[i];

      const link = activeLinks[i % activeLinks.length];
      const srcNode = nodesMap.get(link.source);
      const tgtNode = nodesMap.get(link.target);

      if (srcNode && tgtNode) {
        mesh.visible = true;
        mesh.position.lerpVectors(
          new THREE.Vector3(...srcNode.position),
          new THREE.Vector3(...tgtNode.position),
          progress
        );
      } else {
        mesh.visible = false;
      }
    }
  });

  return (
    <group>
      {Array.from({ length: packetCount }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) packets.current[i] = el;
          }}
          visible={false}
        >
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      ))}
    </group>
  );
};

// Line connections
const LineNetwork: React.FC<{
  links: TransitionLink3D[];
  nodesMap: Map<string, TransitionNode3D>;
}> = ({ links, nodesMap }) => {
  const lineData = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const colors: THREE.Color[] = [];

    for (const link of links) {
      const src = nodesMap.get(link.source);
      const tgt = nodesMap.get(link.target);
      if (src && tgt) {
        points.push(new THREE.Vector3(...src.position), new THREE.Vector3(...tgt.position));
        const c = new THREE.Color(link.highlighted ? '#38bdf8' : link.color);
        colors.push(c, c);
      }
    }

    if (points.length === 0) return null;

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const colorArr = new Float32Array(colors.length * 3);
    for (let i = 0; i < colors.length; i++) {
      colorArr[i * 3] = colors[i].r;
      colorArr[i * 3 + 1] = colors[i].g;
      colorArr[i * 3 + 2] = colors[i].b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));
    return geo;
  }, [links, nodesMap]);

  if (!lineData) return null;

  return (
    <lineSegments geometry={lineData}>
      <lineBasicMaterial vertexColors transparent opacity={0.65} linewidth={1} />
    </lineSegments>
  );
};

export const CareerTransitionGraph3D: React.FC<CareerTransitionGraph3DProps> = ({
  profile,
  recommendations,
  selectedRecId,
  onSelectRec,
  onSelectNode
}) => {
  const [hoveredNode, setHoveredNode] = useState<TransitionNode3D | null>(null);

  // Construct 3D transition topology driven purely by real recommendation data
  const { nodes, links, nodesMap } = useMemo(() => {
    const nodeList: TransitionNode3D[] = [];
    const linkList: TransitionLink3D[] = [];
    const map = new Map<string, TransitionNode3D>();

    // 1. Candidate's Current Role Node (Origin on Left)
    const currentTitle = profile?.currentRole || 'Candidate Background';
    const originNode: TransitionNode3D = {
      id: 'current_origin',
      label: currentTitle,
      type: 'current_role',
      position: [-5.5, 0, 0],
      color: '#38bdf8',
      size: 0.65,
      data: { role: currentTitle, years: profile?.yearsOfExperience }
    };
    nodeList.push(originNode);
    map.set(originNode.id, originNode);

    // Selected active recommendation
    const activeRec = recommendations.find(r => r.id === selectedRecId) || recommendations[0];

    // 2. Transferable skills (Bridging layer in the center-left)
    const transferableSkills = activeRec ? activeRec.alreadyHaveSkills.slice(0, 6) : (profile?.skills.slice(0, 6) || []);
    transferableSkills.forEach((skill, idx) => {
      const angle = ((idx - (transferableSkills.length - 1) / 2) * 0.45);
      const y = Math.sin(angle) * 3.2;
      const z = Math.cos(angle) * 1.5 - 1.0;
      const x = -1.8;

      const skillNode: TransitionNode3D = {
        id: `have_skill_${skill}`,
        label: skill,
        type: 'have_skill',
        position: [x, y, z],
        color: '#10b981',
        size: 0.32,
        data: { skill, status: 'verified_transferable' }
      };
      nodeList.push(skillNode);
      map.set(skillNode.id, skillNode);

      // Link from Origin -> Have Skill
      linkList.push({
        source: originNode.id,
        target: skillNode.id,
        color: '#064e3b',
        highlighted: true
      });
    });

    // 3. Target Roles (Right layer, positioned along arc by fit score)
    const topRecs = recommendations.slice(0, 4);
    topRecs.forEach((rec, idx) => {
      const isSelected = rec.id === (activeRec?.id || '');
      const spread = 2.4;
      const y = (idx - (topRecs.length - 1) / 2) * spread;
      // Position X and Z by fit score: higher fit = closer to origin
      const distOffset = (100 - rec.fitScore) * 0.04;
      const x = 3.6 + distOffset;
      const z = (idx % 2 === 0 ? 0.6 : -0.6);

      const targetNode: TransitionNode3D = {
        id: `target_${rec.id}`,
        label: rec.targetRole.title,
        type: 'target_role',
        position: [x, y, z],
        color: isSelected ? '#a855f7' : '#64748b',
        size: isSelected ? 0.72 : 0.55,
        data: rec
      };
      nodeList.push(targetNode);
      map.set(targetNode.id, targetNode);

      // Link transferable skills -> Selected target role
      if (isSelected) {
        transferableSkills.forEach(skill => {
          linkList.push({
            source: `have_skill_${skill}`,
            target: targetNode.id,
            color: '#10b981',
            highlighted: true
          });
        });

        // 4. Missing Skill Gaps branching off selected target role
        const missingSkills = rec.needToDevelopSkills.slice(0, 5);
        missingSkills.forEach((gap, gIdx) => {
          const gAngle = ((gIdx - (missingSkills.length - 1) / 2) * 0.5);
          const gx = x + 2.5;
          const gy = y + Math.sin(gAngle) * 2.0;
          const gz = z + Math.cos(gAngle) * 1.5;

          const gapNode: TransitionNode3D = {
            id: `gap_${gap.skill}`,
            label: gap.skill,
            type: 'need_skill',
            position: [gx, gy, gz],
            color: gap.priority === 'High' ? '#f43f5e' : '#fbbf24',
            size: 0.28,
            data: gap
          };
          nodeList.push(gapNode);
          map.set(gapNode.id, gapNode);

          // Link Target Role -> Required Skill Gap
          linkList.push({
            source: targetNode.id,
            target: gapNode.id,
            color: gap.priority === 'High' ? '#881337' : '#78350f',
            highlighted: true,
            dashed: true
          });
        });
      } else {
        // Subtle inactive link
        linkList.push({
          source: originNode.id,
          target: targetNode.id,
          color: '#1e293b',
          highlighted: false
        });
      }
    });

    return { nodes: nodeList, links: linkList, nodesMap: map };
  }, [profile, recommendations, selectedRecId]);

  const handleNodeClick = (node: TransitionNode3D) => {
    if (node.type === 'target_role') {
      const recId = node.id.replace('target_', '');
      onSelectRec(recId);
    }
    if (onSelectNode) {
      onSelectNode(node);
    }
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] bg-slate-950/90 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 11], fov: 48 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#38bdf8" />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#a855f7" />
        <directionalLight position={[0, 5, 5]} intensity={0.6} />

        <LineNetwork links={links} nodesMap={nodesMap} />
        <DataPackets links={links} nodesMap={nodesMap} />

        {nodes.map(node => (
          <NodeMesh
            key={node.id}
            node={node}
            isSelected={
              node.type === 'target_role' && node.id === `target_${selectedRecId}`
            }
            isHovered={hoveredNode?.id === node.id}
            onHover={setHoveredNode}
            onClick={handleNodeClick}
          />
        ))}

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          maxDistance={18}
          minDistance={6}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3}
          autoRotate={false}
        />
      </Canvas>

      {/* Floating HUD: Interactive Inspection Badge */}
      <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-1.5 z-10">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-750 text-[11px] font-mono text-slate-300 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Spatial Transition Topology</span>
        </div>
        {hoveredNode ? (
          <div className="bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-500/40 text-xs shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 block font-bold">
              {hoveredNode.type.replace('_', ' ')}
            </span>
            <span className="font-bold text-white text-sm block mt-0.5">{hoveredNode.label}</span>
            {hoveredNode.type === 'target_role' && (
              <span className="text-[11px] text-slate-300 font-mono block mt-0.5">
                Fit Score: {hoveredNode.data?.fitScore}% • Click to pivot target
              </span>
            )}
            {hoveredNode.type === 'need_skill' && (
              <span className="text-[11px] text-rose-300 font-mono block mt-0.5">
                Priority: {hoveredNode.data?.priority} • Est: {hoveredNode.data?.learningEffortWeeks} weeks
              </span>
            )}
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 font-mono bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-850">
            Click any target octahedron to inspect career trajectory • Drag to rotate
          </div>
        )}
      </div>

      {/* Spatial Legend Bar */}
      <div className="absolute bottom-3 right-3 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 shadow-lg z-10">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400" /> Current Role
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Transferable Skill
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-purple-400 rotate-45" /> Target Role
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-rose-400" /> Skill Gap
        </span>
      </div>
    </div>
  );
};
