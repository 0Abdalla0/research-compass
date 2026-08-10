import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Upload, Trash2, MessageSquare, Tag as TagIcon, Globe } from "lucide-react";
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
          <button key={s.id} onClick={() => setOpenId(s.id)} className="text-left cursor-pointer group">
            <Panel className="overflow-hidden h-full flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lg border border-border bg-card">
              {s.url ? (
                <div className="h-36 w-full overflow-hidden bg-muted border-b border-border">
                  <img src={s.url} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" alt={s.title} />
                </div>
              ) : (
                <div className="h-36 w-full border-b border-border" style={{ background: `linear-gradient(135deg, oklch(0.78 0.11 ${s.hue}), oklch(0.42 0.13 ${s.hue}))` }} />
              )}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-brand transition-colors">{s.title}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3 shrink-0" />
                    {s.source}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {s.tags.map((t) => (
                      <Tag key={t}>
                        {t}
                      </Tag>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50 pt-2.5">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Initials member={ws.member(s.uploadedBy)} size={18} /> 
                    {s.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {s.comments.length}
                  </span>
                </div>
              </div>
            </Panel>
          </button>
        ))}
      </div>

      <Dialog open={Boolean(shot)} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl border border-border">
          {shot && (
            <>
              <DialogHeader className="flex flex-row items-center justify-between pr-4 text-left">
                <DialogTitle className="text-sm font-bold text-foreground pr-2">{shot.title}</DialogTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    ws.removeShot(shot.id);
                    setOpenId(null);
                    toast.success("Screenshot deleted successfully");
                  }}
                  className="text-destructive hover:bg-destructive/10 cursor-pointer"
                  title="Delete Screenshot"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Delete
                </Button>
              </DialogHeader>

              {shot.url ? (
                <div className="bg-muted/30 border border-border rounded-xl p-2 flex items-center justify-center">
                  <img src={shot.url} className="max-w-full max-h-[400px] object-contain rounded-lg shadow-sm" alt={shot.title} />
                </div>
              ) : (
                <div className="h-72 w-full rounded-xl border border-border" style={{ background: `linear-gradient(135deg, oklch(0.78 0.11 ${shot.hue}), oklch(0.42 0.13 ${shot.hue}))` }} />
              )}
              
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground font-semibold">Description</Label>
                <p className="text-sm text-foreground leading-relaxed">{shot.description || "No description provided."}</p>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground py-2 border-y border-border/50">
                <p>Source: <span className="font-semibold text-foreground">{shot.source}</span></p>
                <p>Uploaded by: <span className="font-semibold text-foreground">{ws.member(shot.uploadedBy)?.name}</span></p>
                <p>Date: <span className="font-semibold text-foreground">{shot.date}</span></p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Discussion ({shot.comments.length})
                </h4>
                <div className="space-y-2">
                  {shot.comments.map((c, i) => (
                    <div key={i} className="rounded-xl bg-secondary/40 p-3 text-sm border border-border/30">
                      <span className="font-bold text-foreground">{c.author}: </span>
                      <span className="text-muted-foreground">{c.text}</span>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment…" maxLength={400} />
                    <Button onClick={() => { if (!comment.trim()) return; ws.commentShot(shot.id, comment.trim()); setComment(""); toast.success("Comment added"); }}>Post</Button>
                  </div>
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUpload = () => {
    if (f.title.trim().length < 3) {
      toast.error("Add a title (at least 3 characters)");
      return;
    }

    const payload: Parameters<typeof ws.addShot>[0] = {
      title: f.title.trim(),
      description: f.description,
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
      source: f.source,
      uploadedBy: ws.currentUser ? ws.currentUser.id : "m1",
      hue: Math.floor(Math.random() * 360),
    };

    if (imagePreview) {
      payload.url = imagePreview;
    }

    ws.addShot(payload);
    toast.success("Screenshot added to the board");
    
    // Reset Form
    setF({ title: "", description: "", tags: "", source: "Own work" });
    setImageFile(null);
    setImagePreview(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Upload className="mr-1.5 h-4 w-4" /> 
          Upload Screenshot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border border-border">
        <DialogHeader>
          <DialogTitle>Upload a research image</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Title</Label>
            <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={140} placeholder="e.g. BERT Architecture Diagram" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Description</Label>
            <Input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} maxLength={300} placeholder="Details about this figure..." />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Source</Label>
            <Input value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Tags</Label>
            <Input value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} placeholder="figure, results, model" />
          </div>
          
          {/* File Picker */}
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Image File</Label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-dashed border-border p-5 text-center text-xs text-muted-foreground hover:bg-secondary/40 cursor-pointer transition-colors"
            >
              {imagePreview ? (
                <div className="space-y-2">
                  <img src={imagePreview} className="max-h-24 mx-auto object-contain rounded" alt="Preview" />
                  <p className="text-brand font-semibold">Change selected image</p>
                </div>
              ) : (
                <div className="space-y-1.5 py-2">
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                  <p className="font-medium text-foreground">Click to upload your image file</p>
                  <p className="text-[10px] text-muted-foreground">Supports PNG, JPG, WEBP, GIF</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleUpload}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}