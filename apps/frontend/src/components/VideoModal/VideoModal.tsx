import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Video } from '../../../../../packages/types/videoSchema';
import { VideoPlayer } from '../VideoPlayer/index';
import { VideoDetails } from './VideoDetails';
import { getApiBaseUrl } from '../../trpc/apiBase';

interface VideoModalProps {
  video: (Omit<Video, 'createdAt' | 'updatedAt'> & {
    createdAt?: string | Date;
    updatedAt?: string | Date;
  }) | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * VideoModal component
 * 
 * Full-screen modal for video playback with metadata display.
 * Features:
 * - Overlay with backdrop blur
 * - ESC key to close
 * - Click outside to close
 * - Smooth fade + scale animations
 * - Body scroll lock when open
 * - Responsive sizing
 */
export const VideoModal: React.FC<VideoModalProps> = ({ video, isOpen, onClose }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Don't render if not open or no video
  if (!isOpen || !video) return null;

  // Build the full video URL using the same base URL as API calls
  const apiBaseUrl = getApiBaseUrl();
  const videoUrl = video.videoUrl.startsWith('http') 
    ? video.videoUrl 
    : `${apiBaseUrl}${video.videoUrl}`;
  
  const posterUrl = video.thumbnailUrl?.startsWith('http')
    ? video.thumbnailUrl
    : video.thumbnailUrl 
      ? `${apiBaseUrl}${video.thumbnailUrl}`
      : undefined;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-modal-title"
      >
        <div
          className="relative w-full max-w-5xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl pointer-events-auto animate-scale-up overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            aria-label="Close video modal"
          >
            <X size={24} />
          </button>

          {/* Video Player */}
          <div className="aspect-video bg-black">
            <VideoPlayer
              src={videoUrl}
              poster={posterUrl}
              title={video.title}
              controls
              autoplay
            />
          </div>

          {/* Video Details */}
          <div className="p-6">
            <VideoDetails video={video} />
          </div>
        </div>
      </div>
    </>
  );
};
