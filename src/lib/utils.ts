import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLinkedinUrl(urlOrUsername: string) {
  if (!urlOrUsername) return "";
  const trimmed = urlOrUsername.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("//")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function getLinkedinUsername(urlOrUsername: string) {
  if (!urlOrUsername) return "";
  const cleaned = urlOrUsername.trim().replace(/\/$/, "");
  const lastPart = cleaned.split("/").pop();
  return lastPart || cleaned;
}
