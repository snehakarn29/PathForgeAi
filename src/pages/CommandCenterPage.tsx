import React, { useState, useEffect } from 'react';
import {
  Compass,
  Layers,
  Sparkles,
  Maximize2,
  RefreshCw,
  GitFork,
  BookOpen,
  ArrowRight,
  TrendingUp,
  X,
  Info,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Eye
} from 'lucide-react';
import { UserProfile } from '../types/profile.ts';
import { ResilienceAnalysis } from '../types/resilience.ts';
import { TransitionRecommendation } from '../types/transitions.ts';
import { LearningRoadmap } from '../types/roadmap.ts';
import { CareerIntelligenceGraph3D, GraphNode } from '../components/three/CareerIntelligenceGraph3D.tsx';
import { ResilienceCore3D } from '../components/three/ResilienceCore3D.tsx';
import { CareerGraph2DFallback } from '../components/three/CareerGraph2DFallback.tsx';
import { ThreeErrorBoundary } from '../components/three/ThreeErrorBoundary.tsx';
import { isWebGLAvailable } from '../utils/webgl.ts';
import { DataBadge } from '../components/DataBadge.tsx';

interface CommandCenterPageProps {
  profile: UserProfile | null;
  analysis: ResilienceAnalysis | null;
  recommendations: TransitionRecommendation[];
  roadmap: LearningRoadmap | null;
  activeMode: 'real' | 'demo';
  onNavigate: (route: string) => void;
}

