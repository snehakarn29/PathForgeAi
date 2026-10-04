import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Play
} from 'lucide-react';
import { LearningRoadmap, RoadmapMilestone } from '../types/roadmap.ts';
import { StorageService } from '../services/storageService.ts';
import { RoadmapJourney3D } from '../components/three/RoadmapJourney3D.tsx';

interface RoadmapPageProps {
  roadmap: LearningRoadmap | null;
  onNavigate: (route: string) => void;
  onUpdateMilestoneStatus?: (milestoneId: string, status: 'not_started' | 'in_progress' | 'completed') => void;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({
  roadmap,
  onNavigate,
  onUpdateMilestoneStatus
}) => {
  if (!roadmap) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mx-auto">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Roadmap Generated</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Select a career transition path from the Career Paths page to generate your personalized 10-week learning roadmap.
        </p>
        <button
          onClick={() => onNavigate('/paths')}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
        >
          View Career Pathways
        </button>
      </div>
    );
  }

  const [milestones, setMilestones] = useState<RoadmapMilestone[]>(roadmap.milestones);

  React.useEffect(() => {
    if (roadmap) {
      setMilestones(roadmap.milestones);
    }
  }, [roadmap]);

  const toggleStatus = (mId: string) => {
    setMilestones(prev => {
      const updated: RoadmapMilestone[] = prev.map(m => {
        if (m.id === mId) {
          const nextStatus: 'not_started' | 'in_progress' | 'completed' = m.status === 'completed'
            ? 'not_started'
            : (m.status === 'in_progress' ? 'completed' : 'in_progress');
          return { ...m, status: nextStatus };
        }
        return m;
      });

      const updatedRoadmap = { ...roadmap, milestones: updated };
      StorageService.saveRoadmap(updatedRoadmap);

      // Sync progress
      const progress = StorageService.getProgress(roadmap.userId);
      const completedIds = updated.filter(m => m.status === 'completed').map(m => m.id);
      StorageService.saveProgress({ ...progress, completedMilestoneIds: completedIds, lastActive: new Date().toISOString() });

      return updated;
    });
  };

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const progressPercent = Math.round((completedCount / Math.max(1, milestones.length)) * 100);

  return (
    <div className="space-y-8 py-6">
      {/* Roadmap Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              Actionable Upskilling Plan
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
              {roadmap.totalDurationWeeks} Weeks
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Learning Roadmap for {roadmap.targetRoleTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Prioritizes verified, high-quality open educational resources from NPTEL, Swayam, Microsoft Learn, Google, and official technology documentation. Zero fake links.
          </p>
        </div>

        {/* Progress Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0 min-w-[220px] text-center space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Roadmap Completion</span>
            <span className="font-mono font-bold text-cyan-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {completedCount} of {milestones.length} Phases Finished
          </div>
        </div>
      </div>

      {/* 3D Ascending Roadmap Spatial Trajectory */}
      <RoadmapJourney3D
        roadmap={roadmap}
        milestones={milestones}
        onToggleStatus={toggleStatus}
      />

      {/* Phased Milestones List */}
      <div className="space-y-6">
        {milestones.map((m, idx) => {
          const isDone = m.status === 'completed';
          const isInProgress = m.status === 'in_progress';

          return (
            <div
              key={m.id}
              className={`p-6 rounded-2xl border transition-all shadow-xl ${
                isDone
                  ? 'bg-slate-900/60 border-emerald-900/40'
                  : isInProgress
                  ? 'bg-slate-900/90 border-cyan-800/60 ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              {/* Milestone Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs font-mono ${
                    isDone
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : isInProgress
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase">
                      Weeks {m.weekStart}–{m.weekEnd}
                    </span>
                    <h3 className="text-base font-bold text-white">{m.phaseTitle}</h3>
                  </div>
                </div>

                <button
                  onClick={() => toggleStatus(m.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isDone
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                      : isInProgress
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Completed
                    </>
                  ) : isInProgress ? (
                    <>
                      <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                      In Progress
                    </>
                  ) : (
                    'Mark In Progress'
                  )}
                </button>
              </div>

              {/* Target Skills & Objectives */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider block mb-1">
                      Focus Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.targetSkills.map((s, sIdx) => (
                        <span key={sIdx} className="px-2.5 py-1 rounded text-xs bg-slate-950 border border-slate-850 text-cyan-300 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider block mb-1">
                      Phase Objectives
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 leading-relaxed">
                      {m.objectives.map((obj, oIdx) => (
                        <li key={oIdx}>{obj}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Practical Portfolio Deliverable */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-850 text-xs space-y-1">
                    <span className="text-cyan-400 font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <Award className="w-3.5 h-3.5" />
                      Portfolio Project: {m.projectIdea.title}
                    </span>
                    <p className="text-slate-300 text-[11px]">{m.projectIdea.description}</p>
                    <p className="text-slate-400 text-[10px] font-mono">Deliverable: {m.projectIdea.deliverable}</p>
                  </div>
                </div>

                {/* Verified Learning Resources List */}
                <div className="space-y-3">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider block">
                    Verified Free Educational Resources
                  </span>
                  <div className="space-y-2.5">
                    {m.resources.map((res, rIdx) => (
                      <a
                        key={rIdx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-950 flex items-start justify-between gap-3 group transition"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                              {res.provider}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ~{res.durationHours} hrs • {res.difficulty}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition">
                            {res.title}
                          </h4>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 mt-1 transition" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
