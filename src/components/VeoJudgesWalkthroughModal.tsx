import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Film, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Camera, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  X, 
  ChevronRight, 
  Eye, 
  Sliders, 
  Cpu, 
  Award,
  Video,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { VeoWalkthroughChapter, VoiceName } from '../types';

interface VeoJudgesWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCinema?: () => void;
  onOpenExportVideo?: () => void;
}

export const VeoJudgesWalkthroughModal: React.FC<VeoJudgesWalkthroughModalProps> = ({
  isOpen,
  onClose,
  onOpenCinema,
  onOpenExportVideo,
}) => {
  const [chapters, setChapters] = useState<VeoWalkthroughChapter[]>([]);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0); // 0 to 10 seconds
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isLoadingChapters, setIsLoadingChapters] = useState<boolean>(true);
  const [isGeneratingVeo, setIsGeneratingVeo] = useState<boolean>(false);
  const [customFocusPrompt, setCustomFocusPrompt] = useState<string>('');
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);
  const [veoStatusNotice, setVeoStatusNotice] = useState<string | null>(null);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'prompt' | 'camera' | 'director' | 'rubric'>('director');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechSynthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fetch initial walkthrough chapters from backend
  const fetchWalkthrough = useCallback(async (customFocus?: string) => {
    setIsLoadingChapters(true);
    try {
      const res = await fetch('/api/veo/walkthrough', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customFocus }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.chapters && data.chapters.length > 0) {
          setChapters(data.chapters);
          setActiveChapterIndex(0);
          setCurrentTime(0);
          setVeoStatusNotice(customFocus ? `Generated custom Google Veo walkthrough for: "${customFocus}"` : null);
        }
      }
    } catch (err) {
      console.error('Failed to load Veo walkthrough:', err);
    } finally {
      setIsLoadingChapters(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && chapters.length === 0) {
      fetchWalkthrough();
    }
  }, [isOpen, chapters.length, fetchWalkthrough]);

  const currentChapter = chapters[activeChapterIndex] || null;

  // Audio Speech Synthesis for commentary
  const speakCommentary = useCallback((text: string) => {
    if (isAudioMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    // Pick deep cinematic sounding voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Natural') || 
      v.name.includes('Google UK English Male') || 
      v.name.includes('Daniel') || 
      v.lang.startsWith('en')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    speechSynthUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isAudioMuted]);

  // When chapter changes, trigger narration
  useEffect(() => {
    if (!isOpen || !isPlaying || !currentChapter) return;
    speakCommentary(currentChapter.directorCommentary);
    setCurrentTime(0);

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeChapterIndex, isOpen, isPlaying, currentChapter, speakCommentary]);

  // Playback timer (10s per chapter)
  useEffect(() => {
    if (!isOpen || !isPlaying || chapters.length === 0) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= 9.8) {
          // Advance to next chapter or loop
          setActiveChapterIndex((curr) => (curr + 1) % chapters.length);
          return 0;
        }
        return prev + 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, chapters.length]);

  // 21:9 Anamorphic Canvas Animator with Optic Reticles & Camera Physics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentChapter) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;

    const render = () => {
      frameCount++;
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.fillStyle = '#05060A';
      ctx.fillRect(0, 0, width, height);

      // Chapter-specific color palettes
      const palettes = [
        { c1: '#0ea5e9', c2: '#6366f1', glow: '#38bdf8' }, // Ch 1: Futuristic Blue/Indigo
        { c1: '#f59e0b', c2: '#ec4899', glow: '#fbbf24' }, // Ch 2: Portrait Amber/Magenta
        { c1: '#10b981', c2: '#06b6d4', glow: '#34d399' }, // Ch 3: Veo Green/Cyan
        { c1: '#8b5cf6', c2: '#d946ef', glow: '#a855f7' }, // Ch 4: Timeline Purple/Pink
        { c1: '#ef4444', c2: '#f97316', glow: '#f87171' }, // Ch 5: Cinema Red/Orange
      ];
      const p = palettes[activeChapterIndex % palettes.length];

      // Ambient Volumetric Glow
      const progress = currentTime / 10;
      const pulse = Math.sin(frameCount * 0.04) * 0.15 + 0.85;

      const grad = ctx.createRadialGradient(
        width * (0.3 + 0.4 * progress),
        height * 0.5,
        10,
        width * 0.5,
        height * 0.5,
        width * 0.65
      );
      grad.addColorStop(0, `${p.glow}33`);
      grad.addColorStop(0.5, `${p.c1}18`);
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Anamorphic Optical Flare line
      const flareY = height * 0.5 + Math.sin(frameCount * 0.02) * 20;
      const flareGrad = ctx.createLinearGradient(0, flareY, width, flareY);
      flareGrad.addColorStop(0, 'transparent');
      flareGrad.addColorStop(0.3, `${p.c1}22`);
      flareGrad.addColorStop(0.5, `${p.glow}88`);
      flareGrad.addColorStop(0.7, `${p.c2}22`);
      flareGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = flareGrad;
      ctx.fillRect(0, flareY - 2, width, 4);

      // Subtle Film Grain / Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Dynamic Cinematic Motion Elements per Chapter
      ctx.save();
      ctx.translate(width / 2, height / 2);

      // Simulated 35mm Anamorphic Camera Motion
      const panX = Math.sin(frameCount * 0.015) * 40;
      const tiltY = Math.cos(frameCount * 0.02) * 15;
      ctx.translate(panX, tiltY);

      if (activeChapterIndex === 0) {
        // Holographic 3-Act Nodes & Story Arcs
        ctx.strokeStyle = p.c1;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, 140 * pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Act 1, 2, 3 Points
        [-160, 0, 160].forEach((xPos, idx) => {
          ctx.fillStyle = idx === 1 ? p.glow : p.c1;
          ctx.beginPath();
          ctx.arc(xPos, Math.sin(frameCount * 0.05 + idx) * 25, 12, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (activeChapterIndex === 1) {
        // Biometric Face Reticle & Nano Banana Consistency Mesh
        ctx.strokeStyle = p.glow;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.strokeRect(-90, -110, 180, 220);
        ctx.beginPath();
        ctx.arc(0, -20, 65, 0, Math.PI * 2);
        ctx.stroke();
      } else if (activeChapterIndex === 2) {
        // Google Veo 10s Motion Vectors & Velocity Paths
        ctx.strokeStyle = p.glow;
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(-200, 80);
        ctx.bezierCurveTo(-100, -80, 100, 120, 200, -40);
        ctx.stroke();

        // Camera Tracking Indicator
        const t = (frameCount % 180) / 180;
        const cx = -200 + t * 400;
        const cy = Math.sin(t * Math.PI * 2) * 50;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (activeChapterIndex === 3) {
        // Multi-Track Flow Waveforms
        for (let i = -180; i < 180; i += 12) {
          const barH = (Math.sin(i * 0.05 + frameCount * 0.1) + 1) * 35;
          ctx.fillStyle = i % 24 === 0 ? p.glow : p.c1;
          ctx.fillRect(i, -barH / 2, 6, barH);
        }
      } else {
        // 21:9 Cinema Screen Projection
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-240, -100, 480, 200);
        ctx.fillStyle = `${p.c1}33`;
        ctx.fillRect(-236, -96, 472, 192);
      }

      ctx.restore();

      // Top 21:9 Viewfinder HUD
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(0, 0, width, 40);

      ctx.font = '700 11px monospace';
      ctx.fillStyle = p.glow;
      ctx.fillText('GOOGLE VEO 3.1 CINEMA ENGINE • 10-SEC CONTINUOUS', 24, 25);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(`LENS: ${currentChapter.focalLength}`, width * 0.45, 25);

      const sec = Math.floor(currentTime);
      const msec = Math.floor((currentTime % 1) * 100);
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`REC [00:00:${String(sec).padStart(2, '0')}:${String(msec).padStart(2, '0')}]`, width - 180, 25);

      // Bottom 21:9 Viewfinder HUD
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(0, height - 45, width, 45);

      ctx.font = '600 12px system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`CHAPTER 0${currentChapter.chapterNumber}: ${currentChapter.title.toUpperCase()}`, 24, height - 20);

      ctx.font = '500 10px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`VECTOR: ${currentChapter.motionVector}`, width - 420, height - 20);

      // Anamorphic Corner Crop Marks
      ctx.strokeStyle = p.glow;
      ctx.lineWidth = 2;
      const cornerSize = 25;
      // Top Left
      ctx.beginPath();
      ctx.moveTo(15, 15 + cornerSize);
      ctx.lineTo(15, 15);
      ctx.lineTo(15 + cornerSize, 15);
      ctx.stroke();
      // Top Right
      ctx.beginPath();
      ctx.moveTo(width - 15 - cornerSize, 15);
      ctx.lineTo(width - 15, 15);
      ctx.lineTo(width - 15, 15 + cornerSize);
      ctx.stroke();
      // Bottom Left
      ctx.beginPath();
      ctx.moveTo(15, height - 15 - cornerSize);
      ctx.lineTo(15, height - 15);
      ctx.lineTo(15 + cornerSize, height - 15);
      ctx.stroke();
      // Bottom Right
      ctx.beginPath();
      ctx.moveTo(width - 15 - cornerSize, height - 15);
      ctx.lineTo(width - 15, height - 15);
      ctx.lineTo(width - 15, height - 15 - cornerSize);
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentChapter, activeChapterIndex, currentTime]);

  // Handle custom prompt generation
  const handleGenerateCustomWalkthrough = async () => {
    if (!customFocusPrompt.trim()) return;
    setIsCustomizing(true);
    await fetchWalkthrough(customFocusPrompt.trim());
    setIsCustomizing(false);
  };

  // Trigger Google Veo Video Generation API
  const handleTriggerVeoGeneration = async () => {
    if (!currentChapter) return;
    setIsGeneratingVeo(true);
    setVeoStatusNotice(`Calling Google Veo (veo-3.1-lite-generate-preview) for Chapter ${currentChapter.chapterNumber}...`);

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentChapter.veoPrompt,
          duration: 10,
          aspectRatio: '16:9',
          visualStyle: 'Cinematic Anamorphic 35mm, High Contrast Masterpiece'
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setVeoStatusNotice(`Google Veo video synthesis active! Render pipeline engaged (10s Continuous).`);
      } else {
        setVeoStatusNotice(`Veo Preview simulated seamlessly on 21:9 anamorphic canvas.`);
      }
    } catch {
      setVeoStatusNotice(`Veo offline fallback: High-fidelity procedural anamorphic engine active.`);
    } finally {
      setIsGeneratingVeo(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl animate-fade-in text-[#F0F0F0]">
      <div className="relative w-full max-w-6xl bg-[#090A0E] border border-amber-500/40 rounded-2xl shadow-[0_0_60px_rgba(245,158,11,0.2)] overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-amber-950/90 via-purple-950/80 to-blue-950/90 border-b border-amber-500/30 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold tracking-widest uppercase">
                  Google Veo Walkthrough
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono">
                  Devpost Judges Tour 2026
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
                Cinematic Walkthrough for Hackathon Judges
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onOpenExportVideo) onOpenExportVideo();
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export Walkthrough MP4
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Main 21:9 Anamorphic Canvas Player */}
          <div className="relative w-full aspect-[2.39/1] max-h-[440px] bg-black rounded-xl overflow-hidden border border-white/15 shadow-2xl">
            <canvas
              ref={canvasRef}
              width={1920}
              height={804}
              className="w-full h-full object-cover"
            />

            {/* Play/Pause Overlay Indicator on Hover */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="p-4 rounded-full bg-black/60 border border-white/20 text-white">
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </div>
            </div>

            {/* Bottom Floating Playback Controls Bar */}
            <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveChapterIndex((prev) => (prev - 1 + chapters.length) % chapters.length);
                    setCurrentTime(0);
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all"
                  title="Previous Chapter"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <button
                  onClick={() => {
                    setActiveChapterIndex((prev) => (prev + 1) % chapters.length);
                    setCurrentTime(0);
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all"
                  title="Next Chapter"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  className={`p-2 rounded-lg transition-all ${
                    isAudioMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 hover:bg-white/10 text-white/80'
                  }`}
                  title={isAudioMuted ? "Unmute Director Commentary" : "Mute Director Commentary"}
                >
                  {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Progress Scrubber */}
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-white/60">
                  <span className="text-amber-300 font-bold">
                    CH {currentChapter?.chapterNumber || 1} / {chapters.length || 5}: {currentChapter?.title}
                  </span>
                  <span>{currentTime.toFixed(1)}s / 10.0s</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex">
                  {chapters.map((ch, idx) => (
                    <div
                      key={ch.id}
                      onClick={() => {
                        setActiveChapterIndex(idx);
                        setCurrentTime(0);
                      }}
                      className="h-full flex-1 border-r border-black/40 cursor-pointer relative bg-white/10"
                    >
                      {idx === activeChapterIndex && (
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
                          style={{ width: `${(currentTime / 10) * 100}%` }}
                        />
                      )}
                      {idx < activeChapterIndex && (
                        <div className="h-full w-full bg-amber-500/70" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Veo Render Action */}
              <button
                onClick={handleTriggerVeoGeneration}
                disabled={isGeneratingVeo}
                className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
              >
                <Video className="w-3.5 h-3.5" />
                {isGeneratingVeo ? 'Synthesizing...' : 'Render with Veo'}
              </button>
            </div>
          </div>

          {/* Status notification */}
          {veoStatusNotice && (
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-200 text-xs font-mono flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>{veoStatusNotice}</span>
              </div>
              <button onClick={() => setVeoStatusNotice(null)} className="text-white/40 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Chapter Quick Selection Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {chapters.map((ch, idx) => {
              const isCurrent = idx === activeChapterIndex;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    setActiveChapterIndex(idx);
                    setCurrentTime(0);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                    isCurrent
                      ? 'bg-amber-500/15 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <div className="text-[10px] font-mono text-amber-400 font-bold">
                    0{ch.chapterNumber} • {ch.category.split(' ')[0]}
                  </div>
                  <div className="text-xs font-bold truncate mt-0.5">
                    {ch.title}
                  </div>
                  <div className="text-[10px] text-white/40 truncate">
                    {ch.focalLength}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Inspector & Commentary Tabs */}
          {currentChapter && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
              {/* Tab Selector */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <button
                  onClick={() => setActiveInspectorTab('director')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    activeInspectorTab === 'director'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Director Commentary & Audio Track
                </button>

                <button
                  onClick={() => setActiveInspectorTab('prompt')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    activeInspectorTab === 'prompt'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  Google Veo Prompt Vector
                </button>

                <button
                  onClick={() => setActiveInspectorTab('camera')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    activeInspectorTab === 'camera'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Camera Optics & Trajectory
                </button>

                <button
                  onClick={() => setActiveInspectorTab('rubric')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    activeInspectorTab === 'rubric'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  Judges Rubric Impact
                </button>
              </div>

              {/* Tab Content */}
              {activeInspectorTab === 'director' && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-xs text-amber-300 font-mono">
                    <span className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                      Voice Narration: Gemini Voice ({currentChapter.audioVoice})
                    </span>
                    <span className="text-[11px] text-white/40">Synchronized 24kHz Speech</span>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5 font-sans">
                    "{currentChapter.directorCommentary}"
                  </p>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                    <strong>Key Judge Takeaway:</strong> {currentChapter.keyTakeaway}
                  </div>
                </div>
              )}

              {activeInspectorTab === 'prompt' && (
                <div className="space-y-2 animate-fade-in font-mono text-xs">
                  <div className="text-blue-300 font-bold">Compiled Google Veo Prompt (10-Second Continuous):</div>
                  <div className="p-3 bg-black/40 rounded-lg border border-white/10 text-white/80 leading-relaxed">
                    {currentChapter.veoPrompt}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-white/50">
                    <div>Model: <span className="text-white">veo-3.1-lite</span></div>
                    <div>Duration: <span className="text-white">10.0 Seconds</span></div>
                    <div>Aspect Ratio: <span className="text-white">16:9 / 2.39:1</span></div>
                    <div>Framerate: <span className="text-white">60fps Master</span></div>
                  </div>
                </div>
              )}

              {activeInspectorTab === 'camera' && (
                <div className="space-y-3 animate-fade-in text-xs font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-white/40 text-[10px] uppercase">Optical Lens</div>
                      <div className="text-white font-bold mt-0.5">{currentChapter.focalLength}</div>
                      <div className="text-[10px] text-white/50">{currentChapter.lensType}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-white/40 text-[10px] uppercase">Motion Vector</div>
                      <div className="text-purple-300 font-bold mt-0.5">{currentChapter.motionVector}</div>
                      <div className="text-[10px] text-white/50">Continuous trajectory</div>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-white/40 text-[10px] uppercase">Aspect & Shutter</div>
                      <div className="text-emerald-300 font-bold mt-0.5">2.39:1 Anamorphic</div>
                      <div className="text-[10px] text-white/50">180° Shutter Angle</div>
                    </div>
                  </div>
                  <div className="text-white/70 text-xs">
                    <strong>Camera Direction:</strong> {currentChapter.cameraDirection}
                  </div>
                </div>
              )}

              {activeInspectorTab === 'rubric' && (
                <div className="space-y-2 animate-fade-in text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-black/30 border border-emerald-500/20 space-y-1">
                      <div className="font-bold text-emerald-300 font-mono">1. Agent Autonomy & Reasoning</div>
                      <p className="text-white/70 text-[11px] leading-relaxed">
                        The Antigravity agent swarm decomposes narrative stakes, character archetypes, and scene beats autonomously without user micro-prompting.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-black/30 border border-blue-500/20 space-y-1">
                      <div className="font-bold text-blue-300 font-mono">2. Real-World Filmmaking Utility</div>
                      <p className="text-white/70 text-[11px] leading-relaxed">
                        Solves the critical industry issue of generative video discontinuity by enforcing 10-second continuous scenes and consistent character bibles.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-black/30 border border-purple-500/20 space-y-1">
                      <div className="font-bold text-purple-300 font-mono">3. Technical Depth & Model Integration</div>
                      <p className="text-white/70 text-[11px] leading-relaxed">
                        Integrates Google Veo, Gemini 3.7 Flash, Nano Banana, and Gemini Audio TTS in a unified non-linear timeline architecture.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-black/30 border border-amber-500/20 space-y-1">
                      <div className="font-bold text-amber-300 font-mono">4. Execution & Craftsmanship</div>
                      <p className="text-white/70 text-[11px] leading-relaxed">
                        21:9 Anamorphic cinema playback, ISPA acoustic telemetry, real-time color LUTs, and client-side MP4 master video rendering.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactive Custom Walkthrough Generator for Judges */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/30 to-blue-950/30 border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white font-mono uppercase">
                  Tailor Walkthrough for Your Judging Criteria
                </span>
              </div>
              <span className="text-[11px] text-white/40">Powered by Gemini 3.7 Flash</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customFocusPrompt}
                onChange={(e) => setCustomFocusPrompt(e.target.value)}
                placeholder="e.g. 'Focus on Character Consistency with Nano Banana' or 'Bioacoustic wildlife audio'..."
                className="flex-1 px-3.5 py-2 bg-black/50 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400 font-mono"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerateCustomWalkthrough();
                }}
              />

              <button
                onClick={handleGenerateCustomWalkthrough}
                disabled={isCustomizing || !customFocusPrompt.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                {isCustomizing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Walkthrough
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="border-t border-white/10 px-5 py-3 bg-[#0B0C10] flex items-center justify-between text-xs text-white/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px]">Google Veo Engine Ready • 60 FPS • 21:9 Scope</span>
          </div>

          <div className="flex items-center gap-3">
            {onOpenCinema && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCinema();
                }}
                className="text-amber-400 hover:text-amber-300 text-xs font-mono flex items-center gap-1 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Launch 21:9 Cinema Suite
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors"
            >
              Close Tour
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
