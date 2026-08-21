import React, { useState } from 'react';
import { StoryProject, Scene, Act, TransitionType, ColorGrade } from '../types';
import { ActEditorModal } from './ActEditorModal';
import { 
  Layers, 
  Play, 
  Pause, 
  Scissors, 
  Film, 
  Music, 
  Radio, 
  Sparkles, 
  Sliders, 
  Eye, 
  ArrowRight, 
  Check, 
  RotateCcw,
  Palette,
  Maximize2,
  Plus,
  UploadCloud,
  Video,
  Wand2,
  RefreshCw,
  Volume2
} from 'lucide-react';

interface GoogleFlowSplicerProps {
  project: StoryProject;
  onUpdateTransition: (sceneId: string, transition: TransitionType, duration: number) => void;
  onUpdateColorGrade: (colorGrade: ColorGrade) => void;
  onOpenCinemaPlayer: (startSceneIndex?: number) => void;
  onAddAct?: (newAct: Act) => void;
  onOpenUploadActs?: () => void;
  onGenerateVideo?: (sceneId: string) => void;
  onGenerateImage?: (sceneId: string) => void;
  onGenerateAudio?: (sceneId: string) => void;
  onGenerateAllVideos?: () => void;
  onGenerateAllImages?: () => void;
  onGenerateAllAudios?: () => void;
  isGeneratingVideos?: boolean;
  isGeneratingImages?: boolean;
  isGeneratingAudios?: boolean;
}

const COLOR_GRADES: Array<{ id: ColorGrade; label: string; desc: string; preview: string }> = [
  { id: 'standard', label: 'Standard Rec.709', desc: 'Natural cinematic balance', preview: 'from-slate-700 to-slate-900' },
  { id: 'teal-orange', label: 'Teal & Orange Blockbuster', desc: 'Hollywood high dynamic contrast', preview: 'from-teal-600 to-amber-600' },
  { id: 'cyber-neon', label: 'Cyberpunk Neon Matrix', desc: 'Saturated magenta & cyan flares', preview: 'from-fuchsia-600 to-cyan-500' },
  { id: 'noir-monochrome', label: 'Neo-Noir 35mm Grain', desc: 'Deep chiaroscuro shadows', preview: 'from-slate-300 to-slate-950' },
  { id: 'warm-vintage', label: '1970s Technicolor Warm', desc: 'Analog pastel bloom & warmth', preview: 'from-amber-500 to-rose-700' },
  { id: 'bleach-bypass', label: 'Bleach Bypass Silver', desc: 'Desaturated gritty war/thriller look', preview: 'from-zinc-400 to-stone-900' },
];

