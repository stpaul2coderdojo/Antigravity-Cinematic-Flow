import React from 'react';
import { Film, Sparkles, Play, Layers, Users, Clapperboard, Download, Check, RefreshCw, AlertCircle, RotateCcw } from 'lucide-react';
import { StoryProject } from '../types';

interface NavbarProps {
  project: StoryProject | null;
  activeTab: 'prompt' | 'characters' | 'scenes' | 'flow' | 'player';
  setActiveTab: (tab: 'prompt' | 'characters' | 'scenes' | 'flow' | 'player') => void;
  onOpenAgentLogs: () => void;
  onPlayCinema: () => void;
  onExport: () => void;
  isGeneratingAny: boolean;
  saveStatus?: 'saved' | 'saving' | 'error' | 'idle';
  lastSavedText?: string;
  onResetProject?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  project,
  activeTab,
  setActiveTab,
  onOpenAgentLogs,
  onPlayCinema,
  onExport,
  isGeneratingAny,
  saveStatus = 'saved',
  lastSavedText = 'All changes saved',
  onResetProject,
}) => {
  const totalScenes = project
    ? project.acts.reduce((acc, act) => acc + act.scenes.length, 0)
    : 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050505]/95 backdrop-blur-md border-b border-white/10 text-[#F0F0F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Project Title */}
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#0F0F12] border border-blue-500/40 p-0.5 shadow-[0_0_10px_rgba(59,130,246,0.25)] flex items-center justify-center shrink-0">
              <Film className="w-5 h-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent uppercase">
                  ANTIGRAVITY STUDIO
                </span>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 hidden sm:inline-block">
                  FLOW SYNC
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 truncate max-w-[200px] sm:max-w-xs md:max-w-sm font-mono">
                {project ? project.title : 'POWERED BY GOOGLE FLOW & AGENTS'}
              </p>
            </div>
          </div>

          {/* Mobile Auto-Save Indicator */}
          <div className="md:hidden flex items-center gap-2">
            <span
              className={`text-[9px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                saveStatus === 'saving'
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {saveStatus === 'saving' ? (
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
              ) : (
                <Check className="w-2.5 h-2.5" />
              )}
              <span>{saveStatus === 'saving' ? 'Saving' : 'Saved'}</span>
            </span>
          </div>
        </div>

        {/* Center Navigation Tabs (Bento Style) */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-[#0F0F12] p-1.5 rounded-xl border border-white/10 shadow-inner">
          <button
            id="nav-tab-director"
            onClick={() => setActiveTab('prompt')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'prompt'
                ? 'bg-blue-600 text-white shadow-[0_0_8px_rgba(59,130,246,0.5)] border border-blue-400/40'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            Director
          </button>

          <button
            id="nav-tab-characters"
            disabled={!project}
            onClick={() => setActiveTab('characters')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              !project
                ? 'opacity-30 cursor-not-allowed text-white/30'
                : activeTab === 'characters'
                ? 'bg-blue-600 text-white shadow-[0_0_8px_rgba(59,130,246,0.5)] border border-blue-400/40'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            Characters
            {project && (
              <span className="w-4 h-4 rounded bg-white/10 text-[9px] font-mono flex items-center justify-center text-white/80">
                {project.characters.length}
              </span>
            )}
          </button>

          <button
            id="nav-tab-scenes"
            disabled={!project}
            onClick={() => setActiveTab('scenes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              !project
                ? 'opacity-30 cursor-not-allowed text-white/30'
                : activeTab === 'scenes'
                ? 'bg-blue-600 text-white shadow-[0_0_8px_rgba(59,130,246,0.5)] border border-blue-400/40'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5 text-blue-300" />
            Acts & Scenes
            {project && (
              <span className="w-4 h-4 rounded bg-white/10 text-[9px] font-mono flex items-center justify-center text-white/80">
                {totalScenes}
              </span>
            )}
          </button>

          <button
            id="nav-tab-flow"
            disabled={!project}
            onClick={() => setActiveTab('flow')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              !project
                ? 'opacity-30 cursor-not-allowed text-white/30'
                : activeTab === 'flow'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)] border border-blue-400/40'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-300" />
            Flow Splicer
          </button>

          <button
            id="nav-tab-player"
            disabled={!project}
            onClick={() => setActiveTab('player')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              !project
                ? 'opacity-30 cursor-not-allowed text-white/30'
                : activeTab === 'player'
                ? 'bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.5)] border border-purple-400/40'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current text-purple-300" />
            Master Cinema
          </button>
        </nav>

        {/* Right Status & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Real-Time Auto-Save Status Badge */}
          <div className="hidden sm:flex flex-col items-end pr-1 font-mono">
            <span className="text-[9px] text-white/30 uppercase tracking-wider">Storage State</span>
            <div className="flex items-center gap-1.5 text-[10px]">
              {saveStatus === 'saving' ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              ) : saveStatus === 'error' ? (
                <span className="text-rose-400 flex items-center gap-1" title="Storage limit exceeded">
                  <AlertCircle className="w-3 h-3" />
                  Save Error
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1" title={lastSavedText}>
                  <Check className="w-3 h-3 text-emerald-400" />
                  Auto-saved
                </span>
              )}
            </div>
          </div>

          {project && (
            <button
              id="btn-agent-logs"
              onClick={onOpenAgentLogs}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              title="View Antigravity Agent Execution Timeline"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Agent Steps</span>
            </button>
          )}

          {project && (
            <button
              id="btn-export-project"
              onClick={onExport}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              title="Export Project & Spliced Timeline"
            >
              <Download className="w-3.5 h-3.5 text-white/60" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {onResetProject && (
            <button
              id="btn-reset-project"
              onClick={onResetProject}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 transition-colors"
              title="Reset project to default initial template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {project && (
            <button
              id="btn-master-play"
              onClick={onPlayCinema}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(59,130,246,0.4)] border border-blue-400/40 transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play Flow</span>
            </button>
          )}

          <div className="w-9 h-9 rounded-full border border-white/20 bg-white/5 hidden md:flex items-center justify-center text-xs font-mono font-bold text-white/80">
            AG
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex items-center justify-around px-2 py-1.5 bg-[#0F0F12] border-t border-white/10 text-xs font-mono uppercase">
        <button
          onClick={() => setActiveTab('prompt')}
          className={`py-1 px-2 rounded font-medium ${activeTab === 'prompt' ? 'text-blue-400 bg-white/5 border border-white/10' : 'text-white/50'}`}
        >
          Director
        </button>
        <button
          disabled={!project}
          onClick={() => setActiveTab('characters')}
          className={`py-1 px-2 rounded font-medium ${!project ? 'opacity-30' : activeTab === 'characters' ? 'text-blue-400 bg-white/5 border border-white/10' : 'text-white/50'}`}
        >
          Cast
        </button>
        <button
          disabled={!project}
          onClick={() => setActiveTab('scenes')}
          className={`py-1 px-2 rounded font-medium ${!project ? 'opacity-30' : activeTab === 'scenes' ? 'text-blue-400 bg-white/5 border border-white/10' : 'text-white/50'}`}
        >
          Acts
        </button>
        <button
          disabled={!project}
          onClick={() => setActiveTab('flow')}
          className={`py-1 px-2 rounded font-medium ${!project ? 'opacity-30' : activeTab === 'flow' ? 'text-blue-400 bg-white/5 border border-white/10' : 'text-white/50'}`}
        >
          Flow
        </button>
        <button
          disabled={!project}
          onClick={() => setActiveTab('player')}
          className={`py-1 px-2 rounded font-medium ${!project ? 'opacity-30' : activeTab === 'player' ? 'text-purple-400 bg-white/5 border border-white/10' : 'text-white/50'}`}
        >
          Cinema
        </button>
      </div>
    </header>
  );
};
