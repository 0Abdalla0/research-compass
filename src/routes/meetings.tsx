import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useWorkspace } from "@/lib/workspace-store";
import { PageHeader, Panel, Stack } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Research Meetings — ResearchHub" },
      { name: "description", content: "Meeting agendas, decisions and action items that convert directly into research tasks." },
      { property: "og:title", content: "Research Meetings — ResearchHub" },
      { property: "og:description", content: "Agendas, decisions and action items in one place." },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const ws = useWorkspace();
  return (
    <div className="space-y-6">
      <PageHeader title="Meetings" subtitle="Agendas, decisions and action items — turn any item into a task" />
      <div className="grid gap-4 lg:grid-cols-2">
        {ws.meetings.map((m) => (
          <Panel key={m.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="font-display text-base font-semibold">{m.title}</h2>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground">{m.date} · {m.time}</span>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete meeting "${m.title}"?`)) {
                      ws.removeMeeting(m.id);
                    }
                  }}
                  className="p-1 rounded-lg text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  title="Delete Meeting"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-3"><Stack ids={m.participants} members={ws.members} /></div>
            <Section title="Agenda" items={m.agenda} />
            <Section title="Decisions" items={m.decisions} />
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Action items</p>
              <ul className="mt-2 space-y-2">
                {m.actionItems.map((a) => (
                  <li key={a.text} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-border p-2.5 bg-card">
                    <span className="min-w-0 flex-1 text-sm leading-snug text-foreground">{ws.member(a.ownerId)?.name} → {a.text}</span>
                    <Button size="sm" variant="outline" className="w-full sm:w-auto shrink-0 text-xs font-semibold cursor-pointer" onClick={() => { ws.addTask({ title: a.text, description: `From meeting: ${m.title}`, status: "todo", priority: "MEDIUM", assigneeId: a.ownerId, due: m.date, labels: ["Meeting"] }); toast.success("Task created from action item"); }}>
                      Create task
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{m.notes}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="mt-1.5 list-inside list-disc space-y-1 text-sm text-foreground/90">
        {items.map((i) => (<li key={i}>{i}</li>))}
      </ul>
    </div>
  );
}