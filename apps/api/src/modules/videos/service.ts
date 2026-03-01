import { query, queryOne } from '@faelab/db';
import type { CreateVideoInput, Video } from '@faelab/types';
import { deleteUploadedFile, deleteUploadedFiles } from '../../utils/fileCleanup.js';

type DbVideoRow = Omit<Video, 'videoUrl' | 'thumbnailUrl' | 'tags' | 'duration' | 'createdAt' | 'updatedAt'> & {
  video_url: string;
  thumbnail_url: string | null;
  tags: string[] | null;
  duration: number | null;
  created_at: Date;
  updated_at: Date;
};

function normalizeVideoRow(row: DbVideoRow): Video {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    videoUrl: row.video_url,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    duration: row.duration ?? undefined,
    tags: row.tags ?? undefined,
    featured: row.featured,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function videoSelectSql() {
  return `
    id,
    title,
    description,
    video_url,
    thumbnail_url,
    duration,
    tags,
    featured,
    created_at,
    updated_at
  `;
}

export async function listVideos(): Promise<Video[]> {
  const rows = await query<DbVideoRow>(
    `SELECT ${videoSelectSql()} FROM videos ORDER BY created_at DESC`,
  );

  return rows.map(normalizeVideoRow);
}

export async function getVideoById(id: string): Promise<Video | null> {
  const row = await queryOne<DbVideoRow>(
    `SELECT ${videoSelectSql()} FROM videos WHERE id = $1`,
    [id],
  );
  return row ? normalizeVideoRow(row) : null;
}

export async function createVideo(input: CreateVideoInput): Promise<Video> {
  const id = crypto.randomUUID();

  const row = await queryOne<DbVideoRow>(
    `
      INSERT INTO videos (
        id,
        title,
        description,
        video_url,
        thumbnail_url,
        duration,
        tags,
        featured
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING ${videoSelectSql()}
    `,
    [
      id,
      input.title,
      input.description,
      input.videoUrl,
      input.thumbnailUrl ?? null,
      input.duration ?? null,
      input.tags ?? null,
      input.featured ?? false,
    ],
  );

  if (!row) throw new Error('Insert failed');
  return normalizeVideoRow(row);
}

export async function updateVideo(id: string, data: Partial<Omit<Video, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Video | null> {
  // If updating video or thumbnail, get old URLs for cleanup
  const filesToCleanup: string[] = [];
  if (data.videoUrl !== undefined || data.thumbnailUrl !== undefined) {
    const existing = await getVideoById(id);
    if (existing) {
      if (data.videoUrl !== undefined && existing.videoUrl !== data.videoUrl) {
        filesToCleanup.push(existing.videoUrl);
      }
      if (data.thumbnailUrl !== undefined && existing.thumbnailUrl && existing.thumbnailUrl !== data.thumbnailUrl) {
        filesToCleanup.push(existing.thumbnailUrl);
      }
    }
  }

  const assignments: string[] = [];
  const values: any[] = [id];

  const set = (col: string, value: unknown) => {
    values.push(value);
    assignments.push(`${col} = $${values.length}`);
  };

  if (data.title !== undefined) set('title', data.title);
  if (data.description !== undefined) set('description', data.description);
  if (data.videoUrl !== undefined) set('video_url', data.videoUrl);
  if (data.thumbnailUrl !== undefined) set('thumbnail_url', data.thumbnailUrl ?? null);
  if (data.duration !== undefined) set('duration', data.duration ?? null);
  if (data.tags !== undefined) set('tags', data.tags ?? null);
  if (data.featured !== undefined) set('featured', data.featured);

  // Always update the updated_at timestamp
  set('updated_at', new Date());

  if (assignments.length === 1) return await getVideoById(id); // Only updated_at changed

  const row = await queryOne<DbVideoRow>(
    `
      UPDATE videos
      SET ${assignments.join(', ')}
      WHERE id = $1
      RETURNING ${videoSelectSql()}
    `,
    values,
  );

  // Clean up old files if update was successful
  if (row && filesToCleanup.length > 0) {
    deleteUploadedFiles(filesToCleanup);
  }

  return row ? normalizeVideoRow(row) : null;
}

export async function deleteVideo(id: string): Promise<boolean> {
  // Get video to retrieve file URLs before deletion
  const video = await getVideoById(id);
  
  const row = await queryOne<{ id: string }>(`DELETE FROM videos WHERE id = $1 RETURNING id`, [id]);
  const deleted = !!row;
  
  // Clean up video and thumbnail files if deletion was successful
  if (deleted && video) {
    const filesToCleanup: string[] = [video.videoUrl];
    if (video.thumbnailUrl) {
      filesToCleanup.push(video.thumbnailUrl);
    }
    deleteUploadedFiles(filesToCleanup);
  }
  
  return deleted;
}
