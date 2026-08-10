import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Edit3, Plus, Trash2 } from "lucide-react";
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
      <div className="relative space-y-4 before:absolute before:left-[19px] before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-border md:before:left-6">
        {ws.phases.map((p) => (
          <div key={p.id} className="relative flex gap-4 pl-0">
            <span className={`z-10 mt-4 grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold md:h-12 md:w-12 ${p.progress === 100 ? "bg-success text-success-foreground" : p.progress > 0 ? "bg-brand text-brand-foreground" : "bg-secondary text-muted-foreground"}`}>
              {p.index}
            </span>
            <Panel className="flex-1 p-4 sm:p-5">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px] md:items-center">
                <div className="min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Phase {p.index}</p>
                    <div className="flex items-center gap-1">
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
                  <div className="mt-3 flex flex-wrap gap-1.5">{p.deliverables.map((d) => (<Tag key={d}>{d}</Tag>))}</div>
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
        ))}
      </div>
    </div>
  );
}

function PhaseDialog({ phase, trigger }: { phase?: Phase; trigger: ReactNode }) {
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(phase ? phase.index : ws.phases.length + 1);
  const [name, setName] = useState(phase ? phase.name : "");
  const [start, setStart] = useState(phase ? phase.start : "");
  const [end, setEnd] = useState(phase ? phase.end : "");
  const [progress, setProgress] = useState(phase ? phase.progress : 0);
  const [deliverables, setDeliverables] = useState(phase ? phase.deliverables.join(", ") : "");
  const [selectedMembers, setSelectedMembers] = useState<string[]>(phase ? phase.members : []);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Phase name is required");
      return;
    }
    const deliverablesList = deliverables
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    const payload = {
      index: Number(index),
      name: name.trim(),
      start: start.trim() || "TBA",
      end: end.trim() || "TBA",
      progress: Math.min(Math.max(Number(progress) || 0, 0), 100),
      deliverables: deliverablesList,
      members: selectedMembers,
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