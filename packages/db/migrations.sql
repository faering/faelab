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

-- Site profile (singleton per owner) for homepage content
CREATE TABLE IF NOT EXISTS site_profile (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hero_name TEXT NOT NULL,
    hero_title TEXT NOT NULL,
    hero_bio TEXT NOT NULL,
    about_left_headline TEXT NOT NULL,
    about_right_icon TEXT NOT NULL,
    about_right_title TEXT NOT NULL,
    about_right_description TEXT NOT NULL,
    skills_intro TEXT NOT NULL,
    contact_title TEXT NOT NULL,
    contact_subtitle TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_location TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (owner_id)
);

CREATE TABLE IF NOT EXISTS site_profile_presets (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS about_paragraphs (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id TEXT NOT NULL REFERENCES site_profile(id) ON DELETE CASCADE,
    position INT NOT NULL,
    body TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS about_badges (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id TEXT NOT NULL REFERENCES site_profile(id) ON DELETE CASCADE,
    position INT NOT NULL,
    label TEXT NOT NULL,
    color TEXT
);

CREATE TABLE IF NOT EXISTS about_highlights (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id TEXT NOT NULL REFERENCES site_profile(id) ON DELETE CASCADE,
    position INT NOT NULL,
    icon TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    color TEXT
);

CREATE TABLE IF NOT EXISTS skill_categories (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id TEXT NOT NULL REFERENCES site_profile(id) ON DELETE CASCADE,
    position INT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS skill_items (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
    position INT NOT NULL,
    label TEXT NOT NULL,
    "skillLevel" INT NOT NULL DEFAULT 80 CHECK ("skillLevel" >= 0 AND "skillLevel" <= 100)
);

ALTER TABLE skill_items
    ADD COLUMN IF NOT EXISTS "skillLevel" INT NOT NULL DEFAULT 80;

ALTER TABLE skill_items
    ADD CONSTRAINT IF NOT EXISTS skill_items_level_range CHECK ("skillLevel" >= 0 AND "skillLevel" <= 100);

CREATE TABLE IF NOT EXISTS skill_technologies (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id TEXT NOT NULL REFERENCES site_profile(id) ON DELETE CASCADE,
    position INT NOT NULL,
    label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS featured_projects (
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    position INT NOT NULL,
    PRIMARY KEY (owner_id, project_id)
);

-- Videos table for portfolio video content
CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER,
    tags TEXT[],
    featured BOOLEAN DEFAULT FALSE,
    owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Data integrity checks
    CHECK (duration IS NULL OR duration > 0)
);

CREATE INDEX IF NOT EXISTS idx_site_profile_owner_id ON site_profile(owner_id);
CREATE INDEX IF NOT EXISTS idx_site_profile_presets_owner_id ON site_profile_presets(owner_id);
CREATE INDEX IF NOT EXISTS idx_about_paragraphs_profile_id ON about_paragraphs(profile_id);
CREATE INDEX IF NOT EXISTS idx_about_badges_profile_id ON about_badges(profile_id);
CREATE INDEX IF NOT EXISTS idx_about_highlights_profile_id ON about_highlights(profile_id);
CREATE INDEX IF NOT EXISTS idx_skill_categories_profile_id ON skill_categories(profile_id);
CREATE INDEX IF NOT EXISTS idx_skill_items_category_id ON skill_items(category_id);
CREATE INDEX IF NOT EXISTS idx_skill_technologies_profile_id ON skill_technologies(profile_id);
CREATE INDEX IF NOT EXISTS idx_featured_projects_owner_id ON featured_projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_videos_owner_id ON videos(owner_id);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(featured);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
