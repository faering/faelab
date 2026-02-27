import type { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import staticFiles from '@fastify/static';
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { join, extname } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { uploadConfig } from '../config/upload.js';
import { getSession } from '../auth/sessionStore.js';
import { isDevBypassEnabled, getDevSession } from '../auth/devBypass.js';

type UploadType = 'image' | 'video';

function getUploadConfig(type: UploadType) {
  return type === 'image' ? uploadConfig.images : uploadConfig.videos;
}

function ensureUploadDir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

function generateFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const ext = extname(originalFilename);
  const basename = sanitizeFilename(originalFilename.replace(ext, ''));
  return `${basename}-${timestamp}-${randomStr}${ext}`;
}

async function checkAuth(request: any): Promise<boolean> {
  const sessionId = request.cookies?.admin_session;
  const session = isDevBypassEnabled() ? getDevSession() : await getSession(sessionId);
  return Boolean(session);
}

export async function registerFileUpload(app: FastifyInstance) {
  // Register multipart plugin
  await app.register(multipart, {
    limits: {
      fileSize: Number(process.env.UPLOAD_MAX_FILE_SIZE) || 104857600, // 100MB default
    },
  });

  // Ensure upload directories exist
  ensureUploadDir(uploadConfig.images.uploadDir);
  ensureUploadDir(uploadConfig.videos.uploadDir);

  // Register static file serving for uploads
  const uploadBaseDir = process.env.UPLOAD_BASE_DIR || './uploads';
  await app.register(staticFiles, {
    root: join(process.cwd(), uploadBaseDir),
    prefix: '/uploads/',
    decorateReply: false,
  });

  // Upload image endpoint
  app.post('/api/upload/image', async (request, reply) => {
    const isAuthorized = await checkAuth(request);
    if (!isAuthorized) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ error: 'No file provided' });
    }

    const config = getUploadConfig('image');

    // Validate mime type
    if (!config.allowedMimeTypes.includes(data.mimetype)) {
      return reply.code(400).send({
        error: 'Invalid file type',
        allowed: config.allowedMimeTypes,
      });
    }

    // Validate file size
    if (data.file.bytesRead > config.maxFileSize) {
      return reply.code(400).send({
        error: 'File too large',
        maxSize: config.maxFileSize,
      });
    }

    const filename = generateFilename(data.filename);
    const filepath = join(config.uploadDir, filename);

    try {
      await pipeline(data.file, createWriteStream(filepath));
      const url = `${config.urlPrefix}/${filename}`;

      app.log.info(`Image uploaded: ${url}`);
      return reply.send({ url, filename });
    } catch (error) {
      app.log.error('Upload failed:', error);
      return reply.code(500).send({ error: 'Upload failed' });
    }
  });

  // Upload video endpoint
  app.post('/api/upload/video', async (request, reply) => {
    const isAuthorized = await checkAuth(request);
    if (!isAuthorized) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ error: 'No file provided' });
    }

    const config = getUploadConfig('video');

    // Validate mime type
    if (!config.allowedMimeTypes.includes(data.mimetype)) {
      return reply.code(400).send({
        error: 'Invalid file type',
        allowed: config.allowedMimeTypes,
      });
    }

    // Validate file size
    if (data.file.bytesRead > config.maxFileSize) {
      return reply.code(400).send({
        error: 'File too large',
        maxSize: config.maxFileSize,
      });
    }

    const filename = generateFilename(data.filename);
    const filepath = join(config.uploadDir, filename);

    try {
      await pipeline(data.file, createWriteStream(filepath));
      const url = `${config.urlPrefix}/${filename}`;

      app.log.info(`Video uploaded: ${url}`);
      return reply.send({ url, filename });
    } catch (error) {
      app.log.error('Upload failed:', error);
      return reply.code(500).send({ error: 'Upload failed' });
    }
  });

  // Delete file endpoint
  app.delete('/api/upload/:type/:filename', async (request, reply) => {
    const isAuthorized = await checkAuth(request);
    if (!isAuthorized) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const { type, filename } = request.params as { type: string; filename: string };

    if (type !== 'images' && type !== 'videos') {
      return reply.code(400).send({ error: 'Invalid type. Must be "images" or "videos"' });
    }

    // Sanitize filename to prevent directory traversal
    const sanitized = sanitizeFilename(filename);
    if (sanitized !== filename || filename.includes('..') || filename.includes('/')) {
      return reply.code(400).send({ error: 'Invalid filename' });
    }

    const uploadDir = type === 'images' ? uploadConfig.images.uploadDir : uploadConfig.videos.uploadDir;
    const filepath = join(uploadDir, filename);

    try {
      if (!existsSync(filepath)) {
        return reply.code(404).send({ error: 'File not found' });
      }

      unlinkSync(filepath);
      app.log.info(`File deleted: ${filepath}`);
      return reply.send({ success: true });
    } catch (error) {
      app.log.error('Delete failed:', error);
      return reply.code(500).send({ error: 'Delete failed' });
    }
  });
}
