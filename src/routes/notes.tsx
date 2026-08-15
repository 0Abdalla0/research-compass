import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Trash2, FileText, KanbanSquare, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/workspace-store";
import { Initials, PageHeader, Panel, Tag } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Note } from "@/data/workspace";

const TYPES = ["Research", "Meeting", "Idea", "Literature Review", "Experiment", "Brainstorm"] as const;

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Research Notes — ResearchHub" },
      { name: "description", content: "Notion-style research, meeting, literature review and experiment notes linked to papers, tasks and team members." },
      { property: "og:title", content: "Research Notes — ResearchHub" },
      { property: "og:description", content: "Structured research documentation for the whole team." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const ws = useWorkspace();
  const [active, setActive] = useState(ws.notes[0]?.id ?? "");
  const [q, setQ] = useState("");
  const [filterType, setFilterType] = useState("all");
  const list = ws.notes.filter((n) => {
    const matchQ = `${n.title} ${n.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase());
    const matchType = filterType === "all" || n.type === filterType;
    return matchQ && matchType;
  });
  const note = ws.notes.find((n) => n.id === active) ?? list[0];
  const linkedPaper = note?.paperId ? ws.papers.find((p) => p.id === note.paperId) : null;
  const linkedTask = note?.taskId ? ws.tasks.find((t) => t.id === note.taskId) : null;

  return (
    <div className="space-y-6">
      <PageHeader title="Notes" subtitle={`${ws.notes.length} notes across literature review, experiments and meetings`} actions={<AddNoteDialog onCreated={setActive} />} />

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Panel className="p-3">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes…" className="mb-2" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="mb-3 w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:border-brand"
          >
            <option value="all">All types</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <ul className="max-h-[70vh] space-y-1.5 overflow-y-auto">
            {list.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => setActive(n.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${note?.id === n.id ? "border-brand/40 bg-brand/6" : "border-border hover:bg-secondary/60"}`}
                >
                  <p className="line-clamp-2 text-sm font-medium leading-snug">{n.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{n.type} · {n.updated}</p>
                  {n.paperId && (
                    <p className="mt-0.5 text-[10px] font-semibold text-brand/70 flex items-center gap-1">
                      <FileText className="h-2.5 w-2.5" /> Paper linked
                    </p>
                  )}
                  {n.taskId && (
                    <p className="mt-0.5 text-[10px] font-semibold text-success/80 flex items-center gap-1">
                      <KanbanSquare className="h-2.5 w-2.5" /> Task linked
                    </p>
                  )}
                </button>
              </li>
            ))}
            {list.length === 0 && <li className="py-6 text-center text-xs text-muted-foreground">No notes found</li>}
          </ul>
        </Panel>

        <Panel className="p-6">
          {note ? (
            <article>
              <div className="flex items-start justify-between gap-4 border-b border-border/40 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag>{note.type}</Tag>
                  {note.tags.map((t) => (<Tag key={t}>#{t}</Tag>))}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <EditNoteDialog note={note} />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete note "${note.title}"?`)) {
                        ws.removeNote(note.id);
                        setActive("");
                        toast.success("Note deleted successfully");
                      }
                    }}
                    className="text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />Delete
                  </Button>
                </div>
              </div>

              <h2 className="font-display mt-4 text-xl font-bold">{note.title}</h2>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Initials member={ws.member(note.authorId)} size={22} />
                {ws.member(note.authorId)?.name} · updated {note.updated}
              </div>

              {/* Relationship Links */}
              <div className="mt-4 flex flex-wrap gap-2">
                {linkedPaper && (
                  <Link
                    to="/papers/$id"
                    params={{ id: linkedPaper.id }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/10 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {linkedPaper.title.slice(0, 45)}…
                  </Link>
                )}
                {linkedTask && (
                  <Link
                    to="/tasks"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-success/30 bg-success/5 px-3 py-1.5 text-xs font-semibold text-success hover:bg-success/10 transition-colors"
                  >
                    <KanbanSquare className="h-3.5 w-3.5" />
                    Task: {linkedTask.title.slice(0, 40)}
                  </Link>
                )}
                {!linkedPaper && !linkedTask && (
                  <p className="text-[11px] text-muted-foreground italic">No links · Add a paper or task link when creating a note</p>
                )}
              </div>

              <pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">{note.body}</pre>
            </article>
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">No notes match your search.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}

function AddNoteDialog({ onCreated }: { onCreated: (id: string) => void }) {
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    title: "",
    type: "Research" as (typeof TYPES)[number],
    body: "",
    tags: "",
    paperId: "",
    taskId: "",
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="mr-1.5 h-4 w-4" /> Add Note</Button></DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>New note</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Title</Label>
            <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={160} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Type</Label>
            <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v as (typeof TYPES)[number] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Tags (comma separated)</Label>
            <Input value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} placeholder="e.g. sepsis, bert, nlp" />
          </div>

          {/* Relationship Links */}
          <div className="border-t border-border/60 pt-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Link to Paper (optional)
            </p>
            <Select value={f.paperId} onValueChange={(v) => setF({ ...f, paperId: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Select a paper…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {ws.papers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.title.slice(0, 55)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <KanbanSquare className="h-3.5 w-3.5" /> Link to Task (optional)
            </p>
            <Select value={f.taskId} onValueChange={(v) => setF({ ...f, taskId: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Select a task…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {ws.tasks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.title.slice(0, 55)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Content (markdown supported)</Label>
            <Textarea rows={8} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} maxLength={8000} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            if (f.title.trim().length < 3) { toast.error("Add a note title"); return; }
            ws.addNote({
              title: f.title.trim(),
              type: f.type,
              authorId: ws.currentUser ? ws.currentUser.id : "m1",
              tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
              body: f.body,
              paperId: f.paperId || undefined,
              taskId: f.taskId || undefined,
            });
            toast.success("Note created");
            onCreated("");
            setOpen(false);
          }}>Create note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditNoteDialog({ note }: { note: Note }) {
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    title: note.title,
    type: note.type,
    body: note.body,
    tags: note.tags.join(", "),
    paperId: note.paperId || "",
    taskId: note.taskId || "",
  });

  useEffect(() => {
    setF({
      title: note.title,
      type: note.type,
      body: note.body,
      tags: note.tags.join(", "),
      paperId: note.paperId || "",
      taskId: note.taskId || "",
    });
  }, [note, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-muted-foreground hover:bg-secondary shrink-0 cursor-pointer">
          <Edit3 className="h-4 w-4 mr-1.5" />Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit note</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Title</Label>
            <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={160} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Type</Label>
            <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v as (typeof TYPES)[number] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Tags (comma separated)</Label>
            <Input value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} placeholder="e.g. sepsis, bert, nlp" />
          </div>

          {/* Relationship Links */}
          <div className="border-t border-border/60 pt-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Link to Paper (optional)
            </p>
            <Select value={f.paperId} onValueChange={(v) => setF({ ...f, paperId: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Select a paper…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {ws.papers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.title.slice(0, 55)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <KanbanSquare className="h-3.5 w-3.5" /> Link to Task (optional)
            </p>
            <Select value={f.taskId} onValueChange={(v) => setF({ ...f, taskId: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Select a task…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {ws.tasks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.title.slice(0, 55)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Content (markdown supported)</Label>
            <Textarea rows={8} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} maxLength={8000} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            if (f.title.trim().length < 3) { toast.error("Add a note title"); return; }
            ws.updateNote(note.id, {
              title: f.title.trim(),
              type: f.type,
              tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
              body: f.body,
              paperId: f.paperId || undefined,
              taskId: f.taskId || undefined,
            });
            toast.success("Note updated");
            setOpen(false);
          }}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}