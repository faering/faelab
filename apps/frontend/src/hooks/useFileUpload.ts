import { useState } from 'react';
import { getApiBaseUrl } from '../trpc/apiBase';

type UploadType = 'image' | 'video';

type UploadResult = {
  url: string;
  filename: string;
};

type UploadError = {
  error: string;
  allowed?: string[];
  maxSize?: number;
};

export function useFileUpload(type: UploadType) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<string> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const apiBaseUrl = getApiBaseUrl();
    const endpoint = `${apiBaseUrl}/api/upload/${type}`;

    try {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setProgress(percentComplete);
        }
      });

      // Create promise wrapper for XMLHttpRequest
      const response = await new Promise<UploadResult>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText) as UploadResult;
              resolve(result);
            } catch (e) {
              reject(new Error('Invalid server response'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText) as UploadError;
              reject(new Error(errorData.error || 'Upload failed'));
            } catch (e) {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.ontimeout = () => reject(new Error('Upload timeout'));

        xhr.open('POST', endpoint);
        xhr.withCredentials = true; // Include cookies for authentication
        xhr.send(formData);
      });

      setProgress(100);
      return `${apiBaseUrl}${response.url}`;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (url: string): Promise<void> => {
    setError(null);

    try {
      // Extract filename and type from URL
      // URL format: http://localhost:3001/uploads/images/filename.jpg
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const filename = pathParts[pathParts.length - 1];
      const typeFromPath = pathParts[pathParts.length - 2]; // 'images' or 'videos'

      const apiBaseUrl = getApiBaseUrl();
      const endpoint = `${apiBaseUrl}/api/upload/${typeFromPath}/${filename}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as UploadError;
        throw new Error(errorData.error || 'Delete failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      throw err;
    }
  };

  return { upload, deleteFile, uploading, progress, error };
}
