import { query, queryOne } from '@faelab/db';

export type AdminSession = {
  id: string;
  userId: string;
  githubId: number;
  login: string;
  createdAt: number;
  expiresAt: number;
};

type DbSessionRow = {
  id: string;
  userId: string;
  githubId: number;
  login: string;
  createdAt: Date;
  expiresAt: Date;
};

function toSession(row: DbSessionRow): AdminSession {
  return {
    id: row.id,
    userId: row.userId,
    githubId: row.githubId,
    login: row.login,
    createdAt: row.createdAt.getTime(),
    expiresAt: row.expiresAt.getTime(),
  };
}

export async function createSession(
  user: { userId: string; githubId: number; login: string },
  ttlMs: number,
): Promise<AdminSession> {
  const sessionId = crypto.randomUUID();
  const row = await queryOne<DbSessionRow>(
    `
      INSERT INTO auth_sessions (id, user_id, expires_at)
      VALUES ($1, $2, NOW() + ($3::text)::interval)
      RETURNING id,
                user_id AS "userId",
                (SELECT github_id FROM users WHERE id = $2) AS "githubId",
                (SELECT github_login FROM users WHERE id = $2) AS "login",
                created_at AS "createdAt",
                expires_at AS "expiresAt"
    `,
    [sessionId, user.userId, `${Math.floor(ttlMs / 1000)} seconds`],
  );

  if (!row) {
    throw new Error('Failed to create session');
  }

  return toSession(row);
}

export async function getSession(sessionId: string | undefined): Promise<AdminSession | null> {
  if (!sessionId) return null;

  const row = await queryOne<DbSessionRow>(
    `
      SELECT s.id,
             s.user_id AS "userId",
             u.github_id AS "githubId",
             u.github_login AS "login",
             s.created_at AS "createdAt",
             s.expires_at AS "expiresAt"
      FROM auth_sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.id = $1
    `,
    [sessionId],
  );

  if (!row) return null;
  if (row.expiresAt.getTime() <= Date.now()) {
    await query('DELETE FROM auth_sessions WHERE id = $1', [sessionId]);
    return null;
  }

  return toSession(row);
}

export async function deleteSession(sessionId: string | undefined) {
  if (!sessionId) return;
  await query('DELETE FROM auth_sessions WHERE id = $1', [sessionId]);
}
