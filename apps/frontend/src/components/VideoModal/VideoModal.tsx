import React, { useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
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
 * 
 * Features:
 * - Overlay with backdrop blur
 * - ESC key to close
 * - Click outside to close
 * - Smooth fade + scale animations
 * - Body scroll lock when open
 * - Responsive sizing
 * - Focus management (focus trap)
 * - ARIA accessibility labels
 * - Loading and error states
 */
export const VideoModal: React.FC<VideoModalProps> = ({ video, isOpen, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const [videoError, setVideoError] = React.useState<string | null>(null);

  // Lock body scroll and manage focus when modal opens
  useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      previousActiveElement.current = document.activeElement;
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      // Focus close button for keyboard accessibility
      setTimeout(() => closeButtonRef.current?.focus(), 0);
    } else {
      // Unlock body scroll
      document.body.style.overflow = '';
      // Restore focus to previously focused element
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  // Handle focus trap (keep focus within modal)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !isOpen || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        // Shift + Tab
        if (activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  // Simulate video load error for demo (in real app, catch video loading errors)
  // const handleVideoError = () => {
  //   setVideoError('Failed to load video. Please try again later.');
  // };

  // Clear error when modal closes
  useEffect(() => {
    if (!isOpen) {
      setVideoError(null);
    }
  }, [isOpen]);

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
        ref={modalRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-modal-title"
        aria-describedby="video-modal-description"
      >
        <div
          className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-2xl pointer-events-auto animate-scale-up overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            aria-label="Close video modal (press Escape)"
          >
            <X size={24} />
          </button>

          {/* Video Player */}
          <div className="w-full flex-shrink-0 aspect-video bg-black relative">
            {videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="flex flex-col items-center gap-3 text-white">
                  <AlertCircle size={48} className="text-red-400" />
                  <p className="text-center max-w-xs">{videoError}</p>
                </div>
              </div>
            )}
            {!videoError && (
              <VideoPlayer
                src={videoUrl}
                poster={posterUrl}
                title={video.title}
                controls
                autoplay
              />
            )}
          </div>

          {/* Video Details */}
          <div
            className="flex-1 overflow-y-auto p-6"
            id="video-modal-description"
            role="region"
            aria-live="polite"
          >
            <h2 id="video-modal-title" className="sr-only">
              {video.title}
            </h2>
            <VideoDetails video={video} />
          </div>
        </div>
      </div>
    </>
  );
};
