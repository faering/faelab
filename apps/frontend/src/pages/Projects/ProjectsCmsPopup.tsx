import React from 'react';
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import type { Project } from '../../../../../packages/types/projectSchema';
import { getApiBaseUrl } from '../../trpc/apiBase';
import { trpc } from '../../trpc/trpc';

const CMS_STATE_KEY = 'projectsCmsState';
const CMS_SIDEBAR_KEY = 'projectsCmsSidebarCollapsed';

type ViewState =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'edit'; id: string };

type ProjectDraft = {
  title: string;
  description: string;
  techStack: string;
  tags: string;
  image?: string;
  repoUrl?: string;
  liveUrl?: string;
  featured: boolean;
};

function toCommaSeparated(values: string[] | undefined) {
  return (values ?? []).join(', ');
}

function parseCommaSeparated(value: string) {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function emptyDraft(): ProjectDraft {
  return {
    title: '',
    description: '',
    techStack: '',
    tags: '',
    image: '',
    repoUrl: '',
    liveUrl: '',
    featured: false,
  };
}

type PersistedCmsState = {
  view: ViewState;
  draft: ProjectDraft;
};

function safeParsePersistedState(raw: string | null): PersistedCmsState | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const obj = parsed as Record<string, unknown>;
    const view = obj.view as any;
    const draft = obj.draft as any;

    const viewIsValid =
      view &&
      typeof view === 'object' &&
      (view.kind === 'list' || view.kind === 'create' || (view.kind === 'edit' && typeof view.id === 'string'));

    const draftIsValid =
      draft &&
      typeof draft === 'object' &&
      typeof draft.title === 'string' &&
      typeof draft.description === 'string' &&
      typeof draft.techStack === 'string' &&
      typeof draft.tags === 'string' &&
      typeof draft.featured === 'boolean' &&
      (draft.image === undefined || typeof draft.image === 'string') &&
      (draft.repoUrl === undefined || typeof draft.repoUrl === 'string') &&
      (draft.liveUrl === undefined || typeof draft.liveUrl === 'string');

    if (!viewIsValid || !draftIsValid) return null;

    return { view, draft } as PersistedCmsState;
  } catch {
    return null;
  }
}

function projectToDraft(project: Project): ProjectDraft {
  return {
    title: project.title,
    description: project.description,
    techStack: toCommaSeparated(project.techStack),
    tags: toCommaSeparated(project.tags),
    image: project.image ?? '',
    repoUrl: project.repoUrl ?? '',
    liveUrl: project.liveUrl ?? '',
    featured: project.featured ?? false,
  };
}

function validateDraft(draft: ProjectDraft) {
  const errors: Record<string, string> = {};

  if (!draft.title.trim()) errors.title = 'Title is required';
  if (!draft.description.trim()) errors.description = 'Description is required';

  const techStack = parseCommaSeparated(draft.techStack);
  if (techStack.length === 0) errors.techStack = 'At least one tool is required';

  return { errors, techStack };
}

export type ProjectsCmsPopupProps = {
  onDirtyChange?: (dirty: boolean) => void;
};

function normalizeText(value: string | undefined) {
  return (value ?? '').trim();
}

function isDraftEmpty(draft: ProjectDraft) {
  return (
    normalizeText(draft.title) === '' &&
    normalizeText(draft.description) === '' &&
    normalizeText(draft.techStack) === '' &&
    normalizeText(draft.tags) === '' &&
    normalizeText(draft.image) === '' &&
    normalizeText(draft.repoUrl) === '' &&
    normalizeText(draft.liveUrl) === '' &&
    draft.featured === false
  );
}

function isDraftDifferent(a: ProjectDraft, b: ProjectDraft) {
  return (
    normalizeText(a.title) !== normalizeText(b.title) ||
    normalizeText(a.description) !== normalizeText(b.description) ||
    normalizeText(a.techStack) !== normalizeText(b.techStack) ||
    normalizeText(a.tags) !== normalizeText(b.tags) ||
    normalizeText(a.image) !== normalizeText(b.image) ||
    normalizeText(a.repoUrl) !== normalizeText(b.repoUrl) ||
    normalizeText(a.liveUrl) !== normalizeText(b.liveUrl) ||
    a.featured !== b.featured
  );
}

