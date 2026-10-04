import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Clock,
  Award,
  BookOpen,
  Plus,
  Trash2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Flame
} from 'lucide-react';
import { UserProgress, TrackedSkill } from '../types/progress.ts';
import { UserProfile } from '../types/profile.ts';
import { StorageService } from '../services/storageService.ts';
import { ProgressTrajectory3D } from '../components/three/ProgressTrajectory3D.tsx';

interface ProgressPageProps {
  profile: UserProfile | null;
  onNavigate: (route: string) => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ profile, onNavigate }) => {
  const userId = profile?.id || 'user-current';
  const [progress, setProgress] = useState<UserProgress>(() => StorageService.getProgress(userId));

  useEffect(() => {
    setProgress(StorageService.getProgress(userId));
  }, [userId]);

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('GenAI');

  const trackedSkillsList = Object.values(progress.trackedSkills);
  const completedSkills = trackedSkillsList.filter(s => s.status === 'completed');
  const inProgressSkills = trackedSkillsList.filter(s => s.status === 'in_progress');

  const handleStatusChange = (skillName: string, newStatus: 'not_started' | 'in_progress' | 'completed') => {
    setProgress(prev => {
      const existing = prev.trackedSkills[skillName];
      const updated: TrackedSkill = {
        name: skillName,
        category: existing?.category || 'General',
        status: newStatus,
        startedAt: newStatus === 'in_progress' && !existing?.startedAt ? new Date().toISOString() : existing?.startedAt,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
        hoursSpent: existing?.hoursSpent || 0
      };

      const updatedProgress: UserProgress = {
        ...prev,
        trackedSkills: {
          ...prev.trackedSkills,
          [skillName]: updated
        },
        lastActive: new Date().toISOString()
      };

      StorageService.saveProgress(updatedProgress);
      return updatedProgress;
    });
  };

  const handleAddTrackedSkill = () => {
    if (!newSkillName.trim()) return;
    const name = newSkillName.trim();
    handleStatusChange(name, 'in_progress');
    setNewSkillName('');
  };

  const handleLogHours = (skillName: string, deltaHours: number) => {
    setProgress(prev => {
      const existing = prev.trackedSkills[skillName];
      if (!existing) return prev;
      const updatedHours = Math.max(0, existing.hoursSpent + deltaHours);
      const updated: TrackedSkill = { ...existing, hoursSpent: updatedHours };

      const updatedProgress: UserProgress = {
        ...prev,
        totalHoursStudied: Math.max(0, prev.totalHoursStudied + deltaHours),
        trackedSkills: {
          ...prev.trackedSkills,
          [skillName]: updated
        }
      };

      StorageService.saveProgress(updatedProgress);
      return updatedProgress;
    });
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Longitudinal Learning Tracker
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Track Your Upskilling Progress
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Monitor your journey from skill deficits to verified competencies. Progress persistently updates your resilience analytics.
        </p>
      </div>

      {/* 3D Skill Velocity Arc Centerpiece */}
      <ProgressTrajectory3D progress={progress} />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Completed Skills</span>
          <div className="text-3xl font-bold font-mono text-emerald-400">
            {completedSkills.length}
          </div>
          <span className="text-[11px] text-slate-500">Mastered & validated</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Currently In Progress</span>
          <div className="text-3xl font-bold font-mono text-cyan-400">
            {inProgressSkills.length}
          </div>
          <span className="text-[11px] text-slate-500">Active learning focus</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Study Hours</span>
          <div className="text-3xl font-bold font-mono text-purple-400">
            {progress.totalHoursStudied} hrs
          </div>
          <span className="text-[11px] text-slate-500">Time logged</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Milestones Finished</span>
          <div className="text-3xl font-bold font-mono text-amber-400">
            {progress.completedMilestoneIds.length}
          </div>
          <span className="text-[11px] text-slate-500">Phases completed</span>
        </div>
      </div>

      {/* Add New Target Skill Form */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-3 shadow-xl">
        <input
          type="text"
          placeholder="Add a new skill to track (e.g. Vector Databases, LangChain, Kubernetes)..."
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddTrackedSkill(); }}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 w-full"
        />

        <select
          value={newSkillCategory}
          onChange={(e) => setNewSkillCategory(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
        >
          <option value="GenAI">GenAI</option>
          <option value="AI / ML">AI / ML</option>
          <option value="Cloud / DevOps">Cloud / DevOps</option>
          <option value="Backend">Backend</option>
          <option value="Database">Database</option>
        </select>

        <button
          onClick={handleAddTrackedSkill}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Track Skill
        </button>
      </div>

      {/* Tracked Skills Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Active Competency Acquisition Log</h3>
          <span className="text-xs text-slate-400 font-mono">{trackedSkillsList.length} Total Tracked</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Skill</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Hours Logged</th>
                <th className="py-3 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {trackedSkillsList.map((skill, idx) => (
                <tr key={idx} className="hover:bg-slate-850/50 transition">
                  <td className="py-3.5 px-4 font-bold text-white">{skill.name}</td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-950 border border-slate-800">
                      {skill.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={skill.status}
                      onChange={(e) => handleStatusChange(skill.name, e.target.value as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        skill.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : skill.status === 'in_progress'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    <div className="flex items-center gap-2">
                      <span>{skill.hoursSpent} hrs</span>
                      <button
                        onClick={() => handleLogHours(skill.name, 1)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-400 font-bold"
                        title="Add 1 study hour"
                      >
                        +1 hr
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {skill.status === 'completed' ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Active</span>
                    )}
                  </td>
                </tr>
              ))}
              {trackedSkillsList.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 italic">
                    No custom skills tracked yet. Use the field above to add skills, or start with your recommended roadmap.
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
