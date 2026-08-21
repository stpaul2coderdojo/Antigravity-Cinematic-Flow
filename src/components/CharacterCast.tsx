import React, { useState, useRef } from 'react';
import { Character, VoiceName } from '../types';
import { CharacterForgeModal } from './CharacterForgeModal';
import { PersonalityForge } from './PersonalityForge';
import { 
  User, 
  Sparkles, 
  Wand2, 
  Volume2, 
  Shield, 
  RefreshCw, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  Sliders, 
  LayoutGrid,
  Play,
  Square
} from 'lucide-react';

interface CharacterCastProps {
  characters: Character[];
  onGenerateAvatar: (characterId: string) => void;
  onUpdateVoice: (characterId: string, voice: VoiceName) => void;
  onGenerateAllAvatars: () => void;
  onAddCharacter?: (newChar: Character) => void;
  onUpdateCharacter?: (updatedChar: Character) => void;
  onDeleteCharacter?: (characterId: string) => void;
  isGeneratingAll?: boolean;
}

const VOICES: Array<{ name: VoiceName; label: string; tone: string }> = [
  { name: 'Kore', label: 'Kore', tone: 'Calm, authoritative, warm' },
  { name: 'Puck', label: 'Puck', tone: 'Energetic, expressive, young' },
  { name: 'Charon', label: 'Charon', tone: 'Deep, mysterious, gritty' },
  { name: 'Fenrir', label: 'Fenrir', tone: 'Resonant, powerful, intense' },
  { name: 'Zephyr', label: 'Zephyr', tone: 'Smooth, intellectual, crisp' },
];

