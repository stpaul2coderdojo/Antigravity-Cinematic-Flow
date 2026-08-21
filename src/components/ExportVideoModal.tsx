import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StoryProject, Scene, ColorGrade } from '../types';
import { 
  Film, 
  Download, 
  X, 
  Play, 
  Pause, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  RefreshCw, 
  Video, 
  Volume2, 
  Sliders, 
  Eye,
  Clapperboard,
  Tv
} from 'lucide-react';

interface ExportVideoModalProps {
  project: StoryProject;
  isOpen: boolean;
  onClose: () => void;
}

type VideoMode = 'marketing' | 'full-reel';

export const ExportVideoModal: React.FC<ExportVideoModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const [videoMode, setVideoMode] = useState<VideoMode>('marketing');
  const [resolution, setResolution] = useState<'1080p' | '720p' | 'anamorphic'>('1080p');
  const [fps, setFps] = useState<number>(30);
  const [includeAudio, setIncludeAudio] = useState<boolean>(true);
  const [includeHUD, setIncludeHUD] = useState<boolean>(true);
  
  // Render state
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('Ready to render MP4 video');
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedMimeType, setRecordedMimeType] = useState<string>('video/mp4');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const isCancelledRef = useRef<boolean>(false);
  const preloadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Flatten scenes
  const allScenes: Scene[] = React.useMemo(() => {
    const list: Scene[] = [];
    project.acts.forEach((act) => {
      act.scenes.forEach((scene) => {
        list.push(scene);
      });
    });
    return list;
  }, [project]);

  // Preload images into memory
  useEffect(() => {
    allScenes.forEach((scene) => {
      if (scene.imageUrl && !preloadedImagesRef.current.has(scene.id)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = scene.imageUrl;
        preloadedImagesRef.current.set(scene.id, img);
      }
    });
    project.characters.forEach((char) => {
      if (char.avatarUrl && !preloadedImagesRef.current.has(char.id)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = char.avatarUrl;
        preloadedImagesRef.current.set(char.id, img);
      }
    });
  }, [allScenes, project.characters]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
      }
    };
  }, [recordedVideoUrl]);

  if (!isOpen) return null;

  const getCanvasDimensions = () => {
    if (resolution === '1080p') return { width: 1920, height: 1080 };
    if (resolution === '720p') return { width: 1280, height: 720 };
    return { width: 1920, height: 804 }; // 2.39:1 Anamorphic
  };

  // Sound generator for background synth trailer beat
  const createAudioStream = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const dest = audioCtx.createMediaStreamDestination();
      
      // Ambient cinematic synth drone
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, audioCtx.currentTime); // A1 note
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(110, audioCtx.currentTime); // A2 note

      // Low pass filter for warm cinematic feel
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(0.18, audioCtx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(dest);

      osc1.start();
      osc2.start();

      return {
        audioStream: dest.stream,
        stop: () => {
          try {
            osc1.stop();
            osc2.stop();
            audioCtx.close();
          } catch {}
        }
      };
    } catch {
      return null;
    }
  };

  // Render a specific frame onto context
  const renderMarketingFrame = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    totalDuration: number
  ) => {
    // Background
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, width, height);

    // Section Breakdown:
    // 0-4s: Intro Title Card
    // 4-8s: Character Spotlight
    // 8-14s: Scene Montage 1
    // 14-20s: Scene Montage 2 & 3
    // 20-24s: Outro Call-to-Action

    if (time < 4) {
      // INTRO TITLE CARD
      const introProgress = time / 4;
      const glowGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.6);
      glowGrad.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
      glowGrad.addColorStop(0.5, 'rgba(147, 51, 234, 0.2)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Studio Subtitle
      ctx.fillStyle = '#60A5FA';
      ctx.font = `bold ${Math.round(width * 0.016)}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('GOOGLE ANTIGRAVITY AGENT SWARM • NANO BANANA', width / 2, height * 0.38);

      // Main Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${Math.round(width * 0.045)}px system-ui, sans-serif`;
      ctx.fillText(project.title.toUpperCase(), width / 2, height * 0.48);

      // Logline
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = `italic ${Math.round(width * 0.018)}px system-ui, sans-serif`;
      const truncatedLogline = project.logline.length > 75 ? project.logline.slice(0, 75) + '...' : project.logline;
      ctx.fillText(`"${truncatedLogline}"`, width / 2, height * 0.56);

      // Trailer Badge
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.strokeRect(width / 2 - 140, height * 0.64, 280, 42);
      ctx.fillStyle = '#93C5FD';
      ctx.font = `bold ${Math.round(width * 0.014)}px monospace`;
      ctx.fillText('OFFICIAL CINEMATIC TRAILER', width / 2, height * 0.64 + 26);

    } else if (time < 8) {
      // CHARACTER FORGE SPOTLIGHT
      const charIndex = Math.min(project.characters.length - 1, Math.floor(((time - 4) / 4) * project.characters.length));
      const char = project.characters[charIndex] || project.characters[0];

      // Draw character portrait or procedural avatar
      const charImg = char ? preloadedImagesRef.current.get(char.id) : null;
      if (charImg && charImg.complete && charImg.naturalWidth > 0) {
        ctx.save();
        const imgSize = Math.min(width, height) * 0.65;
        const imgX = width * 0.15;
        const imgY = (height - imgSize) / 2;
        
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.lineWidth = 4;
        ctx.strokeRect(imgX - 4, imgY - 4, imgSize + 8, imgSize + 8);
        ctx.drawImage(charImg, imgX, imgY, imgSize, imgSize);
        ctx.restore();
      } else {
        // Procedural placeholder
        ctx.fillStyle = '#1E1B4B';
        const imgSize = Math.min(width, height) * 0.65;
        ctx.fillRect(width * 0.15, (height - imgSize) / 2, imgSize, imgSize);
        ctx.fillStyle = '#818CF8';
        ctx.font = `bold ${Math.round(width * 0.03)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(char?.name || 'AGENT', width * 0.15 + imgSize / 2, height / 2);
      }

      // Character Info Panel
      ctx.textAlign = 'left';
      ctx.fillStyle = '#38BDF8';
      ctx.font = `bold ${Math.round(width * 0.015)}px monospace`;
      ctx.fillText('CAST ROSTER SPOTLIGHT', width * 0.58, height * 0.35);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${Math.round(width * 0.035)}px system-ui, sans-serif`;
      ctx.fillText(char?.name || 'Character', width * 0.58, height * 0.43);

      ctx.fillStyle = '#A78BFA';
      ctx.font = `bold ${Math.round(width * 0.018)}px system-ui, sans-serif`;
      ctx.fillText(`${char?.role} • ${char?.archetype}`, width * 0.58, height * 0.50);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = `${Math.round(width * 0.015)}px system-ui, sans-serif`;
      ctx.fillText(`Voice Profile: ${char?.voiceType || 'Gemini Kore'}`, width * 0.58, height * 0.56);
      ctx.fillText(`Attire: ${char?.costumeDetails?.slice(0, 45) || 'Tactical detailed suit'}...`, width * 0.58, height * 0.62);

    } else if (time < 20) {
      // SCENE MONTAGE
      const montageTime = time - 8;
      const sceneIndex = Math.min(allScenes.length - 1, Math.floor((montageTime / 12) * allScenes.length));
      const scene = allScenes[sceneIndex] || allScenes[0];

      const sceneImg = scene ? preloadedImagesRef.current.get(scene.id) : null;
      if (sceneImg && sceneImg.complete && sceneImg.naturalWidth > 0) {
        // Slow pan / zoom
        const zoom = 1.0 + ((montageTime % 4) / 4) * 0.06;
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(zoom, zoom);
        ctx.drawImage(sceneImg, -width / 2, -height / 2, width, height);
        ctx.restore();
      } else {
        // Procedural scene rendering
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#0F172A');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(width * 0.028)}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(scene?.title || 'Cinematic Scene', width / 2, height / 2 - 20);
      }

      // Cinematic Vignette
      const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.3, width / 2, height / 2, width * 0.7);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.75)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // Subtitle / Dialogue Banner
      if (scene?.dialogueOrVoiceover) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(width * 0.15, height * 0.78, width * 0.7, height * 0.14);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(width * 0.15, height * 0.78, width * 0.7, height * 0.14);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#60A5FA';
        ctx.font = `bold ${Math.round(width * 0.014)}px monospace`;
        ctx.fillText(scene.dialogueSpeaker?.toUpperCase() || 'VOICEOVER', width / 2, height * 0.82);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `italic ${Math.round(width * 0.016)}px system-ui, sans-serif`;
        ctx.fillText(`"${scene.dialogueOrVoiceover}"`, width / 2, height * 0.87);
      }

    } else {
      // OUTRO & CALL TO ACTION
      const glowGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.5);
      glowGrad.addColorStop(0, 'rgba(168, 85, 247, 0.3)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#38BDF8';
      ctx.font = `bold ${Math.round(width * 0.016)}px monospace`;
      ctx.fillText('EXPERIENCE THE FUTURE OF AGENTIC CINEMA', width / 2, height * 0.40);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${Math.round(width * 0.042)}px system-ui, sans-serif`;
      ctx.fillText('ANTIGRAVITY CINEMATIC FLOW', width / 2, height * 0.49);

      ctx.fillStyle = '#C084FC';
      ctx.font = `bold ${Math.round(width * 0.018)}px system-ui, sans-serif`;
      ctx.fillText('Powered by Google Gemini 3.7 & Nano Banana', width / 2, height * 0.57);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = `mono ${Math.round(width * 0.015)}px monospace`;
      ctx.fillText('Google Flow Multi-Track Timeline • 10s Continuous Continuous Splicing', width / 2, height * 0.65);
    }

    // Top HUD Telemetry Overlay if enabled
    if (includeHUD) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(20, 20, 280, 36);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.strokeRect(20, 20, 280, 36);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#60A5FA';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`REC [${Math.floor(time).toString().padStart(2, '0')}:${Math.floor((time % 1) * 30).toString().padStart(2, '0')}] • 24.0 FPS`, 35, 42);

      // Live Audio Waveform Simulation in Corner
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = width - 180; x < width - 20; x += 10) {
        const barH = Math.sin(time * 6 + x) * 12 + 14;
        ctx.moveTo(x, 40 - barH / 2);
        ctx.lineTo(x, 40 + barH / 2);
      }
      ctx.stroke();
    }
  };

  // Start MP4 / WebM video recording
  const handleStartRender = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRendering(true);
    setRenderProgress(0);
    setStatusMessage('Initializing video encoder & canvas stream...');
    isCancelledRef.current = false;
    setRecordedVideoUrl(null);
    setRecordedBlob(null);

    const { width, height } = getCanvasDimensions();
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Total Duration: Marketing Trailer = 24s; Full Reel = allScenes.length * 10s
    const totalDuration = videoMode === 'marketing' ? 24 : Math.max(10, allScenes.length * 10);
    const totalFrames = totalDuration * fps;

    // Determine supported MIME types for maximum MP4 compatibility
    let mimeType = 'video/mp4';
    if (MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.424028, mp4a.40.2"')) {
      mimeType = 'video/mp4; codecs="avc1.424028, mp4a.40.2"';
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    } else if (MediaRecorder.isTypeSupported('video/webm; codecs=h264')) {
      mimeType = 'video/webm; codecs=h264';
    } else if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) {
      mimeType = 'video/webm; codecs=vp9';
    } else {
      mimeType = 'video/webm';
    }
    setRecordedMimeType(mimeType);

    // Capture canvas stream
    const canvasStream = canvas.captureStream(fps);
    let audioHelper: { audioStream: MediaStream; stop: () => void } | null = null;

    if (includeAudio) {
      audioHelper = createAudioStream();
      if (audioHelper) {
        audioHelper.audioStream.getAudioTracks().forEach((track) => {
          canvasStream.addTrack(track);
        });
      }
    }

    recordedChunksRef.current = [];
    try {
      const recorder = new MediaRecorder(canvasStream, {
        mimeType,
        videoBitsPerSecond: 8000000, // 8 Mbps high quality
      });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (audioHelper) audioHelper.stop();
        if (isCancelledRef.current) {
          setIsRendering(false);
          setStatusMessage('Rendering cancelled');
          return;
        }

        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedVideoUrl(url);
        setIsRendering(false);
        setRenderProgress(100);
        setStatusMessage('MP4 video generation complete! Ready to download.');
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100); // 100ms chunk slice

      // Frame-by-frame rendering loop
      let currentFrame = 0;
      const frameInterval = 1000 / fps;

      const renderNextFrame = () => {
        if (isCancelledRef.current || currentFrame >= totalFrames) {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
          return;
        }

        const currentTime = currentFrame / fps;
        renderMarketingFrame(ctx, width, height, currentTime, totalDuration);

        currentFrame++;
        const pct = Math.round((currentFrame / totalFrames) * 100);
        setRenderProgress(pct);
        setStatusMessage(`Encoding frame ${currentFrame}/${totalFrames} (${currentTime.toFixed(1)}s / ${totalDuration}s)...`);

        setTimeout(renderNextFrame, frameInterval / 2); // Accelerated rendering
      };

      renderNextFrame();
    } catch (err: any) {
      console.error('Failed to initialize MediaRecorder:', err);
      if (audioHelper) audioHelper.stop();
      setIsRendering(false);
      setStatusMessage(`Encoding error: ${err.message}`);
    }
  };

  const handleCancelRender = () => {
    isCancelledRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRendering(false);
    setStatusMessage('Render stopped');
  };

  const handleDownload = () => {
    if (!recordedVideoUrl) return;
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    const isMp4 = recordedMimeType.includes('mp4');
    const ext = isMp4 ? 'mp4' : 'webm';
    const filename = `${project.title.toLowerCase().replace(/\s+/g, '-')}-${videoMode}-trailer.${ext}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-[#F0F0F0]">
      <div className="relative w-full max-w-4xl bg-[#0F0F12] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                Generate MP4 Cinematic Video
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono">
                  1080p HD
                </span>
              </h3>
              <p className="text-xs text-white/50">
                Render and export high-bitrate MP4 marketing trailers or full-length 10s spliced reels.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Preset Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setVideoMode('marketing');
                setRecordedVideoUrl(null);
              }}
              className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                videoMode === 'marketing'
                  ? 'bg-blue-950/40 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/[0.08]'
              }`}
            >
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-sm font-mono text-white flex items-center gap-2">
                  Official Marketing Trailer (24s)
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                    Devpost Ready
                  </span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  Fast-paced promo cut featuring title intros, character forge spotlights, scene montages, HUD audio waveforms, and outro cards.
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setVideoMode('full-reel');
                setRecordedVideoUrl(null);
              }}
              className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                videoMode === 'full-reel'
                  ? 'bg-purple-950/40 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/[0.08]'
              }`}
            >
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 mt-0.5">
                <Layers className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-sm font-mono text-white flex items-center gap-2">
                  Full Story Cinema Reel
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                    {allScenes.length * 10}s Total
                  </span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  Sequentially spliced 10-second continuous scenes across Act 1, 2, and 3 with full dialogue audio and transition blends.
                </p>
              </div>
            </button>
          </div>

          {/* Render Controls & Config */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/40 p-4 rounded-xl border border-white/10 text-xs font-mono">
            <div>
              <label className="text-white/40 block mb-1">Resolution</label>
              <select
                value={resolution}
                onChange={(e: any) => setResolution(e.target.value)}
                disabled={isRendering}
                className="w-full bg-[#1A1A22] border border-white/15 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="1080p">1080p (1920x1080)</option>
                <option value="720p">720p (1280x720)</option>
                <option value="anamorphic">21:9 Scope (1920x804)</option>
              </select>
            </div>

            <div>
              <label className="text-white/40 block mb-1">Framerate</label>
              <select
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                disabled={isRendering}
                className="w-full bg-[#1A1A22] border border-white/15 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value={30}>30 FPS (Standard)</option>
                <option value={24}>24 FPS (Cinematic)</option>
                <option value={60}>60 FPS (Fluid)</option>
              </select>
            </div>

            <div>
              <label className="text-white/40 block mb-1">Audio Track</label>
              <button
                type="button"
                onClick={() => setIncludeAudio(!includeAudio)}
                disabled={isRendering}
                className={`w-full py-1.5 px-2 rounded-lg border text-center transition-all ${
                  includeAudio
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                    : 'bg-white/5 border-white/10 text-white/40'
                }`}
              >
                {includeAudio ? 'Synth Score ON' : 'Muted'}
              </button>
            </div>

            <div>
              <label className="text-white/40 block mb-1">HUD Overlay</label>
              <button
                type="button"
                onClick={() => setIncludeHUD(!includeHUD)}
                disabled={isRendering}
                className={`w-full py-1.5 px-2 rounded-lg border text-center transition-all ${
                  includeHUD
                    ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                    : 'bg-white/5 border-white/10 text-white/40'
                }`}
              >
                {includeHUD ? 'Telemetry ON' : 'Clean'}
              </button>
            </div>
          </div>

          {/* Canvas Preview / Video Player Output */}
          <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden bg-black border border-white/15 shadow-2xl flex items-center justify-center">
            {recordedVideoUrl ? (
              <video
                src={recordedVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : (
              <>
                <canvas
                  ref={canvasRef}
                  width={1280}
                  height={720}
                  className="w-full h-full object-contain"
                />
                {!isRendering && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3 pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-400">
                      <Play className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white font-mono">
                        Ready to Render "{project.title}"
                      </p>
                      <p className="text-xs text-white/40 max-w-md mt-1">
                        Click "Start MP4 Generation" below to record the high-bitrate video stream directly in your browser.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Render Progress & Status Bar */}
          {isRendering && (
            <div className="space-y-2 bg-blue-950/20 p-4 rounded-xl border border-blue-500/30">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-blue-300 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {statusMessage}
                </span>
                <span className="text-blue-400 font-bold">{renderProgress}%</span>
              </div>
              <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-150"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
            </div>
          )}

          {recordedVideoUrl && !isRendering && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Video compiled successfully ({recordedBlob ? (recordedBlob.size / (1024 * 1024)).toFixed(2) : '0'} MB)</span>
              </div>
              <span className="text-[10px] uppercase bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                Ready to Save
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="text-xs text-white/40 font-mono hidden sm:block">
            Codec: {recordedMimeType} • 30 FPS • Rec.709
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {isRendering ? (
              <button
                onClick={handleCancelRender}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-mono text-xs font-semibold border border-rose-500/40 transition-colors"
              >
                Cancel Render
              </button>
            ) : recordedVideoUrl ? (
              <>
                <button
                  onClick={handleStartRender}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-xs border border-white/10 transition-colors"
                >
                  Re-Render
                </button>
                <button
                  id="btn-download-mp4-file"
                  onClick={handleDownload}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-400/40 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download MP4 File</span>
                </button>
              </>
            ) : (
              <button
                id="btn-start-render-mp4"
                onClick={handleStartRender}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-blue-400/40 transition-all active:scale-95"
              >
                <Video className="w-4 h-4" />
                <span>Start MP4 Generation</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
