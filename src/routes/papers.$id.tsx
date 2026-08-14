import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { ArrowLeft, ExternalLink, Image as ImageIcon, Link2, Mic, NotebookPen, Save, MessageSquare, Edit3, Pause, Play, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/workspace-store";
import { ThreadView } from "@/components/thread-view";
import { UniversalComposer } from "@/components/universal-composer";
import { ANALYSIS_SECTIONS, Paper } from "@/data/workspace";
import { Initials, Meter, Panel, StatusPill, Tag } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/papers/$id")({
  head: () => ({
    meta: [
      { title: "Paper Analysis Workspace — ResearchHub" },
      {
        name: "description",
        content:
          "Collaboratively analyze a research paper: problem, method, dataset, models, metrics, results, limitations and research gap.",
      },
      { property: "og:title", content: "Paper Analysis Workspace — ResearchHub" },
      { property: "og:description", content: "Structured, collaborative paper analysis for research teams." },
    ],
  }),
  component: PaperDetail,
  notFoundComponent: () => (
    <Panel className="p-12 text-center">
      <p className="font-medium">Paper not found</p>
      <Link to="/papers" className="mt-2 inline-block text-sm text-brand">
        Back to library
      </Link>
    </Panel>
  ),
});

function PaperDetail() {
  const { id } = Route.useParams();
  const ws = useWorkspace();
  const paper = ws.papers.find((p) => p.id === id);
  if (!paper) throw notFound();

  const relatedTasks = ws.tasks.filter((t) => t.paperId === paper.id);
  const relatedNotes = ws.notes.filter((n) => n.paperId === paper.id);
  const relatedShots = ws.shots.filter((s) => s.paperId === paper.id);
  const relatedVoice = ws.voiceNotes.filter((v) => v.paperId === paper.id);
  const relatedLinks = ws.links.filter((l) => l.paperId === paper.id);
  const relatedPapers = ws.papers.filter((p) => p.id !== paper.id && p.category === paper.category).slice(0, 3);

  const paperChat = ws.conversations.find((c) => c.paper_id === paper.id);

  useEffect(() => {
    if (!paperChat && paper.id && ws.currentUser && ws.members.length > 0) {
      ws.addConversation(
        `${paper.title.slice(0, 24)}... Chat`,
        true,
        ws.members.map((m) => m.id),
        paper.id
      ).catch((err) => console.error("Error auto-creating paper chat room:", err));
    }
  }, [paperChat, paper.id, ws.currentUser, ws.members]);

  return (
    <div className="space-y-6">
      <Link to="/papers" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Paper library
      </Link>

      <Panel className="p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={paper.status} />
              <Tag>{paper.category}</Tag>
              <Tag>{paper.year}</Tag>
            </div>
            <h1 className="font-display mt-3 text-2xl font-bold leading-tight">{paper.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{paper.authors}</p>
            <p className="text-sm italic text-muted-foreground">{paper.venue}</p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/90">{paper.abstract}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {paper.keywords.map((k) => (
                <Tag key={k}>{k}</Tag>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={paper.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open source
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success("PDF opened in the file preview")}>
                Preview PDF
              </Button>
              <EditPaperDialog 
                paper={paper}
                trigger={
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit details
                  </Button>
                }
              />
              <span className="inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground">
                DOI {paper.doi || "—"}
              </span>
            </div>
          </div>

          <aside className="space-y-4 rounded-2xl bg-surface-muted p-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Responsible</p>
              <div className="mt-2 flex items-center gap-2">
                <Initials member={ws.member(paper.ownerId)} size={30} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{ws.member(paper.ownerId)?.name}</p>
                  <p className="text-[11px] text-muted-foreground">{ws.member(paper.ownerId)?.role}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Analysis progress</span>
                <span className="font-semibold">{paper.progress}%</span>
              </div>
              <div className="mt-2">
                <Meter value={paper.progress} tone={paper.progress === 100 ? "success" : "brand"} />
              </div>
            </div>
            <dl className="space-y-1.5 text-xs">
              <Row k="Linked tasks" v={relatedTasks.length} />
              <Row k="Notes" v={relatedNotes.length} />
              <Row k="Screenshots" v={relatedShots.length} />
              <Row k="Voice notes" v={relatedVoice.length} />
              <Row k="Resources" v={relatedLinks.length} />
            </dl>
          </aside>
        </div>
      </Panel>

      <Tabs defaultValue="analysis">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="analysis">Analysis workspace</TabsTrigger>
          <TabsTrigger value="linked">Linked items</TabsTrigger>
          <TabsTrigger value="related">Related papers</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
          <TabsTrigger value="chat">Chat Channel</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {ANALYSIS_SECTIONS.map((section) => (
              <AnalysisSection key={section} paperId={paper.id} section={section} value={paper.analysis[section] ?? ""} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="linked" className="mt-4 grid gap-4 lg:grid-cols-2">
          <LinkedPanel title="Tasks" icon={<NotebookPen className="h-4 w-4" />} empty="No tasks linked to this paper yet.">
            {relatedTasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                <span className="min-w-0 truncate text-sm font-medium">{t.title}</span>
                <Initials member={ws.member(t.assigneeId)} size={22} />
              </li>
            ))}
          </LinkedPanel>
          <LinkedPanel title="Notes" icon={<NotebookPen className="h-4 w-4" />} empty="No notes yet.">
            {relatedNotes.map((n) => (
              <li key={n.id} className="rounded-xl border border-border p-3">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {n.type} · updated {n.updated}
                </p>
              </li>
            ))}
          </LinkedPanel>
          <LinkedPanel title="Screenshots" icon={<ImageIcon className="h-4 w-4" />} empty="No screenshots yet.">
            {relatedShots.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <span
                  className="h-10 w-14 shrink-0 rounded-md"
                  style={{ background: `linear-gradient(135deg, oklch(0.72 0.11 ${s.hue}), oklch(0.45 0.13 ${s.hue}))` }}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{s.title}</span>
                  <span className="block text-[11px] text-muted-foreground">{s.source}</span>
                </span>
              </li>
            ))}
          </LinkedPanel>
          <LinkedPanel title="Voice notes & resources" icon={<Mic className="h-4 w-4" />} empty="Nothing attached yet.">
            {relatedVoice.map((v) => (
              <li key={v.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <Mic className="h-4 w-4 shrink-0 text-brand" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{v.title}</span>
                <span className="text-xs text-muted-foreground">
                  {Math.floor(v.seconds / 60)}:{String(v.seconds % 60).padStart(2, "0")}
                </span>
              </li>
            ))}
            {relatedLinks.map((l) => (
              <li key={l.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <Link2 className="h-4 w-4 shrink-0 text-brand" />
                <a href={l.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-sm font-medium hover:text-brand">
                  {l.title}
                </a>
              </li>
            ))}
          </LinkedPanel>
        </TabsContent>

        <TabsContent value="related" className="mt-4 grid gap-4 md:grid-cols-3">
          {relatedPapers.map((p) => (
            <Link key={p.id} to="/papers/$id" params={{ id: p.id }}>
              <Panel className="h-full p-4 transition-colors hover:border-brand/40">
                <StatusPill status={p.status} />
                <p className="mt-2 line-clamp-3 text-sm font-medium leading-snug">{p.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.authors} · {p.year}
                </p>
              </Panel>
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="discussion" className="mt-4">
          <Panel className="p-6">
            <ThreadView entityId={paper.id} entityType="paper" />
          </Panel>
        </TabsContent>

        <TabsContent value="chat" className="mt-4">
          <Panel className="p-6">
            {paperChat ? (
              <PaperChatView conversationId={paperChat.id} />
            ) : (
              <div className="text-center py-10 text-muted-foreground text-sm">
                Setting up paper chat room...
              </div>
            )}
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ k, v }: { k: string; v: number }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}

function PaperChatView({ conversationId }: { conversationId: string }) {
  const ws = useWorkspace();
  const chatMessages = ws.messages.filter((m) => m.conversation_id === conversationId && !m.deleted_at);
  const typingList = ws.typingStates[conversationId] || {};
  const typingMembers = Object.keys(typingList)
    .filter((mId) => typingList[mId] && mId !== ws.currentUser?.id)
    .map((mId) => ws.members.find((m) => m.id === mId)?.name || "Someone");

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async (data: any) => {
    await ws.addMessage({
      conversation_id: conversationId,
      sender_id: ws.currentUser?.id || "m1",
      message_type: data.type,
      content: data.content,
      url: data.attachment?.url,
      storage_path: data.attachment?.storage_path,
      mime_type: data.attachment?.mime_type,
      size_bytes: data.attachment?.size_bytes,
    });
    ws.broadcastTyping(conversationId, false);
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
        {chatMessages.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground/60 text-sm border border-dashed border-border rounded-xl">
            Welcome to the Paper Chat Room! Send a message to start collaborating.
          </div>
        ) : (
          chatMessages.map((msg) => {
            const sender = ws.members.find((m) => m.id === msg.sender_id) || {
              name: "Researcher",
              initials: "R",
              color: "#6b7280",
              role: "Member",
            };
            const isOwn = ws.currentUser && ws.currentUser.id === msg.sender_id;
            return (
              <div key={msg.id} className={`flex items-start gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}>
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs uppercase border shrink-0 shadow-sm"
                  style={{
                    backgroundColor: `${sender.color}15`,
                    color: sender.color,
                    borderColor: `${sender.color}35`,
                  }}
                >
                  {sender.initials}
                </div>
                <div className={`flex flex-col max-w-[70%] ${isOwn ? "items-end" : ""}`}>
                  <div className="flex items-center gap-1.5 mb-1 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{sender.name}</span>
                    <span>•</span>
                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${
                    isOwn ? "bg-brand text-brand-foreground rounded-tr-none" : "bg-secondary text-foreground rounded-tl-none"
                  }`}>
                    {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                    {msg.url && (
                      <div className="mt-2 pt-2 border-t border-current/20">
                        {msg.message_type === "image" ? (
                          <img src={msg.url} alt="Shared" className="rounded-lg max-h-40 object-cover" />
                        ) : msg.message_type === "voice" ? (
                          <div className="flex items-center gap-2">
                            <PlayAudioButton url={msg.url} />
                            <span className="text-xs opacity-80">Voice Note</span>
                          </div>
                        ) : (
                          <a href={msg.url} download target="_blank" rel="noreferrer" className="flex items-center gap-1.5 underline text-xs font-semibold">
                            <Download className="h-3.5 w-3.5" /> Download attachment
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Typing indicator */}
      {typingMembers.length > 0 && (
        <p className="text-xs text-muted-foreground mb-1 italic">
          {typingMembers.join(", ")} {typingMembers.length === 1 ? "is" : "are"} typing...
        </p>
      )}

      {/* Input composer */}
      <UniversalComposer
        placeholder="Type a message to the team..."
        onSend={handleSendMessage}
        onTyping={(isTyping) => ws.broadcastTyping(conversationId, isTyping)}
      />
    </div>
  );
}

function PlayAudioButton({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(playing => !playing);
    } else {
      audioRef.current.play();
      setPlaying(playing => !playing);
    }
  };

  return (
    <button onClick={toggle} className="p-1 hover:bg-current/15 rounded text-current">
      {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
    </button>
  );
}

function LinkedPanel({
  title,
  icon,
  empty,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  empty: string;
  children: React.ReactNode;
}) {
  const has = Array.isArray(children) ? children.flat().length > 0 : Boolean(children);
  return (
    <Panel className="p-5">
      <h3 className="font-display flex items-center gap-2 text-sm font-semibold">
        {icon} {title}
      </h3>
      {has ? <ul className="mt-3 space-y-2">{children}</ul> : <p className="mt-3 text-sm text-muted-foreground">{empty}</p>}
    </Panel>
  );
}

function AnalysisSection({ paperId, section, value }: { paperId: string; section: string; value: string }) {
  const ws = useWorkspace();
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);
  const dirty = draft !== value;

  return (
    <Panel className="p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{section}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => toast.info(`Comment thread on "${section}"`, { description: "Team comments open in the side panel." })}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
            aria-label="Comment"
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </button>
          {editing ? (
            <Button
              size="sm"
              variant={dirty ? "default" : "ghost"}
              onClick={() => {
                ws.setAnalysis(paperId, section, draft);
                setEditing(false);
                toast.success(`${section} saved`);
              }}
            >
              <Save className="mr-1 h-3.5 w-3.5" /> Save
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </div>
      {editing ? (
        <Textarea
          autoFocus
          rows={5}
          className="mt-2"
          value={draft}
          maxLength={4000}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Write the ${section.toLowerCase()}…`}
        />
      ) : (
        <p className={`mt-2 whitespace-pre-wrap text-sm leading-relaxed ${draft ? "text-foreground/90" : "text-muted-foreground"}`}>
          {draft || "Empty — click Edit to contribute this section."}
        </p>
      )}
    </Panel>
  );
}

function EditPaperDialog({ paper, trigger }: { paper: Paper; trigger: ReactNode }) {
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(paper.title);
  const [authors, setAuthors] = useState(paper.authors);
  const [venue, setVenue] = useState(paper.venue);
  const [year, setYear] = useState(paper.year);
  const [abstract, setAbstract] = useState(paper.abstract);
  const [category, setCategory] = useState(paper.category);
  const [status, setStatus] = useState<Paper["status"]>(paper.status);
  const [url, setUrl] = useState(paper.url);
  const [doi, setDoi] = useState(paper.doi || "");
  const [keywords, setKeywords] = useState(paper.keywords.join(", "));

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Paper title is required");
      return;
    }
    const keywordsList = keywords.split(",").map((k) => k.trim()).filter(Boolean);
    ws.updatePaper(paper.id, {
      title: title.trim(),
      authors: authors.trim(),
      venue: venue.trim(),
      year: Number(year) || new Date().getFullYear(),
      abstract: abstract.trim(),
      category: category.trim(),
      status,
      url: url.trim(),
      doi: doi.trim(),
      keywords: keywordsList,
    });
    toast.success("Paper details updated successfully");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Paper Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Paper Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Authors</Label>
            <Input value={authors} onChange={(e) => setAuthors(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Venue (Journal/Conference)</Label>
              <Input value={venue} onChange={(e) => setVenue(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Year</Label>
              <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Status</Label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as Paper["status"])}
                className="w-full h-10 px-3 border border-border rounded-xl bg-card text-sm cursor-pointer"
              >
                <option value="To Read">To Read</option>
                <option value="Reading">Reading</option>
                <option value="Analyzing">Analyzing</option>
                <option value="Completed">Completed</option>
                <option value="Important">Important</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Abstract</Label>
            <Textarea rows={4} value={abstract} onChange={(e) => setAbstract(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">DOI</Label>
              <Input value={doi} onChange={(e) => setDoi(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Keywords (comma separated)</Label>
            <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="cursor-pointer">Cancel</Button>
          <Button onClick={handleSave} className="cursor-pointer">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}