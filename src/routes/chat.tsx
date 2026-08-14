import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Search, MessageSquare, Plus, Hash, User, Paperclip, Play, Pause, Download, Send, SearchCode, X, BookOpen, AlertCircle } from "lucide-react";
import { useWorkspace } from "@/lib/workspace-store";
import { PageHeader, Panel, Initials } from "@/components/ui-bits";
import { UniversalComposer } from "@/components/universal-composer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Team Communication Center — ResearchHub" },
      {
        name: "description",
        content: "Collaborative, real-time team chat and direct messaging for researchers.",
      },
    ],
  }),
});

export default function ChatPage() {
  const ws = useWorkspace();
  const searchParams = Route.useSearch() as { conv?: string; msg?: string };
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Set active conversation from URL query parameter if present
  useEffect(() => {
    if (searchParams.conv) {
      setActiveConvId(searchParams.conv);
    } else if (ws.conversations.length > 0 && !activeConvId) {
      setActiveConvId(ws.conversations[0]?.id || null);
    }
  }, [searchParams.conv, ws.conversations]);

  // Handle URL message parameter highlight
  useEffect(() => {
    if (searchParams.msg) {
      setHighlightedMsgId(searchParams.msg);
      const timer = setTimeout(() => {
        setHighlightedMsgId(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [searchParams.msg]);

  // Auto scroll to bottom or scroll to specific message if targeted
  const activeMessages = ws.messages.filter((m) => m.conversation_id === activeConvId && !m.deleted_at);
  useEffect(() => {
    if (searchParams.msg) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`msg-${searchParams.msg}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
      return () => clearTimeout(timer);
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    return undefined;
  }, [activeMessages, searchParams.msg]);

  const activeConv = ws.conversations.find((c) => c.id === activeConvId);

  // Typing indicators
  const typingList = activeConvId ? ws.typingStates[activeConvId] || {} : {};
  const typingMembers = Object.keys(typingList)
    .filter((mId) => typingList[mId] && mId !== ws.currentUser?.id)
    .map((mId) => ws.members.find((m) => m.id === mId)?.name || "Someone");

  // Create general channel and project rooms if they don't exist yet
  useEffect(() => {
    if (ws.currentUser && ws.members.length > 0 && ws.conversations.length === 0) {
      // Auto-create General Research Team conversation
      ws.addConversation(
        "General Research Team",
        true,
        ws.members.map((m) => m.id)
      ).catch((err) => console.error(err));
    }
  }, [ws.currentUser, ws.members, ws.conversations]);

  // Start new DM conversation
  const handleStartDM = async (memberId: string) => {
    if (!ws.currentUser) {
      toast.error("You must be logged in to chat");
      return;
    }
    try {
      const convId = await ws.addConversation(
        undefined,
        false,
        [ws.currentUser.id, memberId]
      );
      setActiveConvId(convId);
      toast.success("Chat room opened");
    } catch (err) {
      console.error(err);
      toast.error("Failed to start DM");
    }
  };

  const handleSendMessage = async (data: any) => {
    if (!activeConvId || !ws.currentUser) return;
    await ws.addMessage({
      conversation_id: activeConvId,
      sender_id: ws.currentUser.id,
      message_type: data.type,
      content: data.content,
      url: data.attachment?.url,
      storage_path: data.attachment?.storage_path,
      mime_type: data.attachment?.mime_type,
      size_bytes: data.attachment?.size_bytes,
    });
    ws.broadcastTyping(activeConvId, false);
  };

  // Chat message search
  const allFilteredMessages = ws.messages
    .filter((m) => !m.deleted_at && m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    .map((msg) => {
      const conv = ws.conversations.find((c) => c.id === msg.conversation_id);
      const sender = ws.members.find((m) => m.id === msg.sender_id);
      return { msg, conv, sender };
    })
    .filter((x) => x.conv); // make sure conversation exists

  // Group conversations into sidebar categories
  const channels = ws.conversations.filter(
    (c) => c.is_group && !c.paper_id && !c.phase_id && c.name?.toLowerCase().includes(sidebarSearch.toLowerCase())
  );
  const paperChats = ws.conversations.filter(
    (c) => c.paper_id && c.name?.toLowerCase().includes(sidebarSearch.toLowerCase())
  );
  const directMessages = ws.conversations.filter((c) => {
    if (c.is_group) return false;
    // Get DM participant details
    const members = ws.conversationMembers.filter((cm) => cm.conversation_id === c.id);
    const otherMemberId = members.find((cm) => cm.member_id !== ws.currentUser?.id)?.member_id;
    const otherMember = ws.members.find((m) => m.id === otherMemberId);
    return otherMember?.name.toLowerCase().includes(sidebarSearch.toLowerCase());
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageHeader
        title="Team Communication Center"
        subtitle="Discuss papers, projects, tasks, and connect with other team members in real-time."
      />

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 mt-6 flex-1 min-h-0">
        {/* Left Sidebar */}
        <Panel className="p-4 flex flex-col min-h-0 bg-card/65 backdrop-blur-md border-border/80">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
            <Input
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              placeholder="Search chat rooms..."
              className="pl-9"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            {/* Direct Messages Section */}
            <div>
              <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between">
                <span>Direct Messages</span>
              </p>
              <div className="space-y-0.5">
                {ws.members
                  .filter((m) => m.id !== ws.currentUser?.id)
                  .map((member) => {
                    const isOnline = !!ws.onlineMembers[member.id];
                    return (
                      <button
                        key={member.id}
                        onClick={() => handleStartDM(member.id)}
                        className="w-full text-left px-2 py-1.5 rounded-xl text-xs hover:bg-secondary flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="relative">
                            <Initials member={member} size={22} />
                            <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-card ${
                              isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
                            }`} />
                          </div>
                          <span className="font-medium truncate">{member.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground opacity-75">{member.role}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Channels Section */}
            <div>
              <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Channels</p>
              <div className="space-y-0.5">
                {channels.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 transition-colors ${
                      c.id === activeConvId ? "bg-brand text-brand-foreground font-semibold" : "hover:bg-secondary"
                    }`}
                  >
                    <Hash className="h-4 w-4 shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Paper Chats Section */}
            <div>
              <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Paper Chats</p>
              <div className="space-y-0.5">
                {paperChats.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 transition-colors ${
                      c.id === activeConvId ? "bg-brand text-brand-foreground font-semibold" : "hover:bg-secondary"
                    }`}
                  >
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        {/* Right Active Chat View */}
        <Panel className="p-4 flex flex-col min-h-0 bg-card/65 backdrop-blur-md border-border/80 relative">
          {/* Header & In-conversation Search Bar */}
          <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
            <div>
              <h2 className="font-display font-semibold text-base leading-none">
                {activeConv?.name || (() => {
                  const cm = ws.conversationMembers.filter((x) => x.conversation_id === activeConvId);
                  const otherId = cm.find((x) => x.member_id !== ws.currentUser?.id)?.member_id;
                  const other = ws.members.find((m) => m.id === otherId);
                  return other ? `Direct Message with ${other.name}` : "Chat Workspace";
                })()}
              </h2>
              {activeConv?.paper_id && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  Discussion tied directly to Research Paper
                </p>
              )}
            </div>

            {/* Msg search block */}
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground/60" />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(e.target.value.length > 0);
                  }}
                  placeholder="Search in messages..."
                  className="h-8 pl-8 text-xs w-48"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setShowSearchResults(false);
                    }}
                    className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Search Results overlay pane */}
          {showSearchResults ? (
            <div className="absolute inset-x-4 top-16 bottom-4 bg-popover text-popover-foreground rounded-xl border border-border/80 shadow-2xl p-4 overflow-y-auto z-40 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-semibold text-sm">Search Results ({allFilteredMessages.length})</h3>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearchResults(false);
                  }}
                  className="p-1 hover:bg-secondary rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                {allFilteredMessages.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    No matching messages found.
                  </div>
                ) : (
                  allFilteredMessages.map(({ msg, conv, sender }) => (
                    <button
                      key={msg.id}
                      onClick={() => {
                        setActiveConvId(msg.conversation_id);
                        setShowSearchResults(false);
                        setSearchQuery("");
                      }}
                      className="w-full text-left p-3 rounded-xl border hover:bg-muted flex flex-col gap-1 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{sender?.name || "Researcher"}</span>
                        <span>{conv?.name || "Private DM"}</span>
                      </div>
                      <p className="text-xs text-foreground/90 mt-1 line-clamp-2">{msg.content}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {/* Chat Messages Log */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
            {activeMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground/60">
                <MessageSquare className="h-10 w-10 mb-2 opacity-50 text-brand" />
                <p className="text-sm font-semibold">No messages in this chat yet</p>
                <p className="text-xs">Send a text, file, or voice message below to start collaborating!</p>
              </div>
            ) : (
              activeMessages.map((msg) => {
                const sender = ws.members.find((m) => m.id === msg.sender_id) || {
                  name: "Researcher",
                  initials: "R",
                  color: "#6b7280",
                  role: "Member",
                };
                const isOwn = ws.currentUser && ws.currentUser.id === msg.sender_id;
                const isHighlighted = msg.id === highlightedMsgId;
                return (
                  <div
                    key={msg.id}
                    id={`msg-${msg.id}`}
                    className={`flex items-start gap-2.5 ${isOwn ? "flex-row-reverse" : ""} transition-all duration-500 ${
                      isHighlighted ? "bg-amber-500/15 dark:bg-amber-500/25 border-l-4 border-amber-500 p-2 rounded-xl" : ""
                    }`}
                  >
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
                              <img src={msg.url} alt="Shared Image" className="rounded-lg max-h-48 object-cover" />
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

          {/* Typing Indicator */}
          {typingMembers.length > 0 && (
            <p className="text-xs text-muted-foreground mb-1 italic">
              {typingMembers.join(", ")} {typingMembers.length === 1 ? "is" : "are"} typing...
            </p>
          )}

          {/* Input composer */}
          {activeConvId ? (
            <UniversalComposer
              placeholder="Type a message to the team..."
              onSend={handleSendMessage}
              onTyping={(isTyping) => ws.broadcastTyping(activeConvId, isTyping)}
            />
          ) : (
            <div className="bg-destructive/15 border border-destructive/20 text-destructive rounded-xl p-3 flex items-center gap-2 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Select or open a chat room to send a message.
            </div>
          )}
        </Panel>
      </div>
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
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <button onClick={toggle} className="p-1 hover:bg-current/15 rounded text-current">
      {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
    </button>
  );
}
