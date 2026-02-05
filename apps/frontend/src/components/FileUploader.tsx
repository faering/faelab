import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Video as VideoIcon, AlertCircle, Loader2 } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';

type FileUploaderProps = {
  type: 'image' | 'video';
  value?: string;                           // Current file URL
  onChange: (url: string | null) => void;   // Called with URL or null on delete
  maxSizeMB?: number;                       // Optional, defaults: 5 for images, 100 for videos
  accept?: string;                          // Optional, has sensible defaults
  className?: string;                       // Optional styling class
  label?: string;                           // Optional label above the uploader
};

const DEFAULT_ACCEPT = {
  image: 'image/jpeg,image/png,image/webp,image/gif',
  video: 'video/mp4,video/webm,video/quicktime',
};

const DEFAULT_MAX_SIZE = {
  image: 5,
  video: 100,
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUploader({
  type,
  value,
  onChange,
  maxSizeMB = DEFAULT_MAX_SIZE[type],
  accept = DEFAULT_ACCEPT[type],
  className = '',
  label,
}: FileUploaderProps) {
  const { upload, deleteFile, uploading, progress, error } = useFileUpload(type);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeBytes) {
      return `File too large. Maximum size is ${maxSizeMB}MB`;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map((t) => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFile = async (file: File) => {
    setValidationError(null);

    const validationErr = validateFile(file);
    if (validationErr) {
      setValidationError(validationErr);
      return;
    }

    try {
      const url = await upload(file);
      onChange(url);
    } catch (err) {
      // Error is already set in the hook
      console.error('Upload error:', err);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleDelete = async () => {
    if (!value) return;
    if (!window.confirm(`Delete this ${type}?`)) return;

    try {
      await deleteFile(value);
      onChange(null);
    } catch (err) {
      // Error is already set in the hook
      console.error('Delete error:', err);
    }
  };

  const displayError = validationError || error;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</div>
      )}

      {value && !uploading ? (
        // Preview existing file
        <div className="relative group rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900/50">
          {type === 'image' ? (
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
              <VideoIcon size={64} className="text-slate-400" />
            </div>
          )}

          {/* Delete button overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              <X size={18} />
            </button>
            <button
              type="button"
              onClick={handleClick}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              Replace
            </button>
          </div>

          {/* File URL display */}
          <div className="px-3 py-2 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate" title={value}>
              {value}
            </div>
          </div>
        </div>
      ) : (
        // Upload dropzone
        <div
          className={`relative rounded-xl border-2 border-dashed transition-all ${
            dragActive
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50'
          } ${uploading ? 'pointer-events-none' : 'cursor-pointer hover:border-purple-400'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="px-6 py-8 text-center">
            {uploading ? (
              <>
                <Loader2 size={48} className="mx-auto text-purple-500 animate-spin" />
                <div className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                  Uploading... {progress}%
                </div>
                <div className="mt-2 w-full max-w-xs mx-auto bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-600 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                {type === 'image' ? (
                  <ImageIcon size={48} className="mx-auto text-slate-400" />
                ) : (
                  <VideoIcon size={48} className="mx-auto text-slate-400" />
                )}
                <div className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <Upload size={16} className="inline mr-1 -mt-1" />
                  Drop {type} here or click to upload
                </div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Max size: {maxSizeMB}MB • Formats: {accept.split(',').map(t => t.split('/')[1]).join(', ')}
                </div>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
            disabled={uploading}
          />
        </div>
      )}

      {displayError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/60 dark:bg-red-950/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}
