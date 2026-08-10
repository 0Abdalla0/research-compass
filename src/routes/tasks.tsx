import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageSquare, Paperclip, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/workspace-store";
import { LABELS, TASK_COLUMNS, type Priority, type TaskStatus } from "@/data/workspace";
import { Initials, Meter, PageHeader, Panel, PriorityPill, Tag } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Research Task Board — ResearchHub" },
      { name: "description", content: "Kanban board for research tasks: backlog, to do, in progress, review and completed, with priorities, labels and checklists." },
      { property: "og:title", content: "Research Task Board — ResearchHub" },
      { property: "og:description", content: "Trello-style task management built for research teams." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const ws = useWorkspace();
  const [dragging, setDragging] = useState<string | null>(null);
  const [openTask, setOpenTask] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState<TaskStatus>("todo");
  const task = ws.tasks.find((t) => t.id === openTask);

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Task Board"
        subtitle="Drag cards between columns — every task can link to a paper, phase or file."
        actions={<AddTaskDialog />}
      />

      {/* Mobile Column Tabs Selection */}
      <div className="lg:hidden flex gap-1 overflow-x-auto pb-1 bg-muted/40 p-1 rounded-xl border border-border/40 scrollbar-none snap-x">
        {TASK_COLUMNS.map((col) => (
          <button
            key={col.id}
            onClick={() => setActiveColumn(col.id)}
            className={`flex-1 min-w-[90px] text-center py-2 text-xs font-bold rounded-lg transition-all snap-start cursor-pointer ${
              activeColumn === col.id
                ? "bg-card text-brand shadow border border-border/20 font-black"
                : "text-muted-foreground hover:bg-secondary/40"
            }`}
          >
            {col.label} ({ws.tasks.filter((t) => t.status === col.id).length})
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {TASK_COLUMNS.map((col) => {
          const items = ws.tasks.filter((t) => t.status === col.id);
          const isActive = activeColumn === col.id;
          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragging) {
                  ws.moveTask(dragging, col.id);
                  toast.success(`Moved to ${col.label}`);
                  setDragging(null);
                }
              }}
              className={`rounded-2xl bg-surface-muted p-3 transition-all ${isActive ? "block animate-in fade-in duration-200" : "hidden lg:block"}`}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{col.label}</h2>
                <span className="rounded-full bg-card px-2 py-0.5 text-[11px] font-semibold">{items.length}</span>
              </div>
              <div className="space-y-2.5">
                {items.map((t) => {
                  const doneCount = t.checklist.filter((c) => c.done).length;
                  return (
                    <button
                      key={t.id}
                      draggable
                      onDragStart={() => setDragging(t.id)}
                      onClick={() => setOpenTask(t.id)}
                      className="w-full cursor-grab rounded-xl border border-border bg-card p-3 text-left shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 active:cursor-grabbing"
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        <PriorityPill priority={t.priority} />
                        {t.labels.slice(0, 2).map((l) => (
                          <Tag key={l}>{l}</Tag>
                        ))}
                      </div>
                      <p className="mt-2 text-sm font-medium leading-snug">{t.title}</p>
                      {t.checklist.length > 0 && (
                        <div className="mt-2.5">
                          <Meter value={(doneCount / t.checklist.length) * 100} tone={doneCount === t.checklist.length ? "success" : "brand"} />
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {doneCount}/{t.checklist.length} subtasks
                          </p>
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Initials member={ws.member(t.assigneeId)} size={22} />
                        <span>{t.due}</span>
                        <span className="ml-auto flex items-center gap-2">
                          {t.comments > 0 && (
                            <span className="flex items-center gap-0.5">
                              <MessageSquare className="h-3 w-3" />
                              {t.comments}
                            </span>
                          )}
                          {t.attachments > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Paperclip className="h-3 w-3" />
                              {t.attachments}
                            </span>
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
                {items.length === 0 && (
                  <p className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                    Drop tasks here
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Sheet open={Boolean(task)} onOpenChange={(o) => !o && setOpenTask(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {task && (
            <>
              <SheetHeader className="flex flex-row items-center justify-between pr-8 border-b border-border/50 pb-3">
                <SheetTitle className="text-left flex-1 min-w-0 pr-2">{task.title}</SheetTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete task "${task.title}"?`)) {
                      ws.removeTask(task.id);
                      setOpenTask(null);
                      toast.success("Task deleted successfully");
                    }
                  }}
                  className="text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                  title="Delete Task"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-8">
                <div className="flex flex-wrap items-center gap-2">
                  <PriorityPill priority={task.priority} />
                  {task.labels.map((l) => (
                    <Tag key={l}>{l}</Tag>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{task.description}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Assignee</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Initials member={ws.member(task.assigneeId)} size={24} />
                      <span className="text-sm">{ws.member(task.assigneeId)?.name}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Due date</p>
                    <p className="mt-1 font-medium">{task.due}</p>
                  </div>
                </div>
                {task.paperId && (
                  <div>
                    <p className="text-xs text-muted-foreground">Related paper</p>
                    <p className="mt-1 text-sm font-medium">{ws.papers.find((p) => p.id === task.paperId)?.title}</p>
                  </div>
                )}
                <div>
                  <p className="mb-2 text-xs text-muted-foreground">Checklist</p>
                  <ul className="space-y-2">
                    {task.checklist.map((c, i) => (
                      <li key={c.text} className="flex items-center gap-2">
                        <Checkbox checked={c.done} onCheckedChange={() => ws.toggleCheck(task.id, i)} />
                        <span className={`text-sm ${c.done ? "text-muted-foreground line-through" : ""}`}>{c.text}</span>
                      </li>
                    ))}
                    {task.checklist.length === 0 && <li className="text-sm text-muted-foreground">No subtasks yet.</li>}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-xs text-muted-foreground">Move to</p>
                  <div className="flex flex-wrap gap-2">
                    {TASK_COLUMNS.map((c) => (
                      <Button
                        key={c.id}
                        size="sm"
                        variant={task.status === c.id ? "default" : "outline"}
                        onClick={() => ws.moveTask(task.id, c.id)}
                      >
                        {c.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AddTaskDialog() {
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    title: "",
    description: "",
    assigneeId: "m1",
    priority: "MEDIUM" as Priority,
    status: "todo" as TaskStatus,
    due: "2026-08-30",
    label: "Research",
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1.5 h-4 w-4" /> Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New research task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Title</Label>
            <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={160} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Description</Label>
            <Textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} maxLength={1000} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Assignee</Label>
              <Select value={f.assigneeId} onValueChange={(v) => setF({ ...f, assigneeId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ws.members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Priority</Label>
              <Select value={f.priority} onValueChange={(v) => setF({ ...f, priority: v as Priority })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["LOW", "MEDIUM", "HIGH", "URGENT"] as Priority[]).map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Column</Label>
              <Select value={f.status} onValueChange={(v) => setF({ ...f, status: v as TaskStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_COLUMNS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Due date</Label>
              <Input type="date" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label className="mb-1.5 block text-xs text-muted-foreground">Label</Label>
              <Select value={f.label} onValueChange={(v) => setF({ ...f, label: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LABELS.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (f.title.trim().length < 3) {
                toast.error("Add a task title");
                return;
              }
              ws.addTask({
                title: f.title.trim(),
                description: f.description,
                assigneeId: f.assigneeId,
                priority: f.priority,
                status: f.status,
                due: f.due,
                labels: [f.label],
              });
              toast.success("Task created");
              setOpen(false);
            }}
          >
            Create task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}