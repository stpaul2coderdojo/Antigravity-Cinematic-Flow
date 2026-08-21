import React, { useState } from 'react';
import { Act, Scene, Character, TransitionType } from '../types';
import { 
  Clapperboard, 
  Sparkles, 
  Wand2, 
  Check, 
  Trash2, 
  Camera, 
  SunMedium, 
  Radio, 
  Video, 
  Film, 
  RotateCcw,
  Play,
  Eye,
  Sliders,
  Layers
} from 'lucide-react';

interface InteractiveSceneCreatorProps {
  act: Act;
  characters: Character[];
  onAcceptScene: (actId: string, newScene: Scene) => void;
  onCancel?: () => void;
}

const CAMERA_CHOREOGRAPHY = [
  'Slow 35mm anamorphic push-in, low-angle tracking shot, shallow depth of field',
  'Sweeping panoramic crane shot, 360-degree orbit with volumetric rim lighting',
  'Dynamic shoulder-mount dolly tracking, wide angle perspective with lens flares',
  'Extreme close-up macro pan, atmospheric haze, rack focus between subjects',
  'Steadicam forward tracking shot through dense atmospheric particles',
  'High-speed low-angle lateral dolly following high-intensity action',
];

const LIGHTING_PRESETS = [
  'Volumetric neon rim light, hazy rain reflections, deep cyan shadows',
  'Golden hour warm sunlight cutting through atmospheric dust, high contrast',
  'Cold fluorescent flickers, high-contrast shadows, deep obsidian tones',
  'Bioluminescent cyan and magenta glow, ethereal fog, sharp backlight',
  'Moody chiaroscuro single spotlight, silhouette rim, cinematic smoke particles',
];

