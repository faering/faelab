import { existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { uploadConfig } from '../config/upload.js';

/**
 * Extract filename from upload URL
 * URL format: http://localhost:3001/uploads/images/filename.jpg
 * or just: /uploads/images/filename.jpg
 */
function extractFilenameFromUrl(url: string): { type: 'images' | 'videos'; filename: string } | null {
  try {
    // Handle both full URLs and relative paths
    const path = url.includes('://') ? new URL(url).pathname : url;
    
    // Split path and find uploads segment
    const parts = path.split('/').filter(Boolean);
    const uploadsIndex = parts.indexOf('uploads');
    
    if (uploadsIndex === -1 || uploadsIndex + 2 >= parts.length) {
      return null;
    }
    
    const type = parts[uploadsIndex + 1];
    const filename = parts[uploadsIndex + 2];
    
    if ((type !== 'images' && type !== 'videos') || !filename) {
      return null;
    }
    
    return { type, filename };
  } catch {
    return null;
  }
}

/**
 * Delete an uploaded file from disk
 */
export function deleteUploadedFile(url: string): boolean {
  if (!url) return false;
  
  const extracted = extractFilenameFromUrl(url);
  if (!extracted) return false;
  
  const { type, filename } = extracted;
  const uploadDir = type === 'images' ? uploadConfig.images.uploadDir : uploadConfig.videos.uploadDir;
  const filepath = join(uploadDir, filename);
  
  try {
    if (existsSync(filepath)) {
      unlinkSync(filepath);
      console.log(`[FileCleanup] Deleted: ${filepath}`);
      return true;
    }
  } catch (error) {
    console.error(`[FileCleanup] Failed to delete ${filepath}:`, error);
  }
  
  return false;
}

/**
 * Delete multiple uploaded files from disk
 */
export function deleteUploadedFiles(urls: string[]): number {
  let deleted = 0;
  
  for (const url of urls) {
    if (deleteUploadedFile(url)) {
      deleted++;
    }
  }
  
  return deleted;
}
