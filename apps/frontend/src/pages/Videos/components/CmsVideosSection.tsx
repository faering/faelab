import React from 'react';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import type { Video } from '../../../../../../packages/types/videoSchema';
import FileUploader from '../../../components/FileUploader';
import { trpc } from '../../../trpc/trpc';

const CMS_STATE_KEY = 'videosCmsState';

type ViewState =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'edit'; id: string };

type VideoDraft = {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  tags: string;
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

function emptyDraft(): VideoDraft {
  return {
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: '',
    tags: '',
    featured: false,
  };
}

type PersistedCmsState = {
  view: ViewState;
  draft: VideoDraft;
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
      typeof draft.videoUrl === 'string' &&
      typeof draft.thumbnailUrl === 'string' &&
      typeof draft.duration === 'string' &&
      typeof draft.tags === 'string' &&
      typeof draft.featured === 'boolean';

    if (!viewIsValid || !draftIsValid) return null;

    return { view, draft } as PersistedCmsState;
  } catch {
    return null;
  }
}

function videoToDraft(video: Video): VideoDraft {
  return {
    title: video.title,
    description: video.description,
    videoUrl: video.videoUrl,
    thumbnailUrl: video.thumbnailUrl ?? '',
    duration: video.duration ? String(video.duration) : '',
    tags: toCommaSeparated(video.tags),
    featured: video.featured ?? false,
  };
}

function validateDraft(draft: VideoDraft) {
  const errors: Record<string, string> = {};

  if (!draft.title.trim()) errors.title = 'Title is required';
  if (!draft.description.trim()) errors.description = 'Description is required';
  if (!draft.videoUrl.trim()) errors.videoUrl = 'Video file is required';

  if (draft.duration.trim()) {
    const durationNum = parseInt(draft.duration, 10);
    if (isNaN(durationNum) || durationNum <= 0) {
      errors.duration = 'Duration must be a positive number';
    }
  }

  return { errors };
}

function normalizeText(value: string | undefined) {
  return (value ?? '').trim();
}

function isDraftEmpty(draft: VideoDraft) {
  return (
    normalizeText(draft.title) === '' &&
    normalizeText(draft.description) === '' &&
    normalizeText(draft.videoUrl) === '' &&
    normalizeText(draft.thumbnailUrl) === '' &&
    normalizeText(draft.duration) === '' &&
    normalizeText(draft.tags) === '' &&
    draft.featured === false
  );
}

function isDraftDifferent(a: VideoDraft, b: VideoDraft) {
  return (
    normalizeText(a.title) !== normalizeText(b.title) ||
    normalizeText(a.description) !== normalizeText(b.description) ||
    normalizeText(a.videoUrl) !== normalizeText(b.videoUrl) ||
    normalizeText(a.thumbnailUrl) !== normalizeText(b.thumbnailUrl) ||
    normalizeText(a.duration) !== normalizeText(b.duration) ||
    normalizeText(a.tags) !== normalizeText(b.tags) ||
    a.featured !== b.featured
  );
}

export type CmsVideosSectionProps = {
  onDirtyChange?: (dirty: boolean) => void;
};

type CmsVideosEditorState = {
  content: React.ReactNode;
  statusBadge: React.ReactNode;
  toolbar: React.ReactNode;
  search: { value: string; onChange: (value: string) => void; placeholder?: string };
  isDirty: boolean;
};

