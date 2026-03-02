/**
 * DoctorStrange File Storage API Service
 * Communicates through arcReactor proxy at /api/doctor-strange
 */

const DS_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/doctor-strange`;

const authHeaders = (token: string | null, extra: Record<string, string> = {}) =>
  token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };

// ─── Folder APIs ─────────────────────────────────────────

export type Folder = {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
};

export type DSFile = {
  id: string;
  user_id: string;
  name: string;
  folder_id: string;
  b2_file_name: string;
  mime_type: string;
  size: number;
  created_at: string;
};

export async function ensureRootFolder(token: string | null): Promise<Folder> {
  const res = await fetch(`${DS_BASE}/folders/ensure-root`, {
    method: 'POST',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to ensure root folder');
  return data.folder;
}

export async function listFolders(token: string | null, parentId?: string): Promise<Folder[]> {
  const qs = parentId ? `?parentId=${parentId}` : '';
  const res = await fetch(`${DS_BASE}/folders${qs}`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to list folders');
  return data.folders;
}

export async function getFolderContents(
  token: string | null,
  folderId: string
): Promise<{ folder: Folder; subfolders: Folder[]; files: DSFile[] }> {
  const res = await fetch(`${DS_BASE}/folders/${folderId}`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to get folder');
  return data;
}

export async function createFolder(
  token: string | null,
  name: string,
  parentId?: string
): Promise<Folder> {
  const res = await fetch(`${DS_BASE}/folders`, {
    method: 'POST',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name, parentId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to create folder');
  return data.folder;
}

export async function renameFolder(
  token: string | null,
  folderId: string,
  name: string
): Promise<Folder> {
  const res = await fetch(`${DS_BASE}/folders/${folderId}`, {
    method: 'PUT',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to rename folder');
  return data.folder;
}

export async function deleteFolder(token: string | null, folderId: string): Promise<void> {
  const res = await fetch(`${DS_BASE}/folders/${folderId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || 'Failed to delete folder');
  }
}

// ─── File APIs ───────────────────────────────────────────

