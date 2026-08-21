import React, { useState } from 'react';
import { Sparkles, Wand2, Film, Layers, PlayCircle, Palette, BookmarkCheck, ArrowRight, RefreshCw, Radio, CheckCircle2 } from 'lucide-react';
import { PRESET_STORIES } from '../data/presets';
import { PresetStory } from '../types';

interface StoryPromptBarProps {
  onGenerate: (prompt: string, visualStyle: string, genre: string, targetActs: number, scenesPerAct: number) => void;
  isGenerating: boolean;
}

const VISUAL_STYLES = [
  'Cinematic Anamorphic 35mm, Rain-soaked Neon reflections, volumetric smog, high dynamic range',
  '70mm Panavision Cosmic Realism, Kubrick Symmetry, Lens Flare, Zero-G Dust, Photorealistic',
  'Deep Bioluminescent Underwater Photorealism, Cyan Abyss, Particle Haze, Volumetric Caustics',
  'Dark Fantasy Chiaroscuro, Gothic Candlelight, Volumetric Fog, Rembrandt Lighting',
  'Vintage 1970s Technicolor, Warm Nostalgic Grain, Analog Soft Bloom, Pastel Color Grading',
  'Hyper-realistic Unreal Engine 5.4, Nanite Geometry, Ray-traced Reflections, 8K Octane Render',
];

const GENRES = [
  'Cyberpunk Noir Sci-Fi',
  'Deep Ocean Sci-Fi Thriller',
  'Cosmic Space Opera',
  'Steampunk Fantasy Myth',
  'Neo-Western Action Mystery',
  'Psychological Drama / Mystery',
];

