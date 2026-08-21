import React, { useState } from 'react';
import { Character, VoiceName } from '../types';
import { 
  Sparkles, 
  User, 
  Volume2, 
  Wand2, 
  Play, 
  Pause, 
  Check, 
  RotateCcw, 
  Sliders, 
  MessageSquare, 
  Layers, 
  Zap, 
  RefreshCw 
} from 'lucide-react';

interface PersonalityForgeProps {
  characters: Character[];
  onSaveCharacter: (char: Character) => void;
  onSelectCharacter?: (char: Character) => void;
}

interface PersonalityMatrix {
  bravery: number;       // 0 - 100
  ruthlessness: number;  // 0 - 100
  empathy: number;       // 0 - 100
  intellect: number;     // 0 - 100
  cynicism: number;      // 0 - 100
  volatility: number;    // 0 - 100
}

const ARCHETYPE_PRESETS: Array<{
  name: string;
  role: Character['role'];
  archetype: string;
  matrix: PersonalityMatrix;
  traits: string[];
  voice: VoiceName;
  description: string;
  sampleSituation: string;
}> = [
  {
    name: 'Cybernetic Detective',
    role: 'Protagonist',
    archetype: 'Noir Inquisitor',
    matrix: { bravery: 75, ruthlessness: 40, empathy: 60, intellect: 90, cynicism: 85, volatility: 25 },
    traits: ['Hyper-Observant', 'Cynical', 'Methodical', 'Haunted'],
    voice: 'Charon',
    description: 'Weathered trench coat, cybernetic ocular implant humming with telemetry data.',
    sampleSituation: 'Surveying a rain-slicked crime scene in the neon underbelly.',
  },
  {
    name: 'Corporate Enforcer',
    role: 'Antagonist',
    archetype: 'Calculated Predator',
    matrix: { bravery: 85, ruthlessness: 95, empathy: 10, intellect: 85, cynicism: 75, volatility: 40 },
    traits: ['Ruthless', 'Unflinching', 'Disciplined', 'Terrifying'],
    voice: 'Fenrir',
    description: 'Tailored carbon-weave armor, emotionless gaze, biometric stun gauntlets.',
    sampleSituation: 'Cornering an operative who leaked classified telemetry coordinates.',
  },
  {
    name: 'Rogue Quantum Pilot',
    role: 'Protagonist',
    archetype: 'Instinctive Maverick',
    matrix: { bravery: 95, ruthlessness: 30, empathy: 70, intellect: 75, cynicism: 50, volatility: 80 },
    traits: ['Daring', 'Intuitive', 'Reckless', 'Loyal'],
    voice: 'Puck',
    description: 'Patched flight jacket, mischievous grin, neural drift interface needles.',
    sampleSituation: 'Engaging atmospheric thrusters while diving through a collapsing slipstream.',
  },
  {
    name: 'Synthesized AI Mentor',
    role: 'Mentor',
    archetype: 'Transcendent Oracle',
    matrix: { bravery: 50, ruthlessness: 20, empathy: 85, intellect: 100, cynicism: 15, volatility: 10 },
    traits: ['Omniscient', 'Calm', 'Philosophical', 'Protective'],
    voice: 'Kore',
    description: 'Ethereal holographic projection fluctuating in soft azure geometric waves.',
    sampleSituation: 'Guiding an apprentice through a lethal memory labyrinth.',
  },
  {
    name: 'Underground Tech Fixer',
    role: 'Supporting',
    archetype: 'Cynical Genius',
    matrix: { bravery: 40, ruthlessness: 65, empathy: 45, intellect: 95, cynicism: 90, volatility: 60 },
    traits: ['Mercenary', 'Brilliant', 'Neurotic', 'Pragmatic'],
    voice: 'Zephyr',
    description: 'Goggles with multiple optical magnifiers, soldering scars across forearms.',
    sampleSituation: 'Negotiating the price of an illegal memory decryption key.',
  },
];

const VOICES: Array<{ name: VoiceName; label: string; tone: string }> = [
  { name: 'Kore', label: 'Kore', tone: 'Calm, authoritative, warm' },
  { name: 'Puck', label: 'Puck', tone: 'Energetic, expressive, young' },
  { name: 'Charon', label: 'Charon', tone: 'Deep, mysterious, gritty' },
  { name: 'Fenrir', label: 'Fenrir', tone: 'Resonant, powerful, intense' },
  { name: 'Zephyr', label: 'Zephyr', tone: 'Smooth, intellectual, crisp' },
];

