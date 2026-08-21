import React, { useState, useEffect } from 'react';
import { StoryProject, Character, Scene, Act, VoiceName, TransitionType, ColorGrade } from './types';
import { Navbar } from './components/Navbar';
import { StoryPromptBar } from './components/StoryPromptBar';
import { CharacterCast } from './components/CharacterCast';
import { ActSceneTimeline } from './components/ActSceneTimeline';
import { GoogleFlowSplicer } from './components/GoogleFlowSplicer';
import { CinemaPlayer } from './components/CinemaPlayer';
import { AgentStatusModal } from './components/AgentStatusModal';
import { UploadActsModal } from './components/UploadActsModal';
import { ExportVideoModal } from './components/ExportVideoModal';
import { HackathonJudgesModal } from './components/HackathonJudgesModal';
import { PRESET_STORIES } from './data/presets';
import { INITIAL_PROJECT } from './data/initialProject';
import { Sparkles, Film, Wand2, Layers, Download, CheckCircle2, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'antigravity_flow_project_v1';

export default function App() {
  const [project, setProject] = useState<StoryProject | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.id && Array.isArray(parsed.acts) && Array.isArray(parsed.characters)) {
          return {
            ...INITIAL_PROJECT,
            ...parsed,
            characters: parsed.characters.map((c: any, idx: number) => ({
              id: c.id || `char-${idx + 1}`,
              name: c.name || `Character ${idx + 1}`,
              role: c.role || 'Protagonist',
              archetype: c.archetype || 'Tactical Specialist',
              visualDescription: c.visualDescription || 'Cinematic costume, focused expression.',
              costumeDetails: c.costumeDetails || 'High-contrast detailed clothing.',
              personalityTraits: Array.isArray(c.personalityTraits) ? c.personalityTraits : ['Determined', 'Analytical'],
              voiceType: c.voiceType || 'Kore',
              avatarPrompt: c.avatarPrompt || `Cinematic portrait of ${c.name || 'character'}`,
              avatarUrl: c.avatarUrl || null,
            })),
            acts: parsed.acts.map((a: any, aIdx: number) => ({
              id: a.id || `act-${aIdx + 1}`,
              actNumber: a.actNumber || aIdx + 1,
              title: a.title || `Act ${aIdx + 1}`,
              dramaticPurpose: a.dramaticPurpose || 'Narrative escalation and sequence progression.',
              summary: a.summary || '',
              scenes: Array.isArray(a.scenes) ? a.scenes.map((s: any, sIdx: number) => ({
                id: s.id || `scene-${aIdx + 1}-${sIdx + 1}`,
                actId: s.actId || `act-${aIdx + 1}`,
                actNumber: s.actNumber || aIdx + 1,
                actTitle: s.actTitle || a.title || `Act ${aIdx + 1}`,
                sceneNumber: s.sceneNumber || sIdx + 1,
                title: s.title || `Scene ${sIdx + 1}`,
                duration: s.duration || 10,
                setting: s.setting || 'Atmospheric cinematic environment',
                actionSummary: s.actionSummary || 'Action unfolds with continuous momentum.',
                charactersPresent: Array.isArray(s.charactersPresent) ? s.charactersPresent : [],
                cameraDirection: s.cameraDirection || 'Cinematic continuous tracking shot',
                moodAndLighting: s.moodAndLighting || 'Volumetric lighting with rich dynamic contrast',
                dialogueOrVoiceover: s.dialogueOrVoiceover || 'Maintain precision and hold trajectory.',
                dialogueSpeaker: s.dialogueSpeaker || 'Narrator',
                imagePrompt: s.imagePrompt || `Cinematic keyframe of ${s.title || 'scene'}`,
                videoPrompt: s.videoPrompt || s.imagePrompt || `10-second cinematic continuous shot: ${s.title || 'scene'}`,
                transition: s.transition || 'crossfade',
                transitionDuration: s.transitionDuration || 1.0,
                imageUrl: s.imageUrl || null,
                videoUrl: s.videoUrl || null,
                audioUrl: s.audioUrl || null,
              })) : [],
            })),
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved project from localStorage, using initial project:', e);
    }
    return INITIAL_PROJECT;
  });
  const [activeTab, setActiveTab] = useState<'prompt' | 'characters' | 'scenes' | 'flow' | 'player'>('prompt');
  
  // Storage & Save status state
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'idle'>('saved');
  const [lastSavedText, setLastSavedText] = useState<string>('All changes saved to local storage');

  // Agent & Generation states
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false);
  const [isGeneratingAudios, setIsGeneratingAudios] = useState(false);
  const [isAgentLogsOpen, setIsAgentLogsOpen] = useState(false);
  const [isCinemaPlayerOpen, setIsCinemaPlayerOpen] = useState(false);
  const [isUploadActsModalOpen, setIsUploadActsModalOpen] = useState(false);
  const [isExportVideoModalOpen, setIsExportVideoModalOpen] = useState(false);
  const [isJudgesGuideOpen, setIsJudgesGuideOpen] = useState(false);
  const [cinemaStartSceneIndex, setCinemaStartSceneIndex] = useState(0);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Quick Preset Loader for Judges & Users
  const handleLoadPreset = (presetId: string) => {
    const targetPreset = PRESET_STORIES.find((p) => p.id === presetId);
    if (!targetPreset) return;

    if (targetPreset.id === 'gharial-ispa-symphony') {
      setProject(INITIAL_PROJECT);
      setActiveTab('flow');
      showToast('Loaded "Gharial ISPA Sandbar Symphony" blueprint for judging', 'success');
      return;
    }

    // Generate quick story from preset parameters
    handleGenerateStory(
      targetPreset.prompt,
      targetPreset.visualStyle,
      targetPreset.genre,
      3,
      2
    );
    setActiveTab('flow');
    showToast(`Generating "${targetPreset.title}" narrative timeline...`, 'info');
  };

  // Debounced Auto-Save to Local Storage
  useEffect(() => {
    if (!project) return;

    setSaveStatus('saving');

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
        setSaveStatus('saved');
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSavedText(`Saved to local storage at ${timeStr}`);
      } catch (err) {
        console.error('Failed to auto-save to localStorage:', err);
        setSaveStatus('error');
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [project]);

  // Synchronous flush on tab close or page hide to guarantee no lost progress
  useEffect(() => {
    const handleFlushSave = () => {
      if (project) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
        } catch (err) {
          console.error('Failed to flush save before unload:', err);
        }
      }
    };

    window.addEventListener('beforeunload', handleFlushSave);
    window.addEventListener('pagehide', handleFlushSave);

    return () => {
      window.removeEventListener('beforeunload', handleFlushSave);
      window.removeEventListener('pagehide', handleFlushSave);
    };
  }, [project]);

  // Reset to default template
  const handleResetProject = () => {
    if (window.confirm('Reset project back to default initial template? All custom modifications will be replaced.')) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
      setProject(INITIAL_PROJECT);
      showToast('Project reset to initial template', 'info');
    }
  };

  // 1. Generate Storyboard with Antigravity Agent
  const handleGenerateStory = async (
    prompt: string,
    visualStyle: string,
    genre: string,
    targetActs: number,
    scenesPerAct: number
  ) => {
    try {
      setIsGeneratingStory(true);
      showToast('Antigravity Agent is reasoning and drafting character bible & acts...', 'info');

      const response = await fetch('/api/antigravity/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          visualStyle,
          genre,
          targetActs,
          scenesPerAct,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const newProject: StoryProject = await response.json();
      setProject(newProject);
      setActiveTab('characters');
      showToast(`Antigravity Agent synthesized: "${newProject.title}"`, 'success');
    } catch (error: any) {
      console.error('Failed to generate story:', error);
      showToast(`Failed to generate story: ${error.message}`, 'error');
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // 2. Character Customization Handlers
  const handleAddCharacter = (newChar: Character) => {
    if (!project) return;
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        characters: [...prev.characters, newChar],
      };
    });
    showToast(`Forged character "${newChar.name}" (${newChar.role})`, 'success');
  };

  const handleUpdateCharacter = (updatedChar: Character) => {
    if (!project) return;
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        characters: prev.characters.map((c) =>
          c.id === updatedChar.id ? updatedChar : c
        ),
      };
    });
    showToast(`Updated character profile for "${updatedChar.name}"`, 'success');
  };

  const handleDeleteCharacter = (characterId: string) => {
    if (!project) return;
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        characters: prev.characters.filter((c) => c.id !== characterId),
      };
    });
    showToast('Deleted character agent from roster', 'info');
  };

  // 3. Act Customization Handlers
  const handleAddAct = (newAct: Act) => {
    if (!project) return;
    setProject((prev) => {
      if (!prev) return null;
      const acts = [...prev.acts, newAct];
      const totalScenes = acts.reduce((acc, a) => acc + a.scenes.length, 0);
      return {
        ...prev,
        acts,
        totalDuration: totalScenes * 10,
      };
    });
    showToast(`Added ${newAct.title} to timeline`, 'success');
  };

  const handleUpdateAct = (updatedAct: Act) => {
    if (!project) return;
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        acts: prev.acts.map((a) => (a.id === updatedAct.id ? updatedAct : a)),
      };
    });
    showToast(`Updated ${updatedAct.title}`, 'success');
  };

  const handleDeleteAct = (actId: string) => {
    if (!project) return;
    setProject((prev) => {
      if (!prev) return null;
      const acts = prev.acts.filter((a) => a.id !== actId);
      const totalScenes = acts.reduce((acc, a) => acc + a.scenes.length, 0);
      return {
        ...prev,
        acts,
        totalDuration: totalScenes * 10,
      };
    });
    showToast('Deleted Act and its sequences', 'info');
  };

  const handleUploadActs = (uploadedActs: Act[], mode: 'append' | 'replace') => {
    if (!project) return;
    setProject((prev) => {
      if (!prev) return null;
      const acts = mode === 'replace' ? uploadedActs : [...prev.acts, ...uploadedActs];
      const totalScenes = acts.reduce((acc, a) => acc + a.scenes.length, 0);
      return {
        ...prev,
        acts,
        totalDuration: totalScenes * 10,
      };
    });
    const totalNewScenes = uploadedActs.reduce((acc, a) => acc + a.scenes.length, 0);
    showToast(
      mode === 'replace'
        ? `Replaced timeline with ${uploadedActs.length} acts (${totalNewScenes} scenes, ${totalNewScenes * 10}s runtime)!`
        : `Appended ${uploadedActs.length} acts (${totalNewScenes} new scenes) to timeline!`,
      'success'
    );
  };

  // 4. Scene Customization Handlers
  const handleAddScene = (actId: string, newScene: Scene) => {
    if (!project) return;
    setProject((prev) => {
      if (!prev) return null;
      const acts = prev.acts.map((act) => {
        if (act.id === actId) {
          return {
            ...act,
            scenes: [...act.scenes, newScene],
          };
        }
        return act;
      });
      const totalScenes = acts.reduce((acc, a) => acc + a.scenes.length, 0);
      return {
        ...prev,
        acts,
        totalDuration: totalScenes * 10,
      };
    });
    showToast(`Added 10-second scene: "${newScene.title}"`, 'success');
  };

  const handleUpdateScene = (updatedScene: Scene) => {
    if (!project) return;
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        acts: prev.acts.map((act) => ({
          ...act,
          scenes: act.scenes.map((s) =>
            s.id === updatedScene.id ? updatedScene : s
          ),
        })),
      };
    });
    showToast(`Saved scene: "${updatedScene.title}"`, 'success');
  };

  const handleDeleteScene = (sceneId: string) => {
    if (!project) return;
    setProject((prev) => {
      if (!prev) return null;
      const acts = prev.acts.map((act) => ({
        ...act,
        scenes: act.scenes.filter((s) => s.id !== sceneId),
      }));
      const totalScenes = acts.reduce((acc, a) => acc + a.scenes.length, 0);
      return {
        ...prev,
        acts,
        totalDuration: totalScenes * 10,
      };
    });
    showToast('Deleted scene from act', 'info');
  };

  const handleUpdateSceneVideoPrompt = (sceneId: string, videoPrompt: string) => {
    if (!project) return;
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        acts: prev.acts.map((act) => ({
          ...act,
          scenes: act.scenes.map((s) =>
            s.id === sceneId ? { ...s, videoPrompt } : s
          ),
        })),
      };
    });
    showToast('Updated 10-second video generation prompt', 'info');
  };

  // 5. Generate Character Avatar Keyframe
  const handleGenerateAvatar = async (characterId: string) => {
    if (!project) return;
    const char = project.characters.find((c) => c.id === characterId);
    if (!char) return;

    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        characters: prev.characters.map((c) =>
          c.id === characterId ? { ...c, isGeneratingAvatar: true } : c
        ),
      };
    });

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: char.avatarPrompt,
          aspectRatio: '1:1',
          visualStyle: project.visualStyle,
        }),
      });

      const data = await response.json();
      if (data.imageUrl) {
        setProject((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            characters: prev.characters.map((c) =>
              c.id === characterId
                ? { ...c, avatarUrl: data.imageUrl, isGeneratingAvatar: false }
                : c
            ),
          };
        });
        showToast(`Generated portrait for ${char.name}`, 'success');
      }
    } catch (err: any) {
      console.error('Avatar generation failed:', err);
      setProject((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          characters: prev.characters.map((c) =>
            c.id === characterId ? { ...c, isGeneratingAvatar: false } : c
          ),
        };
      });
      showToast(`Avatar generation failed: ${err.message}`, 'error');
    }
  };

  // Update Character Voice
  const handleUpdateVoice = (characterId: string, voice: VoiceName) => {
    if (!project) return;
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        characters: prev.characters.map((c) =>
          c.id === characterId ? { ...c, voiceType: voice } : c
        ),
      };
    });
    showToast(`Assigned voice "${voice}"`, 'info');
  };

  // Generate All Avatars
  const handleGenerateAllAvatars = async () => {
    if (!project) return;
    setIsGeneratingImages(true);
    showToast('Batch synthesizing all character portraits with Gemini...', 'info');
    for (const char of project.characters) {
      await handleGenerateAvatar(char.id);
    }
    setIsGeneratingImages(false);
    showToast('All character portraits generated!', 'success');
  };

  // 6. Generate Scene Storyboard Keyframe
  const handleGenerateSceneImage = async (sceneId: string) => {
    if (!project) return;
    let targetScene: Scene | undefined;
    for (const act of project.acts) {
      const found = act.scenes.find((s) => s.id === sceneId);
      if (found) {
        targetScene = found;
        break;
      }
    }
    if (!targetScene) return;

    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        acts: prev.acts.map((act) => ({
          ...act,
          scenes: act.scenes.map((s) =>
            s.id === sceneId ? { ...s, isGeneratingImage: true } : s
          ),
        })),
      };
    });

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: targetScene.imagePrompt,
          aspectRatio: project.aspectRatio === '9:16' ? '9:16' : '16:9',
          visualStyle: project.visualStyle,
        }),
      });

      const data = await response.json();
      if (data.imageUrl) {
        setProject((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            acts: prev.acts.map((act) => ({
              ...act,
              scenes: act.scenes.map((s) =>
                s.id === sceneId
                  ? { ...s, imageUrl: data.imageUrl, isGeneratingImage: false }
                  : s
              ),
            })),
          };
        });
        showToast(`Keyframe generated for "${targetScene.title}"`, 'success');
      }
    } catch (err: any) {
      console.error('Image generation failed:', err);
      setProject((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          acts: prev.acts.map((act) => ({
            ...act,
            scenes: act.scenes.map((s) =>
              s.id === sceneId ? { ...s, isGeneratingImage: false } : s
            ),
          })),
        };
      });
      showToast(`Image generation failed: ${err.message}`, 'error');
    }
  };

  // 7. Generate 10-Second Scene Video
  const handleGenerateSceneVideo = async (sceneId: string) => {
    if (!project) return;
    let targetScene: Scene | undefined;
    for (const act of project.acts) {
      const found = act.scenes.find((s) => s.id === sceneId);
      if (found) {
        targetScene = found;
        break;
      }
    }
    if (!targetScene) return;

    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        acts: prev.acts.map((act) => ({
          ...act,
          scenes: act.scenes.map((s) =>
            s.id === sceneId
              ? { ...s, videoStatus: 'generating', videoProgress: 10 }
              : s
          ),
        })),
      };
    });

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: targetScene.videoPrompt,
          sceneTitle: targetScene.title,
          duration: 10,
          aspectRatio: project.aspectRatio,
          visualStyle: project.visualStyle,
        }),
      });

      const data = await response.json();
      if (data.status === 'ready') {
        setProject((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            acts: prev.acts.map((act) => ({
              ...act,
              scenes: act.scenes.map((s) =>
                s.id === sceneId
                  ? {
                      ...s,
                      videoUrl: data.videoUrl,
                      videoStatus: 'ready',
                      videoProgress: 100,
                    }
                  : s
              ),
            })),
          };
        });
        showToast(`10-second clip ready for "${targetScene.title}"`, 'success');
      }
    } catch (err: any) {
      console.error('Video generation failed:', err);
      setProject((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          acts: prev.acts.map((act) => ({
            ...act,
            scenes: act.scenes.map((s) =>
              s.id === sceneId
                ? { ...s, videoStatus: 'error', videoError: err.message }
                : s
            ),
          })),
        };
      });
      showToast(`Video generation failed: ${err.message}`, 'error');
    }
  };

  // 8. Generate Scene TTS Audio
  const handleGenerateSceneAudio = async (sceneId: string) => {
    if (!project) return;
    let targetScene: Scene | undefined;
    for (const act of project.acts) {
      const found = act.scenes.find((s) => s.id === sceneId);
      if (found) {
        targetScene = found;
        break;
      }
    }
    if (!targetScene || !targetScene.dialogueOrVoiceover) return;

    let voiceName: VoiceName = 'Kore';
    if (targetScene.dialogueSpeaker) {
      const matchingChar = project.characters.find(
        (c) => c.name.toLowerCase() === targetScene?.dialogueSpeaker?.toLowerCase()
      );
      if (matchingChar) voiceName = matchingChar.voiceType;
    }

    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        acts: prev.acts.map((act) => ({
          ...act,
          scenes: act.scenes.map((s) =>
            s.id === sceneId ? { ...s, isGeneratingAudio: true } : s
          ),
        })),
      };
    });

    try {
      const response = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: targetScene.dialogueOrVoiceover,
          voice: voiceName,
        }),
      });

      const data = await response.json();
      if (data.audioUrl) {
        setProject((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            acts: prev.acts.map((act) => ({
              ...act,
              scenes: act.scenes.map((s) =>
                s.id === sceneId
                  ? { ...s, audioUrl: data.audioUrl, isGeneratingAudio: false }
                  : s
              ),
            })),
          };
        });
        showToast(`Synthesized TTS audio for "${targetScene.title}"`, 'success');
      } else if (data.useClientSpeech && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(targetScene.dialogueOrVoiceover);
        window.speechSynthesis.speak(utterance);
        setProject((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            acts: prev.acts.map((act) => ({
              ...act,
              scenes: act.scenes.map((s) =>
                s.id === sceneId ? { ...s, isGeneratingAudio: false } : s
              ),
            })),
          };
        });
      }
    } catch (err: any) {
      console.error('Audio generation failed:', err);
      setProject((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          acts: prev.acts.map((act) => ({
            ...act,
            scenes: act.scenes.map((s) =>
              s.id === sceneId ? { ...s, isGeneratingAudio: false } : s
            ),
          })),
        };
      });
      showToast(`Audio generation failed: ${err.message}`, 'error');
    }
  };

  // Batch Generators
  const handleGenerateAllImages = async () => {
    if (!project) return;
    setIsGeneratingImages(true);
    showToast('Batch generating all scene keyframes...', 'info');
    for (const act of project.acts) {
      for (const scene of act.scenes) {
        await handleGenerateSceneImage(scene.id);
      }
    }
    setIsGeneratingImages(false);
    showToast('All scene keyframes generated!', 'success');
  };

  const handleGenerateAllVideos = async () => {
    if (!project) return;
    setIsGeneratingVideos(true);
    showToast('Batch rendering 10s scene clips with Gemini Omni / Veo...', 'info');
    for (const act of project.acts) {
      for (const scene of act.scenes) {
        await handleGenerateSceneVideo(scene.id);
      }
    }
    setIsGeneratingVideos(false);
    showToast('All 10s video clips ready for Google Flow Splicer!', 'success');
  };

  const handleGenerateAllAudios = async () => {
    if (!project) return;
    setIsGeneratingAudios(true);
    showToast('Batch synthesizing narration audio with Gemini TTS...', 'info');
    for (const act of project.acts) {
      for (const scene of act.scenes) {
        await handleGenerateSceneAudio(scene.id);
      }
    }
    setIsGeneratingAudios(false);
    showToast('All scene audio synthesized!', 'success');
  };

  // Update Scene Transition
  const handleUpdateTransition = (sceneId: string, transition: TransitionType, duration: number) => {
    if (!project) return;
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        acts: prev.acts.map((act) => ({
          ...act,
          scenes: act.scenes.map((s) =>
            s.id === sceneId
              ? { ...s, transition, transitionDuration: duration }
              : s
          ),
        })),
      };
    });
    showToast(`Updated transition to ${transition} (${duration}s)`, 'info');
  };

  // Update Project Color Grading
  const handleUpdateColorGrade = (colorGrade: ColorGrade) => {
    if (!project) return;
    setProject((prev) => (prev ? { ...prev, colorGrade } : null));
    showToast(`Applied cinematic color grade: ${colorGrade}`, 'success');
  };

  // Export Project JSON
  const handleExportProject = () => {
    if (!project) return;
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/\s+/g, '-')}-project.json`;
    a.click();
    showToast('Exported narrative project JSON', 'success');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F0F0F0] flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        project={project}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'player') {
            setIsCinemaPlayerOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenAgentLogs={() => setIsAgentLogsOpen(true)}
        onPlayCinema={() => {
          setCinemaStartSceneIndex(0);
          setIsCinemaPlayerOpen(true);
        }}
        onExport={handleExportProject}
        onOpenExportVideo={() => setIsExportVideoModalOpen(true)}
        onOpenJudgesGuide={() => setIsJudgesGuideOpen(true)}
        isGeneratingAny={isGeneratingStory || isGeneratingImages || isGeneratingVideos || isGeneratingAudios}
        saveStatus={saveStatus}
        lastSavedText={lastSavedText}
        onResetProject={handleResetProject}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-8">
        {activeTab === 'prompt' && (
          <StoryPromptBar
            onGenerate={handleGenerateStory}
            isGenerating={isGeneratingStory}
            onOpenJudgesGuide={() => setIsJudgesGuideOpen(true)}
          />
        )}

        {activeTab === 'characters' && project && (
          <CharacterCast
            characters={project.characters}
            onGenerateAvatar={handleGenerateAvatar}
            onUpdateVoice={handleUpdateVoice}
            onGenerateAllAvatars={handleGenerateAllAvatars}
            onAddCharacter={handleAddCharacter}
            onUpdateCharacter={handleUpdateCharacter}
            onDeleteCharacter={handleDeleteCharacter}
          />
        )}

        {activeTab === 'scenes' && project && (
          <ActSceneTimeline
            acts={project.acts}
            characters={project.characters}
            onGenerateImage={handleGenerateSceneImage}
            onGenerateVideo={handleGenerateSceneVideo}
            onGenerateAudio={handleGenerateSceneAudio}
            onGenerateAllImages={handleGenerateAllImages}
            onGenerateAllVideos={handleGenerateAllVideos}
            onGenerateAllAudios={handleGenerateAllAudios}
            onUpdateTransition={handleUpdateTransition}
            onAddAct={handleAddAct}
            onUpdateAct={handleUpdateAct}
            onDeleteAct={handleDeleteAct}
            onAddScene={handleAddScene}
            onUpdateScene={handleUpdateScene}
            onDeleteScene={handleDeleteScene}
            onUpdateVideoPrompt={handleUpdateSceneVideoPrompt}
            onOpenUploadActs={() => setIsUploadActsModalOpen(true)}
            onPreviewScene={(scene) => {
              let idx = 0;
              let count = 0;
              for (const act of project.acts) {
                for (const s of act.scenes) {
                  if (s.id === scene.id) {
                    idx = count;
                    break;
                  }
                  count++;
                }
              }
              setCinemaStartSceneIndex(idx);
              setIsCinemaPlayerOpen(true);
            }}
            isGeneratingImages={isGeneratingImages}
            isGeneratingVideos={isGeneratingVideos}
            isGeneratingAudios={isGeneratingAudios}
          />
        )}

        {activeTab === 'flow' && project && (
          <GoogleFlowSplicer
            project={project}
            onUpdateTransition={handleUpdateTransition}
            onUpdateColorGrade={handleUpdateColorGrade}
            onOpenUploadActs={() => setIsUploadActsModalOpen(true)}
            onAddAct={handleAddAct}
            onOpenCinemaPlayer={(startIndex = 0) => {
              setCinemaStartSceneIndex(startIndex);
              setIsCinemaPlayerOpen(true);
            }}
            onGenerateVideo={handleGenerateSceneVideo}
            onGenerateImage={handleGenerateSceneImage}
            onGenerateAudio={handleGenerateSceneAudio}
            onGenerateAllVideos={handleGenerateAllVideos}
            onGenerateAllImages={handleGenerateAllImages}
            onGenerateAllAudios={handleGenerateAllAudios}
            onOpenExportVideo={() => setIsExportVideoModalOpen(true)}
            isGeneratingVideos={isGeneratingVideos}
            isGeneratingImages={isGeneratingImages}
            isGeneratingAudios={isGeneratingAudios}
          />
        )}
      </main>

      {/* Bento Grid System Footer Bar */}
      <footer className="w-full border-t border-white/10 bg-[#0F0F12] py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-white/40 font-mono">
          <div>SYSTEM ID: AG-8892-Z // SECTOR: DELTA // WORKSPACE: PRODUCTION_01 // GOOGLE FLOW SYNC</div>
          <div className="flex gap-4">
            <span className="hover:text-white/80 cursor-pointer transition-colors">ANTIGRAVITY AGENTS</span>
            <span>•</span>
            <span className="hover:text-white/80 cursor-pointer transition-colors">10S VEO PROMPTS</span>
            <span>•</span>
            <span className="hover:text-white/80 cursor-pointer transition-colors">FLOW SPLICER</span>
          </div>
        </div>
      </footer>

      {/* Cinema Master Player Modal */}
      {isCinemaPlayerOpen && project && (
        <CinemaPlayer
          project={project}
          initialSceneIndex={cinemaStartSceneIndex}
          onClose={() => setIsCinemaPlayerOpen(false)}
          onOpenExportVideo={() => setIsExportVideoModalOpen(true)}
        />
      )}

      {/* Export MP4 Video Modal */}
      {isExportVideoModalOpen && project && (
        <ExportVideoModal
          project={project}
          isOpen={isExportVideoModalOpen}
          onClose={() => setIsExportVideoModalOpen(false)}
        />
      )}

      {/* Upload Acts & Storyboard Sequences Modal */}
      {project && (
        <UploadActsModal
          isOpen={isUploadActsModalOpen}
          onClose={() => setIsUploadActsModalOpen(false)}
          onUploadActs={handleUploadActs}
          currentActCount={project.acts.length}
        />
      )}

      {/* Antigravity Agent Proof of Work Inspector Modal */}
      {project && (
        <AgentStatusModal
          isOpen={isAgentLogsOpen}
          onClose={() => setIsAgentLogsOpen(false)}
          steps={project.agentSteps}
          isGenerating={isGeneratingStory}
        />
      )}

      {/* Hackathon Judges Interactive Guide Modal */}
      <HackathonJudgesModal
        isOpen={isJudgesGuideOpen}
        onClose={() => setIsJudgesGuideOpen(false)}
        onLoadPreset={handleLoadPreset}
        onOpenCinema={() => {
          setCinemaStartSceneIndex(0);
          setIsCinemaPlayerOpen(true);
        }}
        onOpenExportVideo={() => setIsExportVideoModalOpen(true)}
        project={project}
      />

      {/* Floating Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md border ${
              notification.type === 'success'
                ? 'bg-[#0F0F12] text-green-300 border-green-500/40 shadow-[0_0_12px_rgba(74,222,128,0.2)]'
                : notification.type === 'error'
                ? 'bg-[#0F0F12] text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                : 'bg-[#0F0F12] text-blue-300 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
            }`}
          >
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {notification.type === 'info' && <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />}
            <span className="font-mono text-xs">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
