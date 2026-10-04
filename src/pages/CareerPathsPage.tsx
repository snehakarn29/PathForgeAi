import React, { useState, useEffect } from 'react';
import {
  GitFork,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  DollarSign,
  ChevronRight,
  Layers,
  Compass,
  Cpu,
  ShieldCheck,
  Calculator
} from 'lucide-react';
import { TransitionRecommendation } from '../types/transitions.ts';
import { MLTransitionPrediction, MLTransitionFeatureInput } from '../types/ml.ts';
import { MLReadinessCard } from '../components/MLReadinessCard.tsx';
import { StorageService } from '../services/storageService.ts';
import { UserProfile } from '../types/profile.ts';
import { CareerTransitionGraph3D, TransitionNode3D } from '../components/three/CareerTransitionGraph3D.tsx';
import { ThreeErrorBoundary } from '../components/three/ThreeErrorBoundary.tsx';
import { isWebGLAvailable } from '../utils/webgl.ts';

interface CareerPathsPageProps {
  profile?: UserProfile | null;
  recommendations: TransitionRecommendation[];
  onSelectPath: (rec: TransitionRecommendation) => void;
  onGenerateRoadmap: (rec: TransitionRecommendation) => void;
  onNavigate: (route: string) => void;
}

export const CareerPathsPage: React.FC<CareerPathsPageProps> = ({
  profile,
  recommendations,
  onSelectPath,
  onGenerateRoadmap,
  onNavigate
}) => {
  const [selectedRecId, setSelectedRecId] = useState<string | null>(
    recommendations.length > 0 ? recommendations[0].id : null
  );

  const [mlPrediction, setMlPrediction] = useState<MLTransitionPrediction | null>(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'3d_topology' | 'cards'>('3d_topology');
  const webGLReady = isWebGLAvailable();

  useEffect(() => {
    if (recommendations.length > 0 && (!selectedRecId || !recommendations.some(r => r.id === selectedRecId))) {
      setSelectedRecId(recommendations[0].id);
    }
  }, [recommendations, selectedRecId]);

  // Top 3 primary recommendations
  const topPaths = recommendations.slice(0, 3);
  const selectedRec = recommendations.find(r => r.id === selectedRecId) || topPaths[0];

  useEffect(() => {
    let isMounted = true;
    async function fetchMLReadiness() {
      if (!selectedRec) return;

      const profile = StorageService.getActiveProfile();
      const analysis = StorageService.getActiveAnalysis();

      const expYears = profile?.yearsOfExperience ?? 3.0;
      const targetExpReq = selectedRec.targetRole.typicalYearsExperience ?? 3.0;
      const expGap = expYears - targetExpReq;

      const totalRequired = Math.max(1, selectedRec.existingSkillsCount + selectedRec.missingSkillsCount);
      const skillMatchScore = selectedRec.skillOverlapPercentage / 100;
      const skillGapScore = selectedRec.missingSkillsCount / totalRequired;

      const marketDemandScore = analysis ? analysis.factors.marketDemand.score / 100 : 0.75;
      const aiExposureScore = analysis ? analysis.factors.aiExposure.score / 100 : 0.35;
      const transferabilityScore = selectedRec.transferabilityScore / 100;
      const skillBreadthScore = analysis ? analysis.factors.skillBreadth.score / 100 : 0.65;
      const emergingAlignmentScore = analysis ? analysis.factors.emergingAlignment.score / 100 : 0.20;
      const transitionEffortScore = Math.min(1.0, selectedRec.gapEffortPenalty / 25);

      const payload: MLTransitionFeatureInput = {
        skill_match_score: skillMatchScore,
        market_demand_score: marketDemandScore,
        ai_exposure_score: aiExposureScore,
        transferability_score: transferabilityScore,
        skill_breadth_score: skillBreadthScore,
        emerging_skill_alignment: emergingAlignmentScore,
        skill_gap_score: skillGapScore,
        experience_years: expYears,
        target_role_experience_requirement: targetExpReq,
        experience_gap: expGap,
        number_of_matching_skills: selectedRec.alreadyHaveSkills.length,
        number_of_missing_skills: selectedRec.needToDevelopSkills.length,
        transition_effort_score: transitionEffortScore,
        target_role: selectedRec.targetRole.title
      };

      setMlLoading(true);
      try {
        const res = await fetch('/api/ml/predict-readiness', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setMlPrediction(data);
        } else {
          if (isMounted) setMlPrediction({ available: false, reason: 'ML service error' });
        }
      } catch (err: any) {
        if (isMounted) setMlPrediction({ available: false, reason: 'ML service offline' });
      } finally {
        if (isMounted) setMlLoading(false);
      }
    }

    fetchMLReadiness();
    return () => { isMounted = false; };
  }, [selectedRec?.id]);

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mx-auto">
          <GitFork className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Transition Paths Evaluated Yet</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Confirm your profile skills to dynamically calculate realistic transition trajectories.
        </p>
        <button
          onClick={() => onNavigate('/profile')}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
        >
          Go to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Transition Intelligence
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
              Evaluated 20 Target Roles
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Recommended Career Transition Paths
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Calculated using deterministic skill overlap, cross-domain transferability, and gap-effort optimization. Not arbitrary LLM guesses.
          </p>
        </div>

        {/* Mode Toggle & Command Center Link */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('3d_topology')}
              disabled={!webGLReady}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === '3d_topology'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3D Graph</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'cards'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>

          <button
            onClick={() => onNavigate('/command-center')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-750 transition shadow-sm shrink-0"
          >
            <span>Command Center &rarr;</span>
          </button>
        </div>
      </div>

      {/* 3D Spatial Transition Graph */}
      {viewMode === '3d_topology' && webGLReady && (
        <section className="space-y-2 animate-in fade-in duration-300">
          <ThreeErrorBoundary
            fallback={
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400">
                3D WebGL acceleration unavailable. Please switch to Card view.
              </div>
            }
          >
            <CareerTransitionGraph3D
              profile={profile || null}
              recommendations={recommendations}
              selectedRecId={selectedRecId}
              onSelectRec={(recId) => setSelectedRecId(recId)}
            />
          </ThreeErrorBoundary>
        </section>
      )}

      {/* Top 3 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topPaths.map((rec, idx) => {
          const isSelected = selectedRec.id === rec.id;
          return (
            <div
              key={rec.id}
              onClick={() => setSelectedRecId(rec.id)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative shadow-xl ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500/80 shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                    Rank #{idx + 1} Pathway
                  </span>
                  <div className="text-right">
                    <span className="text-xl font-black font-mono text-cyan-400">
                      {rec.fitScore}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/100 Fit</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{rec.targetRole.title}</h3>
                  <span className="text-xs text-slate-400">{rec.targetRole.category} • {rec.targetRole.growthTrend}</span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {rec.targetRole.description}
                </p>

                {/* Overlap & Delta metrics */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Skill Overlap</span>
                    <span className="font-bold font-mono text-emerald-400">{rec.skillOverlapPercentage}%</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Resilience Uplift</span>
                    <span className="font-bold font-mono text-cyan-400">+{rec.projectedResilienceDelta} pts</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400">
                <span>Inspect Skill Gaps</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Transition Deep Dive Details */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                Transition Blueprint
              </span>
              <span className="text-xs text-slate-400">• Est. {selectedRec.estimatedTransitionWeeks} Weeks Effort</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {selectedRec.targetRole.title}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {selectedRec.rationale}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onGenerateRoadmap(selectedRec);
                onNavigate('/roadmap');
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition hover:scale-105"
            >
              <BookOpen className="w-4 h-4" />
              Generate 10-Week Roadmap
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dual Intelligence Comparison: Deterministic Rule-Based vs Trained ML Prediction */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Deterministic PathForge Score */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Deterministic Fit Score
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">
                    Engine: PathForge Rule-Based Formula v1.4
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border bg-blue-950/80 text-blue-400 border-blue-800/80">
                Rule-Based Fit
              </span>
            </div>

            <div className="flex items-end justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                  Calculated Fit Index
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black font-mono tracking-tight text-blue-400">
                    {selectedRec.fitScore}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    / 100
                  </span>
                </div>
              </div>

              <div className="text-right text-[10px] font-mono text-slate-500">
                <span className="text-emerald-400 font-bold">+{selectedRec.projectedResilienceDelta} pts</span> uplift
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Skill Overlap</span>
                <span className="font-mono font-bold text-slate-200">{selectedRec.skillOverlapPercentage}%</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Transferability</span>
                <span className="font-mono font-bold text-slate-200">{selectedRec.transferabilityScore}/100</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Market Alignment</span>
                <span className="font-mono font-bold text-slate-200">{selectedRec.marketAlignmentScore}/100</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Gap Effort Penalty</span>
                <span className="font-mono font-bold text-amber-400">-{selectedRec.gapEffortPenalty} pts</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 text-[10px] text-slate-400 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span>
                Calculated strictly without AI guessing: evaluates explicit skill overlap, market frequency weights, and training effort penalty.
              </span>
            </div>
          </div>

          {/* Card 2: Real Machine Learning Prediction Layer */}
          <MLReadinessCard prediction={mlPrediction} loading={mlLoading} />
        </div>

        {/* Skill Gap Comparison: Already Have vs Need to Develop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Already Have */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-emerald-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Already Secured Competencies ({selectedRec.alreadyHaveSkills.length})
              </h4>
              <span className="text-[11px] font-mono text-emerald-400/80">Direct Overlap</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {selectedRec.alreadyHaveSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-950/40 border border-emerald-800/50 text-emerald-200"
                >
                  {s}
                </span>
              ))}
              {selectedRec.alreadyHaveSkills.length === 0 && (
                <p className="text-xs text-slate-500 italic">No exact core skill overlap detected.</p>
              )}
            </div>
          </div>

          {/* Need to Develop */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-amber-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Need to Develop ({selectedRec.needToDevelopSkills.length})
              </h4>
              <span className="text-[11px] font-mono text-amber-400/80">Targeted Upskilling</span>
            </div>

            <div className="space-y-2 pt-1">
              {selectedRec.needToDevelopSkills.map((gap, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200">{gap.skill}</span>
                    <span className="text-[11px] text-slate-400 ml-2">({gap.category})</span>
                    <div className="text-[11px] text-slate-400">{gap.whyNeeded}</div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      gap.priority === 'High'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {gap.priority} Prio
                    </span>
                    <div className="text-[11px] font-mono text-slate-400 mt-1">~{gap.estimatedEffortWeeks} wks</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
