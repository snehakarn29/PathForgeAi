import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  AlertCircle,
  Database,
  Trash2,
  Download,
  Sparkles,
  Server,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { StorageService } from '../services/storageService.ts';
import { MarketProviderStatus } from '../types/market.ts';

interface SettingsPageProps {
  activeMode: 'real' | 'demo';
  onToggleMode: (mode: 'real' | 'demo') => void;
  onNavigate: (route: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  activeMode,
  onToggleMode,
  onNavigate
}) => {
  const [marketStatus, setMarketStatus] = useState<MarketProviderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const fetchProviderStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/market/status');
      if (res.ok) {
        const data = await res.json();
        setMarketStatus(data);
      }
    } catch {
      // pass
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderStatus();
  }, []);

  const handleClearData = () => {
    StorageService.clearRealProfile();
    setConfirmClear(false);
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      onNavigate('/');
      window.location.reload();
    }, 1200);
  };

  const handleExportJSON = () => {
    const profile = StorageService.getActiveProfile();
    const analysis = StorageService.getActiveAnalysis();
    const exportData = {
      profile,
      analysis,
      exportedAt: new Date().toISOString(),
      platform: 'PathForge AI'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pathforge-profile-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Environment & Configuration
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Application & Provider Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Inspect API key availability, manage local state persistence, and switch operational modes.
        </p>
      </div>

      {/* Mode Switcher Banner */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Active Application Mode
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          PathForge runs in <strong className="text-white">Real User Mode</strong> by default, accepting any new resume. The optional <strong className="text-white">Demo Mode</strong> loads the Arjun Sharma Java Backend Developer benchmark for hackathon presentations.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => onToggleMode('real')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeMode === 'real'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Real User Mode (Default)
          </button>
          <button
            onClick={() => onToggleMode('demo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeMode === 'demo'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Demo Persona (Arjun Sharma)
          </button>
        </div>
      </section>

      {/* Environment Variables State */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            External Provider Credentials Status
          </h3>
          <button
            onClick={fetchProviderStatus}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300"
            title="Refresh Status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {/* Gemini */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white font-mono">GEMINI_API_KEY</span>
              <p className="text-slate-400 text-[11px] mt-0.5">Used for structured resume understanding via Gemini 3.8 Flash.</p>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              Injected / Active
            </span>
          </div>

          {/* Adzuna App ID & Key */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white font-mono">ADZUNA_APP_ID & ADZUNA_APP_KEY</span>
              <p className="text-slate-400 text-[11px] mt-0.5">Required for querying live job vacancy counts and hiring market data.</p>
            </div>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
              marketStatus?.configured
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {marketStatus?.configured ? 'Configured' : 'Not Configured (Using Verified Cached Data)'}
            </span>
          </div>
        </div>

        {!marketStatus?.configured && (
          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-850 text-xs text-slate-400 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">How to configure live market data: </strong>
              Define <code className="text-cyan-300 font-mono">ADZUNA_APP_ID</code> and <code className="text-cyan-300 font-mono">ADZUNA_APP_KEY</code> in your environment or Secrets panel to enable real-time job scraping. When unconfigured, PathForge transparently uses verified cached snapshots without fabricating numbers.
            </div>
          </div>
        )}
      </section>

      {/* Data Management Actions */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          Persistence & Local Session Management
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export Profile JSON
          </button>

          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Saved Profile & Reset
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearData}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Yes, Permanently Clear All Data
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {resetSuccess && (
          <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4" /> Reset complete. Reloading clean state...
          </p>
        )}
      </section>
    </div>
  );
};
