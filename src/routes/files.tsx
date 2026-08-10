import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/workspace-store";
import { Initials, PageHeader, Panel } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FOLDERS = ["All", "Research Papers", "Datasets", "Screenshots", "Presentations", "Documentation", "Meeting Files", "Experiments"];

export const Route = createFileRoute("/files")({
  head: () => ({
    meta: [
      { title: "Research Files — ResearchHub" },
      { name: "description", content: "Central file storage for papers, datasets, screenshots, presentations, documentation and meeting recordings." },
      { property: "og:title", content: "Research Files — ResearchHub" },
      { property: "og:description", content: "Every research file, organised in one place." },
    ],
  }),
  component: FilesPage,
});

function FilesPage() {
  const ws = useWorkspace();
  const [folder, setFolder] = useState("All");
  const [q, setQ] = useState("");
  const list = ws.files.filter((f) => (folder === "All" || f.folder === folder) && f.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader title="Files" subtitle={`${ws.files.length} files across ${FOLDERS.length - 1} folders`} actions={<Button onClick={() => { ws.addFile({ name: `upload_${Date.now()}.pdf`, ext: "pdf", folder: folder === "All" ? "Documentation" : folder, size: "1.2 MB", uploadedBy: ws.currentUser.id }); toast.success("File uploaded"); }}>Upload file</Button>} />

      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <Panel className="p-3">
          <ul className="space-y-1">
            {FOLDERS.map((f) => (
              <li key={f}>
                <button onClick={() => setFolder(f)} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${folder === f ? "bg-brand/12 font-semibold text-brand" : "text-muted-foreground hover:bg-secondary"}`}>{f}</button>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-3">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files…" />
          <Panel className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Folder</th><th className="px-4 py-3">Size</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3" /></tr>
              </thead>
              <tbody>
                {list.map((f) => (
                  <tr key={f.id} className="border-b border-border/70 last:border-0 hover:bg-secondary/50">
                    <td className="px-4 py-3"><span className="flex items-center gap-2 font-medium"><FileText className="h-4 w-4 text-brand" />{f.name}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{f.folder}</td>
                    <td className="px-4 py-3 text-muted-foreground">{f.size}</td>
                    <td className="px-4 py-3"><Initials member={ws.member(f.uploadedBy)} size={22} /></td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => toast.success("Download started")}><Download className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => { ws.removeFile(f.id); toast.success("File deleted"); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No files in this folder.</p>}
          </Panel>
        </div>
      </div>
    </div>
  );
}