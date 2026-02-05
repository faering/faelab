import React from 'react';
import { trpc } from '../../trpc/trpc';
import type { Video } from '../../../../../packages/types/videoSchema';

export default function VideosPage() {
  const { data: videos, isLoading, isError } = trpc.videos.list.useQuery();

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          Videos
        </h1>
        <p className="text-center text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
          Watch tutorials, demos, and other video content.
        </p>

        {isLoading && (
          <div className="text-center text-slate-600 dark:text-slate-300 py-12">
            Loading videos...
          </div>
        )}

        {isError && (
          <div className="text-center text-red-600 dark:text-red-400 py-12">
            Failed to load videos. Please try again later.
          </div>
        )}

        {videos && videos.length === 0 && (
          <div className="text-center text-slate-600 dark:text-slate-300 py-12">
            No videos available yet.
          </div>
        )}

        {videos && videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-gray-900 hover:shadow-xl transition-shadow"
              >
                {/* Video thumbnail or video element */}
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={video.videoUrl}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                  )}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/70 text-white text-xs font-medium">
                      {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                    </div>
                  )}
                  {video.featured && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-purple-600 text-white text-xs font-medium">
                      Featured
                    </div>
                  )}
                </div>

                {/* Video info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                    {video.description}
                  </p>
                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {video.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
