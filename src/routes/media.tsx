import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/workspace-store";
import { Initials, PageHeader, Panel, Tag } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "Screenshots & Figures Board — ResearchHub" },
      { name: "description", content: "Visual research board for diagrams, figures, benchmark tables and architecture screenshots, linked to papers and tasks." },
      { property: "og:title", content: "Screenshots & Figures Board — ResearchHub" },
      { property: "og:description", content: "A visual board for every research figure and diagram." },
    ],
  }),
  component: MediaPage,
});

function MediaPage() {
  const ws = useWorkspace();
  const [openId, setOpenId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const shot = ws.shots.find((s) => s.id === openId);

  return (
    <div className="space-y-6">
      <PageHeader title="Screenshots & Figures" subtitle={`${ws.shots.length} images from papers, experiments and whiteboards`} actions={<UploadDialog />} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ws.shots.map((s) => (
          <button key={s.id} onClick={() => setOpenId(s.id)} className="text-left">
            <Panel className="overflow-hidden transition-transform hover:-translate-y-0.5">
              <div className="h-36 w-full" style={{ background: `linear-gradient(135deg, oklch(0.78 0.11 ${s.hue}), oklch(0.42 0.13 ${s.hue}))` }} />
              <div className="p-4">
                <p className="line-clamp-2 text-sm font-medium leading-snug">{s.title}</p>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{s.source}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">{s.tags.map((t) => (<Tag key={t}>{t}</Tag>))}</div>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Initials member={ws.member(s.uploadedBy)} size={20} /> {s.date} · {s.comments.length} comments
                </div>
              </div>
            </Panel>
          </button>
        ))}
      </div>

      <Dialog open={Boolean(shot)} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          {shot && (
            <>
              <DialogHeader><DialogTitle className="text-left">{shot.title}</DialogTitle></DialogHeader>
              <div className="h-72 w-full rounded-xl" style={{ background: `linear-gradient(135deg, oklch(0.78 0.11 ${shot.hue}), oklch(0.42 0.13 ${shot.hue}))` }} />
              <p className="text-sm text-muted-foreground">{shot.description}</p>
              <p className="text-xs text-muted-foreground">Source: {shot.source} · uploaded by {ws.member(shot.uploadedBy)?.name} on {shot.date}</p>
              <div className="space-y-2">
                {shot.comments.map((c, i) => (
                  <div key={i} className="rounded-xl bg-surface-muted p-3 text-sm"><span className="font-semibold">{c.author}: </span>{c.text}</div>
                ))}
                <div className="flex gap-2">
                  <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment…" maxLength={400} />
                  <Button onClick={() => { if (!comment.trim()) return; ws.commentShot(shot.id, comment.trim()); setComment(""); toast.success("Comment added"); }}>Post</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UploadDialog() {
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", description: "", tags: "", source: "Own work" });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Upload className="mr-1.5 h-4 w-4" /> Upload Screenshot</Button></DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Upload a research image</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label className="mb-1.5 block text-xs text-muted-foreground">Title</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={140} /></div>
          <div><Label className="mb-1.5 block text-xs text-muted-foreground">Description</Label><Input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} maxLength={300} /></div>
          <div><Label className="mb-1.5 block text-xs text-muted-foreground">Source</Label><Input value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} /></div>
          <div><Label className="mb-1.5 block text-xs text-muted-foreground">Tags</Label><Input value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} placeholder="figure, results" /></div>
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">Drop an image here (demo mode — a placeholder tile is generated)</div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            if (f.title.trim().length < 3) { toast.error("Add a title"); return; }
            ws.addShot({ title: f.title.trim(), description: f.description, tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean), source: f.source, uploadedBy: ws.currentUser.id, hue: Math.floor(Math.random() * 360) });
            toast.success("Screenshot added to the board");
            setOpen(false);
          }}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}