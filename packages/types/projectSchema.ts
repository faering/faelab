import { z } from "zod";

/**
 * Runtime + compile-time validation for project data
 */
export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  techStack: z.array(z.string()).min(1),
  repoUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  featured: z.boolean().optional()
});

export type Project = z.infer<typeof ProjectSchema>;
