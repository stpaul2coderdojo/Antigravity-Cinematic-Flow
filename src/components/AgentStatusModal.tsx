import React from 'react';
import { X, Bot, CheckCircle2, Loader2, Sparkles, Terminal, ArrowRight } from 'lucide-react';
import { AgentExecutionStep } from '../types';

interface AgentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: AgentExecutionStep[];
  isGenerating: boolean;
  currentStepMessage?: string;
}

export const AgentStatusModal: React.FC<AgentStatusModalProps> = ({
  isOpen,
  onClose,
  steps,
  isGenerating,
  currentStepMessage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-[#F0F0F0]">
      <div className="bg-[#0F0F12] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                Antigravity Agent Telemetry
                {isGenerating && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    EXECUTING
                  </span>
                )}
              </h3>
              <p className="text-xs text-white/40">
                Agentic narrative reasoning, character cast synthesis, and 10s video prompt deconstruction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/5 text-white/40 hover:text-white flex items-center justify-center transition-colors border border-transparent hover:border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Active Live Status banner if running */}
          {isGenerating && (
            <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/40 flex items-center gap-3 text-xs text-blue-200">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
              <div>
                <p className="font-semibold text-white font-mono uppercase text-[11px]">Antigravity Agent Active</p>
                <p className="text-white/70 text-xs">{currentStepMessage || 'Deconstructing screenplay narrative into 10-second scene matrices...'}</p>
              </div>
            </div>
          )}

          {/* Timeline steps */}
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div
                key={step.id || idx}
                className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                    ) : step.status === 'running' ? (
                      <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-white/30 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-white/90 font-mono">{step.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/30">{new Date(step.timestamp).toLocaleTimeString()}</span>
                </div>

                {/* Log outputs */}
                <div className="pl-6 space-y-1">
                  {step.logs.map((log, logIdx) => (
                    <div key={logIdx} className="flex items-start gap-1.5 text-xs text-white/60 font-mono leading-relaxed">
                      <ArrowRight className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Antigravity capabilities badge info */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs text-white/40 font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>Model: <strong className="text-white/80">antigravity-preview-05-2026</strong></span>
            </div>
            <span className="text-green-400">REMOTE_SANDBOX // READY</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-black/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors border border-white/10"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
