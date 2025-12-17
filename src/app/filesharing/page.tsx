'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { PrivateRoute } from '@/components/PrivateRoute';
import { useAuth } from '@/context/AuthContext';
import {
  Upload,
  Download,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  File as FileIcon,
  Info,
  Lock,
  Users,
  Clock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

type UploadResult = {
  success: boolean;
  shareCode: string;
  expiryTime: string;
  maxDownloads?: number | null;
  password?: string | null;
  passwordRequired?: boolean;
};

type FileInfo = {
  originalFilename: string;
  fileSize: number;
  uploadTime: string;
  expiryTime: string;
  isExpired?: boolean;
  downloadsRemaining?: number | null;
  passwordRequired?: boolean;
};

type ManagedFile = {
  fileId: string;
  originalFilename: string;
  fileSize: number;
  uploadTime: string;
  expiryTime: string;
  isExpired: boolean;
};

const FILE_SHARING_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/file-sharing`;

const generatePassword = (length = 16) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%&*-_';
  let out = '';
  const arr = crypto.getRandomValues(new Uint32Array(length));
  for (let i = 0; i < length; i++) {
    out += chars[arr[i] % chars.length];
  }
  return out;
};

const formatBytes = (bytes?: number) => {
  if (!bytes) return 'Unknown';
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const formatDate = (val?: string) => {
  if (!val) return '—';
  return new Date(val).toLocaleString();
};

const authHeaders = (token: string | null, extra: Record<string, string> = {}) =>
  token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };

function UploadPanel({ token }: { token: string | null }) {
  const [file, setFile] = useState<File | null>(null);
  const [expiryHours, setExpiryHours] = useState<string>('24');
  const [maxDownloads, setMaxDownloads] = useState<string>('');
  const [recipientFirstName, setRecipientFirstName] = useState<string>('');
  const [password, setPassword] = useState<string>(generatePassword());
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // Ensure password is always present
  useEffect(() => {
    if (!password) setPassword(generatePassword());
  }, [password]);

  // Auto-generate password when file is selected
  useEffect(() => {
    if (file && !password) {
      setPassword(generatePassword());
    }
  }, [file, password]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer?.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
      if (!password) setPassword(generatePassword());
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Select a file to upload');
      return;
    }
    if (!recipientFirstName.trim()) {
      toast.error('Recipient first name is required');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      if (expiryHours) form.append('expiryHours', expiryHours);
      if (maxDownloads) form.append('maxDownloads', maxDownloads);
      form.append('recipientFirstName', recipientFirstName.trim());
      form.append('password', password);

      const res = await fetch(`${FILE_SHARING_BASE}/api/files/upload`, {
        method: 'POST',
        headers: authHeaders(token),
        body: form,
      });
      const data = (await res.json()) as UploadResult & { error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }
      setResult(data);
      toast.success('File uploaded and shared successfully!');
      setFile(null);
      setRecipientFirstName('');
      setPassword(generatePassword());
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success('Copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload &amp; Share</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Files are sent through the Nemesis gateway with Arc Reactor X-User headers to the file sharing service.
            </p>
          </div>
          <ShieldCheck className="h-6 w-6 text-blue-500" />
        </div>

        <div className="mt-6 space-y-4">
          {/* File Drop Zone */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">File</label>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <input
                type="file"
                onChange={e => {
                  const selectedFile = e.target.files?.[0] || null;
                  setFile(selectedFile);
                  if (selectedFile && !password) setPassword(generatePassword());
                }}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    or click to select a file
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Maximum file size: 100MB
                  </p>
                </div>
              </label>
            </div>
            {file && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Remove file</span>
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Recipient First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={recipientFirstName}
              onChange={e => setRecipientFirstName(e.target.value)}
              placeholder="Enter recipient's first name (as registered in organization)"
              required
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              The recipient must be a registered user in the organization. You cannot share with yourself.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Expiry (hours)</label>
              <select
                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                value={expiryHours}
                onChange={e => setExpiryHours(e.target.value)}
              >
                <option value="0.083">5 minutes</option>
                <option value="0.167">10 minutes</option>
                <option value="0.25">15 minutes</option>
                <option value="0.5">30 minutes</option>
                <option value="1">1 hour</option>
                <option value="6">6 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
                <option value="72">72 hours</option>
                <option value="168">7 days</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Max downloads (optional)</label>
              <input
                type="number"
                min={1}
                value={maxDownloads}
                onChange={e => setMaxDownloads(e.target.value)}
                placeholder="Unlimited"
                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Download password (required)</label>
              <input
                type="text"
                value={password}
                readOnly
                className="rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPassword(generatePassword())}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate password
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(password);
                    toast.success('Password copied');
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Copy className="h-4 w-4" />
                  Copy password
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || !file || !recipientFirstName.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {uploading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload file
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Check className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-medium text-green-900 dark:text-green-100">
                  File Uploaded Successfully!
                </h3>
                <p className="text-green-800 dark:text-green-200 mt-1">
                  Your file has been encrypted and uploaded securely.
                </p>
              </div>
            </div>
          </div>

          {/* Share Information */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Share Information</h3>
            
            <div className="space-y-4">
              {/* Share Code */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Share Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={result.shareCode}
                    readOnly
                    onClick={() => handleCopy(result.password ? `${result.shareCode}\n${result.password}` : result.shareCode)}
                    className="input flex-1 font-mono text-lg cursor-pointer rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                    title={result.password ? "Click to copy share code and password" : "Click to copy share code"}
                  />
                  <button
                    onClick={() => handleCopy(result.password ? `${result.shareCode}\n${result.password}` : result.shareCode)}
                    className="inline-flex items-center justify-center p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    {result.password 
                      ? 'Click the share code or button to copy both share code and password.'
                      : 'Share this code with others to allow them to download the file.'}
                  </span>
                  <button
                    onClick={() => {
                      const origin = typeof window !== 'undefined' ? window.location.origin : '';
                      const password = result.password || '';
                      const shareLink = `${origin}/filesharing?code=${result.shareCode}&password=${encodeURIComponent(password)}`;
                      handleCopy(shareLink);
                      toast.success('Share link copied (includes password).');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    <Copy className="h-4 w-4" />
                    COPY LINK
                  </button>
                </div>
              </div>

              {/* Password Display */}
              {result.password && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Password
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={result.password}
                      readOnly
                      onClick={() => handleCopy(`${result.shareCode}\n${result.password}`)}
                      className="input flex-1 font-mono text-lg cursor-pointer rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                      title="Click to copy share code and password"
                    />
                    <button
                      onClick={() => handleCopy(`${result.shareCode}\n${result.password}`)}
                      className="inline-flex items-center justify-center p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Recipients need both the share code and password to download the file.
                  </p>
                </div>
              )}

              {/* File Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Expires</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(result.expiryTime)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Max Downloads</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {result.maxDownloads || 'Unlimited'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Lock className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Password Protected</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {result.passwordRequired || result.password ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Share Actions */}
          {result.password && (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Share Options</h3>
              
              {/* Main Copy Link Button - Big and Bold */}
              <div className="mb-4">
                <button
                  onClick={() => {
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    const password = result.password || '';
                    const shareLink = `${origin}/filesharing?code=${result.shareCode}&password=${encodeURIComponent(password)}`;
                    handleCopy(shareLink);
                    toast.success('Link copied! Share this link - the password is included in the URL.');
                  }}
                  className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Copy className="h-6 w-6" />
                  COPY SHARE LINK
                </button>
              </div>
              
              {/* Share to Teams and Slack */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <button
                  onClick={() => {
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    const password = result.password || '';
                    const shareLink = `${origin}/filesharing?code=${result.shareCode}&password=${encodeURIComponent(password)}`;
                    const teamsUrl = `https://teams.microsoft.com/share?href=${encodeURIComponent(shareLink)}&referrer=${encodeURIComponent(window.location.origin)}`;
                    window.open(teamsUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-[#6264A7] hover:bg-[#505172] text-white text-sm font-semibold transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.5 4.5h-15A1.5 1.5 0 003 6v12a1.5 1.5 0 001.5 1.5h15a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5zm-10.5 9H6v-3h3v3zm4.5 0h-3v-3h3v3zm4.5 0h-3v-3h3v3z"/>
                  </svg>
                  Share to Teams
                </button>
                
                <button
                  onClick={() => {
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    const password = result.password || '';
                    const shareLink = `${origin}/filesharing?code=${result.shareCode}&password=${encodeURIComponent(password)}`;
                    // Slack doesn't have a direct share URL, so we copy to clipboard
                    // Users can paste it in Slack manually or use Slack's /share command
                    handleCopy(shareLink);
                    toast.success('Link copied! Paste it in your Slack channel or use /share command.');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-[#4A154B] hover:bg-[#3d1140] text-white text-sm font-semibold transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.165 0a2.528 2.528 0 012.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0124 18.956a2.528 2.528 0 01-2.522-2.52h-2.523v2.52zM15.165 17.688a2.528 2.528 0 01-2.523-2.522 2.528 2.528 0 012.523-2.521h6.312A2.528 2.528 0 0124 15.166a2.528 2.528 0 01-2.522 2.522h-6.313z"/>
                  </svg>
                  Share to Slack
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`/filesharing?code=${result.shareCode}&password=${encodeURIComponent(result.password)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Download className="h-4 w-4" />
                  Open download link
                </a>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                The link includes the password in the URL. When the recipient opens the link, the password will be automatically filled. Share only this link with authorized recipients.
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">Instructions for Recipients:</h4>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
              <li>Click the shared link (or copy and open it in a browser)</li>
              <li>The share code and password will be automatically filled from the link</li>
              <li>File information will be automatically loaded</li>
              <li>Click "Download File" to save to their device</li>
            </ol>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-3 font-medium">
              ⚠️ Security: Only share the link with authorized recipients. The password is included in the link URL.
            </p>
          </div>

          {/* Upload Another File */}
          <div className="text-center">
            <button
              onClick={() => {
                setResult(null);
                setFile(null);
                setRecipientFirstName('');
                setPassword(generatePassword());
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Upload Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DownloadPanel({ token }: { token: string | null }) {
  const [shareCode, setShareCode] = useState('');
  const [password, setPassword] = useState('');
  const [info, setInfo] = useState<FileInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fetchingRef = useRef(false);
  const [availableFiles, setAvailableFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const normalizedCode = useMemo(() => shareCode.trim().toUpperCase(), [shareCode]);

  // Handle paste event to detect share code + password
  const handlePaste = async (e: React.ClipboardEvent, fieldType: 'code' | 'password') => {
    try {
      const pastedText = e.clipboardData.getData('text') || await navigator.clipboard.readText().catch(() => '');
      if (!pastedText) return false;
      
      const lines = pastedText.split(/\n|\r\n/).map(line => line.trim()).filter(line => line);
      
      if (lines.length >= 2) {
        let code: string | null = null;
        let pass: string | null = null;
        
        if (lines.length === 2) {
          const firstLine = lines[0].trim();
          const secondLine = lines[1].trim();
          
          if (firstLine.match(/^[A-Z0-9]{6,12}$/i)) {
            code = firstLine.toUpperCase();
            pass = secondLine;
          }
        }
        
        if (code && pass) {
          e.preventDefault();
          setShareCode(code);
          setPassword(pass);
          toast.success('Share code and password pasted!');
          setTimeout(() => {
            fetchInfo(code);
          }, 100);
          return true;
        } else if (code && fieldType === 'code') {
          e.preventDefault();
          setShareCode(code);
          toast.success('Share code pasted!');
          return true;
        }
      } else if (lines.length === 1 && fieldType === 'code') {
        const text = lines[0].trim();
        if (text.match(/^[A-Z0-9]{6,12}$/i)) {
          e.preventDefault();
          setShareCode(text.toUpperCase());
          toast.success('Share code pasted!');
          return true;
        }
      }
    } catch (error) {
      console.log('Paste detection failed:', error);
    }
    return false;
  };

  // Fetch available files for the user
  const fetchAvailableFiles = async () => {
    if (!token) return;
    setLoadingFiles(true);
    try {
      const res = await fetch(`${FILE_SHARING_BASE}/api/files/recipient`, {
        headers: authHeaders(token),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAvailableFiles(data.files || []);
      }
    } catch (err: any) {
      console.error('Failed to load available files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Auto-populate from URL parameters on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    const passwordParam = params.get('password');
    
    if (codeParam) {
      setShareCode(codeParam.toUpperCase());
    }
    if (passwordParam) {
      // URLSearchParams.get() already decodes the value, so we don't need decodeURIComponent
      // Using try/catch as a safety measure in case of any edge cases
      try {
        setPassword(passwordParam);
      } catch (error) {
        console.error('Error parsing password from URL:', error);
        // If decoding fails, try to use the raw value
        setPassword(passwordParam);
      }
    }
    
    // Auto-fetch info if code is provided (password will be auto-filled from URL)
    if (codeParam) {
      setTimeout(() => {
        fetchInfo(codeParam.toUpperCase());
      }, 100);
    }

    // Load available files if user is authenticated
    if (token) {
      fetchAvailableFiles();
    }
  }, [token]);

  const fetchInfo = async (codeToUse?: string) => {
    const code = codeToUse || normalizedCode;
    if (!code) {
      toast.error('Enter a share code');
      return;
    }
    
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoadingInfo(true);
    try {
      const res = await fetch(`${FILE_SHARING_BASE}/api/files/info/${encodeURIComponent(code)}`, {
        headers: authHeaders(token),
      });
      const data = await res.json();
      if (!res.ok) {
        // Don't show error toast for 400/404 if code came from URL - user might not have entered it
        const isFromUrl = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('code');
        if (!isFromUrl || (res.status !== 400 && res.status !== 404)) {
          toast.error(data.error || 'Failed to load file information');
        }
        setInfo(null);
        return;
      }
      if (!data.success) {
        setInfo(null);
        toast.error(data.error || 'Invalid share code');
        return;
      }
      setInfo(data.fileInfo as FileInfo);
      // Only show success if user manually clicked "Get Info"
      if (!codeToUse) {
        toast.success('File information retrieved');
      }
    } catch (err: any) {
      setInfo(null);
      // Only show error if it's a network error, not a 400/404
      if (err?.message && !err.message.includes('400') && !err.message.includes('404')) {
        toast.error(err?.message || 'Failed to load info');
      }
      console.error('Error fetching file info:', err);
    } finally {
      setLoadingInfo(false);
      fetchingRef.current = false;
    }
  };

  const download = async () => {
    if (!normalizedCode) {
      toast.error('Enter a share code');
      return;
    }
    setDownloading(true);
    try {
      const res = await fetch(`${FILE_SHARING_BASE}/api/files/download`, {
        method: 'POST',
        headers: authHeaders(token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ shareCode: normalizedCode, password: password || undefined }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Download failed');
      }

      const blob = await res.blob();
      if (blob.size === 0) throw new Error('Empty file');

      const disposition = res.headers.get('content-disposition') || '';
      const match = disposition.match(/filename="?(.+?)"?$/i);
      const filename = match ? decodeURIComponent(match[1]) : `${normalizedCode}.bin`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (err: any) {
      toast.error(err?.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const isExpired = info?.expiryTime && new Date() > new Date(info.expiryTime);

  const handleFileSelect = (file: any) => {
    setShareCode(file.shareCode);
    if (file.password) {
      setPassword(file.password);
    }
    fetchInfo(file.shareCode);
  };

  return (
    <div className="space-y-6">
      {/* Available Files Section */}
      {token && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Files Available for Download</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {availableFiles.length > 0 
                  ? 'Click on a file to auto-fill the share code and password'
                  : 'No files are currently available for download'}
              </p>
            </div>
            <button
              onClick={fetchAvailableFiles}
              disabled={loadingFiles}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loadingFiles ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          {loadingFiles ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading files...
            </div>
          ) : availableFiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleFileSelect(file)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    file.canDownload
                      ? 'border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-md bg-white dark:bg-gray-800'
                      : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <FileIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    {file.canDownload ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">
                    {file.originalFilename}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    From: {file.sharerName}
                  </p>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div>Size: {formatBytes(file.fileSize)}</div>
                    <div>Expires: {formatDate(file.expiryTime)}</div>
                    {file.downloadsRemaining !== null && (
                      <div>Downloads left: {file.downloadsRemaining}</div>
                    )}
                  </div>
                  {!file.canDownload && (
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                      {file.isExpired ? 'Expired' : file.downloadsExceeded ? 'Max downloads reached' : 'Unavailable'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No files have been shared with you yet
              </p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Download File</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter the share code provided by the sender to download their file securely
            </p>
          </div>
          <Download className="h-6 w-6 text-blue-500" />
        </div>

        <div className="space-y-4">
          {/* Share Code Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Share Code
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={shareCode}
                onChange={e => {
                  const value = e.target.value.toUpperCase().trim();
                  const cleaned = value.replace(/[^A-Z0-9]/g, '').substring(0, 12);
                  setShareCode(cleaned);
                }}
                onPaste={e => handlePaste(e, 'code')}
                placeholder="Paste share code (or code + password together)"
                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 flex-1"
                maxLength={12}
              />
              <button
                onClick={() => fetchInfo()}
                disabled={!normalizedCode || loadingInfo}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingInfo ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Info className="h-4 w-4" />}
                Get Info
              </button>
            </div>
          </div>

          {/* File Info Display */}
          {info && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-start">
                {isExpired ? (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{info.originalFilename}</h4>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center">
                      <FileIcon className="h-4 w-4 mr-1" />
                      Size: {formatBytes(info.fileSize)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Uploaded: {formatDate(info.uploadTime)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Expires: {formatDate(info.expiryTime)}
                    </div>
                    {info.downloadsRemaining !== null && info.downloadsRemaining !== undefined && (
                      <div className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        Downloads remaining: {info.downloadsRemaining}
                      </div>
                    )}
                    {isExpired && (
                      <div className="flex items-center text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        File has expired
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              <Lock className="inline h-4 w-4 mr-1" />
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onPaste={e => handlePaste(e, 'password')}
                placeholder="Enter the password provided by the sender (or paste code+password in share code field)"
                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 pr-10 text-sm focus:ring-1 focus:ring-blue-500 w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              The password is required along with the share code to download the file.
            </p>
          </div>

          {/* Download Button */}
          <button
            onClick={download}
            disabled={!normalizedCode || !password.trim() || downloading || !!(info?.isExpired || isExpired)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-blue-600 text-white text-base font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            title={!password.trim() ? 'Password is required' : ''}
          >
            {downloading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download File
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How to download:</h4>
        <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
          <li>If you received a link, the share code and password are automatically filled</li>
          <li>If you received a code and password separately, enter them manually</li>
          <li>Click "Get Info" to view file details (optional, auto-loaded if using a link)</li>
          <li>Click "Download File" to save to your device</li>
        </ol>
      </div>
    </div>
  );
}

function RecipientPanel({ token }: { token: string | null }) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fetchFiles = async () => {
    if (!token) {
      console.warn('[RecipientPanel] No token available, cannot fetch files');
      toast.error('Please log in to view files shared with you');
      return;
    }
    setLoading(true);
    try {
      const headers = authHeaders(token);
      console.log('[RecipientPanel] Fetching files with token:', { 
        hasToken: !!token, 
        tokenLength: token?.length,
        hasAuthHeader: !!headers.Authorization 
      });
      
      const res = await fetch(`${FILE_SHARING_BASE}/api/files/recipient`, {
        headers,
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          console.error('[RecipientPanel] 401 Unauthorized:', data);
          throw new Error(data.error || data.message || 'Authentication required. Please log in again.');
        }
        throw new Error(data.error || 'Failed to load files');
      }
      if (!data.success) {
        throw new Error(data.error || 'Failed to load files');
      }
      setFiles(data.files || []);
    } catch (err: any) {
      setFiles([]);
      const errorMsg = err?.message || 'Failed to load shared files';
      toast.error(errorMsg);
      console.error('[RecipientPanel] Error fetching recipient files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFiles();
    }
  }, [token]);

  const handleCopyLink = async (file: any, index: number) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const password = file.password || '';
    const shareLink = `${origin}/filesharing?code=${file.shareCode}&password=${encodeURIComponent(password)}`;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast.success('Share link copied!');
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleDownload = async (file: any) => {
    if (!file.canDownload) {
      toast.error('This file cannot be downloaded (expired or max downloads reached)');
      return;
    }

    try {
      const res = await fetch(`${FILE_SHARING_BASE}/api/files/download`, {
        method: 'POST',
        headers: authHeaders(token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          shareCode: file.shareCode,
          password: file.password || undefined
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Download failed');
      }

      const blob = await res.blob();
      if (blob.size === 0) throw new Error('Empty file');

      const disposition = res.headers.get('content-disposition') || '';
      const match = disposition.match(/filename="?(.+?)"?$/i);
      const filename = match ? decodeURIComponent(match[1]) : file.originalFilename || `${file.shareCode}.bin`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Download started');
      
      // Refresh file list to update download counts
      setTimeout(() => fetchFiles(), 1000);
    } catch (err: any) {
      toast.error(err?.message || 'Download failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Files Shared With Me</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View and download files that have been shared with you
          </p>
        </div>
        <button
          onClick={fetchFiles}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading files…</div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No files shared with you</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Files shared with you will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {files.map((file, index) => (
              <div key={file.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileIcon className="h-8 w-8 text-blue-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{file.originalFilename}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Shared by: {file.sharerName} {file.sharerEmail && `(${file.sharerEmail})`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Size:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{formatBytes(file.fileSize)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Expires:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{formatDate(file.expiryTime)}</span>
                      </div>
                      {file.downloadsRemaining !== null && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Downloads left:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{file.downloadsRemaining}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                        <span className={`ml-2 ${file.canDownload ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {file.isExpired ? 'Expired' : file.downloadsExceeded ? 'Max reached' : 'Available'}
                        </span>
                      </div>
                    </div>

                    {/* Share Code and Password */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Share Code:</span>
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                          {file.shareCode}
                        </code>
                        {file.password && (
                          <>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 ml-4">Password:</span>
                            <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                              {file.password}
                            </code>
                          </>
                        )}
                        {!file.password && file.hasPassword && (
                          <span className="text-xs text-amber-600 dark:text-amber-400 ml-2">
                            (Password required - contact sender)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleCopyLink(file, index)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy Link
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDownload(file)}
                      disabled={!file.canDownload}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ManagePanel({ token }: { token: string | null }) {
  const [files, setFiles] = useState<ManagedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [fileFilter, setFileFilter] = useState<'all' | 'active' | 'expired'>('all');

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${FILE_SHARING_BASE}/api/files/list`, { headers: authHeaders(token) });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load files');
      }
      setFiles(data.files as ManagedFile[]);
    } catch (err: any) {
      setFiles([]);
      toast.error(err?.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFiles();
    }
  }, [token]);

  const runCleanup = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`${FILE_SHARING_BASE}/api/files/cleanup`, {
        method: 'POST',
        headers: authHeaders(token, { 'Content-Type': 'application/json' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Cleanup failed');
      toast.success('Cleanup completed');
      fetchFiles();
    } catch (err: any) {
      toast.error(err?.message || 'Cleanup failed');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Delete this file?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${FILE_SHARING_BASE}/api/files/${encodeURIComponent(fileId)}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Delete failed');
      toast.success('File deleted');
      setFiles(prev => prev.filter(f => f.fileId !== fileId));
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Manage files</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Admin-only view using Arc Reactor to forward X-User headers.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchFiles}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={runCleanup}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            Run cleanup
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex items-center space-x-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Filter:</span>
        <div className="flex space-x-2">
          <button
            onClick={() => setFileFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              fileFilter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All ({files.length})
          </button>
          <button
            onClick={() => setFileFilter('active')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              fileFilter === 'active'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Active ({files.filter(f => !f.isExpired).length})
          </button>
          <button
            onClick={() => setFileFilter('expired')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              fileFilter === 'expired'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Expired ({files.filter(f => f.isExpired).length})
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading files…</div>
        ) : (() => {
          const filteredFiles = files.filter((file) => {
            if (fileFilter === 'all') return true;
            if (fileFilter === 'active') return !file.isExpired;
            if (fileFilter === 'expired') return file.isExpired;
            return true;
          });
          
          return filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {fileFilter === 'all' ? 'No files' : fileFilter === 'active' ? 'No active files' : 'No expired files'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {fileFilter === 'all' 
                  ? 'No files have been uploaded yet.' 
                  : fileFilter === 'active'
                  ? 'No active files found. Try selecting a different filter.'
                  : 'No expired files found. Try selecting a different filter.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">File</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Size</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Uploaded</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Expires</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredFiles.map(file => (
                  <tr key={file.fileId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{file.originalFilename}</div>
                      <div className="text-xs text-gray-500">{file.fileId}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatBytes(file.fileSize)}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(file.uploadTime)}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(file.expiryTime)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          file.isExpired
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {file.isExpired ? 'Expired' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteFile(file.fileId)}
                        disabled={actionLoading}
                        className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default function FileSharingPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'download' | 'recipient' | 'manage'>('upload');

  // Auto-switch to download tab if URL has code parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('code')) {
        setActiveTab('download');
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'manage' && user?.role !== 'admin') {
      setActiveTab('upload');
    }
  }, [activeTab, user?.role]);

  const isAdmin = user?.role === 'admin';

  return (
    <PrivateRoute allowedRoles={['admin', 'user']} redirectTo="/auth/user/login">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase text-gray-500 tracking-wide">Nemesis · File Sharing</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Secure File Sharing</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Routed through Arc Reactor proxy so the backend receives X-User-* headers.
            </p>
          </div>
          <ShieldCheck className="h-8 w-8 text-blue-500" />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'upload', label: 'Upload', icon: <Upload className="h-4 w-4" /> },
            { key: 'download', label: 'Download', icon: <Download className="h-4 w-4" /> },
            { key: 'recipient', label: 'Files Shared With Me', icon: <Users className="h-4 w-4" /> },
            ...(isAdmin
              ? [{ key: 'manage', label: 'Manage (admin)', icon: <ShieldCheck className="h-4 w-4" /> }]
              : []),
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'upload' | 'download' | 'recipient' | 'manage')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'upload' && <UploadPanel token={token} />}
        {activeTab === 'download' && <DownloadPanel token={token} />}
        {activeTab === 'recipient' && <RecipientPanel token={token} />}
        {activeTab === 'manage' && isAdmin && <ManagePanel token={token} />}
      </div>
    </PrivateRoute>
  );
}

