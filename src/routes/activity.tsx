import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useWorkspace } from "@/lib/workspace-store";
import { Initials, PageHeader, Panel, Tag } from "@/components/ui-bits";
import { FileText, KanbanSquare, Mic, Image, MessageSquare, StickyNote, File, BookOpen } from "lucide-react";
import type { Activity } from "@/data/workspace";

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

const kindMeta: Record<Activity["kind"], { icon: React.ReactNode; color: string; label: string; to?: string }> = {
  paper: { icon: <FileText className="h-4 w-4" />, color: "text-brand bg-brand/10", label: "Paper", to: "/papers/" },
  task: { icon: <KanbanSquare className="h-4 w-4" />, color: "text-success bg-success/10", label: "Task", to: "/tasks" },
  note: { icon: <StickyNote className="h-4 w-4" />, color: "text-warning-foreground bg-warning/10", label: "Note", to: "/notes" },
  file: { icon: <File className="h-4 w-4" />, color: "text-muted-foreground bg-secondary", label: "File", to: "/files" },
  voice: { icon: <Mic className="h-4 w-4" />, color: "text-purple-500 bg-purple-500/10", label: "Voice", to: "/voice" },
  image: { icon: <Image className="h-4 w-4" />, color: "text-sky-500 bg-sky-500/10", label: "Screenshot", to: "/screenshots" },
  comment: { icon: <MessageSquare className="h-4 w-4" />, color: "text-foreground bg-muted", label: "Comment" },
};

function ActivityPage() {
  const ws = useWorkspace();
  const formatActivityTime = (timeStr: string) => {
    if (!timeStr) return "";
    if (timeStr.includes("T") || timeStr.includes("-")) {
      try {
        const date = new Date(timeStr);
        if (isNaN(date.getTime())) return timeStr;
        const elapsed = Date.now() - date.getTime();
        const secs = Math.floor(elapsed / 1000);
        if (secs < 60) return "just now";
        const mins = Math.floor(secs / 60);
        if (mins < 60) return `${mins} m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} h ago`;
        const days = Math.floor(hours / 24);
        return `${days} d ago`;
      } catch {
        return timeStr;
      }
    }
    return timeStr;
  };

  const [filter, setFilter] = useState<Activity["kind"] | "all">("all");

  const kinds: Activity["kind"][] = ["paper", "task", "note", "file", "voice", "image", "comment"];

  const filtered = filter === "all"
    ? ws.activity
    : ws.activity.filter((a) => a.kind === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        subtitle={`${ws.activity.length} events · newest first`}
      />

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${filter === "all" ? "bg-brand text-white border-brand" : "border-border text-muted-foreground hover:bg-secondary"}`}
        >
          All
        </button>
        {kinds.map((k) => {
          const meta = kindMeta[k];
          return (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${filter === k ? "bg-brand text-white border-brand" : "border-border text-muted-foreground hover:bg-secondary"}`}
            >
              {meta.icon}
              {meta.label}
            </button>
          );
        })}
      </div>

      <Panel className="divide-y divide-border">
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">No activity yet</p>
        )}
        {filtered.map((a) => {
          const m = ws.member(a.memberId);
          const meta = kindMeta[a.kind];
          return (
            <div key={a.id} className="flex items-center gap-3 px-5 py-4 hover:bg-secondary/30 transition-colors">
              {/* Kind icon */}
              <div className={`shrink-0 rounded-xl p-2 ${meta.color}`}>
                {meta.icon}
              </div>

              {/* Member avatar */}
              <Initials member={m} size={32} />

              {/* Description */}
              <p className="min-w-0 flex-1 text-sm">
                <span className="font-semibold">{m?.name ?? "Unknown"}</span>{" "}
                <span className="text-muted-foreground">{a.action}</span>{" "}
                {meta.to ? (
                  <Link to={meta.to} className="font-medium text-brand hover:underline">
                    {a.object}
                  </Link>
                ) : (
                  <span className="font-medium">{a.object}</span>
                )}
              </p>

              {/* Time + kind tag */}
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className="text-[11px] text-muted-foreground">{formatActivityTime(a.time)}</span>
                <Tag>{meta.label}</Tag>
              </div>
            </div>
          );
        })}
      </Panel>
    </div>
  );
}