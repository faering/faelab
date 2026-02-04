import React from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import type { SiteContent, SiteContentInput } from '../../../../../../packages/types/siteContentSchema';
import CmsUi from '../../../components/CmsUi';
import { trpc } from '../../../trpc/trpc';

export type CmsHomeSectionProps = {
  onDirtyChange?: (dirty: boolean) => void;
};

const EMPTY_CONTENT: SiteContentInput = {
  profile: {
    heroName: '',
    heroTitle: '',
    heroBio: '',
    aboutLeftHeadline: '',
    aboutRightIcon: '',
    aboutRightTitle: '',
    aboutRightDescription: '',
    skillsIntro: '',
    contactTitle: '',
    contactSubtitle: '',
    contactEmail: '',
    contactPhone: '',
    contactLocation: '',
  },
  aboutParagraphs: [],
  aboutBadges: [],
  skillCategories: [],
  skillItems: [],
  skillTechnologies: [],
  featuredProjects: [],
};

function toInput(content: SiteContent): SiteContentInput {
  return {
    profile: {
      heroName: content.profile.heroName,
      heroTitle: content.profile.heroTitle,
      heroBio: content.profile.heroBio,
      aboutLeftHeadline: content.profile.aboutLeftHeadline,
      aboutRightIcon: content.profile.aboutRightIcon,
      aboutRightTitle: content.profile.aboutRightTitle,
      aboutRightDescription: content.profile.aboutRightDescription,
      skillsIntro: content.profile.skillsIntro,
      contactTitle: content.profile.contactTitle,
      contactSubtitle: content.profile.contactSubtitle,
      contactEmail: content.profile.contactEmail,
      contactPhone: content.profile.contactPhone,
      contactLocation: content.profile.contactLocation,
    },
    aboutParagraphs: content.aboutParagraphs.map((item) => ({
      id: item.id,
      position: item.position,
      body: item.body,
    })),
    aboutBadges: content.aboutBadges.map((item) => ({
      id: item.id,
      position: item.position,
      label: item.label,
      color: item.color ?? undefined,
    })),
    skillCategories: content.skillCategories.map((item) => ({
      id: item.id,
      position: item.position,
      title: item.title,
      description: item.description,
    })),
    skillItems: content.skillItems.map((item) => ({
      id: item.id,
      categoryId: item.categoryId,
      position: item.position,
      label: item.label,
    })),
    skillTechnologies: content.skillTechnologies.map((item) => ({
      id: item.id,
      position: item.position,
      label: item.label,
    })),
    featuredProjects: content.featuredProjects.map((item) => ({
      projectId: item.projectId,
      position: item.position,
    })),
  };
}

function withPositions<T extends { position: number }>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, position: index }));
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeDraft(input: SiteContentInput): SiteContentInput {
  return {
    ...input,
    aboutParagraphs: withPositions(input.aboutParagraphs),
    aboutBadges: withPositions(input.aboutBadges),
    skillCategories: withPositions(input.skillCategories),
    skillItems: withPositions(input.skillItems),
    skillTechnologies: withPositions(input.skillTechnologies),
    featuredProjects: withPositions(input.featuredProjects),
  };
}

type CmsHomeEditorState = {
  content: React.ReactNode;
  statusBadge: React.ReactNode;
  toolbar: React.ReactNode;
  isDirty: boolean;
};

