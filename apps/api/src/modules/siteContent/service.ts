import { pool, query, queryOne } from '@portfolio/db';
import type {
  AboutBadge,
  AboutHighlight,
  AboutParagraph,
  FeaturedProject,
  SiteContent,
  SiteContentInput,
  SiteContentPreset,
  SiteContentPresetCreateInput,
  SiteContentPresetSummary,
  SiteProfile,
  SkillCategory,
  SkillItem,
  SkillTechnology,
} from '@portfolio/types';

type DbSiteProfileRow = {
  id: string;
  ownerId: string;
  heroName: string;
  heroTitle: string;
  heroBio: string;
  aboutLeftHeadline: string;
  aboutRightIcon: string;
  aboutRightTitle: string;
  aboutRightDescription: string;
  skillsIntro: string;
  contactTitle: string;
  contactSubtitle: string;
  contactEmail: string;
  contactPhone: string;
  contactLocation: string;
  updatedAt: Date;
};

type DbSiteContentPresetRow = {
  id: string;
  ownerId: string;
  name: string;
  content: SiteContentInput;
  createdAt: Date;
  updatedAt: Date;
};

type DbSiteContentPresetSummaryRow = {
  id: string;
  name: string;
  updatedAt: Date | string;
};

function toIsoString(value: Date | string) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return new Date(value).toISOString();
  return new Date(value as unknown as string).toISOString();
}

