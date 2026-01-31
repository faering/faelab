import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getApiBaseUrl } from '../trpc/apiBase';

export type CmsUiSection = {
  id: string;
  label: string;
  shortLabel?: string;
  disabled?: boolean;
};

export type CmsUiProps = {
  title: string;
  subtitle?: string;
  sections: CmsUiSection[];
  activeSectionId: string;
  onSectionChange?: (id: string) => void;
  statusBadge?: React.ReactNode;
  toolbar?: React.ReactNode;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  headerMeta?: React.ReactNode;
  onDirtyChange?: (dirty: boolean) => void;
  renderContent: (payload: { login: string; logout: () => void }) => React.ReactNode;
  children?: React.ReactNode;
};

export default function CmsUi({
  title,
  subtitle,
  sections,
  activeSectionId,
  onSectionChange,
  statusBadge,
  toolbar,
  search,
  headerMeta,
  renderContent,
  children,
}: CmsUiProps) {
  const apiBaseUrl = getApiBaseUrl();
  const [authStatus, setAuthStatus] = React.useState<
    | { state: 'checking' }
    | { state: 'authenticated'; login: string }
    | { state: 'unauthenticated' }
    | { state: 'error'; message: string }
  >({ state: 'checking' });
  const [authMethod, setAuthMethod] = React.useState<'github' | 'local' | 'unknown'>('unknown');
  const [localUsername, setLocalUsername] = React.useState('');
  const [localPassword, setLocalPassword] = React.useState('');
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    setAuthStatus({ state: 'checking' });
    setLocalError(null);

    Promise.all([
      fetch(`${apiBaseUrl}/auth/method`).then(async (res) => {
        if (!res.ok) throw new Error('Failed to get auth method');
        return (await res.json()) as { method?: 'github' | 'local' };
      }),
      fetch(`${apiBaseUrl}/auth/me`, { credentials: 'include' }).then(async (res) => {
        if (!res.ok) return { authenticated: false } as { authenticated: boolean; user?: { login: string } };
        return (await res.json()) as { authenticated: boolean; user?: { login: string } };
      }),
    ])
      .then(([methodResult, meResult]) => {
        if (!active) return;
        setAuthMethod(methodResult.method ?? 'github');
        if (meResult.authenticated && meResult.user?.login) {
          setAuthStatus({ state: 'authenticated', login: meResult.user.login });
        } else {
          setAuthStatus({ state: 'unauthenticated' });
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        setAuthStatus({
          state: 'error',
          message: err instanceof Error ? err.message : 'Failed to check auth',
        });
      });

    return () => {
      active = false;
    };
  }, [apiBaseUrl]);

  const handleLogout = async () => {
    try {
      await fetch(`${apiBaseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setAuthStatus({ state: 'unauthenticated' });
      window.dispatchEvent(new Event('auth-updated'));
    } catch (err) {
      setAuthStatus({
        state: 'error',
        message: err instanceof Error ? err.message : 'Failed to log out',
      });
    }
  };

  const handleLocalLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/auth/local/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: localUsername, password: localPassword }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        setLocalError(payload.error ?? 'Login failed');
        return;
      }

      const me = await fetch(`${apiBaseUrl}/auth/me`, { credentials: 'include' });
      if (!me.ok) {
        setLocalError('Login failed');
        return;
      }
      const data = (await me.json()) as { authenticated: boolean; user?: { login: string } };
      if (data.authenticated && data.user?.login) {
        setAuthStatus({ state: 'authenticated', login: data.user.login });
        window.dispatchEvent(new Event('auth-updated'));
      } else {
        setLocalError('Login failed');
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="relative flex h-[70vh] min-h-[420px] w-full overflow-hidden">
      <aside
        className={`shrink-0 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/30 p-3 transition-all duration-200 ${
          isSidebarCollapsed ? 'w-14' : 'w-52'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          {!isSidebarCollapsed && (
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sections
            </div>
          )}
          <button
            type="button"
            className="ml-auto flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-gray-900/40 hover:bg-white dark:hover:bg-gray-900 transition-colors"
            onClick={() => setIsSidebarCollapsed((v) => !v)}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight size={18} className="text-slate-600 dark:text-slate-300" />
            ) : (
              <ChevronLeft size={18} className="text-slate-600 dark:text-slate-300" />
            )}
          </button>
        </div>

        <div className="grid gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`w-full text-left rounded-xl border text-slate-900 dark:text-slate-100 transition-colors ${
                isSidebarCollapsed ? 'px-0 py-2 flex items-center justify-center' : 'px-3 py-2'
              } ${
                section.id === activeSectionId
                  ? 'bg-white dark:bg-gray-900 border-slate-200 dark:border-slate-700'
                  : 'bg-transparent border-transparent hover:bg-white/80 dark:hover:bg-gray-900/40'
              }`}
              onClick={() => onSectionChange?.(section.id)}
              disabled={section.disabled}
              aria-label={section.label}
            >
              {isSidebarCollapsed ? section.shortLabel ?? section.label.charAt(0) : section.label}
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-5">
        {authStatus.state !== 'authenticated' ? (
          <div className="flex h-full items-center justify-center">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-6 text-center">
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Admin access required</div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {authMethod === 'local'
                  ? 'Enter your admin credentials to manage content.'
                  : 'Sign in with GitHub to manage content in the CMS.'}
              </div>

              {authStatus.state === 'checking' && (
                <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">Checking session…</div>
              )}

              {authStatus.state === 'error' && (
                <div className="mt-4 text-sm text-red-600 dark:text-red-300">{authStatus.message}</div>
              )}

              {authStatus.state !== 'checking' && authMethod === 'github' && (
                <a
                  href={`${apiBaseUrl}/auth/github/login`}
                  className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 transition-colors"
                >
                  Login with GitHub
                </a>
              )}

              {authStatus.state !== 'checking' && authMethod === 'local' && (
                <form className="mt-5 grid gap-3" onSubmit={handleLocalLogin}>
                  <input
                    value={localUsername}
                    onChange={(e) => setLocalUsername(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100"
                    placeholder="Admin username"
                  />
                  <input
                    type="password"
                    value={localPassword}
                    onChange={(e) => setLocalPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100"
                    placeholder="Admin password"
                  />
                  {localError && <div className="text-sm text-red-600 dark:text-red-300">{localError}</div>}
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 transition-colors"
                  >
                    Sign in
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</div>
                {subtitle && <div className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</div>}
                {statusBadge && <div className="mt-2">{statusBadge}</div>}
              </div>
              {toolbar}
            </div>

            {(search || headerMeta) && (
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {headerMeta ?? (
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Signed in as <span className="font-medium">{authStatus.login}</span>
                  </div>
                )}
                {search && (
                  <div className="w-full sm:w-64">
                    <input
                      value={search.value}
                      onChange={(e) => search.onChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 text-sm"
                      placeholder={search.placeholder ?? 'Search…'}
                      aria-label={search.placeholder ?? 'Search'}
                    />
                  </div>
                )}
                <button
                  type="button"
                  className="text-xs text-slate-600 dark:text-slate-300 hover:underline"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            )}

            {renderContent({ login: authStatus.login, logout: handleLogout })}
            {children}
          </>
        )}
      </main>
    </div>
  );
}

