import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { readFileSync } from 'node:fs';

// ── Docker secrets loader ─────────────────────────────────────────────────────
// Any env var ending in _FILE is treated as a path to a secrets file.
// The file contents are loaded into the corresponding base variable.
// e.g. AUTH_ADMIN_PASSWORD_FILE=/run/secrets/auth_admin_password
//      → process.env.AUTH_ADMIN_PASSWORD = <file contents>
function loadDockerSecrets() {
  for (const [key, filePath] of Object.entries(process.env)) {
    if (!key.endsWith('_FILE') || !filePath) continue;
    const baseKey = key.slice(0, -5); // strip trailing _FILE
    if (process.env[baseKey] !== undefined) continue; // already set; don't overwrite
    try {
      process.env[baseKey] = readFileSync(filePath, 'utf8').trim();
    } catch (err) {
      throw new Error(`Failed to read Docker secret for ${baseKey} from ${filePath}: ${(err as Error).message}`);
    }
  }
}

// Load env vars for the API package (apps/api/.env)
const envPath = new URL('../.env', import.meta.url);

const result = dotenv.config({ path: envPath });
dotenvExpand.expand(result);

if (result.error) {
  // In Docker the env vars come from docker-compose; no .env file is present.
  // Skip gracefully if the file simply doesn't exist; throw for all other errors.
  const isNotFound = (result.error as Error & { code?: string }).code === 'ENOENT';
  if (!isNotFound) throw result.error;
}

// Must run after dotenv so Docker secrets can supplement (not conflict with) local .env
loadDockerSecrets();
