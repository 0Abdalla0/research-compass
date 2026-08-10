import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/workspace-store";
import type { EventKind } from "@/data/workspace";
import { PageHeader, Panel, Stack } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Research Calendar — ResearchHub" },
      { name: "description", content: "Month, week, day and agenda views for research meetings, paper deadlines, milestones and personal study blocks." },
      { property: "og:title", content: "Research Calendar — ResearchHub" },
      { property: "og:description", content: "Meetings, deadlines and milestones for the whole research team." },
    ],
  }),
  component: CalendarPage,
});

const kindTone: Record<EventKind, string> = {
  meeting: "bg-brand/12 text-brand border-brand/25",
  deadline: "bg-warning/20 text-warning-foreground border-warning/30",
  milestone: "bg-primary/12 text-primary border-primary/25",
  personal: "bg-secondary text-secondary-foreground border-border",
};

function CalendarPage() {
  const ws = useWorkspace();
  const year = 2026;
  const month = 7; // August
  const first = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const key = (d: number) => `2026-08-${String(d).padStart(2, "0")}`;
  const sorted = [...ws.events].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" subtitle="August 2026 · research meetings, deadlines and milestones" actions={<AddEventDialog />} />

      <Tabs defaultValue="month">
        <TabsList>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="mt-4">
          <Panel className="overflow-hidden p-3">
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((d, i) => (
                <div key={i} className={`min-h-24 rounded-xl border border-border/70 p-1.5 ${d ? "bg-card" : "bg-transparent border-transparent"}`}>
                  {d && <span className="text-[11px] font-semibold text-muted-foreground">{d}</span>}
                  <div className="mt-1 space-y-1">
                    {d &&
                      ws.events
                        .filter((e) => e.date === key(d))
                        .map((e) => (
                          <div key={e.id} className={`truncate rounded-md border px-1.5 py-1 text-[10px] font-medium ${kindTone[e.kind]}`} title={`${e.time} ${e.title}`}>
                            {e.time} {e.title}
                          </div>
                        ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="week" className="mt-4">
          <div className="grid gap-3 md:grid-cols-7">
            {[10, 11, 12, 13, 14, 15, 16].map((d) => (
              <Panel key={d} className="p-3">
                <p className="text-xs font-semibold text-muted-foreground">Aug {d}</p>
                <div className="mt-2 space-y-1.5">
                  {ws.events.filter((e) => e.date === key(d)).map((e) => (
                    <div key={e.id} className={`rounded-md border px-2 py-1.5 text-[11px] font-medium ${kindTone[e.kind]}`}>
                      {e.time} · {e.title}
                    </div>
                  ))}
                </div>
              </Panel>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="day" className="mt-4">
          <Panel className="divide-y divide-border">
            {Array.from({ length: 12 }, (_, i) => i + 8).map((h) => (
              <div key={h} className="flex gap-4 px-4 py-3">
                <span className="w-14 shrink-0 text-xs text-muted-foreground">{String(h).padStart(2, "0")}:00</span>
                <div className="flex-1 space-y-1.5">
                  {ws.events.filter((e) => e.date === "2026-08-11" && Number(e.time.slice(0, 2)) === h).map((e) => (
                    <div key={e.id} className={`rounded-md border px-2 py-1.5 text-xs font-medium ${kindTone[e.kind]}`}>{e.title}</div>
                  ))}
                </div>
              </div>
            ))}
          </Panel>
        </TabsContent>

        <TabsContent value="agenda" className="mt-4">
          <Panel className="divide-y divide-border">
            {sorted.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${kindTone[e.kind]}`}>{e.kind}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.date} · {e.time} · {e.description}</p>
                </div>
                <Stack ids={e.attendees} members={ws.members} />
                <Button size="sm" variant="ghost" onClick={() => { ws.removeEvent(e.id); toast.success("Event deleted"); }}>Delete</Button>
              </div>
            ))}
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AddEventDialog() {
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", date: "2026-08-15", time: "10:00", kind: "meeting" as EventKind, description: "" });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-1.5 h-4 w-4" /> Add Event</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>New calendar event</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label className="mb-1.5 block text-xs text-muted-foreground">Title</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={140} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="mb-1.5 block text-xs text-muted-foreground">Date</Label><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
            <div><Label className="mb-1.5 block text-xs text-muted-foreground">Time</Label><Input type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Type</Label>
            <Select value={f.kind} onValueChange={(v) => setF({ ...f, kind: v as EventKind })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["meeting", "deadline", "milestone", "personal"] as EventKind[]).map((k) => (<SelectItem key={k} value={k}>{k}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="mb-1.5 block text-xs text-muted-foreground">Description</Label><Textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} maxLength={500} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            if (f.title.trim().length < 3) { toast.error("Add an event title"); return; }
            ws.addEvent({ ...f, title: f.title.trim(), attendees: [ws.currentUser.id] });
            toast.success("Event added to the calendar");
            setOpen(false);
          }}>Add event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}