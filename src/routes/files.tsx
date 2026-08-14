import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Download, FileText, Trash2, Eye, X, UploadCloud, Folder, HardDrive, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/workspace-store";
import { Initials, PageHeader, Panel } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFilesQuery, useFileUploadMutation, useDeleteFileMutation } from "@/hooks/use-files";

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

type FileType = ReturnType<typeof useFilesQuery>["data"] extends (infer T)[] | undefined ? T : never;

function FilesPage() {
  const ws = useWorkspace();
  const filesQuery = useFilesQuery();
  const uploadMutation = useFileUploadMutation();
  const deleteMutation = useDeleteFileMutation();

  const files = filesQuery.data ?? [];

  const [folder, setFolder] = useState("All");
  const [q, setQ] = useState("");
  const [previewFile, setPreviewFile] = useState<FileType | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const list = files.filter((f) => (folder === "All" || f.folder === folder) && f.name.toLowerCase().includes(q.toLowerCase()));

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading(`Uploading "${file.name}"...`);

    try {
      await uploadMutation.mutateAsync({
        file,
        folder,
        userId: ws.currentUser ? ws.currentUser.id : "m1",
      });

      toast.success(`"${file.name}" uploaded successfully!`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(`Failed to upload "${file.name}"`, { id: toastId });
    }
    e.target.value = "";
  };

  const isImage = (ext: string) => {
    return ["png", "jpg", "jpeg", "svg", "gif", "webp", "bmp"].includes(ext.toLowerCase());
  };

  const isPdf = (ext: string) => {
    return ext.toLowerCase() === "pdf";
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Files"
        subtitle={`${files.length} files`}
        actions={
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button onClick={handleUploadClick} className="inline-flex items-center gap-2 cursor-pointer text-xs md:text-sm">
              <UploadCloud className="h-4 w-4" />
              Upload file
            </Button>
          </>
        }
      />

      {/* Mobile Folders Horizontally Scrollable Bar */}
      <div className="md:hidden flex gap-1.5 overflow-x-auto pb-2 px-1 scrollbar-none snap-x">
        {FOLDERS.map((f) => (
          <button
            key={f}
            onClick={() => setFolder(f)}
            className={`snap-start shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              folder === f
                ? "bg-brand text-brand-foreground shadow"
                : "bg-card border border-border text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
        {/* Desktop Folders Sidebar (Hidden on Mobile) */}
        <Panel className="hidden md:block p-3 self-start">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2 flex items-center gap-1.5">
            <Folder className="h-3.5 w-3.5" />
            Folders
          </h2>
          <ul className="space-y-1">
            {FOLDERS.map((f) => (
              <li key={f}>
                <button
                  onClick={() => setFolder(f)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                    folder === f
                      ? "bg-brand/12 font-semibold text-brand"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {f}
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Files Area */}
        <div className="space-y-3">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files…" />
          
          {/* Desktop Table View (Hidden on Mobile) */}
          <div className="hidden md:block">
            <Panel className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground bg-muted/20">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Folder</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((f) => (
                    <tr key={f.id} className="border-b border-border/70 last:border-0 hover:bg-secondary/40 transition-colors">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setPreviewFile(f)}
                          className="flex items-center gap-2.5 font-semibold text-left text-foreground hover:text-brand transition-colors cursor-pointer"
                        >
                          <FileText className="h-4 w-4 text-brand shrink-0" />
                          <span className="truncate max-w-[280px]">{f.name}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{f.folder}</td>
                      <td className="px-4 py-3 text-muted-foreground">{f.size}</td>
                      <td className="px-4 py-3">
                        <Initials member={ws.member(f.uploadedBy)} size={22} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPreviewFile(f)}
                            title="Preview File"
                            className="cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                          {f.url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              asChild
                              title="Download File"
                            >
                              <a href={f.url} download={f.name}>
                                <Download className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                              </a>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${f.name}"?`)) {
                                deleteMutation.mutate(
                                  { id: f.id, storage_path: f.storage_path },
                                  {
                                    onSuccess: () => toast.success("File deleted"),
                                    onError: () => toast.error("Failed to delete file"),
                                  },
                                );
                              }
                            }}
                            title="Delete File"
                            className="cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive hover:bg-destructive/10" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </div>

          {/* Mobile Cards List View (Hidden on Desktop) */}
          <div className="block md:hidden space-y-3">
            {list.map((f) => (
              <Panel key={f.id} className="p-4 border border-border bg-card flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => setPreviewFile(f)}
                    className="flex items-start gap-2 text-left font-semibold text-sm text-foreground hover:text-brand cursor-pointer"
                  >
                    <FileText className="h-4.5 w-4.5 text-brand shrink-0 mt-0.5" />
                    <span className="break-all leading-snug">{f.name}</span>
                  </button>
                  <Initials member={ws.member(f.uploadedBy)} size={22} className="shrink-0" />
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground bg-secondary/40 px-2.5 py-1.5 rounded-lg border border-border/20">
                  <span className="font-medium">{f.folder}</span>
                  <span className="font-semibold">{f.size}</span>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-2.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPreviewFile(f)}
                    className="h-8 px-2 text-xs font-semibold cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" /> Preview
                  </Button>
                  {f.url && (
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                      className="h-8 px-2 text-xs font-semibold cursor-pointer"
                    >
                      <a href={f.url} download={f.name}>
                        <Download className="h-3.5 w-3.5 mr-1" /> Download
                      </a>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Delete "${f.name}"?`)) {
                        deleteMutation.mutate(
                          { id: f.id, storage_path: f.storage_path },
                          {
                            onSuccess: () => toast.success("File deleted"),
                            onError: () => toast.error("Failed to delete file"),
                          },
                        );
                      }
                    }}
                    className="h-8 px-2 text-xs font-semibold text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </Panel>
            ))}
          </div>

          {list.length === 0 && (
            <Panel className="py-12 text-center space-y-2">
              <HardDrive className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">No files found in this folder.</p>
            </Panel>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
              <div>
                <h3 className="text-sm font-bold text-foreground truncate max-w-[260px] sm:max-w-[500px]">
                  {previewFile.name}
                </h3>
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                  {previewFile.folder} · {previewFile.size}
                </p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1.5 rounded-xl text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-muted/10 min-h-[300px]">
              {previewFile.url ? (
                isImage(previewFile.ext) ? (
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md border border-border bg-white"
                  />
                ) : isPdf(previewFile.ext) ? (
                  <iframe
                    src={previewFile.url}
                    title={previewFile.name}
                    className="w-full h-[60vh] border border-border rounded-lg shadow-inner bg-card"
                  />
                ) : (
                  <div className="text-center space-y-4 py-8">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 mx-auto text-brand">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">No Preview Available</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Preview is not supported for .{previewFile.ext} files. You can download it to open on your device.
                      </p>
                    </div>
                    <a
                      href={previewFile.url}
                      download={previewFile.name}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand text-brand-foreground px-5 py-2.5 text-xs font-bold transition-all shadow hover:bg-brand/90 cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      Download File
                    </a>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">Local file preview is not available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}