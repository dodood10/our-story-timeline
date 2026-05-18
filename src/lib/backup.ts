/** JSON backup/restore: bundles localStorage data + all IDB photos. */
import { STORAGE_KEYS } from "./storage";
import { gcPhotos, listPhotoRefs, resolvePhoto, savePhotoDataUrl } from "./photos";

export interface BackupBundle {
  version: 1;
  exportedAt: string;
  data: Record<string, unknown>;
  /** ref -> data URL */
  photos: Record<string, string>;
}

/** Recursive JSON-safe value type used by the remap traversal. */
type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

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
    try {
      const resolved = await resolvePhoto(ref);
      if (resolved) photos[ref] = resolved;
    } catch {
      // Skip unresolvable photos — memory data is still exported.
    }
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
  let photosFailed = 0;
  for (const [oldRef, dataUrl] of Object.entries(bundle.photos ?? {})) {
    try {
      const newRef = await savePhotoDataUrl(dataUrl);
      refMap.set(oldRef, newRef);
    } catch {
      photosFailed++;
    }
  }
  if (photosFailed > 0) {
    console.warn(`[backup] ${photosFailed} foto(s) não puderam ser importadas por falta de espaço`);
  }

  function remap(value: JSONValue): JSONValue {
    if (typeof value === "string") return refMap.get(value) ?? value;
    if (Array.isArray(value)) return value.map(remap);
    if (value !== null && typeof value === "object") {
      const out: Record<string, JSONValue> = {};
      for (const [k, v] of Object.entries(value)) out[k] = remap(v);
      return out;
    }
    return value;
  }

  for (const [key, value] of Object.entries(bundle.data ?? {})) {
    localStorage.setItem(key, JSON.stringify(remap(value as JSONValue)));
  }

  const used = new Set<string>();
  for (const key of Object.values(STORAGE_KEYS)) {
    const raw = localStorage.getItem(key) ?? "";
    for (const match of raw.matchAll(/idb:[a-z0-9-]+/gi)) {
      used.add(match[0]);
    }
  }
  await gcPhotos(used);
}
