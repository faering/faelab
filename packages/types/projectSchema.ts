import { z } from "zod";

/**
 * Runtime + compile-time validation for project data
 */
export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.string().optional(), // Changed from .url() to support local paths like /uploads/images/...
  tags: z.array(z.string()).optional(),
  techStack: z.array(z.string()).min(1),
  repoUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  featured: z.boolean().optional()
});

export const ProjectIdSchema = z.string().min(1);

export const CreateProjectInputSchema = ProjectSchema.omit({ id: true });

export const UpdateProjectInputSchema = z
  .object({
    id: ProjectIdSchema,
    data: ProjectSchema.omit({ id: true }).partial(),
  })
  .refine((v) => Object.keys(v.data).length > 0, {
    message: 'At least one field must be provided to update',
    path: ['data'],
  });

export const DeleteProjectInputSchema = z.object({
  id: ProjectIdSchema,
});

export type Project = z.infer<typeof ProjectSchema>;

export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>;
export type DeleteProjectInput = z.infer<typeof DeleteProjectInputSchema>;