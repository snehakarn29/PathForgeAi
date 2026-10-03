import React from 'react';
import { MLTransitionPrediction } from '../types/ml.ts';
import { Cpu, AlertCircle, CheckCircle2, TrendingUp, HelpCircle, Activity } from 'lucide-react';

interface MLReadinessCardProps {
  prediction?: MLTransitionPrediction | null;
  loading?: boolean;
}

export const MLReadinessCard: React.FC<MLReadinessCardProps> = ({
  prediction,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 w-40 bg-slate-800 rounded"></div>
          <div className="h-4 w-20 bg-slate-800 rounded"></div>
        </div>
        <div className="h-10 w-28 bg-slate-800 rounded"></div>
        <div className="h-3 w-full bg-slate-800 rounded"></div>
      </div>
    );
  }

  // Graceful offline fallback
  if (!prediction || !prediction.available) {
    return (
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              ML Transition Readiness
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700">
            Offline
          </span>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs text-slate-300 font-medium">
              ML Inference Service Unavailable
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {prediction?.reason || 'FastAPI service on port 5001 is unreachable. Deterministic PathForge intelligence engine remains fully operational.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const scorePct = Math.round((prediction.readiness_score ?? 0) * 100);
  const tier = prediction.prediction || 'moderate';

  const tierStyles = {
    high: {
      badge: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80',
      text: 'text-emerald-400',
      bar: 'bg-emerald-500',
      label: 'High Readiness'
    },
    moderate: {
      badge: 'bg-amber-950/80 text-amber-400 border-amber-800/80',
      text: 'text-amber-400',
      bar: 'bg-amber-500',
      label: 'Moderate Readiness'
    },
    low: {
      badge: 'bg-rose-950/80 text-rose-400 border-rose-800/80',
      text: 'text-rose-400',
      bar: 'bg-rose-500',
      label: 'Low Readiness'
    }
  }[tier] || {
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
    text: 'text-slate-300',
    bar: 'bg-slate-500',
    label: 'Evaluated'
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              ML Transition Readiness
            </h4>
            <span className="text-[10px] font-mono text-slate-500">
              Model: {prediction.algorithm || 'Random Forest'} • {prediction.model_version || 'v1.0.0'}
            </span>
          </div>
        </div>

        <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${tierStyles.badge}`}>
          {tierStyles.label}
        </span>
      </div>

      {/* Main Score Display */}
      <div className="flex items-end justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
            Model Prediction Score
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-black font-mono tracking-tight ${tierStyles.text}`}>
              {scorePct}%
            </span>
            <span className="text-xs font-mono text-slate-500">
              Readiness Index
            </span>
          </div>
        </div>

        {prediction.latency_ms && (
          <div className="text-right text-[10px] font-mono text-slate-500 flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-500" />
            <span>{prediction.latency_ms}ms inference</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${tierStyles.bar}`}
          style={{ width: `${Math.min(100, Math.max(5, scorePct))}%` }}
        />
      </div>

      {/* Top Model Influential Features */}
      {prediction.top_contributing_features && prediction.top_contributing_features.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Top Model Features</span>
            <span className="text-[10px] font-mono text-slate-500">Gini Influence</span>
          </div>

          <div className="space-y-1.5">
            {prediction.top_contributing_features.map((feat, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-slate-200 block text-[11px]">
                    {feat.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Input: <strong className="text-white">{feat.value}</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">
                    {(feat.importance * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] font-sans text-slate-400 italic pt-1">
            These features were most influential in the trained model's predictions.
          </p>
        </div>
      )}

      {/* Mandatory Benchmark Disclosure Notice */}
      <div className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 text-[10px] text-slate-400 leading-relaxed flex items-start gap-2">
        <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
        <span>
          Prototype ML model trained on a competency-based proxy benchmark. This is not a prediction of actual hiring success.
        </span>
      </div>
    </div>
  );
};
