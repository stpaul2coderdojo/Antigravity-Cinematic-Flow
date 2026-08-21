import React, { useState } from 'react';
import { Scene, Character, TransitionType } from '../types';
import { X, Clapperboard, Video, Image as ImageIcon, Camera, SunMedium, Radio, Sparkles, Wand2, Check, Trash2 } from 'lucide-react';

interface SceneEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: Scene | null; // null means adding new scene
  actId: string;
  actNumber: number;
  actTitle: string;
  sceneCount: number;
  availableCharacters: Character[];
  onSave: (scene: Scene) => void;
  onDelete?: (sceneId: string) => void;
}

const CAMERA_SUGGESTIONS = [
  'Slow 35mm anamorphic push-in, low-angle tracking shot, shallow depth of field',
  'Sweeping panoramic crane shot, cinematic orbit with volumetric rim lighting',
  'Dynamic shoulder-mount dolly tracking, wide angle perspective with lens flares',
  'Extreme close-up macro pan, atmospheric haze, rack focus between subjects',
  'Steadicam forward tracking shot through dense atmospheric particles',
  'High-angle tilt down, dramatic chiaroscuro shadows across geometric surfaces',
];

const LIGHTING_SUGGESTIONS = [
  'Volumetric neon rim light, hazy rain reflections, deep cyan shadows',
  'Golden hour warm sunlight cutting through atmospheric dust, high contrast',
  'Cold fluorescent flickers, high-contrast shadows, deep obsidian tones',
  'Bioluminescent cyan and magenta glow, ethereal fog, sharp backlight',
  'Chiaroscuro single spotlight, silhouette rim, cinematic smoke particles',
];