export const StoryPromptBar: React.FC<StoryPromptBarProps> = ({
  onGenerate,
  isGenerating,
}) => {
  const [prompt, setPrompt] = useState(PRESET_STORIES[0].prompt);
  const [selectedStyle, setSelectedStyle] = useState(VISUAL_STYLES[0]);
  const [customStyle, setCustomStyle] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(GENRES[0]);
  const [targetActs, setTargetActs] = useState(3);
  const [scenesPerAct, setScenesPerAct] = useState(2);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_STORIES[0].id);

  const handleSelectPreset = (preset: PresetStory) => {
    setSelectedPresetId(preset.id);
    setPrompt(preset.prompt);
    setSelectedGenre(preset.genre);
    setSelectedStyle(preset.visualStyle);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    const finalStyle = customStyle.trim() || selectedStyle;
    onGenerate(prompt, finalStyle, selectedGenre, targetActs, scenesPerAct);
  };

  const totalDuration = targetActs * scenesPerAct * 10;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6 animate-fade-in text-[#F0F0F0]">
      {/* Bento Grid Top Row: Hero Banner & Engine Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Header Bento Card (col-span-8) */}
        <div className="lg:col-span-8 bg-[#0F0F12] border border-white/10 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-xl">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">
                GOOGLE ANTIGRAVITY AGENTS // NARRATIVE DECONSTRUCTOR
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              ANTIGRAVITY CINEMA FORGE
            </h1>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-2xl">
              Deconstruct natural language screenplays into structured character profiles, episodic acts, 10-second scene prompts for Omni/Veo, and continuous Google Flow spliced sequences.
            </p>
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-wrap items-center gap-4 text-[10px] font-mono text-white/40">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Sparkles className="w-3 h-3" /> Antigravity Agent Remote Sandbox
            </span>
            <span>•</span>
            <span className="text-green-400">Gemini Omni Flash 10s Video</span>
            <span>•</span>
            <span className="text-purple-400">Google Flow Splicer</span>
          </div>
        </div>

        {/* Engine Telemetry Bento Card (col-span-4) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">
                Google Flow Splicer
              </h2>
              <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                READY
              </span>
            </div>
            <p className="text-[10px] text-white/60 leading-relaxed">
              Automated transition logic using Antigravity interpolation. Seamlessly blending 10-second segments into a cohesive narrative arc.
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-white/40">Target Timeline Duration</span>
              <span className="text-blue-400 font-bold">{totalDuration}.00s ({targetActs} Acts)</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            </div>
            <div className="flex justify-between text-[9px] text-white/30 font-mono">
              <span>{targetActs * scenesPerAct} Clips @ 10.0s</span>
              <span>100% Flow Synchronized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Story Cards Bento Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/60 flex items-center gap-1.5 font-mono">
            <BookmarkCheck className="w-3.5 h-3.5 text-blue-400" />
            Screenplay Archetype Presets
          </h2>
          <span className="text-[10px] text-white/30 font-mono">Select a blueprint or compose below</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_STORIES.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                id={`preset-${preset.id}`}
                onClick={() => handleSelectPreset(preset)}
                className={`relative text-left p-4 rounded-2xl border transition-all duration-200 group overflow-hidden ${
                  isSelected
                    ? 'bg-[#0F0F12] border-blue-500/80 ring-1 ring-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                    : 'bg-[#0F0F12]/80 border-white/5 hover:border-white/20 hover:bg-[#0F0F12]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-400">
                      {preset.genre.split(' ')[0]}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,1)]" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                    {preset.title}
                  </h4>
                  <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">
                    {preset.logline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Director Form Bento Card */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#0F0F12] border border-white/10 shadow-2xl space-y-5">
        {/* Story Text Prompt Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/60 flex items-center gap-1.5 font-mono">
              <Film className="w-3.5 h-3.5 text-blue-400" />
              Screenplay Narrative & Text Prompt
            </h2>
            <span className="text-[10px] text-white/40 font-mono">Antigravity Agent synthesizes cast, acts & 10s video prompts</span>
          </div>
          <textarea
            id="story-prompt"
            rows={4}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setSelectedPresetId('');
            }}
            placeholder="Describe the premise, characters, dramatic dilemma, climax, and setting..."
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 text-xs sm:text-sm leading-relaxed transition-all resize-y font-sans"
          />
        </div>

        {/* Configuration Row: Genre, Visual Style, Acts & Scenes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Genre */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60 flex items-center gap-1.5 font-mono">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Genre Blueprint
            </label>
            <select
              id="genre-select"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white/80 text-xs focus:outline-none focus:border-blue-500"
            >
              {GENRES.map((g) => (
                <option key={g} value={g} className="bg-[#0F0F12] text-white">{g}</option>
              ))}
            </select>
          </div>

          {/* Visual Aesthetic */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60 flex items-center gap-1.5 font-mono">
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              Cinematic Visual Aesthetic
            </label>
            <select
              id="style-select"
              value={selectedStyle}
              onChange={(e) => {
                setSelectedStyle(e.target.value);
                setCustomStyle('');
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white/80 text-xs focus:outline-none focus:border-blue-500 truncate"
            >
              {VISUAL_STYLES.map((st, i) => (
                <option key={i} value={st} className="bg-[#0F0F12] text-white">{st.slice(0, 50)}...</option>
              ))}
            </select>
          </div>

          {/* Act & Scene Structure Matrix */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60 flex items-center justify-between font-mono">
              <span className="flex items-center gap-1.5">
                <PlayCircle className="w-3.5 h-3.5 text-green-400" />
                Structure ({totalDuration}s / {Math.floor(totalDuration / 60)}m {totalDuration % 60}s)
              </span>
              <span className="text-[10px] text-blue-400 font-bold">
                {targetActs * scenesPerAct} x 10s Clips
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[9px] text-white/40 font-mono block">Acts Count</span>
                <select
                  id="target-acts-select"
                  value={targetActs}
                  onChange={(e) => setTargetActs(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white/80 text-xs focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value={1} className="bg-[#0F0F12] text-white">1 Act (Short)</option>
                  <option value={2} className="bg-[#0F0F12] text-white">2 Acts</option>
                  <option value={3} className="bg-[#0F0F12] text-white">3 Acts (Classic)</option>
                  <option value={4} className="bg-[#0F0F12] text-white">4 Acts</option>
                  <option value={5} className="bg-[#0F0F12] text-white">5 Acts (10-Min Movie)</option>
                  <option value={6} className="bg-[#0F0F12] text-white">6 Acts</option>
                  <option value={8} className="bg-[#0F0F12] text-white">8 Acts</option>
                  <option value={10} className="bg-[#0F0F12] text-white">10 Acts</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-white/40 font-mono block">10s Prompts / Act</span>
                <select
                  id="scenes-per-act-select"
                  value={scenesPerAct}
                  onChange={(e) => setScenesPerAct(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white/80 text-xs focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value={1} className="bg-[#0F0F12] text-white">1 Clip / Act (10s)</option>
                  <option value={2} className="bg-[#0F0F12] text-white">2 Clips / Act (20s)</option>
                  <option value={3} className="bg-[#0F0F12] text-white">3 Clips / Act (30s)</option>
                  <option value={4} className="bg-[#0F0F12] text-white">4 Clips / Act (40s)</option>
                  <option value={6} className="bg-[#0F0F12] text-white">6 Clips / Act (60s / 1m)</option>
                  <option value={8} className="bg-[#0F0F12] text-white">8 Clips / Act (80s)</option>
                  <option value={10} className="bg-[#0F0F12] text-white">10 Clips / Act (100s)</option>
                  <option value={12} className="bg-[#0F0F12] text-white">12 Clips / Act (120s / 2m)</option>
                  <option value={16} className="bg-[#0F0F12] text-white">16 Clips / Act (160s)</option>
                  <option value={20} className="bg-[#0F0F12] text-white">20 Clips / Act (200s)</option>
                  <option value={30} className="bg-[#0F0F12] text-white">30 Clips / Act (300s / 5m)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-white/50 flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
            <span>Target Output: <strong>{targetActs} Acts</strong>, <strong>{targetActs * scenesPerAct} x 10s Video Clips</strong>, Flow Sequencer</span>
          </div>

          <button
            type="submit"
            id="btn-invoke-antigravity"
            disabled={isGenerating || !prompt.trim()}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl ${
              isGenerating
                ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50 cursor-wait'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)] border border-blue-400/40 active:scale-98'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-blue-300" />
                <span>Antigravity Agent Reasoning...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-blue-300" />
                <span>Invoke Antigravity Agent</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
