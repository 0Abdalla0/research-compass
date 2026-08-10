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
  const [papers, setPapers] = useState<Paper[]>(seed.papers);
  const [tasks, setTasks] = useState<Task[]>(seed.tasks);
  const [notes, setNotes] = useState<Note[]>(seed.notes);
  const [shots, setShots] = useState<Shot[]>(seed.shots);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>(seed.voiceNotes);
  const [files, setFiles] = useState<ResearchFile[]>(seed.files);
  const [links, setLinks] = useState<ResourceLink[]>(seed.links);
  const [meetings, setMeetings] = useState<Meeting[]>(seed.meetings);
  const [events, setEvents] = useState<CalEvent[]>(seed.events);
  const [activity, setActivity] = useState<Activity[]>(seed.activity);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const currentUser = seed.members[0]!;

  const log = useCallback(
    (action: string, object: string, kind: Activity["kind"]) => {
      setActivity((a) => [
        { id: uid(), memberId: currentUser.id, action, object, time: "just now", kind },
        ...a,
      ]);
    },
    [currentUser.id],
  );

  const today = () => new Date().toISOString().slice(0, 10);

  const value = useMemo<Ctx>(
    () => ({
      members: seed.members,
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
      currentUser,
      member: (id?: string) => seed.members.find((m) => m.id === id),
      addPaper: (p) => {
        setPapers((prev) => [{ ...p, id: uid(), progress: 0, analysis: {} }, ...prev]);
        log("added a paper", p.title, "paper");
      },
      updatePaper: (id, patch) =>
        setPapers((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
      setAnalysis: (paperId, section, val) =>
        setPapers((prev) =>
          prev.map((p) =>
            p.id === paperId ? { ...p, analysis: { ...p.analysis, [section]: val } } : p,
          ),
        ),
      addTask: (t) => {
        setTasks((prev) => [{ ...t, id: uid(), comments: 0, attachments: 0, checklist: [] }, ...prev]);
        log("created a task", t.title, "task");
      },
      moveTask: (id, status) =>
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t))),
      updateTask: (id, patch) =>
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
      toggleCheck: (taskId, index) =>
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checklist: t.checklist.map((c, i) => (i === index ? { ...c, done: !c.done } : c)),
                }
              : t,
          ),
        ),
      addNote: (n) => {
        setNotes((prev) => [{ ...n, id: uid(), updated: today() }, ...prev]);
        log("created a note", n.title, "note");
      },
      updateNote: (id, patch) =>
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch, updated: today() } : n))),
      addShot: (s) => {
        setShots((prev) => [{ ...s, id: uid(), date: today(), comments: [] }, ...prev]);
        log("added a screenshot", s.title, "image");
      },
      commentShot: (id, text) =>
        setShots((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, comments: [...s.comments, { author: currentUser.name, text }] } : s,
          ),
        ),
      addVoiceNote: (v) => {
        setVoiceNotes((prev) => [{ ...v, id: uid(), date: today() }, ...prev]);
        log("added a voice note", v.title, "voice");
      },
      removeVoiceNote: (id) => setVoiceNotes((prev) => prev.filter((v) => v.id !== id)),
      renameVoiceNote: (id, title) =>
        setVoiceNotes((prev) => prev.map((v) => (v.id === id ? { ...v, title } : v))),
      addFile: (f) => {
        setFiles((prev) => [{ ...f, id: uid(), date: today() }, ...prev]);
        log("uploaded", f.name, "file");
      },
      removeFile: (id) => setFiles((prev) => prev.filter((f) => f.id !== id)),
      addLink: (l) => {
        setLinks((prev) => [{ ...l, id: uid() }, ...prev]);
        log("added a link", l.title, "file");
      },
      addEvent: (e) => {
        setEvents((prev) => [...prev, { ...e, id: uid() }]);
        log("scheduled", e.title, "task");
      },
      updateEvent: (id, patch) =>
        setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e))),
      removeEvent: (id) => setEvents((prev) => prev.filter((e) => e.id !== id)),
      addMeeting: (m) => {
        setMeetings((prev) => [{ ...m, id: uid() }, ...prev]);
        log("scheduled a meeting", m.title, "task");
      },
      updateMeeting: (id, patch) =>
        setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m))),
      theme,
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
    }),
    [papers, tasks, notes, shots, voiceNotes, files, links, meetings, events, activity, theme, currentUser, log],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}