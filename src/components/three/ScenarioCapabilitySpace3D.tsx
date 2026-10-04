import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ResilienceAnalysis } from '../../types/resilience.ts';
import { UserProfile } from '../../types/profile.ts';
import { TARGET_ROLES } from '../../data/targetRoles.ts';

interface ScenarioCapabilitySpace3DProps {
  profile: UserProfile;
  baseAnalysis: ResilienceAnalysis | null;
  simulatedAnalysis: ResilienceAnalysis;
  simulatedSkills: string[];
  scoreDelta: number;
}

const CapabilityEnvelope: React.FC<{
  analysis: ResilienceAnalysis;
  color: string;
  wireframe?: boolean;
  opacity: number;
}> = ({ analysis, color, wireframe = false, opacity }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const f = analysis.factors;

  const { geometry } = useMemo(() => {
    const scores = [
      f.marketDemand.score,
      f.transferability.score,
      f.aiExposure.score,
      f.skillBreadth.score,
      f.emergingAlignment.score
    ];

    const count = 5;
    const radiusMax = 3.8;
    const basePts: [number, number, number][] = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const r = (Math.max(15, scores[i]) / 100) * radiusMax;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      const z = ((scores[i] - 50) / 100) * 1.2;
      basePts.push([x, y, z]);
    }

    const topApex: [number, number, number] = [0, 0, 1.4];
    const bottomApex: [number, number, number] = [0, 0, -1.4];

    const vertices: number[] = [];
    for (let i = 0; i < count; i++) {
      const next = (i + 1) % count;
      const p1 = basePts[i];
      const p2 = basePts[next];

      // Upper cone
      vertices.push(...topApex, ...p1, ...p2);
      // Lower cone
      vertices.push(...bottomApex, ...p2, ...p1);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return { geometry: geo };
  }, [f]);

  React.useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;
    meshRef.current.rotation.y = timeRef.current * 0.15;
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.45}
        roughness={0.3}
        metalness={0.7}
        transparent
        opacity={opacity}
        wireframe={wireframe}
      />
    </mesh>
  );
};

// Target Role Satellites in the periphery
const TargetRoleSatellites: React.FC<{
  currentSkills: string[];
}> = ({ currentSkills }) => {
  const currentSkillsSet = useMemo(() => {
    return new Set(currentSkills.map(s => s.toLowerCase().trim()));
  }, [currentSkills]);

  const satellites = useMemo(() => {
    const roles = TARGET_ROLES.slice(0, 6);
    return roles.map((r, i) => {
      const angle = (i / roles.length) * Math.PI * 2;
      const distance = 5.2;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const z = (i % 2 === 0 ? 0.8 : -0.8);

      const matchingCount = r.coreSkills.filter(cs => currentSkillsSet.has(cs.toLowerCase().trim())).length;
      const matchRatio = matchingCount / Math.max(1, r.coreSkills.length);
      const isReachable = matchRatio >= 0.55;

      return {
        role: r,
        position: [x, y, z] as [number, number, number],
        matchRatio,
        isReachable,
        matchingCount
      };
    });
  }, [currentSkillsSet]);

  return (
    <group>
      {satellites.map(sat => (
        <group key={sat.role.id} position={sat.position}>
          <mesh scale={sat.isReachable ? [0.45, 0.45, 0.45] : [0.3, 0.3, 0.3]}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={sat.isReachable ? '#22d3ee' : '#475569'}
              emissive={sat.isReachable ? '#0891b2' : '#0f172a'}
              emissiveIntensity={sat.isReachable ? 0.8 : 0.2}
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>

          {/* Radial vector line from core to satellite */}
          <line>
            <bufferGeometry
              attach="geometry"
              onUpdate={(self) => {
                const pts = [
                  new THREE.Vector3(0, 0, 0),
                  new THREE.Vector3(-sat.position[0], -sat.position[1], -sat.position[2])
                ];
                self.setFromPoints(pts);
              }}
            />
            <lineBasicMaterial
              color={sat.isReachable ? '#06b6d4' : '#1e293b'}
              transparent
              opacity={sat.isReachable ? 0.6 : 0.2}
            />
          </line>
        </group>
      ))}
    </group>
  );
};

export const ScenarioCapabilitySpace3D: React.FC<ScenarioCapabilitySpace3DProps> = ({
  profile,
  baseAnalysis,
  simulatedAnalysis,
  simulatedSkills,
  scoreDelta
}) => {
  const allCurrentSkills = useMemo(() => {
    return Array.from(new Set([...profile.skills, ...simulatedSkills]));
  }, [profile.skills, simulatedSkills]);

  return (
    <div className="relative w-full h-[380px] sm:h-[450px] bg-slate-950/90 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <Canvas
        camera={{ position: [0, 0, 11], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#22d3ee" />
        <pointLight position={[-10, -10, -8]} intensity={0.8} color="#a855f7" />

        {/* 1. Baseline Envelope (Wireframe Reference) */}
        {baseAnalysis && (
          <CapabilityEnvelope
            analysis={baseAnalysis}
            color="#475569"
            wireframe={true}
            opacity={0.4}
          />
        )}

        {/* 2. Expanded Simulated Envelope (Solid Luminous) */}
        <CapabilityEnvelope
          analysis={simulatedAnalysis}
          color={scoreDelta > 0 ? '#10b981' : '#06b6d4'}
          wireframe={false}
          opacity={0.75}
        />

        {/* 3. Orbiting Target Role Nodes */}
        <TargetRoleSatellites currentSkills={allCurrentSkills} />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          maxDistance={16}
          minDistance={6}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3.2}
          autoRotate={false}
        />
      </Canvas>

      {/* Floating HUD: Real-time Delta */}
      <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-1.5 z-10">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-750 text-[11px] font-mono text-slate-300 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Capability Space Envelope</span>
        </div>
        <div className="bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-750 text-xs shadow-xl">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">Resilience Score:</span>
            <span className="text-sm font-bold text-white font-mono">{simulatedAnalysis.overallScore}/100</span>
            {scoreDelta !== 0 && (
              <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${scoreDelta > 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'text-slate-400'}`}>
                {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta} pts
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-mono block mt-1">
            Simulated Additions: <strong className="text-cyan-400">{simulatedSkills.length} skills</strong>
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 shadow-lg z-10">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm border border-slate-500" /> Baseline Envelope
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-emerald-500" /> Expanded Reach
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-cyan-400 rotate-45" /> Unlocked Roles
        </span>
      </div>
    </div>
  );
};
