import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useWorkspace } from "@/lib/workspace-store";
import { Initials, PageHeader, Panel, Tag } from "@/components/ui-bits";

export const Route = createFileRoute("/links")({
  head: () => ({
    meta: [
      { title: "Research Resources — ResearchHub" },
      { name: "description", content: "Saved datasets, GitHub repositories, documentation, APIs, tools and videos used by the research team." },
      { property: "og:title", content: "Research Resources — ResearchHub" },
      { property: "og:description", content: "Every dataset, repo and tool the team relies on." },
    ],
  }),
  component: LinksPage,
});

function LinksPage() {
  const ws = useWorkspace();
  return (
    <div className="space-y-6">
      <PageHeader title="Resources" subtitle={`${ws.links.length} saved datasets, repositories, tools and references`} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ws.links.map((l) => (
          <Panel key={l.id} className="p-5 transition-transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <Tag>{l.category}</Tag>
              <a href={l.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-brand"><ExternalLink className="h-4 w-4" /></a>
            </div>
            <h2 className="font-display mt-3 text-[15px] font-semibold leading-snug">{l.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{l.description}</p>
            <p className="mt-2 truncate text-xs text-brand">{l.url}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">{l.tags.map((t) => (<Tag key={t}>#{t}</Tag>))}</div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
              <Initials member={ws.member(l.addedBy)} size={20} /> added by {ws.member(l.addedBy)?.name}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}