import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { OnboardingPage } from './pages/OnboardingPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { ResiliencePage } from './pages/ResiliencePage.tsx';
import { CareerPathsPage } from './pages/CareerPathsPage.tsx';
import { SkillGapsPage } from './pages/SkillGapsPage.tsx';
import { RoadmapPage } from './pages/RoadmapPage.tsx';
import { SimulatorPage } from './pages/SimulatorPage.tsx';
import { ProgressPage } from './pages/ProgressPage.tsx';
import { EvaluationPage } from './pages/EvaluationPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { SkillsPage } from './pages/SkillsPage.tsx';
import { CommandCenterPage } from './pages/CommandCenterPage.tsx';
import { WalkthroughModal } from './components/WalkthroughModal.tsx';
import { SpatialConstellationBackground } from './components/three/SpatialConstellationBackground.tsx';

import { UserProfile, ResumeMeta } from './types/profile.ts';
import { MarketSnapshot } from './types/market.ts';
import { ResilienceAnalysis } from './types/resilience.ts';
import { TransitionRecommendation } from './types/transitions.ts';
import { LearningRoadmap } from './types/roadmap.ts';

import { StorageService } from './services/storageService.ts';
import { calculateResilienceScore } from './services/resilienceEngine.ts';
import { calculateTransitionRecommendations } from './services/transitionEngine.ts';
import { generateLearningRoadmap } from './services/roadmapService.ts';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname && window.location.pathname !== '/'
      ? window.location.pathname
      : '/';
  });

  const [activeMode, setActiveMode] = useState<'real' | 'demo'>(() => StorageService.getMode());
  const [profile, setProfile] = useState<UserProfile | null>(() => StorageService.getActiveProfile());
  const [marketSnapshot, setMarketSnapshot] = useState<MarketSnapshot | null>(() => StorageService.getActiveMarketSnapshot());
  const [analysis, setAnalysis] = useState<ResilienceAnalysis | null>(() => StorageService.getActiveAnalysis());
  const [recommendations, setRecommendations] = useState<TransitionRecommendation[]>(() => StorageService.getRecommendations());
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(() => StorageService.getRoadmap());
  const [isPitchTourOpen, setIsPitchTourOpen] = useState<boolean>(false);
  const [marketStatus, setMarketStatus] = useState<'live' | 'cached' | 'demo' | 'not_configured'>('cached');

  // Handle URL history state
  const navigateTo = (route: string) => {
    setCurrentRoute(route);
    window.history.pushState({}, '', route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch market provider status on mount
  useEffect(() => {
    fetch('/api/market/status')
      .then(res => res.json())
      .then(data => {
        if (data.configured) {
          setMarketStatus('live');
        } else {
          setMarketStatus('not_configured');
        }
      })
      .catch(() => setMarketStatus('not_configured'));
  }, []);

  // Mode Toggling (Real vs Demo)
  const handleToggleMode = (mode: 'real' | 'demo') => {
    setActiveMode(mode);
    StorageService.setMode(mode);

    const newProfile = StorageService.getActiveProfile();
    const newSnapshot = StorageService.getActiveMarketSnapshot();
    setProfile(newProfile);
    setMarketSnapshot(newSnapshot);

    if (newProfile && newProfile.skills.length > 0) {
      const newAnalysis = calculateResilienceScore(newProfile.skills, newSnapshot, newProfile.id);
      const newRecs = calculateTransitionRecommendations(newProfile.skills, newProfile.currentRole, newSnapshot);
      const newRoadmap = newRecs.length > 0 ? generateLearningRoadmap(newRecs[0], newProfile.id) : null;

      setAnalysis(newAnalysis);
      setRecommendations(newRecs);
      setRoadmap(newRoadmap);

      if (mode === 'real') {
        StorageService.saveActiveAnalysis(newAnalysis);
        StorageService.saveRecommendations(newRecs);
        if (newRoadmap) StorageService.saveRoadmap(newRoadmap);
      }
    } else {
      setAnalysis(null);
      setRecommendations([]);
      setRoadmap(null);
    }
  };

  // Called when a resume is uploaded and parsed
  const handleProfileExtracted = (extracted: UserProfile, meta?: ResumeMeta) => {
    setActiveMode('real');
    StorageService.setMode('real');
    StorageService.saveRealProfile(extracted);
    setProfile(extracted);

    if (extracted.skills && extracted.skills.length > 0) {
      const calculatedAnalysis = calculateResilienceScore(extracted.skills, marketSnapshot, extracted.id);
      const calculatedRecs = calculateTransitionRecommendations(extracted.skills, extracted.currentRole, marketSnapshot);
      const calculatedRoadmap = calculatedRecs.length > 0 ? generateLearningRoadmap(calculatedRecs[0], extracted.id) : null;

      setAnalysis(calculatedAnalysis);
      setRecommendations(calculatedRecs);
      setRoadmap(calculatedRoadmap);

      StorageService.saveActiveAnalysis(calculatedAnalysis);
      StorageService.saveRecommendations(calculatedRecs);
      if (calculatedRoadmap) StorageService.saveRoadmap(calculatedRoadmap);
    }
  };

  // Called when user clicks "Confirm Profile & Analyze" in /profile
  const handleConfirmAndAnalyze = () => {
    if (!profile) return;
    const calculatedAnalysis = calculateResilienceScore(profile.skills, marketSnapshot, profile.id);
    const calculatedRecs = calculateTransitionRecommendations(profile.skills, profile.currentRole, marketSnapshot);
    const calculatedRoadmap = calculatedRecs.length > 0 ? generateLearningRoadmap(calculatedRecs[0], profile.id) : null;

    setAnalysis(calculatedAnalysis);
    setRecommendations(calculatedRecs);
    setRoadmap(calculatedRoadmap);

    if (activeMode === 'real') {
      StorageService.saveActiveAnalysis(calculatedAnalysis);
      StorageService.saveRecommendations(calculatedRecs);
      if (calculatedRoadmap) StorageService.saveRoadmap(calculatedRoadmap);
    }

    navigateTo('/resilience');
  };

  const handleSelectPathForRoadmap = (rec: TransitionRecommendation) => {
    if (!profile) return;
    const generatedRoadmap = generateLearningRoadmap(rec, profile.id);
    setRoadmap(generatedRoadmap);
    if (activeMode === 'real') {
      StorageService.saveRoadmap(generatedRoadmap);
    }
    navigateTo('/roadmap');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Ambient 3D Spatial Constellation Background */}
      <SpatialConstellationBackground />

      {/* Top Navigation */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        activeMode={activeMode}
        onToggleMode={handleToggleMode}
        onOpenPitchTour={() => setIsPitchTourOpen(true)}
        userName={profile?.fullName}
        marketStatus={activeMode === 'demo' ? 'demo' : marketStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 relative z-10">
        {currentRoute === '/' && (
          <LandingPage
            onNavigate={navigateTo}
            activeProfile={profile}
            activeAnalysis={analysis}
            activeMode={activeMode}
            onToggleMode={handleToggleMode}
            onOpenPitchTour={() => setIsPitchTourOpen(true)}
          />
        )}

        {currentRoute === '/onboarding' && (
          <OnboardingPage
            onProfileExtracted={handleProfileExtracted}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === '/profile' && (
          <ProfilePage
            profile={profile}
            onProfileUpdated={(updated) => {
              setProfile(updated);
              StorageService.saveRealProfile(updated);
            }}
            onConfirmAndAnalyze={handleConfirmAndAnalyze}
            onNavigate={navigateTo}
          />
        )}

        {(currentRoute === '/command-center' || currentRoute === '/command' || currentRoute === '/3d') && (
          <CommandCenterPage
            profile={profile}
            analysis={analysis}
            recommendations={recommendations}
            roadmap={roadmap}
            activeMode={activeMode}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === '/skills' && (
          <SkillsPage
            profile={profile}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === '/resilience' && (
          <ResiliencePage
            analysis={analysis}
            onNavigate={navigateTo}
            activeMode={activeMode}
          />
        )}

        {currentRoute === '/paths' && (
          <CareerPathsPage
            recommendations={recommendations}
            onSelectPath={handleSelectPathForRoadmap}
            onGenerateRoadmap={handleSelectPathForRoadmap}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === '/gaps' && (
          <SkillGapsPage
            recommendations={recommendations}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === '/roadmap' && (
          <RoadmapPage
            roadmap={roadmap}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === '/simulator' && (
          <SimulatorPage
            profile={profile}
            baseAnalysis={analysis}
            marketSnapshot={marketSnapshot}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === '/progress' && (
          <ProgressPage
            profile={profile}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === '/evaluation' && (
          <EvaluationPage />
        )}

        {currentRoute === '/settings' && (
          <SettingsPage
            activeMode={activeMode}
            onToggleMode={handleToggleMode}
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-300">PATHFORGE AI</span>
            <span>•</span>
            <span>Predictive Skill Resilience & Transition Engine</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Deterministic Analytics Engine v1.4</span>
            <span>•</span>
            <button
              onClick={() => setIsPitchTourOpen(true)}
              className="text-cyan-400 hover:underline"
            >
              Pitch Tour (13 Steps)
            </button>
            <span>•</span>
            <button
              onClick={() => navigateTo('/evaluation')}
              className="text-cyan-400 hover:underline"
            >
              System Audit
            </button>
          </div>
        </div>
      </footer>

      {/* 12-Step Pitch Walkthrough Modal */}
      <WalkthroughModal
        isOpen={isPitchTourOpen}
        onClose={() => setIsPitchTourOpen(false)}
        onSelectStep={(route) => navigateTo(route)}
      />
    </div>
  );
}
