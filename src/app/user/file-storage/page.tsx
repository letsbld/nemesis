'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { PrivateRoute } from '@/components/PrivateRoute';
import { useAuth } from '@/context/AuthContext';
import {
  Upload,
  Download,
  FolderPlus,
  Folder as FolderIcon,
  File as FileIcon,
  Trash2,
  ChevronRight,
  Home,
  MoreVertical,
  Edit3,
  Move,
  RefreshCw,
  HardDrive,
  X,
  Check,
  ArrowLeft,
  Eye,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ensureRootFolder,
  getFolderContents,
  createFolder,
  renameFolder,
  deleteFolder,
  getUploadUrl,
  confirmUpload,
  uploadFileDirect,
  uploadFileAuto,
  getDownloadUrl,
  deleteFile,
  type Folder,
  type DSFile,
} from '@/lib/file-storage-service';

const formatBytes = (bytes?: number) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const formatDate = (val?: string) => {
  if (!val) return '—';
  return new Date(val).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return '📦';
  if (mimeType.includes('text')) return '📃';
  return '📎';
};

export default function FileStoragePage() {
  return (
    <PrivateRoute>
      <FileStorageContent />
    </PrivateRoute>
  );
}

function FileStorageContent() {
  const { user } = useAuth();
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('authToken') || localStorage.getItem('token')
      : null;

  const [loading, setLoading] = useState(true);
  const [rootFolderId, setRootFolderId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [subfolders, setSubfolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<DSFile[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([]);

  // UI states
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  const [uploadingFiles, setUploadingFiles] = useState<
    { name: string; progress: number; status: 'uploading' | 'confirming' | 'done' | 'error' }[]
  >([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Context menu
  const [contextMenu, setContextMenu] = useState<{
    type: 'folder' | 'file';
    id: string;
    name: string;
    x: number;
    y: number;
  } | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Image preview
  const [previewFile, setPreviewFile] = useState<DSFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Initialize root folder
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const root = await ensureRootFolder(token);
        setRootFolderId(root.id);
        setCurrentFolderId(root.id);
        setBreadcrumbs([{ id: root.id, name: 'My Files' }]);
      } catch (err: any) {
        toast.error(err?.message || 'Failed to initialize storage');
      }
    })();
  }, [token]);

  // Load folder contents
  const loadFolder = useCallback(
    async (folderId: string) => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await getFolderContents(token, folderId);
        setCurrentFolder(data.folder);
        setSubfolders(data.subfolders);
        setFiles(data.files);
      } catch (err: any) {
        toast.error(err?.message || 'Failed to load folder');
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (currentFolderId) loadFolder(currentFolderId);
  }, [currentFolderId, loadFolder]);

  // Navigate to folder
  const navigateToFolder = (folder: Folder) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setContextMenu(null);
  };

  // Breadcrumb navigation
  const navigateToBreadcrumb = (index: number) => {
    const target = breadcrumbs[index];
    setCurrentFolderId(target.id);
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  // Go back
  const goBack = () => {
    if (breadcrumbs.length > 1) {
      navigateToBreadcrumb(breadcrumbs.length - 2);
    }
  };

  // Create folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !currentFolderId || !token) return;
    setCreatingFolder(true);
    try {
      await createFolder(token, newFolderName.trim(), currentFolderId);
      toast.success(`Folder "${newFolderName}" created`);
      setNewFolderName('');
      setShowNewFolder(false);
      loadFolder(currentFolderId);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create folder');
    } finally {
      setCreatingFolder(false);
    }
  };

  // Rename folder
  const handleRename = async () => {
    if (!renaming || !renameValue.trim() || !token) return;
    try {
      await renameFolder(token, renaming.id, renameValue.trim());
      toast.success('Renamed successfully');
      setRenaming(null);
      if (currentFolderId) loadFolder(currentFolderId);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to rename');
    }
  };

  // Delete folder
  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (!token) return;
    if (!confirm(`Delete folder "${folderName}" and all its contents? This cannot be undone.`)) return;
    try {
      await deleteFolder(token, folderId);
      toast.success(`Folder "${folderName}" deleted`);
      if (currentFolderId) loadFolder(currentFolderId);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete folder');
    }
    setContextMenu(null);
  };

  // Upload files
  const handleFileUpload = async (fileList: FileList) => {
    if (!currentFolderId || !token) return;

    const filesToUpload = Array.from(fileList);
    const uploadEntries = filesToUpload.map((f) => ({
      name: f.name,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadingFiles((prev) => [...prev, ...uploadEntries]);

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const entryIndex = uploadingFiles.length + i;

      try {
        // Smart upload: auto-selects single vs multipart based on file size
        const { filePath, isMultipart } = await uploadFileAuto(
          token,
          file,
          currentFolderId,
          (percent) => {
            setUploadingFiles((prev) =>
              prev.map((entry, idx) =>
                idx === entryIndex ? { ...entry, progress: percent } : entry
              )
            );
          }
        );

        // For single uploads, confirm the upload (multipart already confirms via complete)
        if (!isMultipart) {
          setUploadingFiles((prev) =>
            prev.map((entry, idx) =>
              idx === entryIndex ? { ...entry, status: 'confirming', progress: 100 } : entry
            )
          );

          await confirmUpload(
            token,
            file.name,
            currentFolderId,
            filePath,
            file.size,
            file.type || 'application/octet-stream'
          );
        }

        setUploadingFiles((prev) =>
          prev.map((entry, idx) =>
            idx === entryIndex ? { ...entry, status: 'done', progress: 100 } : entry
          )
        );

        toast.success(`"${file.name}" uploaded`);
      } catch (err: any) {
        setUploadingFiles((prev) =>
          prev.map((entry, idx) =>
            idx === entryIndex ? { ...entry, status: 'error' } : entry
          )
        );
        toast.error(`Failed to upload "${file.name}": ${err?.message || 'Unknown error'}`);
      }
    }

    // Refresh folder
    if (currentFolderId) loadFolder(currentFolderId);

    // Clear completed uploads after a delay
    setTimeout(() => {
      setUploadingFiles((prev) => prev.filter((e) => e.status === 'uploading' || e.status === 'confirming'));
    }, 3000);
  };

  // Download file
  const handleDownloadFile = async (fileId: string) => {
    if (!token) return;
    try {
      const { downloadUrl, fileName } = await getDownloadUrl(token, fileId);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading "${fileName}"`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to download file');
    }
    setContextMenu(null);
  };

  // Delete file
  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!token) return;
    if (!confirm(`Delete "${fileName}"? This cannot be undone.`)) return;
    try {
      await deleteFile(token, fileId);
      toast.success(`"${fileName}" deleted`);
      if (currentFolderId) loadFolder(currentFolderId);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete file');
    }
    setContextMenu(null);
  };

  // Preview image
  const handlePreviewFile = async (file: DSFile) => {
    if (!token) return;
    setPreviewFile(file);
    setPreviewLoading(true);
    try {
      const { downloadUrl } = await getDownloadUrl(token, file.id);
      setPreviewUrl(downloadUrl);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load preview');
      setPreviewFile(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
    else if (e.type === 'dragleave') setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer?.files?.length) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Close context menu on click outside + Escape to close preview
  useEffect(() => {
    const close = () => setContextMenu(null);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewFile(null);
        setPreviewUrl(null);
      }
    };
    document.addEventListener('click', close);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const isImageFile = (mimeType: string) => mimeType.startsWith('image/');

  const totalSize = files.reduce((acc, f) => acc + Number(f.size), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
            <HardDrive className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">File Storage</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {files.length} files · {formatBytes(totalSize)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewFolder(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FolderPlus className="h-4 w-4" />
            New Folder
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium hover:from-violet-700 hover:to-purple-700 shadow-md shadow-violet-500/20 transition-all"
          >
            <Upload className="h-4 w-4" />
            Upload Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 py-2.5 border border-gray-200 dark:border-gray-700">
        {breadcrumbs.length > 1 && (
          <button
            onClick={goBack}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded mr-1 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-gray-500" />
          </button>
        )}
        {breadcrumbs.map((bc, i) => (
          <span key={bc.id} className="flex items-center">
            {i > 0 && <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />}
            <button
              onClick={() => navigateToBreadcrumb(i)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
                i === breadcrumbs.length - 1
                  ? 'font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {i === 0 && <Home className="h-3.5 w-3.5" />}
              {bc.name}
            </button>
          </span>
        ))}
      </div>

      {/* New Folder Input */}
      {showNewFolder && (
        <div className="bg-white dark:bg-gray-800 border border-violet-200 dark:border-violet-700 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <FolderPlus className="h-5 w-5 text-violet-500" />
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            placeholder="Folder name..."
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
          />
          <button
            onClick={handleCreateFolder}
            disabled={creatingFolder || !newFolderName.trim()}
            className="p-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setShowNewFolder(false);
              setNewFolderName('');
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Uploading</h3>
          {uploadingFiles.map((u, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300 truncate max-w-[70%]">{u.name}</span>
                <span className="text-gray-500 text-xs">
                  {u.status === 'done'
                    ? '✅ Done'
                    : u.status === 'error'
                    ? '❌ Error'
                    : u.status === 'confirming'
                    ? 'Confirming...'
                    : `${u.progress}%`}
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    u.status === 'done'
                      ? 'bg-green-500'
                      : u.status === 'error'
                      ? 'bg-red-500'
                      : 'bg-gradient-to-r from-violet-500 to-purple-500'
                  }`}
                  style={{ width: `${u.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop Zone / File Grid */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`bg-white dark:bg-gray-800 border-2 rounded-xl transition-all min-h-[400px] ${
          isDragActive
            ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20 shadow-lg shadow-violet-500/10'
            : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 text-violet-500 animate-spin" />
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center justify-center h-64 text-violet-600 dark:text-violet-400">
            <Upload className="h-16 w-16 mb-4 animate-bounce" />
            <p className="text-xl font-semibold">Drop files to upload</p>
            <p className="text-sm text-violet-500">Files will be uploaded to the current folder</p>
          </div>
        ) : subfolders.length === 0 && files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <HardDrive className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">This folder is empty</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Drop files here or use the upload button
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/80 rounded-t-xl">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-3">Modified</div>
              <div className="col-span-1"></div>
            </div>

            {/* Folders */}
            {subfolders.map((folder) => (
              <div
                key={folder.id}
                className="grid grid-cols-12 gap-4 px-5 py-3 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer group transition-colors"
              >
                {renaming?.id === folder.id ? (
                  <div className="col-span-6 flex items-center gap-2">
                    <FolderIcon className="h-5 w-5 text-violet-500 flex-shrink-0" />
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename();
                        if (e.key === 'Escape') setRenaming(null);
                      }}
                      autoFocus
                      className="flex-1 bg-transparent border border-violet-300 rounded px-2 py-1 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-violet-500"
                    />
                    <button onClick={handleRename} className="p-1 text-green-500 hover:text-green-600">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setRenaming(null)} className="p-1 text-gray-400 hover:text-gray-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="col-span-6 flex items-center gap-3"
                    onClick={() => navigateToFolder(folder)}
                  >
                    <FolderIcon className="h-5 w-5 text-violet-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {folder.name}
                    </span>
                  </div>
                )}
                <div className="col-span-2 text-sm text-gray-400">—</div>
                <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(folder.created_at)}
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenu({
                        type: 'folder',
                        id: folder.id,
                        name: folder.name,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Files */}
            {files.map((file) => (
              <div
                key={file.id}
                className={`grid grid-cols-12 gap-4 px-5 py-3 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors ${isImageFile(file.mime_type) ? 'cursor-pointer' : ''}`}
                onClick={() => isImageFile(file.mime_type) && handlePreviewFile(file)}
              >
                <div className="col-span-6 flex items-center gap-3">
                  <span className="text-lg flex-shrink-0">{getFileIcon(file.mime_type)}</span>
                  <span className="text-sm text-gray-900 dark:text-white truncate">{file.name}</span>
                  {isImageFile(file.mime_type) && (
                    <Eye className="h-3.5 w-3.5 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  )}
                </div>
                <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
                  {formatBytes(file.size)}
                </div>
                <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(file.created_at)}
                </div>
                <div className="col-span-1 flex justify-end gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownloadFile(file.id); }}
                    className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenu({
                        type: 'file',
                        id: file.id,
                        name: file.name,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-2 min-w-[180px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'file' && (
            <button
              onClick={() => handleDownloadFile(contextMenu.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          )}
          {contextMenu.type === 'folder' && (
            <button
              onClick={() => {
                setRenaming({ id: contextMenu.id, name: contextMenu.name });
                setRenameValue(contextMenu.name);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              Rename
            </button>
          )}
          <button
            onClick={() =>
              contextMenu.type === 'folder'
                ? handleDeleteFolder(contextMenu.id, contextMenu.name)
                : handleDeleteFile(contextMenu.id, contextMenu.name)
            }
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => { setPreviewFile(null); setPreviewUrl(null); }}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg">{getFileIcon(previewFile.mime_type)}</span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{previewFile.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(previewFile.size)} · {formatDate(previewFile.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleDownloadFile(previewFile.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
                <button
                  onClick={() => { setPreviewFile(null); setPreviewUrl(null); }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Preview Body */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950 min-h-[300px]">
              {previewLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="h-8 w-8 text-violet-500 animate-spin" />
                  <p className="text-sm text-gray-500">Loading preview...</p>
                </div>
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt={previewFile.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  onError={() => {
                    toast.error('Failed to load image');
                    setPreviewFile(null);
                    setPreviewUrl(null);
                  }}
                />
              ) : (
                <p className="text-gray-500">Unable to load preview</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
