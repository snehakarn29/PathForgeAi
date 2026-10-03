import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, CheckCircle2, Shield, TrendingUp, Cpu, Award } from 'lucide-react';

interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStep?: (route: string) => void;
}

const STEPS = [
  {
    step: 1,
    title: 'The Challenge: Career Blindspots in the AI Era',
    badge: '1. Problem Formulation',
    route: '/',
    description: 'Rapid advancements in generative AI and automated tooling are reshaping developer roles faster than curricula adapt. Professionals lack objective visibility into which parts of their skill portfolios are exposed to routine automation, and which are resilient.',
    takeaway: 'Traditional job boards list open vacancies, but never measure whether your personal skill portfolio will remain viable in 24 months.'
  },
  {
    step: 2,
    title: 'Arbitrary User Profile Ingestion',
    badge: '2. User Profile',
    route: '/onboarding',
    description: 'PathForge AI operates with arbitrary new users and arbitrary resumes (PDF, DOCX, TXT). The system ingests raw candidate documents without predefined mock assumptions.',
    takeaway: 'Real user mode is the default. Zero dependency on seeded names or fabricated backgrounds.'
  },
  {
    step: 3,
    title: 'High-Fidelity AI Resume Extraction',
    badge: '3. Skill Extraction',
    route: '/profile',
    description: 'Using server-side Gemini 3.8 Flash with strict JSON Schema constraints, PathForge extracts only information present in the text. Missing data is left null, preventing hallucinated credentials. Users review and verify every field.',
    takeaway: 'Extraction never invents experience or default titles. Users retain full editorial control before analysis.'
  },
  {
    step: 4,
    title: 'Normalized Skill Taxonomy & ESCO/O*NET Mapping',
    badge: '4. Skills Intelligence',
    route: '/skills',
    description: '100+ technology skills are normalized across aliases (e.g., "Python 3" → Python). Skills are benchmarked against ESCO and O*NET occupational taxonomies for standardized cross-industry mapping.',
    takeaway: 'Eliminates synonym fragmentation and maps raw text to standardized industry capabilities.'
  },
  {
    step: 5,
    title: 'Real Market Signals & Vacancy Aggregation',
    badge: '5. Market Intelligence',
    route: '/evaluation',
    description: 'Live market signals query real job boards (Adzuna API) with strict location awareness. If live data is unconfigured or unsupported for a region, PathForge clearly displays NOT CONFIGURED rather than faking numbers.',
    takeaway: 'Absolute data integrity: Real Data > Fake Data. Clear live vs cached vs demo badging.'
  },
  {
    step: 6,
    title: 'Empirical AI Exposure & Resilience Score',
    badge: '6. Resilience Engine',
    route: '/resilience',
    description: 'Resilience is computed deterministically: (30% Market Demand) + (25% Transferability) + (20% AI Exposure Inversion) + (15% Skill Breadth) + (10% Emerging Alignment). Gemini is prohibited from assigning the final number.',
    takeaway: '100% reproducible and explainable mathematics. Every contribution is visible down to the decimal point.'
  },
  {
    step: 7,
    title: 'Dynamic Career Transition Recommendation',
    badge: '7. Career Transitions',
    route: '/paths',
    description: 'PathForge compares the candidate\'s actual verified skills against 20 target tech roles, evaluating overlap, transferability, market alignment, and upskilling effort to recommend the top 2-3 realistic pathways.',
    takeaway: 'No black-box recommendations. Candidates see exactly why a transition fits their foundation.'
  },
  {
    step: 8,
    title: 'Surgical Skill Gap Analysis',
    badge: '8. Skill Gaps',
    route: '/gaps',
    description: 'For each pathway, PathForge isolates core competencies into "Already Have" versus "Need to Develop", categorizing gaps by priority, estimated effort in weeks, and automation exposure.',
    takeaway: 'Converts ambiguous career goals into concrete skill deficits requiring targeted study.'
  },
  {
    step: 9,
    title: 'Curated Milestone Learning Roadmap',
    badge: '9. Learning Roadmap',
    route: '/roadmap',
    description: 'Generates a phased 8-12 week learning roadmap with verified, authentic resources from NPTEL, Swayam, Microsoft Learn, Google, and official docs. Zero fabricated course URLs.',
    takeaway: 'Actionable upskilling with genuine free educational materials and portfolio project deliverables.'
  },
  {
    step: 10,
    title: 'What-If Simulation Engine',
    badge: '10. What-If Simulator',
    route: '/simulator',
    description: 'Allows users to test hypotheses: "What happens if I learn RAG and Vector Databases?" The deterministic engine recalculates live, showing projected readiness uplift before enrolling in courses.',
    takeaway: 'Empowers talent to forecast their career ROI before spending months studying.'
  },
  {
    step: 11,
    title: 'Progress Tracking & Longitudinal Growth',
    badge: '11. Progress Tracker',
    route: '/progress',
    description: 'Tracks skill acquisition status (Not Started, In Progress, Completed) and completed milestones, persistently updating dashboard metrics across browser sessions.',
    takeaway: 'Transforms predictive career analytics into sustained professional momentum.'
  },
  {
    step: 12,
    title: 'System Audit & Future ML Readiness',
    badge: '12. Audit & Future ML',
    route: '/evaluation',
    description: 'Built with production-grade telemetry for hackathon judges: cache hit rates, provider status, API calls, and clean interfaces (DemandForecastingProvider, SkillEmbeddingProvider) ready for future model weights.',
    takeaway: 'Transparent, honest engineering: Rule-based v1 with pluggable neural ranking architecture for v2.'
  },
  {
    step: 13,
    title: 'Spatial 3D Career Intelligence Command Center',
    badge: '13. 3D Spatial Intel',
    route: '/command-center',
    description: 'Interactive Three.js / React Three Fiber graph mapping user profile -> current skills -> transferable skills -> skill gaps -> target roles -> learning milestones in 3D space with low-poly optimization and real calculated data.',
    takeaway: 'Multi-dimensional career navigation: rotate, zoom, inspect nodes, and toggle between 3D Topology, 3D Resilience Core, and 2D Matrix mode.'
  }
];

export const WalkthroughModal: React.FC<WalkthroughModalProps> = ({
  isOpen,
  onClose,
  onSelectStep
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  if (!isOpen) return null;

  const current = STEPS[currentIdx];

  const handleNext = () => {
    if (currentIdx < STEPS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleGoToPage = () => {
    if (onSelectStep) {
      onSelectStep(current.route);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
            {current.badge}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {current.step} of {STEPS.length}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-100 mb-3 tracking-tight">
          {current.title}
        </h3>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 mb-4 text-sm text-slate-300 leading-relaxed">
          {current.description}
        </div>

        <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 mb-6 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <div className="text-xs text-cyan-200 font-medium leading-relaxed">
            <strong className="text-cyan-400 font-semibold">Key Hackathon Principle: </strong>
            {current.takeaway}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGoToPage}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-cyan-400 border border-slate-700 transition"
            >
              View Feature Screen
            </button>

            {currentIdx < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition font-bold"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition font-bold"
              >
                Finish Tour
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
