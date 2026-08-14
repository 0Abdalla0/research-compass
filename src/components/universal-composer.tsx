import { useState, useRef, useEffect } from "react";
import { Mic, Paperclip, Send, X, Play, Pause, Trash2, Image as ImageIcon, Smile } from "lucide-react";
import { useWorkspace } from "@/lib/workspace-store";
import { uploadFile } from "@/lib/uploads";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface UniversalComposerProps {
  placeholder?: string;
  onSend: (data: {
    content: string;
    attachment?: {
      url: string;
      storage_path: string;
      mime_type: string;
      size_bytes: number;
    };
    type: "text" | "voice" | "image" | "file";
  }) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
}

export function UniversalComposer({ placeholder = "Write something...", onSend, onTyping }: UniversalComposerProps) {
  const ws = useWorkspace();
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{
    file: File;
    url: string;
    storage_path: string;
    mime_type: string;
    size_bytes: number;
    type: "image" | "file";
  } | null>(null);

  // Mention State
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<any>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Notify parent of typing status
  useEffect(() => {
    if (onTyping) {
      onTyping(text.length > 0);
    }
  }, [text, onTyping]);

  // Mentions Trigger
  useEffect(() => {
    const lastWord = text.split(/\s+/).pop() || "";
    if (lastWord.startsWith("@")) {
      setShowMentions(true);
      setMentionQuery(lastWord.slice(1).toLowerCase());
      setMentionIndex(0);
    } else {
      setShowMentions(false);
    }
  }, [text]);

  const filteredMembers = ws.members.filter((m) =>
    m.name.toLowerCase().replace(/\s+/g, "").includes(mentionQuery)
  );

  const insertMention = (memberName: string) => {
    const words = text.split(/\s+/);
    words.pop(); // Remove the partial "@username"
    const cleanName = memberName.replace(/\s+/g, "");
    setText([...words, `@${cleanName} `].join(" "));
    setShowMentions(false);
  };

  // Keyboard navigation for mentions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions && filteredMembers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((prev) => (prev + 1) % filteredMembers.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(filteredMembers[mentionIndex]?.name || "");
      } else if (e.key === "Escape") {
        setShowMentions(false);
      }
    }
  };

  // File Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAttachment(true);
    const toastId = toast.loading(`Uploading "${file.name}"...`);
    try {
      const isImage = file.type.startsWith("image/");
      const uploadRes = await uploadFile(file, file.name, isImage ? "images" : "documents");
      
      setAttachedFile({
        file,
        url: uploadRes.url,
        storage_path: uploadRes.storage_path,
        mime_type: uploadRes.mime_type,
        size_bytes: uploadRes.size_bytes,
        type: isImage ? "image" : "file",
      });
      toast.success("Attachment ready!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload attachment", { id: toastId });
    } finally {
      setUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Recording
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Audio recording not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      setIsRecording(true);
      setRecordingSeconds(0);
      recorder.start();

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const cancelRecording = () => {
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlayingPreview(false);
  };

  const handlePreviewPlay = () => {
    if (!audioUrl) return;
    if (!audioPreviewRef.current) {
      audioPreviewRef.current = new Audio(audioUrl);
      audioPreviewRef.current.onended = () => setIsPlayingPreview(false);
    }
    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  // Submit
  const handleSend = async () => {
    if (!text.trim() && !audioBlob && !attachedFile) return;

    const toastId = toast.loading("Sending...");
    try {
      if (audioBlob) {
        // Upload voice recording
        const firstPart = audioBlob.type.split(";")[0] || "";
        const ext = firstPart.split("/")[1] || "webm";
        const name = `voice_comment_${Date.now()}.${ext}`;
        const uploadRes = await uploadFile(audioBlob, name, "voice");

        await onSend({
          content: text.trim() || `Voice message (${Math.floor(recordingSeconds / 60)}:${(recordingSeconds % 60).toString().padStart(2, "0")})`,
          type: "voice",
          attachment: {
            url: uploadRes.url,
            storage_path: uploadRes.storage_path,
            mime_type: uploadRes.mime_type,
            size_bytes: uploadRes.size_bytes,
          },
        });
      } else if (attachedFile) {
        await onSend({
          content: text.trim(),
          type: attachedFile.type,
          attachment: {
            url: attachedFile.url,
            storage_path: attachedFile.storage_path,
            mime_type: attachedFile.mime_type,
            size_bytes: attachedFile.size_bytes,
          },
        });
      } else {
        await onSend({
          content: text.trim(),
          type: "text",
        });
      }

      // Reset states
      setText("");
      setAudioBlob(null);
      setAudioUrl(null);
      setAttachedFile(null);
      setIsPlayingPreview(false);
      toast.success("Sent!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message", { id: toastId });
    }
  };

  return (
    <div className="relative border border-border/80 bg-background/50 backdrop-blur-md rounded-xl p-3 flex flex-col gap-2">
      {/* Mentions Autocomplete list */}
      {showMentions && filteredMembers.length > 0 && (
        <div className="absolute bottom-full left-0 mb-1 w-64 max-h-48 overflow-y-auto bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl p-1 z-50">
          {filteredMembers.map((member, idx) => (
            <button
              key={member.id}
              onClick={() => insertMention(member.name)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                idx === mentionIndex ? "bg-brand text-brand-foreground" : "hover:bg-muted"
              }`}
            >
              <div
                className="h-5 w-5 rounded-full flex items-center justify-center font-bold text-[9px] uppercase border"
                style={{
                  backgroundColor: `${member.color}15`,
                  color: member.color,
                  borderColor: `${member.color}30`,
                }}
              >
                {member.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{member.name}</p>
                <p className="text-[10px] opacity-75">{member.role}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Voice Recorder Overlay bar */}
      {isRecording && (
        <div className="flex items-center justify-between bg-warning/10 border border-warning/20 rounded-lg px-3 py-2 text-warning animate-pulse">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="h-2.5 w-2.5 bg-destructive rounded-full animate-ping" />
            Recording Audio: {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, "0")}
          </div>
          <Button variant="ghost" size="sm" onClick={stopRecording} className="text-warning hover:bg-warning/20">
            Stop & Preview
          </Button>
        </div>
      )}

      {/* Audio Preview playback */}
      {audioUrl && !isRecording && (
        <div className="flex items-center justify-between bg-brand/5 border border-brand/20 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={handlePreviewPlay} className="h-8 w-8 text-brand">
              {isPlayingPreview ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <span className="text-xs text-muted-foreground font-mono">
              Voice Note Preview ({Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, "0")})
            </span>
          </div>
          <Button size="icon" variant="ghost" onClick={cancelRecording} className="h-8 w-8 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Attached file bar */}
      {attachedFile && (
        <div className="flex items-center justify-between bg-muted border border-border rounded-lg px-3 py-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            {attachedFile.type === "image" ? <ImageIcon className="h-4 w-4" /> : <Paperclip className="h-4 w-4" />}
            <span className="truncate max-w-[200px] font-medium">{attachedFile.file.name}</span>
            <span>({(attachedFile.size_bytes / 1024 / 1024).toFixed(2)} MB)</span>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setAttachedFile(null)} className="h-6 w-6">
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Main text composer input */}
      {!isRecording && !audioUrl && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground/60 min-h-[40px] max-h-[160px] leading-relaxed"
          rows={1}
        />
      )}

      {/* Action Buttons bar */}
      <div className="flex items-center justify-between border-t border-border/40 pt-2 text-muted-foreground">
        <div className="flex items-center gap-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:text-foreground"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAttachment || isRecording || !!audioUrl || !!attachedFile}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:text-foreground"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = "image/*";
                fileInputRef.current.click();
              }
            }}
            disabled={uploadingAttachment || isRecording || !!audioUrl || !!attachedFile}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={`h-8 w-8 ${isRecording ? "text-destructive" : "hover:text-foreground"}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={uploadingAttachment || !!audioUrl || !!attachedFile}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>

        <Button
          size="sm"
          onClick={handleSend}
          disabled={(!text.trim() && !audioBlob && !attachedFile) || uploadingAttachment || isRecording}
          className="gap-1.5"
        >
          <span>Send</span>
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
