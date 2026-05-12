/** JSON backup/restore: bundles localStorage data + all IDB photos. */
import { STORAGE_KEYS } from "./storage";
import { listPhotoRefs, resolvePhoto, savePhotoDataUrl } from "./photos";

export interface BackupBundle {
  version: 1;
  exportedAt: string;
  data: Record<string, unknown>;
  /** ref -> data URL */
  photos: Record<string, string>;
}

export async function exportBackup(): Promise<BackupBundle> {
  const data: Record<string, unknown> = {};
  for (const key of Object.values(STORAGE_KEYS)) {
    const raw = localStorage.getItem(key);
    if (raw != null) {
      try {
        data[key] = JSON.parse(raw);
      } catch {
        data[key] = raw;
      }
    }
  }
  const refs = await listPhotoRefs();
  const photos: Record<string, string> = {};
  for (const ref of refs) {
    photos[ref] = await resolvePhoto(ref);
  }
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
    photos,
  };
}

export async function downloadBackup(): Promise<void> {
  const bundle = await exportBackup();
  const blob = new Blob([JSON.stringify(bundle)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `memory-lane-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Replaces local data with the bundle, remapping photo refs. */
export async function importBackup(bundle: BackupBundle): Promise<void> {
  if (bundle.version !== 1) throw new Error("Versão de backup incompatível");

  // Remap photo refs to fresh keys to avoid collisions with existing data.
  const refMap = new Map<string, string>();
  for (const [oldRef, dataUrl] of Object.entries(bundle.photos ?? {})) {
    const newRef = await savePhotoDataUrl(dataUrl);
    refMap.set(oldRef, newRef);
  }

  function remap<T>(value: T): T {
    if (typeof value === "string" && refMap.has(value)) return refMap.get(value) as unknown as T;
    if (Array.isArray(value)) return value.map(remap) as unknown as T;
    if (value && typeof value === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) out[k] = remap(v);
      return out as unknown as T;
    }
    return value;
  }

  for (const [key, value] of Object.entries(bundle.data ?? {})) {
    localStorage.setItem(key, JSON.stringify(remap(value)));
  }
}
