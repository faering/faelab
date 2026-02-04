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
  aboutHighlights: [],
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
    aboutHighlights: content.aboutHighlights.map((item) => ({
      id: item.id,
      position: item.position,
      icon: item.icon,
      title: item.title,
      description: item.description,
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
      skillLevel: item.skillLevel,
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
    aboutHighlights: withPositions(input.aboutHighlights),
    skillCategories: withPositions(input.skillCategories),
    skillItems: withPositions(input.skillItems),
    skillTechnologies: withPositions(input.skillTechnologies),
    featuredProjects: withPositions(input.featuredProjects),
  };
}

function withLegacyAboutHighlight(input: SiteContentInput): SiteContentInput {
  const firstHighlight = input.aboutHighlights[0];
  if (!firstHighlight) return input;

  return {
    ...input,
    profile: {
      ...input.profile,
      aboutRightIcon: firstHighlight.icon || input.profile.aboutRightIcon,
      aboutRightTitle: firstHighlight.title || input.profile.aboutRightTitle,
      aboutRightDescription: firstHighlight.description || input.profile.aboutRightDescription,
    },
  };
}

type DraftErrors = {
  profile: Partial<Record<keyof SiteContentInput['profile'], string>>;
  aboutParagraphs: Record<string, string>;
  aboutBadges: Record<string, string>;
  aboutHighlights: Record<string, { icon?: string; title?: string; description?: string }>;
  skillCategories: Record<string, { title?: string; description?: string }>;
  skillItems: Record<string, { label?: string; categoryId?: string; skillLevel?: string }>;
  skillTechnologies: Record<string, string>;
  featuredProjects: Record<string, string>;
};

const EMPTY_ERRORS: DraftErrors = {
  profile: {},
  aboutParagraphs: {},
  aboutBadges: {},
  aboutHighlights: {},
  skillCategories: {},
  skillItems: {},
  skillTechnologies: {},
  featuredProjects: {},
};

const ABOUT_BADGE_COLORS = ['#f472b6', '#c084fc', '#22d3ee'];

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateDraft(draft: SiteContentInput): DraftErrors {
  const errors: DraftErrors = {
    profile: {},
    aboutParagraphs: {},
    aboutBadges: {},
    aboutHighlights: {},
    skillCategories: {},
    skillItems: {},
    skillTechnologies: {},
    featuredProjects: {},
  };

  const requiredProfileFields: Array<keyof SiteContentInput['profile']> = [
    'heroName',
    'heroTitle',
    'heroBio',
    'aboutLeftHeadline',
    'skillsIntro',
    'contactTitle',
    'contactSubtitle',
    'contactEmail',
    'contactPhone',
    'contactLocation',
  ];

  for (const key of requiredProfileFields) {
    if (!draft.profile[key].trim()) {
      errors.profile[key] = 'Required';
    }
  }

  if (draft.profile.contactEmail.trim() && !isValidEmail(draft.profile.contactEmail.trim())) {
    errors.profile.contactEmail = 'Enter a valid email';
  }

  draft.aboutParagraphs.forEach((paragraph) => {
    if (!paragraph.body.trim()) {
      errors.aboutParagraphs[paragraph.id] = 'Required';
    }
  });

  draft.aboutBadges.forEach((badge) => {
    if (!badge.label.trim()) {
      errors.aboutBadges[badge.id] = 'Required';
    }
  });

  draft.aboutHighlights.forEach((highlight) => {
    const highlightErrors: { icon?: string; title?: string; description?: string } = {};
    if (!highlight.icon.trim()) highlightErrors.icon = 'Required';
    if (!highlight.title.trim()) highlightErrors.title = 'Required';
    if (!highlight.description.trim()) highlightErrors.description = 'Required';
    if (highlightErrors.icon || highlightErrors.title || highlightErrors.description) {
      errors.aboutHighlights[highlight.id] = highlightErrors;
    }
  });

  draft.skillCategories.forEach((category) => {
    const categoryErrors: { title?: string; description?: string } = {};
    if (!category.title.trim()) categoryErrors.title = 'Required';
    if (!category.description.trim()) categoryErrors.description = 'Required';
    if (categoryErrors.title || categoryErrors.description) {
      errors.skillCategories[category.id] = categoryErrors;
    }
  });

  const hasCategories = draft.skillCategories.length > 0;

  draft.skillItems.forEach((item) => {
    const itemErrors: { label?: string; categoryId?: string; skillLevel?: string } = {};
    if (!item.label.trim()) itemErrors.label = 'Required';
    if (hasCategories && !item.categoryId.trim()) itemErrors.categoryId = 'Select a category';
    if (Number.isNaN(item.skillLevel) || item.skillLevel < 0 || item.skillLevel > 100) itemErrors.skillLevel = '0–100';
    if (itemErrors.label || itemErrors.categoryId || itemErrors.skillLevel) {
      errors.skillItems[item.id] = itemErrors;
    }
  });

  draft.skillTechnologies.forEach((tech) => {
    if (!tech.label.trim()) {
      errors.skillTechnologies[tech.id] = 'Required';
    }
  });

  draft.featuredProjects.forEach((project, index) => {
    if (!project.projectId.trim()) {
      errors.featuredProjects[`${project.projectId}-${index}`] = 'Select a project';
    }
  });

  return errors;
}

function hasErrors(errors: DraftErrors) {
  return (
    Object.values(errors.profile).some(Boolean) ||
    Object.values(errors.aboutParagraphs).some(Boolean) ||
    Object.values(errors.aboutBadges).some(Boolean) ||
    Object.values(errors.aboutHighlights).some((entry) => entry?.icon || entry?.title || entry?.description) ||
    Object.values(errors.skillTechnologies).some(Boolean) ||
    Object.values(errors.featuredProjects).some(Boolean) ||
    Object.values(errors.skillCategories).some((entry) => entry?.title || entry?.description) ||
    Object.values(errors.skillItems).some((entry) => entry?.label || entry?.categoryId || entry?.skillLevel)
  );
}

type CmsHomeEditorState = {
  content: React.ReactNode;
  statusBadge: React.ReactNode;
  toolbar: React.ReactNode;
  isDirty: boolean;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useCmsHomeEditor({ onDirtyChange }: CmsHomeSectionProps): CmsHomeEditorState {
  const utils = trpc.useUtils();
  const siteQuery = trpc.siteContent.get.useQuery(undefined, {
    retry: 0,
    refetchOnWindowFocus: false,
  });
  const presetsListQuery = trpc.siteContent.presets.list.useQuery(undefined, {
    retry: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });
  const projectsQuery = trpc.projects.list.useQuery(undefined, {
    staleTime: 30_000,
  });

  const [draft, setDraft] = React.useState<SiteContentInput>(EMPTY_CONTENT);
  const [baseline, setBaseline] = React.useState<SiteContentInput>(EMPTY_CONTENT);
  const [error, setError] = React.useState<string | null>(null);
  const [validationErrors, setValidationErrors] = React.useState<DraftErrors>(EMPTY_ERRORS);
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
    const highlights = next.aboutHighlights.length > 0
      ? next.aboutHighlights
      : Array.from({ length: 3 }, (_, index) => ({
          id: createId(),
          position: index,
          icon: '',
          title: '',
          description: '',
          color: ABOUT_BADGE_COLORS[index % ABOUT_BADGE_COLORS.length],
        }));
    const merged = {
      ...next,
      aboutHighlights: withPositions(highlights),
    };
    setDraft(merged);
    setBaseline(merged);
    setError(null);
    setValidationErrors(EMPTY_ERRORS);
    setLoadedPresetName(null);
  }, [siteQuery.data]);

  React.useEffect(() => {
    if (draft.skillCategories.length === 0) return;

    const fallbackCategoryId = draft.skillCategories[0].id;
    const needsUpdate = draft.skillItems.some((item) => !item.categoryId.trim());
    if (!needsUpdate) return;

    setDraft((prev) => ({
      ...prev,
      skillItems: prev.skillItems.map((item) =>
        item.categoryId.trim() ? item : { ...item, categoryId: fallbackCategoryId },
      ),
    }));
  }, [draft.skillCategories, draft.skillItems]);

  const saveMutation = trpc.siteContent.upsert.useMutation({
    onSuccess: (saved) => {
      const next = normalizeDraft(toInput(saved));
      utils.siteContent.get.setData(undefined, saved);
      setDraft(next);
      setBaseline(next);
      setError(null);
      setValidationErrors(EMPTY_ERRORS);
    },
    onError: (err) => {
      setError(err.message ?? 'Failed to save');
    },
  });

  const createPresetMutation = trpc.siteContent.presets.create.useMutation({
    onSuccess: (created) => {
      utils.siteContent.presets.list.invalidate();
      setSelectedPresetId(created.id);
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
    setValidationErrors((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [key]: undefined,
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
    const nextColor = ABOUT_BADGE_COLORS[draft.aboutBadges.length % ABOUT_BADGE_COLORS.length];
    setDraft((prev) => ({
      ...prev,
      aboutBadges: withPositions([
        ...prev.aboutBadges,
        { id: createId(), position: prev.aboutBadges.length, label: '', color: nextColor },
      ]),
    }));
  };

  const addAboutHighlight = () => {
    if (draft.aboutHighlights.length >= 3) return;
    const nextColor = ABOUT_BADGE_COLORS[draft.aboutHighlights.length % ABOUT_BADGE_COLORS.length];
    setDraft((prev) => ({
      ...prev,
      aboutHighlights: withPositions([
        ...prev.aboutHighlights,
        { id: createId(), position: prev.aboutHighlights.length, icon: '', title: '', description: '', color: nextColor },
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

  const addSkillItem = (categoryId: string) => {
    setDraft((prev) => ({
      ...prev,
      skillItems: withPositions([
        ...prev.skillItems,
        { id: createId(), categoryId, position: prev.skillItems.length, label: '', skillLevel: 80 },
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
    const mergedDraft = withLegacyAboutHighlight(draft);
    const nextErrors = validateDraft(mergedDraft);
    setValidationErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      setError('Please fix the highlighted fields before saving.');
      return;
    }
    const normalized = normalizeDraft(mergedDraft);
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
    setValidationErrors(EMPTY_ERRORS);
    setLoadedPresetName(result.data.name);
    setError(null);
  };

  const handleSavePreset = () => {
    const name = presetName.trim();
    if (!name) {
      setError('Profile name is required.');
      return;
    }

    const mergedDraft = withLegacyAboutHighlight(draft);
    const nextErrors = validateDraft(mergedDraft);
    setValidationErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      setError('Please fix the highlighted fields before saving.');
      return;
    }

    setError(null);
    createPresetMutation.mutate({
      name,
      content: normalizeDraft(mergedDraft),
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

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
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
            {presetsListQuery.isError && (
              <div className="mt-1 text-xs text-red-600 dark:text-red-300">
                {presetsListQuery.error.message}
              </div>
            )}
          </label>

          <button
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
            onClick={handleLoadPreset}
            disabled={!selectedPresetId || presetGetQuery.isFetching}
          >
            {presetGetQuery.isFetching ? 'Loading…' : 'Load'}
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
            onClick={() => presetsListQuery.refetch()}
            disabled={presetsListQuery.isFetching}
          >
            {presetsListQuery.isFetching ? 'Refreshing…' : 'Refresh'}
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
              className={`w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 ${
                validationErrors.profile.heroName
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
              }`}
              placeholder="Your name"
            />
            {validationErrors.profile.heroName && (
              <div className="mt-1 text-xs text-red-500">{validationErrors.profile.heroName}</div>
            )}
          </label>
          <label className="block">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Title</div>
            <input
              value={draft.profile.heroTitle}
              onChange={(e) => updateProfileField('heroTitle', e.target.value)}
              className={`w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 ${
                validationErrors.profile.heroTitle
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
              }`}
              placeholder="Frontend Engineer"
            />
            {validationErrors.profile.heroTitle && (
              <div className="mt-1 text-xs text-red-500">{validationErrors.profile.heroTitle}</div>
            )}
          </label>
          <label className="block md:col-span-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Bio</div>
            <textarea
              value={draft.profile.heroBio}
              onChange={(e) => updateProfileField('heroBio', e.target.value)}
              className={`w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 min-h-[110px] ${
                validationErrors.profile.heroBio
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
              }`}
              placeholder="Short intro"
            />
            {validationErrors.profile.heroBio && (
              <div className="mt-1 text-xs text-red-500">{validationErrors.profile.heroBio}</div>
            )}
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

        <div className="mt-4 grid gap-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Left column</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Headline, paragraphs, and badges shown on the left.
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Left headline</div>
                <input
                  value={draft.profile.aboutLeftHeadline}
                  onChange={(e) => updateProfileField('aboutLeftHeadline', e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 ${
                    validationErrors.profile.aboutLeftHeadline
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
                  }`}
                />
                {validationErrors.profile.aboutLeftHeadline && (
                  <div className="mt-1 text-xs text-red-500">{validationErrors.profile.aboutLeftHeadline}</div>
                )}
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
                      setValidationErrors((prev) => ({
                        ...prev,
                        aboutParagraphs: { ...prev.aboutParagraphs, [paragraph.id]: undefined },
                      }));
                    }}
                    className={`w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 min-h-[90px] ${
                      validationErrors.aboutParagraphs[paragraph.id]
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
                    }`}
                  />
                  {validationErrors.aboutParagraphs[paragraph.id] && (
                    <div className="mt-1 text-xs text-red-500">{validationErrors.aboutParagraphs[paragraph.id]}</div>
                  )}
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
                <div key={badge.id}>
                  <div className="flex items-center gap-2">
                    <input
                      value={badge.label}
                      onChange={(e) => {
                        const label = e.target.value;
                        setDraft((prev) => ({
                          ...prev,
                          aboutBadges: prev.aboutBadges.map((b) => (b.id === badge.id ? { ...b, label } : b)),
                        }));
                        setValidationErrors((prev) => ({
                          ...prev,
                          aboutBadges: { ...prev.aboutBadges, [badge.id]: undefined },
                        }));
                      }}
                      className={`flex-1 rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 ${
                        validationErrors.aboutBadges[badge.id]
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
                      }`}
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
                  {validationErrors.aboutBadges[badge.id] && (
                    <div className="text-xs text-red-500">{validationErrors.aboutBadges[badge.id]}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Right highlight card</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              This content appears as the right-side highlight box.
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Highlights</div>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-300 hover:underline"
                onClick={addAboutHighlight}
                disabled={draft.aboutHighlights.length >= 3}
              >
                <Plus size={16} />
                Add highlight
              </button>
            </div>

            <div className="mt-4 grid gap-4">
              {draft.aboutHighlights.map((highlight, index) => (
                <div key={highlight.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Highlight {index + 1}
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-300"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          aboutHighlights: withPositions(prev.aboutHighlights.filter((h) => h.id !== highlight.id)),
                        }))
                      }
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Icon</div>
                      <input
                        value={highlight.icon}
                        onChange={(e) => {
                          const icon = e.target.value;
                          setDraft((prev) => ({
                            ...prev,
                            aboutHighlights: prev.aboutHighlights.map((h) =>
                              h.id === highlight.id ? { ...h, icon } : h,
                            ),
                          }));
                          setValidationErrors((prev) => ({
                            ...prev,
                            aboutHighlights: {
                              ...prev.aboutHighlights,
                              [highlight.id]: { ...prev.aboutHighlights[highlight.id], icon: undefined },
                            },
                          }));
                        }}
                        className={`w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 ${
                          validationErrors.aboutHighlights[highlight.id]?.icon
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
                        }`}
                        placeholder="lucide icon name"
                      />
                      {validationErrors.aboutHighlights[highlight.id]?.icon && (
                        <div className="mt-1 text-xs text-red-500">{validationErrors.aboutHighlights[highlight.id]?.icon}</div>
                      )}
                    </label>
                    <label className="block">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Color</div>
                      <input
                        value={highlight.color ?? ''}
                        onChange={(e) => {
                          const color = e.target.value;
                          setDraft((prev) => ({
                            ...prev,
                            aboutHighlights: prev.aboutHighlights.map((h) =>
                              h.id === highlight.id ? { ...h, color } : h,
                            ),
                          }));
                        }}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950/30"
                        placeholder="#f472b6"
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Title</div>
                      <input
                        value={highlight.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          setDraft((prev) => ({
                            ...prev,
                            aboutHighlights: prev.aboutHighlights.map((h) =>
                              h.id === highlight.id ? { ...h, title } : h,
                            ),
                          }));
                          setValidationErrors((prev) => ({
                            ...prev,
                            aboutHighlights: {
                              ...prev.aboutHighlights,
                              [highlight.id]: { ...prev.aboutHighlights[highlight.id], title: undefined },
                            },
                          }));
                        }}
                        className={`w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 ${
                          validationErrors.aboutHighlights[highlight.id]?.title
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
                        }`}
                      />
                      {validationErrors.aboutHighlights[highlight.id]?.title && (
                        <div className="mt-1 text-xs text-red-500">{validationErrors.aboutHighlights[highlight.id]?.title}</div>
                      )}
                    </label>
                    <label className="block md:col-span-2">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Description</div>
                      <textarea
                        value={highlight.description}
                        onChange={(e) => {
                          const description = e.target.value;
                          setDraft((prev) => ({
                            ...prev,
                            aboutHighlights: prev.aboutHighlights.map((h) =>
                              h.id === highlight.id ? { ...h, description } : h,
                            ),
                          }));
                          setValidationErrors((prev) => ({
                            ...prev,
                            aboutHighlights: {
                              ...prev.aboutHighlights,
                              [highlight.id]: { ...prev.aboutHighlights[highlight.id], description: undefined },
                            },
                          }));
                        }}
                        className={`w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 min-h-[100px] ${
                          validationErrors.aboutHighlights[highlight.id]?.description
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
                        }`}
                      />
                      {validationErrors.aboutHighlights[highlight.id]?.description && (
                        <div className="mt-1 text-xs text-red-500">{validationErrors.aboutHighlights[highlight.id]?.description}</div>
                      )}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold text-slate-900 dark:text-slate-100">Skills</div>
        </div>
        <label className="block mt-4">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Intro</div>
          <textarea
            value={draft.profile.skillsIntro}
            onChange={(e) => updateProfileField('skillsIntro', e.target.value)}
            className={`w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 min-h-[90px] ${
              validationErrors.profile.skillsIntro
                ? 'border-red-400 focus:border-red-500'
                : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
            }`}
          />
          {validationErrors.profile.skillsIntro && (
            <div className="mt-1 text-xs text-red-500">{validationErrors.profile.skillsIntro}</div>
          )}
        </label>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Categories</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">A category is a bundle of related skills.</div>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-300 hover:underline"
            onClick={addSkillCategory}
          >
            <Plus size={16} />
            Add category
          </button>
        </div>

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
                    setValidationErrors((prev) => ({
                      ...prev,
                      skillCategories: {
                        ...prev.skillCategories,
                        [category.id]: { ...prev.skillCategories[category.id], title: undefined },
                      },
                    }));
                  }}
                  className={`rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 ${
                    validationErrors.skillCategories[category.id]?.title
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
                  }`}
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
                    setValidationErrors((prev) => ({
                      ...prev,
                      skillCategories: {
                        ...prev.skillCategories,
                        [category.id]: { ...prev.skillCategories[category.id], description: undefined },
                      },
                    }));
                  }}
                  className={`rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 ${
                    validationErrors.skillCategories[category.id]?.description
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
                  }`}
                  placeholder="Category description"
                />
              </div>
              {(validationErrors.skillCategories[category.id]?.title ||
                validationErrors.skillCategories[category.id]?.description) && (
                <div className="mt-2 text-xs text-red-500">
                  {validationErrors.skillCategories[category.id]?.title ??
                    validationErrors.skillCategories[category.id]?.description}
                </div>
              )}

              <div className="mt-5 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Items</div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-300 hover:underline"
                  onClick={() => addSkillItem(category.id)}
                >
                  <Plus size={16} />
                  Add item
                </button>
              </div>

              <div className="mt-3 grid gap-3">
                {draft.skillItems
                  .filter((item) => item.categoryId === category.id)
                  .map((item) => (
                    <div key={item.id}>
                      <div className="flex items-center gap-2">
                        <input
                          value={item.label}
                          onChange={(e) => {
                            const label = e.target.value;
                            setDraft((prev) => ({
                              ...prev,
                              skillItems: prev.skillItems.map((i) => (i.id === item.id ? { ...i, label } : i)),
                            }));
                            setValidationErrors((prev) => ({
                              ...prev,
                              skillItems: {
                                ...prev.skillItems,
                                [item.id]: { ...prev.skillItems[item.id], label: undefined },
                              },
                            }));
                          }}
                          className={`flex-1 rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 ${
                            validationErrors.skillItems[item.id]?.label
                              ? 'border-red-400 focus:border-red-500'
                              : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
                          }`}
                          placeholder="Skill label"
                        />
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={item.skillLevel}
                          onChange={(e) => {
                            const level = Number(e.target.value);
                            setDraft((prev) => ({
                              ...prev,
                              skillItems: prev.skillItems.map((i) => (i.id === item.id ? { ...i, skillLevel: level } : i)),
                            }));
                            setValidationErrors((prev) => ({
                              ...prev,
                              skillItems: {
                                ...prev.skillItems,
                                [item.id]: { ...prev.skillItems[item.id], skillLevel: undefined },
                              },
                            }));
                          }}
                          className={`w-20 rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 ${
                            validationErrors.skillItems[item.id]?.skillLevel
                              ? 'border-red-400 focus:border-red-500'
                              : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
                          }`}
                          aria-label="Skill level"
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
                      <div className="mt-2">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={item.skillLevel}
                          onChange={(e) => {
                            const level = Number(e.target.value);
                            setDraft((prev) => ({
                              ...prev,
                              skillItems: prev.skillItems.map((i) => (i.id === item.id ? { ...i, skillLevel: level } : i)),
                            }));
                            setValidationErrors((prev) => ({
                              ...prev,
                              skillItems: {
                                ...prev.skillItems,
                                [item.id]: { ...prev.skillItems[item.id], skillLevel: undefined },
                              },
                            }));
                          }}
                          className="w-full accent-purple-500"
                        />
                      </div>
                      {validationErrors.skillItems[item.id]?.label && (
                        <div className="text-xs text-red-500">{validationErrors.skillItems[item.id]?.label}</div>
                      )}
                      {validationErrors.skillItems[item.id]?.skillLevel && (
                        <div className="text-xs text-red-500">{validationErrors.skillItems[item.id]?.skillLevel}</div>
                      )}
                    </div>
                  ))}
                {draft.skillItems.filter((item) => item.categoryId === category.id).length === 0 && (
                  <div className="text-xs text-slate-500 dark:text-slate-400">No items yet.</div>
                )}
              </div>
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
            <div key={tech.id}>
              <div className="flex items-center gap-2">
                <input
                  value={tech.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    setDraft((prev) => ({
                      ...prev,
                      skillTechnologies: prev.skillTechnologies.map((t) => (t.id === tech.id ? { ...t, label } : t)),
                    }));
                    setValidationErrors((prev) => ({
                      ...prev,
                      skillTechnologies: { ...prev.skillTechnologies, [tech.id]: undefined },
                    }));
                  }}
                  className={`flex-1 rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 ${
                    validationErrors.skillTechnologies[tech.id]
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
                  }`}
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
              {validationErrors.skillTechnologies[tech.id] && (
                <div className="text-xs text-red-500">{validationErrors.skillTechnologies[tech.id]}</div>
              )}
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
          {draft.featuredProjects.map((entry, index) => {
            const entryKey = `${entry.projectId}-${index}`;
            return (
            <div key={entryKey} className="flex items-center gap-2">
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
                  setValidationErrors((prev) => ({
                    ...prev,
                    featuredProjects: { ...prev.featuredProjects, [entryKey]: undefined },
                  }));
                }}
                className={`flex-1 rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 ${
                  validationErrors.featuredProjects[entryKey]
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
                }`}
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
            );
          })}
        </div>
        {draft.featuredProjects.map((_, index) => {
          const entryKey = `${draft.featuredProjects[index]?.projectId ?? ''}-${index}`;
          const errorMessage = validationErrors.featuredProjects[entryKey];
          return errorMessage ? (
            <div key={`${entryKey}-error`} className="text-xs text-red-500">
              {errorMessage}
            </div>
          ) : null;
        })}
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-6">
        <div className="text-base font-semibold text-slate-900 dark:text-slate-100">Contact</div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Title</div>
            <input
              value={draft.profile.contactTitle}
              onChange={(e) => updateProfileField('contactTitle', e.target.value)}
              className={`w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 ${
                validationErrors.profile.contactTitle
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
              }`}
            />
            {validationErrors.profile.contactTitle && (
              <div className="mt-1 text-xs text-red-500">{validationErrors.profile.contactTitle}</div>
            )}
          </label>
          <label className="block">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Subtitle</div>
            <input
              value={draft.profile.contactSubtitle}
              onChange={(e) => updateProfileField('contactSubtitle', e.target.value)}
              className={`w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 ${
                validationErrors.profile.contactSubtitle
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
              }`}
            />
            {validationErrors.profile.contactSubtitle && (
              <div className="mt-1 text-xs text-red-500">{validationErrors.profile.contactSubtitle}</div>
            )}
          </label>
          <label className="block">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Email</div>
            <input
              type="email"
              value={draft.profile.contactEmail}
              onChange={(e) => updateProfileField('contactEmail', e.target.value)}
              className={`w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 ${
                validationErrors.profile.contactEmail
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
              }`}
            />
            {validationErrors.profile.contactEmail && (
              <div className="mt-1 text-xs text-red-500">{validationErrors.profile.contactEmail}</div>
            )}
          </label>
          <label className="block">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Phone</div>
            <input
              value={draft.profile.contactPhone}
              onChange={(e) => updateProfileField('contactPhone', e.target.value)}
              className={`w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 ${
                validationErrors.profile.contactPhone
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
              }`}
            />
            {validationErrors.profile.contactPhone && (
              <div className="mt-1 text-xs text-red-500">{validationErrors.profile.contactPhone}</div>
            )}
          </label>
          <label className="block md:col-span-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Location</div>
            <input
              value={draft.profile.contactLocation}
              onChange={(e) => updateProfileField('contactLocation', e.target.value)}
              className={`w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-950/30 ${
                validationErrors.profile.contactLocation
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-purple-400'
              }`}
            />
            {validationErrors.profile.contactLocation && (
              <div className="mt-1 text-xs text-red-500">{validationErrors.profile.contactLocation}</div>
            )}
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
