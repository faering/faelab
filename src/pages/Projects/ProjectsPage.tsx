import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { ProjectSchema } from '../../schemas/projectSchema';
import { projects as allProjects } from '../../data/Projects';
import ProjectList from './ProjectList';

const VIEW_MODE_KEY = 'projectsViewMode';

type ViewMode = 'grid' | 'list';

// Placeholder for projects data (to be replaced with import/API later)
const projects: z.infer<typeof ProjectSchema>[] = [];

const ProjectsPage: React.FC = () => {
  // Load view mode from localStorage or default to 'grid'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    return saved === 'list' ? 'list' : 'grid';
  });

  // Save view mode to localStorage on change
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  // Placeholder for filtered projects (add filter logic later)
  const filteredProjects = allProjects as z.infer<typeof ProjectSchema>[];

  // Empty state
  if (filteredProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500 dark:text-gray-400">
        <span className="text-lg font-semibold">No projects found.</span>
        <span className="text-sm mt-2">Try adjusting your filters.</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Top bar: Filters (left), View toggle (right) */}
      <div className="flex items-center justify-between mb-6">
        <div>{/* ProjectFilters will go here */}</div>
        <div className="flex space-x-2">
          <button
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            {/* Grid icon */}
            <span className="material-icons">grid_view</span>
          </button>
          <button
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            {/* List icon */}
            <span className="material-icons">view_list</span>
          </button>
        </div>
      </div>
      {/* Projects view (grid or list) */}
      <div>
        {viewMode === 'grid' ? (
          <div>{/* ProjectGrid will go here */}</div>
        ) : (
          <ProjectList projects={filteredProjects} />
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
