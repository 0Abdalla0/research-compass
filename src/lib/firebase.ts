import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const getEnv = (key: string): string => {
  if (typeof window === "undefined") {
    if (typeof process !== "undefined" && process.env && process.env[key]) {
      return process.env[key];
    }
  }
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  return "";
};

// Manually parse .env on the server side (SSR bootstrap)
if (typeof window === "undefined") {
  try {
    const fsLib = "fs";
    const pathLib = "path";
    const fs = await import(/* @vite-ignore */ fsLib);
    const path = await import(/* @vite-ignore */ pathLib);
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        if (!line.trim() || line.trim().startsWith("#")) continue;
        const parts = line.split("=");
        const k = parts[0].trim();
        const v = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
        if (k) {
          process.env[k] = v;
        }
      }
    }
  } catch (e) {
    console.warn("Could not manually load .env file on server in firebase.ts:", e);
  }
}

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("VITE_FIREBASE_APP_ID"),
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID"),
};

if (typeof window === "undefined") {
  console.log("🔥 Firebase project:", firebaseConfig.projectId);
  console.log("🔥 Firebase storage bucket:", firebaseConfig.storageBucket);
}

export const hasFirebaseKeys = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes("YOUR_")
);

if (!hasFirebaseKeys) {
  console.warn(
    "Firebase credentials are missing or invalid. App is running in offline mode with mock data."
  );
}

// Initialize Firebase
const app = hasFirebaseKeys ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : (null as any);
export const storage = app ? getStorage(app) : (null as any);

export async function uploadFileToStorage(
  file: File | Blob,
  originalName: string,
  bucketName: string = "documents"
): Promise<string> {
  if (!hasFirebaseKeys) {
    // If offline, convert to base64 data URL so it survives page reload/refresh
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  try {
    const fileExt = originalName.split(".").pop() || "bin";
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const storageRef = ref(storage, `${bucketName}/${fileName}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (err) {
    console.error("Firebase storage upload error, falling back to Base64:", err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}
