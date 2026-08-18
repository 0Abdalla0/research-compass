import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { ArrowLeft, ExternalLink, Image as ImageIcon, Link2, Mic, NotebookPen, Save, MessageSquare, Edit3, Pause, Play, Download, FileText, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/workspace-store";
import { ThreadView } from "@/components/thread-view";
import { UniversalComposer } from "@/components/universal-composer";
import { uploadFile } from "@/lib/uploads";
import { ANALYSIS_SECTIONS, Paper, Priority, TaskStatus } from "@/data/workspace";
import { Initials, Meter, Panel, StatusPill, Tag } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TaskSheetContent } from "./tasks";

export const Route = createFileRoute("/papers/$id")({
  head: () => ({
    meta: [
      { title: "Paper Analysis Workspace — ResearchHub" },
      {
        name: "description",
        content:
          "Collaboratively analyze a research paper: problem, method, dataset, models, metrics, results, limitations and research gap.",
      },
      { property: "og:title", content: "Paper Analysis Workspace — ResearchHub" },
      { property: "og:description", content: "Structured, collaborative paper analysis for research teams." },
    ],
  }),
  component: PaperDetail,
  notFoundComponent: () => (
    <Panel className="p-12 text-center">
      <p className="font-medium">Paper not found</p>
      <Link to="/papers" className="mt-2 inline-block text-sm text-brand">
        Back to library
      </Link>
    </Panel>
  ),
});

