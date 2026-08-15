import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useWorkspace } from "@/lib/workspace-store";
import { Initials, PageHeader, Panel, Tag } from "@/components/ui-bits";
import { FileText, KanbanSquare, Mail, Phone, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditProfileDialog } from "@/components/edit-profile-dialog";

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
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        subtitle={`${ws.members.length} members · researchers, leaders and supervisors`}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ws.members.map((m) => {
          const mine = ws.tasks.filter((t) => t.assigneeId === m.id);
          const ownedPapers = ws.papers.filter((p) => p.ownerId === m.id);
          const activeTasks = mine.filter((t) => t.status !== "done");
          const meetings = ws.meetings.filter((mtg) =>
            (mtg.participants as string[]).includes(m.id)
          );
          const phases = ws.phases.filter((ph) =>
            (ph.members as string[]).includes(m.id)
          );

          return (
            <Panel key={m.id} className="p-5 flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Initials member={m} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-semibold">{m.name}</p>
                    <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      m.role === "Team Leader"
                        ? "bg-brand/10 text-brand"
                        : m.role === "Supervisor"
                        ? "bg-warning/15 text-warning-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      {m.role}
                    </span>
                  </div>
                </div>
                {m.id === ws.currentUser?.id && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setProfileOpen(true)}
                    className="cursor-pointer font-semibold text-brand hover:bg-brand/10 shrink-0"
                  >
                    Manage
                  </Button>
                )}
              </div>

              {/* Responsibilities */}
              {m.responsibilities && (
                <p className="text-sm text-muted-foreground leading-relaxed">{m.responsibilities}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <Stat label="Active" v={activeTasks.length} />
                <Stat label="Done" v={mine.filter((t) => t.status === "done").length} />
                <Stat label="Papers" v={ownedPapers.length} />
                <Stat label="Meetings" v={meetings.length} />
              </div>

              {/* Contact info */}
              {(m.email || m.phone) && (
                <div className="flex flex-col gap-1 border-t border-border/50 pt-3">
                  {m.email && (
                    <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand transition-colors">
                      <Mail className="h-3.5 w-3.5 shrink-0" />{m.email}
                    </a>
                  )}
                  {m.phone && (
                    <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand transition-colors">
                      <Phone className="h-3.5 w-3.5 shrink-0" />{m.phone}
                    </a>
                  )}
                </div>
              )}

              {/* Paper links */}
              {ownedPapers.length > 0 && (
                <div className="border-t border-border/50 pt-3">
                  <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <FileText className="h-3 w-3" /> Assigned Papers
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ownedPapers.slice(0, 3).map((p) => (
                      <Link
                        key={p.id}
                        to="/papers/$id"
                        params={{ id: p.id }}
                        className="rounded-lg border border-brand/25 bg-brand/5 px-2 py-1 text-[11px] font-medium text-brand hover:bg-brand/10 transition-colors line-clamp-1 max-w-[160px]"
                        title={p.title}
                      >
                        {p.title.slice(0, 28)}{p.title.length > 28 ? "…" : ""}
                      </Link>
                    ))}
                    {ownedPapers.length > 3 && (
                      <Link
                        to="/papers"
                        className="rounded-lg border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary transition-colors"
                      >
                        +{ownedPapers.length - 3} more
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Active task links */}
              {activeTasks.length > 0 && (
                <div className="border-t border-border/50 pt-3">
                  <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <KanbanSquare className="h-3 w-3" /> Active Tasks
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeTasks.slice(0, 2).map((t) => (
                      <Link
                        key={t.id}
                        to="/tasks"
                        className="rounded-lg border border-border px-2 py-1 text-[11px] text-foreground hover:bg-secondary transition-colors line-clamp-1 max-w-[180px]"
                        title={t.title}
                      >
                        {t.title.slice(0, 30)}{t.title.length > 30 ? "…" : ""}
                      </Link>
                    ))}
                    {activeTasks.length > 2 && (
                      <Link to="/tasks" className="rounded-lg border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary transition-colors">
                        +{activeTasks.length - 2} more
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Roadmap phases */}
              {phases.length > 0 && (
                <div className="border-t border-border/50 pt-3">
                  <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <BookOpen className="h-3 w-3" /> Roadmap Phases
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {phases.map((ph) => (
                      <Link
                        key={ph.id}
                        to="/roadmap"
                        className="rounded-lg border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary transition-colors"
                      >
                        Phase {ph.index + 1}: {ph.name.slice(0, 20)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </Panel>
          );
        })}
      </div>

      {ws.members.length === 0 && (
        <Panel className="p-12 text-center">
          <p className="text-sm text-muted-foreground">No team members yet — register to get started.</p>
        </Panel>
      )}
      {ws.currentUser && (
        <EditProfileDialog open={profileOpen} onOpenChange={setProfileOpen} member={ws.currentUser} />
      )}
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