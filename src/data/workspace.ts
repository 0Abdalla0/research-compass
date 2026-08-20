export type Role =
  | "Member"
  | "Supervisor"
  | "Team Leader";

export type Member = {
  id: string;
  name: string;
  initials: string;
  role: Role;
  email: string;
  responsibilities: string;
  color: string;
  password?: string | undefined;
  uniId?: string | undefined;
  phone?: string | undefined;
  uniEmail?: string | undefined;
  cv?: string | undefined;
  privateEmail?: string | undefined;
  githubUsername?: string | undefined;
  linkedinUrl?: string | undefined;
  cv_storage_path?: string | undefined;
  cv_mime_type?: string | undefined;
  cv_size_bytes?: number | undefined;
};

export type PaperStatus = "To Read" | "Reading" | "Analyzing" | "Completed" | "Important" | "Rejected";

export type Paper = {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  doi: string;
  url: string;
  category: string;
  keywords: string[];
  abstract: string;
  status: PaperStatus;
  ownerId: string;
  progress: number;
  analysis: Record<string, string>;
  storage_path?: string | undefined;
  mime_type?: string | undefined;
  size_bytes?: number | undefined;
};

export type TaskStatus = "backlog" | "todo" | "progress" | "review" | "done";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string;
  due: string;
  labels: string[];
  checklist: { text: string; done: boolean }[];
  paperId?: string | undefined;
  phaseId?: string | undefined;
  comments: number;
  attachments: number;
};

export type Note = {
  id: string;
  title: string;
  type: "Research" | "Meeting" | "Idea" | "Literature Review" | "Experiment" | "Brainstorm";
  authorId: string;
  updated: string;
  tags: string[];
  body: string;
  paperId?: string | undefined;
  taskId?: string | undefined;
};

export type Shot = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  source: string;
  uploadedBy: string;
  date: string;
  paperId?: string | undefined;
  hue: number;
  comments: { author: string; text: string }[];
  url?: string | undefined;
  storage_path?: string | undefined;
  mime_type?: string | undefined;
  size_bytes?: number | undefined;
};

export type VoiceNote = {
  id: string;
  title: string;
  seconds: number;
  authorId: string;
  date: string;
  description: string;
  paperId?: string | undefined;
  taskId?: string | undefined;
  meetingId?: string | undefined;
  url?: string | undefined;
  storage_path?: string | undefined;
  mime_type?: string | undefined;
  size_bytes?: number | undefined;
};

export type ResearchFile = {
  id: string;
  name: string;
  ext: string;
  folder: string;
  size: string;
  uploadedBy: string;
  date: string;
  url?: string | undefined;
  storage_path?: string | undefined;
  mime_type?: string | undefined;
  size_bytes?: number | undefined;
  paperId?: string | undefined;
};

export type ResourceLink = {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  addedBy: string;
  paperId?: string | undefined;
};

export type Meeting = {
  id: string;
  title: string;
  date: string;
  time: string;
  participants: string[];
  agenda: string[];
  decisions: string[];
  actionItems: { text: string; ownerId: string }[];
  notes: string;
  link?: string;
};

export type EventKind = "meeting" | "deadline" | "milestone" | "personal";
export type CalEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  kind: EventKind;
  description: string;
  attendees: string[];
};

export type Comment = {
  id: string;
  user_id: string;
  project_id?: string | undefined;
  paper_id?: string | undefined;
  task_id?: string | undefined;
  note_id?: string | undefined;
  file_id?: string | undefined;
  shot_id?: string | undefined;
  parent_comment_id?: string | undefined;
  content: string;
  url?: string | undefined;
  storage_path?: string | undefined;
  mime_type?: string | undefined;
  size_bytes?: number | undefined;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  name?: string | undefined;
  is_group: boolean;
  paper_id?: string | undefined;
  task_id?: string | undefined;
  phase_id?: string | undefined;
  created_at: string;
};

export type ConversationMember = {
  conversation_id: string;
  member_id: string;
};

export type MessageType = "text" | "voice" | "image" | "file" | "link" | "system";

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: MessageType;
  content: string;
  reply_to_message_id?: string | undefined;
  url?: string | undefined;
  storage_path?: string | undefined;
  mime_type?: string | undefined;
  size_bytes?: number | undefined;
  created_at: string;
  updated_at: string;
  deleted_at?: string | undefined;
};

export type DbNotification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  is_read: boolean;
  link?: string | undefined;
  created_at: string;
};

export type DeliverableItem = {
  text: string;
  done: boolean;
};

export type Phase = {
  id: string;
  index: number;
  name: string;
  start: string;
  end: string;
  progress: number;
  members: string[];
  deliverables: (string | DeliverableItem)[];
  details?: string;
};

export type Activity = {
  id: string;
  memberId: string;
  action: string;
  object: string;
  time: string;
  kind: "paper" | "task" | "note" | "file" | "voice" | "image" | "comment";
};

export const project = {
  name: "New Research Project",
  topic: "Clinical Research",
  institution: "Research Institution",
  phase: "Phase 1",
  progress: 0,
};

export const members: Member[] = [];
export const papers: Paper[] = [];

export const ANALYSIS_SECTIONS = [
  "Research Problem",
  "Research Question",
  "Proposed Solution",
  "Methodology",
  "Dataset",
  "Machine Learning / AI Models",
  "Evaluation Metrics",
  "Results",
  "Limitations",
  "Advantages",
  "Disadvantages",
  "What We Can Use",
  "What We Can Improve",
  "Research Gap",
  "Important Quotes",
  "References",
];

export const TASK_COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "To Do" },
  { id: "progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Completed" },
];

export const LABELS = [
  "Research",
  "Development",
  "Dataset",
  "Paper",
  "Meeting",
  "Documentation",
  "Presentation",
  "Testing",
];

export const tasks: Task[] = [];
export const notes: Note[] = [];
export const shots: Shot[] = [];
export const voiceNotes: VoiceNote[] = [];
export const files: ResearchFile[] = [];
export const links: ResourceLink[] = [];
export const meetings: Meeting[] = [];
export const events: CalEvent[] = [];
export const phases: Phase[] = [];
export const activity: Activity[] = [];

export const progressSeries = [
  { week: "W1", papers: 0, tasks: 0, progress: 0 },
];

export const notifications: any[] = [];