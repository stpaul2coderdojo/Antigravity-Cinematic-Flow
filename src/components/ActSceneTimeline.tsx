import React, { useState } from 'react';
import { Act, Scene, Character, TransitionType } from '../types';
import { SceneCard } from './SceneCard';
import { ActEditorModal } from './ActEditorModal';
import { SceneEditorModal } from './SceneEditorModal';
import { InteractiveSceneCreator } from './InteractiveSceneCreator';
import { ActVideoPromptsGrid } from './ActVideoPromptsGrid';
import { 
  Clapperboard, 
  Sparkles, 
  Wand2, 
  Video, 
  Volume2, 
  RefreshCw, 
  Layers, 
  Plus, 
  Edit2, 
  Trash2,
  Film,
  Sliders,
  LayoutGrid,
  FileCode,
  UploadCloud
} from 'lucide-react';

interface ActSceneTimelineProps {
  acts: Act[];
  characters: Character[];
  onGenerateImage: (sceneId: string) => void;
  onGenerateVideo: (sceneId: string) => void;
  onGenerateAudio: (sceneId: string) => void;
  onGenerateAllImages: () => void;
  onGenerateAllVideos: () => void;
  onGenerateAllAudios: () => void;
  onUpdateTransition: (sceneId: string, transition: TransitionType, duration: number) => void;
  onPreviewScene: (scene: Scene) => void;
  onAddAct?: (newAct: Act) => void;
  onUpdateAct?: (updatedAct: Act) => void;
  onDeleteAct?: (actId: string) => void;
  onAddScene?: (actId: string, newScene: Scene) => void;
  onUpdateScene?: (updatedScene: Scene) => void;
  onDeleteScene?: (sceneId: string) => void;
  onUpdateVideoPrompt?: (sceneId: string, videoPrompt: string) => void;
  onOpenUploadActs?: () => void;
  isGeneratingImages?: boolean;
  isGeneratingVideos?: boolean;
  isGeneratingAudios?: boolean;
}

type ActViewMode = 'storyboard' | 'creator' | 'prompts_matrix';

