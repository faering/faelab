export type AdminSession = {
  id: string;
  userId: string;
  githubId: number;
  login: string;
  createdAt: number;
  expiresAt: number;
};

const sessions = new Map<string, AdminSession>();

function now() {
  return Date.now();
}

export function createSession(user: { userId: string; githubId: number; login: string }, ttlMs: number): AdminSession {
  const session: AdminSession = {
    id: crypto.randomUUID(),
    userId: user.userId,
    githubId: user.githubId,
    login: user.login,
    createdAt: now(),
    expiresAt: now() + ttlMs,
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(sessionId: string | undefined): AdminSession | null {
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.expiresAt <= now()) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

export function deleteSession(sessionId: string | undefined) {
  if (!sessionId) return;
  sessions.delete(sessionId);
}
