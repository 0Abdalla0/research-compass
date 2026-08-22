import { createServerFn } from "@tanstack/react-start";
import { db, hasFirebaseKeys } from "./firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  runTransaction, 
  writeBatch 
} from "firebase/firestore";
import * as seed from "@/data/workspace";
import { sendEmailNotification } from "./mailer";
import type {
  Activity,
  CalEvent,
  EventKind,
  Meeting,
  Note,
  Paper,
  PaperStatus,
  Priority,
  ResearchFile,
  ResourceLink,
  Shot,
  Task,
  TaskStatus,
  VoiceNote,
  Member,
  Phase,
  Comment,
  Conversation,
  ConversationMember,
  Message,
  DbNotification,
} from "@/data/workspace";

const hasSupabaseKeys = hasFirebaseKeys;

function cleanOptional<T extends object>(obj: T): any {
  const result = { ...obj } as any;
  Object.keys(result).forEach((key) => {
    if (result[key] === undefined || result[key] === null) {
      delete result[key];
    }
  });
  return result;
}

const getFirestoreCollection = async (name: string, orderField?: string, direction: "asc" | "desc" = "asc") => {
  try {
    const colRef = collection(db, name);
    let q = query(colRef);
    if (orderField) {
      q = query(colRef, orderBy(orderField, direction));
    }
    const snap = await getDocs(q);
    return snap.docs.map((docVal) => ({ id: docVal.id, ...docVal.data() } as any));
  } catch (e) {
    console.error(`Firebase error reading collection [${name}]:`, e);
    return [];
  }
};

const firestoreInsert = async (colName: string, data: any) => {
  const id = data.id || doc(collection(db, colName)).id;
  const docRef = doc(db, colName, id);
  const cleaned = cleanOptional({ ...data, id });
  await setDoc(docRef, cleaned);
  return { id, ...data };
};

const firestoreUpdate = async (colName: string, id: string, patch: any) => {
  const docRef = doc(db, colName, id);
  await updateDoc(docRef, cleanOptional(patch));
};

const firestoreDelete = async (colName: string, id: string) => {
  const docRef = doc(db, colName, id);
  await deleteDoc(docRef);
};

async function deleteCollection(collectionName: string) {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    batch.delete(doc(db, collectionName, d.id));
  });
  await batch.commit();
}

