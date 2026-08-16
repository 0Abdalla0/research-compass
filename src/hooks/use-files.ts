import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorkspaceDataServer, addFileServer, removeFileServer } from "@/lib/db-server";
import { uploadFile, removeStorageObject } from "@/lib/uploads";
import type { ResearchFile } from "@/data/workspace";

/**
 * Stable query key for files data.
 * Used by both query and mutations to keep cache in sync.
 */
export const FILES_QUERY_KEY = ["workspace", "files"] as const;

/**
 * Fetches the files list from the database via the server function.
 * On refresh / first mount, this re-fetches from Supabase ensuring persistence.
 */
export function useFilesQuery() {
  return useQuery<ResearchFile[]>({
    queryKey: [...FILES_QUERY_KEY],
    queryFn: async () => {
      const data = await getWorkspaceDataServer();
      return data.files;
    },
    staleTime: 30_000, // treat as fresh for 30s to avoid over-fetching
  });
}

const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => new Date().toISOString().split("T")[0]!;

/**
 * Upload → DB Insert → Cache Invalidate mutation.
 *
 * Steps:
 * 1. Uploads the file to Supabase Storage (throws on failure)
 * 2. Inserts a record into the `files` DB table (throws on failure)
 * 3. Invalidates the FILES_QUERY_KEY so useFilesQuery re-fetches
 */
export function useFileUploadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      file: File;
      folder: string;
      userId: string;
      paperId?: string | undefined;
    }) => {
      const { file, folder, userId, paperId } = params;

      // Step 1: Upload to Supabase Storage
      const uploadRes = await uploadFile(file, file.name, "files");

      // Build the file record
      const ext = file.name.split(".").pop() || "bin";
      let formattedSize = "";
      if (file.size > 1024 * 1024) {
        formattedSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      } else {
        formattedSize = `${(file.size / 1024).toFixed(1)} KB`;
      }

      const newFile: ResearchFile = {
        id: uid(),
        name: file.name,
        ext: ext.toLowerCase(),
        folder: folder === "All" ? "Documentation" : folder,
        size: formattedSize,
        uploadedBy: userId,
        date: today(),
        url: uploadRes.url,
        storage_path: uploadRes.storage_path,
        mime_type: uploadRes.mime_type,
        size_bytes: uploadRes.size_bytes,
        paperId: paperId || undefined,
      };

      // Step 2: Insert into database
      try {
        await addFileServer({ data: newFile });
      } catch (dbError) {
        // Rollback: delete the storage object since DB insert failed
        if (uploadRes.storage_path) {
          await removeStorageObject(uploadRes.storage_path).catch(() => {});
        }
        throw dbError;
      }

      return newFile;
    },
    onSuccess: () => {
      // Step 3: Invalidate query so the list re-fetches from DB
      queryClient.invalidateQueries({ queryKey: [...FILES_QUERY_KEY] });
    },
  });
}

/**
 * DB Delete → Storage Delete → Cache Invalidate mutation.
 */
export function useDeleteFileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: { id: string; storage_path?: string | undefined }) => {
      // Step 1: Delete from database
      await removeFileServer({ data: file.id });

      // Step 2: Delete from storage
      if (file.storage_path) {
        await removeStorageObject(file.storage_path).catch((err) =>
          console.error("Storage delete error (non-fatal):", err),
        );
      }

      return file.id;
    },
    onSuccess: () => {
      // Step 3: Invalidate query so the list re-fetches from DB
      queryClient.invalidateQueries({ queryKey: [...FILES_QUERY_KEY] });
    },
  });
}
