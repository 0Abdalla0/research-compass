import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlarmClock,
  ArrowUpRight,
  CalendarPlus,
  CheckCircle2,
  FilePlus2,
  FileText,
  Image as ImageIcon,
  ListChecks,
  Mic,
  NotebookPen,
  Plus,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/workspace-store";
import { Initials, Meter, Panel, StatusPill, Stack, Tag } from "@/components/ui-bits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Research Workspace Dashboard — ResearchHub" },
      {
        name: "description",
        content:
          "Today's tasks, upcoming deadlines, research progress, recent papers and team activity for the MedOnto Lab research group.",
      },
      { property: "og:title", content: "Research Workspace Dashboard — ResearchHub" },
      {
        property: "og:description",
        content: "Everything your research team needs, in one workspace.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const ws = useWorkspace();
  const done = ws.tasks.filter((t) => t.status === "done").length;
  const progress = ws.tasks.filter((t) => t.status === "progress").length;
  const overdue = ws.tasks.filter((t) => t.status !== "done" && t.due < "2026-08-10").length;
  const reviewing = ws.papers.filter((p) => p.status === "Reading" || p.status === "Analyzing").length;
  const analyzed = ws.papers.filter((p) => p.status === "Completed" || p.status === "Important").length;
  const upcoming = [...ws.events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const todays = ws.tasks.filter((t) => t.status === "progress" || t.status === "review").slice(0, 5);

  const quick = [
    { label: "Add Paper", icon: FilePlus2, to: "/papers" },
    { label: "Add Task", icon: ListChecks, to: "/tasks" },
    { label: "Add Note", icon: NotebookPen, to: "/notes" },
    { label: "Upload Screenshot", icon: ImageIcon, to: "/media" },
    { label: "Record Voice Note", icon: Mic, to: "/voice" },
    { label: "Add Meeting", icon: CalendarPlus, to: "/meetings" },
  ] as const;

  return (
    <div className="space-y-6">
      <Panel className="overflow-hidden border-0 p-0">
        <div className="relative px-6 py-7 sm:px-8" style={{ background: "var(--gradient-brand)" }}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                Research Workspace
              </p>
              <h1 className="font-display mt-2 text-2xl font-bold leading-tight sm:text-3xl">
                {ws.project.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/80">{ws.project.topic}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Stack ids={ws.members.map((m) => m.id)} members={ws.members} />
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                  {ws.project.phase}
                </span>
                <span className="text-xs text-white/70">{ws.project.institution}</span>
              </div>
            </div>
            <div className="w-full lg:w-64">
              <div className="flex items-end justify-between text-white">
                <span className="text-xs font-medium text-white/75">Overall progress</span>
                <span className="font-display text-3xl font-bold">{ws.project.progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white transition-all duration-1000" style={{ width: `${ws.project.progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tasks"
          main={`${ws.tasks.length}`}
          hint="total in the board"
          rows={[
            ["Completed", done, "text-success"],
            ["In progress", progress, "text-brand"],
            ["Overdue", overdue, "text-destructive"],
          ]}
          icon={<ListChecks className="h-4 w-4" />}
          to="/tasks"
        />
        <StatCard
          title="Research Papers"
          main={`${ws.papers.length}`}
          hint="in the library"
          rows={[
            ["Being reviewed", reviewing, "text-brand"],
            ["Fully analyzed", analyzed, "text-success"],
            ["To read", ws.papers.filter((p) => p.status === "To Read").length, "text-muted-foreground"],
          ]}
          icon={<FileText className="h-4 w-4" />}
          to="/papers"
        />
        <StatCard
          title="Upcoming"
          main={`${upcoming.length}`}
          hint="in the next weeks"
          rows={[
            ["Deadlines", ws.events.filter((e) => e.kind === "deadline").length, "text-warning-foreground"],
            ["Meetings", ws.events.filter((e) => e.kind === "meeting").length, "text-brand"],
            ["Milestones", ws.events.filter((e) => e.kind === "milestone").length, "text-primary"],
          ]}
          icon={<AlarmClock className="h-4 w-4" />}
          to="/calendar"
        />
        <StatCard
          title="Knowledge base"
          main={`${ws.notes.length + ws.shots.length + ws.voiceNotes.length}`}
          hint="linked research objects"
          rows={[
            ["Notes", ws.notes.length, "text-brand"],
            ["Screenshots", ws.shots.length, "text-primary"],
            ["Voice notes", ws.voiceNotes.length, "text-success"],
          ]}
          icon={<NotebookPen className="h-4 w-4" />}
          to="/notes"
        />
      </div>

      <Panel className="p-5">
        <h2 className="font-display text-sm font-semibold text-foreground">Quick actions</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {quick.map((q) => (
            <Link
              key={q.label}
              to={q.to}
              onClick={() => toast.info(`${q.label}`, { description: "Opening the right workspace section." })}
              className="group flex items-center gap-2 rounded-xl border border-border bg-surface-muted px-3 py-3 text-left text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[var(--shadow-card)]"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand/12 text-brand">
                <q.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 truncate">{q.label}</span>
              <Plus className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm font-semibold">Research progress over time</h2>
              <p className="text-xs text-muted-foreground">Papers screened, tasks closed and overall completion</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-success/12 px-2.5 py-1 text-xs font-semibold text-success">
              <TrendingUp className="h-3.5 w-3.5" /> +6% this week
            </span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...ws.papers.length ? [] : [], ...seedSeries()]}>
                <defs>
                  <linearGradient id="gProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPapers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--success)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" width={28} />
                <RTooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--card-foreground)",
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="papers" stroke="var(--success)" fill="url(#gPapers)" strokeWidth={2} name="Papers screened" />
                <Area type="monotone" dataKey="progress" stroke="var(--brand)" fill="url(#gProgress)" strokeWidth={2.5} name="Overall %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="p-5">
          <h2 className="font-display text-sm font-semibold">Team activity</h2>
          <ul className="mt-4 space-y-4">
            {ws.activity.slice(0, 7).map((a) => {
              const m = ws.member(a.memberId);
              return (
                <li key={a.id} className="flex gap-3">
                  <Initials member={m} size={30} />
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">
                      <span className="font-semibold">{m?.name}</span>{" "}
                      <span className="text-muted-foreground">{a.action}</span>{" "}
                      <span className="font-medium">{a.object}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">{a.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <Link to="/activity" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand">
            View full feed <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="p-5">
          <h2 className="font-display text-sm font-semibold">Today's focus</h2>
          <ul className="mt-3 space-y-3">
            {todays.map((t) => (
              <li key={t.id} className="rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{t.title}</p>
                  <Initials member={ws.member(t.assigneeId)} size={24} />
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t.checklist.filter((c) => c.done).length}/{t.checklist.length || 0} subtasks · due {t.due}
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="p-5">
          <h2 className="font-display text-sm font-semibold">Upcoming deadlines & meetings</h2>
          <ul className="mt-3 space-y-3">
            {upcoming.map((e) => (
              <li key={e.id} className="flex items-center gap-3">
                <span
                  className={`h-9 w-1.5 shrink-0 rounded-full ${
                    e.kind === "deadline"
                      ? "bg-warning"
                      : e.kind === "meeting"
                        ? "bg-brand"
                        : e.kind === "milestone"
                          ? "bg-primary"
                          : "bg-muted-foreground"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {e.date} · {e.time} · {e.kind}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/calendar" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand">
            Open calendar <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Panel>

        <Panel className="p-5">
          <h2 className="font-display text-sm font-semibold">Recent papers</h2>
          <ul className="mt-3 space-y-3">
            {ws.papers.slice(0, 4).map((p) => (
              <li key={p.id}>
                <Link to="/papers/$id" params={{ id: p.id }} className="block rounded-xl border border-border p-3 transition-colors hover:border-brand/40">
                  <p className="line-clamp-2 text-sm font-medium leading-snug">{p.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusPill status={p.status} />
                    <Tag>{p.year}</Tag>
                    <Initials member={ws.member(p.ownerId)} size={22} />
                  </div>
                  <div className="mt-2">
                    <Meter value={p.progress} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function seedSeries() {
  return [
    { week: "W22", papers: 4, progress: 6 },
    { week: "W24", papers: 11, progress: 14 },
    { week: "W26", papers: 19, progress: 22 },
    { week: "W28", papers: 27, progress: 29 },
    { week: "W30", papers: 34, progress: 35 },
    { week: "W31", papers: 38, progress: 40 },
    { week: "W32", papers: 42, progress: 46 },
  ];
}

function StatCard({
  title,
  main,
  hint,
  rows,
  icon,
  to,
}: {
  title: string;
  main: string;
  hint: string;
  rows: [string, number, string][];
  icon: React.ReactNode;
  to: string;
}) {
  return (
    <Panel className="p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-muted-foreground">{icon}</span>
      </div>
      <p className="font-display mt-3 text-3xl font-bold">{main}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <dl className="mt-4 space-y-1.5">
        {rows.map(([label, v, tone]) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className={`font-semibold ${tone}`}>{v}</dd>
          </div>
        ))}
      </dl>
      <Link to={to} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand">
        Open <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </Panel>
  );
}