export const SceneEditorModal: React.FC<SceneEditorModalProps> = ({
  isOpen,
  onClose,
  scene,
  actId,
  actNumber,
  actTitle,
  sceneCount,
  availableCharacters,
  onSave,
  onDelete,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(scene?.title || `Sequence ${sceneCount + 1}: The Critical Catalyst`);
  const [setting, setSetting] = useState(scene?.setting || 'Atmospheric Sector Matrix, neon reflections');
  const [actionSummary, setActionSummary] = useState(
    scene?.actionSummary || 'The character executes a decisive action as environmental tension mounts.'
  );
  const [selectedChars, setSelectedChars] = useState<string[]>(
    scene?.charactersPresent || (availableCharacters[0] ? [availableCharacters[0].name] : [])
  );
  const [cameraDirection, setCameraDirection] = useState(
    scene?.cameraDirection || CAMERA_SUGGESTIONS[0]
  );
  const [moodAndLighting, setMoodAndLighting] = useState(
    scene?.moodAndLighting || LIGHTING_SUGGESTIONS[0]
  );
  const [dialogueOrVoiceover, setDialogueOrVoiceover] = useState(
    scene?.dialogueOrVoiceover || 'We have crossed into uncharted territory—there is no turning back now.'
  );
  const [dialogueSpeaker, setDialogueSpeaker] = useState(
    scene?.dialogueSpeaker || (availableCharacters[0]?.name || 'Narrator')
  );
  const [videoPrompt, setVideoPrompt] = useState(
    scene?.videoPrompt ||
      `10-second cinematic continuous shot: ${availableCharacters[0]?.name || 'Character'} moving through environment, ${CAMERA_SUGGESTIONS[0]}, fluid motion, atmospheric dust particles, 60fps`
  );
  const [imagePrompt, setImagePrompt] = useState(
    scene?.imagePrompt ||
      `Cinematic keyframe: ${availableCharacters[0]?.name || 'Character'} in dramatic high-tension setting, ${CAMERA_SUGGESTIONS[0]}, 8k resolution, cinematic anamorphic`
  );
  const [transition, setTransition] = useState<TransitionType>(scene?.transition || 'crossfade');
  const [transitionDuration, setTransitionDuration] = useState(scene?.transitionDuration || 1.0);

  const toggleCharacter = (charName: string) => {
    if (selectedChars.includes(charName)) {
      setSelectedChars(selectedChars.filter((c) => c !== charName));
    } else {
      setSelectedChars([...selectedChars, charName]);
    }
  };

  const handleEnhanceVideoPrompt = () => {
    const mainChar = selectedChars[0] || 'Subject';
    const enhanced = `10-second cinematic continuous shot: ${mainChar} in ${setting}. ${actionSummary}. Camera: ${cameraDirection}. Atmosphere: ${moodAndLighting}. Fluid continuous motion, photorealistic 8k, 60fps, anamorphic lens flares.`;
    setVideoPrompt(enhanced);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updated: Scene = {
      id: scene?.id || `scene-${actNumber}-${Date.now()}`,
      actId,
      actNumber,
      actTitle,
      sceneNumber: scene?.sceneNumber || sceneCount + 1,
      title: title.trim(),
      duration: 10,
      setting: setting.trim(),
      actionSummary: actionSummary.trim(),
      charactersPresent: selectedChars,
      cameraDirection: cameraDirection.trim(),
      moodAndLighting: moodAndLighting.trim(),
      dialogueOrVoiceover: dialogueOrVoiceover.trim(),
      dialogueSpeaker: dialogueSpeaker.trim(),
      imagePrompt: imagePrompt.trim(),
      videoPrompt: videoPrompt.trim(),
      imageUrl: scene?.imageUrl,
      videoUrl: scene?.videoUrl,
      audioUrl: scene?.audioUrl,
      transition,
      transitionDuration,
      videoStatus: scene?.videoStatus || 'idle',
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl bg-[#0F0F12] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Clapperboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                {scene ? `Edit Scene: ${scene.title}` : `Create 10-Second Scene for ${actTitle}`}
              </h3>
              <p className="text-[11px] text-white/40 font-mono">
                Standard 10.00s sequence block with camera choreography & video prompt matrix
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
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Title & Setting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                Scene Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Spire Interface"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                Setting & Environment
              </label>
              <input
                type="text"
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                placeholder="e.g. Flooded subway station, neon reflections"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action Summary */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
              10-Second Action Summary
            </label>
            <textarea
              rows={2}
              value={actionSummary}
              onChange={(e) => setActionSummary(e.target.value)}
              placeholder="Describe what occurs during these 10 continuous seconds..."
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Cast Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
              Characters in Scene
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {availableCharacters.map((char) => {
                const isSelected = selectedChars.includes(char.name);
                return (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => toggleCharacter(char.name)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${
                      isSelected
                        ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                        : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {char.name} ({char.role})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Camera Direction & Lighting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 flex items-center gap-1">
                <Camera className="w-3 h-3 text-blue-400" />
                Camera Direction & Movement
              </label>
              <input
                type="text"
                value={cameraDirection}
                onChange={(e) => setCameraDirection(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {CAMERA_SUGGESTIONS.slice(0, 2).map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCameraDirection(s)}
                    className="text-[9px] font-mono text-blue-400 hover:underline truncate max-w-[200px]"
                  >
                    + {s.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 flex items-center gap-1">
                <SunMedium className="w-3 h-3 text-purple-400" />
                Lighting & Atmosphere
              </label>
              <input
                type="text"
                value={moodAndLighting}
                onChange={(e) => setMoodAndLighting(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {LIGHTING_SUGGESTIONS.slice(0, 2).map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMoodAndLighting(s)}
                    className="text-[9px] font-mono text-purple-400 hover:underline truncate max-w-[200px]"
                  >
                    + {s.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dialogue / Voiceover */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/60 flex items-center gap-1">
                <Radio className="w-3 h-3 text-purple-400" />
                Dialogue / Voiceover Narration
              </span>
              <select
                value={dialogueSpeaker}
                onChange={(e) => setDialogueSpeaker(e.target.value)}
                className="px-2 py-1 rounded bg-black border border-white/15 text-white text-[10px] font-mono"
              >
                <option value="Narrator">Narrator (Voiceover)</option>
                {availableCharacters.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              rows={2}
              value={dialogueOrVoiceover}
              onChange={(e) => setDialogueOrVoiceover(e.target.value)}
              placeholder="Enter spoken lines timed for 10 seconds speech..."
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 italic"
            />
          </div>

          {/* 10-Second Video Prompt */}
          <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-blue-400" />
                10-Second Video Generation Prompt (Omni / Veo)
              </span>
              <button
                type="button"
                onClick={handleEnhanceVideoPrompt}
                className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-mono flex items-center gap-1"
              >
                <Wand2 className="w-3 h-3" />
                <span>Auto-Compose Video Prompt</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              placeholder="10-second continuous shot: character movement, camera path, lighting, 60fps..."
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
          {scene && onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete scene "${scene.title}"?`)) {
                  onDelete(scene.id);
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono flex items-center gap-1.5 border border-red-500/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Scene</span>
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
              <span>{scene ? 'Save 10s Scene' : 'Add 10s Scene'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
