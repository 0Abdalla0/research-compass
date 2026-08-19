import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Edit3, Plus, Trash2, CheckSquare, CheckCircle, PlusCircle, GripVertical, Check } from "lucide-react";
import { useWorkspace } from "@/lib/workspace-store";
import { Meter, PageHeader, Panel, Stack, Tag } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Phase } from "@/data/workspace";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Research Roadmap — ResearchHub" },
      { name: "description", content: "Eight-phase research roadmap from literature review to final presentation, with progress, owners and deliverables." },
      { property: "og:title", content: "Research Roadmap — ResearchHub" },
      { property: "og:description", content: "Phase-by-phase timeline for the research project." },
    ],
  }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const ws = useWorkspace();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) return;

    const sourceIdx = ws.phases.findIndex((x) => x.id === draggingId);
    const targetIdx = ws.phases.findIndex((x) => x.id === targetId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const reordered = [...ws.phases];
      const [removed] = reordered.splice(sourceIdx, 1);
      reordered.splice(targetIdx, 0, removed);

      const updated = reordered.map((ph, idx) => ({ ...ph, index: idx + 1 }));
      
      // Update each phase index sequentially to trigger DB updates
      updated.forEach((ph) => {
        ws.updatePhase(ph.id, { index: ph.index });
      });

      toast.success("Roadmap reordered successfully");
    }
    setDraggingId(null);
  };

  // Timeline separator between indices
  const TimelineSeparator = ({ targetIndex }: { targetIndex: number }) => (
    <div className="group relative flex items-center gap-4 pl-0 py-1.5">
      <div className="z-10 grid h-6 w-10 shrink-0 place-items-center md:w-12">
        <PhaseDialog
          targetIndex={targetIndex}
          trigger={
            <button className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card hover:bg-brand/10 hover:border-brand hover:text-brand transition-all cursor-pointer shadow-sm opacity-35 group-hover:opacity-100" title="Insert Phase Here">
              <Plus className="h-3.5 w-3.5" />
            </button>
          }
        />
      </div>
      <div className="flex-1 h-px bg-border/40 group-hover:bg-brand/35 transition-colors" />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Research Roadmap" 
        subtitle={`${ws.phases.length} phases from literature review to final defense`} 
        actions={
          <PhaseDialog 
            trigger={
              <Button size="sm" className="inline-flex items-center gap-1.5 cursor-pointer text-xs md:text-sm">
                <Plus className="h-4 w-4" /> Add Phase
              </Button>
            }
          />
        }
      />
      <div className="relative space-y-2 before:absolute before:left-[19px] before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-border md:before:left-6">
        {ws.phases.map((p, idx) => (
          <div key={p.id}>
            {/* Show an insertion spacer if not the first item */}
            {idx > 0 && <TimelineSeparator targetIndex={p.index} />}
            
            <div 
              draggable 
              onDragStart={(e) => handleDragStart(e, p.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, p.id)}
              className={`relative flex gap-4 pl-0 transition-all duration-200 ${
                draggingId === p.id ? "opacity-30 border-dashed border-brand" : ""
              }`}
            >
              <div className="z-10 mt-4 flex flex-col items-center gap-1 shrink-0">
                <span className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold md:h-12 md:w-12 ${p.progress === 100 ? "bg-success text-success-foreground" : p.progress > 0 ? "bg-brand text-brand-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {p.index}
                </span>
                <span className="text-muted-foreground/30 hover:text-muted-foreground/80 cursor-grab active:cursor-grabbing p-1 transition-colors" title="Drag to reorder">
                  <GripVertical className="h-4 w-4" />
                </span>
              </div>
              <Panel className="flex-1 p-4 sm:p-5">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_200px] md:items-center">
                  <div className="min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Phase {p.index}</p>
                      <div className="flex items-center gap-1">
                        {p.progress < 100 && (
                          <button
                            onClick={() => {
                              ws.updatePhase(p.id, {
                                progress: 100,
                                deliverables: p.deliverables.map((d) => {
                                  const text = typeof d === "string" ? d : d.text;
                                  return { text, done: true };
                                }),
                              });
                              toast.success(`Marked "${p.name}" as completed!`);
                            }}
                            className="p-1.5 rounded text-success hover:bg-success/15 cursor-pointer"
                            title="Mark as Completed"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <PhaseDialog
                          phase={p}
                          trigger={
                            <button className="p-1 rounded text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer" title="Edit Phase">
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                          }
                        />
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete Phase ${p.index}: "${p.name}"?`)) {
                              ws.removePhase(p.id);
                              toast.success("Phase deleted successfully");
                            }
                          }}
                          className="p-1 rounded text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Delete Phase"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <h2 className="font-display text-lg font-semibold mt-1">{p.name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{p.start} → {p.end}</p>
                    
                    {p.details && (
                      <p className="mt-2 text-xs text-foreground/80 bg-secondary/15 p-2.5 rounded-xl border border-border/10 whitespace-pre-wrap">
                        {p.details}
                      </p>
                    )}

                    {/* Deliverables Checklist style */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.deliverables.map((d, dIdx) => {
                        const item = typeof d === "string" ? { text: d, done: false } : d;
                        return (
                          <div 
                            key={dIdx} 
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border transition-all ${
                              item.done 
                                ? "bg-success/5 border-success/20 text-success-foreground/80 line-through" 
                                : "bg-secondary/45 border-border/40 text-foreground"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={item.done}
                              onChange={(e) => {
                                const updatedDeliverables = p.deliverables.map((val, idx) => {
                                  const txt = typeof val === "string" ? val : val.text;
                                  if (idx === dIdx) {
                                    return { text: txt, done: e.target.checked };
                                  }
                                  return typeof val === "string" ? { text: txt, done: false } : val;
                                });

                                // Auto-calculate progress based on completed items:
                                const total = updatedDeliverables.length;
                                const doneCount = updatedDeliverables.filter(x => x.done).length;
                                const newProgress = total > 0 ? Math.round((doneCount / total) * 100) : 0;

                                ws.updatePhase(p.id, {
                                  deliverables: updatedDeliverables,
                                  progress: newProgress,
                                });
                              }}
                              className="h-3.5 w-3.5 rounded border-input text-brand focus:ring-brand cursor-pointer"
                            />
                            <span>{item.text}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <Stack ids={p.members} members={ws.members} />
                      <span className="text-xs text-muted-foreground">{ws.tasks.filter((t) => t.phaseId === p.id).length} linked tasks</span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs"><span className="text-muted-foreground">Progress</span><span className="font-semibold">{p.progress}%</span></div>
                    <Meter value={p.progress} tone={p.progress === 100 ? "success" : "brand"} />
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhaseDialog({ phase, targetIndex, trigger }: { phase?: Phase; targetIndex?: number; trigger: ReactNode }) {
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(phase ? phase.index : (targetIndex !== undefined ? targetIndex : ws.phases.length + 1));
  const [name, setName] = useState(phase ? phase.name : "");
  const [start, setStart] = useState(phase ? phase.start : "");
  const [end, setEnd] = useState(phase ? phase.end : "");
  const [progress, setProgress] = useState(phase ? phase.progress : 0);
  const [deliverables, setDeliverables] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>(phase ? phase.members : []);
  const [details, setDetails] = useState(phase ? phase.details || "" : "");

  // Update states on open/change
  useEffect(() => {
    if (open) {
      setIndex(phase ? phase.index : (targetIndex !== undefined ? targetIndex : ws.phases.length + 1));
      setName(phase ? phase.name : "");
      setStart(phase ? phase.start : "");
      setEnd(phase ? phase.end : "");
      setProgress(phase ? phase.progress : 0);
      
      if (phase) {
        const deliverableTexts = phase.deliverables.map((d) => typeof d === "string" ? d : d.text);
        setDeliverables(deliverableTexts.join(", "));
        setDetails(phase.details || "");
      } else {
        setDeliverables("");
        setDetails("");
      }
      setSelectedMembers(phase ? phase.members : []);
    }
  }, [open, phase, targetIndex, ws.phases.length]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Phase name is required");
      return;
    }

    const deliverablesList = deliverables
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean)
      .map((text) => {
        // Find existing to preserve 'done' status if user is just editing deliverables
        const existing = phase?.deliverables?.find((d) => (typeof d === "string" ? d : d.text) === text);
        const done = existing ? (typeof existing === "string" ? false : existing.done) : false;
        return { text, done };
      });

    const payload = {
      index: Number(index),
      name: name.trim(),
      start: start.trim() || "TBA",
      end: end.trim() || "TBA",
      progress: Math.min(Math.max(Number(progress) || 0, 0), 100),
      deliverables: deliverablesList,
      members: selectedMembers,
      details: details.trim() || undefined,
    };

    if (phase) {
      ws.updatePhase(phase.id, payload);
      toast.success("Phase updated successfully");
    } else {
      ws.addPhase(payload);
      toast.success("Phase added successfully");
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{phase ? "Edit Research Phase" : "Add Research Phase"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Phase Number</Label>
              <Input type="number" value={index} onChange={(e) => setIndex(Number(e.target.value))} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Progress (%)</Label>
              <Input type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Phase Name</Label>
            <Input placeholder="e.g. Literature Review" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Details / Explanation (Optional)</Label>
            <textarea
              placeholder="Conduct comprehensive survey of clinical Named Entity Recognition models..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-background border border-input rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Start Date</Label>
              <Input placeholder="e.g. Aug 1" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">End Date</Label>
              <Input placeholder="e.g. Sep 15" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Deliverables (comma separated)</Label>
            <Input placeholder="e.g. Draft Report, Latex Source, Presentation" value={deliverables} onChange={(e) => setDeliverables(e.target.value)} />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Assign Owners</Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-border rounded-xl">
              {ws.members.map((m) => {
                const active = selectedMembers.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedMembers((prev) =>
                        active ? prev.filter((id) => id !== m.id) : [...prev, m.id]
                      );
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      active
                        ? "bg-brand/10 border-brand text-brand font-bold"
                        : "bg-secondary/40 border-border/60 text-muted-foreground"
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="cursor-pointer">Cancel</Button>
          <Button onClick={handleSave} className="cursor-pointer">Save Phase</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}