import { createServerFn } from "@tanstack/react-start";
import { supabase, hasSupabaseKeys } from "./supabase";
import * as seed from "@/data/workspace";
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

function cleanOptional<T extends object>(obj: T): any {
  const result = { ...obj } as any;
  Object.keys(result).forEach((key) => {
    if (result[key] === undefined || result[key] === null) {
      delete result[key];
    }
  });
  return result;
}

const parseJSONB = (val: any, fallback: any = []) => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }
  return val;
};

export const getWorkspaceDataServer = createServerFn({ method: "GET" })
  .handler(async () => {
    if (!hasSupabaseKeys) {
      console.info("Offline mode: Reading static workspace seed data.");
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

    try {
      const [
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
        supabase.from("members").select("*"),
        supabase.from("papers").select("*").order("created_at", { ascending: false }),
        supabase.from("tasks").select("*").order("created_at", { ascending: false }),
        supabase.from("notes").select("*").order("updated_at", { ascending: false }),
        supabase.from("shots").select("*").order("created_at", { ascending: false }),
        supabase.from("voiceNotes").select("*").order("created_at", { ascending: false }),
        supabase.from("files").select("*").order("created_at", { ascending: false }),
        supabase.from("links").select("*").order("created_at", { ascending: false }),
        supabase.from("meetings").select("*").order("created_at", { ascending: false }),
        supabase.from("events").select("*").order("date", { ascending: true }),
        supabase.from("recent_activity").select("*"),
        supabase.from("phases").select("*").order("index", { ascending: true }),
        supabase.from("comments").select("*").order("created_at", { ascending: true }),
        supabase.from("conversations").select("*").order("created_at", { ascending: false }),
        supabase.from("conversation_members").select("*"),
        supabase.from("messages").select("*").order("created_at", { ascending: true }),
        supabase.from("notifications").select("*").order("created_at", { ascending: false }),
      ]);

      if (
        membersRes.error ||
        papersRes.error ||
        tasksRes.error ||
        notesRes.error ||
        shotsRes.error ||
        voiceNotesRes.error ||
        filesRes.error ||
        linksRes.error ||
        meetingsRes.error ||
        eventsRes.error ||
        activityRes.error ||
        phasesRes.error ||
        commentsRes.error ||
        conversationsRes.error ||
        conversationMembersRes.error ||
        messagesRes.error ||
        notificationsRes.error
      ) {
        console.error("Error fetching from Supabase, falling back to static seed data.");
        throw new Error("Supabase response error");
      }

      const members = membersRes.data || [];
      const papers = papersRes.data || [];
      const tasks = tasksRes.data || [];
      const notes = notesRes.data || [];
      const shots = shotsRes.data || [];
      const voiceNotes = voiceNotesRes.data || [];
      const files = filesRes.data || [];
      const links = linksRes.data || [];
      const meetings = meetingsRes.data || [];
      const events = eventsRes.data || [];
      const activity = activityRes.data || [];
      const phases = phasesRes.data || [];
      const comments = commentsRes.data || [];
      const conversations = conversationsRes.data || [];
      const conversationMembers = conversationMembersRes.data || [];
      const messages = messagesRes.data || [];
      const notifications = notificationsRes.data || [];

      const formattedMembers: Member[] = members.map((m: any) => cleanOptional({
        ...m,
        password: m.password ?? undefined,
        uniId: m.uniId ?? undefined,
        phone: m.phone ?? undefined,
        uniEmail: m.uniEmail ?? undefined,
        cv: m.cv ?? undefined,
        privateEmail: m.privateEmail ?? undefined,
      }));

      const formattedPapers: Paper[] = papers.map((p: any) => ({
        ...p,
        status: p.status as PaperStatus,
        keywords: parseJSONB(p.keywords, []),
        analysis: parseJSONB(p.analysis, {}),
      }));

      const formattedTasks: Task[] = tasks.map((t: any) => cleanOptional({
        ...t,
        status: t.status as TaskStatus,
        priority: t.priority as Priority,
        labels: parseJSONB(t.labels, []),
        checklist: parseJSONB(t.checklist, []),
        paperId: t.paperId ?? undefined,
        phaseId: t.phaseId ?? undefined,
      }));

      const formattedNotes: Note[] = notes.map((n: any) => cleanOptional({
        ...n,
        type: n.type as Note["type"],
        tags: parseJSONB(n.tags, []),
        paperId: n.paperId ?? undefined,
        taskId: n.taskId ?? undefined,
      }));

      const formattedShots: Shot[] = shots.map((s: any) => cleanOptional({
        ...s,
        tags: parseJSONB(s.tags, []),
        comments: parseJSONB(s.comments, []),
        paperId: s.paperId ?? undefined,
        url: s.url || (s.storage_path ? supabase.storage.from("documents").getPublicUrl(s.storage_path).data.publicUrl : undefined),
      }));

      const formattedVoiceNotes: VoiceNote[] = voiceNotes.map((v: any) => cleanOptional({
        ...v,
        paperId: v.paperId ?? undefined,
        taskId: v.taskId ?? undefined,
        url: v.url || (v.storage_path ? supabase.storage.from("documents").getPublicUrl(v.storage_path).data.publicUrl : undefined),
      }));

      const formattedLinks: ResourceLink[] = links.map((l: any) => cleanOptional({
        ...l,
        tags: parseJSONB(l.tags, []),
        paperId: l.paperId ?? undefined,
      }));

      const formattedMeetings: Meeting[] = meetings.map((m: any) => ({
        ...m,
        participants: parseJSONB(m.participants, []),
        agenda: parseJSONB(m.agenda, []),
        decisions: parseJSONB(m.decisions, []),
        actionItems: parseJSONB(m.actionItems, []),
      }));

      const formattedEvents: CalEvent[] = events.map((e: any) => ({
        ...e,
        kind: e.kind as EventKind,
        attendees: parseJSONB(e.attendees, []),
      }));

      const formattedActivity: Activity[] = activity
        .map((a: any) => ({
          ...a,
          kind: a.kind as Activity["kind"],
        }))
        .sort((a: any, b: any) => b.id.localeCompare(a.id));

      const formattedPhases: Phase[] = phases
        .map((p: any) => ({
          ...p,
          deliverables: parseJSONB(p.deliverables, []),
          members: parseJSONB(p.members, []),
        }))
        .sort((a: any, b: any) => a.index - b.index);

      return {
        members: formattedMembers,
        papers: formattedPapers,
        tasks: formattedTasks,
        notes: formattedNotes,
        shots: formattedShots,
        voiceNotes: formattedVoiceNotes,
        files: files.map((f: any) => ({
          ...f,
          url: f.url || (f.storage_path ? supabase.storage.from("documents").getPublicUrl(f.storage_path).data.publicUrl : undefined),
        })) as ResearchFile[],
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
      console.error("Supabase failed, returning static mock data:", e);
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
      };
    }
  });

