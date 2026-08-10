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
      ] = await Promise.all([
        supabase.from("members").select("*"),
        supabase.from("papers").select("*"),
        supabase.from("tasks").select("*"),
        supabase.from("notes").select("*"),
        supabase.from("shots").select("*"),
        supabase.from("voiceNotes").select("*"),
        supabase.from("files").select("*"),
        supabase.from("links").select("*"),
        supabase.from("meetings").select("*"),
        supabase.from("events").select("*"),
        supabase.from("activity").select("*"),
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
        activityRes.error
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

      const formattedMembers: Member[] = members.map((m) => cleanOptional({
        ...m,
        password: m.password ?? undefined,
        uniId: m.uniId ?? undefined,
        phone: m.phone ?? undefined,
        uniEmail: m.uniEmail ?? undefined,
        cv: m.cv ?? undefined,
        privateEmail: m.privateEmail ?? undefined,
      }));

      const formattedPapers: Paper[] = papers.map((p) => ({
        ...p,
        status: p.status as PaperStatus,
        keywords: parseJSONB(p.keywords, []),
        analysis: parseJSONB(p.analysis, {}),
      }));

      const formattedTasks: Task[] = tasks.map((t) => cleanOptional({
        ...t,
        status: t.status as TaskStatus,
        priority: t.priority as Priority,
        labels: parseJSONB(t.labels, []),
        checklist: parseJSONB(t.checklist, []),
        paperId: t.paperId ?? undefined,
        phaseId: t.phaseId ?? undefined,
      }));

      const formattedNotes: Note[] = notes.map((n) => cleanOptional({
        ...n,
        type: n.type as Note["type"],
        tags: parseJSONB(n.tags, []),
        paperId: n.paperId ?? undefined,
        taskId: n.taskId ?? undefined,
      }));

      const formattedShots: Shot[] = shots.map((s) => cleanOptional({
        ...s,
        tags: parseJSONB(s.tags, []),
        comments: parseJSONB(s.comments, []),
        paperId: s.paperId ?? undefined,
      }));

      const formattedVoiceNotes: VoiceNote[] = voiceNotes.map((v) => cleanOptional({
        ...v,
        paperId: v.paperId ?? undefined,
        taskId: v.taskId ?? undefined,
      }));

      const formattedLinks: ResourceLink[] = links.map((l) => cleanOptional({
        ...l,
        tags: parseJSONB(l.tags, []),
        paperId: l.paperId ?? undefined,
      }));

      const formattedMeetings: Meeting[] = meetings.map((m) => ({
        ...m,
        participants: parseJSONB(m.participants, []),
        agenda: parseJSONB(m.agenda, []),
        decisions: parseJSONB(m.decisions, []),
        actionItems: parseJSONB(m.actionItems, []),
      }));

      const formattedEvents: CalEvent[] = events.map((e) => ({
        ...e,
        kind: e.kind as EventKind,
        attendees: parseJSONB(e.attendees, []),
      }));

      const formattedActivity: Activity[] = activity
        .map((a) => ({
          ...a,
          kind: a.kind as Activity["kind"],
        }))
        .sort((a, b) => b.id.localeCompare(a.id));

      return {
        members: formattedMembers,
        papers: formattedPapers,
        tasks: formattedTasks,
        notes: formattedNotes,
        shots: formattedShots,
        voiceNotes: formattedVoiceNotes,
        files: files as ResearchFile[],
        links: formattedLinks,
        meetings: formattedMeetings,
        events: formattedEvents,
        activity: formattedActivity,
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
      return data;
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
      const { data: paperRes, error: fetchErr } = await supabase
        .from("papers")
        .select("analysis")
        .eq("id", data.paperId)
        .single();
      if (fetchErr || !paperRes) throw fetchErr || new Error("Paper not found");

      const analysis = parseJSONB(paperRes.analysis, {});
      analysis[data.section] = data.value;

      const { error: updateErr } = await supabase
        .from("papers")
        .update({ analysis })
        .eq("id", data.paperId);
      if (updateErr) throw updateErr;
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
      const { data: taskRes, error: fetchErr } = await supabase
        .from("tasks")
        .select("checklist")
        .eq("id", data.taskId)
        .single();
      if (fetchErr || !taskRes) throw fetchErr || new Error("Task not found");

      const checklist = parseJSONB(taskRes.checklist, []);
      if (checklist[data.index]) {
        checklist[data.index].done = !checklist[data.index].done;
      }

      const { error: updateErr } = await supabase
        .from("tasks")
        .update({ checklist })
        .eq("id", data.taskId);
      if (updateErr) throw updateErr;
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
      const { data: res, error } = await supabase.from("shots").insert([data]).select();
      if (error) throw error;
      return res?.[0] || data;
    } catch (e) {
      console.error("Supabase insert screenshot error:", e);
      return data;
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
      const { data: res, error } = await supabase.from("voiceNotes").insert([data]).select();
      if (error) throw error;
      return res?.[0] || data;
    } catch (e) {
      console.error("Supabase insert voiceNote error:", e);
      return data;
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
      const { data: res, error } = await supabase.from("files").insert([data]).select();
      if (error) throw error;
      return res?.[0] || data;
    } catch (e) {
      console.error("Supabase insert file error:", e);
      return data;
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
