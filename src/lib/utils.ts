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
  if (trimmed.startsWith("www.") || trimmed.startsWith("linkedin.com")) {
    return `https://${trimmed}`;
  }
  return `https://linkedin.com/in/${trimmed}`;
}