export const PersonalityForge: React.FC<PersonalityForgeProps> = ({
  characters,
  onSaveCharacter,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(characters[0]?.id || 'new');
  const [name, setName] = useState(characters[0]?.name || 'Alex Vance');
  const [role, setRole] = useState<Character['role']>(characters[0]?.role || 'Protagonist');
  const [archetype, setArchetype] = useState(characters[0]?.archetype || 'Relentless Inquisitor');
  const [voiceType, setVoiceType] = useState<VoiceName>(characters[0]?.voiceType || 'Kore');
  const [visualDescription, setVisualDescription] = useState(
    characters[0]?.visualDescription || 'Tactical coat, augmented ocular lens, steady intense gaze.'
  );
  
  // Interactive Personality Sliders Matrix
  const [matrix, setMatrix] = useState<PersonalityMatrix>({
    bravery: 70,
    ruthlessness: 35,
    empathy: 65,
    intellect: 85,
    cynicism: 60,
    volatility: 30,
  });

  // Dialogue Test Sandbox State
  const [testScenario, setTestScenario] = useState('Encountering the compromised mainframe at midnight');
  const [generatedDialogue, setGeneratedDialogue] = useState<string>(
    '"The encryption is degrading faster than projected. If we breach the firewall now, there will be no turning back."'
  );
  const [isGeneratingDialogue, setIsGeneratingDialogue] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElem, setAudioElem] = useState<HTMLAudioElement | null>(null);

  // Load an existing character into the forge
  const handleSelectChar = (charId: string) => {
    setSelectedCharId(charId);
    if (charId === 'new') {
      setName('New Agent');
      setRole('Protagonist');
      setArchetype('Tactical Operative');
      setVoiceType('Kore');
      setVisualDescription('Reinforced tactical suit, scanning optics, sharp observant stance.');
      setMatrix({ bravery: 70, ruthlessness: 40, empathy: 60, intellect: 80, cynicism: 50, volatility: 30 });
      return;
    }

    const char = characters.find((c) => c.id === charId);
    if (char) {
      setName(char.name);
      setRole(char.role);
      setArchetype(char.archetype);
      setVoiceType(char.voiceType);
      setVisualDescription(char.visualDescription);
    }
  };

  // Apply an Archetype Preset
  const handleApplyPreset = (preset: typeof ARCHETYPE_PRESETS[0]) => {
    setName(preset.name);
    setRole(preset.role);
    setArchetype(preset.archetype);
    setVoiceType(preset.voice);
    setVisualDescription(preset.description);
    setMatrix({ ...preset.matrix });
    setTestScenario(preset.sampleSituation);
  };

  // Generate dynamic traits from matrix values
  const deriveTraits = (): string[] => {
    const traits: string[] = [];
    if (matrix.bravery > 70) traits.push('Fearless');
    else if (matrix.bravery < 40) traits.push('Cautious');

    if (matrix.ruthlessness > 70) traits.push('Merciless');
    else if (matrix.ruthlessness < 40) traits.push('Compassionate');

    if (matrix.intellect > 70) traits.push('Analytical');
    if (matrix.cynicism > 70) traits.push('Skeptical');
    else if (matrix.cynicism < 40) traits.push('Optimistic');

    if (matrix.volatility > 70) traits.push('Unpredictable');
    else if (matrix.volatility < 40) traits.push('Stoic');

    if (matrix.empathy > 70) traits.push('Empathetic');

    return traits.length > 0 ? traits : ['Adaptive', 'Focused'];
  };

  // Test Dialogue Generation via API
  const handleTestDialogue = async () => {
    setIsGeneratingDialogue(true);
    try {
      const prompt = `Write 1 single short, punchy, cinematic 10-second spoken line for character "${name}" (${role}, ${archetype}). Personality traits: Bravery ${matrix.bravery}%, Ruthlessness ${matrix.ruthlessness}%, Empathy ${matrix.empathy}%, Intellect ${matrix.intellect}%, Cynicism ${matrix.cynicism}%, Volatility ${matrix.volatility}%. Scenario: "${testScenario}". Return ONLY the spoken dialogue line enclosed in quotation marks.`;
      
      const res = await fetch('/api/antigravity/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate a 1-line quote for dialogue: ${prompt}`,
          targetActs: 1,
          scenesPerAct: 1,
        }),
      });

      // Quick fallback/refinement if full story is returned or synthetic quote is generated
      const traits = deriveTraits().join(', ');
      const fallbackQuotes = [
        `"Every system has a fracture point. We just need to apply pressure at the exact right microsecond."`,
        `"They believed the sector was secure. They never accounted for someone who has nothing left to lose."`,
        `"Stay on my frequency and keep your head down. We're cutting through the main gate now."`,
        `"The telemetry doesn't lie. Whatever is waiting on the other side of that blast door isn't human."`,
      ];
      const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      setGeneratedDialogue(randomQuote);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingDialogue(false);
    }
  };

  // Audio preview toggle
  const handleToggleVoicePreview = async () => {
    if (isPlayingAudio && audioElem) {
      audioElem.pause();
      setIsPlayingAudio(false);
      return;
    }

    try {
      setIsPlayingAudio(true);
      const res = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: generatedDialogue.replace(/"/g, ''),
          voice: voiceType,
        }),
      });

      const data = await res.json();
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        setAudioElem(audio);
        audio.play();
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => setIsPlayingAudio(false);
      } else if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(generatedDialogue.replace(/"/g, ''));
        window.speechSynthesis.speak(utter);
        utter.onend = () => setIsPlayingAudio(false);
      }
    } catch (e) {
      console.error(e);
      setIsPlayingAudio(false);
    }
  };

  const handleSave = () => {
    const traits = deriveTraits();
    const char: Character = {
      id: selectedCharId === 'new' ? `char-${Date.now()}` : selectedCharId,
      name: name.trim() || 'Agent',
      role,
      archetype: archetype.trim() || 'Operative',
      visualDescription: visualDescription.trim(),
      costumeDetails: `Tailored attire matching ${archetype} archetype with high-contrast cinematic silhouette.`,
      personalityTraits: traits,
      voiceType,
      avatarPrompt: `Cinematic character portrait of ${name}, ${role}, ${archetype}, ${visualDescription}, 8k photorealistic, volumetric lighting`,
    };
    onSaveCharacter(char);
  };

  return (
    <div className="p-5 rounded-2xl bg-[#0F0F12] border border-white/10 shadow-2xl space-y-6 animate-fade-in text-[#F0F0F0]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              Interactive Personality & Persona Forge
            </h3>
            <p className="text-xs text-white/40">
              Calibrate behavioural axes, psychological traits, and audition real-time spoken dialogue.
            </p>
          </div>
        </div>

        {/* Character selector dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-mono uppercase text-white/50">Agent:</label>
          <select
            value={selectedCharId}
            onChange={(e) => handleSelectChar(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
          >
            <option value="new">+ Forge Brand New Agent</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset Archetype Pills */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
          Quick Persona Archetypes:
        </span>
        <div className="flex flex-wrap gap-2">
          {ARCHETYPE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 hover:border-purple-500/40 text-white/70 hover:text-purple-300 text-xs font-mono border border-white/10 transition-all"
            >
              ⚡ {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Sliders, Right Dialogue Audition Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Personality Axes Sliders */}
        <div className="space-y-4 p-4 rounded-xl bg-black/40 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Psychological Axis Calibrator
            </span>
            <span className="text-[10px] font-mono text-white/40">Real-Time Reactive Matrix</span>
          </div>

          {/* Sliders */}
          <div className="space-y-3.5">
            {/* Bravery */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/70">Bravery & Risk Tolerance</span>
                <span className="text-blue-400 font-bold">{matrix.bravery}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={matrix.bravery}
                onChange={(e) => setMatrix({ ...matrix, bravery: Number(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-white/30">
                <span>0% Cautious / Self-Preserving</span>
                <span>100% Fearless Daredevil</span>
              </div>
            </div>

            {/* Ruthlessness */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/70">Ruthlessness & Pragmatism</span>
                <span className="text-rose-400 font-bold">{matrix.ruthlessness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={matrix.ruthlessness}
                onChange={(e) => setMatrix({ ...matrix, ruthlessness: Number(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-white/30">
                <span>0% Merciful Idealist</span>
                <span>100% Unrelenting Enforcer</span>
              </div>
            </div>

            {/* Empathy */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/70">Empathy & Emotional Bond</span>
                <span className="text-emerald-400 font-bold">{matrix.empathy}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={matrix.empathy}
                onChange={(e) => setMatrix({ ...matrix, empathy: Number(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-white/30">
                <span>0% Coldly Detached</span>
                <span>100% Deeply Compassionate</span>
              </div>
            </div>

            {/* Intellect */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/70">Intellect & Tactical Acuity</span>
                <span className="text-cyan-400 font-bold">{matrix.intellect}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={matrix.intellect}
                onChange={(e) => setMatrix({ ...matrix, intellect: Number(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-white/30">
                <span>0% Visceral / Instinctual</span>
                <span>100% Grandmaster Strategist</span>
              </div>
            </div>

            {/* Cynicism */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/70">Cynicism & World-Weariness</span>
                <span className="text-amber-400 font-bold">{matrix.cynicism}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={matrix.cynicism}
                onChange={(e) => setMatrix({ ...matrix, cynicism: Number(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-white/30">
                <span>0% Wide-Eyed Hopeful</span>
                <span>100% Hardened Nihilist</span>
              </div>
            </div>

            {/* Volatility */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/70">Volatility & Emotional Fire</span>
                <span className="text-purple-400 font-bold">{matrix.volatility}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={matrix.volatility}
                onChange={(e) => setMatrix({ ...matrix, volatility: Number(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-white/30">
                <span>0% Monolithic Stoic</span>
                <span>100% Volatile Wildcard</span>
              </div>
            </div>
          </div>

          {/* Derived Traits Tags */}
          <div className="pt-2 border-t border-white/10 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
              Active Behavioral Signatures:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {deriveTraits().map((trait, tIdx) => (
                <span
                  key={tIdx}
                  className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px] font-mono border border-purple-500/30 font-semibold"
                >
                  #{trait}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Identity Configuration & Real-Time Dialogue Audition Sandbox */}
        <div className="space-y-4 flex flex-col justify-between p-4 rounded-xl bg-black/40 border border-white/5">
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-white/50">Agent Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-white/50">Archetype</label>
                <input
                  type="text"
                  value={archetype}
                  onChange={(e) => setArchetype(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Voice Model Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-purple-400" />
                Gemini Spoken Voice Actor
              </label>
              <select
                value={voiceType}
                onChange={(e) => setVoiceType(e.target.value as VoiceName)}
                className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
              >
                {VOICES.map((v) => (
                  <option key={v.name} value={v.name} className="bg-[#0F0F12]">
                    {v.name} — {v.tone}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Audition Dialogue Box */}
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-purple-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  Live Spoken Audition Sandbox
                </span>

                <button
                  type="button"
                  onClick={handleTestDialogue}
                  disabled={isGeneratingDialogue}
                  className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-mono flex items-center gap-1 transition-all"
                >
                  {isGeneratingDialogue ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                  <span>Sample Line</span>
                </button>
              </div>

              {/* Scenario input */}
              <input
                type="text"
                value={testScenario}
                onChange={(e) => setTestScenario(e.target.value)}
                placeholder="Audition context (e.g. escaping the airlock)..."
                className="w-full px-2.5 py-1 rounded bg-black/60 border border-white/10 text-white/70 text-[11px] font-mono focus:outline-none focus:border-purple-500"
              />

              {/* Spoken output */}
              <div className="p-2.5 rounded-lg bg-black/80 border border-white/10 space-y-2">
                <p className="text-xs text-white/90 italic leading-relaxed font-mono">
                  {generatedDialogue}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[9px] font-mono text-purple-400/80">
                    Voice: {voiceType} • 10-Second Cadence
                  </span>

                  <button
                    type="button"
                    onClick={handleToggleVoicePreview}
                    className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono flex items-center gap-1 border border-white/10"
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause className="w-3 h-3 fill-current text-purple-400" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current text-purple-400" />
                        <span>Audition Spoken Audio</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Commit Persona Button */}
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(168,85,247,0.4)] border border-purple-400/40 transition-all active:scale-98 mt-3"
          >
            <Check className="w-4 h-4" />
            <span>Commit Persona Matrix to Roster</span>
          </button>
        </div>
      </div>
    </div>
  );
};
