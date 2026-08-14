import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as seed from "@/data/workspace";
import { removeStorageObject } from "@/lib/uploads";
import type {
  Activity,
  CalEvent,
  Meeting,
  Note,
  Paper,
  ResearchFile,
  ResourceLink,
  Shot,
  Task,
  TaskStatus,
  VoiceNote,
  Phase,
  Comment,
  Conversation,
  ConversationMember,
  Message,
  DbNotification,
} from "@/data/workspace";
import {
  getWorkspaceDataServer,
  addPaperServer,
  updatePaperServer,
  setAnalysisServer,
  addTaskServer,
  moveTaskServer,
  updateTaskServer,
  toggleCheckServer,
  addNoteServer,
  updateNoteServer,
  addShotServer,
  commentShotServer,
  addVoiceNoteServer,
  removeVoiceNoteServer,
  renameVoiceNoteServer,
  addFileServer,
  removeFileServer,
  addLinkServer,
  addEventServer,
  updateEventServer,
  removeEventServer,
  addMeetingServer,
  updateMeetingServer,
  addActivityServer,
  removePaperServer,
  removeTaskServer,
  removeNoteServer,
  removeShotServer,
  removeLinkServer,
  removeMeetingServer,
  updateLinkServer,
  addPhaseServer,
  updatePhaseServer,
  removePhaseServer,
  addCommentServer,
  updateCommentServer,
  removeCommentServer,
  addConversationServer,
  addConversationMembersServer,
  addMessageServer,
  updateMessageServer,
  removeMessageServer,
  addNotificationServer,
  markNotificationReadServer,
  clearNotificationsServer,
} from "@/lib/db-server";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export type Preferences = {
  onlyLeadersDelete: boolean;
  membersInvite: boolean;
  emailReminders: boolean;
};

import { supabase, hasSupabaseKeys } from "./supabase";

const uid = () => Math.random().toString(36).slice(2, 9);

function cleanOptional<T extends object>(obj: T): any {
  const result = { ...obj } as any;
  Object.keys(result).forEach((key) => {
    if (result[key] === undefined || result[key] === null) {
      delete result[key];
    }
  });
  return result;
}