export const getWorkspaceDataServer = createServerFn({ method: "GET" })
  .handler(async () => {
    if (!hasSupabaseKeys) {
      console.info("Offline mode: Reading static workspace seed data.");
      return {
        project: seed.project,
        members: seed.members,
        papers: seed.papers,
        tasks: seed.tasks,
        notes: seed.notes,
        shots: seed.shots,
        voiceNotes: seed.voiceNotes,
        files: seed.files,
        links: seed.links,
        meetings: seed.meetings,
        events: seed.events,
        activity: seed.activity,
        phases: seed.phases,
        comments: [],
        conversations: [],
        conversationMembers: [],
        messages: [],
        notifications: [],
      };
    }

    try {
      const [
        projectRes,
        membersRes,
        papersRes,
        tasksRes,
        notesRes,
        shotsRes,
        voiceNotesRes,
        filesRes,
        linksRes,
        meetingsRes,
        eventsRes,
        activityRes,
        phasesRes,
        commentsRes,
        conversationsRes,
        conversationMembersRes,
        messagesRes,
        notificationsRes,
      ] = await Promise.all([
        getFirestoreCollection("project"),
        getFirestoreCollection("members"),
        getFirestoreCollection("papers", "created_at", "desc"),
        getFirestoreCollection("tasks", "created_at", "desc"),
        getFirestoreCollection("notes", "updated_at", "desc"),
        getFirestoreCollection("shots", "created_at", "desc"),
        getFirestoreCollection("voiceNotes", "created_at", "desc"),
        getFirestoreCollection("files", "created_at", "desc"),
        getFirestoreCollection("links", "created_at", "desc"),
        getFirestoreCollection("meetings", "created_at", "desc"),
        getFirestoreCollection("events", "date", "asc"),
        getFirestoreCollection("activity"),
        getFirestoreCollection("phases", "index", "asc"),
        getFirestoreCollection("comments", "created_at", "asc"),
        getFirestoreCollection("conversations", "created_at", "desc"),
        getFirestoreCollection("conversation_members"),
        getFirestoreCollection("messages", "created_at", "asc"),
        getFirestoreCollection("notifications", "created_at", "desc"),
      ]);

      let projectData = projectRes[0] || null;
      let members = membersRes;
      const papers = papersRes;
      const tasks = tasksRes;
      const notes = notesRes;
      const shots = shotsRes;
      const voiceNotes = voiceNotesRes;
      const files = filesRes;
      const links = linksRes;
      const meetings = meetingsRes;
      const events = eventsRes;
      const activity = activityRes;
      let phases = phasesRes;
      const comments = commentsRes;
      const conversations = conversationsRes;
      const conversationMembers = conversationMembersRes;
      const messages = messagesRes;
      const notifications = notificationsRes;

      // Auto-seed members if empty
      if (hasSupabaseKeys && members.length === 0) {
        try {
          const membersToInsert = seed.members.map((m) => ({
            id: m.id,
            name: m.name,
            initials: m.initials,
            role: m.role,
            email: m.email,
            responsibilities: m.responsibilities,
            color: m.color,
            password: m.password || "123456"
          }));
          for (const m of membersToInsert) {
            await firestoreInsert("members", m);
          }
          members = membersToInsert;
        } catch (err) {
          console.error("Failed to auto-seed members:", err);
        }
      }

      // Auto-seed phases if empty
      if (hasSupabaseKeys && phases.length === 0) {
        try {
          const phasesToInsert = seed.phases.map((p) => ({
            id: p.id,
            index: p.index,
            name: p.name,
            start: p.start,
            end: p.end,
            progress: p.progress,
            deliverables: p.deliverables,
            members: p.members,
          }));
          for (const p of phasesToInsert) {
            await firestoreInsert("phases", p);
          }
          phases = phasesToInsert;
        } catch (err) {
          console.error("Failed to auto-seed phases:", err);
        }
      }

      // Auto-seed project if empty
      if (hasSupabaseKeys && !projectData) {
        try {
          projectData = await firestoreInsert("project", { id: "default", ...seed.project });
        } catch (err) {
          console.error("Failed to auto-seed project:", err);
        }
      }

      const formattedMembers: Member[] = members.map((m: any) => cleanOptional({
        ...m,
        password: m.password ?? undefined,
        uniId: m.uniId ?? undefined,
        phone: m.phone ?? undefined,
        uniEmail: m.uniEmail ?? undefined,
        cv: m.cv ?? undefined,
        privateEmail: m.privateEmail ?? undefined,
        githubUsername: m.githubUsername ?? undefined,
        linkedinUrl: m.linkedinUrl ?? undefined,
      }));

      const formattedPapers: Paper[] = papers.map((p: any) => ({
        ...p,
        status: p.status as PaperStatus,
        keywords: p.keywords || [],
        analysis: p.analysis || {},
      }));

      const formattedTasks: Task[] = tasks.map((t: any) => cleanOptional({
        ...t,
        status: t.status as TaskStatus,
        priority: t.priority as Priority,
        labels: t.labels || [],
        checklist: t.checklist || [],
        paperId: t.paperId ?? undefined,
        phaseId: t.phaseId ?? undefined,
      }));

      const formattedNotes: Note[] = notes.map((n: any) => cleanOptional({
        ...n,
        type: n.type as Note["type"],
        tags: n.tags || [],
        paperId: n.paperId ?? undefined,
        taskId: n.taskId ?? undefined,
      }));

      const formattedShots: Shot[] = shots.map((s: any) => cleanOptional({
        ...s,
        tags: s.tags || [],
        comments: s.comments || [],
        paperId: s.paperId ?? undefined,
        url: s.url || undefined,
      }));

      const formattedVoiceNotes: VoiceNote[] = voiceNotes.map((v: any) => cleanOptional({
        ...v,
        paperId: v.paperId ?? undefined,
        taskId: v.taskId ?? undefined,
        meetingId: v.meetingId ?? undefined,
        url: v.url || undefined,
      }));

      const formattedLinks: ResourceLink[] = links.map((l: any) => cleanOptional({
        ...l,
        tags: l.tags || [],
        paperId: l.paperId ?? undefined,
      }));

      const formattedMeetings: Meeting[] = meetings.map((m: any) => ({
        ...m,
        participants: m.participants || [],
        agenda: m.agenda || [],
        decisions: m.decisions || [],
        actionItems: m.actionItems || [],
      }));

      const formattedEvents: CalEvent[] = events.map((e: any) => ({
        ...e,
        kind: e.kind as EventKind,
        attendees: e.attendees || [],
      }));

      const formattedActivity: Activity[] = activity
        .map((a: any) => {
          let timeVal = a.time;
          if (timeVal && !timeVal.includes("T") && !timeVal.includes("-") && a.created_at) {
            timeVal = a.created_at;
          }
          return {
            ...a,
            time: timeVal,
            kind: a.kind as Activity["kind"],
          };
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(a.time).getTime();
          const dateB = new Date(b.time).getTime();
          if (!isNaN(dateA) && !isNaN(dateB)) {
            return dateB - dateA;
          }
          const catA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const catB = b.created_at ? new Date(b.created_at).getTime() : 0;
          if (catA && catB) {
            return catB - catA;
          }
          return b.id.localeCompare(a.id);
        });

      const formattedPhases: Phase[] = phases
        .map((p: any) => ({
          ...p,
          deliverables: p.deliverables || [],
          members: p.members || [],
        }))
        .sort((a: any, b: any) => a.index - b.index);

      return {
        members: formattedMembers,
        papers: formattedPapers,
        tasks: formattedTasks,
        notes: formattedNotes,
        shots: formattedShots,
        voiceNotes: formattedVoiceNotes,
        files: files.map((f: any) => cleanOptional({
          ...f,
          paperId: f.paperId ?? undefined,
          url: f.url || undefined,
        })) as ResearchFile[],
        project: projectData || seed.project,
        links: formattedLinks,
        meetings: formattedMeetings,
        events: formattedEvents,
        activity: formattedActivity,
        phases: formattedPhases,
        comments: comments as Comment[],
        conversations: conversations as Conversation[],
        conversationMembers: conversationMembers as ConversationMember[],
        messages: messages as Message[],
        notifications: notifications as DbNotification[],
      };
    } catch (e) {
      console.error("Firebase load failed, returning static mock data:", e);
      return {
        members: seed.members,
        papers: seed.papers,
        tasks: seed.tasks,
        notes: seed.notes,
        shots: seed.shots,
        voiceNotes: seed.voiceNotes,
        files: seed.files,
        links: seed.links,
        meetings: seed.meetings,
        events: seed.events,
        activity: seed.activity,
        phases: seed.phases,
        comments: [],
        conversations: [],
        conversationMembers: [],
        messages: [],
        notifications: [],
      };
    }
  });

