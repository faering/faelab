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

export const SiteProfileInputSchema = SiteProfileSchema.omit({
  id: true,
  ownerId: true,
  updatedAt: true,
});

export const AboutParagraphSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  profileId: z.string(),
  position: z.number().int().nonnegative(),
  body: z.string(),
});

export const AboutParagraphInputSchema = AboutParagraphSchema.pick({
  id: true,
  position: true,
  body: true,
});

export const AboutBadgeSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  profileId: z.string(),
  position: z.number().int().nonnegative(),
  label: z.string(),
  color: z.string().optional().nullable(),
});

export const AboutBadgeInputSchema = AboutBadgeSchema.pick({
  id: true,
  position: true,
  label: true,
  color: true,
});

export const SkillCategorySchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  profileId: z.string(),
  position: z.number().int().nonnegative(),
  title: z.string(),
  description: z.string(),
});

export const SkillCategoryInputSchema = SkillCategorySchema.pick({
  id: true,
  position: true,
  title: true,
  description: true,
});

export const SkillItemSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  categoryId: z.string(),
  position: z.number().int().nonnegative(),
  label: z.string(),
});

export const SkillItemInputSchema = SkillItemSchema.pick({
  id: true,
  categoryId: true,
  position: true,
  label: true,
});

export const SkillTechnologySchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  profileId: z.string(),
  position: z.number().int().nonnegative(),
  label: z.string(),
});

export const SkillTechnologyInputSchema = SkillTechnologySchema.pick({
  id: true,
  position: true,
  label: true,
});

export const FeaturedProjectSchema = z.object({
  ownerId: z.string(),
  projectId: z.string(),
  position: z.number().int().nonnegative(),
});

export const FeaturedProjectInputSchema = FeaturedProjectSchema.pick({
  projectId: true,
  position: true,
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

export const SiteContentInputSchema = z.object({
  profile: SiteProfileInputSchema,
  aboutParagraphs: z.array(AboutParagraphInputSchema),
  aboutBadges: z.array(AboutBadgeInputSchema),
  skillCategories: z.array(SkillCategoryInputSchema),
  skillItems: z.array(SkillItemInputSchema),
  skillTechnologies: z.array(SkillTechnologyInputSchema),
  featuredProjects: z.array(FeaturedProjectInputSchema),
});

export type SiteProfile = z.infer<typeof SiteProfileSchema>;
export type AboutParagraph = z.infer<typeof AboutParagraphSchema>;
export type AboutBadge = z.infer<typeof AboutBadgeSchema>;
export type SkillCategory = z.infer<typeof SkillCategorySchema>;
export type SkillItem = z.infer<typeof SkillItemSchema>;
export type SkillTechnology = z.infer<typeof SkillTechnologySchema>;
export type FeaturedProject = z.infer<typeof FeaturedProjectSchema>;
export type SiteContent = z.infer<typeof SiteContentSchema>;

export type SiteProfileInput = z.infer<typeof SiteProfileInputSchema>;
export type AboutParagraphInput = z.infer<typeof AboutParagraphInputSchema>;
export type AboutBadgeInput = z.infer<typeof AboutBadgeInputSchema>;
export type SkillCategoryInput = z.infer<typeof SkillCategoryInputSchema>;
export type SkillItemInput = z.infer<typeof SkillItemInputSchema>;
export type SkillTechnologyInput = z.infer<typeof SkillTechnologyInputSchema>;
export type FeaturedProjectInput = z.infer<typeof FeaturedProjectInputSchema>;
export type SiteContentInput = z.infer<typeof SiteContentInputSchema>;
