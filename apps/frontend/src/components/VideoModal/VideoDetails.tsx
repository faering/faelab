import React from 'react';
import type { Video } from '../../../../../packages/types/videoSchema';

/**
 * Helper to format duration in seconds to MM:SS or HH:MM:SS
 */
function formatDuration(seconds: number | undefined): string {
  if (!seconds) return '0:00';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface VideoDetailsProps {
  video: Omit<Video, 'createdAt' | 'updatedAt'> & {
    createdAt?: string | Date;
    updatedAt?: string | Date;
  };
  className?: string;
}

/**
 * VideoDetails component
 * 
 * Displays video metadata in a clean, reusable format.
 * Can be used in modals, dedicated pages, or anywhere else.
 */
export const VideoDetails: React.FC<VideoDetailsProps> = ({ video, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {video.title}
        </h2>
      </div>

      {/* Badges row */}
      {(video.featured || video.duration) && (
        <div className="flex items-center gap-2">
          {video.featured && (
            <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Featured
            </span>
          )}
          {video.duration && (
            <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              {formatDuration(video.duration)}
            </span>
          )}
        </div>
      )}

      {/* Description */}
      {video.description && (
        <div>
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {video.description}
          </p>
        </div>
      )}

      {/* Tags */}
      {video.tags && video.tags.length > 0 && (
        <div>
          <div className="flex flex-wrap gap-2">
            {video.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Date */}
      {video.createdAt && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Published {new Date(video.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      )}
    </div>
  );
};
