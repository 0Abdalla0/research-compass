import { createFileRoute } from "@tanstack/react-router";
import { useWorkspace } from "@/lib/workspace-store";
import { Initials, PageHeader, Panel } from "@/components/ui-bits";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Team Activity Feed — ResearchHub" },
      { name: "description", content: "Chronological feed of uploads, notes, comments, completed tasks and new papers across the research team." },
      { property: "og:title", content: "Team Activity Feed — ResearchHub" },
      { property: "og:description", content: "See what the research team shipped today." },
    ],
  }),
  component: ActivityPage,
});

function ActivityPage() {
  const ws = useWorkspace();
  return (
    <div className="space-y-6">
      <PageHeader title="Activity" subtitle="Everything the team touched, newest first" />
      <Panel className="divide-y divide-border">
        {ws.activity.map((a) => {
          const m = ws.member(a.memberId);
          return (
            <div key={a.id} className="flex items-center gap-3 px-5 py-4">
              <Initials member={m} size={32} />
              <p className="min-w-0 flex-1 text-sm">
                <span className="font-semibold">{m?.name}</span> <span className="text-muted-foreground">{a.action}</span> <span className="font-medium">{a.object}</span>
              </p>
              <span className="shrink-0 text-xs text-muted-foreground">{a.time}</span>
            </div>
          );
        })}
      </Panel>
    </div>
  );
}