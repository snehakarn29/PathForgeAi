import React, { useState } from 'react';
import {
  Compass,
  Upload,
  User,
  Cpu,
  TrendingUp,
  MapPin,
  GitFork,
  BookOpen,
  Sliders,
  CheckCircle,
  Activity,
  Settings,
  Sparkles,
  Menu,
  X,
  Play,
  Layers
} from 'lucide-react';
import { DataBadge } from './DataBadge.tsx';
import { StorageService } from '../services/storageService.ts';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  activeMode: 'real' | 'demo';
  onToggleMode: (mode: 'real' | 'demo') => void;
  onOpenPitchTour: () => void;
  userName?: string | null;
  marketStatus?: 'live' | 'cached' | 'demo' | 'not_configured';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  activeMode,
  onToggleMode,
  onOpenPitchTour,
  userName,
  marketStatus = 'cached'
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: '/', label: 'Overview', icon: <Compass className="w-4 h-4" /> },
    { id: '/command-center', label: '3D Command', icon: <Layers className="w-4 h-4 text-cyan-400" /> },
    { id: '/onboarding', label: 'Upload Resume', icon: <Upload className="w-4 h-4" /> },
    { id: '/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: '/skills', label: 'Skills Intel', icon: <Cpu className="w-4 h-4" /> },
    { id: '/resilience', label: 'Resilience Score', icon: <TrendingUp className="w-4 h-4" /> },
    { id: '/paths', label: 'Career Paths', icon: <GitFork className="w-4 h-4" /> },
    { id: '/gaps', label: 'Skill Gaps', icon: <MapPin className="w-4 h-4" /> },
    { id: '/roadmap', label: 'Roadmap', icon: <BookOpen className="w-4 h-4" /> },
    { id: '/simulator', label: 'What-If Sim', icon: <Sliders className="w-4 h-4" /> },
    { id: '/progress', label: 'Progress', icon: <CheckCircle className="w-4 h-4" /> },
    { id: '/evaluation', label: 'System Audit', icon: <Activity className="w-4 h-4" /> },
    { id: '/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const handleNav = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNav('/')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/30 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white font-mono">
                    PATHFORGE<span className="text-cyan-400">.AI</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  Predict. Adapt. Transition.
                </p>
              </div>
            </button>

            {/* Data Badge */}
            <div className="hidden lg:block ml-3">
              <DataBadge status={activeMode === 'demo' ? 'demo' : marketStatus} />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-medium text-slate-300">
            {navLinks.slice(0, 7).map(link => {
              const isActive = currentRoute === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800/50'
                      : 'hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs & Mode Switcher */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* 3D Command Center Button */}
            <button
              onClick={() => handleNav('/command-center')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition shadow-sm ${
                currentRoute === '/command-center' || currentRoute === '/command' || currentRoute === '/3d'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/80 shadow-cyan-900/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-750 hover:border-cyan-500/40'
              }`}
              title="Interactive 3D Career Intelligence Topology"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>3D Intel</span>
            </button>

            {/* Pitch Walkthrough Button */}
            <button
              onClick={onOpenPitchTour}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-750 transition shadow-sm"
              title="12-Step Hackathon Judge Presentation Tour"
            >
              <Play className="w-3.5 h-3.5 fill-cyan-400" />
              Pitch Tour
            </button>

            {/* Mode Switcher */}
            <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <button
                onClick={() => onToggleMode('real')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  activeMode === 'real'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Real User Mode
              </button>
              <button
                onClick={() => onToggleMode('demo')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition ${
                  activeMode === 'demo'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Loads Arjun Sharma Java Backend Developer Benchmark"
              >
                <Sparkles className="w-3 h-3" />
                Demo Mode
              </button>
            </div>

            {/* Profile Avatar / Indicator */}
            <button
              onClick={() => handleNav('/profile')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200 hover:border-slate-700 transition"
            >
              <div className="w-5 h-5 rounded-full bg-cyan-900 border border-cyan-500/40 flex items-center justify-center text-[10px] font-bold text-cyan-300">
                {activeMode === 'demo' ? 'AS' : (userName ? userName.slice(0, 2).toUpperCase() : 'NU')}
              </div>
              <span className="max-w-[90px] truncate font-medium">
                {activeMode === 'demo' ? 'Arjun S.' : (userName || 'New User')}
              </span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <DataBadge status={activeMode === 'demo' ? 'demo' : marketStatus} />
            <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <button
                onClick={() => onToggleMode('real')}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  activeMode === 'real' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Real
              </button>
              <button
                onClick={() => onToggleMode('demo')}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  activeMode === 'demo' ? 'bg-purple-600 text-white' : 'text-slate-400'
                }`}
              >
                Demo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {navLinks.map(link => {
              const isActive = currentRoute === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition ${
                    isActive
                      ? 'bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800/60'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                onOpenPitchTour();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 rounded-lg text-xs font-bold bg-slate-900 text-cyan-400 border border-slate-750 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-cyan-400" />
              Launch Guided Pitch Tour
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