export const addPaperServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      const { data: res, error } = await supabase.from("papers").insert([data]).select();
      if (error) throw error;
      return res?.[0] || data;
    } catch (e) {
      console.error("Supabase insert paper error:", e);
      throw e;
    }
  });

export const updatePaperServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("papers").update(data.patch).eq("id", data.id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase update paper error:", e);
    }
  });

export const setAnalysisServer = createServerFn({ method: "POST" })
  .validator((d: { paperId: string; section: string; value: string }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      // Use atomic DB function — eliminates read-then-write N+1
      const { error } = await supabase.rpc("set_paper_analysis", {
        p_paper_id: data.paperId,
        p_section: data.section,
        p_value: data.value,
      });
      if (error) throw error;
    } catch (e) {
      console.error("Supabase setAnalysis error:", e);
    }
  });

export const addTaskServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      const { data: res, error } = await supabase.from("tasks").insert([data]).select();
      if (error) throw error;
      return res?.[0] || data;
    } catch (e) {
      console.error("Supabase insert task error:", e);
      return data;
    }
  });

export const moveTaskServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; status: string }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("tasks").update({ status: data.status }).eq("id", data.id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase moveTask error:", e);
    }
  });

export const updateTaskServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("tasks").update(data.patch).eq("id", data.id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase updateTask error:", e);
    }
  });

