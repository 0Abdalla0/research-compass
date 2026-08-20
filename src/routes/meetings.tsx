import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Edit3, Plus, Trash2, Video, ExternalLink } from "lucide-react";
import { useWorkspace } from "@/lib/workspace-store";
import { Initials, PageHeader, Panel, Stack } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Meeting } from "@/data/workspace";

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
      <PageHeader 
        title="Meetings" 
        subtitle="Agendas, decisions and action items — turn any item into a task" 
        actions={
          <MeetingDialog 
            trigger={
              <Button size="sm" className="inline-flex items-center gap-1.5 cursor-pointer text-xs md:text-sm">
                <Plus className="h-4 w-4" /> Schedule Meeting
              </Button>
            }
          />
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {ws.meetings.map((m) => (
          <Panel key={m.id} className="p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-display text-base font-semibold flex items-center gap-1.5">
                  <Video className="h-4.5 w-4.5 text-brand shrink-0" />
                  {m.title}
                </h2>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">{m.date} · {m.time}</span>
                  <MeetingDialog
                    meeting={m}
                    trigger={
                      <button className="p-1 rounded-lg text-muted-foreground hover:bg-secondary transition-colors cursor-pointer animate-in fade-in duration-100" title="Edit Meeting">
                        <Edit3 className="h-4 w-4" />
                      </button>
                    }
                  />
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete meeting "${m.title}"?`)) {
                        ws.removeMeeting(m.id);
                        toast.success("Meeting deleted successfully");
                      }
                    }}
                    className="p-1 rounded-lg text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Delete Meeting"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Stack ids={m.participants} members={ws.members} />
                {m.link && (
                  <a 
                    href={m.link.startsWith("http") ? m.link : `https://${m.link}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline shrink-0"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Join Meeting
                  </a>
                )}
              </div>
              
              {m.agenda.length > 0 && <Section title="Agenda" items={m.agenda} />}
              {m.decisions.length > 0 && <Section title="Decisions" items={m.decisions} />}
              
              {m.actionItems.length > 0 && (
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
              )}
            </div>
            {m.notes && (
              <div className="mt-4 border-t border-border/40 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Meeting Notes</p>
                <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">{m.notes}</p>
              </div>
            )}
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

function MeetingDialog({ meeting, trigger }: { meeting?: Meeting; trigger: ReactNode }) {
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(meeting ? meeting.title : "");
  const [date, setDate] = useState(meeting ? meeting.date : new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(meeting ? meeting.time : "10:00");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(meeting ? meeting.participants : []);
  const [agenda, setAgenda] = useState(meeting ? meeting.agenda.join("\n") : "");
  const [decisions, setDecisions] = useState(meeting ? meeting.decisions.join("\n") : "");
  const [actionItems, setActionItems] = useState(meeting ? meeting.actionItems.map(a => a.text).join("\n") : "");
  const [notes, setNotes] = useState(meeting ? meeting.notes || "" : "");
  const [link, setLink] = useState(meeting ? meeting.link || "" : "");

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Meeting title is required");
      return;
    }

    const agendaList = agenda.split("\n").map(a => a.trim()).filter(Boolean);
    const decisionsList = decisions.split("\n").map(d => d.trim()).filter(Boolean);
    const actionItemsList = actionItems.split("\n").map(a => a.trim()).filter(Boolean).map(text => ({
      text,
      ownerId: selectedParticipants[0] || (ws.currentUser ? ws.currentUser.id : "m1")
    }));

    const payload = {
      title: title.trim(),
      date,
      time,
      participants: selectedParticipants,
      agenda: agendaList,
      decisions: decisionsList,
      actionItems: actionItemsList,
      notes: notes.trim(),
      link: link.trim() || undefined,
    };

    if (meeting) {
      ws.updateMeeting(meeting.id, payload);
      toast.success("Meeting updated successfully");
    } else {
      ws.addMeeting(payload);
      toast.success("Meeting scheduled successfully");
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{meeting ? "Edit Meeting" : "Schedule Meeting"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Meeting Title</Label>
            <Input placeholder="e.g. Sepsis Dataset Review" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Meeting Link / URL (Optional)</Label>
            <Input placeholder="e.g. https://meet.google.com/abc-defg-hij" value={link} onChange={(e) => setLink(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Time</Label>
              <Input placeholder="e.g. 10:00 AM" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Participants</Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-border rounded-xl">
              {ws.members.map((m) => {
                const active = selectedParticipants.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedParticipants((prev) =>
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

          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Agenda (one item per line)</Label>
            <Textarea rows={3} placeholder="Review paper draft&#10;Analyze models" value={agenda} onChange={(e) => setAgenda(e.target.value)} />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Decisions (one item per line)</Label>
            <Textarea rows={3} placeholder="Approved model architecture&#10;Extended deadline" value={decisions} onChange={(e) => setDecisions(e.target.value)} />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Action Items (one item per line)</Label>
            <Textarea rows={3} placeholder="Prepare slides&#10;Submit draft" value={actionItems} onChange={(e) => setActionItems(e.target.value)} />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">General Notes</Label>
            <Textarea placeholder="Any general summary notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="cursor-pointer">Cancel</Button>
          <Button onClick={handleSave} className="cursor-pointer">Save Meeting</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}