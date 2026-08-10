import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/workspace-store";
import { project, LABELS } from "@/data/workspace";
import { Initials, PageHeader, Panel, Tag } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Project Settings — ResearchHub" },
      { name: "description", content: "Manage members, roles, research phases, categories, labels, permissions and project data export." },
      { property: "og:title", content: "Project Settings — ResearchHub" },
      { property: "og:description", content: "Admin controls for the research workspace." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const ws = useWorkspace();
  return (
    <div className="space-y-6">
      <PageHeader title="Project Settings" subtitle="Admin controls for the research workspace" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <h2 className="font-display text-sm font-semibold">Project</h2>
          <div className="mt-3 grid gap-3">
            <div><Label className="mb-1.5 block text-xs text-muted-foreground">Project name</Label><Input defaultValue={project.name} /></div>
            <div><Label className="mb-1.5 block text-xs text-muted-foreground">Research topic</Label><Input defaultValue={project.topic} /></div>
            <div><Label className="mb-1.5 block text-xs text-muted-foreground">Institution</Label><Input defaultValue={project.institution} /></div>
            <Button className="w-fit" onClick={() => toast.success("Project details saved")}>Save changes</Button>
          </div>
        </Panel>

        <Panel className="p-5">
          <h2 className="font-display text-sm font-semibold">Members & roles</h2>
          <ul className="mt-3 space-y-2">
            {ws.members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                <Initials member={m} size={28} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{m.name}</span>
                <Tag>{m.role}</Tag>
                <Button size="sm" variant="ghost" onClick={() => toast.info("Role management opens here")}>Manage</Button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="p-5">
          <h2 className="font-display text-sm font-semibold">Research phases & labels</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">{ws.phases.map((p) => (<Tag key={p.id}>{p.index}. {p.name}</Tag>))}</div>
          <div className="mt-3 flex flex-wrap gap-1.5">{LABELS.map((l) => (<Tag key={l}>{l}</Tag>))}</div>
        </Panel>

        <Panel className="p-5">
          <h2 className="font-display text-sm font-semibold">Permissions & data</h2>
          <div className="mt-3 space-y-3">
            <Toggle label="Only leaders can delete papers" />
            <Toggle label="Members can invite collaborators" />
            <Toggle label="Email deadline reminders" />
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" onClick={() => toast.success("Export prepared (JSON)")}>Export project data</Button>
              <Button variant="outline" onClick={() => toast.info("Project archived (demo)")}>Archive project</Button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Toggle({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border p-3">
      <span className="text-sm">{label}</span>
      <Switch defaultChecked onCheckedChange={() => toast.success("Preference updated")} />
    </div>
  );
}