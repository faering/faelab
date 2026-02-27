export function getApiBaseUrl() {
  // Optional override: set VITE_API_BASE_URL=http://localhost:3001
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return envUrl?.trim() ? envUrl.trim().replace(/\/$/, '') : 'http://localhost:3001';
}