export const toggleCheckServer = createServerFn({ method: "POST" })
  .validator((d: { taskId: string; index: number }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      // Use atomic DB function — eliminates read-then-write N+1
      const { error } = await supabase.rpc("toggle_checklist_item", {
        p_task_id: data.taskId,
        p_index: data.index,
      });
      if (error) throw error;
    } catch (e) {
      console.error("Supabase toggleCheck error:", e);
    }
  });

export const addNoteServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      const { data: res, error } = await supabase.from("notes").insert([data]).select();
      if (error) throw error;
      return res?.[0] || data;
    } catch (e) {
      console.error("Supabase insert note error:", e);
      return data;
    }
  });

export const updateNoteServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("notes").update(data.patch).eq("id", data.id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase updateNote error:", e);
    }
  });

export const addShotServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      const { url, ...dbPayload } = data;
      const { data: res, error } = await supabase.from("shots").insert([dbPayload]).select();
      if (error) throw error;
      return {
        ...data,
        ...(res?.[0] || {})
      };
    } catch (e) {
      console.error("Supabase insert screenshot error:", e);
      throw e;
    }
  });

export const commentShotServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; comment: { author: string; text: string } }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { data: shotRes, error: fetchErr } = await supabase
        .from("shots")
        .select("comments")
        .eq("id", data.id)
        .single();
      if (fetchErr || !shotRes) throw fetchErr || new Error("Screenshot not found");

      const comments = parseJSONB(shotRes.comments, []);
      comments.push(data.comment);

      const { error: updateErr } = await supabase
        .from("shots")
        .update({ comments })
        .eq("id", data.id);
      if (updateErr) throw updateErr;
    } catch (e) {
      console.error("Supabase commentShot error:", e);
    }
  });

export const addVoiceNoteServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      const { url, ...dbPayload } = data;
      const { data: res, error } = await supabase.from("voiceNotes").insert([dbPayload]).select();
      if (error) throw error;
      return {
        ...data,
        ...(res?.[0] || {})
      };
    } catch (e) {
      console.error("Supabase insert voiceNote error:", e);
      throw e;
    }
  });

export const removeVoiceNoteServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("voiceNotes").delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase delete voiceNote error:", e);
    }
  });

export const renameVoiceNoteServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; title: string }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("voiceNotes").update({ title: data.title }).eq("id", data.id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase rename voiceNote error:", e);
    }
  });

export const addFileServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      const { url, ...dbPayload } = data;
      const { data: res, error } = await supabase.from("files").insert([dbPayload]).select();
      if (error) throw error;
      return {
        ...data,
        ...(res?.[0] || {})
      };
    } catch (e) {
      console.error("Supabase insert file error:", e);
      throw e;
    }
  });

export const removeFileServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("files").delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase delete file error:", e);
      throw e;
    }
  });

export const addLinkServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      const { data: res, error } = await supabase.from("links").insert([data]).select();
      if (error) throw error;
      return res?.[0] || data;
    } catch (e) {
      console.error("Supabase insert resource link error:", e);
      return data;
    }
  });

export const addEventServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      const { data: res, error } = await supabase.from("events").insert([data]).select();
      if (error) throw error;
      return res?.[0] || data;
    } catch (e) {
      console.error("Supabase insert event error:", e);
      return data;
    }
  });

export const updateEventServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("events").update(data.patch).eq("id", data.id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase updateEvent error:", e);
    }
  });

export const removeEventServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase delete event error:", e);
    }
  });

export const addMeetingServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      const { data: res, error } = await supabase.from("meetings").insert([data]).select();
      if (error) throw error;
      return res?.[0] || data;
    } catch (e) {
      console.error("Supabase insert meeting error:", e);
      return data;
    }
  });