type Ctx = {
  members: typeof seed.members;
  papers: Paper[];
  tasks: Task[];
  notes: Note[];
  shots: Shot[];
  voiceNotes: VoiceNote[];
  files: ResearchFile[];
  links: ResourceLink[];
  meetings: Meeting[];
  events: CalEvent[];
  phases: Phase[];
  activity: Activity[];
  currentUser: (typeof seed.members)[number];
  member: (id?: string) => (typeof seed.members)[number] | undefined;
  loginUser: (m: (typeof seed.members)[number]) => void;
  logoutUser: () => void;
  registerUser: (
    name: string,
    email: string,
    role: string,
    password?: string,
    uniId?: string,
    phone?: string,
    uniEmail?: string,
    cv?: string,
    privateEmail?: string,
    cv_storage_path?: string,
    cv_mime_type?: string,
    cv_size_bytes?: number
  ) => void;
  addPaper: (p: Omit<Paper, "id" | "analysis" | "progress">) => void;
  updatePaper: (id: string, patch: Partial<Paper>) => void;
  setAnalysis: (paperId: string, section: string, value: string) => void;
  addTask: (t: Omit<Task, "id" | "comments" | "attachments" | "checklist">) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleCheck: (taskId: string, index: number) => void;
  addNote: (n: Omit<Note, "id" | "updated">) => void;
  updateNote: (id: string, patch: Partial<Note>) => void;
  addShot: (s: Omit<Shot, "id" | "date" | "comments">) => void;
  commentShot: (id: string, text: string) => void;
  addVoiceNote: (v: Omit<VoiceNote, "id" | "date">) => void;
  removeVoiceNote: (id: string) => void;
  renameVoiceNote: (id: string, title: string) => void;
  addFile: (f: Omit<ResearchFile, "id" | "date">) => void;
  removeFile: (id: string) => void;
  addLink: (l: Omit<ResourceLink, "id">) => void;
  updateLink: (id: string, patch: Partial<ResourceLink>) => void;
  addEvent: (e: Omit<CalEvent, "id">) => void;
  updateEvent: (id: string, patch: Partial<CalEvent>) => void;
  removeEvent: (id: string) => void;
  addMeeting: (m: Omit<Meeting, "id">) => void;
  updateMeeting: (id: string, patch: Partial<Meeting>) => void;
  addPhase: (p: Omit<Phase, "id">) => void;
  updatePhase: (id: string, patch: Partial<Phase>) => void;
  removePhase: (id: string) => void;
  project: typeof seed.project;
  updateProject: (name: string, topic: string, institution: string) => void;
  removePaper: (id: string) => void;
  removeTask: (id: string) => void;
  removeNote: (id: string) => void;
  removeShot: (id: string) => void;
  removeLink: (id: string) => void;
  removeMeeting: (id: string) => void;
  preferences: Preferences;
  updatePreference: (key: keyof Preferences, val: boolean) => void;
  notifications: NotificationItem[];
  clearNotifications: () => void;
  markNotificationRead: (id: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  comments: Comment[];
  addComment: (c: Omit<Comment, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateComment: (id: string, content: string) => Promise<void>;
  removeComment: (id: string) => Promise<void>;
  conversations: Conversation[];
  conversationMembers: ConversationMember[];
  addConversation: (name: string | undefined, is_group: boolean, memberIds: string[], paperId?: string, phaseId?: string) => Promise<string>;
  messages: Message[];
  addMessage: (m: Omit<Message, "id" | "created_at" | "updated_at" | "deleted_at">) => Promise<void>;
  updateMessage: (id: string, content: string) => Promise<void>;
  removeMessage: (id: string) => Promise<void>;
  addNotification: (userId: string, type: string, title: string, description: string, link?: string) => Promise<void>;
  onlineMembers: Record<string, { online_at: string; name: string }>;
  typingStates: Record<string, Record<string, boolean>>;
  broadcastTyping: (conversationId: string, isTyping: boolean) => void;
};

const WorkspaceContext = createContext<Ctx | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<typeof seed.members>(seed.members);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [files, setFiles] = useState<ResearchFile[]>([]);
  const [links, setLinks] = useState<ResourceLink[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [phases, setPhases] = useState<Phase[]>(seed.phases);
  const [comments, setComments] = useState<Comment[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationMembers, setConversationMembers] = useState<ConversationMember[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineMembers, setOnlineMembers] = useState<Record<string, { online_at: string; name: string }>>({});
  const [typingStates, setTypingStates] = useState<Record<string, Record<string, boolean>>>({});
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [currentUser, setCurrentUser] = useState<(typeof seed.members)[number] | null>(null);
  const [project, setProject] = useState<typeof seed.project>(seed.project);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({
    onlyLeadersDelete: false,
    membersInvite: true,
    emailReminders: true,
  });

  // Load preferences, notifications, and project details on mount
  useEffect(() => {
    const savedProject = localStorage.getItem("research_hub_project");
    if (savedProject) {
      try {
        setProject(JSON.parse(savedProject));
      } catch (e) {
        console.error("Failed to load project details:", e);
      }
    }

    const savedPrefs = localStorage.getItem("research_hub_preferences");
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (e) {
        console.error("Failed to load preferences:", e);
      }
    }

    const savedNotifs = localStorage.getItem("research_hub_notifications");
    if (savedNotifs) {
      try {
        setNotifications(JSON.parse(savedNotifs));
      } catch (e) {
        setNotifications(seed.notifications);
      }
    } else {
      setNotifications(seed.notifications);
    }
  }, []);

  // Save notifications to localStorage when changed
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem("research_hub_notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  // Load user session on mount
  useEffect(() => {
    const saved = localStorage.getItem("research_hub_user");
    if (saved) {
      try {
        const user = JSON.parse(saved);
        setCurrentUser(user);
        // Make sure if user was dynamically registered, they exist in our list
        setMembers((prev) => {
          if (!prev.some((m) => m.id === user.id)) {
            return [...prev, user];
          }
          return prev;
        });
      } catch {
        setCurrentUser(null);
      }
    }
  }, []);

  // Helper to format timestamps dynamically
  const formatTimeAgo = (dateStr: string): string => {
    try {
      const elapsed = Date.now() - new Date(dateStr).getTime();
      const secs = Math.floor(elapsed / 1000);
      if (secs < 60) return "just now";
      const mins = Math.floor(secs / 60);
      if (mins < 60) return `${mins} m`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} h`;
      const days = Math.floor(hours / 24);
      return `${days} d`;
    } catch {
      return "just now";
    }
  };

  // Load from database on mount
  useEffect(() => {
    getWorkspaceDataServer()
      .then((data) => {
        if (data.members && data.members.length > 0) {
          setMembers(data.members);
        }
        setPapers(data.papers);
        setTasks(data.tasks);
        setNotes(data.notes);
        setShots(data.shots);
        setVoiceNotes(data.voiceNotes);
        setFiles(data.files);
        setLinks(data.links);
        setMeetings(data.meetings);
        setEvents(data.events);
        setActivity(data.activity);
        if (data.phases && data.phases.length > 0) {
          setPhases(data.phases);
        }
        setComments(data.comments || []);
        setConversations(data.conversations || []);
        setConversationMembers(data.conversationMembers || []);
        setMessages(data.messages || []);
        
        // Map database-backed notifications to the UI's NotificationItem format
        if (data.notifications) {
          const mapped = data.notifications.map((n: DbNotification) => ({
            id: n.id,
            title: n.title,
            body: n.description,
            time: formatTimeAgo(n.created_at),
            unread: !n.is_read,
            link: n.link,
          }));
          setNotifications(mapped);
        }
      })
      .catch((err) => console.error("Error loading initial DB workspace data:", err));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Broadcast typing status
  const broadcastTyping = (conversationId: string, isTyping: boolean) => {
    if (!hasSupabaseKeys || !currentUser) return;
    supabase.channel("room-presence").send({
      type: "broadcast",
      event: "typing",
      payload: { conversationId, memberId: currentUser.id, isTyping },
    });
  };

  // Realtime subscription
  useEffect(() => {
    if (!hasSupabaseKeys) return;

    // 1. Subscribe to DB updates
    const dbChannel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setComments((prev) => {
              if (prev.some((x) => x.id === payload.new.id)) return prev;
              return [...prev, payload.new as Comment];
            });
          } else if (payload.eventType === "UPDATE") {
            setComments((prev) =>
              prev.map((c) => (c.id === payload.new.id ? (payload.new as Comment) : c))
            );
          } else if (payload.eventType === "DELETE") {
            setComments((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setConversations((prev) => {
              if (prev.some((x) => x.id === payload.new.id)) return prev;
              return [payload.new as Conversation, ...prev];
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversation_members" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setConversationMembers((prev) => {
              if (prev.some((x) => x.conversation_id === payload.new.conversation_id && x.member_id === payload.new.member_id)) return prev;
              return [...prev, payload.new as ConversationMember];
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => {
              if (prev.some((x) => x.id === payload.new.id)) return prev;
              return [...prev, payload.new as Message];
            });
          } else if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((m) => (m.id === payload.new.id ? (payload.new as Message) : m))
            );
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            const n = payload.new as DbNotification;
            if (n.user_id === (currentUser?.id || "m1")) {
              setNotifications((prev) => {
                if (prev.some((x) => x.id === n.id)) return prev;
                return [
                  {
                    id: n.id,
                    title: n.title,
                    body: n.description,
                    time: "just now",
                    unread: !n.is_read,
                    link: n.link,
                  },
                  ...prev,
                ];
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const n = payload.new as DbNotification;
            if (n.user_id === (currentUser?.id || "m1")) {
              setNotifications((prev) =>
                prev.map((x) => (x.id === n.id ? { ...x, unread: !n.is_read } : x))
              );
            }
          } else if (payload.eventType === "DELETE") {
            setNotifications([]);
          }
        }
      )
      .subscribe();

    // 2. Subscribe to Presence and broadcasted typing indicators
    const presenceChannel = supabase.channel("room-presence", {
      config: {
        presence: {
          key: currentUser?.id || "anonymous",
        },
      },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const formatted: Record<string, { online_at: string; name: string }> = {};
        Object.keys(state).forEach((key) => {
          const userPresences = state[key];
          if (userPresences && userPresences[0]) {
            formatted[key] = {
              online_at: (userPresences[0] as any).online_at || new Date().toISOString(),
              name: (userPresences[0] as any).name || "Member",
            };
          }
        });
        setOnlineMembers(formatted);
      })
      .on("broadcast", { event: "typing" }, (payload: any) => {
        const { conversationId, memberId, isTyping } = payload.payload;
        setTypingStates((prev) => ({
          ...prev,
          [conversationId]: {
            ...(prev[conversationId] || {}),
            [memberId]: isTyping,
          },
        }));
      })
      .subscribe(async (status: any) => {
        if (status === "SUBSCRIBED" && currentUser) {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
            name: currentUser.name,
          });
        }
      });

    return () => {
      supabase.removeChannel(dbChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [currentUser]);

  const log = useCallback(
    (action: string, object: string, kind: Activity["kind"]) => {
      const actId = uid();
      const memberId = currentUser ? currentUser.id : "m1";
      const newActivity = { id: actId, memberId, action, object, time: "just now", kind };
      setActivity((a) => [newActivity, ...a]);
      addActivityServer({ data: newActivity }).catch((err) =>
        console.error("Error logging activity to DB:", err),
      );
    },
    [currentUser],
  );

  const addNotification = useCallback(
    async (userId: string, type: string, title: string, description: string, link?: string) => {
      const notifId = uid();
      const newDbNotif = {
        id: notifId,
        user_id: userId,
        type,
        title,
        description,
        is_read: false,
        link: link || undefined,
        created_at: new Date().toISOString(),
      };

      if (userId === (currentUser?.id || "m1")) {
        setNotifications((prev) => [
          {
            id: notifId,
            title,
            body: description,
            time: "just now",
            unread: true,
            link: link || undefined,
          },
          ...prev,
        ]);
      }
      try {
        await addNotificationServer({ data: newDbNotif });
      } catch (err) {
        console.error("Failed to add notification:", err);
      }
    },
    [currentUser]
  );

  const today = () => new Date().toISOString().slice(0, 10);

  const value = useMemo<Ctx>(
    () => ({
      members,
      papers,
      tasks,
      notes,
      shots,
      voiceNotes,
      files,
      links,
      meetings,
      events,
      phases,
      activity,
      currentUser: currentUser as any,
      member: (id?: string) => members.find((m) => m.id === id),
      loginUser: (m) => {
        setCurrentUser(m);
        localStorage.setItem("research_hub_user", JSON.stringify(m));
        log("logged in", m.name, "comment");
      },
      logoutUser: () => {
        if (currentUser) {
          log("logged out", currentUser.name, "comment");
        }
        setCurrentUser(null);
        localStorage.removeItem("research_hub_user");
      },
      registerUser: (
        name,
        email,
        role,
        password,
        uniId,
        phone,
        uniEmail,
        cv,
        privateEmail,
        cv_storage_path,
        cv_mime_type,
        cv_size_bytes
      ) => {
        const initials = name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        const color = Math.floor(Math.random() * 360).toString();
        const id = "m_" + uid();
        const newUser = cleanOptional({
          id,
          name,
          initials,
          role: role as any,
          email,
          responsibilities: role === "Member" ? "Research team investigator" : "Research team member",
          color,
          password: password || "123456",
          uniId: uniId || undefined,
          phone: phone || undefined,
          uniEmail: uniEmail || undefined,
          cv: cv || undefined,
          privateEmail: privateEmail || undefined,
          cv_storage_path: cv_storage_path || undefined,
          cv_mime_type: cv_mime_type || undefined,
          cv_size_bytes: cv_size_bytes || undefined,
        });
        setMembers((prev) => [...prev, newUser]);
        setCurrentUser(newUser);
        localStorage.setItem("research_hub_user", JSON.stringify(newUser));
        log("joined the research team", name, "comment");

        // Insert to live DB if enabled
        if (hasSupabaseKeys) {
          (async () => {
            try {
              const { error } = await supabase.from("members").insert([newUser]);
              if (error) throw error;
            } catch (err) {
              console.error("Error inserting member to live Supabase DB:", err);
            }
          })();
        }
      },
      addPaper: (p) => {
        const id = uid();
        const newPaper = { ...p, id, progress: 0, analysis: {} };
        setPapers((prev) => [newPaper, ...prev]);
        addPaperServer({ data: newPaper }).catch((err) => console.error("Error saving paper to DB:", err));
        log("added a paper", p.title, "paper");
      },
      updatePaper: (id, patch) => {
        setPapers((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
        updatePaperServer({ data: { id, patch } }).catch((err) =>
          console.error("Error updating paper in DB:", err),
        );
      },
      setAnalysis: (paperId, section, val) => {
        setPapers((prev) =>
          prev.map((p) =>
            p.id === paperId ? { ...p, analysis: { ...p.analysis, [section]: val } } : p,
          ),
        );
        setAnalysisServer({ data: { paperId, section, value: val } }).catch((err) =>
          console.error("Error saving paper analysis section to DB:", err),
        );
      },
      addTask: (t) => {
        const id = uid();
        const newTask = { ...t, id, comments: 0, attachments: 0, checklist: [] };
        setTasks((prev) => [newTask, ...prev]);
        addTaskServer({ data: newTask }).catch((err) => console.error("Error saving task to DB:", err));
        log("created a task", t.title, "task");
      },
      moveTask: (id, status) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
        moveTaskServer({ data: { id, status } }).catch((err) =>
          console.error("Error moving task status in DB:", err),
        );
      },
      updateTask: (id, patch) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
        updateTaskServer({ data: { id, patch } }).catch((err) =>
          console.error("Error updating task in DB:", err),
        );
      },
      toggleCheck: (taskId, index) => {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checklist: t.checklist.map((c, i) => (i === index ? { ...c, done: !c.done } : c)),
                }
              : t,
          ),
        );
        toggleCheckServer({ data: { taskId, index } }).catch((err) =>
          console.error("Error toggling task checklist in DB:", err),
        );
      },
      addNote: (n) => {
        const id = uid();
        const newNote = { ...n, id, updated: today() };
        setNotes((prev) => [newNote, ...prev]);
        addNoteServer({ data: newNote }).catch((err) => console.error("Error saving note to DB:", err));
        log("created a note", n.title, "note");
      },
      updateNote: (id, patch) => {
        const updatedDate = today();
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch, updated: updatedDate } : n)));
        updateNoteServer({ data: { id, patch: { ...patch, updated: updatedDate } } }).catch((err) =>
          console.error("Error updating note in DB:", err),
        );
      },
      addShot: async (s) => {
        const id = uid();
        const newShot = { ...s, id, date: today(), comments: [] };
        setShots((prev) => [newShot, ...prev]);
        try {
          await addShotServer({ data: newShot });
          log("added a screenshot", s.title, "image");
        } catch (err) {
          console.error("Error saving screenshot to DB, rolling back and deleting storage object:", err);
          setShots((prev) => prev.filter((x) => x.id !== id));
          if (s.storage_path) {
            await removeStorageObject(s.storage_path);
          }
          throw err;
        }
      },
      commentShot: (id, text) => {
        const author = currentUser ? currentUser.name : "Member";
        const comment = { author, text };
        setShots((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, comments: [...s.comments, comment] } : s,
          ),
        );
        commentShotServer({ data: { id, comment } }).catch((err) =>
          console.error("Error adding screenshot comment to DB:", err),
        );
      },
      addVoiceNote: async (v) => {
        const id = uid();
        const newVoiceNote = { ...v, id, date: today() };
        setVoiceNotes((prev) => [newVoiceNote, ...prev]);
        try {
          await addVoiceNoteServer({ data: newVoiceNote });
          log("added a voice note", v.title, "voice");
        } catch (err) {
          console.error("Error saving voice note to DB, rolling back and deleting storage object:", err);
          setVoiceNotes((prev) => prev.filter((x) => x.id !== id));
          if (v.storage_path) {
            await removeStorageObject(v.storage_path);
          }
          throw err;
        }
      },
      removeVoiceNote: (id) => {
        const v = voiceNotes.find((x) => x.id === id);
        setVoiceNotes((prev) => prev.filter((x) => x.id !== id));
        removeVoiceNoteServer({ data: id }).catch((err) =>
          console.error("Error deleting voice note in DB:", err),
        );
        if (v && v.storage_path) {
          removeStorageObject(v.storage_path).catch((err) => console.error("Storage delete error:", err));
        }
      },
      renameVoiceNote: (id, title) => {
        setVoiceNotes((prev) => prev.map((v) => (v.id === id ? { ...v, title } : v)));
        renameVoiceNoteServer({ data: { id, title } }).catch((err) =>
          console.error("Error renaming voice note in DB:", err),
        );
      },
      addFile: async (f) => {
        const id = uid();
        const newFile = { ...f, id, date: today() };
        setFiles((prev) => [newFile, ...prev]);
        try {
          await addFileServer({ data: newFile });
          log("uploaded", f.name, "file");
        } catch (err) {
          console.error("Error saving file to DB, rolling back and deleting storage object:", err);
          setFiles((prev) => prev.filter((x) => x.id !== id));
          if (f.storage_path) {
            await removeStorageObject(f.storage_path);
          }
          throw err;
        }
      },
      removeFile: (id) => {
        const f = files.find((x) => x.id === id);
        setFiles((prev) => prev.filter((x) => x.id !== id));
        removeFileServer({ data: id }).catch((err) => console.error("Error deleting file in DB:", err));
        if (f && f.storage_path) {
          removeStorageObject(f.storage_path).catch((err) => console.error("Storage delete error:", err));
        }
      },
      addLink: (l) => {
        const id = uid();
        const newLink = { ...l, id };
        setLinks((prev) => [newLink, ...prev]);
        addLinkServer({ data: newLink }).catch((err) =>
          console.error("Error saving resource link to DB:", err),
        );
        log("added a link", l.title, "file");
      },
      updateLink: (id, patch) => {
        setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
        updateLinkServer({ data: { id, patch } }).catch((err) =>
          console.error("Error updating resource link in DB:", err),
        );
      },
      addEvent: (e) => {
        const id = uid();
        const newEvent = { ...e, id };
        setEvents((prev) => [...prev, newEvent]);
        addEventServer({ data: newEvent }).catch((err) =>
          console.error("Error saving calendar event to DB:", err),
        );
        log("scheduled", e.title, "task");
      },
      updateEvent: (id, patch) => {
        setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
        updateEventServer({ data: { id, patch } }).catch((err) =>
          console.error("Error updating calendar event in DB:", err),
        );
      },
      removeEvent: (id) => {
        setEvents((prev) => prev.filter((e) => e.id !== id));
        removeEventServer({ data: id }).catch((err) =>
          console.error("Error deleting calendar event in DB:", err),
        );
      },
      addMeeting: (m) => {
        const id = uid();
        const newMeeting = { ...m, id };
        setMeetings((prev) => [newMeeting, ...prev]);
        addMeetingServer({ data: newMeeting }).catch((err) =>
          console.error("Error saving meeting to DB:", err),
        );
        log("scheduled a meeting", m.title, "task");
      },
      updateMeeting: (id, patch) => {
        setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
        updateMeetingServer({ data: { id, patch } }).catch((err) =>
          console.error("Error updating meeting in DB:", err),
        );
      },
      addPhase: (p) => {
        const id = uid();
        const newPhase = { ...p, id };
        setPhases((prev) => [...prev, newPhase].sort((a, b) => a.index - b.index));
        addPhaseServer({ data: newPhase }).catch((err) =>
          console.error("Error saving phase to DB:", err),
        );
        log("added phase", p.name, "task");
      },
      updatePhase: (id, patch) => {
        setPhases((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)).sort((a, b) => a.index - b.index));
        updatePhaseServer({ data: { id, patch } }).catch((err) =>
          console.error("Error updating phase in DB:", err),
        );
      },
      removePhase: (id) => {
        const p = phases.find((x) => x.id === id);
        setPhases((prev) => prev.filter((x) => x.id !== id));
        removePhaseServer({ data: id }).catch((err) =>
          console.error("Error deleting phase in DB:", err),
        );
        if (p) log("deleted phase", p.name, "task");
      },
      project,
      updateProject: (name, topic, institution) => {
        const updated = { ...project, name, topic, institution };
        setProject(updated);
        localStorage.setItem("research_hub_project", JSON.stringify(updated));
        log("updated project settings", name, "task");
      },
      removePaper: (id) => {
        const p = papers.find((x) => x.id === id);
        setPapers((prev) => prev.filter((x) => x.id !== id));
        removePaperServer({ data: id }).catch((err) => console.error("Error deleting paper in DB:", err));
        if (p) {
          log("deleted paper", p.title, "paper");
          if (p.storage_path) {
            removeStorageObject(p.storage_path).catch((err) => console.error("Storage delete error:", err));
          }
        }
      },
      removeTask: (id) => {
        const t = tasks.find((x) => x.id === id);
        setTasks((prev) => prev.filter((x) => x.id !== id));
        removeTaskServer({ data: id }).catch((err) => console.error("Error deleting task in DB:", err));
        if (t) log("deleted task", t.title, "task");
      },
      removeNote: (id) => {
        const n = notes.find((x) => x.id === id);
        setNotes((prev) => prev.filter((x) => x.id !== id));
        removeNoteServer({ data: id }).catch((err) => console.error("Error deleting note in DB:", err));
        if (n) log("deleted note", n.title, "note");
      },
      removeShot: (id) => {
        const s = shots.find((x) => x.id === id);
        setShots((prev) => prev.filter((x) => x.id !== id));
        removeShotServer({ data: id }).catch((err) => console.error("Error deleting screenshot in DB:", err));
        if (s) {
          log("deleted screenshot", s.title, "image");
          if (s.storage_path) {
            removeStorageObject(s.storage_path).catch((err) => console.error("Storage delete error:", err));
          }
        }
      },
      removeLink: (id) => {
        const l = links.find((x) => x.id === id);
        setLinks((prev) => prev.filter((x) => x.id !== id));
        removeLinkServer({ data: id }).catch((err) => console.error("Error deleting link in DB:", err));
        if (l) log("deleted link", l.title, "file");
      },
      removeMeeting: (id) => {
        const m = meetings.find((x) => x.id === id);
        setMeetings((prev) => prev.filter((x) => x.id !== id));
        removeMeetingServer({ data: id }).catch((err) => console.error("Error deleting meeting in DB:", err));
        if (m) log("deleted meeting", m.title, "task");
      },
      preferences,
      updatePreference: (key, val) => {
        setPreferences((prev) => {
          const updated = { ...prev, [key]: val };
          localStorage.setItem("research_hub_preferences", JSON.stringify(updated));
          return updated;
        });
      },
      notifications,
      clearNotifications: () => {
        setNotifications([]);
        if (currentUser) {
          clearNotificationsServer({ data: currentUser.id }).catch((err) =>
            console.error("Error clearing DB notifications:", err)
          );
        }
        log("cleared all", "notifications", "comment");
      },
      markNotificationRead: (notifId) => {
        setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, unread: false } : n)));
        markNotificationReadServer({ data: { id: notifId, is_read: true } }).catch((err) =>
          console.error("Error marking notification read in DB:", err)
        );
      },
      theme,
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
      comments,
      conversations,
      conversationMembers,
      messages,
      onlineMembers,
      typingStates,
      broadcastTyping,
      addComment: async (c) => {
        const id = uid();
        const newComment: Comment = {
          ...c,
          id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setComments((prev) => [...prev, newComment]);
        try {
          await addCommentServer({ data: newComment });
          
          const mentionRegex = /@(\w+)/g;
          let match;
          while ((match = mentionRegex.exec(c.content)) !== null) {
            const username = match[1];
            if (username) {
              const matchedMember = members.find(
                (m) => m.name.toLowerCase().replace(/\s+/g, "") === username.toLowerCase()
              );
              if (matchedMember && matchedMember.id !== (currentUser?.id || "m1")) {
                await addNotification(
                  matchedMember.id,
                  "mention",
                  "Mentioned in comment",
                  `${currentUser?.name || "Someone"} mentioned you in a comment: "${c.content.slice(0, 50)}..."`,
                  c.paper_id ? `/papers/${c.paper_id}` : c.task_id ? `/tasks` : undefined
                );
              }
            }
          }
        } catch (err) {
          console.error("Failed to add comment, rolling back:", err);
          setComments((prev) => prev.filter((x) => x.id !== id));
          if (c.storage_path) {
            await removeStorageObject(c.storage_path);
          }
          throw err;
        }
      },
      updateComment: async (id, content) => {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, content, updated_at: new Date().toISOString() } : c))
        );
        try {
          await updateCommentServer({ data: { id, patch: { content, updated_at: new Date().toISOString() } } });
        } catch (err) {
          console.error("Failed to update comment:", err);
        }
      },
      removeComment: async (id) => {
        const c = comments.find((x) => x.id === id);
        setComments((prev) => prev.filter((x) => x.id !== id));
        try {
          await removeCommentServer({ data: id });
          if (c && c.storage_path) {
            await removeStorageObject(c.storage_path);
          }
        } catch (err) {
          console.error("Failed to remove comment:", err);
        }
      },
      addConversation: async (name, is_group, memberIds, paperId, phaseId) => {
        if (!is_group && memberIds.length === 2) {
          const existing = conversations.find((c) => {
            if (c.is_group) return false;
            if (c.paper_id || c.phase_id) return false;
            const cm = conversationMembers.filter((x) => x.conversation_id === c.id).map((x) => x.member_id);
            return cm.length === 2 && memberIds.every((mId) => cm.includes(mId));
          });
          if (existing) return existing.id;
        }

        const id = uid();
        const newConv = {
          id,
          name: name || undefined,
          is_group,
          paper_id: paperId || undefined,
          phase_id: phaseId || undefined,
          created_at: new Date().toISOString(),
        };

        setConversations((prev) => [newConv, ...prev]);
        const membersToAdd = memberIds.map((mId) => ({ conversation_id: id, member_id: mId }));
        setConversationMembers((prev) => [...prev, ...membersToAdd]);

        try {
          await addConversationServer({ data: newConv });
          await addConversationMembersServer({ data: membersToAdd });
          return id;
        } catch (err) {
          console.error("Failed to create conversation:", err);
          setConversations((prev) => prev.filter((c) => c.id !== id));
          setConversationMembers((prev) => prev.filter((cm) => cm.conversation_id !== id));
          throw err;
        }
      },
      addMessage: async (m) => {
        const id = uid();
        const newMessage: Message = {
          ...m,
          id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMessage]);
        try {
          await addMessageServer({ data: newMessage });

          // Send notifications to other members
          const otherMembers = conversationMembers
            .filter((cm) => cm.conversation_id === m.conversation_id && cm.member_id !== m.sender_id)
            .map((cm) => cm.member_id);

          for (const mId of otherMembers) {
            await addNotification(
              mId,
              "message",
              `New message from ${currentUser?.name || "Member"}`,
              m.message_type === "text" ? m.content : `Sent a ${m.message_type}`,
              `/chat?conv=${m.conversation_id}`
            );
          }
        } catch (err) {
          console.error("Failed to save message, rolling back:", err);
          setMessages((prev) => prev.filter((x) => x.id !== id));
          if (m.storage_path) {
            await removeStorageObject(m.storage_path);
          }
          throw err;
        }
      },
      updateMessage: async (id, content) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, content, updated_at: new Date().toISOString() } : m))
        );
        try {
          await updateMessageServer({ data: { id, patch: { content, updated_at: new Date().toISOString() } } });
        } catch (err) {
          console.error("Failed to update message:", err);
        }
      },
      removeMessage: async (id) => {
        setMessages((prev) =>
          prev.map((x) => (x.id === id ? { ...x, deleted_at: new Date().toISOString() } : x))
        );
        try {
          await removeMessageServer({ data: id });
        } catch (err) {
          console.error("Failed to soft delete message:", err);
        }
      },
      addNotification,
    }),
    [
      members,
      papers,
      tasks,
      notes,
      shots,
      voiceNotes,
      files,
      links,
      meetings,
      events,
      phases,
      activity,
      theme,
      currentUser,
      project,
      preferences,
      notifications,
      comments,
      conversations,
      conversationMembers,
      messages,
      onlineMembers,
      typingStates,
      log,
      addNotification,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}