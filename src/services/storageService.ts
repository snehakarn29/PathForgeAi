import { UserProfile, ResumeMeta } from '../types/profile.ts';
import { MarketSnapshot } from '../types/market.ts';
import { ResilienceAnalysis } from '../types/resilience.ts';
import { TransitionRecommendation } from '../types/transitions.ts';
import { LearningRoadmap } from '../types/roadmap.ts';
import { UserProgress } from '../types/progress.ts';
import { AnalysisRun } from '../types/audit.ts';
import { DEMO_USER_PROFILE, DEMO_MARKET_SNAPSHOT } from '../data/demoData.ts';
import { calculateResilienceScore } from './resilienceEngine.ts';
import { calculateTransitionRecommendations } from './transitionEngine.ts';
import { generateLearningRoadmap } from './roadmapService.ts';

const STORAGE_KEYS = {
  ACTIVE_MODE: 'pathforge_active_mode', // 'real' | 'demo'
  REAL_PROFILE: 'pathforge_real_profile',
  REAL_RESUME_META: 'pathforge_real_resume_meta',
  REAL_SNAPSHOT: 'pathforge_real_market_snapshot',
  REAL_ANALYSIS: 'pathforge_real_analysis',
  REAL_RECOMMENDATIONS: 'pathforge_real_recommendations',
  REAL_ROADMAP: 'pathforge_real_roadmap',
  REAL_PROGRESS: 'pathforge_real_progress',
  ANALYSIS_RUNS: 'pathforge_analysis_runs',
  CACHED_SNAPSHOTS: 'pathforge_cached_snapshots'
};

const memoryStore = new Map<string, string>();

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // pass through to memoryStore
  }
  return memoryStore.get(key) || null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // pass through to memoryStore
  }
  memoryStore.set(key, value);
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // pass through to memoryStore
  }
  memoryStore.delete(key);
}

export class StorageService {
  // Mode Management
  static getMode(): 'real' | 'demo' {
    const mode = safeGetItem(STORAGE_KEYS.ACTIVE_MODE);
    return mode === 'demo' ? 'demo' : 'real'; // Default is REAL user mode!
  }

  static setMode(mode: 'real' | 'demo') {
    safeSetItem(STORAGE_KEYS.ACTIVE_MODE, mode);
  }

