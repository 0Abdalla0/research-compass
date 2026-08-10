import { createFileRoute } from "@tanstack/react-router";
import { useWorkspace } from "@/lib/workspace-store";
import { Meter, PageHeader, Panel, Stack, Tag } from "@/components/ui-bits";

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
      <PageHeader title="Research Roadmap" subtitle="Eight phases from literature review to final defense" />
      <div className="relative space-y-4 before:absolute before:left-[19px] before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-border md:before:left-6">
        {ws.phases.map((p) => (
          <div key={p.id} className="relative flex gap-4 pl-0">
            <span className={`z-10 mt-4 grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold md:h-12 md:w-12 ${p.progress === 100 ? "bg-success text-success-foreground" : p.progress > 0 ? "bg-brand text-brand-foreground" : "bg-secondary text-muted-foreground"}`}>
              {p.index}
            </span>
            <Panel className="flex-1 p-5">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px] md:items-center">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Phase {p.index}</p>
                  <h2 className="font-display text-lg font-semibold">{p.name}</h2>
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