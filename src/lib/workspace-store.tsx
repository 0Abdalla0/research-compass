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
} from "@/lib/db-server";

const uid = () => Math.random().toString(36).slice(2, 9);

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
  phases: typeof seed.phases;
  activity: Activity[];
  currentUser: (typeof seed.members)[number];
  member: (id?: string) => (typeof seed.members)[number] | undefined;
  loginUser: (m: (typeof seed.members)[number]) => void;
  logoutUser: () => void;
  registerUser: (name: string, email: string, role: string) => void;
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
  addEvent: (e: Omit<CalEvent, "id">) => void;
  updateEvent: (id: string, patch: Partial<CalEvent>) => void;
  removeEvent: (id: string) => void;
  addMeeting: (m: Omit<Meeting, "id">) => void;
  updateMeeting: (id: string, patch: Partial<Meeting>) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
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
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [currentUser, setCurrentUser] = useState<(typeof seed.members)[number] | null>(null);

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

  // Load from database on mount
  useEffect(() => {
    getWorkspaceDataServer()
      .then((data) => {
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
      })
      .catch((err) => console.error("Error loading initial DB workspace data:", err));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

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
      phases: seed.phases,
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
      registerUser: (name, email, role) => {
        const initials = name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        const color = Math.floor(Math.random() * 360).toString();
        const id = "m_" + uid();
        const newUser = {
          id,
          name,
          initials,
          role: role as any,
          email,
          responsibilities: "Newly registered researcher",
          color,
        };
        setMembers((prev) => [...prev, newUser]);
        setCurrentUser(newUser);
        localStorage.setItem("research_hub_user", JSON.stringify(newUser));
        log("joined the research team", name, "comment");
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
      addShot: (s) => {
        const id = uid();
        const newShot = { ...s, id, date: today(), comments: [] };
        setShots((prev) => [newShot, ...prev]);
        addShotServer({ data: newShot }).catch((err) =>
          console.error("Error saving screenshot to DB:", err),
        );
        log("added a screenshot", s.title, "image");
      },
      commentShot: (id, text) => {
        const author = currentUser ? currentUser.name : "Researcher";
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
      addVoiceNote: (v) => {
        const id = uid();
        const newVoiceNote = { ...v, id, date: today() };
        setVoiceNotes((prev) => [newVoiceNote, ...prev]);
        addVoiceNoteServer({ data: newVoiceNote }).catch((err) =>
          console.error("Error saving voice note to DB:", err),
        );
        log("added a voice note", v.title, "voice");
      },
      removeVoiceNote: (id) => {
        setVoiceNotes((prev) => prev.filter((v) => v.id !== id));
        removeVoiceNoteServer({ data: id }).catch((err) =>
          console.error("Error deleting voice note in DB:", err),
        );
      },
      renameVoiceNote: (id, title) => {
        setVoiceNotes((prev) => prev.map((v) => (v.id === id ? { ...v, title } : v)));
        renameVoiceNoteServer({ data: { id, title } }).catch((err) =>
          console.error("Error renaming voice note in DB:", err),
        );
      },
      addFile: (f) => {
        const id = uid();
        const newFile = { ...f, id, date: today() };
        setFiles((prev) => [newFile, ...prev]);
        addFileServer({ data: newFile }).catch((err) => console.error("Error saving file to DB:", err));
        log("uploaded", f.name, "file");
      },
      removeFile: (id) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        removeFileServer({ data: id }).catch((err) => console.error("Error deleting file in DB:", err));
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
      theme,
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
    }),
    [members, papers, tasks, notes, shots, voiceNotes, files, links, meetings, events, activity, theme, currentUser, log],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}