function PaperDetail() {
  const { id } = Route.useParams();
  const ws = useWorkspace();
  const paper = ws.papers.find((p) => p.id === id);
  if (!paper) throw notFound();

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeShotId, setActiveShotId] = useState<string | null>(null);
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);

  const relatedTasks = ws.tasks.filter((t) => t.paperId === paper.id);
  const relatedNotes = ws.notes.filter((n) => n.paperId === paper.id);
  const relatedShots = ws.shots.filter((s) => s.paperId === paper.id);
  const relatedVoice = ws.voiceNotes.filter((v) => v.paperId === paper.id);
  const relatedLinks = ws.links.filter((l) => l.paperId === paper.id);
  const relatedPapers = ws.papers.filter((p) => p.id !== paper.id && p.category === paper.category).slice(0, 3);

  const paperChat = ws.conversations.find((c) => c.paper_id === paper.id);

  useEffect(() => {
    if (ws.isLoaded && !paperChat && paper.id && ws.currentUser && ws.members.length > 0) {
      ws.addConversation(
        `${paper.title.slice(0, 24)}... Chat`,
        true,
        ws.members.map((m) => m.id),
        paper.id
      ).catch((err) => console.error("Error auto-creating paper chat room:", err));
    }
  }, [ws.isLoaded, paperChat, paper.id, ws.currentUser, ws.members]);

  return (
    <div className="space-y-6">
      <Link to="/papers" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Paper library
      </Link>

      <Panel className="p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={paper.status} />
              <Tag>{paper.category}</Tag>
              <Tag>{paper.year}</Tag>
            </div>
            <h1 className="font-display mt-3 text-2xl font-bold leading-tight">{paper.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{paper.authors}</p>
            <p className="text-sm italic text-muted-foreground">{paper.venue}</p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/90">{paper.abstract}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {paper.keywords.map((k) => (
                <Tag key={k}>{k}</Tag>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={paper.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open source
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success("PDF opened in the file preview")}>
                Preview PDF
              </Button>
              <EditPaperDialog 
                paper={paper}
                trigger={
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit details
                  </Button>
                }
              />
              <span className="inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground">
                DOI {paper.doi || "—"}
              </span>
            </div>
          </div>

          <aside className="space-y-4 rounded-2xl bg-surface-muted p-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Responsible</p>
              <div className="mt-2 flex items-center gap-2">
                <Initials member={ws.member(paper.ownerId)} size={30} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{ws.member(paper.ownerId)?.name}</p>
                  <p className="text-[11px] text-muted-foreground">{ws.member(paper.ownerId)?.role}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Analysis progress</span>
                <span className="font-semibold">{paper.progress}%</span>
              </div>
              <div className="mt-2">
                <Meter value={paper.progress} tone={paper.progress === 100 ? "success" : "brand"} />
              </div>
            </div>
            <dl className="space-y-1.5 text-xs">
              <Row k="Linked tasks" v={relatedTasks.length} />
              <Row k="Notes" v={relatedNotes.length} />
              <Row k="Screenshots" v={relatedShots.length} />
              <Row k="Voice notes" v={relatedVoice.length} />
              <Row k="Resources" v={relatedLinks.length} />
            </dl>
          </aside>
        </div>
      </Panel>

      <Tabs defaultValue="analysis">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="analysis">Analysis workspace</TabsTrigger>
          <TabsTrigger value="linked">Linked items</TabsTrigger>
          <TabsTrigger value="related">Related papers</TabsTrigger>
          <TabsTrigger value="discussion">Discussion & Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {ANALYSIS_SECTIONS.map((section) => (
              <AnalysisSection key={section} paperId={paper.id} section={section} value={paper.analysis[section] ?? ""} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="linked" className="mt-4 grid gap-4 lg:grid-cols-2">
          <LinkedPanel
            title="Tasks"
            icon={<NotebookPen className="h-4 w-4" />}
            empty="No tasks linked to this paper yet."
            action={<AddLinkedTaskDialog paperId={paper.id} />}
          >
            {relatedTasks.map((t) => (
              <li 
                key={t.id} 
                onClick={() => setActiveTaskId(t.id)}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 cursor-pointer hover:bg-secondary/40 hover:border-brand/30 transition-all"
              >
                <span className="min-w-0 truncate text-sm font-medium">{t.title}</span>
                <Initials member={ws.member(t.assigneeId)} size={22} />
              </li>
            ))}
          </LinkedPanel>
          <LinkedPanel
            title="Notes"
            icon={<NotebookPen className="h-4 w-4" />}
            empty="No notes yet."
            action={<AddLinkedNoteDialog paperId={paper.id} />}
          >
            {relatedNotes.map((n) => (
              <li 
                key={n.id} 
                onClick={() => setActiveNoteId(n.id)}
                className="rounded-xl border border-border p-3 cursor-pointer hover:bg-secondary/40 hover:border-brand/30 transition-all"
              >
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {n.type} · updated {n.updated}
                </p>
              </li>
            ))}
          </LinkedPanel>
          <LinkedPanel
            title="Screenshots"
            icon={<ImageIcon className="h-4 w-4" />}
            empty="No screenshots yet."
            action={<UploadLinkedShotDialog paperId={paper.id} />}
          >
            {relatedShots.map((s) => (
              <li 
                key={s.id} 
                onClick={() => setActiveShotId(s.id)}
                className="flex items-center gap-3 rounded-xl border border-border p-3 cursor-pointer hover:bg-secondary/40 hover:border-brand/30 transition-all"
              >
                <span
                  className="h-10 w-14 shrink-0 rounded-md"
                  style={{ background: `linear-gradient(135deg, oklch(0.72 0.11 ${s.hue}), oklch(0.45 0.13 ${s.hue}))` }}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{s.title}</span>
                  <span className="block text-[11px] text-muted-foreground">{s.source}</span>
                </span>
              </li>
            ))}
          </LinkedPanel>
          <LinkedPanel
            title="Voice notes & resources"
            icon={<Mic className="h-4 w-4" />}
            empty="Nothing attached yet."
            action={
              <div className="flex items-center gap-1.5">
                <AddLinkedResourceDialog paperId={paper.id} />
                <AddLinkedVoiceDialog paperId={paper.id} />
              </div>
            }
          >
            {relatedVoice.map((v) => (
              <li 
                key={v.id} 
                onClick={() => setActiveVoiceId(v.id)}
                className="flex items-center gap-3 rounded-xl border border-border p-3 cursor-pointer hover:bg-secondary/40 hover:border-brand/30 transition-all"
              >
                <Mic className="h-4 w-4 shrink-0 text-brand" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{v.title}</span>
                <span className="text-xs text-muted-foreground">
                  {Math.floor(v.seconds / 60)}:{String(v.seconds % 60).padStart(2, "0")}
                </span>
              </li>
            ))}
            {relatedLinks.map((l) => (
              <li key={l.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <Link2 className="h-4 w-4 shrink-0 text-brand" />
                <a href={l.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-sm font-medium hover:text-brand" onClick={(e) => e.stopPropagation()}>
                  {l.title}
                </a>
              </li>
            ))}
          </LinkedPanel>
        </TabsContent>

        <TabsContent value="related" className="mt-4 grid gap-4 md:grid-cols-3">
          {relatedPapers.map((p) => (
            <Link key={p.id} to="/papers/$id" params={{ id: p.id }}>
              <Panel className="h-full p-4 transition-colors hover:border-brand/40">
                <StatusPill status={p.status} />
                <p className="mt-2 line-clamp-3 text-sm font-medium leading-snug">{p.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.authors} · {p.year}
                </p>
              </Panel>
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="discussion" className="mt-4">
          <Panel className="p-6">
            <ThreadView entityId={paper.id} entityType="paper" />
          </Panel>
        </TabsContent>
      </Tabs>

      {/* Sheets and Dialogs for detail previews */}
      <Sheet open={Boolean(activeTaskId)} onOpenChange={(open) => !open && setActiveTaskId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {activeTaskId && (
            <TaskSheetContent 
              task={ws.tasks.find((t) => t.id === activeTaskId)!} 
              onClose={() => setActiveTaskId(null)} 
            />
          )}
        </SheetContent>
      </Sheet>

      {activeNoteId && (
        <NoteDetailsDialog 
          noteId={activeNoteId} 
          onClose={() => setActiveNoteId(null)} 
        />
      )}

      {activeShotId && (
        <ScreenshotDetailsDialog 
          shotId={activeShotId} 
          onClose={() => setActiveShotId(null)} 
        />
      )}

      {activeVoiceId && (
        <VoiceNotePlayDialog 
          voiceId={activeVoiceId} 
          onClose={() => setActiveVoiceId(null)} 
        />
      )}
    </div>
  );
}

function NoteDetailsDialog({ noteId, onClose }: { noteId: string; onClose: () => void }) {
  const ws = useWorkspace();
  const note = ws.notes.find((n) => n.id === noteId);
  if (!note) return null;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Tag>{note.type}</Tag>
            {note.tags.map((t) => (
              <Tag key={t}>#{t}</Tag>
            ))}
          </div>
          <DialogTitle className="mt-2 text-xl font-bold">{note.title}</DialogTitle>
          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
            <Initials member={ws.member(note.authorId)} size={20} />
            <span>{ws.member(note.authorId)?.name}</span>
            <span>·</span>
            <span>updated {note.updated}</span>
          </div>
        </DialogHeader>
        <div className="py-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap border-t border-b border-border/50">
          {note.body || <span className="italic text-muted-foreground">This note has no content yet.</span>}
        </div>
        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose} className="cursor-pointer">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ScreenshotDetailsDialog({ shotId, onClose }: { shotId: string; onClose: () => void }) {
  const ws = useWorkspace();
  const shot = ws.shots.find((s) => s.id === shotId);
  if (!shot) return null;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {shot.tags.map((t) => (
              <Tag key={t}>#{t}</Tag>
            ))}
          </div>
          <DialogTitle className="text-lg font-bold">{shot.title}</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Source: <span className="font-semibold">{shot.source}</span> · Uploaded by {ws.member(shot.uploadedBy)?.name}
          </p>
        </DialogHeader>
        
        <div className="py-3 space-y-4">
          <div className="rounded-xl overflow-hidden border bg-black/5 flex items-center justify-center max-h-[300px]">
            {shot.url ? (
              <img src={shot.url} className="max-h-[300px] object-contain w-full" alt={shot.title} />
            ) : (
              <div 
                className="h-48 w-full flex items-center justify-center font-bold text-white text-lg uppercase"
                style={{ background: `linear-gradient(135deg, oklch(0.72 0.11 ${shot.hue}), oklch(0.45 0.13 ${shot.hue}))` }}
              >
                No Image URL
              </div>
            )}
          </div>
          
          {shot.description && (
            <p className="text-sm leading-relaxed text-foreground bg-secondary/30 p-3 rounded-xl border">
              {shot.description}
            </p>
          )}

          <div className="border-t pt-4">
            <ThreadView entityId={shot.id} entityType="shot" />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="cursor-pointer">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ k, v }: { k: string; v: number }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}

function AddLinkedTaskDialog({ paperId }: { paperId: string }) {
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    title: "",
    description: "",
    assigneeId: "m1",
    priority: "MEDIUM" as Priority,
    status: "todo" as TaskStatus,
    due: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    label: "Research",
  });

  const handleSave = () => {
    if (f.title.trim().length < 3) {
      toast.error("Add a task title (at least 3 characters)");
      return;
    }
    ws.addTask({
      title: f.title.trim(),
      description: f.description,
      assigneeId: f.assigneeId,
      priority: f.priority,
      status: f.status,
      due: f.due,
      labels: [f.label],
      paperId: paperId,
    });
    toast.success("Task created and linked");
    setOpen(false);
    setF({
      title: "",
      description: "",
      assigneeId: "m1",
      priority: "MEDIUM",
      status: "todo",
      due: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      label: "Research",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs cursor-pointer">
          <Plus className="mr-1 h-3.5 w-3.5" /> Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Task for this Paper</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2 text-sm">
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground font-semibold">Title</Label>
            <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={160} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground font-semibold">Description</Label>
            <Textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} maxLength={1000} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground font-semibold">Assignee</Label>
              <select
                value={f.assigneeId}
                onChange={(e) => setF({ ...f, assigneeId: e.target.value })}
                className="w-full h-10 px-3 border border-border rounded-xl bg-card text-xs cursor-pointer focus:outline-none"
              >
                {ws.members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground font-semibold">Priority</Label>
              <select
                value={f.priority}
                onChange={(e) => setF({ ...f, priority: e.target.value as Priority })}
                className="w-full h-10 px-3 border border-border rounded-xl bg-card text-xs cursor-pointer focus:outline-none"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground font-semibold">Column</Label>
              <select
                value={f.status}
                onChange={(e) => setF({ ...f, status: e.target.value as TaskStatus })}
                className="w-full h-10 px-3 border border-border rounded-xl bg-card text-xs cursor-pointer focus:outline-none"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Completed</option>
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground font-semibold">Due date</Label>
              <Input type="date" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label className="mb-1.5 block text-xs text-muted-foreground font-semibold">Label</Label>
              <select
                value={f.label}
                onChange={(e) => setF({ ...f, label: e.target.value })}
                className="w-full h-10 px-3 border border-border rounded-xl bg-card text-xs cursor-pointer focus:outline-none"
              >
                <option value="Research">Research</option>
                <option value="Development">Development</option>
                <option value="Dataset">Dataset</option>
                <option value="Paper">Paper</option>
                <option value="Meeting">Meeting</option>
                <option value="Documentation">Documentation</option>
                <option value="Presentation">Presentation</option>
                <option value="Testing">Testing</option>
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} className="cursor-pointer">Cancel</Button>
          <Button onClick={handleSave} className="cursor-pointer">Create task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddLinkedNoteDialog({ paperId }: { paperId: string }) {
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    title: "",
    type: "Research" as const,
    tags: "",
    body: "",
  });

  const handleSave = () => {
    if (f.title.trim().length < 3) {
      toast.error("Add a note title (at least 3 characters)");
      return;
    }
    ws.addNote({
      title: f.title.trim(),
      type: f.type,
      authorId: ws.currentUser ? ws.currentUser.id : "m1",
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
      body: f.body,
      paperId: paperId,
    });
    toast.success("Note created and linked");
    setOpen(false);
    setF({
      title: "",
      type: "Research",
      tags: "",
      body: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs cursor-pointer">
          <Plus className="mr-1 h-3.5 w-3.5" /> Add Note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Note for this Paper</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2 text-sm">
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground font-semibold">Title</Label>
            <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={140} placeholder="e.g. Findings overview" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground font-semibold">Type</Label>
            <select
              value={f.type}
              onChange={(e) => setF({ ...f, type: e.target.value as any })}
              className="w-full h-10 px-3 border border-border rounded-xl bg-card text-xs cursor-pointer focus:outline-none"
            >
              <option value="Research">Research Note</option>
              <option value="Literature Review">Literature Review</option>
              <option value="Experiment">Experiment Log</option>
              <option value="Brainstorm">Brainstorming</option>
              <option value="Idea">Idea</option>
            </select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground font-semibold">Tags (comma separated)</Label>
            <Input value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} placeholder="gap, logic, findings" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground font-semibold">Content (markdown supported)</Label>
            <Textarea rows={6} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} maxLength={8000} placeholder="Write note body..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} className="cursor-pointer">Cancel</Button>
          <Button onClick={handleSave} className="cursor-pointer">Create note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UploadLinkedShotDialog({ paperId }: { paperId: string }) {
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", description: "", tags: "", source: "Own work" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (f.title.trim().length < 3) {
      toast.error("Add a title (at least 3 characters)");
      return;
    }
    if (!imageFile) {
      toast.error("Please select an image file first");
      return;
    }

    const toastId = toast.loading("Uploading screenshot...");

    try {
      const uploadRes = await uploadFile(imageFile, imageFile.name, "media");

      await ws.addShot({
        title: f.title.trim(),
        description: f.description,
        tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
        source: f.source,
        uploadedBy: ws.currentUser ? ws.currentUser.id : "m1",
        hue: Math.floor(Math.random() * 360),
        url: uploadRes.url,
        storage_path: uploadRes.storage_path,
        mime_type: uploadRes.mime_type,
        size_bytes: uploadRes.size_bytes,
        paperId: paperId,
      });
      toast.success("Screenshot added and linked", { id: toastId });

      // Reset Form
      setF({ title: "", description: "", tags: "", source: "Own work" });
      setImageFile(null);
      setImagePreview(null);
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload screenshot", { id: toastId });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs cursor-pointer">
          <Plus className="mr-1 h-3.5 w-3.5" /> Add Screenshot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Image for this Paper</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2 text-sm">
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground font-semibold">Title</Label>
            <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={140} placeholder="e.g. Model precision plot" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground font-semibold">Description</Label>
            <Input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} maxLength={300} placeholder="Details about this figure..." />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground font-semibold">Source</Label>
            <Input value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground font-semibold">Tags</Label>
            <Input value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} placeholder="figure, results, evaluation" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground font-semibold">Image File</Label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground hover:bg-secondary/40 cursor-pointer transition-colors"
            >
              {imagePreview ? (
                <div className="space-y-2">
                  <img src={imagePreview} className="max-h-20 mx-auto object-contain rounded" alt="Preview" />
                  <p className="text-brand font-semibold">Change selected image</p>
                </div>
              ) : (
                <div className="space-y-1.5 py-1">
                  <Upload className="h-5 w-5 mx-auto text-muted-foreground" />
                  <p className="font-medium text-foreground text-center">Click to upload your image file</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} className="cursor-pointer">Cancel</Button>
          <Button onClick={handleUpload} className="cursor-pointer">Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddLinkedResourceDialog({ paperId }: { paperId: string }) {
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Research Tool");
  const [tagsStr, setTagsStr] = useState("");

  const handleSave = () => {
    if (!title.trim() || !url.trim()) {
      toast.error("Title and URL are required");
      return;
    }
    const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
    ws.addLink({
      title: title.trim(),
      url: url.trim(),
      description: description.trim(),
      category: category.trim(),
      tags,
      addedBy: ws.currentUser ? ws.currentUser.id : "m1",
      paperId: paperId,
    });
    toast.success("Resource link added and linked");
    setOpen(false);
    setTitle("");
    setUrl("");
    setDescription("");
    setTagsStr("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs cursor-pointer">
          <Plus className="mr-1 h-3.5 w-3.5" /> Add Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Resource Link for this Paper</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 text-sm">
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Title</Label>
            <Input placeholder="e.g. Dataset on Zenodo" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">URL</Label>
            <Input placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Description</Label>
            <Input placeholder="Short description of this resource..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Category</Label>
            <Input placeholder="e.g. Dataset, Code, Tool" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Tags (comma separated)</Label>
            <Input placeholder="e.g. python, ontology, dataset" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="cursor-pointer">Cancel</Button>
          <Button onClick={handleSave} className="cursor-pointer">Add Resource</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LinkedPanel({
  title,
  icon,
  empty,
  action,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  empty: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const has = Array.isArray(children) ? children.flat().length > 0 : Boolean(children);
  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="font-display flex items-center gap-2 text-sm font-semibold text-foreground">
          {icon} {title}
        </h3>
        {action}
      </div>
      {has ? <ul className="space-y-2">{children}</ul> : <p className="text-xs text-muted-foreground">{empty}</p>}
    </Panel>
  );
}

function AddLinkedVoiceDialog({ paperId }: { paperId: string }) {
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<any>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

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

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!audioBlob) {
      toast.error("Please record some audio first");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading voice note...");

    try {
      const ext = audioBlob.type.split(";")[0]?.split("/")[1] || "webm";
      const fileName = `voice_note_${Date.now()}.${ext}`;
      const uploadRes = await uploadFile(audioBlob, fileName, "voice");

      await ws.addVoiceNote({
        title: title.trim(),
        description: description.trim(),
        seconds: recordingSeconds,
        authorId: ws.currentUser ? ws.currentUser.id : "m1",
        url: uploadRes.url,
        storage_path: uploadRes.storage_path,
        mime_type: uploadRes.mime_type,
        size_bytes: uploadRes.size_bytes,
        paperId: paperId,
      });

      toast.success("Voice note added and linked", { id: toastId });
      setOpen(false);
      setTitle("");
      setDescription("");
      setAudioBlob(null);
      setAudioUrl(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload voice note", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if(!isRecording) { setOpen(v); if(!v) cancelRecording(); } }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs cursor-pointer">
          <Mic className="mr-1 h-3.5 w-3.5" /> Record Voice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Voice Note for this Paper</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 text-sm">
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground font-semibold">Title</Label>
            <Input placeholder="e.g. Core findings discussion" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isRecording} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground font-semibold">Description</Label>
            <Input placeholder="Short description of this recording..." value={description} onChange={(e) => setDescription(e.target.value)} disabled={isRecording} />
          </div>

          <div className="flex flex-col items-center justify-center p-4 border border-dashed rounded-xl bg-secondary/10">
            {isRecording ? (
              <div className="text-center space-y-3">
                <span className="inline-flex h-3 w-3 rounded-full bg-destructive animate-ping mr-2" />
                <span className="text-sm font-semibold text-destructive">Recording: {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, "0")}</span>
                <div className="flex justify-center gap-2 mt-2">
                  <Button variant="destructive" size="sm" onClick={stopRecording}>Stop & Preview</Button>
                  <Button variant="ghost" size="sm" onClick={cancelRecording}>Cancel</Button>
                </div>
              </div>
            ) : audioUrl ? (
              <div className="text-center space-y-3 w-full">
                <div className="flex items-center justify-center gap-2">
                  <Button size="icon" variant="ghost" onClick={handlePreviewPlay} className="h-8 w-8 text-brand">
                    {isPlayingPreview ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <span className="text-xs text-muted-foreground font-mono">
                    Recording preview ({Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, "0")})
                  </span>
                </div>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={startRecording}>Re-record</Button>
                  <Button variant="ghost" size="sm" onClick={cancelRecording} className="text-destructive">Delete</Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2 py-1">
                <Mic className="h-6 w-6 mx-auto text-muted-foreground animate-pulse" />
                <p className="text-xs text-muted-foreground font-medium">Click below to start recording with your microphone</p>
                <Button onClick={startRecording} size="sm" className="gap-1.5 mt-1">
                  <Mic className="h-3.5 w-3.5" /> Start Recording
                </Button>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isRecording || isUploading} className="cursor-pointer">Cancel</Button>
          <Button onClick={handleSave} disabled={isRecording || isUploading || !audioBlob} className="cursor-pointer">Save Voice Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VoiceNotePlayDialog({ voiceId, onClose }: { voiceId: string; onClose: () => void }) {
  const ws = useWorkspace();
  const voice = ws.voiceNotes.find((v) => v.id === voiceId);
  if (!voice) return null;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Mic className="h-5 w-5 text-brand" /> {voice.title}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Recorded by {ws.member(voice.authorId)?.name} on {new Date(voice.date).toLocaleDateString()}
          </p>
        </DialogHeader>
        
        <div className="py-4 space-y-3">
          {voice.description && (
            <p className="text-sm text-foreground bg-secondary/35 p-3 rounded-xl border">
              {voice.description}
            </p>
          )}

          <div className="flex items-center justify-center p-4 border rounded-xl bg-brand/5">
            {voice.url ? (
              <audio controls src={voice.url} className="w-full" />
            ) : (
              <p className="text-xs text-muted-foreground">No audio URL available</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="cursor-pointer">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AnalysisSection({ paperId, section, value }: { paperId: string; section: string; value: string }) {
  const ws = useWorkspace();
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);
  const dirty = draft !== value;

  return (
    <Panel className="p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{section}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => toast.info(`Comment thread on "${section}"`, { description: "Team comments open in the side panel." })}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
            aria-label="Comment"
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </button>
          {editing ? (
            <Button
              size="sm"
              variant={dirty ? "default" : "ghost"}
              onClick={() => {
                ws.setAnalysis(paperId, section, draft);
                setEditing(false);
                toast.success(`${section} saved`);
              }}
            >
              <Save className="mr-1 h-3.5 w-3.5" /> Save
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </div>
      {editing ? (
        <Textarea
          autoFocus
          rows={5}
          className="mt-2"
          value={draft}
          maxLength={4000}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Write the ${section.toLowerCase()}…`}
        />
      ) : (
        <p className={`mt-2 whitespace-pre-wrap text-sm leading-relaxed ${draft ? "text-foreground/90" : "text-muted-foreground"}`}>
          {draft || "Empty — click Edit to contribute this section."}
        </p>
      )}
    </Panel>
  );
}

function EditPaperDialog({ paper, trigger }: { paper: Paper; trigger: ReactNode }) {
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(paper.title);
  const [authors, setAuthors] = useState(paper.authors);
  const [venue, setVenue] = useState(paper.venue);
  const [year, setYear] = useState(paper.year);
  const [abstract, setAbstract] = useState(paper.abstract);
  const [category, setCategory] = useState(paper.category);
  const [status, setStatus] = useState<Paper["status"]>(paper.status);
  const [url, setUrl] = useState(paper.url);
  const [doi, setDoi] = useState(paper.doi || "");
  const [keywords, setKeywords] = useState(paper.keywords.join(", "));

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Paper title is required");
      return;
    }
    const keywordsList = keywords.split(",").map((k) => k.trim()).filter(Boolean);
    ws.updatePaper(paper.id, {
      title: title.trim(),
      authors: authors.trim(),
      venue: venue.trim(),
      year: Number(year) || new Date().getFullYear(),
      abstract: abstract.trim(),
      category: category.trim(),
      status,
      url: url.trim(),
      doi: doi.trim(),
      keywords: keywordsList,
    });
    toast.success("Paper details updated successfully");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Paper Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Paper Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Authors</Label>
            <Input value={authors} onChange={(e) => setAuthors(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Venue (Journal/Conference)</Label>
              <Input value={venue} onChange={(e) => setVenue(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Year</Label>
              <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Status</Label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as Paper["status"])}
                className="w-full h-10 px-3 border border-border rounded-xl bg-card text-sm cursor-pointer"
              >
                <option value="To Read">To Read</option>
                <option value="Reading">Reading</option>
                <option value="Analyzing">Analyzing</option>
                <option value="Completed">Completed</option>
                <option value="Important">Important</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Abstract</Label>
            <Textarea rows={4} value={abstract} onChange={(e) => setAbstract(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">DOI</Label>
              <Input value={doi} onChange={(e) => setDoi(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Keywords (comma separated)</Label>
            <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="cursor-pointer">Cancel</Button>
          <Button onClick={handleSave} className="cursor-pointer">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}