function mapProfile(row: DbSiteProfileRow): SiteProfile {
  return {
    id: row.id,
    ownerId: row.ownerId,
    heroName: row.heroName,
    heroTitle: row.heroTitle,
    heroBio: row.heroBio,
    aboutLeftHeadline: row.aboutLeftHeadline,
    aboutRightIcon: row.aboutRightIcon,
    aboutRightTitle: row.aboutRightTitle,
    aboutRightDescription: row.aboutRightDescription,
    skillsIntro: row.skillsIntro,
    contactTitle: row.contactTitle,
    contactSubtitle: row.contactSubtitle,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    contactLocation: row.contactLocation,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapPreset(row: DbSiteContentPresetRow): SiteContentPreset {
  return {
    id: row.id,
    ownerId: row.ownerId,
    name: row.name,
    content: row.content,
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
  };
}

function mapPresetSummary(row: DbSiteContentPresetSummaryRow): SiteContentPresetSummary {
  return {
    id: row.id,
    name: row.name,
    updatedAt: toIsoString(row.updatedAt),
  };
}

export async function getSiteContent(ownerId: string): Promise<SiteContent | null> {
  const profileRow = await queryOne<DbSiteProfileRow>(
    `
      SELECT
        id,
        owner_id AS "ownerId",
        hero_name AS "heroName",
        hero_title AS "heroTitle",
        hero_bio AS "heroBio",
        about_left_headline AS "aboutLeftHeadline",
        about_right_icon AS "aboutRightIcon",
        about_right_title AS "aboutRightTitle",
        about_right_description AS "aboutRightDescription",
        skills_intro AS "skillsIntro",
        contact_title AS "contactTitle",
        contact_subtitle AS "contactSubtitle",
        contact_email AS "contactEmail",
        contact_phone AS "contactPhone",
        contact_location AS "contactLocation",
        updated_at AS "updatedAt"
      FROM site_profile
      WHERE owner_id = $1
      LIMIT 1
    `,
    [ownerId],
  );

  if (!profileRow) return null;

  const profile = mapProfile(profileRow);

  const aboutParagraphs = await query<AboutParagraph>(
    `
      SELECT id,
             owner_id AS "ownerId",
             profile_id AS "profileId",
             position,
             body
      FROM about_paragraphs
      WHERE owner_id = $1 AND profile_id = $2
      ORDER BY position ASC
    `,
    [ownerId, profile.id],
  );

  const aboutBadges = await query<AboutBadge>(
    `
      SELECT id,
             owner_id AS "ownerId",
             profile_id AS "profileId",
             position,
             label,
             color
      FROM about_badges
      WHERE owner_id = $1 AND profile_id = $2
      ORDER BY position ASC
    `,
    [ownerId, profile.id],
  );

  const aboutHighlights = await query<AboutHighlight>(
    `
      SELECT id,
             owner_id AS "ownerId",
             profile_id AS "profileId",
             position,
             icon,
             title,
             description,
             color
      FROM about_highlights
      WHERE owner_id = $1 AND profile_id = $2
      ORDER BY position ASC
    `,
    [ownerId, profile.id],
  );

  const skillCategories = await query<SkillCategory>(
    `
      SELECT id,
             owner_id AS "ownerId",
             profile_id AS "profileId",
             position,
             title,
             description
      FROM skill_categories
      WHERE owner_id = $1 AND profile_id = $2
      ORDER BY position ASC
    `,
    [ownerId, profile.id],
  );

  const skillItems = await query<SkillItem>(
    `
      SELECT id,
             owner_id AS "ownerId",
             category_id AS "categoryId",
             position,
             label,
             "skillLevel" AS "skillLevel"
      FROM skill_items
      WHERE owner_id = $1
      ORDER BY position ASC
    `,
    [ownerId],
  );

  const skillTechnologies = await query<SkillTechnology>(
    `
      SELECT id,
             owner_id AS "ownerId",
             profile_id AS "profileId",
             position,
             label
      FROM skill_technologies
      WHERE owner_id = $1 AND profile_id = $2
      ORDER BY position ASC
    `,
    [ownerId, profile.id],
  );

  const featuredProjects = await query<FeaturedProject>(
    `
      SELECT owner_id AS "ownerId",
             project_id AS "projectId",
             position
      FROM featured_projects
      WHERE owner_id = $1
      ORDER BY position ASC
    `,
    [ownerId],
  );

  return {
    profile,
    aboutParagraphs,
    aboutBadges,
    aboutHighlights,
    skillCategories,
    skillItems,
    skillTechnologies,
    featuredProjects,
  };
}

export async function upsertSiteContent(ownerId: string, input: SiteContentInput): Promise<SiteContent> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existingProfile = await client.query<{ id: string }>(
      'SELECT id FROM site_profile WHERE owner_id = $1 LIMIT 1',
      [ownerId],
    );

    const profileId = existingProfile.rows[0]?.id ?? crypto.randomUUID();

    if (existingProfile.rows[0]) {
      await client.query(
        `
          UPDATE site_profile
          SET hero_name = $1,
              hero_title = $2,
              hero_bio = $3,
              about_left_headline = $4,
              about_right_icon = $5,
              about_right_title = $6,
              about_right_description = $7,
              skills_intro = $8,
              contact_title = $9,
              contact_subtitle = $10,
              contact_email = $11,
              contact_phone = $12,
              contact_location = $13,
              updated_at = NOW()
          WHERE owner_id = $14
        `,
        [
          input.profile.heroName,
          input.profile.heroTitle,
          input.profile.heroBio,
          input.profile.aboutLeftHeadline,
          input.profile.aboutRightIcon,
          input.profile.aboutRightTitle,
          input.profile.aboutRightDescription,
          input.profile.skillsIntro,
          input.profile.contactTitle,
          input.profile.contactSubtitle,
          input.profile.contactEmail,
          input.profile.contactPhone,
          input.profile.contactLocation,
          ownerId,
        ],
      );
    } else {
      await client.query(
        `
          INSERT INTO site_profile (
            id,
            owner_id,
            hero_name,
            hero_title,
            hero_bio,
            about_left_headline,
            about_right_icon,
            about_right_title,
            about_right_description,
            skills_intro,
            contact_title,
            contact_subtitle,
            contact_email,
            contact_phone,
            contact_location
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        `,
        [
          profileId,
          ownerId,
          input.profile.heroName,
          input.profile.heroTitle,
          input.profile.heroBio,
          input.profile.aboutLeftHeadline,
          input.profile.aboutRightIcon,
          input.profile.aboutRightTitle,
          input.profile.aboutRightDescription,
          input.profile.skillsIntro,
          input.profile.contactTitle,
          input.profile.contactSubtitle,
          input.profile.contactEmail,
          input.profile.contactPhone,
          input.profile.contactLocation,
        ],
      );
    }

    await client.query('DELETE FROM about_paragraphs WHERE owner_id = $1 AND profile_id = $2', [ownerId, profileId]);
    await client.query('DELETE FROM about_badges WHERE owner_id = $1 AND profile_id = $2', [ownerId, profileId]);
    await client.query('DELETE FROM about_highlights WHERE owner_id = $1 AND profile_id = $2', [ownerId, profileId]);
    await client.query('DELETE FROM skill_categories WHERE owner_id = $1 AND profile_id = $2', [ownerId, profileId]);
    await client.query('DELETE FROM skill_items WHERE owner_id = $1', [ownerId]);
    await client.query('DELETE FROM skill_technologies WHERE owner_id = $1 AND profile_id = $2', [ownerId, profileId]);
    await client.query('DELETE FROM featured_projects WHERE owner_id = $1', [ownerId]);

    for (const paragraph of input.aboutParagraphs) {
      await client.query(
        `
          INSERT INTO about_paragraphs (id, owner_id, profile_id, position, body)
          VALUES ($1,$2,$3,$4,$5)
        `,
        [paragraph.id, ownerId, profileId, paragraph.position, paragraph.body],
      );
    }

    for (const badge of input.aboutBadges) {
      await client.query(
        `
          INSERT INTO about_badges (id, owner_id, profile_id, position, label, color)
          VALUES ($1,$2,$3,$4,$5,$6)
        `,
        [badge.id, ownerId, profileId, badge.position, badge.label, badge.color ?? null],
      );
    }

    for (const highlight of input.aboutHighlights) {
      await client.query(
        `
          INSERT INTO about_highlights (id, owner_id, profile_id, position, icon, title, description, color)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        `,
        [
          highlight.id,
          ownerId,
          profileId,
          highlight.position,
          highlight.icon,
          highlight.title,
          highlight.description,
          highlight.color ?? null,
        ],
      );
    }

    for (const category of input.skillCategories) {
      await client.query(
        `
          INSERT INTO skill_categories (id, owner_id, profile_id, position, title, description)
          VALUES ($1,$2,$3,$4,$5,$6)
        `,
        [category.id, ownerId, profileId, category.position, category.title, category.description],
      );
    }

    for (const item of input.skillItems) {
      await client.query(
        `
          INSERT INTO skill_items (id, owner_id, category_id, position, label, "skillLevel")
          VALUES ($1,$2,$3,$4,$5,$6)
        `,
        [item.id, ownerId, item.categoryId, item.position, item.label, item.skillLevel],
      );
    }

    for (const tech of input.skillTechnologies) {
      await client.query(
        `
          INSERT INTO skill_technologies (id, owner_id, profile_id, position, label)
          VALUES ($1,$2,$3,$4,$5)
        `,
        [tech.id, ownerId, profileId, tech.position, tech.label],
      );
    }

    for (const featured of input.featuredProjects) {
      await client.query(
        `
          INSERT INTO featured_projects (owner_id, project_id, position)
          VALUES ($1,$2,$3)
        `,
        [ownerId, featured.projectId, featured.position],
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  const result = await getSiteContent(ownerId);
  if (!result) throw new Error('Failed to load site content after update');
  return result;
}

export async function listSiteContentPresets(ownerId: string): Promise<SiteContentPresetSummary[]> {
  const rows = await query<DbSiteContentPresetSummaryRow>(
    `
      SELECT id,
             name,
             updated_at AS "updatedAt"
      FROM site_profile_presets
      WHERE owner_id = $1
      ORDER BY updated_at DESC
    `,
    [ownerId],
  );

  return rows.map(mapPresetSummary);
}

export async function getSiteContentPreset(
  ownerId: string,
  presetId: string,
): Promise<SiteContentPreset | null> {
  if (process.env.NODE_ENV !== 'production') {
    const devRow = await queryOne<DbSiteContentPresetRow>(
      `
        SELECT id,
               owner_id AS "ownerId",
               name,
               content,
               created_at AS "createdAt",
               updated_at AS "updatedAt"
        FROM site_profile_presets
        WHERE id = $1
        LIMIT 1
      `,
      [presetId],
    );

    return devRow ? mapPreset(devRow) : null;
  }

  const row = await queryOne<DbSiteContentPresetRow>(
    `
      SELECT id,
             owner_id AS "ownerId",
             name,
             content,
             created_at AS "createdAt",
             updated_at AS "updatedAt"
      FROM site_profile_presets
      WHERE owner_id = $1 AND id = $2
      LIMIT 1
    `,
    [ownerId, presetId],
  );

  return row ? mapPreset(row) : null;
}

export async function createSiteContentPreset(
  ownerId: string,
  input: SiteContentPresetCreateInput,
): Promise<SiteContentPresetSummary> {
  const id = crypto.randomUUID();

  const row = await queryOne<DbSiteContentPresetSummaryRow>(
    `
      INSERT INTO site_profile_presets (
        id,
        owner_id,
        name,
        content
      )
      VALUES ($1,$2,$3,$4)
      RETURNING id,
                name,
                updated_at AS "updatedAt"
    `,
    [id, ownerId, input.name.trim(), input.content],
  );

  if (!row) throw new Error('Failed to create preset');
  return mapPresetSummary(row);
}
