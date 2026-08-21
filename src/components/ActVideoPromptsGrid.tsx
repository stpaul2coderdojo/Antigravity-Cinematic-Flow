import React, { useState } from 'react';
import { Act, Scene } from '../types';
import { 
  Video, 
  Copy, 
  Check, 
  Wand2, 
  RefreshCw, 
  Film, 
  Camera, 
  SunMedium, 
  Play, 
  Pause, 
  Layers,
  Sparkles,
  Edit3
} from 'lucide-react';

interface ActVideoPromptsGridProps {
  act: Act;
  onGenerateVideo: (sceneId: string) => void;
  onUpdateVideoPrompt: (sceneId: string, newPrompt: string) => void;
  onPreviewScene?: (scene: Scene) => void;
}

const DIRECTOR_TAGS = [
  '35mm anamorphic push-in',
  'Low-angle tracking dolly',
  'Sweeping 360 crane orbit',
  'Volumetric cyan rim lighting',
  'Moody chiaroscuro shadows',
  '60fps fluid cinematic motion',
  '120fps slow-motion particles',
  'Continuous uncut 10s shot',
];

export const ActVideoPromptsGrid: React.FC<ActVideoPromptsGridProps> = ({
  act,
  onGenerateVideo,
  onUpdateVideoPrompt,
  onPreviewScene,
}) => {
  const [copiedSceneId, setCopiedSceneId] = useState<string | null>(null);
  const [editingPrompts, setEditingPrompts] = useState<{ [sceneId: string]: string }>({});

  const getPromptValue = (scene: Scene) => {
    return editingPrompts[scene.id] !== undefined
      ? editingPrompts[scene.id]
      : scene.videoPrompt;
  };

  const handlePromptChange = (sceneId: string, val: string) => {
    setEditingPrompts((prev) => ({ ...prev, [sceneId]: val }));
    onUpdateVideoPrompt(sceneId, val);
  };

  const handleCopyPrompt = (sceneId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSceneId(sceneId);
    setTimeout(() => setCopiedSceneId(null), 2000);
  };

  const handleAddTag = (scene: Scene, tag: string) => {
    const current = getPromptValue(scene);
    const updated = current ? `${current}, ${tag}` : tag;
    handlePromptChange(scene.id, updated);
  };

  const handleEnhancePrompt = (scene: Scene) => {
    const enhanced = `10-second continuous uncut cinematic shot: ${scene.actionSummary}. Setting: ${scene.setting}. Camera: ${scene.cameraDirection}. Atmosphere: ${scene.moodAndLighting}. Fluid continuous motion, photorealistic 8k, 60fps, anamorphic lens flares.`;
    handlePromptChange(scene.id, enhanced);
  };

  return (
    <div className="space-y-4 animate-fade-in text-[#F0F0F0]">
      {/* Grid Sub-Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-black/50 border border-white/10">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            {act.title} • 10-Second Video Prompt Directives Matrix ({act.scenes.length} Clips)
          </h4>
        </div>
        <span className="text-[10px] font-mono text-white/50">
          Standardized 10.00s Continuous Video Prompts for Gemini Omni & Veo
        </span>
      </div>

      {/* Prompts Cards Grid with Sequential Timecode Indicies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {act.scenes.map((scene, idx) => {
          const startTime = idx * 10;
          const endTime = (idx + 1) * 10;
          const indexLabel = `[ACT ${act.actNumber} • CLIP #${(idx + 1).toString().padStart(2, '0')}]`;
          const timecodeLabel = `00:${startTime.toString().padStart(2, '0')} - 00:${endTime.toString().padStart(2, '0')}`;
          const currentPrompt = getPromptValue(scene);
          const isCopied = copiedSceneId === scene.id;

          return (
            <div
              key={scene.id}
              id={`video-prompt-card-${scene.id}`}
              className="p-5 rounded-2xl bg-[#0F0F12] border border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between gap-4 shadow-xl group"
            >
              {/* Card Header with Indicies & Badges */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-mono font-bold">
                      {indexLabel}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-white/60">
                      {timecodeLabel} (10.00s)
                    </span>
                    {scene.ispaToken && (
                      <span className="px-2 py-0.5 rounded-lg bg-purple-950/80 text-purple-300 border border-purple-500/40 text-[9px] font-mono font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                        ISPA [{scene.ispaToken}]
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border ${
                      scene.videoStatus === 'ready'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                        : scene.videoStatus === 'generating'
                        ? 'bg-amber-950/60 text-amber-300 border-amber-500/40 animate-pulse'
                        : 'bg-white/5 text-white/40 border-white/10'
                    }`}
                  >
                    {scene.videoStatus === 'ready'
                      ? '✓ Clip Ready'
                      : scene.videoStatus === 'generating'
                      ? 'Rendering...'
                      : 'Idle'}
                  </span>
                </div>

                {/* Scene Title & Setting */}
                <div>
                  <h5 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                    {scene.title}
                  </h5>
                  <p className="text-[10px] font-mono text-white/40 truncate">
                    {scene.setting}
                  </p>
                </div>
              </div>

              {/* Editable Video Prompt Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-mono uppercase tracking-wider text-white/50 flex items-center gap-1">
                    <Video className="w-3 h-3 text-blue-400" />
                    Omni / Veo Video Prompt Directive:
                  </label>
                  <span className="text-[9px] font-mono text-white/30">
                    {currentPrompt.length} chars
                  </span>
                </div>

                <textarea
                  rows={3}
                  value={currentPrompt}
                  onChange={(e) => handlePromptChange(scene.id, e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-blue-500 leading-relaxed"
                  placeholder="Enter 10-second prompt..."
                />
              </div>

              {/* Audio/Bioacoustic Track */}
              {scene.dialogueOrVoiceover && (
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-mono text-purple-300">
                    <span className="font-bold uppercase tracking-wider">
                      {scene.ispaToken ? `Bioacoustic Call (${scene.dialogueSpeaker})` : `Audio Track (${scene.dialogueSpeaker})`}
                    </span>
                    {scene.ispaModality && (
                      <span className="text-white/40 text-[8px]">{scene.ispaModality}</span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono italic text-white/70 truncate">
                    "{scene.dialogueOrVoiceover}"
                  </p>
                </div>
              )}

              {/* Cinematic Director Tags Pills */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-white/40">
                  Quick Director Cues:
                </span>
                <div className="flex flex-wrap gap-1">
                  {DIRECTOR_TAGS.slice(0, 4).map((tag, tIdx) => (
                    <button
                      key={tIdx}
                      type="button"
                      onClick={() => handleAddTag(scene, tag)}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-blue-500/20 text-white/60 hover:text-blue-300 text-[9px] font-mono border border-white/10 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(scene.id, currentPrompt)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-[10px] font-mono flex items-center gap-1 border border-white/10 transition-colors"
                    title="Copy Video Prompt"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEnhancePrompt(scene)}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-[10px] font-mono flex items-center gap-1 border border-blue-500/30 transition-colors"
                    title="Auto-compose with camera and lighting cues"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>AI Direct</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onGenerateVideo(scene.id)}
                  disabled={scene.videoStatus === 'generating'}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  {scene.videoStatus === 'generating' ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-white" />
                  ) : (
                    <Video className="w-3 h-3 text-white" />
                  )}
                  <span>Render 10s Clip</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
