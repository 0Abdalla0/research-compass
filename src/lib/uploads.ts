import { storage, hasFirebaseKeys } from "./firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export interface UploadedFileDetails {
  url: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
}

/**
 * Uploads a file or blob to Firebase Storage, or falls back to a Base64 Data URL if offline.
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
    const fileExt = name.split(".").pop() || "bin";
    const cleanFolder = folder.replace(/\/+$/, "");
    const uniqueId = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15);
    // Construct storage path
    const storagePath = `${cleanFolder}/${uniqueId}_${Date.now()}.${fileExt}`;

    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file, { contentType: mimeType });
    const url = await getDownloadURL(storageRef);

    return {
      url,
      storage_path: storagePath,
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
 * Removes a file from Firebase Storage bucket.
 */
export async function removeStorageObject(storagePath: string): Promise<void> {
  if (!hasFirebaseKeys || !storagePath || storagePath.startsWith("offline/") || storagePath.startsWith("fallback/")) {
    return;
  }
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
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
