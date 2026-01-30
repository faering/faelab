import { query, queryOne } from '@portfolio/db';
import type { CreateProjectInput, Project } from '@portfolio/types';

type DbProjectRow = Omit<Project, 'image' | 'tags' | 'repoUrl' | 'liveUrl'> & {
  image: string | null;
  tags: string[] | null;
  repoUrl: string | null;
  liveUrl: string | null;
};

function normalizeProjectRow(row: DbProjectRow): Project {
  return {
    ...row,
    image: row.image ?? undefined,
    tags: row.tags ?? undefined,
    repoUrl: row.repoUrl ?? undefined,
    liveUrl: row.liveUrl ?? undefined,
  };
}

function projectSelectSql() {
  return `
    id,
    title,
    description,
    image,
    tags,
    tech_stack AS "techStack",
    repo_url AS "repoUrl",
    live_url AS "liveUrl",
    featured
  `;
}

export async function listProjects(): Promise<Project[]> {
  const rows = await query<DbProjectRow>(
    `SELECT ${projectSelectSql()} FROM projects ORDER BY featured DESC, title ASC`,
  );

  return rows.map(normalizeProjectRow);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const row = await queryOne<DbProjectRow>(
    `SELECT ${projectSelectSql()} FROM projects WHERE id = $1`,
    [id],
  );
  return row ? normalizeProjectRow(row) : null;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const id = crypto.randomUUID();

  const row = await queryOne<DbProjectRow>(
    `
      INSERT INTO projects (
        id,
        title,
        description,
        image,
        tags,
        tech_stack,
        repo_url,
        live_url,
        featured
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING ${projectSelectSql()}
    `,
    [
      id,
      input.title,
      input.description,
      input.image ?? null,
      input.tags ?? null,
      input.techStack,
      input.repoUrl ?? null,
      input.liveUrl ?? null,
      input.featured ?? false,
    ],
  );

  if (!row) throw new Error('Insert failed');
  return normalizeProjectRow(row);
}

export async function updateProject(id: string, data: Partial<Omit<Project, 'id'>>): Promise<Project | null> {
  const assignments: string[] = [];
  const values: any[] = [id];

  const set = (col: string, value: unknown) => {
    values.push(value);
    assignments.push(`${col} = $${values.length}`);
  };

  if (data.title !== undefined) set('title', data.title);
  if (data.description !== undefined) set('description', data.description);
  if (data.image !== undefined) set('image', data.image ?? null);
  if (data.tags !== undefined) set('tags', data.tags ?? null);
  if (data.techStack !== undefined) set('tech_stack', data.techStack);
  if (data.repoUrl !== undefined) set('repo_url', data.repoUrl ?? null);
  if (data.liveUrl !== undefined) set('live_url', data.liveUrl ?? null);
  if (data.featured !== undefined) set('featured', data.featured);

  if (assignments.length === 0) return await getProjectById(id);

  const row = await queryOne<DbProjectRow>(
    `
      UPDATE projects
      SET ${assignments.join(', ')}
      WHERE id = $1
      RETURNING ${projectSelectSql()}
    `,
    values,
  );

  return row ? normalizeProjectRow(row) : null;
}

export async function deleteProject(id: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(`DELETE FROM projects WHERE id = $1 RETURNING id`, [id]);
  return !!row;
}
