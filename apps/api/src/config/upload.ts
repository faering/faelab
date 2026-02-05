export const uploadConfig = {
  images: {
    uploadDir: './uploads/images',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    urlPrefix: '/uploads/images'
  },
  videos: {
    uploadDir: './uploads/videos',
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    urlPrefix: '/uploads/videos'
  }
} as const;