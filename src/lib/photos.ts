/**
 * Photo storage using IndexedDB (idb-keyval) for binary blobs.
 * Memory.photos may contain either a raw data URL (legacy) or an "idb:KEY"
 * reference. Use resolvePhoto() in UI to turn refs into displayable URLs.
 */
import { get, set, del, keys } from "idb-keyval";
import { compressImage, uid } from "./storage";

const PREFIX = "idb:";
const STORE_PREFIX = "photo:";

export function isPhotoRef(s: string): boolean {
  return s.startsWith(PREFIX);
}

export async function savePhotoFile(file: File): Promise<string> {
  const dataUrl = await compressImage(file);
  return savePhotoDataUrl(dataUrl);
}

export async function savePhotoDataUrl(dataUrl: string): Promise<string> {
  const id = uid();
  const key = STORE_PREFIX + id;
  try {
    await set(key, dataUrl);
  } catch {
    throw new Error(
      "Não foi possível salvar a foto. O armazenamento do dispositivo pode estar cheio.",
    );
  }
  return PREFIX + id;
}

const cache = new Map<string, string>();

export async function resolvePhoto(ref: string): Promise<string> {
  if (!ref.startsWith(PREFIX)) return ref;
  const cached = cache.get(ref);
  if (cached) return cached;
  const id = ref.slice(PREFIX.length);
  try {
    const data = await get<string>(STORE_PREFIX + id);
    const url = data ?? "";
    cache.set(ref, url);
    return url;
  } catch {
    return "";
  }
}

export async function deletePhoto(ref: string): Promise<void> {
  if (!ref.startsWith(PREFIX)) return;
  const id = ref.slice(PREFIX.length);
  cache.delete(ref);
  try {
    await del(STORE_PREFIX + id);
  } catch {
    // Non-critical: orphan photo remains in IDB but causes no data loss.
  }
}

export async function listPhotoRefs(): Promise<string[]> {
  try {
    const all = await keys();
    return all
      .filter((k): k is string => typeof k === "string" && k.startsWith(STORE_PREFIX))
      .map((k) => PREFIX + k.slice(STORE_PREFIX.length));
  } catch {
    return [];
  }
}

/** Sweep IDB for orphan photos not referenced anywhere. */
export async function gcPhotos(usedRefs: Set<string>): Promise<number> {
  const all = await listPhotoRefs(); // already handles errors internally
  let removed = 0;
  for (const ref of all) {
    if (!usedRefs.has(ref)) {
      await deletePhoto(ref); // already handles errors internally
      removed++;
    }
  }
  return removed;
}

/** Estimate browser storage usage. */
export async function storageEstimate(): Promise<{ used: number; quota: number } | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return null;
  try {
    const e = await navigator.storage.estimate();
    return { used: e.usage ?? 0, quota: e.quota ?? 0 };
  } catch {
    return null;
  }
}