export const CommandCenterPage: React.FC<CommandCenterPageProps> = ({
  profile,
  analysis,
  recommendations,
  roadmap,
  activeMode,
  onNavigate
}) => {
  const [selectedRoleTitle, setSelectedRoleTitle] = useState<string | null>(
    recommendations.length > 0 ? recommendations[0].targetRole.title : null
  );
  const [inspectedNode, setInspectedNode] = useState<GraphNode | null>(null);
  const [viewMode, setViewMode] = useState<'3d_graph' | '3d_resilience' | '2d_graph'>('3d_graph');
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);

  useEffect(() => {
    if (recommendations.length > 0 && (!selectedRoleTitle || !recommendations.some(r => r.targetRole.title === selectedRoleTitle))) {
      setSelectedRoleTitle(recommendations[0].targetRole.title);
    }
  }, [recommendations, selectedRoleTitle]);

  useEffect(() => {
    const supported = isWebGLAvailable();
    setWebGLSupported(supported);
    if (!supported) {
      setViewMode('2d_graph');
    }
  }, []);

  if (!profile || profile.skills.length === 0) {
    return (
      <div className="text-center py-20 space-y-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mx-auto">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Command Center Awaiting Telemetry</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The 3D Career Intelligence Command Center maps your verified career foundation against labor market vectors. Upload a resume or preview the Arjun Sharma demo to initialize the 3D topology.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('/onboarding')}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
          >
            Upload Resume
          </button>
        </div>
      </div>
    );
  }

  const activeRec = recommendations.find(
    r => selectedRoleTitle && r.targetRole.title.toLowerCase() === selectedRoleTitle.toLowerCase()
  ) || recommendations[0];

  return (
    <div className="space-y-6 py-6 h-full flex flex-col">
      {/* Top Header & Telemetry Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Spatial Intelligence Engine
            </span>
            <DataBadge status={activeMode === 'demo' ? 'demo' : 'live'} />
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              Low-Poly Optimized
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-cyan-400" />
            AI Career Intelligence Command Center
          </h1>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('3d_graph')}
              disabled={!webGLSupported}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === '3d_graph'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              3D Career Topology
            </button>

            <button
              onClick={() => setViewMode('3d_resilience')}
              disabled={!webGLSupported}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === '3d_resilience'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              3D Resilience Core
            </button>

            <button
              onClick={() => setViewMode('2d_graph')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === '2d_graph'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              2D Matrix Mode
            </button>
          </div>
        </div>
      </div>

      {/* Target Pathway Selector Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <GitFork className="w-4 h-4 text-cyan-400" /> Focus Target Pathway:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {recommendations.slice(0, 3).map((rec) => {
              const isSelected = selectedRoleTitle?.toLowerCase() === rec.targetRole.title.toLowerCase();
              return (
                <button
                  key={rec.id}
                  onClick={() => {
                    setSelectedRoleTitle(rec.targetRole.title);
                    setInspectedNode(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/80 shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {rec.targetRole.title} <span className="font-mono text-cyan-400 font-bold">({rec.fitScore}%)</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
          <span>Resilience: <strong className="text-emerald-400">{analysis ? `${analysis.overallScore}/100` : 'Pending'}</strong></span>
          <span>Skills: <strong className="text-cyan-400">{profile.skills.length}</strong></span>
        </div>
      </div>

      {/* Main 3D Canvas / Viewport Container */}
      <div className="relative w-full h-[620px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        <ThreeErrorBoundary
          fallback={
            <CareerGraph2DFallback
              profile={profile}
              recommendations={recommendations}
              roadmap={roadmap}
              selectedRoleTitle={selectedRoleTitle}
              onSelectNode={setInspectedNode}
            />
          }
        >
          {viewMode === '3d_graph' && (
            <CareerIntelligenceGraph3D
              profile={profile}
              recommendations={recommendations}
              roadmap={roadmap}
              selectedRoleTitle={selectedRoleTitle}
              onSelectNode={setInspectedNode}
            />
          )}

          {viewMode === '3d_resilience' && analysis && (
            <ResilienceCore3D
              analysis={analysis}
            />
          )}

          {viewMode === '2d_graph' && (
            <CareerGraph2DFallback
              profile={profile}
              recommendations={recommendations}
              roadmap={roadmap}
              selectedRoleTitle={selectedRoleTitle}
              onSelectNode={setInspectedNode}
            />
          )}
        </ThreeErrorBoundary>

        {/* Selected Node Intelligence Inspector Overlay */}
        {inspectedNode && (
          <div className="absolute top-4 right-4 max-w-sm w-full bg-slate-900/95 border border-slate-700/80 p-5 rounded-2xl shadow-2xl backdrop-blur-md space-y-3 animate-in fade-in slide-in-from-right-2 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span
                className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded"
                style={{ backgroundColor: `${inspectedNode.color}20`, color: inspectedNode.color }}
              >
                {inspectedNode.category.replace('_', ' ')}
              </span>
              <button
                onClick={() => setInspectedNode(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="text-base font-bold text-white">{inspectedNode.label}</h4>
            </div>

            {/* Target Role Node Breakdown */}
            {inspectedNode.category === 'target_role' && inspectedNode.data && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-2 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Fit Score</span>
                    <span className="text-cyan-400 font-bold text-base">{inspectedNode.data.fitScore}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Overlap</span>
                    <span className="text-emerald-400 font-bold text-base">{inspectedNode.data.skillOverlapPercentage}%</span>
                  </div>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">
                  {inspectedNode.data.rationale}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onNavigate('/paths')}
                    className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
                  >
                    View Transition Blueprint →
                  </button>
                </div>
              </div>
            )}

            {/* Skill Gap Node Breakdown */}
            {inspectedNode.category === 'gap' && inspectedNode.data && (
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Priority:</span>
                    <span className="text-rose-400 font-bold">{inspectedNode.data.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Effort:</span>
                    <span className="text-slate-200">~{inspectedNode.data.estimatedEffortWeeks} weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Market Relevance:</span>
                    <span className="text-cyan-400 font-bold">{inspectedNode.data.marketRelevance}/100</span>
                  </div>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {inspectedNode.data.whyNeeded}
                </p>
              </div>
            )}

            {/* Current or Transferable Skill Node */}
            {(inspectedNode.category === 'current_skill' || inspectedNode.category === 'transferable' || inspectedNode.category === 'emerging') && (
              <div className="space-y-2 text-xs">
                <p className="text-slate-300 leading-relaxed">
                  Validated competency extracted from candidate document and mapped to standardized cross-industry skill taxonomy.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Classification:</span>
                    <span className="text-cyan-400">{inspectedNode.category}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Learning Resource Node */}
            {inspectedNode.category === 'resource' && inspectedNode.data && (
              <div className="space-y-2 text-xs">
                <p className="text-slate-300 text-xs">
                  {inspectedNode.data.phaseTitle}
                </p>
                <button
                  onClick={() => onNavigate('/roadmap')}
                  className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                >
                  Open Full Roadmap Coursework →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
