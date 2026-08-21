import React, { useState, useEffect } from 'react';
import { Scene, TransitionType } from '../types';
import { 
  Clapperboard, 
  Video, 
  Image as ImageIcon, 
  Volume2, 
  Wand2, 
  RefreshCw, 
  Play, 
  Pause, 
  Eye, 
  Sparkles, 
  Camera, 
  SunMedium, 
  Radio, 
  Layers,
  Edit2,
  Trash2,
  Film,
  Sliders,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';

interface SceneCardProps {
  scene: Scene;
  actTitle: string;
  onGenerateImage: (sceneId: string) => void;
  onGenerateVideo: (sceneId: string) => void;
  onGenerateAudio: (sceneId: string) => void;
  onUpdateTransition: (sceneId: string, transition: TransitionType, duration: number) => void;
  onPreviewScene: (scene: Scene) => void;
  onEditScene?: (scene: Scene) => void;
  onDeleteScene?: (sceneId: string) => void;
  onUpdateVideoPrompt?: (sceneId: string, newPrompt: string) => void;
}

const TRANSITIONS: Array<{ type: TransitionType; label: string }> = [
  { type: 'crossfade', label: 'Crossfade' },
  { type: 'dissolve', label: 'Dissolve' },
  { type: 'fade-to-black', label: 'Fade to Black' },
  { type: 'whip-pan', label: 'Whip Pan' },
  { type: 'cut', label: 'Hard Cut' },
  { type: 'glitch', label: 'Cyber Glitch' },
];

const PROMPT_TAGS = {
  camera: [
    '35mm anamorphic push-in',
    'Sweeping 360 crane orbit',
    'Low-angle tracking shot',
    'Extreme macro rack focus',
    'Shoulder-mount handheld dolly',
  ],
  lighting: [
    'Volumetric neon reflections',
    'Golden hour rim light',
    'Moody chiaroscuro shadows',
    'Atmospheric cyan haze',
  ],
  dynamics: [
    '60fps fluid motion',
    '120fps slow-motion rain',
    'Continuous 10s uncut shot',
    'Hyper-detailed particle drift',
  ],
};

export const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  actTitle,
  onGenerateImage,
  onGenerateVideo,
  onGenerateAudio,
  onUpdateTransition,
  onPreviewScene,
  onEditScene,
  onDeleteScene,
  onUpdateVideoPrompt,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElem, setAudioElem] = useState<HTMLAudioElement | null>(null);
  const [isPromptStudioOpen, setIsPromptStudioOpen] = useState(false);
  const [editablePrompt, setEditablePrompt] = useState(scene.videoPrompt);
  const [isPromptSaved, setIsPromptSaved] = useState(false);

  // 10s video scrubbing preview simulator
  const [isPlaying10sPreview, setIsPlaying10sPreview] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);

  useEffect(() => {
    setEditablePrompt(scene.videoPrompt);
  }, [scene.videoPrompt]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying10sPreview) {
      interval = setInterval(() => {
        setPreviewProgress((prev) => {
          if (prev >= 10) {
            setIsPlaying10sPreview(false);
            return 0;
          }
          return Number((prev + 0.1).toFixed(1));
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying10sPreview]);

  const toggleAudio = () => {
    if (!scene.audioUrl) {
      onGenerateAudio(scene.id);
      return;
    }

    if (isPlayingAudio && audioElem) {
      audioElem.pause();
      setIsPlayingAudio(false);
    } else {
      const audio = new Audio(scene.audioUrl);
      setAudioElem(audio);
      audio.play();
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
    }
  };

  const handleSavePrompt = () => {
    if (onUpdateVideoPrompt) {
      onUpdateVideoPrompt(scene.id, editablePrompt);
      setIsPromptSaved(true);
      setTimeout(() => setIsPromptSaved(false), 2000);
    }
  };

  const addPromptTag = (tag: string) => {
    const updated = editablePrompt ? `${editablePrompt}, ${tag}` : tag;
    setEditablePrompt(updated);
    if (onUpdateVideoPrompt) {
      onUpdateVideoPrompt(scene.id, updated);
    }
  };

  return (
    <div
      id={`scene-card-${scene.id}`}
      className="rounded-2xl bg-[#0F0F12] border border-white/5 hover:border-white/20 transition-all shadow-xl overflow-hidden flex flex-col group p-5 gap-4"
    >
      {/* Visual Media Header: Keyframe / 10s Video in Bento Screen Container */}
      <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
        {scene.videoUrl ? (
          <video
            src={scene.videoUrl}
            className="w-full h-full object-cover"
            controls
            playsInline
          />
        ) : scene.imageUrl ? (
          <div className="relative w-full h-full">
            <img
              src={scene.imageUrl}
              alt={scene.title}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isPlaying10sPreview ? 'scale-110 translate-y-[-2%]' : 'group-hover:scale-105'
              }`}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="p-6 text-center text-white/30 space-y-2">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-white/50">
              <Clapperboard className="w-6 h-6" />
            </div>
            <p className="text-xs text-white/60 font-mono">10s Clip / Keyframe Pending</p>
            <p className="text-[10px] text-white/30 line-clamp-2 max-w-xs font-mono">{scene.videoPrompt}</p>
          </div>
        )}

        {/* 10s Subtitle Overlay during preview */}
        {isPlaying10sPreview && scene.dialogueOrVoiceover && (
          <div className="absolute bottom-6 left-4 right-4 text-center z-20 pointer-events-none">
            <span className="px-3 py-1 rounded bg-black/80 text-yellow-300 text-[11px] font-mono border border-yellow-500/40 backdrop-blur-md">
              "{scene.dialogueOrVoiceover}"
            </span>
          </div>
        )}

        {/* 10s Timecode Scrubber Bar at bottom of media */}
        <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-sm p-1.5 flex items-center justify-between gap-2 border-t border-white/10 z-10">
          <button
            onClick={() => setIsPlaying10sPreview(!isPlaying10sPreview)}
            className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Preview 10-Second Simulation"
          >
            {isPlaying10sPreview ? <Pause className="w-3 h-3 text-blue-400" /> : <Play className="w-3 h-3 text-white" />}
          </button>
          
          <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-blue-500 transition-all duration-100"
              style={{ width: `${(previewProgress / 10) * 100}%` }}
            />
          </div>

          <span className="text-[9px] font-mono text-white/80 shrink-0">
            00:0{Math.floor(previewProgress)} / 00:10
          </span>
        </div>

        {/* Badges Top Left */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10 max-w-[80%]">
          <span className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[9px] font-mono font-bold uppercase tracking-wider text-blue-400 border border-blue-500/40">
            Act {scene.actNumber} • Scene {scene.sceneNumber}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[9px] font-mono font-bold text-white/80 border border-white/20">
            10.00s
          </span>
          {scene.ispaToken && (
            <span className="px-2 py-0.5 rounded-lg bg-purple-950/80 backdrop-blur-md text-[9px] font-mono font-bold text-purple-300 border border-purple-500/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              ISPA [{scene.ispaToken}]
            </span>
          )}
        </div>

        {/* Quick Generation Actions Top Right */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            id={`btn-gen-img-${scene.id}`}
            onClick={() => onGenerateImage(scene.id)}
            disabled={scene.isGeneratingImage}
            className="p-1.5 rounded-lg bg-black/80 hover:bg-black text-white/80 border border-white/20 text-xs shadow-md backdrop-blur-md transition-all active:scale-95"
            title="Generate Storyboard Keyframe"
          >
            {scene.isGeneratingImage ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
            )}
          </button>

          <button
            id={`btn-gen-vid-${scene.id}`}
            onClick={() => onGenerateVideo(scene.id)}
            disabled={scene.videoStatus === 'generating'}
            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/40 text-xs shadow-md backdrop-blur-md transition-all active:scale-95 flex items-center gap-1"
            title="Generate 10-second Scene Video with Omni / Veo"
          >
            {scene.videoStatus === 'generating' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Video className="w-3.5 h-3.5 text-white" />
            )}
          </button>

          {onEditScene && (
            <button
              onClick={() => onEditScene(scene)}
              className="p-1.5 rounded-lg bg-black/80 hover:bg-black text-white/60 hover:text-white border border-white/20 text-xs backdrop-blur-md transition-colors"
              title="Edit Full Scene"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDeleteScene && (
            <button
              onClick={() => {
                if (window.confirm(`Delete scene "${scene.title}"?`)) {
                  onDeleteScene(scene.id);
                }
              }}
              className="p-1.5 rounded-lg bg-black/80 hover:bg-red-950 text-red-400/80 hover:text-red-300 border border-red-500/20 text-xs backdrop-blur-md transition-colors"
              title="Delete Scene"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Video rendering banner */}
        {scene.videoStatus === 'generating' && (
          <div className="absolute bottom-8 left-3 right-3 p-2 rounded-lg bg-black/90 backdrop-blur-md border border-blue-500/50 flex items-center gap-2 text-[10px] font-mono text-blue-300 z-10">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
            <span>Rendering 10s clip with Gemini Omni / Veo...</span>
          </div>
        )}
      </div>

      {/* Content details */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-bold text-white leading-tight">
              {scene.title}
            </h4>
            <span className="text-[10px] text-white/40 font-mono shrink-0">
              {scene.setting}
            </span>
          </div>

          <p className="text-xs text-white/60 leading-relaxed">
            {scene.actionSummary}
          </p>

          {/* Technical cinematic cues */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
              <span className="font-semibold text-white/40 flex items-center gap-1 uppercase">
                <Camera className="w-3 h-3 text-blue-400" />
                Camera Direction
              </span>
              <p className="text-white/80 truncate">{scene.cameraDirection}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
              <span className="font-semibold text-white/40 flex items-center gap-1 uppercase">
                <SunMedium className="w-3 h-3 text-purple-400" />
                Lighting & Mood
              </span>
              <p className="text-white/80 truncate">{scene.moodAndLighting}</p>
            </div>
          </div>

          {/* Dedicated 10-Second Video Prompt & Action Studio */}
          <div className="rounded-xl bg-blue-950/20 border border-blue-500/25 overflow-hidden">
            <div
              onClick={() => setIsPromptStudioOpen(!isPromptStudioOpen)}
              className="p-2.5 bg-blue-950/40 flex items-center justify-between cursor-pointer hover:bg-blue-900/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Film className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-300">
                  10s Video Prompt Studio
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-blue-400/70">
                  {isPromptStudioOpen ? 'Hide Studio' : 'Edit Prompt & Tags'}
                </span>
                {isPromptStudioOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                )}
              </div>
            </div>

            {/* Prompt Studio Body */}
            {isPromptStudioOpen ? (
              <div className="p-3 space-y-2.5 border-t border-blue-500/20">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase text-white/50">
                      10-Second Clip Directive
                    </span>
                    <span className="text-[9px] font-mono text-white/40">
                      {editablePrompt.length} chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={editablePrompt}
                    onChange={(e) => setEditablePrompt(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/70 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                    placeholder="Describe 10-second subject action, camera path, lighting..."
                  />
                </div>

                {/* Quick Add Tag Pills */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-white/40">
                    Quick Director Tags:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {PROMPT_TAGS.camera.slice(0, 2).map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addPromptTag(tag)}
                        className="px-2 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-[9px] font-mono border border-blue-500/30 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                    {PROMPT_TAGS.dynamics.slice(0, 2).map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addPromptTag(tag)}
                        className="px-2 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[9px] font-mono border border-purple-500/30 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save Prompt Action */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => onGenerateVideo(scene.id)}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-mono font-bold flex items-center gap-1 shadow-md"
                  >
                    <Video className="w-3 h-3" />
                    <span>Render 10s Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSavePrompt}
                    className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono flex items-center gap-1 border border-white/10"
                  >
                    {isPromptSaved ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                    <span>{isPromptSaved ? 'Saved!' : 'Save Prompt'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2.5">
                <p className="text-[11px] text-white/70 font-mono line-clamp-2 italic">
                  "{scene.videoPrompt}"
                </p>
              </div>
            )}
          </div>

          {/* Dialogue & Narration Track */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-purple-400" />
                {scene.ispaToken ? `Bioacoustic Track (${scene.dialogueSpeaker || 'Audio Track'})` : `Dialogue / Narration (${scene.dialogueSpeaker || 'Voiceover'})`}
              </span>

              <div className="flex items-center gap-1.5">
                {scene.ispaModality && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[8px] font-mono">
                    {scene.ispaModality}
                  </span>
                )}
                {scene.ispaSensorTarget && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-mono">
                    {scene.ispaSensorTarget}
                  </span>
                )}
                <button
                  id={`btn-audio-${scene.id}`}
                  onClick={toggleAudio}
                  disabled={scene.isGeneratingAudio}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/80 text-[10px] font-mono flex items-center gap-1 transition-colors border border-white/10"
                >
                  {scene.isGeneratingAudio ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                  ) : isPlayingAudio ? (
                    <>
                      <Pause className="w-3 h-3 fill-current text-blue-400" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3 text-blue-400" />
                      <span>{scene.audioUrl ? 'Play Audio' : 'Generate TTS'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-white/80 italic leading-relaxed">
              "{scene.dialogueOrVoiceover}"
            </p>
          </div>
        </div>

        {/* Bottom Splicer Settings: Transition */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-white/40 font-mono">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] uppercase">Transition:</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              id={`transition-select-${scene.id}`}
              value={scene.transition}
              onChange={(e) => onUpdateTransition(scene.id, e.target.value as TransitionType, scene.transitionDuration)}
              className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-white/80 text-xs focus:outline-none focus:border-blue-500 font-mono"
            >
              {TRANSITIONS.map((t) => (
                <option key={t.type} value={t.type} className="bg-[#0F0F12] text-white">
                  {t.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => onPreviewScene(scene)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs font-mono flex items-center gap-1 transition-colors border border-white/10"
              title="Preview 10s Scene"
            >
              <Eye className="w-3 h-3 text-blue-400" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
