import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Layers,
  Info
} from 'lucide-react';
import { UserProfile } from '../types/profile.ts';
import { ResilienceAnalysis } from '../types/resilience.ts';
import { MarketSnapshot } from '../types/market.ts';
import { calculateResilienceScore } from '../services/resilienceEngine.ts';
import { SKILL_TAXONOMY } from '../data/taxonomy.ts';
import { ScenarioCapabilitySpace3D } from '../components/three/ScenarioCapabilitySpace3D.tsx';
import { ThreeErrorBoundary } from '../components/three/ThreeErrorBoundary.tsx';
import { isWebGLAvailable } from '../utils/webgl.ts';

interface SimulatorPageProps {
  profile: UserProfile | null;
  baseAnalysis: ResilienceAnalysis | null;
  marketSnapshot: MarketSnapshot | null;
  onNavigate: (route: string) => void;
}

export const SimulatorPage: React.FC<SimulatorPageProps> = ({
  profile,
  baseAnalysis,
  marketSnapshot,
  onNavigate
}) => {
  const [show3DSpace, setShow3DSpace] = useState(true);
  const webGLReady = isWebGLAvailable();
  if (!profile) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mx-auto">
          <Sliders className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Profile Required for Simulation</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Please confirm your career profile first to run what-if skill simulation experiments.
        </p>
        <button
          onClick={() => onNavigate('/profile')}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
        >
          Open Profile
        </button>
      </div>
    );
  }

  // State of simulated skills added
  const [simulatedSkills, setSimulatedSkills] = useState<string[]>([]);
  const [selectedFrontierSkill, setSelectedFrontierSkill] = useState<string>('');

  // Recompute deterministic resilience with the user's base skills + simulated skills
  const combinedSkills = Array.from(new Set([...profile.skills, ...simulatedSkills]));
  const simulatedAnalysis = calculateResilienceScore(combinedSkills, marketSnapshot, profile.id);

  const baseScore = baseAnalysis ? baseAnalysis.overallScore : calculateResilienceScore(profile.skills, marketSnapshot, profile.id).overallScore;
  const simulatedScore = simulatedAnalysis.overallScore;
  const scoreDelta = simulatedScore - baseScore;

  // Curated frontier skills available for quick simulation testing
  const recommendedAdditions = [
    'LLM APIs & Prompt Engineering',
    'Retrieval Augmented Generation (RAG)',
    'Vector Databases',
    'Agentic Workflows & Multi-Agent Systems',
    'Docker',
    'Kubernetes',
    'FastAPI',
    'Python',
    'MLOps',
    'Rust',
    'System Design',
    'Apache Kafka'
  ].filter(s => !profile.skills.some(userS => userS.toLowerCase() === s.toLowerCase()));

  const handleAddSimulated = (skill: string) => {
    if (!simulatedSkills.includes(skill)) {
      setSimulatedSkills([...simulatedSkills, skill]);
    }
  };

  const handleRemoveSimulated = (skill: string) => {
    setSimulatedSkills(simulatedSkills.filter(s => s !== skill));
  };

  const handleResetSimulation = () => {
    setSimulatedSkills([]);
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Interactive What-If Simulator
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
            Live Deterministic Re-execution
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Simulate Skill Acquisition ROI
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Toggle prospective skills to observe how the deterministic scoring engine recalculates your portfolio resilience before investing time in coursework.
        </p>
      </div>

      {/* Simulator Gauge & Comparison Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-xs text-slate-400 font-mono">Baseline Resilience</span>
              <div className="text-3xl font-black font-mono text-slate-300">{baseScore} / 100</div>
            </div>
            <ArrowRight className="w-5 h-5 text-cyan-400 mx-2" />
            <div>
              <span className="text-xs text-slate-400 font-mono">Projected Readiness</span>
              <div className="text-4xl font-black font-mono text-cyan-400">{simulatedScore} / 100</div>
            </div>
            {scoreDelta > 0 && (
              <span className="ml-3 px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse">
                +{scoreDelta} pts uplift
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
            <strong className="text-slate-300 font-semibold">Disclaimer: </strong>
            Projected readiness based on current model assumptions. Does not represent a guaranteed employment outcome.
          </p>
        </div>

        {simulatedSkills.length > 0 && (
          <button
            onClick={handleResetSimulation}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Simulation
          </button>
        )}
      </div>

      {/* 3D Capability Envelope Visualization */}
      {webGLReady && show3DSpace && (
        <section className="space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>3D Career Capability Envelope</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Outer envelope dynamically expands with simulated skill additions
            </span>
          </div>
          <ThreeErrorBoundary
            fallback={
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400">
                3D WebGL acceleration unavailable.
              </div>
            }
          >
            <ScenarioCapabilitySpace3D
              profile={profile}
              baseAnalysis={baseAnalysis}
              simulatedAnalysis={simulatedAnalysis}
              simulatedSkills={simulatedSkills}
              scoreDelta={scoreDelta}
            />
          </ThreeErrorBoundary>
        </section>
      )}

      {/* Interactive Skill Addition Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended frontier skills to test */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              High-Resilience Frontier Skills
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Click any skill below to add it to your hypothetical portfolio and re-run the engine:
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {recommendedAdditions.map((skill, idx) => {
              const isAdded = simulatedSkills.includes(skill);
              return (
                <button
                  key={idx}
                  onClick={() => isAdded ? handleRemoveSimulated(skill) : handleAddSimulated(skill)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isAdded
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-950 hover:bg-slate-850 text-slate-200 border border-slate-800'
                  }`}
                >
                  {isAdded ? '✓ Added' : '+ Add'} {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Currently Simulated Additions */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Active Simulation Portfolio ({simulatedSkills.length} Added)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Currently simulated experimental competencies:
            </p>
          </div>

          <div className="space-y-2">
            {simulatedSkills.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="font-semibold text-slate-200">{s}</span>
                </div>
                <button
                  onClick={() => handleRemoveSimulated(s)}
                  className="text-slate-500 hover:text-rose-400 transition"
                  title="Remove from simulation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {simulatedSkills.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No simulated skills added yet. Click any skill on the left to see instant score recalculation.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recalculated Factor Shift Inspection */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white">
          Recalculated Factor Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-slate-400 block text-[11px]">Market Demand (30%)</span>
            <span className="text-base font-bold font-mono text-white mt-1 block">
              {simulatedAnalysis.factors.marketDemand.score}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">
              +{simulatedAnalysis.factors.marketDemand.contribution} pts
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-slate-400 block text-[11px]">Transferability (25%)</span>
            <span className="text-base font-bold font-mono text-white mt-1 block">
              {simulatedAnalysis.factors.transferability.score}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">
              +{simulatedAnalysis.factors.transferability.contribution} pts
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-slate-400 block text-[11px]">AI Resilience (20%)</span>
            <span className="text-base font-bold font-mono text-white mt-1 block">
              {simulatedAnalysis.factors.aiExposure.score}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">
              +{simulatedAnalysis.factors.aiExposure.contribution} pts
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-slate-400 block text-[11px]">Skill Breadth (15%)</span>
            <span className="text-base font-bold font-mono text-white mt-1 block">
              {simulatedAnalysis.factors.skillBreadth.score}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">
              +{simulatedAnalysis.factors.skillBreadth.contribution} pts
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-slate-400 block text-[11px]">Emerging Alignment (10%)</span>
            <span className="text-base font-bold font-mono text-white mt-1 block">
              {simulatedAnalysis.factors.emergingAlignment.score}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">
              +{simulatedAnalysis.factors.emergingAlignment.contribution} pts
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
