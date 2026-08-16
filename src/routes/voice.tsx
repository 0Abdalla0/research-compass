import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Download, Mic, Pause, Play, Square, Trash2, Volume2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/workspace-store";
import { uploadFile } from "@/lib/uploads";
import { Initials, PageHeader, Panel, Tag } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/voice")({
  head: () => ({
    meta: [
      { title: "Voice Notes — ResearchHub" },
      { name: "description", content: "Record, play back and attach voice notes to research papers, tasks and meetings." },
      { property: "og:title", content: "Voice Notes — ResearchHub" },
      { property: "og:description", content: "Capture research ideas and supervisor feedback as audio." },
    ],
  }),
  component: VoicePage,
});

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function VoicePage() {
  const ws = useWorkspace();
  const [recording, setRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkType, setLinkType] = useState<"none" | "paper" | "task" | "meeting">("none");
  const [paperId, setPaperId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  
  // Real-time recording stats
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [micVolume, setMicVolume] = useState(0); // Real-time mic volume level (0 to 100)
  
  // Real-time playback progress: { [voiceNoteId]: currentPlayTimeSeconds }
  const [playProgress, setPlayProgress] = useState<Record<string, number>>({});

  // Media references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  
  // Web Audio Analyser references
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Clean up timers and audio on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, []);

  // 1. Start Audio Recording
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Audio recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine the best supported audio MIME type for full cross-platform playback compatibility (specifically Safari/iOS vs Chrome/Firefox)
      let mimeType = "";
      if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4"; // Best for iOS/Safari WebKit
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm"; // Best for Chrome/Firefox
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        mimeType = "audio/ogg";
      } else {
        mimeType = "audio/wav";
      }

      console.log("Selected audio recording MIME type:", mimeType);

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      // Setup real-time Web Audio API analyser to verify microphone audio levels
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        source.connect(analyser);

        const checkVolume = () => {
          if (!recorder || recorder.state === "inactive") return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i] ?? 0;
          }
          const average = sum / bufferLength;
          setMicVolume(average); // Update mic level
          animationFrameRef.current = requestAnimationFrame(checkVolume);
        };
        animationFrameRef.current = requestAnimationFrame(checkVolume);
      } catch (audioErr) {
        console.warn("Could not initialize real-time audio visualizer analyser:", audioErr);
      }

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Clean up visualizer analyser loop
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }

        if (audioChunksRef.current.length === 0) {
          toast.error("Audio recording failed: No sound data captured.");
          setRecording(false);
          return;
        }

        const toastId = toast.loading("Uploading voice recording to Supabase Storage...");

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const mimeFirst = mimeType.split(";")[0] || "";
        const ext = mimeFirst.split("/")[1] || "webm";
        const voiceTitle = title.trim() || "Voice Note";

        try {
          const uploadRes = await uploadFile(audioBlob, `${voiceTitle}.${ext}`, "voice");

          await ws.addVoiceNote({
            title: voiceTitle,
            seconds: elapsedSeconds || 1,
            authorId: ws.currentUser ? ws.currentUser.id : "m1",
            description: description.trim() || `Recorded in the browser (${mimeType.split(";")[0]}).`,
            url: uploadRes.url,
            storage_path: uploadRes.storage_path,
            mime_type: uploadRes.mime_type,
            size_bytes: uploadRes.size_bytes,
            paperId: linkType === "paper" ? (paperId || undefined) : undefined,
            taskId: linkType === "task" ? (taskId || undefined) : undefined,
            meetingId: linkType === "meeting" ? (meetingId || undefined) : undefined,
          });

          toast.success("Voice note saved successfully!", { id: toastId });
        } catch (err) {
          console.error(err);
          toast.error("Failed to upload voice note", { id: toastId });
        }

        setTitle("");
        setDescription("");
        setLinkType("none");
        setPaperId("");
        setTaskId("");
        setMeetingId("");
        setElapsedSeconds(0);
        setMicVolume(0);

        // Release microphone stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250); // Slice data chunks every 250ms to ensure continuous data capture
      setRecording(true);
      setIsPaused(false);
      setElapsedSeconds(0);

      // Start counting up elapsed seconds
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);

      toast.info("Recording started. Talk into your microphone.");
    } catch (err) {
      console.error("Microphone access error:", err);
      toast.error("Microphone access denied. Please grant permission to record.");
    }
  };

  // 2. Pause/Resume Recording
  const togglePauseRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    if (recorder.state === "recording") {
      recorder.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      toast.info("Recording paused");
    } else if (recorder.state === "paused") {
      recorder.resume();
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
      toast.info("Recording resumed");
    }
  };

  // 3. Stop Audio Recording & Save
  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    recorder.stop();
    setRecording(false);
    setIsPaused(false);
  };

  // 4. Play / Pause Voice Note
  const handlePlayPause = (v: ReturnType<typeof useWorkspace>["voiceNotes"][number]) => {
    if (playingId === v.id) {
      if (audioPlayerRef.current) {
        if (audioPlayerRef.current.paused) {
          audioPlayerRef.current.play();
          setPlayingId(v.id);
        } else {
          audioPlayerRef.current.pause();
          setPlayingId(null);
        }
      }
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }

    if (!v.url) {
      toast.error("This is a placeholder note. Please record a new voice note to play real audio!");
      return;
    }

    const audio = new Audio(v.url);
    audioPlayerRef.current = audio;
    setPlayingId(v.id);

    audio.addEventListener("timeupdate", () => {
      setPlayProgress((prev) => ({
        ...prev,
        [v.id]: audio.currentTime,
      }));
    });

    audio.addEventListener("ended", () => {
      setPlayingId(null);
      setPlayProgress((prev) => ({
        ...prev,
        [v.id]: 0,
      }));
    });

    audio.play().catch((err) => {
      console.error("Audio playback error:", err);
      toast.error("Format unsupported or audio playback blocked by browser/device settings.");
      setPlayingId(null);
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Voice Notes" subtitle={`${ws.voiceNotes.length} recordings linked to papers, tasks and meetings`} />

      {/* Real Recorder Panel */}
      <Panel className="p-4 sm:p-5 border border-border bg-card">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Title</Label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Name your voice note..." 
                maxLength={140} 
                disabled={recording}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Link Item Type</Label>
              <select
                value={linkType}
                onChange={(e) => setLinkType(e.target.value as any)}
                disabled={recording}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="none">None (General Note)</option>
                <option value="paper">Research Paper</option>
                <option value="task">Task</option>
                <option value="meeting">Meeting</option>
              </select>
            </div>
            <div>
              {linkType === "paper" && (
                <>
                  <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Link to Research Paper</Label>
                  <select
                    value={paperId}
                    onChange={(e) => setPaperId(e.target.value)}
                    disabled={recording}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed"
                  >
                    <option value="">Select Paper...</option>
                    {ws.papers.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </>
              )}
              {linkType === "task" && (
                <>
                  <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Link to Task</Label>
                  <select
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    disabled={recording}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed"
                  >
                    <option value="">Select Task...</option>
                    {ws.tasks.map((t) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </>
              )}
              {linkType === "meeting" && (
                <>
                  <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Link to Meeting</Label>
                  <select
                    value={meetingId}
                    onChange={(e) => setMeetingId(e.target.value)}
                    disabled={recording}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed"
                  >
                    <option value="">Select Meeting...</option>
                    {ws.meetings.map((m) => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </>
              )}
              {linkType === "none" && (
                <>
                  <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Linked Entity</Label>
                  <div className="flex h-10 w-full rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground items-center">
                    No linked entity selected
                  </div>
                </>
              )}
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Description (Optional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief summary of this recording..."
              disabled={recording}
            />
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
            {!recording ? (
              <Button 
                onClick={startRecording} 
                className="inline-flex items-center gap-2 cursor-pointer w-full sm:w-auto text-xs md:text-sm font-semibold"
              >
                <Mic className="h-4 w-4 text-brand-foreground" /> 
                Record Note
              </Button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={togglePauseRecording} 
                    title={isPaused ? "Resume" : "Pause"}
                    className="cursor-pointer"
                  >
                    <Pause className={`h-4 w-4 ${isPaused ? "animate-pulse text-brand" : "text-foreground"}`} />
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={stopRecording}
                    title="Stop and Save"
                    className="inline-flex items-center gap-1.5 cursor-pointer bg-destructive text-destructive-foreground text-xs md:text-sm font-semibold"
                  >
                    <Square className="h-4 w-4 fill-current" />
                    Save Note
                  </Button>
                </div>
                
                {/* Audio pulse ring matching mic volume */}
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-2 text-xs font-semibold text-destructive bg-destructive/10 px-3 py-2 rounded-xl">
                    <span 
                      className="h-2.5 w-2.5 rounded-full bg-destructive transition-transform duration-75" 
                      style={{ transform: `scale(${1 + Math.min(micVolume / 15, 1.5)})` }}
                    /> 
                    {fmt(elapsedSeconds)} {isPaused && "(Paused)"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Panel>

      {/* Voice Notes List Grid */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {ws.voiceNotes.map((v) => {
          const isPlaying = playingId === v.id;
          const currentPlayTime = playProgress[v.id] || 0;
          const percent = currentPlayTime / v.seconds;
          const activeBars = Math.floor(percent * 44);

          return (
            <Panel key={v.id} className="p-4 sm:p-5 border border-border bg-card flex flex-col justify-between h-full">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Volume2 className="h-4 w-4 text-brand shrink-0" />
                      {v.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{v.description}</p>
                    
                    {/* Linked Entity Info Tag */}
                    {(v.paperId || v.taskId || v.meetingId) && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {v.paperId && (() => {
                          const p = ws.papers.find((x) => x.id === v.paperId);
                          return p ? <Tag>Paper: {p.title.slice(0, 30)}...</Tag> : null;
                        })()}
                        {v.taskId && (() => {
                          const t = ws.tasks.find((x) => x.id === v.taskId);
                          return t ? <Tag>Task: {t.title.slice(0, 30)}...</Tag> : null;
                        })()}
                        {v.meetingId && (() => {
                          const m = ws.meetings.find((x) => x.id === v.meetingId);
                          return m ? <Tag>Meeting: {m.title.slice(0, 30)}...</Tag> : null;
                        })()}
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 text-xs font-bold tabular-nums text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-md">
                    {isPlaying ? `${fmt(Math.floor(currentPlayTime))} / ` : ""}{fmt(v.seconds)}
                  </span>
                </div>

                {/* Real-time Audio Visualizer waves */}
                <div className="mt-4 flex items-center gap-3">
                  <button 
                    onClick={() => handlePlayPause(v)} 
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground hover:scale-105 transition-transform cursor-pointer shadow shadow-brand/20"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                  </button>
                  <div className="flex h-9 flex-1 items-end gap-[3px] select-none">
                    {Array.from({ length: 44 }, (_, i) => {
                      const isActive = isPlaying && i <= activeBars;
                      return (
                        <span 
                          key={i} 
                          className={`w-full rounded-full transition-all duration-300 ${isActive ? "bg-brand" : "bg-secondary"}`} 
                          style={{ height: `${20 + Math.abs(Math.sin(i * 1.7)) * 70}%` }} 
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Initials member={ws.member(v.authorId)} size={18} /> 
                  <span>{ws.member(v.authorId)?.name} · {v.date}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => { 
                      const t = prompt("Rename voice note", v.title); 
                      if (t && t.trim()) { 
                        ws.renameVoiceNote(v.id, t.trim()); 
                        toast.success("Voice note renamed successfully"); 
                      } 
                    }}
                    className="h-8 px-2 text-[11px] font-semibold cursor-pointer"
                  >
                    Rename
                  </Button>
                  
                  {v.url ? (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      asChild
                      className="h-8 px-2 cursor-pointer"
                      title="Download Audio"
                    >
                      <a href={v.url} download={`${v.title}.webm`}>
                        <Download className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toast.info("Download is only available for voice notes recorded in this session.")}
                      className="h-8 px-2 opacity-50 cursor-not-allowed"
                      title="Download Unavailable"
                    >
                      <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}

                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => { 
                      if (confirm(`Are you sure you want to delete "${v.title}"?`)) {
                        ws.removeVoiceNote(v.id); 
                        if (isPlaying) {
                          audioPlayerRef.current?.pause();
                          setPlayingId(null);
                        }
                        toast.success("Voice note deleted"); 
                      }
                    }}
                    className="h-8 px-2 cursor-pointer text-destructive hover:bg-destructive/10"
                    title="Delete Note"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      {ws.voiceNotes.length === 0 && (
        <div className="py-12 text-center border border-dashed border-border rounded-2xl bg-surface-muted/30">
          <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-semibold text-foreground">No voice notes recorded yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Enter a title and click Record above to capture your first note.</p>
        </div>
      )}
    </div>
  );
}