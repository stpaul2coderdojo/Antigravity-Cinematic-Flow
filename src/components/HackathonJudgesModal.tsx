import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  Bot, 
  Film, 
  Layers, 
  Volume2, 
  Sliders, 
  Cpu, 
  Video, 
  ExternalLink, 
  CheckCircle2, 
  X, 
  ChevronRight,
  Play,
  Share2,
  Code2,
  Zap,
  Info
} from 'lucide-react';
import { StoryProject } from '../types';

interface HackathonJudgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPreset: (presetId: string) => void;
  onOpenCinema: () => void;
  onOpenExportVideo: () => void;
  project: StoryProject | null;
}

export const HackathonJudgesModal: React.FC<HackathonJudgesModalProps> = ({
  isOpen,
  onClose,
  onLoadPreset,
  onOpenCinema,
  onOpenExportVideo,
  project,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'rubric' | 'tour'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-[#F0F0F0]">
      <div className="relative w-full max-w-5xl bg-[#0B0B0E] border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Hackathon Banner */}
        <div className="bg-gradient-to-r from-amber-950/80 via-purple-950/80 to-blue-950/80 border-b border-amber-500/30 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold tracking-widest uppercase">
                  Agentic Cinema Devpost Hackathon 2026
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono">
                  Judges Interactive Hub
                </span>
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                Antigravity Cinematic Flow Studio
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/10 bg-white/[0.01]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            1. Executive Overview
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'architecture'
                ? 'border-blue-400 text-blue-300 bg-blue-500/10'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-4 h-4" />
            2. Multi-Agent & Model Architecture
          </button>

          <button
            onClick={() => setActiveTab('rubric')}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'rubric'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            3. Judging Rubric Alignment
          </button>

          <button
            onClick={() => setActiveTab('tour')}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'tour'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Play className="w-4 h-4" />
            4. Instant 1-Click Judge Tour
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-white/80">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-black to-blue-500/10 border border-amber-500/20">
                <h3 className="text-base font-bold text-white uppercase font-mono flex items-center gap-2">
                  <Film className="w-5 h-5 text-amber-400" />
                  What is Antigravity Cinematic Flow?
                </h3>
                <p className="mt-2 text-white/70 leading-relaxed text-sm">
                  <strong>Antigravity Cinematic Flow</strong> is a comprehensive agentic video production suite designed to solve the fundamental problem of AI video today: <span className="text-amber-300">narrative discontinuity</span>. Instead of generating isolated 4-second video clips with random styles, our autonomous swarm of Google Antigravity agents orchestrates a complete <strong>3-Act cinematic screenplay</strong>, designs persistent character identities with <strong>Nano Banana</strong>, voices dynamic dialogue via <strong>Gemini TTS</strong>, and splices continuous <strong>10-second scene units</strong> on the <strong>Google Flow Multi-Track Timeline</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="p-2 w-fit rounded-lg bg-blue-500/20 text-blue-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white font-mono text-xs uppercase">Autonomous Multi-Agent Swarm</h4>
                  <p className="text-xs text-white/60">
                    4 specialized agents work in sequence: Narrative Reasoner (3-Act structure), Character Forge (psychology/visual traits), 10s Scene Framer (cinematography), and Continuity Supervisor.
                  </p>
                </div>

                <div className="grid-card p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="p-2 w-fit rounded-lg bg-purple-500/20 text-purple-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white font-mono text-xs uppercase">Google Flow Timeline Splicer</h4>
                  <p className="text-xs text-white/60">
                    Precision 10-second continuous scene segments with smooth crossfade, whip-pan, and hard-cut transitions, real-time LUT color grading, and speed ramping.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="p-2 w-fit rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Video className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white font-mono text-xs uppercase">MP4 Master & 21:9 Cinema HUD</h4>
                  <p className="text-xs text-white/60">
                    Full-featured 21:9 anamorphic theater mode with simulated camera telemetry, live audio waveforms, and browser-side MP4 marketing trailer rendering.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-6 animate-fade-in font-mono text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/60 border border-blue-500/30 space-y-3">
                  <div className="text-blue-400 font-bold uppercase flex items-center gap-2 text-sm">
                    <Cpu className="w-4 h-4" /> Google AI & GenAI Stack
                  </div>
                  <ul className="space-y-2 text-white/70">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">•</span>
                      <span><strong>Gemini 3.7 Flash:</strong> High-speed structured story reasoning, 3-Act generation, character depth matrices, and prompt expansion.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span><strong>Nano Banana (gemini-3.1-flash-image / imagen-3.0):</strong> High-fidelity character portraits, lighting consistency, and scene keyframes.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span><strong>Google Veo:</strong> 10-second cinematic video clip generation with continuous camera motions and lighting prompts.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span><strong>Gemini Speech (TTS):</strong> Expressive character voice auditions and packaged dialogue audio streams (24kHz PCM-to-WAV).</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-purple-500/30 space-y-3">
                  <div className="text-purple-400 font-bold uppercase flex items-center gap-2 text-sm">
                    <Code2 className="w-4 h-4" /> Client & Video Pipeline
                  </div>
                  <ul className="space-y-2 text-white/70">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span><strong>React 19 & TypeScript:</strong> Modern component hierarchy, memoized playback engine, and reactive agent state.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">•</span>
                      <span><strong>Tailwind CSS & Motion:</strong> High-contrast cinematic dark UI, fluid transitions, and responsive HUD overlays.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span><strong>Canvas & MediaRecorder:</strong> Client-side real-time rendering of 1080p MP4 marketing reels with Web Audio API sound synthesis.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span><strong>Zero Data Loss Persistence:</strong> Structured JSON exports, localStorage caching, and full import capabilities.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="text-white font-bold uppercase text-xs mb-2">Agent Workflow Sequence</div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/60">
                  <span className="px-2.5 py-1 rounded bg-blue-950 text-blue-300 border border-blue-500/40">1. User Logline Prompt</span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                  <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/40">2. Narrative Reasoner (3 Acts)</span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                  <span className="px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-500/40">3. Character Forge & Nano Banana</span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                  <span className="px-2.5 py-1 rounded bg-pink-950 text-pink-300 border border-pink-500/40">4. 10s Scene Framer & Veo Prompts</span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                  <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">5. Google Flow Splicer & 21:9 Cinema</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RUBRIC */}
          {activeTab === 'rubric' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase font-mono">
                    <CheckCircle2 className="w-4 h-4" /> Agent Autonomy & Depth
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    Rather than a passive wrapper, the system deploys an active multi-agent pipeline with step-by-step reasoning logs, automatic prompt expansion for Veo & Nano Banana, and autonomous character dialogue synthesis.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-blue-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold uppercase font-mono">
                    <CheckCircle2 className="w-4 h-4" /> Real-World Filmmaking Utility
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    Provides true editorial control: users can swap color LUTs, adjust transition types between 10-second segments, edit character psychological traits, and export the final project as JSON or MP4.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-purple-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold uppercase font-mono">
                    <CheckCircle2 className="w-4 h-4" /> Multi-Modal Integration
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    Seamlessly fuses Text (Gemini 3.7 Flash screenplay), Image (Nano Banana portraits), Video (Veo 10-second cinematic scenes), and Audio (Gemini TTS voices & synthesized trailer scores).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold uppercase font-mono">
                    <CheckCircle2 className="w-4 h-4" /> Polish & Craftsmanship
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    Zero placeholder text, crisp mathematical layout hierarchy, anti-slop dark cinema aesthetic, 21:9 anamorphic playback, and instant 1-click preset story loading for seamless judge evaluation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: JUDGE TOUR */}
          {activeTab === 'tour' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40">
                <h4 className="font-bold text-white font-mono text-sm uppercase flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Quick Evaluation Shortcuts for Judges
                </h4>
                <p className="text-xs text-white/60 mt-1">
                  Evaluate the full capabilities in seconds using these pre-configured workflows:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    onLoadPreset('gharial-ispa-symphony');
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-white/5 hover:bg-emerald-950/40 border border-white/10 hover:border-emerald-500 text-left transition-all group"
                >
                  <div className="text-xs font-bold font-mono text-emerald-300 group-hover:text-emerald-200">
                    1. Load Gharial ISPA Wildlife
                  </div>
                  <div className="text-[11px] text-white/50 mt-1">
                    "Gharial ISPA Sandbar Symphony" – 3 Acts, 3 Characters, 6 scenes with authentic acoustic phonetics.
                  </div>
                </button>

                <button
                  onClick={() => {
                    onLoadPreset('cyberpunk-neon-drifter');
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-white/5 hover:bg-blue-950/40 border border-white/10 hover:border-blue-500 text-left transition-all group"
                >
                  <div className="text-xs font-bold font-mono text-blue-300 group-hover:text-blue-200">
                    2. Load Cyberpunk Noir
                  </div>
                  <div className="text-[11px] text-white/50 mt-1">
                    "Neon Drift: Echoes of Sector 9" – Anamorphic neon, cybernetic detective arc.
                  </div>
                </button>

                <button
                  onClick={() => {
                    onLoadPreset('solar-odyssey-chronicles');
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-white/5 hover:bg-amber-950/40 border border-white/10 hover:border-amber-500 text-left transition-all group"
                >
                  <div className="text-xs font-bold font-mono text-amber-300 group-hover:text-amber-200">
                    3. Load Space Opera
                  </div>
                  <div className="text-[11px] text-white/50 mt-1">
                    "Solaris Reach" – 70mm Panavision cosmic scale and photon sails.
                  </div>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenCinema();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Launch 21:9 Master Cinema
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenExportVideo();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all"
                >
                  <Video className="w-4 h-4" />
                  Render & Download MP4 Trailer
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div className="text-xs font-mono text-white/40 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Google Antigravity & Agentic Cinema Submission 2026</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Close Guide & Explore App
          </button>
        </div>

      </div>
    </div>
  );
};
