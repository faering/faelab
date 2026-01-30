import React from 'react';
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { ProjectSchema, type Project } from '../../../../../packages/types/projectSchema';

const CMS_STATE_KEY = 'projectsCmsState';
const CMS_PROJECTS_KEY = 'projectsCmsProjects';
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

function safeParsePersistedProjects(raw: string | null): Project[] | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const projects: Project[] = [];
    for (const item of parsed) {
      const result = ProjectSchema.safeParse(item);
      if (result.success) projects.push(result.data);
    }

    return projects.length > 0 ? projects : null;
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

export default function ProjectsCmsPopup() {
  const [view, setView] = React.useState<ViewState>(() => {
    try {
      return safeParsePersistedState(localStorage.getItem(CMS_STATE_KEY))?.view ?? { kind: 'list' };
    } catch {
      return { kind: 'list' };
    }
  });
  const [projects, setProjects] = React.useState<Project[]>(() => {
    try {
      return safeParsePersistedProjects(localStorage.getItem(CMS_PROJECTS_KEY)) ?? [];
    } catch {
      return [];
    }
  });
  const projectsHydratedRef = React.useRef(false);

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
    // Prefer locally persisted CMS data; otherwise seed from the static projects list.
    try {
      const persisted = safeParsePersistedProjects(localStorage.getItem(CMS_PROJECTS_KEY));
      if (persisted && persisted.length > 0) {
        setProjects(persisted);
        projectsHydratedRef.current = true;
        return;
      }
    } catch {
      // ignore
    }

    import('../../data/Projects').then((m) => {
      const data = (m.projects as unknown as Project[]) ?? [];
      setProjects(data);
      projectsHydratedRef.current = true;
    });
  }, []);

  React.useEffect(() => {
    if (!projectsHydratedRef.current) return;
    try {
      localStorage.setItem(CMS_PROJECTS_KEY, JSON.stringify(projects));
    } catch {
      // ignore (storage unavailable)
    }
  }, [projects]);

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
    setErrors({});
    setView({ kind: 'list' });
  };

  const requestDelete = (id: string) => {
    const project = projects.find((p) => p.id === id);
    setPendingDelete({ id, title: project?.title ?? 'this project' });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;

    const id = pendingDelete.id;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setErrors({});
    setPendingDelete(null);

    if (view.kind === 'edit' && view.id === id) {
      setView({ kind: 'list' });
      setDraft(emptyDraft());
    }
  };

  const onSave = () => {
    const { errors: nextErrors, techStack } = validateDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const base: Omit<Project, 'id'> = {
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
      const id = crypto.randomUUID();
      setProjects((prev) => [{ id, ...base }, ...prev]);
      setView({ kind: 'edit', id });
      return;
    }

    if (view.kind === 'edit') {
      setProjects((prev) => prev.map((p) => (p.id === view.id ? { id: view.id, ...base } : p)));
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
            Data wiring comes next.
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-auto p-5">
        {view.kind === 'list' ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Projects</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Create and edit portfolio projects.
                </div>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                onClick={startCreate}
              >
                <Plus size={18} />
                New
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-slate-100/70 dark:bg-slate-800/30 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <div className="col-span-6">Title</div>
                <div className="col-span-3">Tools</div>
                <div className="col-span-1">Featured</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {projects.length === 0 ? (
                <div className="px-4 py-10 text-sm text-slate-600 dark:text-slate-300">
                  No projects loaded yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {projects.map((p) => (
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
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-sm"
                          onClick={() => requestDelete(p.id)}
                          aria-label={`Delete ${p.title}`}
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
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                  onClick={onSave}
                >
                  Save
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
    </div>
  );
}
