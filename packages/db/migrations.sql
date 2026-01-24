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