export const updateMeetingServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("meetings").update(data.patch).eq("id", data.id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase updateMeeting error:", e);
    }
  });

export const addActivityServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      const { data: res, error } = await supabase.from("activity").insert([data]).select();
      if (error) throw error;
      return res?.[0] || data;
    } catch (e) {
      console.error("Supabase insert activity error:", e);
      return data;
    }
  });

export const removePaperServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("papers").delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase delete paper error:", e);
    }
  });

export const removeTaskServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase delete task error:", e);
    }
  });

export const removeNoteServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase delete note error:", e);
    }
  });

export const removeShotServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("shots").delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase delete screenshot error:", e);
    }
  });

export const removeLinkServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("links").delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase delete resource link error:", e);
    }
  });

export const removeMeetingServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("meetings").delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase delete meeting error:", e);
    }
  });

export const updateLinkServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("links").update(data.patch).eq("id", data.id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase updateLink error:", e);
    }
  });

export const addPhaseServer = createServerFn({ method: "POST" })
  .validator((p: any) => p)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      const { data: res, error } = await supabase.from("phases").insert([data]).select();
      if (error) throw error;
      return res?.[0] || data;
    } catch (e) {
      console.error("Supabase addPhase error:", e);
      return data;
    }
  });

export const updatePhaseServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("phases").update(data.patch).eq("id", data.id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase updatePhase error:", e);
    }
  });

export const removePhaseServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("phases").delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase removePhase error:", e);
    }
  });

export const addCommentServer = createServerFn({ method: "POST" })
  .validator((c: any) => c)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      const { data: res, error } = await supabase.from("comments").insert([data]).select();
      if (error) throw error;
      return res?.[0] || data;
    } catch (e) {
      console.error("Supabase addComment error:", e);
      return data;
    }
  });

export const updateCommentServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("comments").update(data.patch).eq("id", data.id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase updateComment error:", e);
    }
  });

export const removeCommentServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase removeComment error:", e);
    }
  });

export const addConversationServer = createServerFn({ method: "POST" })
  .validator((c: any) => c)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      const { data: res, error } = await supabase.from("conversations").insert([data]).select();
      if (error) throw error;
      return res?.[0] || data;
    } catch (e) {
      console.error("Supabase addConversation error:", e);
      return data;
    }
  });

export const addConversationMembersServer = createServerFn({ method: "POST" })
  .validator((m: any[]) => m)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      const { data: res, error } = await supabase.from("conversation_members").insert(data).select();
      if (error) throw error;
      return res || data;
    } catch (e) {
      console.error("Supabase addConversationMembers error:", e);
      return data;
    }
  });

export const addMessageServer = createServerFn({ method: "POST" })
  .validator((m: any) => m)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      const { data: res, error } = await supabase.from("messages").insert([data]).select();
      if (error) throw error;
      return res?.[0] || data;
    } catch (e) {
      console.error("Supabase addMessage error:", e);
      return data;
    }
  });

export const updateMessageServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: any }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("messages").update(data.patch).eq("id", data.id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase updateMessage error:", e);
    }
  });

export const removeMessageServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("messages").update({ deleted_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase removeMessage error:", e);
    }
  });

export const addNotificationServer = createServerFn({ method: "POST" })
  .validator((n: any) => n)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return data;
    try {
      const { data: res, error } = await supabase.from("notifications").insert([data]).select();
      if (error) throw error;
      return res?.[0] || data;
    } catch (e) {
      console.error("Supabase addNotification error:", e);
      return data;
    }
  });

export const markNotificationReadServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; is_read: boolean }) => d)
  .handler(async ({ data }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("notifications").update({ is_read: data.is_read }).eq("id", data.id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase markNotificationRead error:", e);
    }
  });

export const clearNotificationsServer = createServerFn({ method: "POST" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    if (!hasSupabaseKeys) return;
    try {
      const { error } = await supabase.from("notifications").delete().eq("user_id", userId);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase clearNotifications error:", e);
    }
  });

