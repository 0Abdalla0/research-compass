import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/workspace-store";
import { LABELS } from "@/data/workspace";
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
  
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [institution, setInstitution] = useState("");

  // Sync inputs with workspace context values
  useEffect(() => {
    setName(ws.project.name);
    setTopic(ws.project.topic);
    setInstitution(ws.project.institution);
  }, [ws.project]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Project name cannot be empty.");
      return;
    }
    ws.updateProject(name, topic, institution);
    toast.success("Project settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Project Settings" subtitle="Admin controls for the research workspace" />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Project Profile panel */}
        <Panel className="p-5">
          <h2 className="font-display text-sm font-semibold">Project Details</h2>
          <div className="mt-3 grid gap-3">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Project name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Research topic</Label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Institution</Label>
              <Input value={institution} onChange={(e) => setInstitution(e.target.value)} />
            </div>
            <Button className="w-fit" onClick={handleSave}>Save changes</Button>
          </div>
        </Panel>

        {/* Roster & Members Panel */}
        <Panel className="p-5">
          <h2 className="font-display text-sm font-semibold">Members & roles</h2>
          <ul className="mt-3 space-y-2">
            {ws.members.length > 0 ? (
              ws.members.map((m) => (
                <li key={m.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                  <Initials member={m} size={28} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{m.name}</span>
                  <Tag>{m.role}</Tag>
                  <Button size="sm" variant="ghost" onClick={() => toast.info("Role management opens here")}>Manage</Button>
                </li>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-2">No team members registered yet.</p>
            )}
          </ul>
        </Panel>

        {/* Phases & Labels */}
        <Panel className="p-5">
          <h2 className="font-display text-sm font-semibold">Research phases & labels</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">{ws.phases.map((p) => (<Tag key={p.id}>{p.index}. {p.name}</Tag>))}</div>
          <div className="mt-3 flex flex-wrap gap-1.5">{LABELS.map((l) => (<Tag key={l}>{l}</Tag>))}</div>
        </Panel>

        {/* Permissions */}
        <Panel className="p-5">
          <h2 className="font-display text-sm font-semibold">Permissions & data</h2>
          <div className="mt-3 space-y-3">
            <Toggle 
              label="Only leaders can delete papers" 
              checked={ws.preferences.onlyLeadersDelete} 
              onCheckedChange={(val) => {
                ws.updatePreference("onlyLeadersDelete", val);
                toast.success("Preference updated");
              }}
            />
            <Toggle 
              label="Members can invite collaborators" 
              checked={ws.preferences.membersInvite} 
              onCheckedChange={(val) => {
                ws.updatePreference("membersInvite", val);
                toast.success("Preference updated");
              }}
            />
            <Toggle 
              label="Email deadline reminders" 
              checked={ws.preferences.emailReminders} 
              onCheckedChange={(val) => {
                ws.updatePreference("emailReminders", val);
                toast.success("Preference updated");
              }}
            />
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

function Toggle({ 
  label, 
  checked, 
  onCheckedChange 
}: { 
  label: string; 
  checked: boolean; 
  onCheckedChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border p-3">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}