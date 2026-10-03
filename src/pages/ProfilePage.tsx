import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  GraduationCap,
  Plus,
  Trash2,
  CheckCircle,
  Save,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  FolderGit2,
  Award,
  Layers,
  Wrench,
  Compass
} from 'lucide-react';
import { UserProfile, WorkExperienceItem, ProjectItem, CertificationItem, EducationItem } from '../types/profile.ts';
import { DataBadge } from '../components/DataBadge.tsx';
import { StorageService } from '../services/storageService.ts';

interface ProfilePageProps {
  profile: UserProfile | null;
  onProfileUpdated: (updated: UserProfile) => void;
  onConfirmAndAnalyze: () => void;
  onNavigate: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  onProfileUpdated,
  onConfirmAndAnalyze,
  onNavigate
}) => {
  if (!profile) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Profile Found</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Upload a resume or start a profile to begin the resilience analysis.
        </p>
        <button
          onClick={() => onNavigate('/onboarding')}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
        >
          Upload Resume Now
        </button>
      </div>
    );
  }

  const [formData, setFormData] = useState<UserProfile>(profile);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [activeTab, setActiveTab] = useState<'basics' | 'skills' | 'experience' | 'projects' | 'certifications'>('basics');
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleBasicChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    const clean = newSkillInput.trim();
    if (!formData.skills.includes(clean)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, clean],
        technicalSkills: [...(prev.technicalSkills || []), clean]
      }));
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove),
      technicalSkills: prev.technicalSkills?.filter(s => s !== skillToRemove) || []
    }));
  };

  const handleSaveProfile = () => {
    StorageService.saveRealProfile(formData);
    onProfileUpdated(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleConfirmAndRun = () => {
    StorageService.saveRealProfile(formData);
    onProfileUpdated(formData);
    onConfirmAndAnalyze();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Header & Source Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Career Profile Review</span>
            <DataBadge
              status={
                formData.extractionSource === 'fallback'
                  ? 'fallback'
                  : formData.extractionSource === 'demo'
                  ? 'demo'
                  : 'live'
              }
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Verify & Edit Your Profile
          </h1>
          <p className="text-xs text-slate-400">
            Review the extracted information below. Click any field to edit before executing analysis.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSaveProfile}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-750 transition"
          >
            {savedSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-cyan-400" />
                Save Changes
              </>
            )}
          </button>

          <button
            onClick={handleConfirmAndRun}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-900/30 transition-all hover:scale-105"
          >
            Confirm Profile & Analyze
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 text-xs font-medium text-slate-400 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('basics')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition ${
            activeTab === 'basics' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/60' : 'hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Basics & Contact
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition ${
            activeTab === 'skills' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/60' : 'hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Skills ({formData.skills.length})
        </button>
        <button
          onClick={() => setActiveTab('experience')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition ${
            activeTab === 'experience' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/60' : 'hover:text-white'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Work Experience ({formData.workExperience.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition ${
            activeTab === 'projects' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/60' : 'hover:text-white'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          Projects ({formData.projects.length})
        </button>
        <button
          onClick={() => setActiveTab('certifications')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition ${
            activeTab === 'certifications' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/60' : 'hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Certifications ({formData.certifications.length})
        </button>
      </div>

      {/* Tab 1: Basics & Contact */}
      {activeTab === 'basics' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            Profile Basics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName || ''}
                placeholder="e.g. Elena Rostova"
                onChange={(e) => handleBasicChange('fullName', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Role / Title</label>
              <input
                type="text"
                value={formData.currentRole || ''}
                placeholder="e.g. Java Backend Developer"
                onChange={(e) => handleBasicChange('currentRole', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email || ''}
                placeholder="candidate@example.com"
                onChange={(e) => handleBasicChange('email', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone || ''}
                placeholder="+1 555-0199 or +91 98765 43210"
                onChange={(e) => handleBasicChange('phone', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Years of Experience</label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.yearsOfExperience !== null ? formData.yearsOfExperience : ''}
                placeholder="e.g. 3"
                onChange={(e) => handleBasicChange('yearsOfExperience', e.target.value === '' ? null : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location (City, Country)</label>
              <input
                type="text"
                value={formData.location || ''}
                placeholder="e.g. Indore, India or Austin, TX"
                onChange={(e) => handleBasicChange('location', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Professional Summary / Objective</label>
            <textarea
              rows={3}
              value={formData.summary || ''}
              placeholder="Summary or objective extracted from resume..."
              onChange={(e) => handleBasicChange('summary', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {formData.previousRoles && formData.previousRoles.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Identified Previous Roles</label>
              <div className="flex flex-wrap gap-2">
                {formData.previousRoles.map((role, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg text-xs bg-slate-950 border border-slate-800 text-slate-200">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {formData.industries && formData.industries.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Domain / Industry Sectors</label>
              <div className="flex flex-wrap gap-2">
                {formData.industries.map((ind, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg text-xs bg-cyan-950/60 border border-cyan-800/50 text-cyan-300">
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Skills */}
      {activeTab === 'skills' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Declared Skills & Competencies
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add or remove skills. The resilience engine automatically normalizes these against standardized taxonomies.
            </p>
          </div>

          {/* Add skill input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddSkill(); }}
              placeholder="Type a skill (e.g. Python, Docker, Spring Boot, RAG)..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleAddSkill}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Skill
            </button>
          </div>

          {/* Skill chips */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-850">
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-750 text-slate-200 hover:border-cyan-500/50 transition group"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-500 group-hover:text-rose-400 hover:scale-110 transition"
                    title="Remove skill"
                  >
                    ×
                  </button>
                </span>
              ))}
              {formData.skills.length === 0 && (
                <p className="text-xs text-slate-500 italic">No skills listed yet. Add skills above.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Work Experience */}
      {activeTab === 'experience' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            Work History
          </h3>

          <div className="space-y-4">
            {formData.workExperience.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{exp.role}</h4>
                  <span className="text-xs font-mono text-cyan-400">{exp.duration}</span>
                </div>
                <div className="text-xs text-slate-400">
                  {exp.company} {exp.location && `• ${exp.location}`}
                </div>
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pt-1">
                    {exp.responsibilities.map((r, rIdx) => (
                      <li key={rIdx}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {formData.workExperience.length === 0 && (
              <p className="text-xs text-slate-500 italic">No work experience extracted from document.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Projects */}
      {activeTab === 'projects' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-cyan-400" />
            Key Projects
          </h3>

          <div className="space-y-4">
            {formData.projects.map((proj, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white">{proj.name}</h4>
                <p className="text-xs text-slate-300">{proj.description}</p>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.technologies.map((t, tIdx) => (
                      <span key={tIdx} className="px-2 py-0.5 rounded text-[11px] bg-slate-900 border border-slate-800 text-cyan-300">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {formData.projects.length === 0 && (
              <p className="text-xs text-slate-500 italic">No projects found in document.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Certifications */}
      {activeTab === 'certifications' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            Certifications & Credentials
          </h3>

          <div className="space-y-3">
            {formData.certifications.map((cert, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{cert.name}</h4>
                  <span className="text-[11px] text-slate-400">{cert.issuer}</span>
                </div>
                {cert.year && (
                  <span className="text-xs font-mono text-cyan-400">{cert.year}</span>
                )}
              </div>
            ))}
            {formData.certifications.length === 0 && (
              <p className="text-xs text-slate-500 italic">No formal certifications listed.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
