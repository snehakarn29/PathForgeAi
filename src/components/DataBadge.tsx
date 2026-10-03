import React from 'react';
import { Database, Wifi, ShieldAlert, Clock, Sparkles } from 'lucide-react';

interface DataBadgeProps {
  status?: 'live' | 'cached' | 'demo' | 'fallback' | 'not_configured';
  timestamp?: string;
  source?: string;
  sampleSize?: number;
  className?: string;
}

export const DataBadge: React.FC<DataBadgeProps> = ({
  status = 'not_configured',
  timestamp,
  source,
  sampleSize,
  className = ''
}) => {
  let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
  let icon = <Database className="w-3.5 h-3.5" />;
  let label = 'NOT CONFIGURED';

  if (status === 'live') {
    badgeStyle = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-900/20';
    icon = <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />;
    label = 'LIVE MARKET DATA';
  } else if (status === 'cached') {
    badgeStyle = 'bg-amber-950/70 text-amber-300 border-amber-500/40';
    icon = <Clock className="w-3.5 h-3.5 text-amber-400" />;
    label = 'CACHED MARKET DATA';
  } else if (status === 'demo') {
    badgeStyle = 'bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-sm shadow-purple-900/20';
    icon = <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
    label = 'DEMO / PROTOTYPE DATA';
  } else if (status === 'fallback') {
    badgeStyle = 'bg-yellow-950/80 text-yellow-300 border-yellow-500/40';
    icon = <ShieldAlert className="w-3.5 h-3.5 text-yellow-400" />;
    label = 'FALLBACK EXTRACTION';
  }

  const tooltipParts: string[] = [];
  if (source) tooltipParts.push(`Source: ${source}`);
  if (sampleSize) tooltipParts.push(`Sample: ${sampleSize} jobs`);
  if (timestamp) tooltipParts.push(`Retrieved: ${new Date(timestamp).toLocaleString()}`);

  const tooltip = tooltipParts.join(' • ');

  return (
    <div
      title={tooltip || label}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border cursor-help transition-all ${badgeStyle} ${className}`}
    >
      {icon}
      <span>{label}</span>
      {sampleSize !== undefined && sampleSize > 0 && (
        <span className="opacity-75 font-normal text-[11px]">({sampleSize} jobs)</span>
      )}
    </div>
  );
};