export default function ProjectsCmsPopup({ onDirtyChange }: ProjectsCmsPopupProps) {
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
  const [searchTerm, setSearchTerm] = React.useState('');

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
      } else {
        setLocalError('Login failed');
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const trpcListQuery = trpc.projects.list.useQuery(undefined, {
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const utils = trpc.useUtils();

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: (created) => {
      utils.projects.list.setData(undefined, (prev) => [created, ...(prev ?? [])]);
      setErrors({});
      setDraft(emptyDraft());
      setView({ kind: 'list' });
    },
  });

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: (updated) => {
      utils.projects.list.setData(undefined, (prev) => (prev ?? []).map((p) => (p.id === updated.id ? updated : p)));
      setErrors({});
      setDraft(emptyDraft());
      setView({ kind: 'list' });
    },
  });

  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: (deleted) => {
      utils.projects.list.setData(undefined, (prev) => (prev ?? []).filter((p) => p.id !== deleted.id));
      setPendingDelete(null);
      setDraft(emptyDraft());
      setView({ kind: 'list' });
    },
  });

  const [view, setView] = React.useState<ViewState>(() => {
    try {
      return safeParsePersistedState(localStorage.getItem(CMS_STATE_KEY))?.view ?? { kind: 'list' };
    } catch {
      return { kind: 'list' };
    }
  });
  const projects: Project[] = trpcListQuery.data ?? [];

  const [draft, setDraft] = React.useState<ProjectDraft>(() => {
    try {
      return safeParsePersistedState(localStorage.getItem(CMS_STATE_KEY))?.draft ?? emptyDraft();
    } catch {
      return emptyDraft();
    }
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [pendingDelete, setPendingDelete] = React.useState<null | { id: string; title: string }>(null);
  const noButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const [pendingNavigateBack, setPendingNavigateBack] = React.useState(false);
  const noDiscardNavRef = React.useRef<HTMLButtonElement | null>(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
    try {
      return localStorage.getItem(CMS_SIDEBAR_KEY) === '1';
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(CMS_SIDEBAR_KEY, isSidebarCollapsed ? '1' : '0');
    } catch {
      // ignore (storage unavailable)
    }
  }, [isSidebarCollapsed]);

  React.useEffect(() => {
    try {
      const state: PersistedCmsState = { view, draft };
      localStorage.setItem(CMS_STATE_KEY, JSON.stringify(state));
    } catch {
      // ignore (storage unavailable)
    }
  }, [view, draft]);

  React.useEffect(() => {
    if (view.kind !== 'edit') return;
    if (projects.length === 0) return;
    const exists = projects.some((p) => p.id === view.id);
    if (!exists) setView({ kind: 'list' });
  }, [projects, view]);

  React.useEffect(() => {
    if (!pendingDelete) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPendingDelete(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pendingDelete]);

  React.useEffect(() => {
    if (!pendingDelete) return;
    // Ensure the safe default (No) is focused.
    noButtonRef.current?.focus();
  }, [pendingDelete]);

  React.useEffect(() => {
    if (!pendingNavigateBack) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPendingNavigateBack(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pendingNavigateBack]);

  React.useEffect(() => {
    if (!pendingNavigateBack) return;
    noDiscardNavRef.current?.focus();
  }, [pendingNavigateBack]);

  const isDirty = React.useMemo(() => {
    if (pendingDelete) return false;

    if (view.kind === 'list') return false;
    if (view.kind === 'create') return !isDraftEmpty(draft);

    const project = projects.find((p) => p.id === view.id);
    if (!project) return false;

    const baseline = projectToDraft(project);
    return isDraftDifferent(draft, baseline);
  }, [draft, pendingDelete, projects, view]);

  React.useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const startCreate = () => {
    setErrors({});
    setDraft(emptyDraft());
    setView({ kind: 'create' });
  };

  const startEdit = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;

    setErrors({});
    setDraft(projectToDraft(project));
    setView({ kind: 'edit', id });
  };

  const goBackToList = () => {
    if (isDirty) {
      setPendingNavigateBack(true);
      return;
    }

    setErrors({});
    setView({ kind: 'list' });
  };

  const confirmNavigateBackDiscard = () => {
    setPendingNavigateBack(false);
    setErrors({});
    setDraft(emptyDraft());
    setView({ kind: 'list' });
  };

  const requestDelete = (id: string) => {
    const project = projects.find((p) => p.id === id);
    setPendingDelete({ id, title: project?.title ?? 'this project' });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;

    deleteMutation.mutate({ id: pendingDelete.id });
  };

  const onSave = () => {
    const { errors: nextErrors, techStack } = validateDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const base = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      techStack,
      tags: parseCommaSeparated(draft.tags),
      image: draft.image?.trim() ? draft.image.trim() : undefined,
      repoUrl: draft.repoUrl?.trim() ? draft.repoUrl.trim() : undefined,
      liveUrl: draft.liveUrl?.trim() ? draft.liveUrl.trim() : undefined,
      featured: draft.featured,
    };

    if (view.kind === 'create') {
      createMutation.mutate({
        ...base,
        tags: base.tags.length > 0 ? base.tags : undefined,
      });
      return;
    }

    if (view.kind === 'edit') {
      updateMutation.mutate({
        id: view.id,
        data: {
          ...base,
          tags: base.tags.length > 0 ? base.tags : undefined,
        },
      });
    }
  };

  const filteredProjects = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return projects;

    return projects.filter((project) => {
      const haystack = [
        project.title,
        project.description,
        ...(project.tags ?? []),
        ...(project.techStack ?? []),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [projects, searchTerm]);

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

        <button
          type="button"
          className={`w-full text-left rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 ${
            isSidebarCollapsed ? 'px-0 py-2 flex items-center justify-center' : 'px-3 py-2'
          }`}
          aria-label="Projects"
        >
          {isSidebarCollapsed ? 'P' : 'Projects'}
        </button>

        {!isSidebarCollapsed && (
          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Connected to the database via tRPC.
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-auto p-5">
        {authStatus.state !== 'authenticated' ? (
          <div className="flex h-full items-center justify-center">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-6 text-center">
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Admin access required</div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {authMethod === 'local'
                  ? 'Enter your admin credentials to manage projects.'
                  : 'Sign in with GitHub to manage projects in the CMS.'}
              </div>

              {authStatus.state === 'checking' && (
                <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">Checking session…</div>
              )}

              {authStatus.state === 'error' && (
                <div className="mt-4 text-sm text-red-600 dark:text-red-300">
                  {authStatus.message}
                </div>
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
                  {localError && (
                    <div className="text-sm text-red-600 dark:text-red-300">{localError}</div>
                  )}
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
        ) : view.kind === 'list' ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Projects</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Create and edit portfolio projects.
                </div>

                <div className="mt-2">
                  {trpcListQuery.isLoading ? (
                    <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-gray-900/40">
                      API: checking…
                    </span>
                  ) : trpcListQuery.isError ? (
                    <span
                      className="inline-flex items-center rounded-full border border-red-200 dark:border-red-900/50 px-2.5 py-1 text-xs text-red-700 dark:text-red-300 bg-red-50/60 dark:bg-red-950/10"
                      title={trpcListQuery.error.message}
                    >
                      API: offline
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-1 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/10">
                      API: connected ({trpcListQuery.data?.length ?? 0})
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                onClick={startCreate}
                disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
              >
                <Plus size={18} />
                New
              </button>
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Signed in as <span className="font-medium">{authStatus.login}</span>
              </div>
              <div className="w-full sm:w-64">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 text-sm"
                  placeholder="Search projects…"
                  aria-label="Search projects"
                />
              </div>
              <button
                type="button"
                className="text-xs text-slate-600 dark:text-slate-300 hover:underline"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>

            {(createMutation.isError || updateMutation.isError || deleteMutation.isError) && (
              <div className="mb-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/60 dark:bg-red-950/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
                {(
                  createMutation.error?.message ||
                  updateMutation.error?.message ||
                  deleteMutation.error?.message ||
                  'Request failed'
                )}
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-slate-100/70 dark:bg-slate-800/30 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <div className="col-span-6">Title</div>
                <div className="col-span-3">Tools</div>
                <div className="col-span-1">Featured</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {trpcListQuery.isLoading ? (
                <div className="px-4 py-10 text-sm text-slate-600 dark:text-slate-300">Loading projects…</div>
              ) : trpcListQuery.isError ? (
                <div className="px-4 py-10 text-sm text-red-700 dark:text-red-300">
                  Could not load projects: {trpcListQuery.error.message}
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="px-4 py-10 text-sm text-slate-600 dark:text-slate-300">
                  {projects.length === 0
                    ? 'No projects in the database yet.'
                    : 'No projects match your search.'}
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredProjects.map((p) => (
                    <div key={p.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center bg-white dark:bg-gray-900">
                      <div className="col-span-6">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{p.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{p.description}</div>
                      </div>
                      <div className="col-span-3 text-sm text-slate-700 dark:text-slate-200">
                        {(p.techStack ?? []).slice(0, 2).join(', ')}
                        {(p.techStack?.length ?? 0) > 2 ? '…' : ''}
                      </div>
                      <div className="col-span-1 text-sm text-slate-700 dark:text-slate-200">
                        {p.featured ? 'Yes' : 'No'}
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
                          onClick={() => startEdit(p.id)}
                          disabled={deleteMutation.isPending}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-sm"
                          onClick={() => requestDelete(p.id)}
                          aria-label={`Delete ${p.title}`}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 hover:underline"
                onClick={goBackToList}
              >
                <ChevronLeft size={18} />
                Back to list
              </button>

              <div className="flex items-center gap-2">
                {view.kind === 'edit' && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    onClick={() => requestDelete(view.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={18} />
                    {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                  </button>
                )}
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                  onClick={onSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Title</div>
                  <input
                    value={draft.title}
                    onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                    className={`w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 outline-none ${
                      errors.title
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
                    }`}
                    placeholder="My project"
                  />
                  {errors.title && <div className="text-xs text-red-500 mt-1">{errors.title}</div>}
                </label>

                <label className="block">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Tools (comma-separated)</div>
                  <input
                    value={draft.techStack}
                    onChange={(e) => setDraft((d) => ({ ...d, techStack: e.target.value }))}
                    className={`w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 outline-none ${
                      errors.techStack
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
                    }`}
                    placeholder="React, tRPC, Postgres"
                  />
                  {errors.techStack && <div className="text-xs text-red-500 mt-1">{errors.techStack}</div>}
                </label>

                <label className="block md:col-span-2">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Description</div>
                  <textarea
                    value={draft.description}
                    onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                    className={`w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 outline-none min-h-[110px] ${
                      errors.description
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
                    }`}
                    placeholder="What does it do?"
                  />
                  {errors.description && (
                    <div className="text-xs text-red-500 mt-1">{errors.description}</div>
                  )}
                </label>

                <label className="block">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Tags (comma-separated)</div>
                  <input
                    value={draft.tags}
                    onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 outline-none focus:border-purple-400"
                    placeholder="portfolio, web"
                  />
                </label>

                <label className="block">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Image URL</div>
                  <input
                    value={draft.image ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 outline-none focus:border-purple-400"
                    placeholder="https://..."
                  />
                </label>

                <label className="block">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Repo URL</div>
                  <input
                    value={draft.repoUrl ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, repoUrl: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 outline-none focus:border-purple-400"
                    placeholder="https://github.com/..."
                  />
                </label>

                <label className="block">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Live URL</div>
                  <input
                    value={draft.liveUrl ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, liveUrl: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 outline-none focus:border-purple-400"
                    placeholder="https://..."
                  />
                </label>

                <label className="inline-flex items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    checked={draft.featured}
                    onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-600"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-200">Featured</span>
                </label>
              </div>
            </div>
          </>
        )}
      </main>

      {pendingDelete && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Cancel delete"
            onClick={() => setPendingDelete(null)}
          />

          <div
            className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 shadow-xl p-5"
            role="alertdialog"
            aria-modal="true"
            aria-label="Confirm delete"
          >
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Delete project?
            </div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete <span className="font-medium">{pendingDelete.title}</span>? This cannot be undone.
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                ref={noButtonRef}
                type="button"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
                onClick={() => setPendingDelete(null)}
              >
                No, keep it
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                onClick={confirmDelete}
              >
                <Trash2 size={18} />
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingNavigateBack && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Keep editing"
            onClick={() => setPendingNavigateBack(false)}
          />

          <div
            className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 shadow-xl p-5"
            role="alertdialog"
            aria-modal="true"
            aria-label="Discard changes"
          >
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Discard changes?
            </div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              You have unsaved changes. Do you want to discard them and go back to the list?
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                ref={noDiscardNavRef}
                type="button"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
                onClick={() => setPendingNavigateBack(false)}
              >
                No, keep editing
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                onClick={confirmNavigateBackDiscard}
              >
                Yes, discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
