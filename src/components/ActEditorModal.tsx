import React, { useState } from 'react';
import { Act } from '../types';
import { X, Layers, Trash2, Check } from 'lucide-react';

interface ActEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  act: Act | null; // null means adding a new Act
  actCount: number;
  onSave: (act: Act) => void;
  onDelete?: (actId: string) => void;
}

export const ActEditorModal: React.FC<ActEditorModalProps> = ({
  isOpen,
  onClose,
  act,
  actCount,
  onSave,
  onDelete,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(act?.title || `Act ${actCount + 1}: The Turning Point`);
  const [dramaticPurpose, setDramaticPurpose] = useState(
    act?.dramaticPurpose || 'Establish escalating stakes and push characters toward crucial choices.'
  );
  const [summary, setSummary] = useState(
    act?.summary || 'The narrative deepens as new challenges and revelations unfold.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updated: Act = {
      id: act?.id || `act-${Date.now()}`,
      actNumber: act?.actNumber || actCount + 1,
      title: title.trim(),
      dramaticPurpose: dramaticPurpose.trim(),
      summary: summary.trim(),
      scenes: act?.scenes || [],
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#0F0F12] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                {act ? `Edit Act ${act.actNumber}` : `Create Act ${actCount + 1}`}
              </h3>
              <p className="text-[11px] text-white/40 font-mono">
                Configure dramatic arc purpose & pacing summary
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
              Act Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Act 2: The Rising Pursuit"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
              Dramatic Purpose
            </label>
            <textarea
              rows={2}
              value={dramaticPurpose}
              onChange={(e) => setDramaticPurpose(e.target.value)}
              placeholder="What narrative shift or emotional stake does this Act accomplish?"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
              Act Narrative Summary
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Overview of the key events occurring across the 10-second scene sequences in this act..."
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
          {act && onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete ${act.title} and all its scenes?`)) {
                  onDelete(act.id);
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono flex items-center gap-1.5 border border-red-500/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Act</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-mono transition-colors border border-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(59,130,246,0.4)] border border-blue-400/40"
            >
              <Check className="w-4 h-4" />
              <span>{act ? 'Save Act' : 'Add Act'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
