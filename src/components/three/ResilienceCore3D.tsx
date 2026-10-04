import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ResilienceAnalysis, FactorScoreDetail } from '../../types/resilience.ts';

interface ResilienceCore3DProps {
  analysis: ResilienceAnalysis;
  onSelectFactor?: (factorName: string, detail: FactorScoreDetail) => void;
}

const FACTOR_KEYS = [
  { key: 'marketDemand', name: 'Market Demand', weight: '30%', color: '#22d3ee' },
  { key: 'transferability', name: 'Transferability', weight: '25%', color: '#3b82f6' },
  { key: 'aiExposure', name: 'AI Exposure Resilience', weight: '20%', color: '#a855f7' },
  { key: 'skillBreadth', name: 'Skill Breadth', weight: '15%', color: '#38bdf8' },
  { key: 'emergingAlignment', name: 'Emerging Alignment', weight: '10%', color: '#10b981' }
];

const InnerPentagonCore: React.FC<{
  analysis: ResilienceAnalysis;
  hoveredKey: string | null;
  onHover: (key: string | null) => void;
  onClick: (key: string) => void;
}> = ({ analysis, hoveredKey, onHover, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);

  const f = analysis.factors;

  // Compute vertices based on REAL factor scores (0 to 100)
  const { coreGeometry, outerGeometry, factorPositions } = useMemo(() => {
    const radiusMax = 3.6;
    const count = 5;
    const positions: [number, number, number][] = [];
    const outerPositions: [number, number, number][] = [];
    const factorCoords: Record<string, [number, number, number]> = {};

    FACTOR_KEYS.forEach((fk, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const score = f[fk.key as keyof typeof f]?.score ?? 50;
      const r = (Math.max(15, score) / 100) * radiusMax;

      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      const z = ((score - 50) / 100) * 0.8; // subtle 3D depth tilt

      positions.push([x, y, z]);
      factorCoords[fk.key] = [x, y, z];

      // 100% threshold boundary coordinate
      const ox = Math.cos(angle) * radiusMax;
      const oy = Math.sin(angle) * radiusMax;
      outerPositions.push([ox, oy, 0]);
    });

    // Construct 3D polyhedron: center apex at (0, 0, 1.2) and back apex at (0, 0, -1.2)
    const vertices: number[] = [];
    const topApex = [0, 0, 1.2];
    const bottomApex = [0, 0, -1.2];

    for (let i = 0; i < count; i++) {
      const next = (i + 1) % count;
      const p1 = positions[i];
      const p2 = positions[next];

      // Top triangle
      vertices.push(...topApex, ...p1, ...p2);
      // Bottom triangle
      vertices.push(...bottomApex, ...p2, ...p1);
    }

    const coreGeo = new THREE.BufferGeometry();
    coreGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    coreGeo.computeVertexNormals();

    // Outer threshold wireframe
    const outerLinePoints: THREE.Vector3[] = [];
    for (let i = 0; i <= count; i++) {
      const p = outerPositions[i % count];
      outerLinePoints.push(new THREE.Vector3(...p));
    }
    const outerGeo = new THREE.BufferGeometry().setFromPoints(outerLinePoints);

    return { coreGeometry: coreGeo, outerGeometry: outerGeo, factorPositions: factorCoords };
  }, [analysis, f]);

  React.useEffect(() => {
    return () => {
      coreGeometry.dispose();
      outerGeometry.dispose();
    };
  }, [coreGeometry, outerGeometry]);

  const timeRef = useRef(0);

  useFrame((state, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(t * 0.2) * 0.05;
      meshRef.current.rotation.y = t * 0.25;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.15;
    }
  });

  return (
    <group>
      {/* 3D Dynamic Crystal Mesh */}
      <mesh
        ref={meshRef}
        geometry={coreGeometry}
      >
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#083344"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.85}
          transparent
          opacity={0.78}
          wireframe={false}
        />
      </mesh>

      {/* Outer 100% Baseline Wireframe Ring */}
      <group ref={ringRef}>
        <lineLoop geometry={outerGeometry}>
          <lineBasicMaterial color="#334155" transparent opacity={0.6} />
        </lineLoop>
      </group>

      {/* Factor Vertex Interactive Nodes */}
      {FACTOR_KEYS.map((fk) => {
        const pos = factorPositions[fk.key];
        const isHovered = hoveredKey === fk.key;
        const score = f[fk.key as keyof typeof f]?.score ?? 0;

        return (
          <group key={fk.key} position={pos}>
            <mesh
              scale={isHovered ? [0.45, 0.45, 0.45] : [0.32, 0.32, 0.32]}
              onPointerOver={(e) => {
                e.stopPropagation();
                onHover(fk.key);
              }}
              onPointerOut={() => onHover(null)}
              onClick={(e) => {
                e.stopPropagation();
                onClick(fk.key);
              }}
            >
              <sphereGeometry args={[1, 16, 12]} />
              <meshStandardMaterial
                color={fk.color}
                emissive={fk.color}
                emissiveIntensity={isHovered ? 1 : 0.4}
                metalness={0.7}
              />
            </mesh>

            {/* Glowing highlight ring on hover */}
            {isHovered && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5, 0.62, 24]} />
                <meshBasicMaterial color={fk.color} side={THREE.DoubleSide} transparent opacity={0.7} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

export const ResilienceCore3D: React.FC<ResilienceCore3DProps> = ({
  analysis,
  onSelectFactor
}) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string>('marketDemand');

  const activeFactor = FACTOR_KEYS.find(k => k.key === (hoveredKey || selectedKey)) || FACTOR_KEYS[0];
  const activeDetail = analysis.factors[activeFactor.key as keyof typeof analysis.factors];

  const handleNodeClick = (key: string) => {
    setSelectedKey(key);
    const detail = analysis.factors[key as keyof typeof analysis.factors];
    if (onSelectFactor) {
      onSelectFactor(key, detail);
    }
  };

  return (
    <div className="w-full h-full relative select-none rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
      <Canvas
        camera={{ position: [0, 0, 9.5], fov: 46 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[6, 8, 6]} intensity={1.4} />
        <pointLight position={[0, 0, -4]} intensity={0.5} color="#38bdf8" />

        <InnerPentagonCore
          analysis={analysis}
          hoveredKey={hoveredKey}
          onHover={setHoveredKey}
          onClick={handleNodeClick}
        />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxDistance={14}
          minDistance={5}
        />
      </Canvas>

      {/* Floating HUD Factor Inspector Overlay */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-sm pointer-events-none">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-750 backdrop-blur-md shadow-2xl space-y-2 pointer-events-auto">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              3D Resilience Core Dimension
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              Weight: {activeFactor.weight}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white" style={{ color: activeFactor.color }}>
              {activeFactor.name}
            </h4>
            <div className="text-right font-mono">
              <span className="text-lg font-black text-white">{activeDetail.score}</span>
              <span className="text-xs text-slate-400">/100</span>
              <span className="text-cyan-400 text-xs font-bold ml-1.5">(+{activeDetail.contribution} pts)</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-slate-800">
            {activeDetail.evidence}
          </p>
        </div>
      </div>

      {/* Bottom Interactive Factor Selector Strip */}
      <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        <div className="flex flex-wrap gap-1.5">
          {FACTOR_KEYS.map((fk) => {
            const isSelected = (hoveredKey || selectedKey) === fk.key;
            const score = analysis.factors[fk.key as keyof typeof analysis.factors]?.score ?? 0;
            return (
              <button
                key={fk.key}
                onMouseEnter={() => setHoveredKey(fk.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onClick={() => handleNodeClick(fk.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition ${
                  isSelected
                    ? 'bg-slate-900 text-white border border-slate-600 shadow-md ring-1 ring-cyan-500/50'
                    : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: fk.color }} />
                <span>{fk.name}:</span>
                <span className="font-bold text-white">{score}</span>
              </button>
            );
          })}
        </div>

        <div className="text-[10px] font-mono text-slate-500 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
          Overall Score: <strong className="text-cyan-400">{analysis.overallScore}/100</strong>
        </div>
      </div>
    </div>
  );
};
