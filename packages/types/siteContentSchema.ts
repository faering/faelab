import { z } from 'zod';

export const SiteProfileSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  heroName: z.string(),
  heroTitle: z.string(),
  heroBio: z.string(),
  aboutLeftHeadline: z.string(),
  aboutRightIcon: z.string(),
  aboutRightTitle: z.string(),
  aboutRightDescription: z.string(),
  skillsIntro: z.string(),
  contactTitle: z.string(),
  contactSubtitle: z.string(),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
  contactLocation: z.string(),
  updatedAt: z.string(),
});

export const AboutParagraphSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  profileId: z.string(),
  position: z.number().int().nonnegative(),
  body: z.string(),
});

export const AboutBadgeSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  profileId: z.string(),
  position: z.number().int().nonnegative(),
  label: z.string(),
  color: z.string().optional().nullable(),
});

export const SkillCategorySchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  profileId: z.string(),
  position: z.number().int().nonnegative(),
  title: z.string(),
  description: z.string(),
});

export const SkillItemSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  categoryId: z.string(),
  position: z.number().int().nonnegative(),
  label: z.string(),
});

export const SkillTechnologySchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  profileId: z.string(),
  position: z.number().int().nonnegative(),
  label: z.string(),
});

export const FeaturedProjectSchema = z.object({
  ownerId: z.string(),
  projectId: z.string(),
  position: z.number().int().nonnegative(),
});

export const SiteContentSchema = z.object({
  profile: SiteProfileSchema,
  aboutParagraphs: z.array(AboutParagraphSchema),
  aboutBadges: z.array(AboutBadgeSchema),
  skillCategories: z.array(SkillCategorySchema),
  skillItems: z.array(SkillItemSchema),
  skillTechnologies: z.array(SkillTechnologySchema),
  featuredProjects: z.array(FeaturedProjectSchema),
});

export type SiteProfile = z.infer<typeof SiteProfileSchema>;
export type AboutParagraph = z.infer<typeof AboutParagraphSchema>;
export type AboutBadge = z.infer<typeof AboutBadgeSchema>;
export type SkillCategory = z.infer<typeof SkillCategorySchema>;
export type SkillItem = z.infer<typeof SkillItemSchema>;
export type SkillTechnology = z.infer<typeof SkillTechnologySchema>;
export type FeaturedProject = z.infer<typeof FeaturedProjectSchema>;
export type SiteContent = z.infer<typeof SiteContentSchema>;
