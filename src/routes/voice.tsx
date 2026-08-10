import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Mic, Pause, Play, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/workspace-store";
import { Initials, PageHeader, Panel } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [title, setTitle] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader title="Voice Notes" subtitle={`${ws.voiceNotes.length} recordings linked to papers, tasks and meetings`} />

      <Panel className="p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Voice note title…" maxLength={140} />
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={recording ? "secondary" : "default"} onClick={() => { setRecording(true); toast.info("Recording…"); }}>
              <Mic className="mr-1.5 h-4 w-4" /> Record
            </Button>
            <Button variant="outline" onClick={() => toast.info("Paused")} disabled={!recording}><Pause className="h-4 w-4" /></Button>
            <Button
              variant="outline"
              disabled={!recording}
              onClick={() => {
                setRecording(false);
                ws.addVoiceNote({ title: title.trim() || "Untitled voice note", seconds: 60 + Math.floor(Math.random() * 200), authorId: ws.currentUser.id, description: "Recorded in the browser." });
                setTitle("");
                toast.success("Voice note saved");
              }}
            >
              <Square className="h-4 w-4" />
            </Button>
            {recording && <span className="flex items-center gap-2 text-sm font-medium text-destructive"><span className="h-2 w-2 animate-pulse rounded-full bg-destructive" /> recording</span>}
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        {ws.voiceNotes.map((v) => (
          <Panel key={v.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">🎙 {v.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{v.description}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">{fmt(v.seconds)}</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button onClick={() => setPlaying(playing === v.id ? null : v.id)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground">
                {playing === v.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <div className="flex h-9 flex-1 items-center gap-[3px]">
                {Array.from({ length: 44 }, (_, i) => (
                  <span key={i} className={`w-full rounded-full ${playing === v.id && i < 22 ? "bg-brand" : "bg-secondary"}`} style={{ height: `${20 + Math.abs(Math.sin(i * 1.7)) * 70}%` }} />
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <Initials member={ws.member(v.authorId)} size={20} /> {ws.member(v.authorId)?.name} · {v.date}
              {v.paperId && <span className="rounded-md bg-secondary px-2 py-0.5">📄 {ws.papers.find((p) => p.id === v.paperId)?.title.slice(0, 28)}…</span>}
              {v.taskId && <span className="rounded-md bg-secondary px-2 py-0.5">✅ {ws.tasks.find((t) => t.id === v.taskId)?.title.slice(0, 28)}…</span>}
              <span className="ml-auto flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => { const t = prompt("Rename voice note", v.title); if (t) { ws.renameVoiceNote(v.id, t); toast.success("Renamed"); } }}>Rename</Button>
                <Button size="sm" variant="ghost" onClick={() => toast.success("Download started")}><Download className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="ghost" onClick={() => { ws.removeVoiceNote(v.id); toast.success("Deleted"); }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </span>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}