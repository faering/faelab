-- SQL validation and constraints for the projects table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT,
    tags TEXT[],
    tech_stack TEXT[] NOT NULL CHECK (array_length(tech_stack, 1) > 0),
    repo_url TEXT,
    live_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    -- Data integrity checks
    CHECK (repo_url IS NULL OR repo_url ~ '^https?://'),
    CHECK (live_url IS NULL OR live_url ~ '^https?://'),
    CHECK (image IS NULL OR image ~ '^https?://')
);

-- Users table for OAuth identities
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    github_id BIGINT UNIQUE NOT NULL,
    github_login TEXT UNIQUE NOT NULL,
    display_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessions for server-side auth (cookie -> session id)
CREATE TABLE IF NOT EXISTS auth_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Link projects to an owner (nullable for legacy rows)
ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS owner_id TEXT REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON auth_sessions(expires_at);