export const addPaperServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      return await firestoreInsert("papers", data);
    } catch (e) {
      console.error("Firebase insert paper error:", e);
      throw e;
    }
  });

export const updatePaperServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreUpdate("papers", data.id, data.patch);
    } catch (e) {
      console.error("Firebase update paper error:", e);
    }
  });

export const setAnalysisServer = createServerFn({ method: "POST" })
  .validator((d: { paperId: string; section: string; value: string }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      const docRef = doc(db, "papers", data.paperId);
      await updateDoc(docRef, {
        [`analysis.${data.section}`]: data.value
      });
    } catch (e) {
      console.error("Firebase setAnalysis error:", e);
    }
  });

export const addTaskServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      return await firestoreInsert("tasks", data);
    } catch (e) {
      console.error("Firebase insert task error:", e);
      return data;
    }
  });

export const moveTaskServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; status: string }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreUpdate("tasks", data.id, { status: data.status });
    } catch (e) {
      console.error("Firebase moveTask error:", e);
    }
  });

export const updateTaskServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreUpdate("tasks", data.id, data.patch);
    } catch (e) {
      console.error("Firebase updateTask error:", e);
    }
  });

export const toggleCheckServer = createServerFn({ method: "POST" })
  .validator((d: { taskId: string; index: number }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await runTransaction(db, async (transaction) => {
        const taskRef = doc(db, "tasks", data.taskId);
        const taskDoc = await transaction.get(taskRef);
        if (taskDoc.exists()) {
          const taskData = taskDoc.data() as { checklist?: any[] };
          const checklist = [...(taskData?.checklist || [])];
          if (checklist[data.index]) {
            checklist[data.index].done = !checklist[data.index].done;
            transaction.update(taskRef, { checklist });
          }
        }
      });
    } catch (e) {
      console.error("Firebase toggleCheck error:", e);
    }
  });

export const addNoteServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      return await firestoreInsert("notes", data);
    } catch (e) {
      console.error("Firebase addNote error:", e);
      return data;
    }
  });

export const updateNoteServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreUpdate("notes", data.id, data.patch);
    } catch (e) {
      console.error("Firebase updateNote error:", e);
    }
  });

export const addShotServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      return await firestoreInsert("shots", data);
    } catch (e) {
      console.error("Firebase addShot error:", e);
      return data;
    }
  });

export const addVoiceNoteServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      return await firestoreInsert("voiceNotes", data);
    } catch (e) {
      console.error("Firebase addVoiceNote error:", e);
      return data;
    }
  });

