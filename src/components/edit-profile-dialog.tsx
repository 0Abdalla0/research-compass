import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Upload, FileText, ShieldCheck, Loader2 } from "lucide-react";
import { useWorkspace } from "@/lib/workspace-store";
import { Member } from "@/data/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { uploadFile } from "@/lib/uploads";

export function EditProfileDialog({
  open,
  onOpenChange,
  member,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member;
}) {
  const ws = useWorkspace();
  const [f, setF] = useState({
    name: "",
    phone: "",
    uniId: "",
    uniEmail: "",
    privateEmail: "",
    responsibilities: "",
    cv: "",
    cv_storage_path: "",
  });
  const [uploadingCv, setUploadingCv] = useState(false);

  useEffect(() => {
    if (member) {
      setF({
        name: member.name || "",
        phone: member.phone || "",
        uniId: member.uniId || "",
        uniEmail: member.uniEmail || "",
        privateEmail: member.privateEmail || "",
        responsibilities: member.responsibilities || "",
        cv: member.cv || "",
        cv_storage_path: member.cv_storage_path || "",
      });
    }
  }, [member, open]);

  const handleCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCv(true);
    const toastId = toast.loading(`Uploading CV "${file.name}"...`);
    try {
      const uploadRes = await uploadFile(file, file.name, "cvs");
      setF((prev) => ({
        ...prev,
        cv: file.name,
        cv_storage_path: uploadRes.storage_path,
      }));
      toast.success("CV uploaded successfully!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload CV.", { id: toastId });
    } finally {
      setUploadingCv(false);
    }
  };

  const handleSave = async () => {
    if (!f.name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    try {
      await ws.updateProfile(member.id, {
        name: f.name.trim(),
        phone: f.phone.trim() || undefined,
        uniId: f.uniId.trim() || undefined,
        uniEmail: f.uniEmail.trim() || undefined,
        privateEmail: f.privateEmail.trim() || undefined,
        responsibilities: f.responsibilities.trim(),
        cv: f.cv || undefined,
        cv_storage_path: f.cv_storage_path || undefined,
      });
      toast.success("Profile updated successfully!");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile changes.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile Information</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 mt-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Full Name</Label>
              <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Phone Number</Label>
              <Input
                value={f.phone}
                onChange={(e) => setF({ ...f, phone: e.target.value })}
                placeholder="e.g. +20 123 456 7890"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">University ID</Label>
              <Input
                value={f.uniId}
                onChange={(e) => setF({ ...f, uniId: e.target.value })}
                placeholder="e.g. 2026-102948"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">University Email</Label>
              <Input
                value={f.uniEmail}
                onChange={(e) => setF({ ...f, uniEmail: e.target.value })}
                placeholder="e.g. name@uni.edu"
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Private Email</Label>
            <Input
              value={f.privateEmail}
              onChange={(e) => setF({ ...f, privateEmail: e.target.value })}
              placeholder="e.g. personal@gmail.com"
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Research Responsibilities</Label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-brand"
              value={f.responsibilities}
              onChange={(e) => setF({ ...f, responsibilities: e.target.value })}
              placeholder="Describe your role and focus areas..."
            />
          </div>

          {/* Conditional CV upload based on role */}
          {member.role === "Member" && (
            <div className="pt-3 border-t border-border/60 space-y-2">
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
                    {f.cv ? f.cv : "Select CV File (PDF, DOCX...)"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleCvChange}
                    className="hidden"
                    disabled={uploadingCv}
                  />
                </label>
                {f.cv_storage_path && (
                  <a
                    href={
                      ws.supabase.storage
                        .from("documents")
                        .getPublicUrl(f.cv_storage_path).data.publicUrl
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
        </div>
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={uploadingCv}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
