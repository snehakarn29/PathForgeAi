import React from 'react';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Cpu,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileText,
  Database,
  Sparkles,
  Layers,
  Zap
} from 'lucide-react';
import { UserProfile } from '../types/profile.ts';
import { ResilienceAnalysis } from '../types/resilience.ts';
import { DataBadge } from '../components/DataBadge.tsx';

interface LandingPageProps {
  onNavigate: (route: string) => void;
  activeProfile: UserProfile | null;
  activeAnalysis: ResilienceAnalysis | null;
  activeMode: 'real' | 'demo';
  onToggleMode: (mode: 'real' | 'demo') => void;
  onOpenPitchTour: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  activeProfile,
  activeAnalysis,
  activeMode,
  onToggleMode,
  onOpenPitchTour
}) => {
  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950 border border-slate-800 p-8 sm:p-12 lg:p-16 shadow-2xl">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>National AI Innovation Architecture • Real User Mode Default</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Predict. Adapt. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Transition.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            PathForge AI is an explainable career-resilience intelligence engine. It evaluates your actual resume against shifting job-market demand and empirical automation exposure to calculate an auditable <strong className="text-white font-semibold">Skill Resilience Score</strong> and surgical career transition paths.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('/onboarding')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileText className="w-4 h-4 text-slate-950 font-bold" />
              Analyze Your Resume
              <ArrowRight className="w-4 h-4 font-bold" />
            </button>

            <button
              onClick={() => onNavigate('/command-center')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-750 transition hover:border-cyan-500/50"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              3D Command Center
            </button>

            <button
              onClick={onOpenPitchTour}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 transition hover:border-slate-600"
            >
              <Play className="w-4 h-4 fill-cyan-400" />
              Guided Pitch Tour (13 Steps)
            </button>

            {activeMode !== 'demo' && (
              <button
                onClick={() => onToggleMode('demo')}
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl font-semibold text-sm bg-purple-950/70 hover:bg-purple-900/80 text-purple-300 border border-purple-800/60 transition"
              >
                <Sparkles className="w-4 h-4" />
                Preview Arjun Sharma Demo
              </button>
            )}
          </div>

          {/* Data Integrity Pillars */}
          <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">01 / Real User Mode</span>
              <p className="text-xs text-slate-200 font-medium">Arbitrary PDF/DOCX/TXT resume parsing</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">02 / Zero Fabrication</span>
              <p className="text-xs text-slate-200 font-medium">No random scores, no fake numbers</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">03 / Deterministic Math</span>
              <p className="text-xs text-slate-200 font-medium">Auditable 5-factor formula with exact weights</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">04 / Verified Roadmaps</span>
              <p className="text-xs text-slate-200 font-medium">Genuine NPTEL, Swayam & official docs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Session Status / Quick Resume Card */}
      {activeProfile && (
        <section className="bg-slate-900/80 border border-slate-850 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Profile</span>
                <DataBadge status={activeMode === 'demo' ? 'demo' : (activeProfile.extractionSource === 'fallback' ? 'fallback' : 'live')} />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {activeProfile.fullName || 'Anonymous Candidate'}
              </h3>
              <p className="text-xs text-slate-400">
                {activeProfile.currentRole || 'Targeting Technology Roles'} • {activeProfile.yearsOfExperience !== null ? `${activeProfile.yearsOfExperience} yrs exp` : 'Experience unstated'} • {activeProfile.location || 'Location unstated'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onNavigate('/profile')}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition"
              >
                Review / Edit Profile
              </button>
              <button
                onClick={() => onNavigate('/command-center')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-950 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 transition"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                3D Topology
              </button>
              <button
                onClick={() => onNavigate('/resilience')}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
              >
                View Resilience Score
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Extracted Skills</span>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                {activeProfile.skills.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Normalized to standard tech taxonomy
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Resilience Score</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {activeAnalysis ? `${activeAnalysis.overallScore}/100` : 'Pending'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {activeAnalysis ? 'Deterministic 5-factor calculation' : 'Click to run analysis'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Top Transition Targets</span>
              <div className="text-sm font-semibold text-slate-200 mt-1">
                GenAI App Dev, AI Engineer, MLOps
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Dynamically ranked by skill overlap & fit
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Product Workflow Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How PathForge AI Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A closed-loop, deterministic pipeline turning raw resume text into actionable career resilience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">1. Ingestion & Structured Extraction</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Upload PDF, DOCX, or TXT. Server-side Gemini 3.8 Flash extracts factual skills and experience using strict JSON Schema. No generic placeholders or invented credentials.
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800/60 text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2. Deterministic Resilience Scoring</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Calculates Market Demand (30%), Transferability (25%), Inverted AI Exposure (20%), Skill Breadth (15%), and Emerging Alignment (10%). Transparent math down to the exact decimal point.
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">3. Pathways, What-If & Roadmaps</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Evaluates 20 target roles. Pinpoints surgical skill gaps (Already Have vs Need to Develop). Simulates future readiness uplift and generates 8-12 week roadmaps with verified free courses.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/60 border border-cyan-800/40 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
        <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Ready to benchmark your career resilience?
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Upload any new resume to experience the real-data pipeline. No credit card, no sign-in barriers, no fabricated numbers.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('/onboarding')}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-900/20 transition-all hover:scale-105"
          >
            Start Fresh Analysis Now
          </button>
        </div>
      </section>
    </div>
  );
};
