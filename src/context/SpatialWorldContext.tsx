import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types/profile.ts';
import { ResilienceAnalysis } from '../types/resilience.ts';
import { TransitionRecommendation } from '../types/transitions.ts';

export interface SpatialVantageTarget {
  camPos: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
  rotationSpeed: number;
  themeColor: string;
  stageName: string;
}

export const ROUTE_VANTAGE_MAP: Record<string, SpatialVantageTarget> = {
  '/': {
    camPos: [0, 2, 16],
    lookAt: [0, 0, 0],
    fov: 55,
    rotationSpeed: 0.05,
    themeColor: '#06b6d4',
    stageName: 'Intelligence Core'
  },
  '/onboarding': {
    camPos: [0, 1, 10],
    lookAt: [0, 0, 0],
    fov: 50,
    rotationSpeed: 0.12,
    themeColor: '#38bdf8',
    stageName: 'Document Ingestion'
  },
  '/profile': {
    camPos: [2, 1, 11],
    lookAt: [0, 0, 0],
    fov: 48,
    rotationSpeed: 0.06,
    themeColor: '#0ea5e9',
    stageName: 'Candidate DNA'
  },
  '/skills': {
    camPos: [0, 3, 14],
    lookAt: [0, 0, 0],
    fov: 52,
    rotationSpeed: 0.08,
    themeColor: '#3b82f6',
    stageName: 'Skill Constellation'
  },
  '/resilience': {
    camPos: [0, 0, 12],
    lookAt: [0, 0, 0],
    fov: 45,
    rotationSpeed: 0.04,
    themeColor: '#10b981',
    stageName: 'Resilience Geometry'
  },
  '/paths': {
    camPos: [-3, 2, 13],
    lookAt: [1, 0, 0],
    fov: 50,
    rotationSpeed: 0.05,
    themeColor: '#8b5cf6',
    stageName: 'Transition Horizon'
  },
  '/gaps': {
    camPos: [3, 2, 13],
    lookAt: [-1, 0, 0],
    fov: 48,
    rotationSpeed: 0.05,
    themeColor: '#f43f5e',
    stageName: 'Skill Gap Distances'
  },
  '/roadmap': {
    camPos: [0, 4, 15],
    lookAt: [0, 1, 0],
    fov: 52,
    rotationSpeed: 0.04,
    themeColor: '#06b6d4',
    stageName: 'Milestone Journey'
  },
  '/simulator': {
    camPos: [0, 2, 12],
    lookAt: [0, 0, 0],
    fov: 46,
    rotationSpeed: 0.07,
    themeColor: '#a855f7',
    stageName: 'Scenario Matrix'
  },
  '/progress': {
    camPos: [1, 2, 13],
    lookAt: [0, 0, 0],
    fov: 48,
    rotationSpeed: 0.06,
    themeColor: '#10b981',
    stageName: 'Progress Trajectory'
  },
  '/command-center': {
    camPos: [0, 3, 17],
    lookAt: [0, 0, 0],
    fov: 58,
    rotationSpeed: 0.09,
    themeColor: '#06b6d4',
    stageName: 'Global Command Hub'
  }
};

interface SpatialWorldContextType {
  currentRoute: string;
  scrollY: number;
  scrollVelocity: number;
  mousePos: React.MutableRefObject<{ x: number; y: number }>;
  vantage: SpatialVantageTarget;
  profile: UserProfile | null;
  analysis: ResilienceAnalysis | null;
  recommendations: TransitionRecommendation[];
  hoveredSkill: string | null;
  setHoveredSkill: (skill: string | null) => void;
  hoveredRole: string | null;
  setHoveredRole: (role: string | null) => void;
  selectedRoleTitle: string | null;
  setSelectedRoleTitle: (role: string | null) => void;
  reducedMotion: boolean;
}

const SpatialWorldContext = createContext<SpatialWorldContextType | null>(null);

export const SpatialWorldProvider: React.FC<{
  currentRoute: string;
  profile: UserProfile | null;
  analysis: ResilienceAnalysis | null;
  recommendations: TransitionRecommendation[];
  children: React.ReactNode;
}> = ({ currentRoute, profile, analysis, recommendations, children }) => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [selectedRoleTitle, setSelectedRoleTitle] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const mousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());

  // Listen for prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Track global window scroll position and velocity
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY || document.documentElement.scrollTop;
          const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          const normalized = Math.min(1, Math.max(0, currentY / maxScroll));

          const now = Date.now();
          const dt = Math.max(1, now - lastScrollTime.current);
          const dy = currentY - lastScrollY.current;
          const velocity = dy / dt;

          lastScrollY.current = currentY;
          lastScrollTime.current = now;

          setScrollY(normalized);
          setScrollVelocity(velocity);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track mouse coordinates for gentle parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const vantage = ROUTE_VANTAGE_MAP[currentRoute] || ROUTE_VANTAGE_MAP['/'];

  return (
    <SpatialWorldContext.Provider
      value={{
        currentRoute,
        scrollY,
        scrollVelocity,
        mousePos,
        vantage,
        profile,
        analysis,
        recommendations,
        hoveredSkill,
        setHoveredSkill,
        hoveredRole,
        setHoveredRole,
        selectedRoleTitle,
        setSelectedRoleTitle,
        reducedMotion
      }}
    >
      {children}
    </SpatialWorldContext.Provider>
  );
};

export const useSpatialWorld = (): SpatialWorldContextType => {
  const context = useContext(SpatialWorldContext);
  if (!context) {
    throw new Error('useSpatialWorld must be used within a SpatialWorldProvider');
  }
  return context;
};
