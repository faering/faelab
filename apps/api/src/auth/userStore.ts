import { queryOne } from '@portfolio/db';

export type UserRecord = {
  id: string;
  githubId: number;
  githubLogin: string;
  displayName: string | null;
};

export async function upsertUserFromGitHub(input: {
  githubId: number;
  githubLogin: string;
  displayName?: string | null;
}): Promise<UserRecord> {
  const row = await queryOne<UserRecord>(
    `
      INSERT INTO users (id, github_id, github_login, display_name)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (github_id)
      DO UPDATE SET github_login = EXCLUDED.github_login,
                    display_name = EXCLUDED.display_name
      RETURNING id,
                github_id AS "githubId",
                github_login AS "githubLogin",
                display_name AS "displayName"
    `,
    [
      crypto.randomUUID(),
      input.githubId,
      input.githubLogin,
      input.displayName ?? null,
    ],
  );

  if (!row) {
    throw new Error('Failed to upsert user');
  }

  return row;
}
