import { createServerFn } from "@tanstack/react-start";
import { storage, hasFirebaseKeys } from "./firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export interface UploadedFileDetails {
  url: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
}

// Server-side upload handler to completely bypass client CORS restrictions
const uploadFileServer = createServerFn({ method: "POST" })
  .validator((d: { base64Data: string; name: string; folder: string; mimeType: string }) => d)
  .handler(async ({ data }) => {
    if (!hasFirebaseKeys) {
      throw new Error("Firebase configuration keys are missing on the server.");
    }

    try {
      const base64Content = data.base64Data.split(";base64,").pop() || data.base64Data;
      const binaryString = atob(base64Content);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const fileExt = data.name.split(".").pop() || "bin";
      const cleanFolder = data.folder.replace(/\/+$/, "");
      const uniqueId = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 15);
      const storagePath = `${cleanFolder}/${uniqueId}_${Date.now()}.${fileExt}`;

      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, bytes, { contentType: data.mimeType });
      const url = await getDownloadURL(storageRef);

      return {
        url,
        storagePath,
      };
    } catch (e: any) {
      console.error("Server-side Firebase Storage upload failed:", e);
      throw new Error(e.message || String(e));
    }
  });

// Server-side delete handler
const removeStorageObjectServer = createServerFn({ method: "POST" })
  .validator((storagePath: string) => storagePath)
  .handler(async ({ data: storagePath }) => {
    if (!hasFirebaseKeys) return;
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (e: any) {
      console.error("Server-side Firebase Storage delete failed:", e);
      throw new Error(e.message || String(e));
    }
  });

/**
 * Uploads a file or blob by transferring it to the server and uploading to Firebase Storage.
 */
export async function uploadFile(
  file: File | Blob,
  name: string,
  folder: string,
  options?: { accept?: string }
): Promise<UploadedFileDetails> {
  const mimeType = file.type || "application/octet-stream";
  const sizeBytes = file.size;

  if (!hasFirebaseKeys) {
    console.info("Offline mode: converting upload to Base64 Data URL");
    const url = await convertToBase64(file);
    return {
      url,
      storage_path: `offline/${folder}/${Date.now()}_${name}`,
      mime_type: mimeType,
      size_bytes: sizeBytes,
    };
  }

  try {
    const base64Data = await convertToBase64(file);
    const res = await uploadFileServer({ data: { base64Data, name, folder, mimeType } });

    return {
      url: res.url,
      storage_path: res.storagePath,
      mime_type: mimeType,
      size_bytes: sizeBytes,
    };
  } catch (err) {
    console.error("Firebase storage upload failed:", err);
    throw new Error(
      `File upload failed: ${err instanceof Error ? err.message : "Unknown storage error"}. Please check your connection and try again.`
    );
  }
}

/**
 * Removes a file from Firebase Storage bucket server-side.
 */
export async function removeStorageObject(storagePath: string): Promise<void> {
  if (!hasFirebaseKeys || !storagePath || storagePath.startsWith("offline/") || storagePath.startsWith("fallback/")) {
    return;
  }
  try {
    await removeStorageObjectServer({ data: storagePath });
  } catch (err) {
    console.error(`Failed to delete Firebase storage path "${storagePath}":`, err);
  }
}

function convertToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
