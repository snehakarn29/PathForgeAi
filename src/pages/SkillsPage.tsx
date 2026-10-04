import React, { useState } from 'react';
import {
  Cpu,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Info,
  ExternalLink,
  Layers,
  Database
} from 'lucide-react';
import { UserProfile } from '../types/profile.ts';
import { SKILL_TAXONOMY } from '../data/taxonomy.ts';
import { SkillCategory, NormalizedSkill } from '../types/skills.ts';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { SkillConstellation3D } from '../components/three/SkillConstellation3D.tsx';
import { ThreeErrorBoundary } from '../components/three/ThreeErrorBoundary.tsx';
import { isWebGLAvailable } from '../utils/webgl.ts';

interface SkillsPageProps {
  profile: UserProfile | null;
  onNavigate: (route: string) => void;
}

export const SkillsPage: React.FC<SkillsPageProps> = ({ profile, onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<NormalizedSkill | null>(SKILL_TAXONOMY[0]);
  const [viewMode, setViewMode] = useState<'3d_constellation' | 'chart'>('3d_constellation');
  const webGLReady = isWebGLAvailable();

  const userSkillNames = new Set(profile?.skills.map(s => s.toLowerCase()) || []);

  const categories: string[] = ['All', 'Programming', 'Backend', 'Frontend', 'Database', 'Cloud', 'DevOps', 'AI', 'ML', 'GenAI', 'Data', 'Cybersecurity', 'Architecture', 'Soft Skills'];

  const filteredSkills = SKILL_TAXONOMY.filter(s => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Prepare chart data: Average AI Exposure vs Demand by Category
  const categoryChartData = categories.filter(c => c !== 'All').map(cat => {
    const items = SKILL_TAXONOMY.filter(s => s.category === cat);
    if (items.length === 0) return null;
    const avgDemand = Math.round(items.reduce((acc, s) => acc + s.baselineDemandIndex, 0) / items.length);
    const avgExposure = Math.round(items.reduce((acc, s) => acc + s.aiExposureScore, 0) / items.length);
    return {
      category: cat,
      Demand: avgDemand,
      Exposure: avgExposure
    };
  }).filter(Boolean);

  return (
    <div className="space-y-8 py-6">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Taxonomy & Automation Matrix
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
              100+ Benchmark Tech Skills
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Skills Intelligence & AI Exposure
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Standardized skill taxonomy with cross-industry ESCO and O*NET references, transferability coefficients, and empirical automation exposure ratings.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs self-start sm:self-auto shrink-0">
          <button
            onClick={() => setViewMode('3d_constellation')}
            disabled={!webGLReady}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              viewMode === '3d_constellation'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3D Constellation</span>
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              viewMode === 'chart'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2D Distribution</span>
          </button>
        </div>
      </div>

      {/* 3D Spatial Constellation */}
      {viewMode === '3d_constellation' && webGLReady && (
        <section className="space-y-2 animate-in fade-in duration-300">
          <ThreeErrorBoundary
            fallback={
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400">
                3D WebGL acceleration unavailable. Please switch to 2D Distribution.
              </div>
            }
          >
            <SkillConstellation3D
              skills={filteredSkills}
              profile={profile}
              selectedCategory={selectedCategory}
              selectedSkill={selectedSkill}
              onSelectSkill={setSelectedSkill}
            />
          </ThreeErrorBoundary>
        </section>
      )}

      {/* Analytical Chart: Demand vs Exposure by Category */}
      {viewMode === 'chart' && (
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">Domain Demand vs. Automation Exposure Distribution</h3>
            <p className="text-xs text-slate-400">Comparing market baseline demand index with automation exposure level</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded bg-cyan-400" /> Market Demand Index
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded bg-rose-400" /> AI Exposure Rating
            </span>
          </div>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryChartData as any[]} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
              />
              <Bar dataKey="Demand" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Exposure" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search skills, aliases or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Categories scrollable pill selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg shrink-0 font-medium transition ${
                selectedCategory === cat
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/60'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid and Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Skill list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredSkills.map(skill => {
              const isSelected = selectedSkill?.id === skill.id;
              const hasSkill = userSkillNames.has(skill.name.toLowerCase());

              return (
                <div
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/40'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-750 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        {skill.category}
                      </span>
                      {hasSkill && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                          In Your Profile
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white">{skill.name}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {skill.exposureReason}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Demand: <strong className="text-cyan-400">{skill.baselineDemandIndex}</strong></span>
                    <span className="text-slate-400">Exposure: <strong className="text-rose-400">{skill.aiExposureScore}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Skill Detail Panel */}
        {selectedSkill && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 h-fit lg:sticky lg:top-24 shadow-2xl">
            <div className="space-y-1">
              <span className="text-xs font-mono text-cyan-400 uppercase font-semibold">
                {selectedSkill.category} Taxonomy Entity
              </span>
              <h3 className="text-xl font-bold text-white">{selectedSkill.name}</h3>
              {selectedSkill.aliases.length > 0 && (
                <p className="text-xs text-slate-400">
                  Aliases: {selectedSkill.aliases.join(', ')}
                </p>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Demand Index</span>
                <span className="text-cyan-400 font-bold text-lg">{selectedSkill.baselineDemandIndex}/100</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Transferability</span>
                <span className="text-emerald-400 font-bold text-lg">{selectedSkill.transferabilityScore}/100</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">AI Exposure</span>
                <span className="text-rose-400 font-bold text-lg">{selectedSkill.aiExposureScore}% ({selectedSkill.aiExposureLevel})</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Frontier Status</span>
                <span className="text-purple-400 font-bold text-sm block mt-1">
                  {selectedSkill.isEmerging ? 'Emerging Frontier' : 'Established Core'}
                </span>
              </div>
            </div>

            {/* Exposure Analytical Rationale */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-850 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Automation Exposure Rationale
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedSkill.exposureReason}
              </p>
            </div>

            {/* Evidence & Standardization Citations */}
            <div className="space-y-2 text-[11px] text-slate-400 border-t border-slate-800 pt-3">
              <div>
                <span className="text-slate-500 block">Evidence Source:</span>
                <span className="text-slate-300">{selectedSkill.evidenceSource}</span>
              </div>
              {selectedSkill.onetCode && (
                <div>
                  <span className="text-slate-500 block">O*NET Standard Code:</span>
                  <span className="font-mono text-cyan-400">{selectedSkill.onetCode}</span>
                </div>
              )}
              {selectedSkill.escoUri && (
                <div>
                  <span className="text-slate-500 block">ESCO European Taxonomy URI:</span>
                  <span className="font-mono text-slate-400 truncate block">{selectedSkill.escoUri}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
