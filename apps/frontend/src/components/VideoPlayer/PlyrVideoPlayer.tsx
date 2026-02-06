import React, { useRef, useEffect } from 'react';
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
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  className = '',
}) => {
  const plyrRef = useRef<any>(null);

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

  // Set up event listeners
  useEffect(() => {
    const player = plyrRef.current?.plyr;
    if (!player) return;

    const handlePlay = () => onPlay?.();
    const handlePause = () => onPause?.();
    const handleEnded = () => onEnded?.();
    const handleTimeUpdate = () => {
      if (onTimeUpdate && player.currentTime !== undefined) {
        onTimeUpdate(player.currentTime);
      }
    };

    player.on('play', handlePlay);
    player.on('pause', handlePause);
    player.on('ended', handleEnded);
    player.on('timeupdate', handleTimeUpdate);

    return () => {
      player.off('play', handlePlay);
      player.off('pause', handlePause);
      player.off('ended', handleEnded);
      player.off('timeupdate', handleTimeUpdate);
    };
  }, [onPlay, onPause, onEnded, onTimeUpdate]);

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
        ref={plyrRef}
        source={videoSrc}
        options={plyrOptions}
        /* @ts-ignore - plyr-react types are incomplete */
        title={title}
      />
    </div>
  );
};
