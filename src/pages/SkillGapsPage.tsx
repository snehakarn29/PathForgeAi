import React, { useState } from 'react';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Filter,
  Search,
  BookOpen,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { TransitionRecommendation, SkillGapItem } from '../types/transitions.ts';
import { SkillGapBridge3D } from '../components/three/SkillGapBridge3D.tsx';
import { ThreeErrorBoundary } from '../components/three/ThreeErrorBoundary.tsx';
import { isWebGLAvailable } from '../utils/webgl.ts';

interface SkillGapsPageProps {
  recommendations: TransitionRecommendation[];
  onNavigate: (route: string) => void;
}

export const SkillGapsPage: React.FC<SkillGapsPageProps> = ({
  recommendations,
  onNavigate
}) => {
  const [selectedRoleIdx, setSelectedRoleIdx] = useState(0);
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'3d_bridge' | 'matrix'>('3d_bridge');
  const webGLReady = isWebGLAvailable();

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mx-auto">
          <MapPin className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Skill Gaps to Display</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Please confirm your career profile to calculate transition pathways and associated skill gaps.
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

  const safeIdx = selectedRoleIdx >= recommendations.length ? 0 : selectedRoleIdx;
  const currentRec = recommendations[safeIdx] || recommendations[0];

  const filteredGaps = currentRec.needToDevelopSkills.filter(gap => {
    const matchesPriority = priorityFilter === 'All' || gap.priority === priorityFilter;
    const matchesSearch = !searchQuery ||
      gap.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gap.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Diagnostic Gap Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Skill Gap Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Pinpoints exact deficits required to bridge your current background into target roles.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {recommendations.slice(0, 3).map((rec, idx) => (
            <button
              key={rec.id}
              onClick={() => setSelectedRoleIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedRoleIdx === idx
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {rec.targetRole.title}
            </button>
          ))}
        </div>
      </div>

      {/* Target Role Summary Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase font-semibold">Active Transition Target</span>
          <h3 className="text-lg font-bold text-white mt-0.5">{currentRec.targetRole.title}</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">{currentRec.targetRole.description}</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Direct Overlap</span>
            <span className="text-emerald-400 font-bold text-base">{currentRec.alreadyHaveSkills.length} Skills</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Identified Gaps</span>
            <span className="text-amber-400 font-bold text-base">{currentRec.needToDevelopSkills.length} Skills</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search missing skills or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Priority:
          </span>
          {(['All', 'High', 'Medium', 'Low'] as const).map(prio => (
            <button
              key={prio}
              onClick={() => setPriorityFilter(prio)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                priorityFilter === prio
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {prio}
            </button>
          ))}
        </div>
      </div>

      {/* Gaps Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Skill Deficit</th>
                <th className="py-3 px-4 font-semibold">Domain Category</th>
                <th className="py-3 px-4 font-semibold">Priority</th>
                <th className="py-3 px-4 font-semibold">Effort</th>
                <th className="py-3 px-4 font-semibold">Market Relevance</th>
                <th className="py-3 px-4 font-semibold">Automation Exposure</th>
                <th className="py-3 px-4 font-semibold">Strategic Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredGaps.map((gap, idx) => (
                <tr key={idx} className="hover:bg-slate-850/50 transition">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {gap.skill}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-950 border border-slate-800">
                      {gap.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      gap.priority === 'High'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                        : gap.priority === 'Medium'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {gap.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    ~{gap.estimatedEffortWeeks} weeks
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="text-cyan-400 font-bold">{gap.marketRelevance}</span>
                    <span className="text-slate-500 text-[10px]">/100</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      gap.aiExposureLevel === 'Low'
                        ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-800/40'
                        : gap.aiExposureLevel === 'Moderate'
                        ? 'text-amber-300 bg-amber-950/60 border border-amber-800/40'
                        : 'text-rose-300 bg-rose-950/60 border border-rose-800/40'
                    }`}>
                      {gap.aiExposureLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-xs leading-relaxed text-[11px]">
                    {gap.whyNeeded}
                  </td>
                </tr>
              ))}
              {filteredGaps.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 italic">
                    No skill gaps matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
