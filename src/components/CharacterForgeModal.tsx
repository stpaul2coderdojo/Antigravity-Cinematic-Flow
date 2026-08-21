import React, { useState } from 'react';
import { Character, VoiceName } from '../types';
import { X, User, Wand2, Shield, Volume2, Sparkles, Trash2, Check, RefreshCw } from 'lucide-react';

interface CharacterForgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character | null; // null means adding a new character
  onSave: (character: Character) => void;
  onDelete?: (characterId: string) => void;
  onGenerateAvatar?: (prompt: string) => Promise<string | null>;
}

const ROLES: Character['role'][] = [
  'Protagonist',
  'Antagonist',
  'Deuteragonist',
  'Mentor',
  'Supporting',
  'Narrator',
];

const VOICES: Array<{ name: VoiceName; label: string; tone: string }> = [
  { name: 'Kore', label: 'Kore', tone: 'Calm, authoritative, warm' },
  { name: 'Puck', label: 'Puck', tone: 'Energetic, expressive, young' },
  { name: 'Charon', label: 'Charon', tone: 'Deep, mysterious, gritty' },
  { name: 'Fenrir', label: 'Fenrir', tone: 'Resonant, powerful, intense' },
  { name: 'Zephyr', label: 'Zephyr', tone: 'Smooth, intellectual, crisp' },
];

export const CharacterForgeModal: React.FC<CharacterForgeModalProps> = ({
  isOpen,
  onClose,
  character,
  onSave,
  onDelete,
  onGenerateAvatar,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(character?.name || '');
  const [role, setRole] = useState<Character['role']>(character?.role || 'Protagonist');
  const [archetype, setArchetype] = useState(character?.archetype || '');
  const [visualDescription, setVisualDescription] = useState(character?.visualDescription || '');
  const [costumeDetails, setCostumeDetails] = useState(character?.costumeDetails || '');
  const [traitsString, setTraitsString] = useState(character?.personalityTraits?.join(', ') || '');
  const [voiceType, setVoiceType] = useState<VoiceName>(character?.voiceType || 'Kore');
  const [avatarPrompt, setAvatarPrompt] = useState(character?.avatarPrompt || '');
  const [avatarUrl, setAvatarUrl] = useState(character?.avatarUrl || '');
  const [isGeneratingPortrait, setIsGeneratingPortrait] = useState(false);

  const handleGeneratePortrait = async () => {
    if (!avatarPrompt && !visualDescription) return;
    const promptToUse = avatarPrompt || `Cinematic character portrait of ${name}, ${role}, ${visualDescription}, photorealistic 8k, dramatic lighting`;
    
    setIsGeneratingPortrait(true);
    try {
      if (onGenerateAvatar) {
        const url = await onGenerateAvatar(promptToUse);
        if (url) {
          setAvatarUrl(url);
        }
      } else {
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptToUse, aspectRatio: '1:1' }),
        });
        const data = await res.json();
        if (data.imageUrl) {
          setAvatarUrl(data.imageUrl);
        }
      }
    } catch (err) {
      console.error('Failed to generate portrait:', err);
    } finally {
      setIsGeneratingPortrait(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const traits = traitsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updated: Character = {
      id: character?.id || `char-${Date.now()}`,
      name: name.trim(),
      role,
      archetype: archetype.trim() || 'Hero',
      visualDescription: visualDescription.trim(),
      costumeDetails: costumeDetails.trim(),
      personalityTraits: traits.length > 0 ? traits : ['Resourceful', 'Focused'],
      voiceType,
      avatarPrompt: avatarPrompt.trim() || `Cinematic portrait of ${name.trim()}, ${role}, ${archetype}, 8k`,
      avatarUrl: avatarUrl || undefined,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0F0F12] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                {character ? `Edit Agent: ${character.name}` : 'Forge New Character Agent'}
              </h3>
              <p className="text-[11px] text-white/40 font-mono">
                Configure visual continuity, archetype traits & Gemini voice assignments
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Avatar Preview & Quick Gen */}
          <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-24 h-24 rounded-xl bg-[#050505] border border-white/15 overflow-hidden shrink-0 flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name || 'Avatar'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-8 h-8 text-white/20" />
              )}
              {isGeneratingPortrait && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2 w-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                  Portrait Keyframe Prompt
                </span>
                <button
                  type="button"
                  onClick={handleGeneratePortrait}
                  disabled={isGeneratingPortrait}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-mono flex items-center gap-1.5 transition-all shadow-md"
                >
                  {isGeneratingPortrait ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                  <span>Generate with Nano Banana</span>
                </button>
              </div>
              <input
                type="text"
                value={avatarPrompt}
                onChange={(e) => setAvatarPrompt(e.target.value)}
                placeholder="Cinematic close-up portrait, cybernetic eye, volumetric lighting..."
                className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Name & Role Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                Character Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Captain Marcus Vance"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                Dramatic Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Character['role'])}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="bg-[#0F0F12] text-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Archetype & Voice Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                Archetype
              </label>
              <input
                type="text"
                value={archetype}
                onChange={(e) => setArchetype(e.target.value)}
                placeholder="e.g. Relentless Navigator, Cybernetic Detective"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-purple-400" />
                Gemini TTS Voice
              </label>
              <select
                value={voiceType}
                onChange={(e) => setVoiceType(e.target.value as VoiceName)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
              >
                {VOICES.map((v) => (
                  <option key={v.name} value={v.name} className="bg-[#0F0F12] text-white">
                    {v.name} ({v.tone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Visual Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
              Visual Appearance & Physical Traits
            </label>
            <textarea
              rows={2}
              value={visualDescription}
              onChange={(e) => setVisualDescription(e.target.value)}
              placeholder="Weathered features, piercing cyan optic implants, high-collar tactical coat..."
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Costume & Gear */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-400" />
              Costume Details & Props
            </label>
            <input
              type="text"
              value={costumeDetails}
              onChange={(e) => setCostumeDetails(e.target.value)}
              placeholder="Distressed reinforced flight suit with illuminated telemetry buckles..."
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Personality Traits */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
              Personality Traits (Comma-separated)
            </label>
            <input
              type="text"
              value={traitsString}
              onChange={(e) => setTraitsString(e.target.value)}
              placeholder="Decisive, Hyper-focused, Cynical, Relentless"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
          {character && onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete character ${character.name}?`)) {
                  onDelete(character.id);
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono flex items-center gap-1.5 border border-red-500/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Character</span>
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
              <span>{character ? 'Save Agent Profile' : 'Forge Character'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
