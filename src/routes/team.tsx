import { createFileRoute } from "@tanstack/react-router";
import { useWorkspace } from "@/lib/workspace-store";
import { Initials, PageHeader, Panel, Tag } from "@/components/ui-bits";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Research Team — ResearchHub" },
      { name: "description", content: "Team members, roles, research responsibilities, assigned papers and task load for the research group." },
      { property: "og:title", content: "Research Team — ResearchHub" },
      { property: "og:description", content: "Who does what across the research project." },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const ws = useWorkspace();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        subtitle={`${ws.members.length} Members, developers and supervisors`}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ws.members.map((m) => {
          const mine = ws.tasks.filter((t) => t.assigneeId === m.id);
          return (
            <Panel key={m.id} className="p-5">
              <div className="flex items-center gap-3">
                <Initials member={m} size={48} />
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.role}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{m.responsibilities}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Stat label="Active" v={mine.filter((t) => t.status !== "done").length} />
                <Stat label="Done" v={mine.filter((t) => t.status === "done").length} />
                <Stat label="Papers" v={ws.papers.filter((p) => p.ownerId === m.id).length} />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {ws.papers
                  .filter((p) => p.ownerId === m.id)
                  .slice(0, 2)
                  .map((p) => (
                    <Tag key={p.id}>{p.title.slice(0, 30)}…</Tag>
                  ))}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, v }: { label: string; v: number }) {
  return (
    <div className="rounded-xl bg-surface-muted py-2">
      <p className="font-display text-lg font-bold">{v}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}