export async function getUploadUrl(
  token: string | null,
  fileName: string,
  folderId: string,
  mimeType: string
): Promise<{ uploadUrl: string; filePath: string; expiresIn: number }> {
  const res = await fetch(`${DS_BASE}/files/upload-url`, {
    method: 'POST',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ fileName, folderId, mimeType }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to get upload URL');
  return data;
}

export async function confirmUpload(
  token: string | null,
  fileName: string,
  folderId: string,
  b2Path: string,
  size: number,
  mimeType: string
): Promise<DSFile> {
  const res = await fetch(`${DS_BASE}/files/confirm`, {
    method: 'POST',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ fileName, folderId, b2Path, size, mimeType }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to confirm upload');
  return data.file;
}

export async function getDownloadUrl(
  token: string | null,
  fileId: string
): Promise<{ downloadUrl: string; fileName: string; mimeType: string; size: number }> {
  const res = await fetch(`${DS_BASE}/files/download-url/${fileId}`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to get download URL');
  return data;
}

export async function deleteFile(token: string | null, fileId: string): Promise<void> {
  const res = await fetch(`${DS_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || 'Failed to delete file');
  }
}

/**
 * Upload file directly to Backblaze B2 using presigned URL.
 * The backend never touches the file data.
 */
export async function uploadFileDirect(
  uploadUrl: string,
  file: File | Blob,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', (file as File).type || 'application/octet-stream');

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Return ETag (needed for multipart complete)
        const etag = xhr.getResponseHeader('ETag') || '';
        resolve(etag);
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(file);
  });
}

// ─── Multipart Upload APIs (for files > 50MB, up to 5GB) ────────

const MULTIPART_THRESHOLD = 50 * 1024 * 1024; // 50MB
const MAX_CONCURRENT_PARTS = 3;

type MultipartInitResponse = {
  uploadId: string;
  filePath: string;
  partSize: number;
  totalParts: number;
  partUrls: { partNumber: number; uploadUrl: string }[];
};

export async function initiateMultipartUpload(
  token: string | null,
  fileName: string,
  folderId: string,
  mimeType: string,
  fileSize: number
): Promise<MultipartInitResponse> {
  const res = await fetch(`${DS_BASE}/files/multipart/initiate`, {
    method: 'POST',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ fileName, folderId, mimeType, fileSize }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to initiate multipart upload');
  return data;
}

export async function completeMultipartUpload(
  token: string | null,
  uploadId: string,
  filePath: string,
  fileName: string,
  folderId: string,
  mimeType: string,
  fileSize: number,
  parts: { partNumber: number; etag: string }[]
): Promise<DSFile> {
  const res = await fetch(`${DS_BASE}/files/multipart/complete`, {
    method: 'POST',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ uploadId, filePath, fileName, folderId, mimeType, fileSize, parts }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to complete multipart upload');
  return data.file;
}

export async function abortMultipartUpload(
  token: string | null,
  uploadId: string,
  filePath: string
): Promise<void> {
  await fetch(`${DS_BASE}/files/multipart/abort`, {
    method: 'POST',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ uploadId, filePath }),
  }).catch(() => { }); // Best effort
}

/**
 * Upload a part (chunk) to B2 via presigned URL.
 * Returns the ETag needed for completeMultipartUpload.
 */
function uploadPart(
  url: string,
  blob: Blob,
  onProgress?: (loaded: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(e.loaded);
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const etag = xhr.getResponseHeader('ETag') || '';
        resolve(etag.replace(/"/g, '')); // Strip quotes from ETag
      } else {
        reject(new Error(`Part upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during part upload'));
    xhr.send(blob);
  });
}

/**
 * Smart upload: auto-selects single vs multipart based on file size.
 *  - Files ≤ 50MB: single presigned PUT
 *  - Files > 50MB: multipart chunked upload with parallel parts
 *
 * Returns the b2Path (filePath) for confirmation.
 */
export async function uploadFileAuto(
  token: string | null,
  file: File,
  folderId: string,
  onProgress?: (percent: number) => void
): Promise<{ filePath: string; isMultipart: boolean }> {
  const mimeType = file.type || 'application/octet-stream';

  if (file.size <= MULTIPART_THRESHOLD) {
    // ── Single upload ──
    const { uploadUrl, filePath } = await getUploadUrl(token, file.name, folderId, mimeType);
    await uploadFileDirect(uploadUrl, file, onProgress);
    return { filePath, isMultipart: false };
  }

  // ── Multipart upload ──
  const { uploadId, filePath, partSize, totalParts, partUrls } =
    await initiateMultipartUpload(token, file.name, folderId, mimeType, file.size);

  const completedParts: { partNumber: number; etag: string }[] = [];
  const partProgress: number[] = new Array(totalParts).fill(0);

  const updateOverallProgress = () => {
    if (!onProgress) return;
    const totalLoaded = partProgress.reduce((a, b) => a + b, 0);
    onProgress(Math.min(99, Math.round((totalLoaded / file.size) * 100)));
  };

  // Upload parts with concurrency limit
  let cursor = 0;
  const errors: Error[] = [];

  const uploadNext = async (): Promise<void> => {
    while (cursor < totalParts) {
      const idx = cursor++;
      const part = partUrls[idx];
      const start = idx * partSize;
      const end = Math.min(start + partSize, file.size);
      const blob = file.slice(start, end);

      try {
        const etag = await uploadPart(part.uploadUrl, blob, (loaded) => {
          partProgress[idx] = loaded;
          updateOverallProgress();
        });
        completedParts.push({ partNumber: part.partNumber, etag });
      } catch (err: any) {
        errors.push(err);
        // Abort the multipart upload on any part failure
        await abortMultipartUpload(token, uploadId, filePath);
        throw new Error(`Part ${part.partNumber} failed: ${err.message}`);
      }
    }
  };

  // Run up to MAX_CONCURRENT_PARTS in parallel
  const workers = Array.from({ length: Math.min(MAX_CONCURRENT_PARTS, totalParts) }, () =>
    uploadNext()
  );
  await Promise.all(workers);

  // Complete the multipart upload
  await completeMultipartUpload(
    token, uploadId, filePath, file.name, folderId, mimeType, file.size, completedParts
  );

  onProgress?.(100);
  return { filePath, isMultipart: true };
}
