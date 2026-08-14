import { useState, useRef } from "react";
import { Edit2, Trash2, CornerDownRight, Play, Pause, Download, FileText, Check, X } from "lucide-react";
import { useWorkspace } from "@/lib/workspace-store";
import { UniversalComposer } from "./universal-composer";
import type { Comment } from "@/data/workspace";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ThreadViewProps {
  entityId: string;
  entityType: "project" | "paper" | "task" | "note" | "file" | "shot";
}

export function ThreadView({ entityId, entityType }: ThreadViewProps) {
  const ws = useWorkspace();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const conversationId = `${entityType}_${entityId}`;
  
  // Realtime typing indicators state from workspace context
  const typingList = ws.typingStates[conversationId] || {};
  const typingMembers = Object.keys(typingList)
    .filter((mId) => typingList[mId] && mId !== ws.currentUser?.id)
    .map((mId) => ws.members.find((m) => m.id === mId)?.name || "Someone");

  // Get active comments matching the specified entity context
  const comments = ws.comments.filter((c) => {
    if (entityType === "project") return c.project_id === entityId;
    if (entityType === "paper") return c.paper_id === entityId;
    if (entityType === "task") return c.task_id === entityId;
    if (entityType === "note") return c.note_id === entityId;
    if (entityType === "file") return c.file_id === entityId;
    if (entityType === "shot") return c.shot_id === entityId;
    return false;
  });

  // Group comments into parents and replies
  const parentComments = comments.filter((c) => !c.parent_comment_id);
  const getReplies = (parentId: string) => comments.filter((c) => c.parent_comment_id === parentId);

  const handleCreateComment = async (
    data: Parameters<Parameters<typeof UniversalComposer>["0"]["onSend"]>["0"],
    parentId?: string
  ) => {
    const userId = ws.currentUser ? ws.currentUser.id : "m1";
    await ws.addComment({
      user_id: userId,
      content: data.content,
      parent_comment_id: parentId,
      project_id: entityType === "project" ? entityId : undefined,
      paper_id: entityType === "paper" ? entityId : undefined,
      task_id: entityType === "task" ? entityId : undefined,
      note_id: entityType === "note" ? entityId : undefined,
      file_id: entityType === "file" ? entityId : undefined,
      shot_id: entityType === "shot" ? entityId : undefined,
      url: data.attachment?.url,
      storage_path: data.attachment?.storage_path,
      mime_type: data.attachment?.mime_type,
      size_bytes: data.attachment?.size_bytes,
    });
    ws.broadcastTyping(conversationId, false);
    setReplyingTo(null);
  };

  const handleEditComment = async (id: string) => {
    if (!editText.trim()) return;
    await ws.updateComment(id, editText.trim());
    setEditingId(null);
    setEditText("");
    toast.success("Comment updated");
  };

  const handleDeleteComment = async (id: string) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      await ws.removeComment(id);
      toast.success("Comment deleted");
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">
      <div className="flex flex-col gap-4">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Discussion ({comments.length})
        </h3>

        {/* Primary Comment Composer */}
        <UniversalComposer
          placeholder="Join the discussion..."
          onSend={(data) => handleCreateComment(data)}
          onTyping={(isTyping) => ws.broadcastTyping(conversationId, isTyping)}
        />

        {/* Typing indicator */}
        {typingMembers.length > 0 && (
          <p className="text-xs text-muted-foreground italic px-1 animate-pulse">
            {typingMembers.join(", ")} {typingMembers.length === 1 ? "is" : "are"} typing...
          </p>
        )}
      </div>

      {/* Render Comment Cards */}
      <div className="flex flex-col gap-4 mt-2">
        {parentComments.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-xl text-muted-foreground/60 text-sm">
            No comments yet. Be the first to start the conversation!
          </div>
        ) : (
          parentComments.map((comment) => (
            <div key={comment.id} className="flex flex-col gap-3">
              <CommentCard
                comment={comment}
                currentUser={ws.currentUser}
                members={ws.members}
                onReply={() => setReplyingTo(comment.id)}
                onEdit={() => {
                  setEditingId(comment.id);
                  setEditText(comment.content);
                }}
                onDelete={() => handleDeleteComment(comment.id)}
                isEditing={editingId === comment.id}
                editText={editText}
                setEditText={setEditText}
                onSaveEdit={() => handleEditComment(comment.id)}
                onCancelEdit={() => setEditingId(null)}
              />

              {/* Replying Input Composer */}
              {replyingTo === comment.id && (
                <div className="ml-10 border-l border-border/80 pl-4 py-1 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Replying to thread</span>
                    <button onClick={() => setReplyingTo(null)} className="hover:text-foreground">
                      Cancel
                    </button>
                  </div>
                  <UniversalComposer
                    placeholder="Write a reply..."
                    onSend={(data) => handleCreateComment(data, comment.id)}
                  />
                </div>
              )}

              {/* Reply Sub-threads */}
              {getReplies(comment.id).map((reply) => (
                <div key={reply.id} className="ml-8 md:ml-10 flex gap-2">
                  <CornerDownRight className="h-4 w-4 text-muted-foreground/45 shrink-0 mt-3" />
                  <div className="flex-1">
                    <CommentCard
                      comment={reply}
                      currentUser={ws.currentUser}
                      members={ws.members}
                      onReply={() => setReplyingTo(comment.id)} // reply adds to same thread parent
                      onEdit={() => {
                        setEditingId(reply.id);
                        setEditText(reply.content);
                      }}
                      onDelete={() => handleDeleteComment(reply.id)}
                      isEditing={editingId === reply.id}
                      editText={editText}
                      setEditText={setEditText}
                      onSaveEdit={() => handleEditComment(reply.id)}
                      onCancelEdit={() => setEditingId(null)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Inner CommentCard Component
function CommentCard({
  comment,
  currentUser,
  members,
  onReply,
  onEdit,
  onDelete,
  isEditing,
  editText,
  setEditText,
  onSaveEdit,
  onCancelEdit,
}: {
  comment: Comment;
  currentUser: any;
  members: any[];
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isEditing: boolean;
  editText: string;
  setEditText: (t: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}) {
  const author = members.find((m) => m.id === comment.user_id) || {
    name: "Unknown Researcher",
    initials: "?",
    color: "#6b7280",
    role: "Member",
  };

  const isOwn = currentUser && currentUser.id === comment.user_id;
  const isEdited = new Date(comment.updated_at).getTime() > new Date(comment.created_at).getTime() + 1000;

  // Format creation timestamp
  const displayTime = () => {
    try {
      const date = new Date(comment.created_at);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };

  // Highlights @mentions in HTML
  const formatContent = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("@")) {
        const username = part.slice(1);
        const exists = members.some(
          (m) => m.name.toLowerCase().replace(/\s+/g, "") === username.toLowerCase()
        );
        if (exists) {
          return (
            <span key={idx} className="font-semibold text-brand bg-brand/10 rounded px-1.5 py-0.5">
              {part}
            </span>
          );
        }
      }
      return part;
    });
  };

  return (
    <div className="border border-border/60 bg-card/65 backdrop-blur-md rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs uppercase border shadow-sm shrink-0"
            style={{
              backgroundColor: `${author.color}15`,
              color: author.color,
              borderColor: `${author.color}35`,
            }}
          >
            {author.initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground leading-none">{author.name}</span>
              <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded font-medium">
                {author.role}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">{displayTime()}</span>
          </div>
        </div>

        {/* Comment Action Links */}
        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={onReply}
              className="text-[11px] font-medium text-brand hover:underline px-1.5 py-1 rounded"
            >
              Reply
            </button>
            {isOwn && (
              <>
                <button
                  onClick={onEdit}
                  className="text-[11px] text-muted-foreground hover:text-foreground p-1 rounded"
                  title="Edit Comment"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onDelete}
                  className="text-[11px] text-muted-foreground hover:text-destructive p-1 rounded"
                  title="Delete Comment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Comment Text/Editor */}
      <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap pl-1">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              rows={3}
            />
            <div className="flex justify-end gap-1.5">
              <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={onCancelEdit}>
                <X className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="default" className="h-7 w-7 bg-brand text-brand-foreground" onClick={onSaveEdit}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <p>{formatContent(comment.content)}</p>
        )}
      </div>

      {/* Render Attachments */}
      {comment.url && !isEditing && (
        <div className="border border-border/50 rounded-lg p-2.5 bg-muted/40 max-w-sm mt-1">
          <AttachmentPlayer
            url={comment.url}
            mimeType={comment.mime_type || "application/octet-stream"}
            size={comment.size_bytes}
          />
        </div>
      )}

      {/* Edited tag */}
      {isEdited && !isEditing && (
        <span className="text-[9px] text-muted-foreground italic mt-0.5 select-none self-end">
          edited
        </span>
      )}
    </div>
  );
}

// Inner Audio/File attachment view component
function AttachmentPlayer({ url, mimeType, size }: { url: string; mimeType: string; size?: number | undefined }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    return `(${(bytes / 1024 / 1024).toFixed(2)} MB)`;
  };

  const handleAudioPlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const isAudio = mimeType.startsWith("audio/");
  const isImage = mimeType.startsWith("image/");

  if (isAudio) {
    return (
      <div className="flex items-center gap-3">
        <Button size="icon" variant="outline" className="h-8 w-8 text-brand shrink-0" onClick={handleAudioPlay}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">Voice Message Attachment</p>
          <p className="text-[10px] text-muted-foreground font-mono">Click to play audio {formatSize(size)}</p>
        </div>
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="flex flex-col gap-1.5">
        <img src={url} alt="Attachment" className="max-h-48 object-cover rounded-md border border-border shadow-sm" />
        <a
          href={url}
          download
          target="_blank"
          rel="noreferrer"
          className="text-[10px] text-brand hover:underline flex items-center gap-1 font-semibold"
        >
          <Download className="h-3 w-3" /> View full image {formatSize(size)}
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 bg-secondary/80 rounded-lg flex items-center justify-center text-muted-foreground shrink-0 border">
        <FileText className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">Document Attachment</p>
        <p className="text-[10px] text-muted-foreground truncate font-mono">{formatSize(size)}</p>
      </div>
      <a href={url} download target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-brand p-1.5 hover:bg-secondary rounded-lg">
        <Download className="h-4 w-4" />
      </a>
    </div>
  );
}
