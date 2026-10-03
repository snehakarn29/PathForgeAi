import React from 'react';
import { X, Calculator, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { ResilienceAnalysis } from '../types/resilience.ts';

interface FormulaExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: ResilienceAnalysis;
}

export const FormulaExplainerModal: React.FC<FormulaExplainerModalProps> = ({
  isOpen,
  onClose,
  analysis
}) => {
  if (!isOpen) return null;

  const f = analysis.factors;
  const weights = analysis.scoringWeights;

  const items = [
    {
      name: 'Market Demand',
      weight: weights.marketDemand,
      score: f.marketDemand.score,
      contribution: f.marketDemand.contribution,
      formulaNote: 'Local/Global vacancy frequency blended with taxonomy baseline'
    },
    {
      name: 'Transferability',
      weight: weights.transferability,
      score: f.transferability.score,
      contribution: f.transferability.contribution,
      formulaNote: 'Mean cross-occupational portability score (ESCO/O*NET mapping)'
    },
    {
      name: 'AI Exposure Resilience',
      weight: weights.aiExposure,
      score: f.aiExposure.score,
      contribution: f.aiExposure.contribution,
      formulaNote: 'Inverted automation exposure: 100 - Avg(Skill AI Exposure)'
    },
    {
      name: 'Skill Breadth',
      weight: weights.skillBreadth,
      score: f.skillBreadth.score,
      contribution: f.skillBreadth.contribution,
      formulaNote: 'Coverage across distinct domains (Backend, Cloud, AI, Database, etc.)'
    },
    {
      name: 'Emerging Skill Alignment',
      weight: weights.emergingAlignment,
      score: f.emergingAlignment.score,
      contribution: f.emergingAlignment.contribution,
      formulaNote: 'Presence and depth in frontier technology (GenAI, RAG, MLOps, Rust)'
    }
  ];

  const totalSum = items.reduce((acc, item) => acc + item.contribution, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Deterministic Resilience Formula</h3>
            <p className="text-xs text-slate-400 font-mono">Algorithm: {analysis.provenance.algorithmVersion}</p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl mb-5 font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto">
          <code>
            Resilience = (30% × Market Demand) + (25% × Transferability) + (20% × AI Exposure Resilience) + (15% × Skill Breadth) + (10% × Emerging Alignment)
          </code>
        </div>

        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Calculated Contributions</h4>
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-750 text-xs"
            >
              <div>
                <span className="font-semibold text-slate-200">{item.name}</span>
                <span className="text-slate-400 ml-2 font-mono">({Math.round(item.weight * 100)}% wt)</span>
                <div className="text-[11px] text-slate-400 mt-0.5">{item.formulaNote}</div>
              </div>
              <div className="text-right font-mono">
                <span className="text-slate-300">{item.score} × {item.weight.toFixed(2)}</span>
                <span className="text-cyan-400 font-bold ml-2"> = +{item.contribution.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total Summary */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-slate-900 border border-cyan-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Exact Sum</span>
            <div className="text-sm font-mono text-slate-300">
              {items.map(i => i.contribution.toFixed(1)).join(' + ')} = {totalSum.toFixed(1)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Final Resilience Score</span>
            <div className="text-2xl font-bold font-mono text-cyan-400">
              {analysis.overallScore} <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Strict zero-hallucination guarantee: Gemini is never allowed to directly assign this numerical score. All calculations are 100% reproducible and verifiable.
          </span>
        </div>
      </div>
    </div>
  );
};