export const InteractiveSceneCreator: React.FC<InteractiveSceneCreatorProps> = ({
  act,
  characters,
  onAcceptScene,
  onCancel,
}) => {
  const nextSceneNumber = act.scenes.length + 1;
  const startTime = (nextSceneNumber - 1) * 10;
  const endTime = nextSceneNumber * 10;
  const timecodeIndex = `[ACT ${act.actNumber} • CLIP #${nextSceneNumber.toString().padStart(2, '0')}] 00:${startTime.toString().padStart(2, '0')} - 00:${endTime.toString().padStart(2, '0')}`;

  const [title, setTitle] = useState(`Sequence ${nextSceneNumber}: The Escalation Matrix`);
  const [setting, setSetting] = useState('High-altitude skybridge, heavy precipitation & neon flares');
  const [actionSummary, setActionSummary] = useState(
    'The operative sprints along the slippery gangway, dodging telemetry sensors as a distant beacon ignites.'
  );
  const [selectedChars, setSelectedChars] = useState<string[]>(
    characters[0] ? [characters[0].name] : []
  );
  const [cameraDirection, setCameraDirection] = useState(CAMERA_CHOREOGRAPHY[0]);
  const [moodAndLighting, setMoodAndLighting] = useState(LIGHTING_PRESETS[0]);
  const [dialogueOrVoiceover, setDialogueOrVoiceover] = useState(
    'Hold the frequency. If we cross the perimeter before the pulse dies down, we are visible to the whole sector.'
  );
  const [dialogueSpeaker, setDialogueSpeaker] = useState(
    characters[0]?.name || 'Narrator'
  );
  const [videoPrompt, setVideoPrompt] = useState(
    `10-second cinematic continuous shot: ${characters[0]?.name || 'Character'} navigating through high-altitude skybridge in heavy rain, ${CAMERA_CHOREOGRAPHY[0]}, ${LIGHTING_PRESETS[0]}, fluid motion, 60fps, 8k resolution`
  );
  const [transition, setTransition] = useState<TransitionType>('crossfade');
  const [transitionDuration, setTransitionDuration] = useState<number>(1.0);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Auto-compose / AI refine prompt
  const handleAutoComposePrompt = () => {
    const mainChar = selectedChars[0] || 'The operative';
    const composed = `10-second continuous uncut sequence: ${mainChar} in ${setting}. ${actionSummary}. Camera: ${cameraDirection}. Atmosphere: ${moodAndLighting}. 60fps high dynamic range, photorealistic 8k, cinematic anamorphic lenses.`;
    setVideoPrompt(composed);
  };

  // AI Auto-Draft complete 10s Scene suggestion
  const handleAiAutoDraft = async () => {
    setIsAiGenerating(true);
    try {
      const titles = [
        'The Silent Override',
        'Breaching the Obsidian Vault',
        'Signal Interference at Apex',
        'The Quantum Slipstream',
        'Neon Reflections in the Sublevel',
      ];
      const settings = [
        'Subterranean server cathedral, blue optic fiber conduits',
        'Flooded mag-lev rail corridor, sparking high-voltage lines',
        'Rooftop helipad during a severe synthetic lightning storm',
        'Decommissioned orbital dock bay, zero-gravity debris drift',
      ];
      const actions = [
        'The agent hotwires the magnetic lockbox with surgical precision as security alarms echo.',
        'Two figures exchange coded telemetry drives under the shadow of a colossal surveillance drone.',
        'A rapid pursuit unfolds down the catwalk, steam venting from overhead coolant pipes.',
      ];
      const dialogues = [
        '"The firewall gave way. We have exactly ten seconds before the failsafe closes in."',
        '"Trust the trajectory. If we jump on the three-count, the slipstream catches us."',
        '"Look at the telemetry readings... this isn\'t a malfunction, it\'s an intentional blackout."',
      ];

      const newTitle = titles[Math.floor(Math.random() * titles.length)];
      const newSetting = settings[Math.floor(Math.random() * settings.length)];
      const newAction = actions[Math.floor(Math.random() * actions.length)];
      const newCam = CAMERA_CHOREOGRAPHY[Math.floor(Math.random() * CAMERA_CHOREOGRAPHY.length)];
      const newLight = LIGHTING_PRESETS[Math.floor(Math.random() * LIGHTING_PRESETS.length)];
      const newDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];

      setTitle(`Sequence ${nextSceneNumber}: ${newTitle}`);
      setSetting(newSetting);
      setActionSummary(newAction);
      setCameraDirection(newCam);
      setMoodAndLighting(newLight);
      setDialogueOrVoiceover(newDialogue);

      const mainChar = characters[0]?.name || 'Operative';
      setVideoPrompt(
        `10-second cinematic continuous shot: ${mainChar} in ${newSetting}. ${newAction}. Camera: ${newCam}. Atmosphere: ${newLight}. 60fps, 8k.`
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleCommit = () => {
    if (!title.trim()) return;

    const newScene: Scene = {
      id: `scene-${act.actNumber}-${Date.now()}`,
      actId: act.id,
      actNumber: act.actNumber,
      actTitle: act.title,
      sceneNumber: nextSceneNumber,
      title: title.trim(),
      duration: 10,
      setting: setting.trim(),
      actionSummary: actionSummary.trim(),
      charactersPresent: selectedChars,
      cameraDirection: cameraDirection.trim(),
      moodAndLighting: moodAndLighting.trim(),
      dialogueOrVoiceover: dialogueOrVoiceover.trim(),
      dialogueSpeaker: dialogueSpeaker.trim(),
      imagePrompt: `Cinematic keyframe of ${title}, ${setting}, ${moodAndLighting}, photorealistic 8k, cinematic wide shot`,
      videoPrompt: videoPrompt.trim(),
      transition,
      transitionDuration,
      videoStatus: 'idle',
    };

    onAcceptScene(act.id, newScene);
  };

  return (
    <div className="p-5 rounded-2xl bg-[#0F0F12] border border-blue-500/40 shadow-2xl space-y-5 animate-fade-in text-[#F0F0F0] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Sequence Index Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
            <Clapperboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white font-mono">
                Interactive Scene Creator: {act.title}
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-mono font-bold">
                {timecodeIndex}
              </span>
            </div>
            <p className="text-xs text-white/40">
              Draft and fine-tune an exact 10-second continuous scene sequence, then accept it into the timeline.
            </p>
          </div>
        </div>

        {/* AI Auto-Draft Trigger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAiAutoDraft}
            disabled={isAiGenerating}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs font-mono flex items-center gap-1.5 border border-blue-500/40 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAiGenerating ? 'Drafting...' : 'AI Auto-Suggest 10s Scene'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Creator Matrix Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 relative z-10">
        {/* Left Column: Narrative & Visual Directives */}
        <div className="space-y-3.5 p-4 rounded-xl bg-black/40 border border-white/5">
          {/* Title & Setting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/50">Scene Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/50">Setting & Environment</label>
              <input
                type="text"
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* 10-Second Continuous Action */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/50">
              10-Second Continuous Action Beat
            </label>
            <textarea
              rows={2}
              value={actionSummary}
              onChange={(e) => setActionSummary(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Camera Direction with Quick Suggestions */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 flex items-center gap-1">
              <Camera className="w-3 h-3 text-blue-400" />
              Camera Choreography
            </label>
            <input
              type="text"
              value={cameraDirection}
              onChange={(e) => setCameraDirection(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
            />
            <div className="flex flex-wrap gap-1">
              {CAMERA_CHOREOGRAPHY.slice(0, 3).map((cam, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCameraDirection(cam)}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-blue-500/20 text-white/60 hover:text-blue-300 text-[9px] font-mono border border-white/10 transition-colors truncate max-w-[220px]"
                >
                  + {cam.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Lighting & Mood with Presets */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 flex items-center gap-1">
              <SunMedium className="w-3 h-3 text-purple-400" />
              Lighting & Atmosphere
            </label>
            <input
              type="text"
              value={moodAndLighting}
              onChange={(e) => setMoodAndLighting(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
            />
            <div className="flex flex-wrap gap-1">
              {LIGHTING_PRESETS.slice(0, 3).map((light, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMoodAndLighting(light)}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-purple-500/20 text-white/60 hover:text-purple-300 text-[9px] font-mono border border-white/10 transition-colors truncate max-w-[220px]"
                >
                  + {light.split(',')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Audio Dialogue & 10s Video Prompt Splicer */}
        <div className="space-y-3.5 p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
          {/* Dialogue / Voiceover */}
          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-purple-300 flex items-center gap-1">
                <Radio className="w-3 h-3 text-purple-400" />
                Spoken Narration / Dialogue (10s Speech)
              </span>
              <select
                value={dialogueSpeaker}
                onChange={(e) => setDialogueSpeaker(e.target.value)}
                className="px-2 py-0.5 rounded bg-black border border-white/15 text-white text-[10px] font-mono"
              >
                <option value="Narrator">Narrator (Voiceover)</option>
                {characters.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.role})
                  </option>
                ))}
              </select>
            </div>
            <textarea
              rows={2}
              value={dialogueOrVoiceover}
              onChange={(e) => setDialogueOrVoiceover(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 italic"
            />
          </div>

          {/* 10-Second Video Generation Prompt Directive */}
          <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-blue-400" />
                10-Second Omni/Veo Video Prompt Directive
              </span>
              <button
                type="button"
                onClick={handleAutoComposePrompt}
                className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-mono flex items-center gap-1"
              >
                <Wand2 className="w-3 h-3" />
                <span>Auto-Compose Prompt</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Transition Selector */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50 uppercase">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Flow Splicer Transition:</span>
            </div>
            <select
              value={transition}
              onChange={(e) => setTransition(e.target.value as TransitionType)}
              className="px-2.5 py-1 rounded bg-black/60 border border-white/15 text-white text-xs font-mono"
            >
              <option value="crossfade">Crossfade (1.0s)</option>
              <option value="dissolve">Dissolve (1.0s)</option>
              <option value="fade-to-black">Fade to Black (1.5s)</option>
              <option value="whip-pan">Whip Pan (0.5s)</option>
              <option value="cut">Hard Cut (0.0s)</option>
              <option value="glitch">Cyber Glitch (0.8s)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accept & Cancel Options Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10 relative z-10">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-xs font-mono transition-colors border border-white/10 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Discard Draft</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCommit}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-blue-400/40 transition-all active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>Accept & Commit 10s Scene to {act.title}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
