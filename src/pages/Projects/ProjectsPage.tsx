import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { z } from 'zod';
import { ProjectSchema } from '../../schemas/projectSchema';
import { projects as allProjects } from '../../data/Projects';
import ProjectList from './ProjectList';
import ViewSettings from './ViewSettingsBox';
import ProjectFilterDropdown from './ProjectFilterDropdown';
import ProjectGrid from './ProjectGrid';

const VIEW_MODE_KEY = 'projectsViewMode';

type ViewMode = 'grid' | 'list';

// Placeholder for projects data (to be replaced with import/API later)
const projects: z.infer<typeof ProjectSchema>[] = [];

// Extract unique tags and tools from projects
const getUnique = (arr: any[], key: string) => Array.from(new Set(arr.flatMap((p) => p[key] || [])));

const ProjectsPage: React.FC = () => {
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

  // Extract unique tags and tools
  const tagOptions = getUnique(allProjects, 'tags').map((t) => ({ label: t, value: t }));
  const toolOptions = getUnique(allProjects, 'techStack').map((t) => ({ label: t, value: t }));

  // Filtering logic
  const filteredProjects = (allProjects as z.infer<typeof ProjectSchema>[]).filter((project) => {
    const tagMatch = selectedTags.length === 0 || (project.tags && selectedTags.every((tag) => project.tags.includes(tag)));
    const toolMatch = selectedTools.length === 0 || (project.techStack && selectedTools.every((tool) => project.techStack.includes(tool)));
    return tagMatch && toolMatch;
  });

  return (
    <div className="container mx-auto px-4 py-8 mt-20">

      {/* View header: Filters (left) and view mode (right) */}
      <ViewSettings viewMode={viewMode} setViewMode={setViewMode}>
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

      {/* Projects view (grid or list) or empty state */}
      <div>
        {filteredProjects.length === 0 ? (
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
  );
};

export default ProjectsPage;
