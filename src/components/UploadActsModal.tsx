import React, { useState, useRef } from 'react';
import { Act, Scene, IspaModality, IspaSensorTarget } from '../types';
import { 
  UploadCloud, 
  FileText, 
  FileCode, 
  Check, 
  AlertCircle, 
  X, 
  Layers, 
  Sparkles, 
  Download, 
  Eye,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  Film,
  Zap,
  Wand2
} from 'lucide-react';

interface UploadActsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadActs: (acts: Act[], mode: 'append' | 'replace') => void;
  currentActCount: number;
}

export const UploadActsModal: React.FC<UploadActsModalProps> = ({
  isOpen,
  onClose,
  onUploadActs,
  currentActCount,
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'file' | 'text'>('file');
  const [rawText, setRawText] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<'append' | 'replace'>('append');
  const [parsedActs, setParsedActs] = useState<Act[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'json' | 'text' | null>(null);
  const [isParsingPdf, setIsParsingPdf] = useState<boolean>(false);
  const [pdfMeta, setPdfMeta] = useState<{ numPages?: number; textLength?: number; totalScenes?: number } | null>(null);
  const [useAiStructuring, setUseAiStructuring] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const extractIspaToken = (text: string): { token?: string; modality?: IspaModality; sensorTarget?: IspaSensorTarget } => {
    const ispaMap: Record<string, { modality: IspaModality; sensorTarget: IspaSensorTarget }> = {
      HC: { modality: 'Airborne (A)', sensorTarget: 'Parabolic Mic' },
      CC: { modality: 'Airborne (A)', sensorTarget: 'Parabolic Mic' },
      HS: { modality: 'Airborne (A)', sensorTarget: 'Directional Shotgun' },
      DC: { modality: 'Airborne (A)', sensorTarget: 'Directional Shotgun' },
      GW: { modality: 'Airborne (A)', sensorTarget: 'Parabolic Mic' },
      GR: { modality: 'Airborne (A)', sensorTarget: 'Directional Shotgun' },
      SN: { modality: 'Airborne (A)', sensorTarget: 'Shotgun Mic' },
      BB: { modality: 'Subaquatic (W)', sensorTarget: 'Hydrophone' },
      POP: { modality: 'Subaquatic (W)', sensorTarget: 'Hydrophone' },
      SAV: { modality: 'Substrate/Infrasonic (S)', sensorTarget: 'Seismic Geophone' },
      BR: { modality: 'Airborne/Substrate (A/S)', sensorTarget: 'Infrasound Sensor' },
      JC: { modality: 'Mechanical Percussive', sensorTarget: 'Boundary Mic' },
    };

    for (const [token, meta] of Object.entries(ispaMap)) {
      const regex = new RegExp(`\\b${token}\\b`, 'i');
      if (regex.test(text)) {
        return { token, modality: meta.modality, sensorTarget: meta.sensorTarget };
      }
    }
    return {};
  };

  // Helper parser for JSON or unstructured Screenplay text
  const parseActsFromInput = (input: string): Act[] => {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new Error('Input is empty. Please provide a PDF, JSON file, or screenplay text.');
    }

    // Try JSON parsing first
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const json = JSON.parse(trimmed);
        let rawList: any[] = [];
        if (Array.isArray(json)) {
          rawList = json;
        } else if (json.acts && Array.isArray(json.acts)) {
          rawList = json.acts;
        } else if (json.scenes && Array.isArray(json.scenes)) {
          rawList = [{
            id: `act-${Date.now()}`,
            actNumber: 1,
            title: json.title || 'Uploaded Act',
            dramaticPurpose: json.dramaticPurpose || 'Custom narrative sequence',
            summary: json.summary || '',
            scenes: json.scenes,
          }];
        }

        if (rawList.length > 0) {
          return rawList.map((a, aIdx) => {
            const actNum = a.actNumber || (uploadMode === 'append' ? currentActCount + aIdx + 1 : aIdx + 1);
            const actId = a.id || `uploaded-act-${Date.now()}-${aIdx + 1}`;
            const scenesList: Scene[] = Array.isArray(a.scenes) ? a.scenes.map((s: any, sIdx: number) => {
              const ispaData = extractIspaToken(s.videoPrompt || s.dialogueOrVoiceover || s.actionSummary || '');
              return {
                id: s.id || `scene-${actNum}-${sIdx + 1}-${Date.now()}`,
                actId: actId,
                actNumber: actNum,
                actTitle: a.title || `Act ${actNum}`,
                sceneNumber: s.sceneNumber || sIdx + 1,
                title: s.title || `Clip ${String(sIdx + 1).padStart(2, '0')}`,
                duration: s.duration || 10,
                setting: s.setting || 'Cinematic river environment',
                actionSummary: s.actionSummary || 'Scene action unfolds with continuous momentum.',
                charactersPresent: Array.isArray(s.charactersPresent) ? s.charactersPresent : ['Barnaby (Puppy 1)', 'Ganga (Juvenile Gharial)'],
                cameraDirection: s.cameraDirection || 'Cinematic tracking shot, 35mm lens',
                moodAndLighting: s.moodAndLighting || 'Volumetric natural lighting',
                dialogueOrVoiceover: s.dialogueOrVoiceover || s.synchronizedAudioTrack || 'Synchronized bioacoustic track.',
                dialogueSpeaker: s.dialogueSpeaker || 'Audio Track',
                synchronizedAudioTrack: s.synchronizedAudioTrack || s.dialogueOrVoiceover,
                imagePrompt: s.imagePrompt || `Photorealistic cinematic keyframe of ${s.title || 'scene'}`,
                videoPrompt: s.videoPrompt || s.imagePrompt || `10-second continuous cinematic shot: ${s.title || 'scene'}`,
                transition: s.transition || 'crossfade',
                transitionDuration: s.transitionDuration || 1.0,
                ispaToken: s.ispaToken || ispaData.token,
                ispaModality: s.ispaModality || ispaData.modality,
                ispaSensorTarget: s.ispaSensorTarget || ispaData.sensorTarget,
              };
            }) : [];

            return {
              id: actId,
              actNumber: actNum,
              title: a.title || `Act ${actNum}: Uploaded Sequence`,
              dramaticPurpose: a.dramaticPurpose || 'Custom narrative escalation',
              summary: a.summary || '',
              scenes: scenesList,
            };
          });
        }
      } catch (err: any) {
        if (trimmed.startsWith('[') || (trimmed.startsWith('{') && !trimmed.includes('Act'))) {
          throw new Error(`JSON syntax error: ${err.message}`);
        }
      }
    }

    // Text / Script Line-by-Line Parser (supporting arbitrary scenes per act)
    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
    const acts: Act[] = [];
    let currentAct: Act | null = null;
    let currentScenes: Scene[] = [];
    let actIndex = 0;

    lines.forEach((line) => {
      // Detect Act Header (e.g. "Act I: Hatchling Echoes", "Act 2: Alarm & Defense", "ACT III")
      const actMatch = line.match(/^Act\s+([IVXLCDM\d]+)[:\s-]*(.*)/i);
      if (actMatch) {
        if (currentAct) {
          currentAct.scenes = currentScenes;
          acts.push(currentAct);
          currentScenes = [];
        }
        actIndex++;
        const actNum = uploadMode === 'append' ? currentActCount + actIndex : actIndex;
        const actTitle = line.replace(/^[#*\s]+/, '');
        currentAct = {
          id: `act-text-${Date.now()}-${actIndex}`,
          actNumber: actNum,
          title: actTitle || `Act ${actNum}`,
          dramaticPurpose: 'Narrative sequence progression',
          summary: '',
          scenes: [],
        };
        return;
      }

      // If no act has been created yet, create an initial default act
      if (!currentAct) {
        actIndex++;
        const actNum = uploadMode === 'append' ? currentActCount + actIndex : actIndex;
        currentAct = {
          id: `act-text-${Date.now()}-${actIndex}`,
          actNumber: actNum,
          title: `Act ${actNum}: Custom Sequence`,
          dramaticPurpose: 'Imported storyboard sequence',
          summary: '',
          scenes: [],
        };
      }

      // Detect Clip / Scene lines (e.g. "01 0:00 - 0:10 Wide shot...", "Clip 1: ...", "Scene 2", "1. ...")
      const clipMatch = line.match(/^(?:Clip\s+|Scene\s+)?(\d{1,3})[\s:.)\t]+(?:(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})[\s\t]+)?(.*)/i);
      if (clipMatch) {
        const sceneNum = currentScenes.length + 1;
        const rawDesc = clipMatch[3] || line;
        const ispaData = extractIspaToken(rawDesc);

        const newScene: Scene = {
          id: `scene-${currentAct.actNumber}-${sceneNum}-${Date.now()}`,
          actId: currentAct.id,
          actNumber: currentAct.actNumber,
          actTitle: currentAct.title,
          sceneNumber: sceneNum,
          title: `Clip ${String(sceneNum).padStart(2, '0')}: ${rawDesc.slice(0, 32)}...`,
          duration: 10,
          setting: 'Indian river sandbar environment',
          actionSummary: rawDesc,
          charactersPresent: ['Barnaby (Puppy 1)', 'Ganga (Juvenile Gharial)'],
          cameraDirection: 'Cinematic 35mm wildlife shot, natural lighting',
          moodAndLighting: 'Golden hour river reflections, rich contrast',
          dialogueOrVoiceover: ispaData.token ? `[${ispaData.token}] Bioacoustic vocalization` : 'Puppy play-barks.',
          dialogueSpeaker: ispaData.token ? 'Ganga (Juvenile Gharial)' : 'Barnaby (Puppy 1)',
          synchronizedAudioTrack: ispaData.token ? `Gharial: ${ispaData.token} vocalization.` : 'Puppy play-barks.',
          imagePrompt: `${rawDesc}, photorealistic 35mm wildlife cinema, 8k National Geographic style`,
          videoPrompt: `10-second continuous shot: ${rawDesc}, 60fps photorealistic cinematic`,
          transition: 'crossfade',
          transitionDuration: 1.0,
          ispaToken: ispaData.token,
          ispaModality: ispaData.modality,
          ispaSensorTarget: ispaData.sensorTarget,
        };
        currentScenes.push(newScene);
      }
    });

    if (currentAct) {
      currentAct.scenes = currentScenes;
      acts.push(currentAct);
    }

    if (acts.length === 0 || acts.every(a => a.scenes.length === 0)) {
      throw new Error('Could not parse any valid Acts or Scenes from the provided text. Ensure format matches JSON or standard script layout (e.g. "Act I: Title" followed by "01 0:00 - 0:10 Description").');
    }

    return acts;
  };

  const processPdfFile = async (file: File) => {
    setFileName(file.name);
    setFileType('pdf');
    setIsParsingPdf(true);
    setParseError(null);
    setPdfMeta(null);

    try {
      // Convert PDF file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        try {
          const res = await fetch('/api/parse-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pdfBase64: base64Data,
              filename: file.name,
              currentActCount: uploadMode === 'append' ? currentActCount : 0,
              useAI: useAiStructuring,
            }),
          });

          const data = await res.json();
          if (!res.ok || data.error) {
            throw new Error(data.error || 'Failed to parse PDF on server');
          }

          setRawText(data.rawText || '');
          setPdfMeta({
            numPages: data.numPages,
            textLength: data.textLength,
            totalScenes: data.totalScenes,
          });

          if (data.acts && Array.isArray(data.acts) && data.acts.length > 0) {
            setParsedActs(data.acts);
            setParseError(null);
          } else {
            // Try local parsing from extracted text
            const locallyParsed = parseActsFromInput(data.rawText);
            setParsedActs(locallyParsed);
          }
        } catch (err: any) {
          console.error('PDF parsing error:', err);
          setParseError(`PDF parsing notice: ${err.message}. You can switch to the direct text editor tab to refine the script format.`);
          setParsedActs([]);
        } finally {
          setIsParsingPdf(false);
        }
      };

      reader.onerror = () => {
        setParseError('Failed to read PDF file from disk.');
        setIsParsingPdf(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setParseError(err.message || 'Error handling PDF file.');
      setIsParsingPdf(false);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setParseError(null);

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      processPdfFile(file);
      return;
    }

    setFileType(file.name.endsWith('.json') ? 'json' : 'text');
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setRawText(content);
      try {
        const parsed = parseActsFromInput(content);
        setParsedActs(parsed);
        setParseError(null);
      } catch (err: any) {
        setParseError(err.message);
        setParsedActs([]);
      }
    };
    reader.onerror = () => {
      setParseError('Failed to read uploaded file.');
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawText(val);
    setParseError(null);
    if (!val.trim()) {
      setParsedActs([]);
      return;
    }
    try {
      const parsed = parseActsFromInput(val);
      setParsedActs(parsed);
      setParseError(null);
    } catch (err: any) {
      setParseError(err.message);
      setParsedActs([]);
    }
  };

  const handleConfirmUpload = () => {
    if (parsedActs.length === 0) return;
    onUploadActs(parsedActs, uploadMode);
    onClose();
  };

  const handleDownloadSampleJSON = () => {
    const sample = [
      {
        title: "Act IV: Subaquatic Infrasound",
        dramaticPurpose: "Showcase bubble bursts (BB), hydraulic pops (POP), and infrasonic vibration (SAV)",
        summary: "Gharial demonstrates fluid boundary acoustics in shallow river column.",
        scenes: [
          {
            title: "Subaquatic Bubble Burst",
            duration: 10,
            setting: "Clear river column",
            actionSummary: "Gharial expels rhythmic bubbles from nostrils creating acoustic cavitation.",
            videoPrompt: "10-second macro underwater shot: Luminous bubbles erupt from gharial snout, 60fps",
            dialogueOrVoiceover: "Gharial: Subaquatic [BB] Bubble Burst sequence.",
            synchronizedAudioTrack: "Hydrophone: Cavitation pops and bubble resonance.",
            ispaToken: "BB",
            ispaModality: "Subaquatic (W)",
            ispaSensorTarget: "Hydrophone",
            transition: "crossfade",
            transitionDuration: 1.0
          },
          {
            title: "Hydraulic Jaw-Pop",
            duration: 10,
            setting: "Water surface interface",
            actionSummary: "Gharial clamps jaws with rapid speed creating an acoustic cavitation shockwave.",
            videoPrompt: "10-second slow-motion shot: Gharial snaps jaws shut at water surface creating radial acoustic shockwave, 60fps",
            dialogueOrVoiceover: "Gharial: Resonant hydraulic [POP] Acoustic Jaw-Pop transient.",
            synchronizedAudioTrack: "Hydrophone: Resonant POP transient spike.",
            ispaToken: "POP",
            ispaModality: "Subaquatic (W)",
            ispaSensorTarget: "Hydrophone",
            transition: "crossfade",
            transitionDuration: 1.0
          },
          {
            title: "Substrate Infrasonic Rumble",
            duration: 10,
            setting: "Sandbar riverbed interface",
            actionSummary: "Juvenile gharial emits low-frequency sub-audible resonance creating concentric micro-ripples in the water surface.",
            videoPrompt: "10-second macro shot: Sub-audible vibrations cause water droplets on gharial scutes to dance in Faraday resonance patterns, 60fps",
            dialogueOrVoiceover: "Gharial: [SAV] Sub-Audible Vibration resonance.",
            synchronizedAudioTrack: "Seismic Geophone: Deep 15-28Hz sub-bass rumble.",
            ispaToken: "SAV",
            ispaModality: "Substrate/Infrasonic (S)",
            ispaSensorTarget: "Seismic Geophone",
            transition: "crossfade",
            transitionDuration: 1.0
          }
        ]
      }
    ];

    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'acts-template-sample.json';
    a.click();
  };

  const handleDownloadSampleScript = () => {
    const script = `Act I: Hatchling Echoes & First Contact
01 0:00 - 0:10 Wide shot: Barnaby and Pip frolic along the Chambal river sandbar as Ganga emerges emitting [HC] Hatching Calls.
02 0:10 - 0:20 Medium tracking shot: Pip tilts head curiously at Ganga's [CC] Contact Grunts echoing over the river.
03 0:20 - 0:30 Close-up: Ganga vibrates with low-frequency [HS] Hatchling Squeaks while Barnaby offers playful paw taps.
04 0:30 - 0:40 High-angle panoramic: Sunset reflects across the water as the trio synchronizes on the sandbar.

Act II: Acoustic Discovery & Infrasound
01 0:00 - 0:10 Ganga submerges in shallow riverbed and unleashes rhythmic [BB] Bubble Bursts.
02 0:10 - 0:20 Rapid jaw clap creates a resonant [POP] Acoustic Jaw-Pop sending acoustic cavitation rings across the surface.
03 0:20 - 0:30 Infrasonic [SAV] Sub-Audible Vibration vibrates sand crystals in geometric resonance patterns.
04 0:30 - 0:40 The puppies bark joyfully as Ganga surfaces with a triumphant [BR] Bellow-Roar display.`;

    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-storyboard-script.txt';
    a.click();
  };

  const totalImportedScenes = parsedActs.reduce((acc, a) => acc + a.scenes.length, 0);
  const totalImportedDuration = totalImportedScenes * 10;

  return (
    <div className="fixed inset-0 z-50 bg-[#050505]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in text-[#F0F0F0] select-none">
      <div className="max-w-4xl w-full bg-[#0F0F12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-400">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                Upload Storyboard Acts & Scripts
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                  PDF / JSON / Script / ISPA
                </span>
              </h2>
              <p className="text-xs text-white/40">
                Import PDF storyboards, screenplay documents, JSON act arrays, and arbitrary 10-second scene prompts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-colors border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Method Tabs & Templates */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setActiveInputTab('file')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors ${
                  activeInputTab === 'file'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload PDF / JSON / Text</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveInputTab('text')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors ${
                  activeInputTab === 'text'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Direct Script Text Editor</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSampleScript}
                className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1.5 bg-purple-500/10 px-2.5 py-1.5 rounded-lg border border-purple-500/20 transition-colors"
                title="Download text script template with ISPA bioacoustic tags"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample Script</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSampleJSON}
                className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1.5 bg-blue-500/10 px-2.5 py-1.5 rounded-lg border border-blue-500/20 transition-colors"
                title="Download JSON Act template"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample JSON</span>
              </button>
            </div>
          </div>

          {/* Tab 1: File Dropzone */}
          {activeInputTab === 'file' ? (
            <div className="space-y-3">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-950/20'
                    : 'border-white/10 hover:border-white/20 bg-black/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.json,.txt,.md,.csv,.fountain"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3">
                  {isParsingPdf ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mb-1 font-mono">
                  {fileName ? fileName : 'Choose Storyboard PDF, JSON, or Script'}
                </h4>
                <p className="text-xs text-white/40 max-w-md mb-3 leading-relaxed">
                  Upload PDF screenplays, multi-act JSON files, or formatted text. The engine parses arbitrary numbers of 10-second scenes per act and extracts ISPA tokens automatically.
                </p>
                <div className="flex flex-wrap items-center gap-2 justify-center">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono text-blue-400">
                    PDF Document (.pdf)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-[10px] font-mono text-purple-400">
                    JSON Acts (.json)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-white/60">
                    Screenplay Text (.txt / .md)
                  </span>
                </div>
              </div>

              {/* AI Structuring toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="font-bold text-white font-mono">AI Screenplay Structuring</span>
                    <p className="text-[10px] text-white/40">Use Gemini to structure unformatted PDF scripts into episodic acts & 10s scene prompts</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useAiStructuring}
                    onChange={(e) => setUseAiStructuring(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* PDF Parsing Progress Info */}
              {isParsingPdf && (
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                  <div className="text-xs">
                    <p className="font-bold text-purple-300 font-mono">Parsing PDF Document...</p>
                    <p className="text-white/50 text-[11px]">Extracting text layers, recognizing Act headers, and formatting 10-second scene prompts.</p>
                  </div>
                </div>
              )}

              {pdfMeta && (
                <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-4 text-white/60">
                    <span>Pages: <strong className="text-white">{pdfMeta.numPages || 1}</strong></span>
                    <span>•</span>
                    <span>Text Length: <strong className="text-white">{pdfMeta.textLength || 0} chars</strong></span>
                    <span>•</span>
                    <span>Detected Scenes: <strong className="text-green-400">{parsedActs.reduce((acc, a) => acc + a.scenes.length, 0)}</strong></span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[10px]">
                    PDF PARSED SUCCESSFULLY
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Tab 2: Text / Script Area */
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/60 font-mono">
                  Direct Script / JSON Input
                </label>
                <span className="text-[10px] text-white/40 font-mono">
                  Arbitrary scenes per act (e.g. 5, 12, 20 prompts)
                </span>
              </div>
              <textarea
                id="act-raw-text-input"
                rows={8}
                value={rawText}
                onChange={handleTextChange}
                placeholder={`Paste JSON Act array or formatted screenplay:

Act I: Hatchling Echoes
01 0:00 - 0:10 Wide shot: Puppies encounter juvenile gharial emitting [HC] Hatching Call.
02 0:10 - 0:20 Medium shot: Pip barks curiously as Ganga vibrates with [CC] Contact Grunt.
03 0:20 - 0:30 Close-up: Ganga demonstrates subaquatic [BB] Bubble Burst sequence.
04 0:30 - 0:40 Slow-motion: Hydraulic [POP] creates radial cavitation wave.`}
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 text-xs font-mono leading-relaxed transition-all resize-y"
              />
            </div>
          )}

          {/* Validation or Error Box */}
          {parseError && (
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-bold">Validation Notice</p>
                <p className="text-rose-300/80 mt-0.5 text-[11px]">{parseError}</p>
              </div>
            </div>
          )}

          {/* Live Parsing Preview & Statistics */}
          {parsedActs.length > 0 && (
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                    Parsed Storyboard Ingestion Preview
                  </h4>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {parsedActs.length} Acts
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {totalImportedScenes} Scenes (Arbitrary count)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                    {totalImportedDuration}.00s Duration
                  </span>
                </div>
              </div>

              {/* Act breakdown list */}
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {parsedActs.map((act, aIdx) => (
                  <div key={act.id || aIdx} className="p-3 rounded-lg bg-[#0F0F12] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 font-mono">
                        Act {act.actNumber}: {act.title}
                      </span>
                      <span className="text-[10px] font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded">
                        {act.scenes.length} Scenes ({act.scenes.length * 10}s)
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {act.scenes.map((scene, sIdx) => (
                        <div
                          key={scene.id || sIdx}
                          className="px-2 py-1 rounded bg-black/60 border border-white/5 text-[10px] font-mono text-white/70 flex items-center gap-1.5"
                        >
                          <span className="text-blue-400 font-bold">{String(scene.sceneNumber || sIdx + 1).padStart(2, '0')}</span>
                          <span className="truncate max-w-[140px]">{scene.title}</span>
                          {scene.ispaToken && (
                            <span className="px-1 py-0.2 bg-purple-500/20 text-purple-300 rounded text-[9px] font-bold border border-purple-500/30">
                              [{scene.ispaToken}]
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Import Mode Radio Selectors */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60 font-mono">
              Timeline Integration Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  uploadMode === 'append'
                    ? 'bg-blue-950/20 border-blue-500/60 text-white'
                    : 'bg-black/20 border-white/5 text-white/60 hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  name="uploadMode"
                  value="append"
                  checked={uploadMode === 'append'}
                  onChange={() => setUploadMode('append')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold font-mono">Append to Existing Timeline</span>
                  <p className="text-[10px] text-white/40 mt-0.5">
                    Add new Acts & Scenes after current Act {currentActCount} without modifying existing sequence.
                  </p>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  uploadMode === 'replace'
                    ? 'bg-purple-950/20 border-purple-500/60 text-white'
                    : 'bg-black/20 border-white/5 text-white/60 hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  name="uploadMode"
                  value="replace"
                  checked={uploadMode === 'replace'}
                  onChange={() => setUploadMode('replace')}
                  className="mt-0.5 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="text-xs font-bold font-mono">Replace Timeline</span>
                  <p className="text-[10px] text-white/40 mt-0.5">
                    Overwrite entire timeline acts with the new imported storyboard sequence.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-white/10 flex items-center justify-between bg-black/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmUpload}
            disabled={parsedActs.length === 0 || isParsingPdf}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg ${
              parsedActs.length > 0 && !isParsingPdf
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)] border border-blue-400/40 active:scale-98'
                : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>
              {uploadMode === 'append' ? 'Append Acts to Timeline' : 'Replace Timeline with Acts'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
