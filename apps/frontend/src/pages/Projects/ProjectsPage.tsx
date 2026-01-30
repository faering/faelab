import React, { useState, useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import type { Project } from '../../../../../packages/types/projectSchema';
import ProjectList from './ProjectList';
import ViewSettings from './ViewSettingsBox';
import ProjectFilterDropdown from './ProjectFilterDropdown';
import ProjectGrid from './ProjectGrid';
import ProjectsCmsPopup from './ProjectsCmsPopup';
import { trpc } from '../../trpc/trpc';

const VIEW_MODE_KEY = 'projectsViewMode';

type ViewMode = 'grid' | 'list';

// Extract unique tags and tools from projects
const getUnique = (arr: Project[], key: 'tags' | 'techStack') =>
  Array.from(new Set(arr.flatMap((p) => p[key] ?? [])));

const ProjectsPage: React.FC = () => {
  const projectsQuery = trpc.projects.list.useQuery(undefined, {
    staleTime: 30_000,
  });

  const allProjects: Project[] = projectsQuery.data ?? [];

  const location = useLocation();
  const navigationType = useNavigationType();
  // Scroll to top only when navigating from another page (PUSH navigation)
  useEffect(() => {
    if (navigationType === 'PUSH') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location.pathname, navigationType]);
  // Load view mode from localStorage or default to 'grid'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    return saved === 'list' ? 'list' : 'grid';
  });

  // Save view mode to localStorage on change
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  // Filter state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const [cmsIsDirty, setCmsIsDirty] = useState(false);

  // Extract unique tags and tools
  const tagOptions = getUnique(allProjects, 'tags').map((t) => ({ label: t, value: t }));
  const toolOptions = getUnique(allProjects, 'techStack').map((t) => ({ label: t, value: t }));

  // Filtering logic
  const filteredProjects = (allProjects as Project[]).filter((project) => {
    const tags = project.tags ?? [];
    const techStack = project.techStack ?? [];

    const tagMatch = selectedTags.length === 0 || selectedTags.every((tag) => tags.includes(tag));
    const toolMatch = selectedTools.length === 0 || selectedTools.every((tool) => techStack.includes(tool));
    return tagMatch && toolMatch;
  });

  return (
    <section className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-200 via-purple-200 to-indigo-200 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22m36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      <div className="container mx-auto px-4 py-8 mt-20 relative z-10">
        {/* View header: Filters (left) and view mode (right) */}
        <ViewSettings
          viewMode={viewMode}
          setViewMode={setViewMode}
          cmsTitle="Projects CMS"
          cmsIsDirty={cmsIsDirty}
          onCmsOpenChange={(open) => {
            if (!open) setCmsIsDirty(false);
          }}
          cmsContent={<ProjectsCmsPopup onDirtyChange={setCmsIsDirty} />}
        >
          <ProjectFilterDropdown
            label="Tags"
            options={tagOptions}
            selected={selectedTags}
            onChange={setSelectedTags}
          />
          <ProjectFilterDropdown
            label="Tools"
            options={toolOptions}
            selected={selectedTools}
            onChange={setSelectedTools}
          />
          <button
            type="button"
            className="ml-2 text-sm font-medium text-purple-700 dark:text-purple-300 hover:underline focus:outline-none bg-transparent border-none p-0"
            onClick={() => { setSelectedTags([]); setSelectedTools([]); }}
          >
            reset filters
          </button>
        </ViewSettings>

        {/* Projects view (grid or list) */}
        <div>
          {projectsQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500 dark:text-gray-400">
              <span className="text-lg font-semibold">Loading projects…</span>
            </div>
          ) : projectsQuery.isError ? (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500 dark:text-gray-400">
              <span className="text-lg font-semibold">Could not load projects.</span>
              <span className="text-sm mt-2">
                {projectsQuery.error instanceof Error ? projectsQuery.error.message : 'Unknown error'}
              </span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500 dark:text-gray-400">
              <span className="text-lg font-semibold">No projects found.</span>
              <span className="text-sm mt-2">Try adjusting your filters.</span>
            </div>
          ) : viewMode === 'grid' ? (
            <ProjectGrid projects={filteredProjects} />
          ) : (
            <ProjectList projects={filteredProjects} />
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectsPage;
