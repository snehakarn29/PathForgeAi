import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Volume2,
  VolumeX,
  Eye,
  Rotate3d,
  Layers,
  FileText,
  TrendingUp,
  Cpu,
  ChevronDown,
  Info,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  MapPin
} from 'lucide-react';
import { UserProfile } from '../../types/profile.ts';
import { ResilienceAnalysis } from '../../types/resilience.ts';
import { DataBadge } from '../DataBadge.tsx';

interface SpatialLandscapeJourneyProps {
  onNavigate: (route: string) => void;
  activeProfile: UserProfile | null;
  activeAnalysis: ResilienceAnalysis | null;
  activeMode: 'real' | 'demo';
  onToggleMode: (mode: 'real' | 'demo') => void;
  onOpenPitchTour: () => void;
  onSwitchToGrid?: () => void;
}

export const SpatialLandscapeJourney: React.FC<SpatialLandscapeJourneyProps> = ({
  onNavigate,
  activeProfile,
  activeAnalysis,
  activeMode,
  onToggleMode,
  onOpenPitchTour,
  onSwitchToGrid
}) => {
  // Container & Scroll tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1 across full journey
  const [activeChapter, setActiveChapter] = useState(0); // 0: Vista, 1: Tranquility, 2: Biodiversity, 3: Core Suite

  // Mouse Parallax coordinates (normalized -1 to 1) with smooth spring lerp
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseSmoothRef = useRef({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 3D Perspective Free-Look mode (drag to orbit scene)
  const [is3DMode, setIs3DMode] = useState(false);
  const [freeLookAngle, setFreeLookAngle] = useState({ rotX: 0, rotY: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Procedural Web Audio Ambient Soundscape
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Interactive Hotspot popup state
  const [activeHotspot, setActiveHotspot] = useState<{
    id: string;
    title: string;
    category: string;
    description: string;
    metric: string;
    actionLabel: string;
    route: string;
  } | null>(null);

  // Smooth lerp loop for mouse parallax
  useEffect(() => {
    let animFrame: number;
    const updateParallax = () => {
      mouseSmoothRef.current.x += (mouseTargetRef.current.x - mouseSmoothRef.current.x) * 0.08;
      mouseSmoothRef.current.y += (mouseTargetRef.current.y - mouseSmoothRef.current.y) * 0.08;
      setMousePos({ x: mouseSmoothRef.current.x, y: mouseSmoothRef.current.y });
      animFrame = requestAnimationFrame(updateParallax);
    };
    animFrame = requestAnimationFrame(updateParallax);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  // Track window/container scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalScrollable > 0 ? Math.min(1, Math.max(0, scrollY / totalScrollable)) : 0;
      setScrollProgress(progress);

      if (progress < 0.28) {
        setActiveChapter(0);
      } else if (progress < 0.58) {
        setActiveChapter(1);
      } else if (progress < 0.82) {
        setActiveChapter(2);
      } else {
        setActiveChapter(3);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent) => {
    if (is3DMode && isDraggingRef.current) {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      setFreeLookAngle(prev => ({
        rotY: Math.max(-25, Math.min(25, prev.rotY + deltaX * 0.15)),
        rotX: Math.max(-15, Math.min(15, prev.rotX - deltaY * 0.15))
      }));
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    const normY = (e.clientY / window.innerHeight) * 2 - 1;
    mouseTargetRef.current = { x: normX, y: normY };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (is3DMode) {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Chapter scroll targets
  const scrollToChapter = (chapterIndex: number) => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targets = [0, totalHeight * 0.35, totalHeight * 0.65, totalHeight * 0.95];
    window.scrollTo({
      top: targets[chapterIndex],
      behavior: 'smooth'
    });
  };

  // Procedural Web Audio Generator (Breeze + Stream Water)
  const toggleAmbientAudio = () => {
    if (isAudioPlaying) {
      if (gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.5);
        setTimeout(() => {
          audioContextRef.current?.close();
          audioContextRef.current = null;
        }, 500);
      }
      setIsAudioPlaying(false);
      return;
    }

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
      masterGain.gain.setTargetAtTime(0.2, ctx.currentTime, 1.5);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // 1. Wind synthesis: Pink noise with resonant bandpass filter
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(320, ctx.currentTime);
      windFilter.Q.setValueAtTime(2.5, ctx.currentTime);

      // Low frequency oscillator for gentle wind gusts
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(180, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(windFilter.frequency);
      lfo.start();

      whiteNoise.connect(windFilter);
      windFilter.connect(masterGain);
      whiteNoise.start();

      // 2. Harmonic Zen chime / stream resonance (528Hz peaceful tone)
      const chimeOsc = ctx.createOscillator();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(528, ctx.currentTime);
      const chimeGain = ctx.createGain();
      chimeGain.gain.setValueAtTime(0.015, ctx.currentTime);
      chimeOsc.connect(chimeGain);
      chimeGain.connect(masterGain);
      chimeOsc.start();

      setIsAudioPlaying(true);
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
    }
  };

  // Tools dropdown state
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);

  // Parallax offsets calculation
  const pX = mousePos.x;
  const pY = mousePos.y;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={`relative w-full min-h-[360vh] bg-[#070913] text-slate-100 overflow-x-hidden selection:bg-rose-500 selection:text-white ${
        is3DMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
      style={{
        perspective: is3DMode ? '1200px' : 'none'
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* FLOATING TOP APP BAR (Mirrors the clean "Notosan" navigation) */}
      {/* ------------------------------------------------------------- */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 py-5 flex items-center justify-between pointer-events-auto transition-all">
        {/* Left Branding */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => scrollToChapter(0)}
            className="flex items-center gap-3 group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-500 to-cyan-400 p-[1.5px] shadow-lg shadow-rose-950/40 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-amber-300" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-base tracking-widest text-white font-cinzel">
                PATHFORGE<span className="text-amber-400">.AI</span>
              </span>
              <p className="text-[10px] text-slate-300 tracking-wider font-mono uppercase">
                Predictive Workforce Intelligence
              </p>
            </div>
          </button>

          <div className="hidden md:block">
            <DataBadge
              status={activeMode === 'demo' ? 'demo' : 'live'}
              label={activeMode === 'demo' ? 'BENCHMARK ARCHETYPE' : 'REAL MARKET INTEL'}
            />
          </div>
        </div>

        {/* Center Editorial Links */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-medium tracking-wider uppercase text-slate-300">
          <button
            onClick={() => scrollToChapter(0)}
            className={`transition-colors hover:text-white font-jakarta ${
              activeChapter === 0 ? 'text-amber-300 font-bold border-b border-amber-400 pb-0.5' : ''
            }`}
          >
            01. Vista Horizon
          </button>
          <button
            onClick={() => scrollToChapter(1)}
            className={`transition-colors hover:text-white font-jakarta ${
              activeChapter === 1 ? 'text-amber-300 font-bold border-b border-amber-400 pb-0.5' : ''
            }`}
          >
            02. Flow & Resilience
          </button>
          <button
            onClick={() => scrollToChapter(2)}
            className={`transition-colors hover:text-white font-jakarta ${
              activeChapter === 2 ? 'text-amber-300 font-bold border-b border-amber-400 pb-0.5' : ''
            }`}
          >
            03. Career Sanctuary
          </button>
          <button
            onClick={() => scrollToChapter(3)}
            className={`transition-colors hover:text-white font-jakarta ${
              activeChapter === 3 ? 'text-amber-300 font-bold border-b border-amber-400 pb-0.5' : ''
            }`}
          >
            04. Intelligence Suite
          </button>
        </nav>

        {/* Right Utility Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Ambient Audio Toggle */}
          <button
            onClick={toggleAmbientAudio}
            title={isAudioPlaying ? 'Mute Mountain Wind & Stream Sound' : 'Enable Ambient Nature Soundscape'}
            className={`p-2.5 rounded-full border transition-all ${
              isAudioPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-950/40'
                : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-white hover:border-slate-500'
            }`}
          >
            {isAudioPlaying ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* 3D Perspective Free-Look Toggle */}
          <button
            onClick={() => {
              setIs3DMode(!is3DMode);
              if (is3DMode) setFreeLookAngle({ rotX: 0, rotY: 0 });
            }}
            title="Toggle 3D Orbit / Perspective Tilt Mode (Drag with mouse)"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all ${
              is3DMode
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-950/40'
                : 'bg-slate-900/60 text-slate-300 border-slate-700/60 hover:text-white hover:border-slate-500'
            }`}
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{is3DMode ? '3D Orbit Active' : '3D Mode'}</span>
          </button>

          {/* All Tools Navigation Dropdown */}
          <div className="relative">
            <button
              onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-slate-900/70 text-slate-200 border border-slate-700/60 hover:text-white hover:border-slate-500 transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tools ▾</span>
            </button>

            {toolsMenuOpen && (
              <div className="absolute right-0 top-11 w-64 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl p-2.5 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1">
                  PathForge AI Suite
                </div>
                {[
                  { id: '/command-center', label: '3D Command Center', icon: <Rotate3d className="w-3.5 h-3.5 text-cyan-400" /> },
                  { id: '/onboarding', label: 'Upload & Parse Resume', icon: <FileText className="w-3.5 h-3.5 text-amber-400" /> },
                  { id: '/profile', label: 'Profile Editor & Verification', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
                  { id: '/skills', label: 'Skills Intelligence', icon: <Cpu className="w-3.5 h-3.5 text-blue-400" /> },
                  { id: '/resilience', label: '5-Factor Resilience Score', icon: <TrendingUp className="w-3.5 h-3.5 text-rose-400" /> },
                  { id: '/paths', label: 'Career Transition Paths', icon: <Compass className="w-3.5 h-3.5 text-purple-400" /> },
                  { id: '/gaps', label: 'Skill Gap Breakdown', icon: <MapPin className="w-3.5 h-3.5 text-orange-400" /> },
                  { id: '/simulator', label: 'What-If Scenario Simulator', icon: <Zap className="w-3.5 h-3.5 text-yellow-400" /> },
                  { id: '/evaluation', label: 'System Audit & Telemetry', icon: <Info className="w-3.5 h-3.5 text-teal-400" /> }
                ].map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setToolsMenuOpen(false);
                      onNavigate(tool.id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                  >
                    {tool.icon}
                    <span>{tool.label}</span>
                  </button>
                ))}
                <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between px-2">
                  <button
                    onClick={() => {
                      setToolsMenuOpen(false);
                      onOpenPitchTour();
                    }}
                    className="text-[11px] text-amber-300 hover:text-white transition-colors"
                  >
                    Pitch Tour (13 Steps)
                  </button>
                  <button
                    onClick={() => {
                      setToolsMenuOpen(false);
                      onToggleMode(activeMode === 'demo' ? 'real' : 'demo');
                    }}
                    className="text-[11px] text-purple-300 hover:text-white transition-colors"
                  >
                    {activeMode === 'demo' ? 'Exit Demo' : 'Arjun Demo'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary CTA (Start Journey / Analyze) */}
          <button
            onClick={() => onNavigate('/onboarding')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 hover:from-amber-300 hover:to-purple-500 text-slate-950 shadow-lg shadow-rose-950/30 transition-all hover:scale-105 active:scale-95"
          >
            <FileText className="w-3.5 h-3.5 text-slate-950" />
            <span>Analyze Resume</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* CHAPTER PROGRESS INDICATOR (Floating right rail) */}
      {/* ------------------------------------------------------------- */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-4">
        {[
          { label: 'Vista', desc: 'Career Horizon' },
          { label: 'Flow', desc: 'Resilience Rapids' },
          { label: 'Sanctuary', desc: 'Transition Ecosystem' },
          { label: 'Engine', desc: 'Predictive Hub' }
        ].map((chap, idx) => (
          <button
            key={idx}
            onClick={() => scrollToChapter(idx)}
            className="group flex items-center gap-3 relative focus:outline-none"
          >
            <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] font-mono uppercase tracking-widest text-amber-300 bg-slate-950/90 px-2 py-0.5 rounded border border-slate-800">
              {chap.label} · {chap.desc}
            </span>
            <div
              className={`w-2.5 rounded-full transition-all duration-300 ${
                activeChapter === idx
                  ? 'h-8 bg-amber-400 shadow-lg shadow-amber-400/50'
                  : 'h-2.5 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SPATIAL PARALLAX SCENIC CONTAINER (Full-bleed 3D viewport) */}
      {/* ------------------------------------------------------------- */}
      <div
        className="relative w-full transition-transform duration-100 ease-out"
        style={{
          transform: is3DMode
            ? `rotateX(${freeLookAngle.rotX}deg) rotateY(${freeLookAngle.rotY}deg) scale(0.95)`
            : 'none',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* =========================================================== */}
        {/* CHAPTER 01: THE SUMMIT & MOUNTAIN VISTA (Hero Section)      */}
        {/* =========================================================== */}
        <section className="relative w-full h-[115vh] overflow-hidden">
          {/* Layer 1: Sky & Atmosphere (Deep sunrise gradient) */}
          <div
            className="absolute inset-0 transition-transform duration-200 ease-out"
            style={{
              background: 'linear-gradient(180deg, #181124 0%, #3a1c3d 25%, #7a2d48 55%, #bd4b4b 80%, #f69460 100%)',
              transform: `translate3d(${pX * -10}px, ${pY * -10}px, 0)`
            }}
          >
            {/* Radiant Sun Disc */}
            <div
              className="absolute top-[22%] right-[28%] w-56 h-56 rounded-full bg-gradient-to-tr from-amber-300 via-rose-300 to-yellow-100 blur-[2px] opacity-90 shadow-[0_0_120px_rgba(251,191,36,0.85)] transition-transform duration-300 ease-out"
              style={{
                transform: `translate3d(${pX * -15}px, ${pY * -15}px, 0)`
              }}
            />

            {/* Drifting Clouds & Sunrise Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(254,243,199,0.35)_0%,transparent_60%)]" />
          </div>

          {/* Layer 2: Flying Flocks of Cranes (Tsuru) */}
          <div
            className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(${pX * -35}px, ${pY * -25}px, 0)`
            }}
          >
            <svg
              className="w-full h-full"
              viewBox="0 0 1440 900"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Soaring Crane 1 */}
              <g className="animate-pulse" style={{ animationDuration: '4s' }}>
                <path
                  d="M 520 220 Q 535 210 550 218 Q 545 228 535 230 Q 525 228 520 220 Z"
                  fill="#ffffff"
                />
                <path d="M 535 212 L 545 195 L 538 215 Z" fill="#ffffff" />
                <path d="M 536 215 L 542 195 L 545 198 Z" fill="#1e1b4b" />
                <path d="M 532 225 L 538 245 L 535 226 Z" fill="#ffffff" />
                <circle cx="552" cy="217" r="1.5" fill="#e11d48" />
              </g>

              {/* Soaring Crane 2 */}
              <g style={{ transform: 'translate(45px, -15px) scale(0.85)' }}>
                <path
                  d="M 520 220 Q 535 210 550 218 Q 545 228 535 230 Q 525 228 520 220 Z"
                  fill="#ffffff"
                />
                <path d="M 535 212 L 545 195 L 538 215 Z" fill="#ffffff" />
                <path d="M 536 215 L 542 195 L 545 198 Z" fill="#1e1b4b" />
                <path d="M 532 225 L 538 245 L 535 226 Z" fill="#ffffff" />
              </g>

              {/* Soaring Crane 3 */}
              <g style={{ transform: 'translate(95px, -28px) scale(0.7)' }}>
                <path
                  d="M 520 220 Q 535 210 550 218 Q 545 228 535 230 Q 525 228 520 220 Z"
                  fill="#ffffff"
                />
                <path d="M 535 212 L 545 195 L 538 215 Z" fill="#ffffff" />
                <path d="M 536 215 L 542 195 L 545 198 Z" fill="#1e1b4b" />
              </g>

              {/* Soaring Crane 4 & 5 */}
              <g style={{ transform: 'translate(145px, -38px) scale(0.6)' }}>
                <path
                  d="M 520 220 Q 535 210 550 218 Q 545 228 535 230 Q 525 228 520 220 Z"
                  fill="#ffffff"
                />
                <path d="M 535 212 L 545 195 L 538 215 Z" fill="#ffffff" />
              </g>
              <g style={{ transform: 'translate(185px, -45px) scale(0.5)' }}>
                <path
                  d="M 520 220 Q 535 210 550 218 Q 545 228 535 230 Q 525 228 520 220 Z"
                  fill="#ffffff"
                />
              </g>
            </svg>
          </div>

          {/* Layer 3: Distant Mountain Peaks (Mount Fuji / Hida Sacred Range) */}
          <div
            className="absolute inset-0 pointer-events-none transition-transform duration-200 ease-out"
            style={{
              transform: `translate3d(${pX * -20}px, ${pY * -15}px, 0)`
            }}
          >
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 1440 900"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Lit mountain facet gradient */}
                <linearGradient id="peakLit" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffeedb" />
                  <stop offset="35%" stopColor="#fca369" />
                  <stop offset="85%" stopColor="#d95d43" />
                  <stop offset="100%" stopColor="#8d2b45" />
                </linearGradient>

                {/* Shadow mountain facet gradient */}
                <linearGradient id="peakShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#85507a" />
                  <stop offset="50%" stopColor="#4a254d" />
                  <stop offset="100%" stopColor="#25132d" />
                </linearGradient>

                {/* Snow cap highlight */}
                <linearGradient id="snowGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="70%" stopColor="#ffeedb" />
                  <stop offset="100%" stopColor="#fbcfe8" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Background Ridge Left */}
              <polygon
                points="120,550 380,310 580,550"
                fill="url(#peakShadow)"
                opacity="0.65"
              />

              {/* Primary Sacred Peak — Sunlit Face (Left) */}
              <polygon
                points="1020,180 840,480 1060,520 1200,450"
                fill="url(#peakLit)"
              />

              {/* Primary Sacred Peak — Shadow Face (Right) */}
              <polygon
                points="1020,180 1200,450 1440,540 1060,520"
                fill="url(#peakShadow)"
              />

              {/* Snowcap Crown on Peak */}
              <polygon
                points="1020,180 960,250 990,260 1020,245 1060,265 1100,240 1020,180"
                fill="url(#snowGlow)"
              />

              {/* Secondary Supporting Ridge */}
              <polygon
                points="680,340 920,530 600,530"
                fill="url(#peakLit)"
                opacity="0.8"
              />
            </svg>
          </div>

          {/* Interactive Summit Hotspot Beacon */}
          <div
            onClick={() =>
              setActiveHotspot({
                id: 'summit-demand',
                title: 'Market Demand Altitude',
                category: 'Adzuna Signal Ingestion',
                description:
                  'The peak represents real-world hiring velocity. PathForge synchronizes live salary bands and job openings to ground your career navigation in empirical economic truth.',
                metric: '30% Formula Weight · Real Job Openings',
                actionLabel: 'Inspect Market Signals',
                route: '/skills'
              })
            }
            className="absolute top-[28%] right-[22%] z-20 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-amber-400 opacity-75" />
              <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/50 group-hover:scale-125 transition-transform">
                <Sparkles className="w-3 h-3" />
              </div>
              <span className="hidden group-hover:block absolute top-7 bg-slate-900/90 text-amber-300 text-[11px] font-mono px-2.5 py-1 rounded-md border border-amber-500/40 shadow-xl whitespace-nowrap">
                Click: Market Demand Peak (30%)
              </span>
            </div>
          </div>

          {/* Layer 4: Midground Misty Hills, Pine Ridges & Lake */}
          <div
            className="absolute inset-0 pointer-events-none transition-transform duration-200 ease-out"
            style={{
              transform: `translate3d(${pX * -40}px, ${pY * -25}px, 0)`
            }}
          >
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 1440 900"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="midRidgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#43224b" />
                  <stop offset="100%" stopColor="#1a142e" />
                </linearGradient>

                <linearGradient id="lakeWater" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2c3a59" />
                  <stop offset="50%" stopColor="#4f4877" />
                  <stop offset="100%" stopColor="#1e243b" />
                </linearGradient>
              </defs>

              {/* Rolling Hills across the middle */}
              <path
                d="M 0 540 Q 240 460 520 530 T 1040 500 T 1440 540 L 1440 750 L 0 750 Z"
                fill="url(#midRidgeGrad)"
              />

              {/* Serene Lake Horizon */}
              <path
                d="M 180 580 Q 480 550 820 585 T 1440 600 L 1440 680 L 180 680 Z"
                fill="url(#lakeWater)"
                opacity="0.85"
              />

              {/* Misty Lake Reflections */}
              <ellipse cx="640" cy="610" rx="220" ry="12" fill="#ffb499" opacity="0.25" />
            </svg>
          </div>

          {/* Layer 5: Foreground Promontory Clifftop with Swaying Pampas Grass & The Wayfarer */}
          <div
            className="absolute inset-0 pointer-events-none transition-transform duration-200 ease-out"
            style={{
              transform: `translate3d(${pX * -70}px, ${pY * -40}px, 0)`
            }}
          >
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 1440 900"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="cliffRock" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#241b2c" />
                  <stop offset="70%" stopColor="#14111d" />
                  <stop offset="100%" stopColor="#08070d" />
                </linearGradient>

                <linearGradient id="reedsGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#18151f" />
                  <stop offset="60%" stopColor="#3d2d3a" />
                  <stop offset="100%" stopColor="#d48a60" />
                </linearGradient>
              </defs>

              {/* Promontory Rock Ledge (Right side) */}
              <path
                d="M 940 900 L 980 650 Q 1120 620 1280 660 L 1440 680 L 1440 900 Z"
                fill="url(#cliffRock)"
              />

              {/* Clifftop Left Outcrop */}
              <path
                d="M 0 900 L 0 720 Q 120 700 240 760 L 320 900 Z"
                fill="url(#cliffRock)"
              />

              {/* Wind-Swayed Pampas Reeds (Susuki grass) */}
              <g stroke="url(#reedsGrad)" strokeWidth="3" strokeLinecap="round">
                <path d="M 990 650 Q 970 570 940 520" />
                <path d="M 1010 650 Q 1000 560 980 500" />
                <path d="M 1030 650 Q 1040 570 1020 510" />
                <path d="M 1050 660 Q 1080 580 1070 530" />
                <path d="M 1080 660 Q 1110 590 1130 540" />
                <path d="M 1120 670 Q 1170 600 1210 550" />
                <path d="M 1150 670 Q 1200 610 1240 565" />
                <path d="M 1200 680 Q 1260 620 1310 580" />
                <path d="M 1250 680 Q 1320 630 1380 595" />
              </g>

              {/* ======================================================= */}
              {/* THE WAYFARER / TRAVELER STANDING ON CLIFF (Right)       */}
              {/* ======================================================= */}
              <g id="wayfarer" transform="translate(1040, 410)">
                {/* Flowing saffron scarf / wind sash */}
                <path
                  d="M 115 130 Q 155 120 195 105 Q 215 112 185 125 Q 145 135 110 138 Z"
                  fill="#f59e0b"
                />

                {/* Back coat / crimson traveler's haori */}
                <path
                  d="M 85 105 Q 120 110 135 150 L 145 220 Q 95 240 60 215 L 75 125 Z"
                  fill="#be123c"
                />

                {/* Traveler's Expedition Pack (Backpack) */}
                <rect
                  x="80"
                  y="110"
                  width="42"
                  height="55"
                  rx="8"
                  fill="#475569"
                  stroke="#1e293b"
                  strokeWidth="2"
                />
                <line x1="80" y1="125" x2="122" y2="125" stroke="#f1f5f9" strokeWidth="2" />
                <line x1="80" y1="145" x2="122" y2="145" stroke="#f1f5f9" strokeWidth="2" />

                {/* Arms & Torso in stance */}
                <path
                  d="M 68 120 Q 60 160 72 205 Q 92 210 102 195 L 92 125 Z"
                  fill="#881337"
                />

                {/* Traditional Straw Conical Hat (Kasa) */}
                <path
                  d="M 50 100 Q 105 60 160 100 Q 105 85 50 100 Z"
                  fill="#eab308"
                  stroke="#a16207"
                  strokeWidth="2"
                />
                <ellipse cx="105" cy="92" rx="42" ry="12" fill="#ca8a04" opacity="0.6" />

                {/* Lower Traveler Trousers & Gaiters */}
                <path
                  d="M 70 210 L 80 260 L 95 260 L 90 210 Z"
                  fill="#1e293b"
                />
                <path
                  d="M 105 210 L 115 260 L 130 260 L 125 210 Z"
                  fill="#1e293b"
                />

                {/* Straw Waraji Sandals */}
                <rect x="75" y="258" width="22" height="6" rx="2" fill="#d97706" />
                <rect x="115" y="258" width="22" height="6" rx="2" fill="#d97706" />
              </g>
            </svg>
          </div>

          {/* =========================================================== */}
          {/* SCENE 1 EDITORIAL TYPOGRAPHY & HERO CONTENT                 */}
          {/* =========================================================== */}
          <div className="absolute top-[24%] left-6 sm:left-16 lg:left-24 max-w-2xl z-30 space-y-6">
            {/* Elegant kicker tag */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-mono uppercase tracking-widest shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>01 · Journey to New Frontiers · The Career Horizon</span>
            </div>

            {/* Monumental Hero Headline (Matching "VISITE" in video) */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white tracking-wider font-cinzel leading-none drop-shadow-2xl">
              HORIZON
            </h1>

            {/* Editorial Description */}
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-jakarta max-w-xl drop-shadow-md">
              Survey the shifting technological landscape. Evaluate empirical automation exposure against genuine job-market demand to chart your high-resilience transition path.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('/onboarding')}
                className="flex items-center gap-3 px-7 py-3.5 rounded-full text-sm font-bold tracking-wider uppercase bg-white text-slate-950 hover:bg-amber-300 shadow-2xl shadow-white/20 transition-all hover:scale-105 active:scale-95"
              >
                <span>Start the journey</span>
                <span className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center text-xs">
                  ▶
                </span>
              </button>

              <button
                onClick={() => scrollToChapter(1)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-full text-xs font-semibold tracking-wider uppercase text-white bg-slate-900/60 backdrop-blur-md border border-white/20 hover:bg-white/10 transition-colors"
              >
                <span>Descend to River Flow</span>
                <ChevronDown className="w-4 h-4 text-amber-300 animate-bounce" />
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================== */}
        {/* CHAPTER 02: THE WATERFALL GORGE & RESILIENCE (Tranquility) */}
        {/* =========================================================== */}
        <section className="relative w-full h-[115vh] overflow-hidden">
          {/* Layer 1: Canyon Walls & Volumetric Light Rays */}
          <div
            className="absolute inset-0 transition-transform duration-200 ease-out"
            style={{
              background: 'linear-gradient(180deg, #101222 0%, #151e36 40%, #0d283e 70%, #0b1a28 100%)',
              transform: `translate3d(${pX * -12}px, ${pY * -10}px, 0)`
            }}
          >
            {/* Volumetric Sun God Rays slicing through canyon */}
            <div
              className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-out"
              style={{
                transform: `translate3d(${pX * -25}px, ${pY * -15}px, 0)`
              }}
            >
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
                <defs>
                  <linearGradient id="godRay1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="0.45" />
                    <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="godRay2" x1="10%" y1="0%" x2="90%" y2="100%">
                    <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.35" />
                    <stop offset="70%" stopColor="#d97706" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Slicing light rays */}
                <polygon points="580,0 720,0 1200,900 950,900" fill="url(#godRay1)" />
                <polygon points="420,0 520,0 980,900 800,900" fill="url(#godRay2)" />
                <polygon points="680,0 800,0 1380,900 1150,900" fill="url(#godRay1)" opacity="0.6" />
              </svg>
            </div>
          </div>

          {/* Layer 2: The Cascading Roaring Waterfall & Particle Foam */}
          <div
            className="absolute inset-0 pointer-events-none transition-transform duration-200 ease-out"
            style={{
              transform: `translate3d(${pX * -30}px, ${pY * -20}px, 0)`
            }}
          >
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 1440 900"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="waterStream" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="30%" stopColor="#7dd3fc" />
                  <stop offset="70%" stopColor="#e0f2fe" />
                  <stop offset="100%" stopColor="#bae6fd" />
                </linearGradient>

                <linearGradient id="cliffWallLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="85%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              {/* Towering Rock Cliffs flanking the falls */}
              <path d="M 0 0 L 260 0 L 320 900 L 0 900 Z" fill="url(#cliffWallLeft)" />
              <path d="M 1440 0 L 1180 0 L 1140 900 L 1440 900 Z" fill="url(#cliffWallLeft)" />

              {/* The Vertical Waterfall Column */}
              <path
                d="M 280 0 Q 300 350 270 700 Q 260 820 180 900 L 420 900 Q 370 780 340 450 Q 330 180 340 0 Z"
                fill="url(#waterStream)"
                opacity="0.92"
              />

              {/* Internal Waterfall Streaks & Shimmer */}
              <path
                d="M 300 0 L 290 900 M 315 0 L 310 900 M 330 0 L 325 900"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeDasharray="16 12"
                opacity="0.6"
              />

              {/* Waterfall Mist Cloud at Plunge Pool */}
              <ellipse cx="280" cy="860" rx="180" ry="70" fill="#e0f2fe" opacity="0.35" />
              <ellipse cx="260" cy="870" rx="120" ry="45" fill="#ffffff" opacity="0.45" />

              {/* River Surface Ripples */}
              <ellipse cx="580" cy="870" rx="340" ry="25" fill="#38bdf8" opacity="0.25" />
            </svg>
          </div>

          {/* Interactive Waterfall Hotspot Beacon */}
          <div
            onClick={() =>
              setActiveHotspot({
                id: 'waterfall-ai-exposure',
                title: 'Automation Exposure Currents',
                category: 'Task-Level Exposure Inversion',
                description:
                  'The rushing waterfall reflects rapid technological acceleration. PathForge measures empirical AI exposure and inverts it: high exposure yields lower score unless balanced by high-judgment, non-automatable skills.',
                metric: '20% Formula Weight · Inverted Exposure Math',
                actionLabel: 'Explore 5-Factor Formula',
                route: '/resilience'
              })
            }
            className="absolute top-[48%] left-[24%] z-20 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-cyan-400 opacity-75" />
              <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/50 group-hover:scale-125 transition-transform">
                <ShieldCheck className="w-3 h-3" />
              </div>
              <span className="hidden group-hover:block absolute top-7 bg-slate-900/90 text-cyan-300 text-[11px] font-mono px-2.5 py-1 rounded-md border border-cyan-500/40 shadow-xl whitespace-nowrap">
                Click: Automation Exposure Shield (20%)
              </span>
            </div>
          </div>

          {/* Layer 3: Foreground Riverbank, Giant Guardian Tortoise & Resting Traveler */}
          <div
            className="absolute inset-0 pointer-events-none transition-transform duration-200 ease-out"
            style={{
              transform: `translate3d(${pX * -65}px, ${pY * -35}px, 0)`
            }}
          >
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 1440 900"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="mossyRock" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14532d" />
                  <stop offset="40%" stopColor="#1c2438" />
                  <stop offset="100%" stopColor="#0b0f19" />
                </linearGradient>

                <linearGradient id="turtleShell" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#047857" />
                  <stop offset="60%" stopColor="#064e3b" />
                  <stop offset="100%" stopColor="#022c22" />
                </linearGradient>
              </defs>

              {/* Mossy Riverbank Rocks Right */}
              <path
                d="M 880 900 Q 940 760 1100 750 Q 1280 740 1440 790 L 1440 900 Z"
                fill="url(#mossyRock)"
              />

              {/* Ancient Sacred River Tortoise / Turtle Resting Beside Traveler */}
              <g id="sacredTurtle" transform="translate(1180, 715)">
                {/* Tortoise Shell Dome */}
                <ellipse cx="90" cy="55" rx="85" ry="50" fill="url(#turtleShell)" stroke="#059669" strokeWidth="2.5" />
                {/* Shell Hexagonal Patterns */}
                <polygon points="90,20 110,35 110,60 90,75 70,60 70,35" fill="#065f46" stroke="#10b981" strokeWidth="1.5" />
                <polygon points="135,35 155,50 155,75 135,90 115,75 115,50" fill="#065f46" stroke="#10b981" strokeWidth="1.5" />
                <polygon points="45,35 65,50 65,75 45,90 25,75 25,50" fill="#065f46" stroke="#10b981" strokeWidth="1.5" />
                {/* Tortoise Head */}
                <ellipse cx="5" cy="58" rx="20" ry="14" fill="#047857" />
                <circle cx="-2" cy="54" r="2.5" fill="#fef08a" />
                {/* Front & Back Flippers / Legs */}
                <ellipse cx="40" cy="98" rx="22" ry="12" fill="#065f46" />
                <ellipse cx="145" cy="98" rx="20" ry="10" fill="#065f46" />
              </g>

              {/* The Wayfarer Seated in Peaceful Contemplation by the River */}
              <g id="seatedTraveler" transform="translate(980, 630)">
                {/* Straw Conical Hat resting on knees */}
                <path d="M 50 110 Q 95 80 140 110 Z" fill="#eab308" stroke="#a16207" strokeWidth="2" />
                {/* Head with bandana */}
                <circle cx="95" cy="85" r="14" fill="#fbcfe8" />
                <path d="M 85 82 Q 95 78 105 82" stroke="#be123c" strokeWidth="4" />
                {/* Crimson Haori Robe Seated */}
                <path d="M 65 95 Q 95 90 125 95 L 140 160 Q 95 175 50 160 Z" fill="#be123c" />
                {/* Saffron Sash */}
                <rect x="75" y="125" width="40" height="8" rx="2" fill="#f59e0b" />
                {/* Bamboo Fishing Rod / Walking Staff */}
                <line x1="120" y1="110" x2="30" y2="40" stroke="#ca8a04" strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* Blooming River Water Lilies */}
              <ellipse cx="780" cy="840" rx="16" ry="6" fill="#065f46" />
              <circle cx="782" cy="838" r="5" fill="#f43f5e" />
              <ellipse cx="840" cy="860" rx="20" ry="7" fill="#065f46" />
              <circle cx="842" cy="857" r="6" fill="#fbcfe8" />
            </svg>
          </div>

          {/* =========================================================== */}
          {/* SCENE 2 EDITORIAL CONTENT                                   */}
          {/* =========================================================== */}
          <div className="absolute top-[32%] left-6 sm:left-16 lg:left-24 max-w-xl z-30 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-widest shadow-lg">
              <span>02 · Experience · Equilibrium & Resilience</span>
            </div>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-wider font-cinzel leading-tight drop-shadow-2xl">
              Tranquility
            </h2>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-jakarta drop-shadow-md">
              Away from the turbulent noise of rapid automation, PathForge reveals your core transferable foundations. Ground your career in explainable, mathematically verified resilience.
            </p>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('/resilience')}
                className="inline-flex items-center gap-3 text-sm font-semibold tracking-wider uppercase text-amber-300 hover:text-white transition-colors group"
              >
                <span>Learn more about 5-factor formula</span>
                <span className="w-8 h-8 rounded-full bg-amber-400/20 group-hover:bg-amber-400 group-hover:text-slate-950 flex items-center justify-center transition-all">
                  →
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================== */}
        {/* CHAPTER 03: THE FOREST SANCTUARY & BIODIVERSITY             */}
        {/* =========================================================== */}
        <section className="relative w-full h-[115vh] overflow-hidden">
          {/* Layer 1: Ancient Emerald Forest & Bioluminescent Shimmer */}
          <div
            className="absolute inset-0 transition-transform duration-200 ease-out"
            style={{
              background: 'linear-gradient(180deg, #091a24 0%, #0d2a2a 35%, #0a3328 70%, #061c16 100%)',
              transform: `translate3d(${pX * -12}px, ${pY * -10}px, 0)`
            }}
          >
            {/* Drifting Bioluminescent Spores / Fireflies */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[20%] left-[30%] w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <div className="absolute top-[45%] left-[55%] w-2.5 h-2.5 rounded-full bg-cyan-300 blur-[1px] animate-pulse" />
              <div className="absolute top-[65%] left-[40%] w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
              <div className="absolute top-[35%] right-[25%] w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            </div>
          </div>

          {/* Interactive Sanctuary Hotspot Beacon */}
          <div
            onClick={() =>
              setActiveHotspot({
                id: 'sanctuary-transferability',
                title: 'Skill Transferability Ecosystem',
                category: 'Cross-Domain Skill Bridges',
                description:
                  'In a healthy ecosystem, skills adapt across habitats. PathForge maps your existing engineering foundations to adjacent roles like GenAI Application Developer or MLOps Architect with minimal retraining.',
                metric: '25% Formula Weight · Cross-Domain Affinity',
                actionLabel: 'View Transition Targets',
                route: '/paths'
              })
            }
            className="absolute top-[36%] right-[32%] z-20 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-75" />
              <div className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/50 group-hover:scale-125 transition-transform">
                <Cpu className="w-3 h-3" />
              </div>
              <span className="hidden group-hover:block absolute top-7 bg-slate-900/90 text-emerald-300 text-[11px] font-mono px-2.5 py-1 rounded-md border border-emerald-500/40 shadow-xl whitespace-nowrap">
                Click: Transferability Ecosystem (25%)
              </span>
            </div>
          </div>

          {/* Layer 2: Forest Canopy, Lower Riverbed & Spotted Deer (Shika) */}
          <div
            className="absolute inset-0 pointer-events-none transition-transform duration-200 ease-out"
            style={{
              transform: `translate3d(${pX * -50}px, ${pY * -30}px, 0)`
            }}
          >
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 1440 900"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="deerCoat" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ea580c" />
                  <stop offset="60%" stopColor="#c2410c" />
                  <stop offset="100%" stopColor="#7c2d12" />
                </linearGradient>

                <linearGradient id="forestFloor" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#042f2e" />
                  <stop offset="100%" stopColor="#021c17" />
                </linearGradient>
              </defs>

              {/* Lower River Cascade Continuing from Above */}
              <path
                d="M 1200 0 Q 1240 300 1210 600 L 1380 900 L 1440 900 L 1440 0 Z"
                fill="#7dd3fc"
                opacity="0.45"
              />

              {/* Deep Forest Floor with Stepping Rocks */}
              <path
                d="M 0 760 Q 320 720 740 770 T 1440 750 L 1440 900 L 0 900 Z"
                fill="url(#forestFloor)"
              />

              {/* ======================================================= */}
              {/* THE SPOTTED DEER (SHIKA) STEPPING IN WATER STREAM       */}
              {/* ======================================================= */}
              <g id="sikaDeer" transform="translate(620, 520)">
                {/* Torso */}
                <ellipse cx="140" cy="140" rx="85" ry="50" fill="url(#deerCoat)" />

                {/* White Dappled Spots */}
                <circle cx="110" cy="120" r="3.5" fill="#ffffff" opacity="0.9" />
                <circle cx="130" cy="115" r="4" fill="#ffffff" opacity="0.9" />
                <circle cx="155" cy="118" r="3.5" fill="#ffffff" opacity="0.9" />
                <circle cx="175" cy="125" r="4" fill="#ffffff" opacity="0.9" />
                <circle cx="125" cy="140" r="3.5" fill="#ffffff" opacity="0.9" />
                <circle cx="145" cy="138" r="4" fill="#ffffff" opacity="0.9" />
                <circle cx="168" cy="142" r="3" fill="#ffffff" opacity="0.9" />

                {/* Graceful Arching Neck */}
                <path
                  d="M 85 130 Q 55 90 65 45 Q 85 45 105 110 Z"
                  fill="url(#deerCoat)"
                />

                {/* Gentle Head Turned Toward Viewer */}
                <ellipse cx="60" cy="42" rx="25" ry="18" fill="url(#deerCoat)" />
                {/* Large Dark Expressive Eye */}
                <ellipse cx="52" cy="38" rx="5" ry="4" fill="#18181b" />
                <circle cx="50.5" cy="36.5" r="1.5" fill="#ffffff" />
                {/* Black Muzzle */}
                <ellipse cx="40" cy="45" rx="7" ry="5" fill="#18181b" />

                {/* Sensitive Ears */}
                <ellipse cx="78" cy="22" rx="8" ry="16" transform="rotate(25 78 22)" fill="url(#deerCoat)" />
                <ellipse cx="80" cy="24" rx="4" ry="10" transform="rotate(25 80 24)" fill="#fed7aa" />

                {/* Slender Deer Legs stepping in stream */}
                {/* Front Left */}
                <path d="M 85 180 L 80 260 L 88 260 L 95 180 Z" fill="#9a3412" />
                {/* Front Right (Stepping forward) */}
                <path d="M 105 180 L 115 240 L 130 250 L 125 180 Z" fill="#7c2d12" />
                {/* Rear Legs */}
                <path d="M 195 175 L 205 260 L 215 260 L 210 175 Z" fill="#9a3412" />
                <path d="M 175 175 L 180 255 L 190 255 L 185 175 Z" fill="#7c2d12" />

                {/* Gentle Tail */}
                <path d="M 220 120 Q 235 130 230 145 Q 220 135 220 120" fill="#ffffff" />
              </g>

              {/* Bioluminescent Ferns & Flora */}
              <g stroke="#34d399" strokeWidth="2.5" strokeLinecap="round">
                <path d="M 220 800 Q 240 730 280 700" />
                <path d="M 240 790 Q 270 740 310 720" />
                <path d="M 180 810 Q 190 750 220 720" />
                <path d="M 980 820 Q 1010 760 1050 730" />
                <path d="M 1010 820 Q 1040 770 1080 750" />
              </g>
            </svg>
          </div>

          {/* =========================================================== */}
          {/* SCENE 3 EDITORIAL CONTENT                                   */}
          {/* =========================================================== */}
          <div className="absolute top-[32%] left-6 sm:left-16 lg:left-24 max-w-xl z-30 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-mono uppercase tracking-widest shadow-lg">
              <span>03 · Habitat · Transition Ecosystem</span>
            </div>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-wider font-cinzel leading-tight drop-shadow-2xl">
              Biodiversity
            </h2>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-jakarta drop-shadow-md">
              No technical skill exists in isolation. Explore adjacent roles where your existing proficiencies cross-pollinate into high-demand AI, cloud architecture, and data engineering pathways.
            </p>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('/paths')}
                className="inline-flex items-center gap-3 text-sm font-semibold tracking-wider uppercase text-emerald-300 hover:text-white transition-colors group"
              >
                <span>Explore career transition paths</span>
                <span className="w-8 h-8 rounded-full bg-emerald-400/20 group-hover:bg-emerald-400 group-hover:text-slate-950 flex items-center justify-center transition-all">
                  →
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================== */}
        {/* CHAPTER 04: THE INTELLIGENCE COMMAND CORE (Functional Hub) */}
        {/* =========================================================== */}
        <section className="relative w-full min-h-screen py-16 px-6 sm:px-12 lg:px-20 bg-gradient-to-b from-[#061c16] via-[#090e1f] to-[#020617] border-t border-slate-800">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Header & Section Title */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>04 · National AI Innovation Architecture · Working Workspace</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-cinzel">
                Predictive Intelligence Command
              </h2>
              <p className="text-sm sm:text-base text-slate-300 font-jakarta">
                Connect your real resume to our deterministic 5-factor mathematical engine. Real market data, zero fabrication.
              </p>
            </div>

            {/* Active Profile Status Banner if present */}
            {activeProfile ? (
              <div className="bg-slate-900/80 border border-slate-750 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Active Profile</span>
                    <DataBadge
                      status={activeMode === 'demo' ? 'demo' : activeProfile.extractionSource === 'fallback' ? 'fallback' : 'live'}
                      label={activeMode === 'demo' ? 'BENCHMARK ARCHETYPE' : 'AUTHENTIC CANDIDATE DATA'}
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {activeProfile.fullName || 'Verified Candidate'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeProfile.currentRole || 'Targeting Technology Roles'} • {activeProfile.yearsOfExperience !== null ? `${activeProfile.yearsOfExperience} yrs exp` : 'Experience unstated'} • {activeProfile.skills.length} extracted skills
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onNavigate('/profile')}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-650 transition"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => onNavigate('/resilience')}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition shadow-lg shadow-amber-950/40"
                  >
                    Resilience Score ({activeAnalysis ? `${activeAnalysis.overallScore}/100` : 'Analyze'})
                  </button>
                  <button
                    onClick={() => onNavigate('/command-center')}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 transition"
                  >
                    3D Command Center
                  </button>
                </div>
              </div>
            ) : (
              /* Quick Upload Callout */
              <div className="bg-gradient-to-r from-slate-900/90 via-slate-950 to-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="space-y-2 max-w-xl mx-auto">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Upload Your Actual Resume
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    PDF, DOCX, or TXT. Structured via Gemini 3.1 Flash Lite into verified JSON. No placeholder candidates.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => onNavigate('/onboarding')}
                    className="px-6 py-3 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xl shadow-amber-500/20 transition-all hover:scale-105"
                  >
                    Upload Document Now
                  </button>
                  <button
                    onClick={() => onToggleMode('demo')}
                    className="px-5 py-3 rounded-full text-xs font-semibold tracking-wider uppercase bg-slate-900 text-slate-300 border border-slate-750 hover:border-slate-500 transition-colors"
                  >
                    Preview Arjun Sharma Benchmark
                  </button>
                </div>
              </div>
            )}

            {/* Core Working Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* Module 1: 3D Command Center */}
              <div
                onClick={() => onNavigate('/command-center')}
                className="group cursor-pointer p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition-all hover:bg-slate-900/90 shadow-xl space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Rotate3d className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    3D Command Center
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Interactive WebGL 3D intelligence graph linking Candidate → Skills → Market Signals → Target Paths.
                  </p>
                </div>
                <div className="text-xs font-mono text-cyan-400 flex items-center gap-1">
                  <span>Enter 3D Topology</span>
                  <span>→</span>
                </div>
              </div>

              {/* Module 2: What-If Simulator */}
              <div
                onClick={() => onNavigate('/simulator')}
                className="group cursor-pointer p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 transition-all hover:bg-slate-900/90 shadow-xl space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-800/60 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    What-If Simulator
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Add emerging skills (PyTorch, Docker, Kubernetes) to preview your real-time score boost and unlock new roles.
                  </p>
                </div>
                <div className="text-xs font-mono text-amber-400 flex items-center gap-1">
                  <span>Simulate Upskilling</span>
                  <span>→</span>
                </div>
              </div>

              {/* Module 3: Guided Pitch Tour */}
              <div
                onClick={onOpenPitchTour}
                className="group cursor-pointer p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 transition-all hover:bg-slate-900/90 shadow-xl space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-800/60 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    13-Step Guided Tour
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Official walkthrough demonstrating the entire pipeline from raw resume ingestion down to verified NPTEL course links.
                  </p>
                </div>
                <div className="text-xs font-mono text-purple-400 flex items-center gap-1">
                  <span>Start Pitch Tour</span>
                  <span>→</span>
                </div>
              </div>
            </div>

            {/* Bottom Utility: Option to toggle back to standard grid view if user desires */}
            {onSwitchToGrid && (
              <div className="text-center pt-8 border-t border-slate-850">
                <button
                  onClick={onSwitchToGrid}
                  className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4 font-mono transition-colors"
                >
                  Switch to Standard Analytical Grid Layout
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* INTERACTIVE HOTSPOT MODAL / DRAWER (Explains workforce math) */}
      {/* ------------------------------------------------------------- */}
      {activeHotspot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                {activeHotspot.category}
              </span>
              <button
                onClick={() => setActiveHotspot(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white font-cinzel">
                {activeHotspot.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-jakarta">
                {activeHotspot.description}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono text-amber-300">
              {activeHotspot.metric}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const targetRoute = activeHotspot.route;
                  setActiveHotspot(null);
                  onNavigate(targetRoute);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-slate-950 transition"
              >
                {activeHotspot.actionLabel}
              </button>
              <button
                onClick={() => setActiveHotspot(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-slate-750 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
