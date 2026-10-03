import React, { useState } from 'react';
import { UserProfile } from '../../types/profile.ts';
import { TransitionRecommendation } from '../../types/transitions.ts';
import { LearningRoadmap } from '../../types/roadmap.ts';
import { GraphNode } from './CareerIntelligenceGraph3D.tsx';
import { Compass, Cpu, Layers, AlertCircle, GitFork, BookOpen, CheckCircle2 } from 'lucide-react';

interface CareerGraph2DFallbackProps {
  profile: UserProfile;
  recommendations: TransitionRecommendation[];
  roadmap: LearningRoadmap | null;
  selectedRoleTitle?: string | null;
  onSelectNode: (node: GraphNode) => void;
}

export const CareerGraph2DFallback: React.FC<CareerGraph2DFallbackProps> = ({
  profile,
  recommendations,
  roadmap,
  selectedRoleTitle,
  onSelectNode
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const activeRec = recommendations.find(
    r => selectedRoleTitle && r.targetRole.title.toLowerCase() === selectedRoleTitle.toLowerCase()
  ) || recommendations[0];

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNodeId(node.id);
    onSelectNode(node);
  };

  return (
    <div className="w-full h-full p-6 overflow-y-auto bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Career Intelligence Pathway Pipeline (2D High-Contrast Mode)
            </h3>
            <p className="text-xs text-slate-400">
              Interactive node topology mapping skills to target transitions and learning milestones.
            </p>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            2D Analytical Projection
          </span>
        </div>

        {/* 6 Stage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {/* Stage 1: Profile */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              1. Candidate
            </span>
            <div
              onClick={() => handleNodeClick({
                id: 'node-profile',
                label: profile.fullName || 'Candidate Profile',
                category: 'profile',
                position: [0, 0, 0],
                color: '#38bdf8',
                size: 1,
                data: profile
              })}
              className="p-3 rounded-lg bg-slate-950 border border-slate-750 hover:border-cyan-400 cursor-pointer transition"
            >
              <div className="text-xs font-bold text-white truncate">{profile.fullName || 'Candidate'}</div>
              <div className="text-[10px] text-slate-400 truncate">{profile.currentRole || 'Tech Talent'}</div>
              <div className="text-[10px] font-mono text-cyan-400 mt-1">{profile.yearsOfExperience ?? 0} yrs exp</div>
            </div>
          </div>

          {/* Stage 2: Current Skills */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              2. Skills ({profile.skills.length})
            </span>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {profile.skills.slice(0, 7).map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => handleNodeClick({
                    id: `skill-${s}`,
                    label: s,
                    category: 'current_skill',
                    position: [0, 0, 0],
                    color: '#22d3ee',
                    size: 0.5,
                    data: { name: s, type: 'Current Skill' }
                  })}
                  className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-200 hover:border-cyan-400 cursor-pointer transition truncate"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Stage 3: Transferable Core */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider block">
              3. Portability
            </span>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {activeRec?.alreadyHaveSkills.slice(0, 6).map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => handleNodeClick({
                    id: `trans-${s}`,
                    label: s,
                    category: 'transferable',
                    position: [0, 0, 0],
                    color: '#3b82f6',
                    size: 0.5,
                    data: { name: s, type: 'Transferable' }
                  })}
                  className="px-2 py-1 rounded bg-blue-950/40 border border-blue-800/60 text-[11px] text-blue-200 hover:border-blue-400 cursor-pointer transition truncate"
                >
                  ✓ {s}
                </div>
              ))}
            </div>
          </div>

          {/* Stage 4: Skill Gaps */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider block">
              4. Skill Gaps
            </span>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {activeRec?.needToDevelopSkills.slice(0, 6).map((gap, idx) => (
                <div
                  key={idx}
                  onClick={() => handleNodeClick({
                    id: `gap-${gap.skill}`,
                    label: gap.skill,
                    category: 'gap',
                    position: [0, 0, 0],
                    color: '#f43f5e',
                    size: 0.5,
                    data: gap
                  })}
                  className="px-2 py-1 rounded bg-rose-950/40 border border-rose-800/60 text-[11px] text-rose-200 hover:border-rose-400 cursor-pointer transition truncate flex items-center justify-between"
                >
                  <span className="truncate">{gap.skill}</span>
                  <span className="text-[9px] font-mono text-rose-400 shrink-0 ml-1">{gap.priority}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stage 5: Target Role */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider block">
              5. Target Roles
            </span>
            <div className="space-y-1.5">
              {recommendations.slice(0, 3).map((rec, idx) => (
                <div
                  key={rec.id}
                  onClick={() => handleNodeClick({
                    id: `role-${rec.targetRole.id}`,
                    label: rec.targetRole.title,
                    category: 'target_role',
                    position: [0, 0, 0],
                    color: '#a855f7',
                    size: 0.8,
                    data: rec
                  })}
                  className={`p-2 rounded-lg border text-xs cursor-pointer transition ${
                    rec.id === activeRec?.id
                      ? 'bg-purple-950/60 border-purple-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-purple-400'
                  }`}
                >
                  <div className="truncate">{rec.targetRole.title}</div>
                  <div className="text-[10px] font-mono text-cyan-400">{rec.fitScore}% Fit</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stage 6: Learning Path */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
              6. Learning Path
            </span>
            <div className="space-y-1.5">
              {roadmap?.milestones.map((m, idx) => (
                <div
                  key={m.id}
                  onClick={() => handleNodeClick({
                    id: `milestone-${m.id}`,
                    label: m.phaseTitle,
                    category: 'resource',
                    position: [0, 0, 0],
                    color: '#10b981',
                    size: 0.6,
                    data: m
                  })}
                  className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs hover:border-emerald-400 cursor-pointer transition"
                >
                  <div className="text-[10px] font-mono font-bold text-emerald-400">Phase {idx + 1}</div>
                  <div className="text-[11px] truncate">{m.targetSkills.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
        Active Candidate: <strong className="text-white">{profile.fullName || 'Unstated'}</strong> • Click any card to inspect full intelligence metadata.
      </div>
    </div>
  );
};
