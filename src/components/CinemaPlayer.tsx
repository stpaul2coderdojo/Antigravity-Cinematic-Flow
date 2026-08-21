import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { StoryProject, Scene, ColorGrade } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Film, 
  Download, 
  X, 
  Camera,
  Subtitles
} from 'lucide-react';

interface CinemaPlayerProps {
  project: StoryProject;
  initialSceneIndex?: number;
  onClose: () => void;
}

export const CinemaPlayer: React.FC<CinemaPlayerProps> = ({
  project,
  initialSceneIndex = 0,
  onClose,
}) => {
  // Collect all scenes in linear sequence (memoized)
  const allScenes = useMemo<Scene[]>(() => {
    const list: Scene[] = [];
    if (project && project.acts) {
      project.acts.forEach((act) => {
        if (act.scenes) {
          act.scenes.forEach((scene) => {
            list.push(scene);
          });
        }
      });
    }
    return list;
  }, [project]);

  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(() => {
    return Math.min(Math.max(0, initialSceneIndex), Math.max(0, allScenes.length - 1));
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [isAnamorphicScope, setIsAnamorphicScope] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [displaySeconds, setDisplaySeconds] = useState<number>(initialSceneIndex * 10);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sceneProgressRef = useRef<number>(0);
  const startTimeRef = useRef<number>(performance.now());
  const preloadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const lastStateUpdateRef = useRef<number>(0);

  const activeScene = allScenes[currentSceneIndex] || allScenes[0];
  const nextScene = allScenes[currentSceneIndex + 1];

  // Preload images into memory safely
  useEffect(() => {
    allScenes.forEach((scene) => {
      if (scene.imageUrl && !preloadedImagesRef.current.has(scene.id)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = scene.imageUrl;
        preloadedImagesRef.current.set(scene.id, img);
      }
    });
  }, [allScenes]);

  // Audio synchronization when scene changes
  useEffect(() => {
    if (activeScene?.audioUrl && !isMuted) {
      if (audioRef.current) {
        audioRef.current.src = activeScene.audioUrl;
        audioRef.current.volume = volume;
        audioRef.current.play().catch(() => {});
      }
    }
  }, [currentSceneIndex, isMuted, volume, activeScene?.audioUrl]);

  // Color grading filter helper
  const applyColorGrade = useCallback((ctx: CanvasRenderingContext2D, grade?: ColorGrade) => {
    switch (grade) {
      case 'teal-orange':
        ctx.filter = 'contrast(1.15) saturate(1.2) hue-rotate(-5deg)';
        break;
      case 'cyber-neon':
        ctx.filter = 'contrast(1.25) saturate(1.4) hue-rotate(15deg)';
        break;
      case 'noir-monochrome':
        ctx.filter = 'grayscale(1) contrast(1.35) brightness(0.95)';
        break;
      case 'warm-vintage':
        ctx.filter = 'sepia(0.25) contrast(1.1) brightness(1.05) saturate(1.1)';
        break;
      case 'bleach-bypass':
        ctx.filter = 'contrast(1.4) saturate(0.6) brightness(0.9)';
        break;
      default:
        ctx.filter = 'none';
    }
  }, []);

  // Procedural dynamic frame renderer
  const drawProceduralCinemaFrame = useCallback((
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    scene: Scene,
    time: number
  ) => {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#050505');
    grad.addColorStop(0.5, '#0F0F12');
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Glowing background orbs
    const cx = w * 0.5 + Math.sin(time * 0.8) * 80;
    const cy = h * 0.5 + Math.cos(time * 0.8) * 40;
    const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 300);
    glow.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
    glow.addColorStop(0.5, 'rgba(168, 85, 247, 0.15)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Grid lines / HUD
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.5);
    ctx.lineTo(w * 0.9, h * 0.5);
    ctx.moveTo(w * 0.5, h * 0.1);
    ctx.lineTo(w * 0.5, h * 0.9);
    ctx.stroke();

    // Scene Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(scene.title || 'Cinematic Sequence', w / 2, h / 2 - 15);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(`Act ${scene.actNumber || 1} • Scene ${scene.sceneNumber || 1} • 10.0s Continuous Flow`, w / 2, h / 2 + 20);
  }, []);

  // Film grain procedural generator
  const drawFilmGrain = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.fillRect(x, y, 1, 1);
    }
  }, []);

  // Main Cinema Rendering Loop
  useEffect(() => {
    if (!isPlaying || allScenes.length === 0) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    startTimeRef.current = performance.now() - sceneProgressRef.current * 1000;

    const render = (time: number) => {
      const elapsed = (time - startTimeRef.current) / 1000;
      sceneProgressRef.current = elapsed;

      // Throttle React state update to ~4 times per second to eliminate re-render freezes
      if (time - lastStateUpdateRef.current > 250) {
        lastStateUpdateRef.current = time;
        const totalSecs = currentSceneIndex * 10 + Math.min(elapsed, 10);
        setDisplaySeconds(totalSecs);
      }

      // Update DOM progress bar directly for 60fps smoothness without React re-renders
      if (progressBarRef.current) {
        const totalSecs = currentSceneIndex * 10 + Math.min(elapsed, 10);
        const maxSecs = Math.max(1, allScenes.length * 10);
        const pct = Math.min(100, Math.max(0, (totalSecs / maxSecs) * 100));
        progressBarRef.current.style.width = `${pct}%`;
      }

      if (elapsed >= 10) {
        // Transition to next scene
        if (currentSceneIndex < allScenes.length - 1) {
          setCurrentSceneIndex((prev) => prev + 1);
          sceneProgressRef.current = 0;
          startTimeRef.current = time;
        } else {
          setIsPlaying(false);
          sceneProgressRef.current = 10;
          return;
        }
      }

      // Draw onto canvas
      const canvas = canvasRef.current;
      if (canvas && activeScene) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;

          ctx.clearRect(0, 0, width, height);

          // Get active image
          const currentImg = preloadedImagesRef.current.get(activeScene.id);
          const nextImg = nextScene ? preloadedImagesRef.current.get(nextScene.id) : null;

          // Compute transition factor
          const transitionWindow = activeScene.transitionDuration || 1.0;
          const isTransitioning = elapsed > 10 - transitionWindow;
          const transitionProgress = isTransitioning ? (elapsed - (10 - transitionWindow)) / transitionWindow : 0;

          // Camera zoom / pan motion effect
          const zoomScale = 1.0 + (Math.min(elapsed, 10) / 10) * 0.08;
          const panX = Math.sin(elapsed * 0.5) * 8;

          ctx.save();

          // Apply color grading filter
          applyColorGrade(ctx, project.colorGrade);

          // Draw base current scene
          if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
            ctx.save();
            ctx.translate(width / 2 + panX, height / 2);
            ctx.scale(zoomScale, zoomScale);
            ctx.drawImage(currentImg, -width / 2, -height / 2, width, height);
            ctx.restore();
          } else {
            drawProceduralCinemaFrame(ctx, width, height, activeScene, elapsed);
          }

          // Handle Transitions to Next Scene
          if (isTransitioning && nextImg && nextImg.complete) {
            ctx.save();
            if (activeScene.transition === 'crossfade' || activeScene.transition === 'dissolve') {
              ctx.globalAlpha = transitionProgress;
              ctx.drawImage(nextImg, 0, 0, width, height);
            } else if (activeScene.transition === 'fade-to-black') {
              const blackAlpha = transitionProgress < 0.5 ? transitionProgress * 2 : (1 - transitionProgress) * 2;
              ctx.fillStyle = `rgba(0, 0, 0, ${blackAlpha})`;
              ctx.fillRect(0, 0, width, height);
            } else if (activeScene.transition === 'whip-pan') {
              const offset = (1 - transitionProgress) * width;
              ctx.drawImage(nextImg, offset, 0, width, height);
            }
            ctx.restore();
          }

          // Film grain
          drawFilmGrain(ctx, width, height);

          // Anamorphic Scope Letterboxing
          if (isAnamorphicScope) {
            const letterboxHeight = height * 0.12;
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, letterboxHeight);
            ctx.fillRect(0, height - letterboxHeight, width, letterboxHeight);
          }

          ctx.restore();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [
    isPlaying, 
    currentSceneIndex, 
    allScenes.length, 
    activeScene, 
    nextScene, 
    isAnamorphicScope, 
    project.colorGrade,
    applyColorGrade,
    drawProceduralCinemaFrame,
    drawFilmGrain
  ]);

  // Export recording via Canvas MediaRecorder
  const handleExportRecording = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsExporting(true);

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.title.toLowerCase().replace(/\s+/g, '-')}-spliced-flow.webm`;
        a.click();
        setIsExporting(false);
      };

      recorder.start();
      setCurrentSceneIndex(0);
      sceneProgressRef.current = 0;
      setIsPlaying(true);

      const totalTimeMs = allScenes.length * 10 * 1000;
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, totalTimeMs);
    } catch (err) {
      console.error('Export error:', err);
      setIsExporting(false);
    }
  };

  const totalTimeSeconds = Math.max(10, allScenes.length * 10);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPercent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSeconds = clickPercent * totalTimeSeconds;
    const targetSceneIdx = Math.min(Math.floor(targetSeconds / 10), allScenes.length - 1);
    const remainder = targetSeconds % 10;

    setCurrentSceneIndex(targetSceneIdx);
    sceneProgressRef.current = remainder;
    startTimeRef.current = performance.now() - remainder * 1000;
    setDisplaySeconds(targetSeconds);
  };

  if (!activeScene) {
    return (
      <div className="fixed inset-0 z-50 bg-[#050505]/95 flex items-center justify-center p-6 text-white">
        <div className="text-center space-y-4">
          <p className="text-white/60">No scenes available to play.</p>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/10 text-white font-mono text-xs">
            Close Player
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 animate-fade-in text-[#F0F0F0] select-none">
      {/* Top Bento Control Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between gap-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-400 font-bold">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              {project.title}
              <span className="text-[10px] font-mono font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                Google Flow Reel
              </span>
            </h3>
            <p className="text-xs text-white/40">
              Act {activeScene.actNumber}: {activeScene.title} (Clip #{currentSceneIndex + 1}/{allScenes.length})
            </p>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAnamorphicScope(!isAnamorphicScope)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors flex items-center gap-1.5 ${
              isAnamorphicScope
                ? 'bg-blue-950/60 border-blue-500/60 text-blue-300'
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
            }`}
            title="Toggle 2.39:1 CinemaScope Letterbox"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">2.39:1 Scope</span>
          </button>

          <button
            onClick={() => setShowSubtitles(!showSubtitles)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors flex items-center gap-1.5 ${
              showSubtitles
                ? 'bg-blue-950/60 border-blue-500/60 text-blue-300'
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
            }`}
            title="Toggle Subtitles & Narration"
          >
            <Subtitles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Subtitles</span>
          </button>

          <button
            id="btn-export-spliced-video"
            onClick={handleExportRecording}
            disabled={isExporting}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(59,130,246,0.4)] border border-blue-400/40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Recording WebM...' : 'Export Movie'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-colors border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Cinema Screen Canvas in Bento Box */}
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 flex items-center justify-center my-auto"
      >
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full object-contain"
        />

        {/* Subtitles Overlay */}
        {showSubtitles && activeScene.dialogueOrVoiceover && (
          <div className="absolute bottom-10 left-6 right-6 text-center pointer-events-none z-20">
            <div className="inline-block px-5 py-2.5 rounded-2xl bg-black/85 backdrop-blur-md border border-white/15 text-white text-sm sm:text-base font-medium shadow-2xl max-w-2xl leading-relaxed">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-blue-400 font-bold uppercase text-xs tracking-wider font-mono">
                  {activeScene.dialogueSpeaker || 'Audio Track'}
                </span>
                {activeScene.ispaToken && (
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-mono font-bold border border-purple-500/40">
                    ISPA [{activeScene.ispaToken}]
                  </span>
                )}
                {activeScene.ispaModality && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 text-[9px] font-mono border border-blue-500/30">
                    {activeScene.ispaModality}
                  </span>
                )}
              </div>
              <p className="italic text-white/95">"{activeScene.dialogueOrVoiceover}"</p>
            </div>
          </div>
        )}

        {/* Top-Right Scene HUD */}
        <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-none z-20">
          {activeScene.ispaToken && (
            <div className="px-2.5 py-1 rounded-md bg-purple-950/90 backdrop-blur-md border border-purple-500/50 text-[10px] font-mono font-bold text-purple-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              ISPA [{activeScene.ispaToken}]
            </div>
          )}
          <div className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-blue-300">
            {formatTime(displaySeconds)} / {formatTime(totalTimeSeconds)}
          </div>
          <div className="px-2.5 py-1 rounded-md bg-purple-950/80 backdrop-blur-md border border-purple-500/40 text-[10px] font-bold text-purple-200 uppercase font-mono">
            {activeScene.transition || 'crossfade'} Transition
          </div>
        </div>
      </div>

      {/* Bottom Master Playback & Flow Control Dashboard */}
      <div className="w-full max-w-5xl bg-[#0F0F12] border border-white/10 rounded-2xl p-4 space-y-3 shadow-2xl">
        {/* Timeline Scrubber */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-white/40 font-mono">
            <span>{formatTime(displaySeconds)}</span>
            <span className="text-blue-400 font-bold uppercase">Clip #{currentSceneIndex + 1}: {activeScene.title}</span>
            <span>{formatTime(totalTimeSeconds)}</span>
          </div>

          <div
            className="relative h-3 bg-black rounded-full overflow-hidden cursor-pointer border border-white/10"
            onClick={handleScrubberClick}
          >
            <div
              ref={progressBarRef}
              className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
              style={{ width: `${(displaySeconds / totalTimeSeconds) * 100}%` }}
            />
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (currentSceneIndex > 0) {
                  setCurrentSceneIndex((prev) => prev - 1);
                  sceneProgressRef.current = 0;
                  startTimeRef.current = performance.now();
                }
              }}
              disabled={currentSceneIndex === 0}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white transition-colors border border-white/10"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(59,130,246,0.4)] border border-blue-400/40 transition-all active:scale-95"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Play Flow</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (currentSceneIndex < allScenes.length - 1) {
                  setCurrentSceneIndex((prev) => prev + 1);
                  sceneProgressRef.current = 0;
                  startTimeRef.current = performance.now();
                }
              }}
              disabled={currentSceneIndex >= allScenes.length - 1}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white transition-colors border border-white/10"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setCurrentSceneIndex(0);
                sceneProgressRef.current = 0;
                startTimeRef.current = performance.now();
                setIsPlaying(true);
              }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10"
              title="Restart from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-white/80" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setIsMuted(false);
              }}
              className="w-20 sm:w-28 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
