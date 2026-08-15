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
import { Upload, FileText, Loader2 } from "lucide-react";
import { uploadFile } from "@/lib/uploads";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState("profile");
  
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [institution, setInstitution] = useState("");

  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileUniId, setProfileUniId] = useState("");
  const [profileUniEmail, setProfileUniEmail] = useState("");
  const [profilePrivateEmail, setProfilePrivateEmail] = useState("");
  const [profileResponsibilities, setProfileResponsibilities] = useState("");
  const [profileCv, setProfileCv] = useState("");
  const [profileCvStoragePath, setProfileCvStoragePath] = useState("");
  const [uploadingCv, setUploadingCv] = useState(false);

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
      setProfileCv(ws.currentUser.cv || "");
      setProfileCvStoragePath(ws.currentUser.cv_storage_path || "");
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

  const handleCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCv(true);
    const toastId = toast.loading(`Uploading CV "${file.name}"...`);
    try {
      const uploadRes = await uploadFile(file, file.name, "cvs");
      setProfileCv(file.name);
      setProfileCvStoragePath(uploadRes.storage_path);
      toast.success("CV uploaded successfully!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload CV.", { id: toastId });
    } finally {
      setUploadingCv(false);
    }
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
      cv: profileCv || undefined,
      cv_storage_path: profileCvStoragePath || undefined,
    });
    toast.success("Profile saved successfully!");
  };

  const dynamicTags = Array.from(
    new Set([
      ...ws.notes.flatMap((n) => n.tags || []),
      ...ws.shots.flatMap((s) => s.tags || []),
      ...ws.links.flatMap((l) => l.tags || []),
      ...ws.papers.flatMap((p) => p.keywords || []),
    ])
  )
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .sort();

  return (
    <div className="space-y-6">
      <PageHeader title="Project Settings" subtitle="Admin controls for the research workspace" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="workspace">Workspace Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
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
                  {ws.currentUser.role === "Member" && (
                    <div className="pt-2 space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-brand" />
                        CV Document / Resume
                      </Label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-xl bg-muted/30 text-xs font-semibold text-foreground hover:bg-secondary transition-all cursor-pointer flex-1">
                          {uploadingCv ? (
                            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="truncate max-w-[250px] text-muted-foreground">
                            {profileCv ? profileCv : "Select CV File (PDF, DOCX...)"}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleCvChange}
                            className="hidden"
                            disabled={uploadingCv}
                          />
                        </label>
                        {profileCvStoragePath && (
                          <a
                            href={
                              ws.supabase.storage
                                .from("documents")
                                .getPublicUrl(profileCvStoragePath).data.publicUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-medium text-brand hover:underline shrink-0"
                          >
                            View Current
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  <Button className="w-fit" onClick={handleSaveProfile} disabled={uploadingCv}>Save profile</Button>
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
          </div>
        </TabsContent>

        <TabsContent value="workspace">
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
                      {m.id === ws.currentUser?.id ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setActiveTab("profile")}
                            className="cursor-pointer font-semibold text-brand hover:bg-brand/10"
                          >
                            Manage
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive hover:bg-destructive/10 cursor-pointer"
                            onClick={async () => {
                              if (confirm(`Are you sure you want to permanently delete your account and leave the workspace?`)) {
                                await ws.deleteMember(m.id);
                                ws.logoutUser();
                                toast.success(`Your account has been deleted`);
                              }
                            }}
                          >
                            Delete Account
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => toast.info("Only the logged-in user can manage their own profile.")}>Manage</Button>
                      )}
                    </li>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-2">No team members registered yet.</p>
                )}
              </ul>
            </Panel>

            {/* Research phrases & labels */}
            <Panel className="p-5">
              <h2 className="font-display text-sm font-semibold">Research phrases & labels</h2>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                Dynamic keywords and tags aggregated from papers, notes, screenshots, and links. Click any to search.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {dynamicTags.length > 0 ? (
                  dynamicTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        ws.setSearchQuery(tag);
                        ws.setSearchOpen(true);
                      }}
                      className="rounded-full bg-brand/5 border border-brand/20 px-2.5 py-1 text-xs text-brand hover:bg-brand/10 transition-colors font-medium cursor-pointer"
                    >
                      #{tag}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No tags or keywords added yet.</span>
                )}
              </div>
            </Panel>

            {/* Permissions & data */}
            <Panel className="p-5">
              <h2 className="font-display text-sm font-semibold">Permissions & data</h2>
              <div className="mt-3 space-y-3">
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
                </div>
              </div>
            </Panel>
          </div>
        </TabsContent>
      </Tabs>
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