  // Active Profile
  static getActiveProfile(): UserProfile | null {
    const mode = this.getMode();
    if (mode === 'demo') {
      return DEMO_USER_PROFILE;
    }
    const raw = safeGetItem(STORAGE_KEYS.REAL_PROFILE);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static saveRealProfile(profile: UserProfile): void {
    safeSetItem(STORAGE_KEYS.REAL_PROFILE, JSON.stringify(profile));
    // If saving a real profile, ensure mode is 'real'
    this.setMode('real');
  }

  static clearRealProfile(): void {
    safeRemoveItem(STORAGE_KEYS.REAL_PROFILE);
    safeRemoveItem(STORAGE_KEYS.REAL_RESUME_META);
    safeRemoveItem(STORAGE_KEYS.REAL_ANALYSIS);
    safeRemoveItem(STORAGE_KEYS.REAL_RECOMMENDATIONS);
    safeRemoveItem(STORAGE_KEYS.REAL_ROADMAP);
    safeRemoveItem(STORAGE_KEYS.REAL_PROGRESS);
  }

  // Resume Metadata
  static getResumeMeta(): ResumeMeta | null {
    const raw = safeGetItem(STORAGE_KEYS.REAL_RESUME_META);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static saveResumeMeta(meta: ResumeMeta): void {
    safeSetItem(STORAGE_KEYS.REAL_RESUME_META, JSON.stringify(meta));
  }

  // Market Snapshot
  static getActiveMarketSnapshot(): MarketSnapshot | null {
    const mode = this.getMode();
    if (mode === 'demo') {
      return DEMO_MARKET_SNAPSHOT;
    }
    const raw = safeGetItem(STORAGE_KEYS.REAL_SNAPSHOT);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static saveMarketSnapshot(snapshot: MarketSnapshot): void {
    if (snapshot.provider === 'demo') return; // don't overwrite real snapshot with demo
    safeSetItem(STORAGE_KEYS.REAL_SNAPSHOT, JSON.stringify(snapshot));
    this.appendCachedSnapshot(snapshot);
  }

  // Cached Snapshots list
  static getCachedSnapshots(): MarketSnapshot[] {
    const raw = safeGetItem(STORAGE_KEYS.CACHED_SNAPSHOTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static appendCachedSnapshot(snapshot: MarketSnapshot): void {
    const list = this.getCachedSnapshots();
    const filtered = list.filter(s => s.id !== snapshot.id);
    filtered.unshift(snapshot);
    // keep max 20 snapshots
    safeSetItem(STORAGE_KEYS.CACHED_SNAPSHOTS, JSON.stringify(filtered.slice(0, 20)));
  }

  // Active Analysis
  static getActiveAnalysis(): ResilienceAnalysis | null {
    const mode = this.getMode();
    if (mode === 'demo') {
      const snapshot = this.getActiveMarketSnapshot();
      return calculateResilienceScore(DEMO_USER_PROFILE.skills, snapshot, DEMO_USER_PROFILE.id);
    }
    const raw = safeGetItem(STORAGE_KEYS.REAL_ANALYSIS);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static saveActiveAnalysis(analysis: ResilienceAnalysis): void {
    safeSetItem(STORAGE_KEYS.REAL_ANALYSIS, JSON.stringify(analysis));
  }

  // Active Recommendations
  static getRecommendations(): TransitionRecommendation[] {
    const mode = this.getMode();
    if (mode === 'demo') {
      const snapshot = this.getActiveMarketSnapshot();
      return calculateTransitionRecommendations(DEMO_USER_PROFILE.skills, DEMO_USER_PROFILE.currentRole, snapshot);
    }
    const raw = safeGetItem(STORAGE_KEYS.REAL_RECOMMENDATIONS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveRecommendations(recs: TransitionRecommendation[]): void {
    safeSetItem(STORAGE_KEYS.REAL_RECOMMENDATIONS, JSON.stringify(recs));
  }

  // Active Roadmap
  static getRoadmap(): LearningRoadmap | null {
    const mode = this.getMode();
    if (mode === 'demo') {
      const recs = this.getRecommendations();
      return recs.length > 0 ? generateLearningRoadmap(recs[0], DEMO_USER_PROFILE.id) : null;
    }
    const raw = safeGetItem(STORAGE_KEYS.REAL_ROADMAP);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static saveRoadmap(roadmap: LearningRoadmap): void {
    safeSetItem(STORAGE_KEYS.REAL_ROADMAP, JSON.stringify(roadmap));
  }

  // User Progress
  static getProgress(userId: string): UserProgress {
    const raw = safeGetItem(STORAGE_KEYS.REAL_PROGRESS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // pass
      }
    }
    return {
      userId,
      trackedSkills: {},
      completedMilestoneIds: [],
      totalHoursStudied: 0,
      lastActive: new Date().toISOString(),
      notes: ''
    };
  }

  static saveProgress(progress: UserProgress): void {
    safeSetItem(STORAGE_KEYS.REAL_PROGRESS, JSON.stringify(progress));
  }

  // Analysis Runs (Audit trail)
  static getAnalysisRuns(): AnalysisRun[] {
    const raw = safeGetItem(STORAGE_KEYS.ANALYSIS_RUNS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static recordAnalysisRun(run: AnalysisRun): void {
    const runs = this.getAnalysisRuns();
    runs.unshift(run);
    safeSetItem(STORAGE_KEYS.ANALYSIS_RUNS, JSON.stringify(runs.slice(0, 30)));
  }
}
