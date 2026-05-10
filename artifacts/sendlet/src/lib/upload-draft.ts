export const UPLOAD_KEY = "sendlet-upload";

export type UploadDraft = {
  title?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileDataUrl?: string | null;
  linkUrl?: string;
  fileDataStored?: boolean;
};

const DB_NAME = "sendlet-upload-drafts";
const STORE_NAME = "drafts";
const FILE_DATA_KEY = "current-file-data-url";

function openDraftDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is unavailable"));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function writeFileDataUrl(fileDataUrl: string | null | undefined) {
  const db = await openDraftDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    if (fileDataUrl) store.put(fileDataUrl, FILE_DATA_KEY);
    else store.delete(FILE_DATA_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function readFileDataUrl() {
  const db = await openDraftDb();
  const value = await new Promise<string | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(FILE_DATA_KEY);
    request.onsuccess = () => resolve(typeof request.result === "string" ? request.result : null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return value;
}

function writeMetadata(metadata: UploadDraft | null) {
  for (const storage of [sessionStorage, localStorage]) {
    try {
      if (metadata) storage.setItem(UPLOAD_KEY, JSON.stringify(metadata));
      else storage.removeItem(UPLOAD_KEY);
    } catch {
      // Ignore unavailable storage; IndexedDB carries large file data.
    }
  }
}

async function clearFileDataUrl() {
  await writeFileDataUrl(null);
}

export function readUploadDraftMetadata(): UploadDraft | null {
  for (const storage of [sessionStorage, localStorage]) {
    try {
      const raw = storage.getItem(UPLOAD_KEY);
      if (raw) return JSON.parse(raw) as UploadDraft;
    } catch {
      // Try the next storage.
    }
  }
  return null;
}

export async function saveUploadDraft(draft: UploadDraft | null) {
  if (!draft) {
    writeMetadata(null);
    try { await clearFileDataUrl(); } catch {}
    return;
  }

  const { fileDataUrl, ...metadata } = draft;
  let fileDataStored = false;
  try {
    if (fileDataUrl) {
      await writeFileDataUrl(fileDataUrl);
      fileDataStored = true;
    } else {
      await clearFileDataUrl();
    }
  } catch {
    if (fileDataUrl) {
      throw new Error("Could not store this upload in your browser. Please try a smaller file or paste a hosted link.");
    }
    fileDataStored = false;
  }
  writeMetadata({ ...metadata, fileDataStored });
}

export async function readUploadDraft(): Promise<UploadDraft | null> {
  const metadata = readUploadDraftMetadata();
  if (!metadata) return null;
  if (!metadata.fileDataStored) return metadata;
  const fileDataUrl = await readFileDataUrl().catch(() => null);
  return { ...metadata, fileDataUrl };
}

export async function clearUploadDraft() {
  writeMetadata(null);
  try { await clearFileDataUrl(); } catch {}
}
