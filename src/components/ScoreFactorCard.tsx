import React from 'react';
import { FactorScoreDetail } from '../types/resilience.ts';
import { ShieldCheck, Info, Clock, CheckCircle2 } from 'lucide-react';

interface ScoreFactorCardProps {
  title: string;
  factor: FactorScoreDetail;
  icon?: React.ReactNode;
  invertColor?: boolean;
}

export const ScoreFactorCard: React.FC<ScoreFactorCardProps> = ({
  title,
  factor,
  icon
}) => {
  const percentWeight = Math.round(factor.weight * 100);

  // Determine indicator color based on score
  let scoreColor = 'text-emerald-400';
  let barColor = 'bg-emerald-500';
  if (factor.score < 50) {
    scoreColor = 'text-rose-400';
    barColor = 'bg-rose-500';
  } else if (factor.score < 75) {
    scoreColor = 'text-amber-400';
    barColor = 'bg-amber-500';
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg backdrop-blur-sm">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-800/80 text-cyan-400 border border-slate-750">
              {icon || <ShieldCheck className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
              <p className="text-xs text-slate-400">Weight: {percentWeight}%</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold font-mono tracking-tight ${scoreColor}`}>
              {factor.score}
            </span>
            <span className="text-xs text-slate-400">/100</span>
            <div className="text-[11px] font-mono text-cyan-400/90">
              +{factor.contribution.toFixed(1)} pts
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${Math.min(100, factor.score)}%` }}
          />
        </div>

        {/* Evidence Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-3 bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
          {factor.evidence}
        </p>
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="truncate max-w-[200px]" title={factor.source}>
          {factor.source}
        </span>
        <span className="flex items-center gap-1 font-mono text-slate-400 shrink-0">
          <Clock className="w-3 h-3 text-slate-400" />
          {new Date(factor.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
};
