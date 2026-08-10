import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/workspace-store";
import { Initials, PageHeader, Panel, Tag } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const list = ws.notes.filter((n) => `${n.title} ${n.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase()));
  const note = ws.notes.find((n) => n.id === active) ?? list[0];

  return (
    <div className="space-y-6">
      <PageHeader title="Notes" subtitle={`${ws.notes.length} notes across literature review, experiments and meetings`} actions={<AddNoteDialog onCreated={setActive} />} />

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Panel className="p-3">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes…" className="mb-3" />
          <ul className="max-h-[70vh] space-y-1.5 overflow-y-auto">
            {list.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => setActive(n.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${note?.id === n.id ? "border-brand/40 bg-brand/6" : "border-border hover:bg-secondary/60"}`}
                >
                  <p className="line-clamp-2 text-sm font-medium leading-snug">{n.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{n.type} · {n.updated}</p>
                </button>
              </li>
            ))}
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
                  title="Delete Note"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Delete
                </Button>
              </div>
              <h2 className="font-display mt-4 text-xl font-bold">{note.title}</h2>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Initials member={ws.member(note.authorId)} size={22} />
                {ws.member(note.authorId)?.name} · updated {note.updated}
                {note.paperId && <span>· linked to {ws.papers.find((p) => p.id === note.paperId)?.title.slice(0, 40)}…</span>}
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
  const [f, setF] = useState({ title: "", type: "Research" as (typeof TYPES)[number], body: "", tags: "" });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="mr-1.5 h-4 w-4" /> Add Note</Button></DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>New note</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label className="mb-1.5 block text-xs text-muted-foreground">Title</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={160} /></div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Type</Label>
            <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v as (typeof TYPES)[number] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div><Label className="mb-1.5 block text-xs text-muted-foreground">Tags (comma separated)</Label><Input value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} /></div>
          <div><Label className="mb-1.5 block text-xs text-muted-foreground">Content (markdown supported)</Label><Textarea rows={8} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} maxLength={8000} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            if (f.title.trim().length < 3) { toast.error("Add a note title"); return; }
            ws.addNote({ title: f.title.trim(), type: f.type, authorId: ws.currentUser.id, tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean), body: f.body });
            toast.success("Note created");
            onCreated("");
            setOpen(false);
          }}>Create note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}