export function useCmsHomeEditor({ onDirtyChange }: CmsHomeSectionProps): CmsHomeEditorState {
  const utils = trpc.useUtils();
  const siteQuery = trpc.siteContent.get.useQuery(undefined, {
    retry: 0,
    refetchOnWindowFocus: false,
  });
  const presetsListQuery = trpc.siteContent.presets.list.useQuery(undefined, {
    retry: 0,
    refetchOnWindowFocus: false,
  });
  const projectsQuery = trpc.projects.list.useQuery(undefined, {
    staleTime: 30_000,
  });

  const [draft, setDraft] = React.useState<SiteContentInput>(EMPTY_CONTENT);
  const [baseline, setBaseline] = React.useState<SiteContentInput>(EMPTY_CONTENT);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = React.useState('');
  const [presetName, setPresetName] = React.useState('');
  const [isPresetSaveOpen, setIsPresetSaveOpen] = React.useState(false);
  const [loadedPresetName, setLoadedPresetName] = React.useState<string | null>(null);

  const presetGetQuery = trpc.siteContent.presets.get.useQuery(
    { id: selectedPresetId },
    { enabled: false },
  );

  React.useEffect(() => {
    const next = siteQuery.data ? normalizeDraft(toInput(siteQuery.data)) : EMPTY_CONTENT;
    setDraft(next);
    setBaseline(next);
    setError(null);
    setLoadedPresetName(null);
  }, [siteQuery.data]);

  const saveMutation = trpc.siteContent.upsert.useMutation({
    onSuccess: (saved) => {
      const next = normalizeDraft(toInput(saved));
      utils.siteContent.get.setData(undefined, saved);
      setDraft(next);
      setBaseline(next);
      setError(null);
    },
    onError: (err) => {
      setError(err.message ?? 'Failed to save');
    },
  });

  const createPresetMutation = trpc.siteContent.presets.create.useMutation({
    onSuccess: () => {
      presetsListQuery.refetch();
      setPresetName('');
      setIsPresetSaveOpen(false);
    },
    onError: (err) => {
      setError(err.message ?? 'Failed to save profile');
    },
  });

  const isDirty = React.useMemo(() => {
    return JSON.stringify(draft) !== JSON.stringify(baseline);
  }, [baseline, draft]);

  React.useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const statusBadge = siteQuery.isLoading ? (
    <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-gray-900/40">
      API: checking…
    </span>
  ) : siteQuery.isError ? (
    <span
      className="inline-flex items-center rounded-full border border-red-200 dark:border-red-900/50 px-2.5 py-1 text-xs text-red-700 dark:text-red-300 bg-red-50/60 dark:bg-red-950/10"
      title={siteQuery.error.message}
    >
      API: offline
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-1 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/10">
      API: connected
    </span>
  );

  const updateProfileField = (key: keyof SiteContentInput['profile'], value: string) => {
    setDraft((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [key]: value,
      },
    }));
  };

  const addAboutParagraph = () => {
    setDraft((prev) => ({
      ...prev,
      aboutParagraphs: withPositions([
        ...prev.aboutParagraphs,
        { id: createId(), position: prev.aboutParagraphs.length, body: '' },
      ]),
    }));
  };

  const addAboutBadge = () => {
    setDraft((prev) => ({
      ...prev,
      aboutBadges: withPositions([
        ...prev.aboutBadges,
        { id: createId(), position: prev.aboutBadges.length, label: '', color: '' },
      ]),
    }));
  };

  const addSkillCategory = () => {
    setDraft((prev) => ({
      ...prev,
      skillCategories: withPositions([
        ...prev.skillCategories,
        { id: createId(), position: prev.skillCategories.length, title: '', description: '' },
      ]),
    }));
  };

  const addSkillItem = () => {
    const firstCategory = draft.skillCategories[0]?.id ?? '';
    setDraft((prev) => ({
      ...prev,
      skillItems: withPositions([
        ...prev.skillItems,
        { id: createId(), categoryId: firstCategory, position: prev.skillItems.length, label: '' },
      ]),
    }));
  };

  const addSkillTechnology = () => {
    setDraft((prev) => ({
      ...prev,
      skillTechnologies: withPositions([
        ...prev.skillTechnologies,
        { id: createId(), position: prev.skillTechnologies.length, label: '' },
      ]),
    }));
  };

  const addFeaturedProject = () => {
    const firstProject = projectsQuery.data?.[0]?.id ?? '';
    setDraft((prev) => ({
      ...prev,
      featuredProjects: withPositions([
        ...prev.featuredProjects,
        { projectId: firstProject, position: prev.featuredProjects.length },
      ]),
    }));
  };

  const handleSave = () => {
    setError(null);
    const normalized = normalizeDraft(draft);
    saveMutation.mutate(normalized);
  };

  const handleLoadPreset = async () => {
    if (!selectedPresetId) return;
    if (isDirty && !window.confirm('You have unsaved changes. Load a profile preset anyway?')) {
      return;
    }

    const result = await presetGetQuery.refetch();
    if (!result.data) return;

    setDraft(normalizeDraft(result.data.content));
    setLoadedPresetName(result.data.name);
    setError(null);
  };

  const handleSavePreset = () => {
    const name = presetName.trim();
    if (!name) {
      setError('Profile name is required.');
      return;
    }

    setError(null);
    createPresetMutation.mutate({
      name,
      content: normalizeDraft(draft),
    });
  };
  const toolbar = (
    <button
      type="button"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-60"
      onClick={handleSave}
      disabled={!isDirty || saveMutation.isPending}
    >
      <Save size={18} />
      {saveMutation.isPending ? 'Saving…' : 'Save'}
    </button>
  );

  const content = (
    <div className="grid gap-5">
      {error && (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/60 dark:bg-red-950/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold text-slate-900 dark:text-slate-100">Profile presets</div>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-300 hover:underline"
            onClick={() => setIsPresetSaveOpen((open) => !open)}
          >
            <Plus size={16} />
            Save profile
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <label className="block">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Load preset</div>
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
              disabled={presetsListQuery.isLoading}
            >
              <option value="">Select a profile</option>
              {(presetsListQuery.data ?? []).map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
            onClick={handleLoadPreset}
            disabled={!selectedPresetId || presetGetQuery.isFetching}
          >
            {presetGetQuery.isFetching ? 'Loading…' : 'Load'}
          </button>
        </div>

        {loadedPresetName && (
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Loaded preset: <span className="font-medium text-slate-700 dark:text-slate-200">{loadedPresetName}</span> (not saved yet)
          </div>
        )}

        {isPresetSaveOpen && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="flex-1 min-w-[220px] rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
              placeholder="Profile name"
            />
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-60"
              onClick={handleSavePreset}
              disabled={createPresetMutation.isPending}
            >
              <Save size={16} />
              {createPresetMutation.isPending ? 'Saving…' : 'Save preset'}
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setIsPresetSaveOpen(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-6">
        <div className="text-base font-semibold text-slate-900 dark:text-slate-100">Hero</div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Name</div>
            <input
              value={draft.profile.heroName}
              onChange={(e) => updateProfileField('heroName', e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
              placeholder="Your name"
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Title</div>
            <input
              value={draft.profile.heroTitle}
              onChange={(e) => updateProfileField('heroTitle', e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
              placeholder="Frontend Engineer"
            />
          </label>
          <label className="block md:col-span-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Bio</div>
            <textarea
              value={draft.profile.heroBio}
              onChange={(e) => updateProfileField('heroBio', e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30 min-h-[110px]"
              placeholder="Short intro"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold text-slate-900 dark:text-slate-100">About</div>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-300 hover:underline"
            onClick={addAboutParagraph}
          >
            <Plus size={16} />
            Add paragraph
          </button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Left headline</div>
            <input
              value={draft.profile.aboutLeftHeadline}
              onChange={(e) => updateProfileField('aboutLeftHeadline', e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Right icon</div>
            <input
              value={draft.profile.aboutRightIcon}
              onChange={(e) => updateProfileField('aboutRightIcon', e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
              placeholder="lucide icon name"
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Right title</div>
            <input
              value={draft.profile.aboutRightTitle}
              onChange={(e) => updateProfileField('aboutRightTitle', e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
            />
          </label>
          <label className="block md:col-span-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Right description</div>
            <textarea
              value={draft.profile.aboutRightDescription}
              onChange={(e) => updateProfileField('aboutRightDescription', e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30 min-h-[100px]"
            />
          </label>
        </div>

        <div className="mt-6 grid gap-4">
          {draft.aboutParagraphs.map((paragraph, index) => (
            <div key={paragraph.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Paragraph {index + 1}
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-300"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      aboutParagraphs: withPositions(prev.aboutParagraphs.filter((p) => p.id !== paragraph.id)),
                    }))
                  }
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
              <textarea
                value={paragraph.body}
                onChange={(e) => {
                  const body = e.target.value;
                  setDraft((prev) => ({
                    ...prev,
                    aboutParagraphs: prev.aboutParagraphs.map((p) =>
                      p.id === paragraph.id ? { ...p, body } : p,
                    ),
                  }));
                }}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30 min-h-[90px]"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Badges</div>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-300 hover:underline"
            onClick={addAboutBadge}
          >
            <Plus size={16} />
            Add badge
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {draft.aboutBadges.map((badge) => (
            <div key={badge.id} className="flex items-center gap-2">
              <input
                value={badge.label}
                onChange={(e) => {
                  const label = e.target.value;
                  setDraft((prev) => ({
                    ...prev,
                    aboutBadges: prev.aboutBadges.map((b) => (b.id === badge.id ? { ...b, label } : b)),
                  }));
                }}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
                placeholder="Badge label"
              />
              <input
                value={badge.color ?? ''}
                onChange={(e) => {
                  const color = e.target.value;
                  setDraft((prev) => ({
                    ...prev,
                    aboutBadges: prev.aboutBadges.map((b) => (b.id === badge.id ? { ...b, color } : b)),
                  }));
                }}
                className="w-28 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
                placeholder="Color"
              />
              <button
                type="button"
                className="text-red-600 dark:text-red-300"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    aboutBadges: withPositions(prev.aboutBadges.filter((b) => b.id !== badge.id)),
                  }))
                }
                aria-label="Remove badge"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold text-slate-900 dark:text-slate-100">Skills</div>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-300 hover:underline"
            onClick={addSkillCategory}
          >
            <Plus size={16} />
            Add category
          </button>
        </div>
        <label className="block mt-4">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Intro</div>
          <textarea
            value={draft.profile.skillsIntro}
            onChange={(e) => updateProfileField('skillsIntro', e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30 min-h-[90px]"
          />
        </label>

        <div className="mt-4 grid gap-4">
          {draft.skillCategories.map((category) => (
            <div key={category.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Category</div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-300"
                  onClick={() => {
                    setDraft((prev) => ({
                      ...prev,
                      skillCategories: withPositions(prev.skillCategories.filter((c) => c.id !== category.id)),
                      skillItems: withPositions(prev.skillItems.filter((item) => item.categoryId !== category.id)),
                    }));
                  }}
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <input
                  value={category.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setDraft((prev) => ({
                      ...prev,
                      skillCategories: prev.skillCategories.map((c) =>
                        c.id === category.id ? { ...c, title } : c,
                      ),
                    }));
                  }}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
                  placeholder="Category title"
                />
                <input
                  value={category.description}
                  onChange={(e) => {
                    const description = e.target.value;
                    setDraft((prev) => ({
                      ...prev,
                      skillCategories: prev.skillCategories.map((c) =>
                        c.id === category.id ? { ...c, description } : c,
                      ),
                    }));
                  }}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
                  placeholder="Category description"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Skill items</div>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-300 hover:underline"
            onClick={addSkillItem}
          >
            <Plus size={16} />
            Add item
          </button>
        </div>
        <div className="mt-3 grid gap-3">
          {draft.skillItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <select
                value={item.categoryId}
                onChange={(e) => {
                  const categoryId = e.target.value;
                  setDraft((prev) => ({
                    ...prev,
                    skillItems: prev.skillItems.map((i) => (i.id === item.id ? { ...i, categoryId } : i)),
                  }));
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
              >
                <option value="">Unassigned</option>
                {draft.skillCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title || 'Untitled'}
                  </option>
                ))}
              </select>
              <input
                value={item.label}
                onChange={(e) => {
                  const label = e.target.value;
                  setDraft((prev) => ({
                    ...prev,
                    skillItems: prev.skillItems.map((i) => (i.id === item.id ? { ...i, label } : i)),
                  }));
                }}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
                placeholder="Skill label"
              />
              <button
                type="button"
                className="text-red-600 dark:text-red-300"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    skillItems: withPositions(prev.skillItems.filter((i) => i.id !== item.id)),
                  }))
                }
                aria-label="Remove skill item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Skill technologies</div>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-300 hover:underline"
            onClick={addSkillTechnology}
          >
            <Plus size={16} />
            Add technology
          </button>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {draft.skillTechnologies.map((tech) => (
            <div key={tech.id} className="flex items-center gap-2">
              <input
                value={tech.label}
                onChange={(e) => {
                  const label = e.target.value;
                  setDraft((prev) => ({
                    ...prev,
                    skillTechnologies: prev.skillTechnologies.map((t) => (t.id === tech.id ? { ...t, label } : t)),
                  }));
                }}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
                placeholder="Technology"
              />
              <button
                type="button"
                className="text-red-600 dark:text-red-300"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    skillTechnologies: withPositions(prev.skillTechnologies.filter((t) => t.id !== tech.id)),
                  }))
                }
                aria-label="Remove technology"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold text-slate-900 dark:text-slate-100">Featured Projects</div>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-300 hover:underline"
            onClick={addFeaturedProject}
          >
            <Plus size={16} />
            Add project
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          {draft.featuredProjects.map((entry, index) => (
            <div key={`${entry.projectId}-${index}`} className="flex items-center gap-2">
              <select
                value={entry.projectId}
                onChange={(e) => {
                  const projectId = e.target.value;
                  setDraft((prev) => ({
                    ...prev,
                    featuredProjects: prev.featuredProjects.map((p, idx) =>
                      idx === index ? { ...p, projectId } : p,
                    ),
                  }));
                }}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
              >
                <option value="">Select project</option>
                {(projectsQuery.data ?? []).map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="text-red-600 dark:text-red-300"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    featuredProjects: withPositions(prev.featuredProjects.filter((_, idx) => idx !== index)),
                  }))
                }
                aria-label="Remove featured project"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-6">
        <div className="text-base font-semibold text-slate-900 dark:text-slate-100">Contact</div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Title</div>
            <input
              value={draft.profile.contactTitle}
              onChange={(e) => updateProfileField('contactTitle', e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Subtitle</div>
            <input
              value={draft.profile.contactSubtitle}
              onChange={(e) => updateProfileField('contactSubtitle', e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Email</div>
            <input
              type="email"
              value={draft.profile.contactEmail}
              onChange={(e) => updateProfileField('contactEmail', e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Phone</div>
            <input
              value={draft.profile.contactPhone}
              onChange={(e) => updateProfileField('contactPhone', e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
            />
          </label>
          <label className="block md:col-span-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Location</div>
            <input
              value={draft.profile.contactLocation}
              onChange={(e) => updateProfileField('contactLocation', e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
            />
          </label>
        </div>
      </section>
    </div>
  );

  return {
    content,
    statusBadge,
    toolbar,
    isDirty,
  };
}

export default function CmsHomeSection({ onDirtyChange }: CmsHomeSectionProps) {
  const { content, statusBadge, toolbar } = useCmsHomeEditor({ onDirtyChange });

  return (
    <CmsUi
      title="Home"
      subtitle="Manage all content on the home page."
      sections={[{ id: 'home', label: 'Home', shortLabel: 'H' }]}
      activeSectionId="home"
      statusBadge={statusBadge}
      toolbar={toolbar}
      renderContent={() => content}
    />
  );
}
