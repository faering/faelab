import { z } from "zod";

/**
 * Runtime + compile-time validation for video data
 */
export const VideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  videoUrl: z.string(), // Local path like /uploads/videos/...
  thumbnailUrl: z.string().optional(), // Local path like /uploads/images/...
  duration: z.number().int().positive().optional(), // Duration in seconds
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const VideoIdSchema = z.string().min(1);

export const CreateVideoInputSchema = VideoSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const UpdateVideoInputSchema = z
  .object({
    id: VideoIdSchema,
    data: VideoSchema.omit({ 
      id: true, 
      createdAt: true, 
      updatedAt: true 
    }).partial(),
  })
  .refine((v) => Object.keys(v.data).length > 0, {
    message: 'At least one field must be provided to update',
    path: ['data'],
  });

export const DeleteVideoInputSchema = z.object({
  id: VideoIdSchema,
});

export type Video = z.infer<typeof VideoSchema>;

export type CreateVideoInput = z.infer<typeof CreateVideoInputSchema>;
export type UpdateVideoInput = z.infer<typeof UpdateVideoInputSchema>;
export type DeleteVideoInput = z.infer<typeof DeleteVideoInputSchema>;
