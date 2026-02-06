/**
 * VideoPlayer barrel export
 * 
 * This file provides the public API for the VideoPlayer component.
 * The actual implementation (Plyr, react-player, etc.) is hidden from consumers.
 * 
 * To switch player libraries, simply change the import below and update
 * the implementation file. Consuming components do not need to change.
 */

// Export the interface for TypeScript consumers
export type { VideoPlayerProps } from './VideoPlayer';

// Export the actual implementation
// To switch to a different player library (e.g., react-player),
// replace this import with the new implementation:
// export { ReactVideoPlayer as VideoPlayer } from './ReactVideoPlayer';
export { PlyrVideoPlayer as VideoPlayer } from './PlyrVideoPlayer';