export const ActSceneTimeline: React.FC<ActSceneTimelineProps> = ({
  acts,
  characters,
  onGenerateImage,
  onGenerateVideo,
  onGenerateAudio,
  onGenerateAllImages,
  onGenerateAllVideos,
  onGenerateAllAudios,
  onUpdateTransition,
  onPreviewScene,
  onAddAct,
  onUpdateAct,
  onDeleteAct,
  onAddScene,
  onUpdateScene,
  onDeleteScene,
  onUpdateVideoPrompt,
  onOpenUploadActs,
  isGeneratingImages = false,
  isGeneratingVideos = false,
  isGeneratingAudios = false,
}) => {
  const [selectedActId, setSelectedActId] = useState<string>(acts[0]?.id || 'act-1');
  const [actViewMode, setActViewMode] = useState<ActViewMode>('storyboard');

  const [editingAct, setEditingAct] = useState<Act | null>(null);
  const [isActModalOpen, setIsActModalOpen] = useState(false);

  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false);

  const activeAct = acts.find((a) => a.id === selectedActId) || acts[0];
  const totalScenes = acts.reduce((acc, act) => acc + act.scenes.length, 0);

  const handleOpenAddAct = () => {
    setEditingAct(null);
    setIsActModalOpen(true);
  };

  const handleOpenEditAct = (act: Act, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAct(act);
    setIsActModalOpen(true);
  };

  const handleSaveAct = (act: Act) => {
    if (editingAct && onUpdateAct) {
      onUpdateAct(act);
    } else if (onAddAct) {
      onAddAct(act);
      setSelectedActId(act.id);
    }
  };

  const handleOpenEditScene = (scene: Scene) => {
    setEditingScene(scene);
    setIsSceneModalOpen(true);
  };

  const handleSaveScene = (scene: Scene) => {
    if (editingScene && onUpdateScene) {
      onUpdateScene(scene);
    } else if (activeAct && onAddScene) {
      onAddScene(activeAct.id, scene);
    }
  };

  const handleAcceptNewScene = (actId: string, scene: Scene) => {
    if (onAddScene) {
      onAddScene(actId, scene);
    }
    setActViewMode('storyboard');
  };

  const handleBatchAddScenes = (count: number) => {
    if (!activeAct || !onAddScene) return;
    const currentCount = activeAct.scenes.length;
    const ispaTokens = ['HC', 'CC', 'HS', 'DC', 'GW', 'GR', 'SN', 'BB', 'POP', 'SAV', 'BR', 'JC'] as const;
    
    for (let i = 0; i < count; i++) {
      const sceneNum = currentCount + i + 1;
      const token = ispaTokens[(sceneNum - 1) % ispaTokens.length];
      const isSubaquatic = token === 'BB' || token === 'POP';
      const isInfrasonic = token === 'SAV' || token === 'BR';
      const modality = isSubaquatic ? 'Subaquatic (W)' : (isInfrasonic ? 'Substrate/Infrasonic (S)' : 'Airborne (A)');
      const sensor = isSubaquatic ? 'Hydrophone' : (token === 'SAV' ? 'Seismic Geophone' : (token === 'BR' ? 'Infrasound Sensor' : 'Directional Shotgun'));

      const newScene: Scene = {
        id: `scene-${activeAct.actNumber}-${sceneNum}-${Date.now()}-${i}`,
        actId: activeAct.id,
        actNumber: activeAct.actNumber,
        actTitle: activeAct.title,
        sceneNumber: sceneNum,
        title: `Clip ${String(sceneNum).padStart(2, '0')}: [${token}] 10s Sequence`,
        duration: 10,
        setting: 'Chambal river sandbar and shallow water column',
        actionSummary: `10-second sequence showcasing [${token}] bioacoustic frequency modulation and canine interaction.`,
        charactersPresent: ['Barnaby (Puppy 1)', 'Ganga (Juvenile Gharial)'],
        cameraDirection: 'Cinematic 35mm wildlife tracking shot, 60fps photorealistic',
        moodAndLighting: 'Golden hour river reflections, volumetric natural lighting',
        dialogueOrVoiceover: `[${token}] Bioacoustic vocalization synchronized with ambient acoustic track.`,
        dialogueSpeaker: 'Ganga (Juvenile Gharial)',
        synchronizedAudioTrack: `Gharial: ${token} bioacoustic signal.`,
        imagePrompt: `Photorealistic cinematic 35mm keyframe of juvenile gharial Ganga emitting [${token}] bioacoustic signal, retriever puppies nearby, National Geographic style`,
        videoPrompt: `10-second continuous cinematic shot: Ganga emitting [${token}] bioacoustic frequency while puppy observes on sandbar, 60fps`,
        transition: 'crossfade',
        transitionDuration: 1.0,
        ispaToken: token,
        ispaModality: modality,
        ispaSensorTarget: sensor,
      };
      onAddScene(activeAct.id, newScene);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6 animate-fade-in text-[#F0F0F0]">
      {/* Bento Header & Batch Operations Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0F0F12] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-white/80 font-mono">
              Active Flow Timeline & Narrative Acts
            </h2>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono">
              {acts.length} ACTS • {totalScenes} SCENES ({totalScenes * 10}s TOTAL RUNTIME)
            </span>
          </div>
          <p className="text-xs text-white/40 mt-1">
            Manage dramatic narrative acts, craft 10-second sequences, and inspect video prompt indices for Google Flow splicing.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenUploadActs && (
            <button
              id="btn-upload-acts-timeline"
              onClick={onOpenUploadActs}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(168,85,247,0.3)] border border-purple-400/40"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Acts</span>
            </button>
          )}

          <button
            id="btn-add-new-act"
            onClick={handleOpenAddAct}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(59,130,246,0.3)] border border-blue-400/40"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Act</span>
          </button>

          <button
            id="btn-gen-all-keyframes"
            onClick={onGenerateAllImages}
            disabled={isGeneratingImages}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-mono flex items-center gap-1.5 transition-colors border border-white/10"
          >
            {isGeneratingImages ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <Wand2 className="w-3.5 h-3.5 text-blue-400" />}
            <span>All Keyframes</span>
          </button>

          <button
            id="btn-gen-all-videos"
            onClick={onGenerateAllVideos}
            disabled={isGeneratingVideos}
            className="px-3.5 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-blue-300 text-xs font-mono flex items-center gap-1.5 transition-all border border-blue-500/40"
          >
            {isGeneratingVideos ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-3.5 h-3.5 text-blue-400" />}
            <span>All 10s Videos</span>
          </button>

          <button
            id="btn-gen-all-speech"
            onClick={onGenerateAllAudios}
            disabled={isGeneratingAudios}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-mono flex items-center gap-1.5 transition-colors border border-white/10"
          >
            {isGeneratingAudios ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" /> : <Volume2 className="w-3.5 h-3.5 text-purple-400" />}
            <span>All TTS Audio</span>
          </button>
        </div>
      </div>

      {/* Interactive Act Navigation Blocks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {acts.map((act) => {
          const isSelected = act.id === activeAct?.id;
          return (
            <div
              key={act.id}
              id={`act-tab-${act.id}`}
              onClick={() => setSelectedActId(act.id)}
              className={`text-left p-5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden group cursor-pointer ${
                isSelected
                  ? 'bg-[#0F0F12] border-blue-500/80 shadow-[0_0_16px_rgba(59,130,246,0.3)] ring-1 ring-blue-500/50'
                  : 'bg-[#0F0F12]/80 border-white/5 hover:border-white/20 hover:bg-[#0F0F12]'
              }`}
            >
              {isSelected && (
                <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
              )}

              <div className="space-y-2 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-blue-400">
                    Act {act.actNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-white/40">
                      {act.scenes.length * 10}.00s
                    </span>
                    <button
                      onClick={(e) => handleOpenEditAct(act, e)}
                      className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                      title="Edit Act Details"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-white truncate">
                  {act.title}
                </h4>

                <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed">
                  {act.dramaticPurpose}
                </p>
              </div>

              {/* Progress visual bar */}
              <div className="space-y-1.5 pt-4 relative z-10">
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isSelected
                        ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                        : 'bg-white/20'
                    }`}
                    style={{ width: isSelected ? '100%' : '40%' }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-white/30">
                  <span>{act.scenes.length} x 10s sequences</span>
                  <span className="font-bold">{isSelected ? 'ACTIVE ACT' : 'QUEUED'}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Inline Quick Add Act Block */}
        <button
          onClick={handleOpenAddAct}
          className="p-5 rounded-2xl border border-dashed border-white/15 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center text-center gap-2 text-white/40 hover:text-blue-300 min-h-[140px]"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider">
            + Add Another Act
          </span>
        </button>
      </div>

      {/* Selected Act Control & Mode Selector Bar */}
      {activeAct && (
        <div className="p-4 rounded-2xl bg-[#0F0F12] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-mono font-bold text-xs">
              A{activeAct.actNumber}
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                {activeAct.title}
              </h3>
              <p className="text-[10px] text-white/40 font-mono">
                {activeAct.scenes.length} Scenes • {activeAct.scenes.length * 10} Seconds Total Duration
              </p>
            </div>
          </div>

          {/* Mode Switcher & Arbitrary Multiplier Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Batch Scene Multiplier */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-[10px] font-mono">
              <span className="text-white/40 px-1.5 hidden sm:inline">Add 10s:</span>
              <button
                onClick={() => handleBatchAddScenes(1)}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors border border-white/5"
                title="Add 1 additional 10s scene prompt"
              >
                +1 (10s)
              </button>
              <button
                onClick={() => handleBatchAddScenes(3)}
                className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors"
                title="Add 3 additional 10s scene prompts"
              >
                +3 (30s)
              </button>
              <button
                onClick={() => handleBatchAddScenes(6)}
                className="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition-colors"
                title="Add 6 additional 10s scene prompts (1 minute)"
              >
                +6 (1m)
              </button>
              <button
                onClick={() => handleBatchAddScenes(12)}
                className="px-2 py-1 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-colors"
                title="Add 12 additional 10s scene prompts (2 minutes)"
              >
                +12 (2m)
              </button>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10">
              <button
                onClick={() => setActViewMode('storyboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                  actViewMode === 'storyboard'
                    ? 'bg-blue-600 text-white font-bold shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Storyboard Cards</span>
              </button>

              <button
                onClick={() => setActViewMode('prompts_matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                  actViewMode === 'prompts_matrix'
                    ? 'bg-blue-600 text-white font-bold shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>10s Video Prompts ({activeAct.scenes.length})</span>
              </button>

              <button
                onClick={() => setActViewMode('creator')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                  actViewMode === 'creator'
                    ? 'bg-blue-600 text-white font-bold shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Scene Creator</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: Interactive Scene Creator */}
      {activeAct && actViewMode === 'creator' && (
        <InteractiveSceneCreator
          act={activeAct}
          characters={characters}
          onAcceptScene={handleAcceptNewScene}
          onCancel={() => setActViewMode('storyboard')}
        />
      )}

      {/* VIEW 2: 10s Video Prompts Matrix with Indices */}
      {activeAct && actViewMode === 'prompts_matrix' && (
        <ActVideoPromptsGrid
          act={activeAct}
          onGenerateVideo={onGenerateVideo}
          onUpdateVideoPrompt={onUpdateVideoPrompt || (() => {})}
          onPreviewScene={onPreviewScene}
        />
      )}

      {/* VIEW 3: Storyboard Scene Cards Grid */}
      {activeAct && actViewMode === 'storyboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeAct.scenes.map((scene) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              actTitle={activeAct.title}
              onGenerateImage={onGenerateImage}
              onGenerateVideo={onGenerateVideo}
              onGenerateAudio={onGenerateAudio}
              onUpdateTransition={onUpdateTransition}
              onPreviewScene={onPreviewScene}
              onEditScene={handleOpenEditScene}
              onDeleteScene={onDeleteScene}
              onUpdateVideoPrompt={onUpdateVideoPrompt}
            />
          ))}

          {/* Inline Add Scene Prompt Card */}
          <div
            onClick={() => setActViewMode('creator')}
            className="rounded-2xl border border-dashed border-white/15 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center text-center p-8 gap-3 cursor-pointer min-h-[300px] group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:text-blue-400 group-hover:border-blue-500/40 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold font-mono uppercase text-white group-hover:text-blue-300">
                Create 10s Scene for {activeAct.title}
              </h4>
              <p className="text-xs text-white/40 mt-1 max-w-xs">
                Launch interactive scene workshop with camera choreography & 10s video prompt generator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Act Editor Modal */}
      <ActEditorModal
        isOpen={isActModalOpen}
        onClose={() => setIsActModalOpen(false)}
        act={editingAct}
        actCount={acts.length}
        onSave={handleSaveAct}
        onDelete={onDeleteAct}
      />

      {/* Scene Editor Modal */}
      {activeAct && (
        <SceneEditorModal
          isOpen={isSceneModalOpen}
          onClose={() => setIsSceneModalOpen(false)}
          scene={editingScene}
          actId={activeAct.id}
          actNumber={activeAct.actNumber}
          actTitle={activeAct.title}
          sceneCount={activeAct.scenes.length}
          availableCharacters={characters}
          onSave={handleSaveScene}
          onDelete={onDeleteScene}
        />
      )}
    </div>
  );
};
