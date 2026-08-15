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

  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileUniId, setProfileUniId] = useState("");
  const [profileUniEmail, setProfileUniEmail] = useState("");
  const [profilePrivateEmail, setProfilePrivateEmail] = useState("");
  const [profileResponsibilities, setProfileResponsibilities] = useState("");

  // Sync inputs with workspace context values
  useEffect(() => {
    setName(ws.project.name);
    setTopic(ws.project.topic);
    setInstitution(ws.project.institution);
  }, [ws.project]);

  // Sync inputs with user context values
  useEffect(() => {
    if (ws.currentUser) {
      setProfileName(ws.currentUser.name || "");
      setProfilePhone(ws.currentUser.phone || "");
      setProfileUniId(ws.currentUser.uniId || "");
      setProfileUniEmail(ws.currentUser.uniEmail || "");
      setProfilePrivateEmail(ws.currentUser.privateEmail || "");
      setProfileResponsibilities(ws.currentUser.responsibilities || "");
    }
  }, [ws.currentUser]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Project name cannot be empty.");
      return;
    }
    ws.updateProject(name, topic, institution);
    toast.success("Project settings saved successfully!");
  };

  const handleSaveProfile = async () => {
    if (!ws.currentUser) return;
    if (!profileName.trim()) {
      toast.error("Profile name cannot be empty.");
      return;
    }
    await ws.updateProfile(ws.currentUser.id, {
      name: profileName.trim(),
      phone: profilePhone.trim() || undefined,
      uniId: profileUniId.trim() || undefined,
      uniEmail: profileUniEmail.trim() || undefined,
      privateEmail: profilePrivateEmail.trim() || undefined,
      responsibilities: profileResponsibilities.trim(),
    });
    toast.success("Profile saved successfully!");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Project Settings" subtitle="Admin controls for the research workspace" />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* User Profile panel */}
        {ws.currentUser && (
          <Panel className="p-5">
            <h2 className="font-display text-sm font-semibold">My Profile</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Edit your personal registration details</p>
            <div className="mt-4 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">Full Name</Label>
                  <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">Phone Number</Label>
                  <Input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="e.g. +20 123 456 7890" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">University ID</Label>
                  <Input value={profileUniId} onChange={(e) => setProfileUniId(e.target.value)} placeholder="e.g. 2026-102948" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">University Email</Label>
                  <Input value={profileUniEmail} onChange={(e) => setProfileUniEmail(e.target.value)} placeholder="e.g. name@uni.edu" />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs text-muted-foreground">Private Email</Label>
                <Input value={profilePrivateEmail} onChange={(e) => setProfilePrivateEmail(e.target.value)} placeholder="e.g. personal@gmail.com" />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs text-muted-foreground">Research Responsibilities</Label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-brand"
                  value={profileResponsibilities}
                  onChange={(e) => setProfileResponsibilities(e.target.value)}
                  placeholder="Describe your role and focus areas..."
                />
              </div>
              <Button className="w-fit" onClick={handleSaveProfile}>Save profile</Button>
            </div>
          </Panel>
        )}

        {/* Theme Settings panel */}
        <Panel className="p-5">
          <h2 className="font-display text-sm font-semibold">Theme Preferences</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Customize your interface theme</p>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-border p-3">
            <div className="space-y-0.5">
              <span className="text-sm font-medium">Dark Mode</span>
              <p className="text-[11px] text-muted-foreground">Switch between light and dark themes</p>
            </div>
            <Switch 
              checked={ws.theme === "dark"} 
              onCheckedChange={() => {
                ws.toggleTheme();
                toast.success(`Switched to ${ws.theme === "light" ? "dark" : "light"} mode`);
              }} 
            />
          </div>
        </Panel>

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
                  {m.id !== ws.currentUser?.id && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-destructive hover:bg-destructive/10 cursor-pointer"
                      onClick={async () => {
                        if (confirm(`Are you sure you want to remove ${m.name} from the workspace?`)) {
                          await ws.deleteMember(m.id);
                          toast.success(`${m.name} has been removed`);
                        }
                      }}
                    >
                      Remove
                    </Button>
                  )}
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