export const CharacterCast: React.FC<CharacterCastProps> = ({
  characters,
  onGenerateAvatar,
  onUpdateVoice,
  onGenerateAllAvatars,
  onAddCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
  isGeneratingAll = false,
}) => {
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isForgeModalOpen, setIsForgeModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'roster' | 'personality_forge'>('roster');
  const [auditioningCharId, setAuditioningCharId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const handleAuditionVoice = async (char: Character) => {
    try {
      if (auditioningCharId === char.id) {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current.currentTime = 0;
        }
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        setAuditioningCharId(null);
        return;
      }

      // Stop any prior playback
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      setAuditioningCharId(char.id);
      const textToSpeak = `I am ${char.name}, ${char.role}. Ready for action.`;

      const response = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          voice: char.voiceType,
        }),
      });

      const data = await response.json();
      if (data.audioUrl) {
        if (!audioPlayerRef.current) {
          audioPlayerRef.current = new Audio();
        }
        const audio = audioPlayerRef.current;
        audio.src = data.audioUrl;
        audio.onended = () => setAuditioningCharId(null);
        audio.onerror = () => {
          // If browser audio element encounters playback restriction, fallback to SpeechSynthesis
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.onend = () => setAuditioningCharId(null);
            utterance.onerror = () => setAuditioningCharId(null);
            window.speechSynthesis.speak(utterance);
          } else {
            setAuditioningCharId(null);
          }
        };

        try {
          await audio.play();
        } catch {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.onend = () => setAuditioningCharId(null);
            utterance.onerror = () => setAuditioningCharId(null);
            window.speechSynthesis.speak(utterance);
          } else {
            setAuditioningCharId(null);
          }
        }
      } else if (data.useClientSpeech && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.onend = () => setAuditioningCharId(null);
        utterance.onerror = () => setAuditioningCharId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setAuditioningCharId(null);
      }
    } catch {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`I am ${char.name}, ${char.role}. Ready for action.`);
        utterance.onend = () => setAuditioningCharId(null);
        utterance.onerror = () => setAuditioningCharId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setAuditioningCharId(null);
      }
    }
  };

  const handleOpenNewCharacter = () => {
    setEditingCharacter(null);
    setIsForgeModalOpen(true);
  };

  const handleOpenEditCharacter = (char: Character) => {
    setEditingCharacter(char);
    setIsForgeModalOpen(true);
  };

  const handleSaveCharacter = (char: Character) => {
    if (editingCharacter && onUpdateCharacter) {
      onUpdateCharacter(char);
    } else if (onAddCharacter) {
      onAddCharacter(char);
    }
  };

  const handleSaveFromPersonalityForge = (char: Character) => {
    const exists = characters.some((c) => c.id === char.id);
    if (exists && onUpdateCharacter) {
      onUpdateCharacter(char);
    } else if (onAddCharacter) {
      onAddCharacter(char);
    }
    setViewMode('roster');
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6 animate-fade-in text-[#F0F0F0]">
      {/* Bento Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0F0F12] border border-white/10 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-white/80 font-mono flex items-center gap-2">
              Character Forge & Persona Matrix
            </h2>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono">
              {characters.length} AGENTS ACTIVE
            </span>
          </div>
          <p className="text-xs text-white/40">
            Forge and customize visual profiles, psychological personality matrix, and audition live spoken dialogue with Gemini TTS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-white/10">
            <button
              onClick={() => setViewMode('roster')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                viewMode === 'roster'
                  ? 'bg-blue-600 text-white font-bold shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cast Roster</span>
            </button>

            <button
              onClick={() => setViewMode('personality_forge')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                viewMode === 'personality_forge'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-500/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Personality Forge</span>
            </button>
          </div>

          <button
            id="btn-forge-new-character"
            onClick={handleOpenNewCharacter}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)] border border-blue-400/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Forge Agent</span>
          </button>

          <button
            id="btn-generate-all-portraits"
            onClick={onGenerateAllAvatars}
            disabled={isGeneratingAll}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-mono flex items-center justify-center gap-1.5 transition-all border border-white/10"
          >
            {isGeneratingAll ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <Wand2 className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span>All Portraits</span>
          </button>
        </div>
      </div>

      {/* Interactive Personality Forge Mode */}
      {viewMode === 'personality_forge' && (
        <PersonalityForge
          characters={characters}
          onSaveCharacter={handleSaveFromPersonalityForge}
        />
      )}

      {/* Characters Bento Grid Mode */}
      {viewMode === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((char, index) => {
            const isBlueAccent = index % 2 === 0;
            return (
              <div
                key={char.id}
                id={`character-card-${char.id}`}
                className="rounded-2xl bg-[#0F0F12] border border-white/5 hover:border-white/20 transition-all overflow-hidden flex flex-col shadow-xl group p-5 gap-4"
              >
                {/* Portrait Visual Container */}
                <div className="relative aspect-video sm:aspect-square w-full bg-black/60 rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
                  {char.avatarUrl ? (
                    <img
                      src={char.avatarUrl}
                      alt={char.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-white/30 space-y-2">
                      <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50">
                        <User className="w-7 h-7" />
                      </div>
                      <p className="text-[11px] font-mono text-white/50">Portrait Pending</p>
                      <p className="text-[10px] text-white/30 line-clamp-2 max-w-[200px] font-mono">{char.avatarPrompt}</p>
                    </div>
                  )}

                  {/* Role badge top left */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border ${
                      isBlueAccent
                        ? 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                        : 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                    }`}>
                      {char.role}
                    </span>
                  </div>

                  {/* Actions Top Right */}
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <button
                      id={`btn-avatar-${char.id}`}
                      onClick={() => onGenerateAvatar(char.id)}
                      disabled={char.isGeneratingAvatar}
                      className="p-1.5 rounded-lg bg-black/80 hover:bg-black text-white/90 border border-white/20 text-xs flex items-center gap-1 shadow-lg backdrop-blur-md transition-all active:scale-95"
                      title="Convert character description to image with Nano Banana (Gemini Flash Image)"
                    >
                      {char.isGeneratingAvatar ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5 text-blue-400" />
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenEditCharacter(char)}
                      className="p-1.5 rounded-lg bg-black/80 hover:bg-black text-white/80 hover:text-white border border-white/20 text-xs shadow-lg backdrop-blur-md transition-colors"
                      title="Edit Character Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-white/70" />
                    </button>

                    {onDeleteCharacter && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete ${char.name}?`)) {
                            onDeleteCharacter(char.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-black/80 hover:bg-red-950 text-red-400 border border-red-500/20 text-xs shadow-lg backdrop-blur-md transition-colors"
                        title="Delete Character"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Character Header Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      isBlueAccent
                        ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                        : 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
                    }`}>
                      A{index + 1}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">{char.name}</h3>
                      <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider truncate">{char.archetype}</p>
                    </div>
                  </div>

                  {/* Character Narrative Description in Bento Box */}
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <p className="text-[11px] leading-relaxed text-white/70 italic">
                      "{char.visualDescription}"
                    </p>
                  </div>

                  {/* Costume / Gear Box */}
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-blue-400" />
                      Costume & Gear
                    </span>
                    <p className="text-[11px] text-white/60 leading-normal">{char.costumeDetails}</p>
                  </div>
                </div>

                {/* Personality Traits Badges */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-white/30">Personality Matrix</span>
                  <div className="flex flex-wrap gap-1.5">
                    {char.personalityTraits.map((trait, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded bg-white/5 text-white/60 text-[10px] font-mono border border-white/10"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Voice Model Selector & Live Audition */}
                <div className="pt-3 border-t border-white/10 space-y-1 mt-auto">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-purple-400" />
                      Gemini TTS Voice Model
                    </label>
                    <button
                      id={`audition-btn-${char.id}`}
                      onClick={() => handleAuditionVoice(char)}
                      className={`text-[9px] font-mono px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
                        auditioningCharId === char.id
                          ? 'bg-purple-600 text-white animate-pulse'
                          : 'bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-500/30'
                      }`}
                      title="Audition voice with Gemini TTS"
                    >
                      {auditioningCharId === char.id ? (
                        <>
                          <Square className="w-2.5 h-2.5 fill-white" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-2.5 h-2.5 fill-purple-300" />
                          <span>Audition</span>
                        </>
                      )}
                    </button>
                  </div>
                  <select
                    id={`voice-select-${char.id}`}
                    value={char.voiceType}
                    onChange={(e) => onUpdateVoice(char.id, e.target.value as VoiceName)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white/80 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  >
                    {VOICES.map((v) => (
                      <option key={v.name} value={v.name} className="bg-[#0F0F12] text-white">
                        {v.name} ({v.tone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Character Forge Modal */}
      <CharacterForgeModal
        isOpen={isForgeModalOpen}
        onClose={() => setIsForgeModalOpen(false)}
        character={editingCharacter}
        onSave={handleSaveCharacter}
        onDelete={onDeleteCharacter}
      />
    </div>
  );
};
