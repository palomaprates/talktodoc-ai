import type { UploadedTextFile } from "@/types";

type DraftStore = Record<string, UploadedTextFile[]>;

const uploadDrafts: DraftStore = {};

export function getUploadDraft(userId: string | undefined): UploadedTextFile[] {
  if (!userId) return [];
  return uploadDrafts[userId] ?? [];
}

export function setUploadDraft(userId: string | undefined, files: UploadedTextFile[]) {
  if (!userId) return;
  uploadDrafts[userId] = files;
}

export function clearUploadDraft(userId: string | undefined) {
  if (!userId) return;
  uploadDrafts[userId] = [];
}