export const addFileServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      return await firestoreInsert("files", data);
    } catch (e) {
      console.error("Firebase addFile error:", e);
      return data;
    }
  });

export const addLinkServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      return await firestoreInsert("links", data);
    } catch (e) {
      console.error("Firebase addLink error:", e);
      return data;
    }
  });

export const addMeetingServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      return await firestoreInsert("meetings", data);
    } catch (e) {
      console.error("Firebase addMeeting error:", e);
      return data;
    }
  });

export const addEventServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      return await firestoreInsert("events", data);
    } catch (e) {
      console.error("Firebase addEvent error:", e);
      return data;
    }
  });

export const addActivityServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      return await firestoreInsert("activity", data);
    } catch (e) {
      console.error("Firebase addActivity error:", e);
      return data;
    }
  });

export const updateProjectServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreUpdate("project", "default", data);
    } catch (e) {
      console.error("Firebase updateProject error:", e);
    }
  });

export const removePaperServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreDelete("papers", data);
    } catch (e) {
      console.error("Firebase removePaper error:", e);
    }
  });

export const removeTaskServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreDelete("tasks", data);
    } catch (e) {
      console.error("Firebase removeTask error:", e);
    }
  });

export const removeNoteServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreDelete("notes", data);
    } catch (e) {
      console.error("Firebase removeNote error:", e);
    }
  });

export const removeShotServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreDelete("shots", data);
    } catch (e) {
      console.error("Firebase removeShot error:", e);
    }
  });

export const removeFileServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreDelete("files", data);
    } catch (e) {
      console.error("Firebase removeFile error:", e);
    }
  });

export const removeLinkServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreDelete("links", data);
    } catch (e) {
      console.error("Firebase removeLink error:", e);
    }
  });

export const removeMeetingServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreDelete("meetings", data);
    } catch (e) {
      console.error("Firebase removeMeeting error:", e);
    }
  });

export const updateLinkServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreUpdate("links", data.id, data.patch);
    } catch (e) {
      console.error("Firebase updateLink error:", e);
    }
  });

export const updateMeetingServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreUpdate("meetings", data.id, data.patch);
    } catch (e) {
      console.error("Firebase updateMeeting error:", e);
    }
  });

export const addPhaseServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      return await firestoreInsert("phases", data);
    } catch (e) {
      console.error("Firebase addPhase error:", e);
      return data;
    }
  });

export const updatePhaseServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreUpdate("phases", data.id, data.patch);
    } catch (e) {
      console.error("Firebase updatePhase error:", e);
    }
  });

export const removePhaseServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreDelete("phases", data);
    } catch (e) {
      console.error("Firebase removePhase error:", e);
    }
  });

export const addCommentServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      return await firestoreInsert("comments", data);
    } catch (e) {
      console.error("Firebase addComment error:", e);
      return data;
    }
  });

export const updateCommentServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreUpdate("comments", data.id, data.patch);
    } catch (e) {
      console.error("Firebase updateComment error:", e);
    }
  });

export const removeCommentServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreDelete("comments", data);
    } catch (e) {
      console.error("Firebase removeComment error:", e);
    }
  });

export const addConversationServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      return await firestoreInsert("conversations", data);
    } catch (e) {
      console.error("Firebase addConversation error:", e);
      return data;
    }
  });

export const createConversationServer = addConversationServer;

export const addConversationMembersServer = createServerFn({ method: "POST" })
  .validator((d: any[]) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      for (const m of data) {
        await firestoreInsert("conversation_members", m);
      }
    } catch (e) {
      console.error("Firebase addConversationMembers error:", e);
    }
  });

export const updateConversationServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreUpdate("conversations", data.id, data.patch);
    } catch (e) {
      console.error("Firebase updateConversation error:", e);
    }
  });

export const removeConversationServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreDelete("conversations", data);
    } catch (e) {
      console.error("Firebase removeConversation error:", e);
    }
  });

export const addMessageServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      return await firestoreInsert("messages", data);
    } catch (e) {
      console.error("Firebase addMessage error:", e);
      return data;
    }
  });

export const sendMessageServer = addMessageServer;

export const updateMessageServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreUpdate("messages", data.id, data.patch);
    } catch (e) {
      console.error("Firebase updateMessage error:", e);
    }
  });

export const removeMessageServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreUpdate("messages", data, { deleted_at: new Date().toISOString() });
    } catch (e) {
      console.error("Firebase removeMessage error:", e);
    }
  });

