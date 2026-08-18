import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Edit3, ExternalLink, Plus, Trash2, Folder } from "lucide-react";
import { useWorkspace } from "@/lib/workspace-store";
import { Initials, PageHeader, Panel, Tag } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ResourceLink } from "@/data/workspace";

export const Route = createFileRoute("/links")({
  head: () => ({
    meta: [
      { title: "Research Resources — ResearchHub" },
      { name: "description", content: "Saved datasets, GitHub repositories, documentation, APIs, tools and videos used by the research team." },
      { property: "og:title", content: "Research Resources — ResearchHub" },
      { property: "og:description", content: "Every dataset, repo and tool the team relies on." },
    ],
  }),
  component: LinksPage,
});

function LinksPage() {
  const ws = useWorkspace();

  // Group links by category
  const groupedLinks = ws.links.reduce((acc, link) => {
    const cat = link.category?.trim() || "General Resources";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(link);
    return acc;
  }, {} as Record<string, typeof ws.links>);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Resources" 
        subtitle={`${ws.links.length} saved datasets, repositories, tools and references`} 
        actions={
          <AddLinkDialog 
            trigger={
              <Button size="sm" className="inline-flex items-center gap-1.5 cursor-pointer text-xs md:text-sm">
                <Plus className="h-4 w-4" /> Add Resource
              </Button>
            }
          />
        }
      />

      {ws.links.length === 0 ? (
        <Panel className="p-8 text-center text-muted-foreground">
          No resources added yet. Click "Add Resource" to start creating resource subsections.
        </Panel>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedLinks).map(([categoryName, links]) => (
            <div key={categoryName} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <Folder className="h-4.5 w-4.5 text-brand shrink-0" />
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-foreground/90">
                  {categoryName}
                </h2>
                <span className="text-xs text-muted-foreground font-semibold px-2 py-0.5 rounded-full bg-secondary/80">
                  {links.length}
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {links.map((l) => (
                  <Panel key={l.id} className="p-5 transition-transform hover:-translate-y-0.5 flex flex-col justify-between min-h-[180px]">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-[15px] font-semibold leading-snug">{l.title}</h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <a href={l.url} target="_blank" rel="noreferrer" className="p-1 rounded-lg text-muted-foreground hover:text-brand hover:bg-secondary transition-colors" title="Open Link">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <EditLinkDialog
                            link={l}
                            trigger={
                              <button className="p-1 rounded-lg text-muted-foreground hover:bg-secondary transition-colors cursor-pointer" title="Edit Resource">
                                <Edit3 className="h-4 w-4" />
                              </button>
                            }
                          />
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete the resource "${l.title}"?`)) {
                                ws.removeLink(l.id);
                                toast.success("Resource deleted successfully");
                              }
                            }}
                            className="p-1 rounded-lg text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            title="Delete Resource"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-3">{l.description}</p>
                      <p className="mt-2 truncate text-[11px] text-brand">{l.url}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 space-y-2">
                      {l.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          {l.tags.map((t) => (<Tag key={t}>#{t}</Tag>))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Initials member={ws.member(l.addedBy)} size={18} /> 
                        <span>added by {ws.member(l.addedBy)?.name || "Teammate"}</span>
                      </div>
                    </div>
                  </Panel>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddLinkDialog({ trigger }: { trigger: ReactNode }) {
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Tools");
  const [tagsStr, setTagsStr] = useState("");
  const [paperId, setPaperId] = useState("");

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
      paperId: paperId || undefined,
    });
    toast.success("Resource added successfully");
    setOpen(false);
    setTitle("");
    setUrl("");
    setDescription("");
    setTagsStr("");
    setPaperId("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Resource Link</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Title</Label>
            <Input placeholder="e.g. GitHub Repository" value={title} onChange={(e) => setTitle(e.target.value)} />
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
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Category (Subsection)</Label>
            <Input placeholder="e.g. Datasets, Code, Documentation" value={category} onChange={(e) => setCategory(e.target.value)} />
            <p className="text-[10px] text-muted-foreground mt-1">Creating a resource with a new category name will automatically start a new subsection on the resources page.</p>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Tags (comma separated)</Label>
            <Input placeholder="e.g. nlp, python, api" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Link to Research Paper (Optional)</Label>
            <select
              value={paperId}
              onChange={(e) => setPaperId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">None (General Resource)</option>
              {ws.papers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
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

function EditLinkDialog({ link, trigger }: { link: ResourceLink; trigger: ReactNode }) {
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [description, setDescription] = useState(link.description);
  const [category, setCategory] = useState(link.category);
  const [tagsStr, setTagsStr] = useState(link.tags.join(", "));
  const [paperId, setPaperId] = useState(link.paperId || "");

  const handleSave = () => {
    if (!title.trim() || !url.trim()) {
      toast.error("Title and URL are required");
      return;
    }
    const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
    ws.updateLink(link.id, {
      title: title.trim(),
      url: url.trim(),
      description: description.trim(),
      category: category.trim(),
      tags,
      paperId: paperId || undefined,
    });
    toast.success("Resource updated successfully");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Resource Link</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">URL</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Category (Subsection)</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            <p className="text-[10px] text-muted-foreground mt-1">Creating a resource with a new category name will automatically start a new subsection on the resources page.</p>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Tags (comma separated)</Label>
            <Input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Link to Research Paper (Optional)</Label>
            <select
              value={paperId}
              onChange={(e) => setPaperId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">None (General Resource)</option>
              {ws.papers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
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