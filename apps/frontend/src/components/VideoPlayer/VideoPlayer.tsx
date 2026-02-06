import React from 'react';

/**
 * Abstract video player interface
 * 
 * This component provides a unified API for video playback,
 * allowing the underlying player library to be swapped without
 * affecting consuming components.
 */

export interface VideoPlayerProps {
  /** Video source URL */
  src: string;
  
  /** Poster/thumbnail image URL */
  poster?: string;
  
  /** Video title (for accessibility) */
  title?: string;
  
  /** Auto-play video when loaded */
  autoplay?: boolean;
  
  /** Start muted (useful with autoplay) */
  muted?: boolean;
  
  /** Show player controls */
  controls?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * VideoPlayer component
 * 
 * Import this component from the barrel export:
 * ```
 * import { VideoPlayer } from '@/components/VideoPlayer';
 * ```
 * 
 * The actual implementation (Plyr, react-player, etc.) is abstracted away.
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = (_props) => {
  // This is imported from the barrel export and will be
  // automatically replaced with the actual implementation
  throw new Error('VideoPlayer must be imported from the barrel export (index.ts)');
};