export const GoogleFlowSplicer: React.FC<GoogleFlowSplicerProps> = ({
  project,
  onUpdateTransition,
  onUpdateColorGrade,
  onOpenCinemaPlayer,
  onAddAct,
  onOpenUploadActs,
  onGenerateVideo,
  onGenerateImage,
  onGenerateAudio,
  onGenerateAllVideos,
  onGenerateAllImages,
  onGenerateAllAudios,
  isGeneratingVideos = false,
  isGeneratingImages = false,
  isGeneratingAudios = false,
}) => {
  // Flatten all scenes in chronological order
  const allScenes: Scene[] = [];
  project.acts.forEach((act) => {
    act.scenes.forEach((scene) => {
      allScenes.push(scene);
    });
  });

  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);
  const [isAddActModalOpen, setIsAddActModalOpen] = useState<boolean>(false);

  const activeScene = allScenes[selectedSceneIndex] || allScenes[0];
  const totalDuration = allScenes.length * 10;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveNewAct = (newAct: Act) => {
    if (onAddAct) {
      onAddAct(newAct);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6 animate-fade-in text-[#F0F0F0]">
      {/* Header & Master Control Bar (Bento style) */}
      <div className="p-5 rounded-2xl bg-[#0F0F12] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                Google Flow Cinema Splicer
                <span className="text-[10px] font-mono font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                  Continuous 10s Timeline
                </span>
              </h2>
              <p className="text-xs text-white/40">
                Non-linear multi-track sequencer splicing {allScenes.length} scenes across {project.acts.length} acts into a continuous narrative reel.
              </p>
            </div>
          </div>
        </div>

        {/* Master Play & Batch Triggers */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onGenerateAllVideos && (
            <button
              id="btn-batch-generate-flow-videos"
              onClick={onGenerateAllVideos}
              disabled={isGeneratingVideos}
              className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-mono font-semibold flex items-center gap-1.5 border border-blue-500/40 transition-all active:scale-95"
              title="Batch generate all 10-second video clips with Gemini Omni & Veo"
            >
              {isGeneratingVideos ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : (
                <Video className="w-3.5 h-3.5 text-blue-400" />
              )}
              <span>Render All 10s Videos</span>
            </button>
          )}

          {onGenerateAllImages && (
            <button
              id="btn-batch-generate-flow-images"
              onClick={onGenerateAllImages}
              disabled={isGeneratingImages}
              className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-mono font-semibold flex items-center gap-1.5 border border-purple-500/40 transition-all active:scale-95"
              title="Batch generate all scene keyframes"
            >
              {isGeneratingImages ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : (
                <Wand2 className="w-3.5 h-3.5 text-purple-400" />
              )}
              <span>All Keyframes</span>
            </button>
          )}

          {onOpenUploadActs && (
            <button
              id="btn-upload-acts-splicer"
              onClick={onOpenUploadActs}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-mono flex items-center gap-1.5 border border-white/10 transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5 text-purple-400" />
              <span>Upload Acts</span>
            </button>
          )}

          <button
            onClick={() => setIsAddActModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-mono flex items-center gap-1.5 border border-white/10 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Act</span>
          </button>

          <div className="text-right hidden sm:block px-2">
            <div className="text-xs font-mono font-bold text-white">
              {formatTime(selectedSceneIndex * 10)} / {formatTime(totalDuration)}
            </div>
            <div className="text-[9px] font-mono text-white/40 uppercase">Total Spliced Runtime</div>
          </div>

          <button
            id="btn-play-flow-sequence"
            onClick={() => onOpenCinemaPlayer(selectedSceneIndex)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_12px_rgba(59,130,246,0.4)] border border-blue-400/40 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Flow</span>
          </button>
        </div>
      </div>

      {/* Interactive Multi-Track Timeline Bento Container */}
      <div className="p-5 rounded-2xl bg-[#0F0F12] border border-white/10 shadow-2xl space-y-4">
        {/* Timeline Header with Time Ruler */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/70 uppercase tracking-wider font-mono">
            <Film className="w-4 h-4 text-blue-400" />
            <span>Multi-Track Flow Sequencer</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-white/40 font-mono">
            <span>Playhead: <strong className="text-blue-400">{formatTime(selectedSceneIndex * 10)}</strong></span>
            <span>•</span>
            <span>Total: <strong className="text-white/80">{totalDuration}s</strong></span>
          </div>
        </div>

        {/* TRACK 1: Video Scene Clips Track */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-white/40 font-mono px-1">
            <span className="flex items-center gap-1.5 text-white/70 uppercase tracking-wider">
              <Film className="w-3.5 h-3.5 text-blue-400" />
              Track 1: 10s Video Clips ({allScenes.length} Segments)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 p-2 rounded-xl bg-black/40 border border-white/5 overflow-x-auto">
            {allScenes.map((scene, idx) => {
              const isSelected = idx === selectedSceneIndex;
              return (
                <button
                  key={scene.id}
                  id={`flow-clip-${scene.id}`}
                  onClick={() => setSelectedSceneIndex(idx)}
                  className={`relative text-left rounded-xl border p-2 transition-all flex flex-col justify-between overflow-hidden group ${
                    isSelected
                      ? 'bg-[#0F0F12] border-blue-400 ring-1 ring-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                      : 'bg-black/60 border-white/5 hover:border-white/20 hover:bg-[#0F0F12]'
                  }`}
                >
                  {/* Thumbnail preview */}
                  <div className="aspect-video w-full rounded-lg bg-black overflow-hidden mb-1.5 relative border border-white/5">
                    {scene.imageUrl ? (
                      <img
                        src={scene.imageUrl}
                        alt={scene.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-mono">
                        10s
                      </div>
                    )}
                    {scene.ispaToken && (
                      <span className="absolute top-1 left-1 px-1 py-0.5 rounded bg-purple-950/90 text-[8px] font-mono font-bold text-purple-300 border border-purple-500/50">
                        {scene.ispaToken}
                      </span>
                    )}
                    <span className="absolute bottom-1 right-1 px-1 rounded bg-black/90 text-[9px] font-mono text-white/60">
                      10.0s
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="font-bold text-blue-400">Act {scene.actNumber} • #{scene.sceneNumber}</span>
                      <span className="text-white/40">{idx * 10}s</span>
                    </div>
                    <p className="text-[11px] font-medium text-white/80 truncate group-hover:text-blue-300">
                      {scene.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* TRACK 2: Transition Connectors Track */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-white/40 font-mono px-1">
            <span className="flex items-center gap-1.5 text-white/70 uppercase tracking-wider">
              <Scissors className="w-3.5 h-3.5 text-purple-400" />
              Track 2: Splice Nodes & Transitions
            </span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/5 overflow-x-auto">
            {allScenes.map((scene, idx) => (
              <div key={scene.id} className="flex items-center gap-2 flex-1 min-w-[120px]">
                <div className="p-2 rounded-lg bg-[#0F0F12] border border-white/10 text-[10px] w-full text-center font-mono">
                  <span className="text-white/40">Clip #{idx + 1}</span>
                  <div className="text-blue-400 font-semibold uppercase mt-0.5">
                    {scene.transition} ({scene.transitionDuration}s)
                  </div>
                </div>
                {idx < allScenes.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* TRACK 3: Dialogue & Voiceover Audio Track */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-white/40 font-mono px-1">
            <span className="flex items-center gap-1.5 text-white/70 uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              Track 3: Dialogue & Voiceover (TTS)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 p-2 rounded-xl bg-black/40 border border-white/5">
            {allScenes.map((scene, idx) => (
              <div
                key={scene.id}
                className="p-2 rounded-lg bg-[#0F0F12] border border-white/10 text-[10px] space-y-1 overflow-hidden"
              >
                <div className="flex items-center justify-between text-purple-400 font-semibold font-mono">
                  <span>{scene.dialogueSpeaker || 'Narration'}</span>
                  {scene.audioUrl && <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_4px_rgba(74,222,128,1)]" />}
                </div>
                <p className="text-white/60 truncate italic">
                  "{scene.dialogueOrVoiceover}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* TRACK 4: Master Color Grading & Look LUT */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between text-[11px] text-white/70 font-mono px-1">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              Master Cinematic Color Grading LUT
            </span>
            <span className="text-white/30 text-[10px]">Applies globally across all spliced 10s scenes</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {COLOR_GRADES.map((grade) => {
              const isSelected = project.colorGrade === grade.id;
              return (
                <button
                  key={grade.id}
                  id={`lut-${grade.id}`}
                  onClick={() => onUpdateColorGrade(grade.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#0F0F12] border-blue-400 ring-1 ring-blue-500/40 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                      : 'bg-black/40 border-white/10 text-white/40 hover:border-white/20 hover:text-white/70'
                  }`}
                >
                  <div className={`h-4 w-full rounded-md bg-gradient-to-r ${grade.preview} mb-1.5 opacity-90`} />
                  <h5 className="text-[11px] font-bold text-white truncate">{grade.label}</h5>
                  <p className="text-[9px] text-white/40 truncate font-mono">{grade.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Scene Transition & Generation Inspector */}
      {activeScene && (
        <div className="p-5 rounded-2xl bg-[#0F0F12] border border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1 max-w-md">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">
                Inspector: Scene #{selectedSceneIndex + 1} ("{activeScene.title}")
              </span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border ${
                activeScene.videoStatus === 'ready'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  : activeScene.videoStatus === 'generating'
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-white/5 text-white/40 border-white/10'
              }`}>
                {activeScene.videoStatus === 'ready' ? '10s Video Ready' : activeScene.videoStatus === 'generating' ? 'Rendering Video...' : 'Video Pending'}
              </span>
            </div>
            <p className="text-xs text-white/60 line-clamp-1">
              {activeScene.actionSummary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Direct 10s Video Generation Button */}
            {onGenerateVideo && (
              <button
                id={`btn-flow-generate-video-${activeScene.id}`}
                onClick={() => onGenerateVideo(activeScene.id)}
                disabled={activeScene.videoStatus === 'generating'}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all active:scale-95 border border-blue-400/40"
                title="Generate 10-second video with Gemini Omni / Veo"
              >
                {activeScene.videoStatus === 'generating' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <Video className="w-3.5 h-3.5 text-white" />
                )}
                <span>{activeScene.videoStatus === 'ready' ? 'Re-roll 10s Video' : 'Render 10s Video'}</span>
              </button>
            )}

            {/* Direct Keyframe Generation Button */}
            {onGenerateImage && (
              <button
                id={`btn-flow-generate-image-${activeScene.id}`}
                onClick={() => onGenerateImage(activeScene.id)}
                disabled={activeScene.isGeneratingImage}
                className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-mono font-semibold flex items-center gap-1.5 border border-purple-500/40 transition-colors"
                title="Synthesize 10s Keyframe Image"
              >
                {activeScene.isGeneratingImage ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                )}
                <span>Keyframe</span>
              </button>
            )}

            {/* Direct Dialogue TTS Generation Button */}
            {onGenerateAudio && activeScene.dialogueOrVoiceover && (
              <button
                id={`btn-flow-generate-audio-${activeScene.id}`}
                onClick={() => onGenerateAudio(activeScene.id)}
                disabled={activeScene.isGeneratingAudio}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs font-mono flex items-center gap-1.5 border border-white/10 transition-colors"
                title="Synthesize dialogue TTS audio"
              >
                {activeScene.isGeneratingAudio ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span>TTS Voice</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
              <label className="text-[10px] text-white/40 font-mono uppercase">Transition:</label>
              <select
                value={activeScene.transition}
                onChange={(e) => onUpdateTransition(activeScene.id, e.target.value as TransitionType, activeScene.transitionDuration)}
                className="px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white/80 text-xs focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="crossfade" className="bg-[#0F0F12]">Crossfade (Blend)</option>
                <option value="dissolve" className="bg-[#0F0F12]">Dissolve (Soft)</option>
                <option value="fade-to-black" className="bg-[#0F0F12]">Fade to Black</option>
                <option value="whip-pan" className="bg-[#0F0F12]">Whip Pan (Fast)</option>
                <option value="cut" className="bg-[#0F0F12]">Hard Cut</option>
                <option value="glitch" className="bg-[#0F0F12]">Cyber Glitch</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-[10px] text-white/40 font-mono uppercase">Duration:</label>
              <select
                value={activeScene.transitionDuration}
                onChange={(e) => onUpdateTransition(activeScene.id, activeScene.transition, Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white/80 text-xs focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value={0.5} className="bg-[#0F0F12]">0.5s</option>
                <option value={1.0} className="bg-[#0F0F12]">1.0s</option>
                <option value={1.5} className="bg-[#0F0F12]">1.5s</option>
                <option value={2.0} className="bg-[#0F0F12]">2.0s</option>
              </select>
            </div>

            <button
              onClick={() => onOpenCinemaPlayer(selectedSceneIndex)}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs font-mono uppercase flex items-center gap-1.5 transition-colors border border-white/10"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Preview #{selectedSceneIndex + 1}</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Act Modal in Splicer */}
      <ActEditorModal
        isOpen={isAddActModalOpen}
        onClose={() => setIsAddActModalOpen(false)}
        act={null}
        actCount={project.acts.length}
        onSave={handleSaveNewAct}
      />
    </div>
  );
};
