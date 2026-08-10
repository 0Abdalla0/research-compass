import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useWorkspace } from "@/lib/workspace-store";
import { FileText, KanbanSquare, NotebookPen, Image, Mic, FolderOpen, Link2, Video, Users } from "lucide-react";

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const nav = useNavigate();
  const ws = useWorkspace();

  const go = (to: string) => {
    onOpenChange(false);
    void nav({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search papers, tasks, notes, files, people…" />
      <CommandList>
        <CommandEmpty>No results across the workspace.</CommandEmpty>

        <CommandGroup heading="Research Papers">
          {ws.papers.map((p) => (
            <CommandItem key={p.id} value={`${p.title} ${p.keywords.join(" ")} ${p.category}`} onSelect={() => go(`/papers/${p.id}`)}>
              <FileText className="mr-2 h-4 w-4 text-brand" />
              <span className="truncate">{p.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Tasks">
          {ws.tasks.map((t) => (
            <CommandItem key={t.id} value={`${t.title} ${t.labels.join(" ")}`} onSelect={() => go("/tasks")}>
              <KanbanSquare className="mr-2 h-4 w-4 text-brand" />
              <span className="truncate">{t.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Notes">
          {ws.notes.map((n) => (
            <CommandItem key={n.id} value={`${n.title} ${n.tags.join(" ")}`} onSelect={() => go("/notes")}>
              <NotebookPen className="mr-2 h-4 w-4 text-brand" />
              <span className="truncate">{n.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Screenshots">
          {ws.shots.map((s) => (
            <CommandItem key={s.id} value={`${s.title} ${s.tags.join(" ")}`} onSelect={() => go("/media")}>
              <Image className="mr-2 h-4 w-4 text-brand" />
              <span className="truncate">{s.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Voice notes">
          {ws.voiceNotes.map((v) => (
            <CommandItem key={v.id} value={v.title} onSelect={() => go("/voice")}>
              <Mic className="mr-2 h-4 w-4 text-brand" />
              <span className="truncate">{v.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Files">
          {ws.files.map((f) => (
            <CommandItem key={f.id} value={`${f.name} ${f.folder}`} onSelect={() => go("/files")}>
              <FolderOpen className="mr-2 h-4 w-4 text-brand" />
              <span className="truncate">{f.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Resources">
          {ws.links.map((l) => (
            <CommandItem key={l.id} value={`${l.title} ${l.tags.join(" ")}`} onSelect={() => go("/links")}>
              <Link2 className="mr-2 h-4 w-4 text-brand" />
              <span className="truncate">{l.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Meetings">
          {ws.meetings.map((m) => (
            <CommandItem key={m.id} value={m.title} onSelect={() => go("/meetings")}>
              <Video className="mr-2 h-4 w-4 text-brand" />
              <span className="truncate">{m.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Team">
          {ws.members.map((m) => (
            <CommandItem key={m.id} value={`${m.name} ${m.role}`} onSelect={() => go("/team")}>
              <Users className="mr-2 h-4 w-4 text-brand" />
              <span className="truncate">
                {m.name} · {m.role}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}