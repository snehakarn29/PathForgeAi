import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Calculator,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  AlertTriangle,
  Clock,
  Compass,
  Zap,
  Info,
  Box,
  LayoutGrid
} from 'lucide-react';
import { ResilienceAnalysis } from '../types/resilience.ts';
import { ScoreFactorCard } from '../components/ScoreFactorCard.tsx';
import { FormulaExplainerModal } from '../components/FormulaExplainerModal.tsx';
import { DataBadge } from '../components/DataBadge.tsx';
import { ResilienceCore3D } from '../components/three/ResilienceCore3D.tsx';
import { ThreeErrorBoundary } from '../components/three/ThreeErrorBoundary.tsx';
import { isWebGLAvailable } from '../utils/webgl.ts';

interface ResiliencePageProps {
  analysis: ResilienceAnalysis | null;
  onNavigate: (route: string) => void;
  activeMode: 'real' | 'demo';
}

export const ResiliencePage: React.FC<ResiliencePageProps> = ({
  analysis,
  onNavigate,
  activeMode
}) => {
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | '3d_core'>('cards');
  const webGLReady = isWebGLAvailable();

  if (!analysis) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mx-auto">
          <TrendingUp className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Resilience Analysis Generated</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Upload and confirm a career profile to calculate your deterministic Skill Resilience Score.
        </p>
        <button
          onClick={() => onNavigate('/onboarding')}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
        >
          Start with Your Resume
        </button>
      </div>
    );
  }

  const f = analysis.factors;

  // Visual gauge status
  let scoreBadgeColor = 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40';
  let ratingLabel = 'Resilient Portfolio';
  if (analysis.overallScore < 50) {
    scoreBadgeColor = 'text-rose-400 border-rose-500/50 bg-rose-950/40';
    ratingLabel = 'Vulnerable to Automation Drift';
  } else if (analysis.overallScore < 70) {
    scoreBadgeColor = 'text-amber-400 border-amber-500/50 bg-amber-950/40';
    ratingLabel = 'Moderate Career Resilience';
  }

  return (
    <div className="space-y-10 py-6">
      {/* Top Banner: Score Display & Provenance */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Predictive Resilience Assessment
              </span>
              <DataBadge
                status={activeMode === 'demo' ? 'demo' : analysis.provenance.cacheStatus}
                source={analysis.provenance.dataSource}
                sampleSize={analysis.provenance.sampleSize}
                timestamp={analysis.calculatedAt}
              />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Skill Resilience Score
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Synthesized deterministically across labor vacancy frequency, cross-domain portability, and empirical automation exposure. Zero generative hallucination or random scoring.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsExplainerOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 transition shadow-sm"
              >
                <Calculator className="w-4 h-4 text-cyan-400" />
                How this score was calculated
              </button>

              <button
                onClick={() => onNavigate('/paths')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-md hover:scale-105"
              >
                Explore 2–3 Transition Paths
                <ArrowRight className="w-4 h-4 font-bold" />
              </button>
            </div>
          </div>

          {/* Radial / Numerical Score Display */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/70 border border-slate-800 shrink-0 min-w-[240px] text-center shadow-inner">
            <div className={`text-6xl font-black font-mono tracking-tight ${scoreBadgeColor.split(' ')[0]}`}>
              {analysis.overallScore}
            </div>
            <span className="text-xs text-slate-400 font-mono mt-0.5">out of 100 max</span>

            <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold border ${scoreBadgeColor}`}>
              {ratingLabel}
            </div>

            <div className="mt-3 text-[11px] text-slate-400 font-mono">
              Calculated: {new Date(analysis.calculatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Data Provenance Details Strip */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Data Source</span>
            <span className="text-slate-200 font-medium truncate block">{analysis.provenance.dataSource}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Location Coverage</span>
            <span className="text-slate-200 font-medium truncate block">{analysis.provenance.locationQueried}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Evaluated Postings Sample</span>
            <span className="text-slate-200 font-mono font-medium">{analysis.provenance.sampleSize} postings</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Engine Version</span>
            <span className="text-cyan-400 font-mono">{analysis.provenance.algorithmVersion}</span>
          </div>
        </div>
      </section>

      {/* Factor Cards & 3D Core Breakdown */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Explainable Factor Contributions
            </h2>
            <p className="text-xs text-slate-400">
              Each factor is independently computed and weighted. Sum of contributions equals the overall score.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  viewMode === 'cards'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Cards
              </button>
              <button
                onClick={() => setViewMode('3d_core')}
                disabled={!webGLReady}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  viewMode === '3d_core'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                3D Core
              </button>
            </div>

            <button
              onClick={() => onNavigate('/command-center')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-950 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 transition shadow-sm"
              title="Open full interactive 3D topology"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full 3D Center</span>
            </button>
          </div>
        </div>

        {viewMode === '3d_core' ? (
          <div className="relative w-full h-[540px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
            <ThreeErrorBoundary
              fallback={
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center">
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">3D Viewport Acceleration Notice</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Switching to standard explainable factor card representation for optimal device compatibility.
                  </p>
                  <button
                    onClick={() => setViewMode('cards')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
                  >
                    View Factor Cards
                  </button>
                </div>
              }
            >
              <ResilienceCore3D analysis={analysis} />
            </ThreeErrorBoundary>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <ScoreFactorCard
              title="1. Market Demand"
              factor={f.marketDemand}
              icon={<Database className="w-4 h-4" />}
            />
            <ScoreFactorCard
              title="2. Transferability"
              factor={f.transferability}
              icon={<Compass className="w-4 h-4" />}
            />
            <ScoreFactorCard
              title="3. AI Exposure Resilience"
              factor={f.aiExposure}
              icon={<ShieldCheck className="w-4 h-4" />}
            />
            <ScoreFactorCard
              title="4. Skill Breadth"
              factor={f.skillBreadth}
              icon={<Layers className="w-4 h-4" />}
            />
            <ScoreFactorCard
              title="5. Emerging Alignment"
              factor={f.emergingAlignment}
              icon={<Sparkles className="w-4 h-4" />}
            />

            {/* Quick Transition CTA Card */}
            <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-800/40 rounded-xl p-5 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Strategic Recommendation</span>
                <h4 className="text-sm font-bold text-white mt-1">Ready for Career Transition?</h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  PathForge has evaluated your skills against 20 modern technology roles to generate optimal career pathways with high skill overlap.
                </p>
              </div>
              <button
                onClick={() => onNavigate('/paths')}
                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
              >
                View Transition Pathways
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Analytical Skill Quadrants */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Skill Portfolio Analytical Categorization
          </h2>
          <p className="text-xs text-slate-400">
            Skills segmented by market demand durability and automation exposure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Strong / Market-aligned */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-900/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Strong / Market-Aligned
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {analysis.insights.strongSkills.map((s, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded text-xs bg-slate-950 border border-slate-800 text-slate-200">
                  {s}
                </span>
              ))}
              {analysis.insights.strongSkills.length === 0 && (
                <span className="text-xs text-slate-500 italic">None currently flagged</span>
              )}
            </div>
          </div>

          {/* Stable / Transferable */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-blue-900/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Stable / Transferable
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {analysis.insights.transferableSkills.map((s, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded text-xs bg-slate-950 border border-slate-800 text-slate-200">
                  {s}
                </span>
              ))}
              {analysis.insights.transferableSkills.length === 0 && (
                <span className="text-xs text-slate-500 italic">None currently flagged</span>
              )}
            </div>
          </div>

          {/* At-risk / High exposure */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-rose-900/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              At-Risk / High Exposure
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {analysis.insights.atRiskSkills.map((s, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded text-xs bg-slate-950 border border-slate-800 text-slate-200">
                  {s}
                </span>
              ))}
              {analysis.insights.atRiskSkills.length === 0 && (
                <span className="text-xs text-slate-500 italic">None flagged as highly vulnerable</span>
              )}
            </div>
          </div>

          {/* Emerging / Opportunity */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-900/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Emerging / Opportunity
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {analysis.insights.emergingSkills.map((s, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded text-xs bg-slate-950 border border-slate-800 text-slate-200">
                  {s}
                </span>
              ))}
              {analysis.insights.emergingSkills.length === 0 && (
                <span className="text-xs text-slate-500 italic">No emerging skills declared yet</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Formula Explainer Modal */}
      <FormulaExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
        analysis={analysis}
      />
    </div>
  );
};
