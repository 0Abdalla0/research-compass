import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LayoutGrid, Plus, Rows3, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/workspace-store";
import type { PaperStatus } from "@/data/workspace";
import { Initials, Meter, PageHeader, Panel, StatusPill, Tag } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES: PaperStatus[] = ["To Read", "Reading", "Analyzing", "Completed", "Important", "Rejected"];

export const Route = createFileRoute("/papers/")({
  head: () => ({
    meta: [
      { title: "Research Paper Library — ResearchHub" },
      {
        name: "description",
        content:
          "Search, filter and track every paper in the literature review: status, assigned Member, analysis progress and keywords.",
      },
      { property: "og:title", content: "Research Paper Library — ResearchHub" },
      { property: "og:description", content: "Track every paper from To Read to fully analyzed." },
    ],
  }),
  component: PapersPage,
});

function PapersPage() {
  const ws = useWorkspace();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [year, setYear] = useState("all");
  const [owner, setOwner] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState<"grid" | "table">("grid");

  const categories = [...new Set(ws.papers.map((p) => p.category))];
  const years = [...new Set(ws.papers.map((p) => p.year))].sort((a, b) => b - a);

  const list = useMemo(() => {
    const rank: Record<PaperStatus, number> = {
      Important: 0,
      Analyzing: 1,
      Reading: 2,
      Completed: 3,
      "To Read": 4,
      Rejected: 5,
    };
    return ws.papers
      .filter((p) => {
        const hay = `${p.title} ${p.authors} ${p.keywords.join(" ")} ${p.abstract}`.toLowerCase();
        return (
          hay.includes(q.toLowerCase()) &&
          (status === "all" || p.status === status) &&
          (year === "all" || String(p.year) === year) &&
          (owner === "all" || p.ownerId === owner) &&
          (category === "all" || p.category === category)
        );
      })
      .sort((a, b) => (sort === "newest" ? b.year - a.year : rank[a.status] - rank[b.status]));
  }, [ws.papers, q, status, year, owner, category, sort]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Research Papers"
        subtitle={`${ws.papers.length} papers in the MedOnto Lab library · ${ws.papers.filter((p) => p.status === "Completed").length} fully analyzed`}
        actions={
          <>
            <div className="flex rounded-lg border border-border p-0.5">
              <button
                onClick={() => setView("grid")}
                className={`rounded-md p-1.5 ${view === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("table")}
                className={`rounded-md p-1.5 ${view === "table" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
                aria-label="Table view"
              >
                <Rows3 className="h-4 w-4" />
              </button>
            </div>
            <AddPaperDialog />
          </>
        }
      />

      <Panel className="p-4">
        <div className="grid gap-2 md:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))_minmax(0,1fr)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, author, keyword…"
              className="pl-9"
            />
          </div>
          <Filter value={status} onChange={setStatus} label="Status" options={STATUSES} />
          <Filter value={year} onChange={setYear} label="Year" options={years.map(String)} />
          <Filter
            value={owner}
            onChange={setOwner}
            label="Member"
            options={ws.members.map((m) => m.id)}
            render={(id) => ws.member(id)?.name ?? id}
          />
          <Filter value={category} onChange={setCategory} label="Category" options={categories} />
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Sort: Newest</SelectItem>
              <SelectItem value="importance">Sort: Importance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Panel>

      {list.length === 0 && (
        <Panel className="p-12 text-center">
          <p className="font-medium">No papers match these filters</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try clearing the search or the status filter.
          </p>
        </Panel>
      )}

      {view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <Link key={p.id} to="/papers/$id" params={{ id: p.id }}>
              <Panel className="flex h-full flex-col p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40">
                <div className="flex items-start justify-between gap-3">
                  <StatusPill status={p.status} />
                  <div
                    className="flex items-center gap-1.5"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <span className="text-xs font-medium text-muted-foreground">{p.year}</span>
                    <button
                      type="button"
                      className="p-1 rounded-lg text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete the paper "${p.title}"?`)) {
                          ws.removePaper(p.id);
                          toast.success("Paper deleted successfully");
                        }
                      }}
                      title="Delete Paper"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="font-display mt-3 line-clamp-3 text-[15px] font-semibold leading-snug">
                  {p.title}
                </h3>
                <p className="mt-1.5 line-clamp-1 text-xs text-muted-foreground">{p.authors}</p>
                <p className="mt-0.5 line-clamp-1 text-xs italic text-muted-foreground">
                  {p.venue}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.keywords.slice(0, 3).map((k) => (
                    <Tag key={k}>{k}</Tag>
                  ))}
                </div>
                <div className="mt-auto pt-4">
                  <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Analysis progress</span>
                    <span className="font-semibold text-foreground">{p.progress}%</span>
                  </div>
                  <Meter value={p.progress} tone={p.progress === 100 ? "success" : "brand"} />
                  <div className="mt-3 flex items-center gap-2">
                    <Initials member={ws.member(p.ownerId)} size={24} />
                    <span className="text-xs text-muted-foreground">
                      {ws.member(p.ownerId)?.name}
                    </span>
                  </div>
                </div>
              </Panel>
            </Link>
          ))}
        </div>
      ) : (
        <Panel className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Year</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Member</th>
                <th className="px-4 py-3 font-semibold">Progress</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border/70 last:border-0 hover:bg-secondary/50"
                >
                  <td className="max-w-sm px-4 py-3">
                    <Link
                      to="/papers/$id"
                      params={{ id: p.id }}
                      className="font-medium hover:text-brand"
                    >
                      {p.title}
                    </Link>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{p.authors}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.year}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Initials member={ws.member(p.ownerId)} size={22} />
                      <span className="text-xs">{ws.member(p.ownerId)?.name}</span>
                    </div>
                  </td>
                  <td className="w-36 px-4 py-3">
                    <Meter value={p.progress} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete the paper "${p.title}"?`)) {
                          ws.removePaper(p.id);
                          toast.success("Paper deleted successfully");
                        }
                      }}
                      title="Delete Paper"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}

function Filter({
  value,
  onChange,
  label,
  options,
  render,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: string[];
  render?: (v: string) => string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label.toLowerCase()}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {render ? render(o) : o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function AddPaperDialog() {
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    authors: "",
    year: "2026",
    venue: "",
    doi: "",
    url: "",
    category: "Machine Learning",
    keywords: "",
    abstract: "",
    status: "To Read" as PaperStatus,
    ownerId: "m1",
  });

  const submit = () => {
    if (form.title.trim().length < 4) {
      toast.error("Give the paper a title first");
      return;
    }
    ws.addPaper({
      title: form.title.trim(),
      authors: form.authors || "Unknown",
      year: Number(form.year) || 2026,
      venue: form.venue,
      doi: form.doi,
      url: form.url,
      category: form.category,
      keywords: form.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      abstract: form.abstract,
      status: form.status,
      ownerId: form.ownerId,
    });
    toast.success("Paper added to the library");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1.5 h-4 w-4" /> Add Paper
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a research paper</DialogTitle>
          <DialogDescription>
            Log the metadata now — the analysis workspace is created automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title" className="sm:col-span-2">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Paper title"
              maxLength={220}
            />
          </Field>
          <Field label="Authors">
            <Input
              value={form.authors}
              onChange={(e) => setForm({ ...form, authors: e.target.value })}
              placeholder="A. Author, B. Author"
            />
          </Field>
          <Field label="Publication year">
            <Input
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              inputMode="numeric"
            />
          </Field>
          <Field label="Journal / Conference">
            <Input
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
            />
          </Field>
          <Field label="DOI">
            <Input
              value={form.doi}
              onChange={(e) => setForm({ ...form, doi: e.target.value })}
              placeholder="10.xxxx/xxxxx"
            />
          </Field>
          <Field label="URL / PDF link" className="sm:col-span-2">
            <Input
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://"
            />
          </Field>
          <Field label="Category">
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Machine Learning",
                  "Medical Informatics",
                  "Ontologies",
                  "NLP",
                  "Data Science",
                  "Software Engineering",
                ].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as PaperStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Responsible Member">
            <Select value={form.ownerId} onValueChange={(v) => setForm({ ...form, ownerId: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ws.members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Keywords (comma separated)">
            <Input
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              placeholder="sepsis, ontology"
            />
          </Field>
          <Field label="Abstract" className="sm:col-span-2">
            <Textarea
              rows={4}
              value={form.abstract}
              onChange={(e) => setForm({ ...form, abstract: e.target.value })}
              maxLength={2000}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Add paper</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}