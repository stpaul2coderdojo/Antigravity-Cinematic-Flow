export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export type TransitionType = 'cut' | 'crossfade' | 'dissolve' | 'fade-to-black' | 'whip-pan' | 'glitch';

export type ColorGrade = 'standard' | 'teal-orange' | 'noir-monochrome' | 'warm-vintage' | 'cyber-neon' | 'bleach-bypass';

export type IspaModality = 
  | 'Airborne (A)' 
  | 'Subaquatic (W)' 
  | 'Substrate / Infrasonic (S)'
  | 'Substrate/Infrasonic (S)' 
  | 'Multi-Modal / Interface'
  | 'Mechanical Percussive'
  | 'Airborne/Substrate (A/S)';

export type IspaSensorTarget = 
  | 'Microphone' 
  | 'Hydrophone' 
  | 'Geophone / Low-frequency hydrophone' 
  | 'Dual Array'
  | 'Parabolic Mic'
  | 'Directional Shotgun'
  | 'Shotgun Mic'
  | 'Seismic Geophone'
  | 'Infrasound Sensor'
  | 'Boundary Mic';

export interface IspaAnnotation {
  token: string; // e.g. 'HC', 'CC', 'HS', 'DC', 'GW', 'GR', 'SN', 'BB', 'POP', 'SAV', 'BR', 'JC'
  name: string; // e.g. 'Hatching Synchronization'
  modality: IspaModality;
  sensorTarget: IspaSensorTarget;
  frequencyRange?: string; // e.g. '10 - 25 Hz' or '800 - 3200 Hz'
  behavioralContext: string;
}

export interface Character {
  id: string;
  name: string;
  role: 'Protagonist' | 'Antagonist' | 'Deuteragonist' | 'Mentor' | 'Supporting' | 'Narrator';
  archetype: string;
  visualDescription: string;
  costumeDetails: string;
  personalityTraits: string[];
  voiceType: VoiceName;
  avatarPrompt: string;
  avatarUrl?: string;
  isGeneratingAvatar?: boolean;
}

export interface Scene {
  id: string;
  actId: string;
  actNumber: number;
  actTitle: string;
  sceneNumber: number;
  title: string;
  duration: number; // 10 seconds standard
  setting: string;
  actionSummary: string;
  charactersPresent: string[];
  cameraDirection: string;
  moodAndLighting: string;
  dialogueOrVoiceover: string; // Used for Bioacoustic track or puppy bark synchronizations
  dialogueSpeaker?: string;
  audioUrl?: string;
  isGeneratingAudio?: boolean;
  imagePrompt: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
  videoPrompt: string;
  videoUrl?: string;
  operationName?: string;
  videoStatus?: 'idle' | 'generating' | 'ready' | 'error';
  videoProgress?: number;
  videoError?: string;
  transition: TransitionType;
  transitionDuration: number;
  // ISPA Specific annotations
  ispaToken?: string;
  ispaModality?: IspaModality;
  ispaSensorTarget?: IspaSensorTarget;
  synchronizedAudioTrack?: string;
}

export interface Act {
  id: string;
  actNumber: number;
  title: string;
  dramaticPurpose: string;
  summary: string;
  scenes: Scene[];
}

export interface AgentExecutionStep {
  id: string;
  type: 'antigravity_reasoning' | 'character_design' | 'act_structuring' | 'scene_framing' | 'prompt_synthesis';
  title: string;
  status: 'running' | 'completed' | 'failed';
  logs: string[];
  timestamp: string;
  detail?: string;
}

export interface StoryProject {
  id: string;
  title: string;
  logline: string;
  genre: string;
  visualStyle: string;
  cinematicTone: string;
  aspectRatio: '16:9' | '9:16';
  colorGrade: ColorGrade;
  characters: Character[];
  acts: Act[];
  totalDuration: number;
  agentSteps: AgentExecutionStep[];
  createdAt: string;
}

export interface PresetStory {
  id: string;
  title: string;
  genre: string;
  visualStyle: string;
  logline: string;
  prompt: string;
  thumbnail: string;
  ispaEnabled?: boolean;
}