export function useCmsVideosEditor({ onDirtyChange }: CmsVideosSectionProps): CmsVideosEditorState {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [view, setView] = React.useState<ViewState>(() => {
    try {
      return safeParsePersistedState(localStorage.getItem(CMS_STATE_KEY))?.view ?? { kind: 'list' };
    } catch {
      return { kind: 'list' };
    }
  });
  const [draft, setDraft] = React.useState<VideoDraft>(() => {
    try {
      return safeParsePersistedState(localStorage.getItem(CMS_STATE_KEY))?.draft ?? emptyDraft();
    } catch {
      return emptyDraft();
    }
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pendingDelete, setPendingDelete] = React.useState<null | { id: string; title: string }>(null);
  const [pendingNavigateBack, setPendingNavigateBack] = React.useState(false);
  const noButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const noDiscardNavRef = React.useRef<HTMLButtonElement | null>(null);

  const trpcListQuery = trpc.videos.list.useQuery(undefined, {
    retry: 0,
    refetchOnWindowFocus: false,
  });
  const videos: Video[] = trpcListQuery.data ?? [];
  const utils = trpc.useUtils();

  const createMutation = trpc.videos.create.useMutation({
    onSuccess: (created) => {
      utils.videos.list.setData(undefined, (prev) => [created, ...(prev ?? [])]);
      setErrors({});
      setDraft(emptyDraft());
      setView({ kind: 'list' });
    },
  });

  const updateMutation = trpc.videos.update.useMutation({
    onSuccess: (updated) => {
      utils.videos.list.setData(undefined, (prev) => (prev ?? []).map((v) => (v.id === updated.id ? updated : v)));
      setErrors({});
      setDraft(emptyDraft());
      setView({ kind: 'list' });
    },
  });

  const deleteMutation = trpc.videos.delete.useMutation({
    onSuccess: (deleted) => {
      utils.videos.list.setData(undefined, (prev) => (prev ?? []).filter((v) => v.id !== deleted.id));
      setPendingDelete(null);
      setDraft(emptyDraft());
      setView({ kind: 'list' });
    },
  });

  React.useEffect(() => {
    try {
      const state: PersistedCmsState = { view, draft };
      localStorage.setItem(CMS_STATE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [view, draft]);

  React.useEffect(() => {
    if (view.kind !== 'edit') return;
    if (videos.length === 0) return;
    const exists = videos.some((v) => v.id === view.id);
    if (!exists) setView({ kind: 'list' });
  }, [videos, view]);

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

  const videosIsDirty = React.useMemo(() => {
    if (pendingDelete) return false;
    if (view.kind === 'list') return false;
    if (view.kind === 'create') return !isDraftEmpty(draft);

    const video = videos.find((v) => v.id === view.id);
    if (!video) return false;

    const baseline = videoToDraft(video);
    return isDraftDifferent(draft, baseline);
  }, [draft, pendingDelete, videos, view]);

  React.useEffect(() => {
    onDirtyChange?.(videosIsDirty);
  }, [videosIsDirty, onDirtyChange]);

  const startCreate = () => {
    setErrors({});
    setDraft(emptyDraft());
    setView({ kind: 'create' });
  };

  const startEdit = (id: string) => {
    const video = videos.find((v) => v.id === id);
    if (!video) return;

    setErrors({});
    setDraft(videoToDraft(video));
    setView({ kind: 'edit', id });
  };

  const goBackToList = () => {
    if (videosIsDirty) {
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
    const video = videos.find((v) => v.id === id);
    setPendingDelete({ id, title: video?.title ?? 'this video' });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate({ id: pendingDelete.id });
  };

  const onSave = () => {
    const { errors: nextErrors } = validateDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const base = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      videoUrl: draft.videoUrl.trim(),
      thumbnailUrl: draft.thumbnailUrl.trim() ? draft.thumbnailUrl.trim() : undefined,
      duration: draft.duration.trim() ? parseInt(draft.duration.trim(), 10) : undefined,
      tags: parseCommaSeparated(draft.tags),
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

  const filteredVideos = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return videos;

    return videos.filter((video) => {
      const haystack = [
        video.title,
        video.description,
        ...(video.tags ?? []),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [videos, searchTerm]);

  const statusBadge = trpcListQuery.isLoading ? (
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
  );

  const toolbar =
    view.kind === 'list' ? (
      <button
        type="button"
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors"
        onClick={startCreate}
        disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
      >
        <Plus size={18} />
        New
      </button>
    ) : undefined;

  const content = (
    <>
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

      {view.kind === 'list' ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-slate-100/70 dark:bg-slate-800/30 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Duration</div>
            <div className="col-span-2">Tags</div>
            <div className="col-span-1">Featured</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {trpcListQuery.isLoading ? (
            <div className="px-4 py-10 text-sm text-slate-600 dark:text-slate-300">Loading videos…</div>
          ) : trpcListQuery.isError ? (
            <div className="px-4 py-10 text-sm text-red-700 dark:text-red-300">
              Could not load videos: {trpcListQuery.error.message}
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="px-4 py-10 text-sm text-slate-600 dark:text-slate-300">
              {videos.length === 0
                ? 'No videos in the database yet.'
                : 'No videos match your search.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredVideos.map((v) => (
                <div key={v.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center bg-white dark:bg-gray-900">
                  <div className="col-span-5">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{v.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{v.description}</div>
                  </div>
                  <div className="col-span-2 text-sm text-slate-700 dark:text-slate-200">
                    {v.duration ? `${Math.floor(v.duration / 60)}:${String(v.duration % 60).padStart(2, '0')}` : '—'}
                  </div>
                  <div className="col-span-2 text-sm text-slate-700 dark:text-slate-200">
                    {(v.tags ?? []).slice(0, 2).join(', ')}
                    {(v.tags?.length ?? 0) > 2 ? '…' : ''}
                  </div>
                  <div className="col-span-1 text-sm text-slate-700 dark:text-slate-200">
                    {v.featured ? 'Yes' : 'No'}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
                      onClick={() => startEdit(v.id)}
                      disabled={deleteMutation.isPending}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-sm"
                      onClick={() => requestDelete(v.id)}
                      aria-label={`Delete ${v.title}`}
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
                  placeholder="My video"
                />
                {errors.title && <div className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title}</div>}
              </label>

              <label className="block">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Duration (seconds)</div>
                <input
                  type="number"
                  value={draft.duration}
                  onChange={(e) => setDraft((d) => ({ ...d, duration: e.target.value }))}
                  className={`w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 outline-none ${
                    errors.duration
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
                  }`}
                  placeholder="120"
                  min="1"
                />
                {errors.duration && <div className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.duration}</div>}
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
                  placeholder="What is this video about?"
                />
                {errors.description && (
                  <div className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.description}</div>
                )}
              </label>

              <label className="block md:col-span-2">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Tags (comma-separated)</div>
                <input
                  value={draft.tags}
                  onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 outline-none focus:border-purple-400"
                  placeholder="tutorial, demo"
                />
              </label>

              <FileUploader
                type="video"
                value={draft.videoUrl}
                onChange={(url) => setDraft((d) => ({ ...d, videoUrl: url || '' }))}
                label="Video File"
              />
              {errors.videoUrl && <div className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.videoUrl}</div>}

              <FileUploader
                type="image"
                value={draft.thumbnailUrl}
                onChange={(url) => setDraft((d) => ({ ...d, thumbnailUrl: url || '' }))}
                label="Thumbnail Image (optional)"
              />

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

            {/* Video preview */}
            {draft.videoUrl && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Preview</div>
                <video
                  src={draft.videoUrl}
                  controls
                  className="w-full max-w-2xl rounded-lg"
                  poster={draft.thumbnailUrl || undefined}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>
        </>
      )}

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
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Delete video?</div>
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
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Discard changes?</div>
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
    </>
  );

  return {
    content,
    statusBadge,
    toolbar,
    search: { value: searchTerm, onChange: setSearchTerm, placeholder: 'Search videos…' },
    isDirty: videosIsDirty,
  };
}
