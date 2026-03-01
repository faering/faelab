import React from 'react';
import { Plyr } from 'plyr-react';
import 'plyr-react/plyr.css';
import type { VideoPlayerProps } from './VideoPlayer';

/**
 * Plyr implementation of the VideoPlayer interface
 * 
 * This component wraps plyr-react and adapts it to our
 * abstract VideoPlayer interface.
 */
export const PlyrVideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  autoplay = false,
  muted = false,
  controls = true,
  className = '',
}) => {
  // Plyr configuration options
  const plyrOptions = {
    controls: controls
      ? [
          'play-large',
          'play',
          'progress',
          'current-time',
          'duration',
          'mute',
          'volume',
          'settings',
          'fullscreen',
        ]
      : [],
    autoplay,
    muted,
    clickToPlay: true,
    keyboard: { focused: true, global: false },
    tooltips: { controls: true, seek: true },
    settings: ['quality', 'speed', 'loop'],
    speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
  };

  // Video source configuration for Plyr
  const videoSrc = {
    type: 'video' as const,
    sources: [
      {
        src,
        type: 'video/mp4', // You might want to infer this from the file extension
      },
    ],
    poster,
  };

  return (
    <div className={className}>
      <Plyr
        source={videoSrc}
        options={plyrOptions}
        /* @ts-ignore - plyr-react types are incomplete */
        title={title}
      />
    </div>
  );
};