export const addNotificationServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      const payload = data as { user_id: string; type: string; description: string };
      const saved = await firestoreInsert("notifications", payload);
      
      // Dispatch email notification in background
      try {
        const { data: memberData } = await firestoreInsert("members", { id: payload.user_id });
        if (memberData && (memberData as any).email) {
          sendEmailNotification((memberData as any).email, payload.type, payload.description)
            .then(() => console.log(`Dispatched notification email to ${(memberData as any).email}`))
            .catch((mailErr) => console.error("SMTP/Resend notification dispatch error:", mailErr));
        }
      } catch (mailLookupErr) {
        console.warn("Could not retrieve notification recipient email:", mailLookupErr);
      }

      return saved;
    } catch (e) {
      console.error("Firebase addNotification error:", e);
      return data;
    }
  });

export const markNotificationReadServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; is_read: boolean }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreUpdate("notifications", data.id, { is_read: data.is_read });
    } catch (e) {
      console.error("Firebase markNotificationRead error:", e);
    }
  });

export const clearNotificationsServer = createServerFn({ method: "POST" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    if (!hasSupabaseKeys) return;
    try {
      const colRef = collection(db, "notifications");
      const snap = await getDocs(colRef);
      const batch = writeBatch(db);
      snap.docs.forEach((d) => {
        const docData = d.data() as { user_id?: string };
        if (docData && docData.user_id === userId) {
          batch.delete(d.ref);
        }
      });
      await batch.commit();
    } catch (e) {
      console.error("Firebase clearNotifications error:", e);
    }
  });

export const clearAllWorkspaceDataServer = createServerFn({ method: "POST" })
  .handler(async () => {
    if (!hasSupabaseKeys) return { success: true };
    try {
      const collections = [
        "files", "links", "meetings", "events", "phase_members", "phases", 
        "members", "project", "papers", "tasks", "notes", "shots", "voiceNotes", 
        "activity", "comments", "conversations", "conversation_members", "messages", "notifications"
      ];
      for (const col of collections) {
        await deleteCollection(col);
      }

      // Re-seed default project
      await setDoc(doc(db, "project", "default"), cleanOptional(seed.project));

      // Re-seed default members
      for (const m of seed.members) {
        await setDoc(doc(db, "members", m.id), cleanOptional({
          ...m,
          password: m.password || "123456"
        }));
      }

      // Re-seed default phases
      for (const p of seed.phases) {
        await setDoc(doc(db, "phases", p.id), cleanOptional({
          ...p,
          deliverables: p.deliverables,
          members: p.members
        }));
      }

      return { success: true };
    } catch (e) {
      console.error("Firebase clearAllWorkspaceData error:", e);
      throw e;
    }
  });

export const sendTestEmailServer = createServerFn({ method: "POST" })
  .validator((toEmail: string) => toEmail)
  .handler(async ({ data: toEmail }) => {
    try {
      await sendEmailNotification(
        toEmail,
        "Test Email from Research Compass",
        "Hello! This is a test email sent from the Research Compass workspace to verify that your email integration (Gemini, Resend, and/or SMTP) is configured and working correctly."
      );
      return { success: true };
    } catch (e: any) {
      console.error("Test email failed:", e);
      return { success: false, error: e.message || String(e) };
    }
  });

export const commentShotServer = createServerFn({ method: "POST" })
  .validator((d: { shotId: string; comment: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await runTransaction(db, async (transaction) => {
        const shotRef = doc(db, "shots", data.shotId);
        const shotDoc = await transaction.get(shotRef);
        if (shotDoc.exists()) {
          const comments = [...((shotDoc.data() as any).comments || [])];
          comments.push(data.comment);
          transaction.update(shotRef, { comments });
        }
      });
    } catch (e) {
      console.error("Firebase commentShot error:", e);
    }
  });

export const removeVoiceNoteServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreDelete("voiceNotes", data);
    } catch (e) {
      console.error("Firebase removeVoiceNote error:", e);
    }
  });

export const renameVoiceNoteServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; title: string }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreUpdate("voiceNotes", data.id, { title: data.title });
    } catch (e) {
      console.error("Firebase renameVoiceNote error:", e);
    }
  });

export const updateEventServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreUpdate("events", data.id, data.patch);
    } catch (e) {
      console.error("Firebase updateEvent error:", e);
    }
  });

export const removeEventServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      await firestoreDelete("events", data);
    } catch (e) {
      console.error("Firebase removeEvent error:", e);
    }
  });
