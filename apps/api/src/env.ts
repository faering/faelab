import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

// Load env vars for the API package (apps/api/.env)
const envPath = new URL('../.env', import.meta.url);

const result = dotenv.config({ path: envPath });
dotenvExpand.expand(result);

if (result.error) {
  // Optional: keep going if the file doesn't exist, but fail for other errors.
  // Most dev setups should have apps/api/.env present.
  throw result.error;
}
