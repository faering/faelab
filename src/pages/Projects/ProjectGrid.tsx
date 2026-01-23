import React from 'react';
import { z } from 'zod';
import { ProjectSchema } from '../../schemas/projectSchema';
import ProjectGridCard from './ProjectGridCard';

interface ProjectGridProps {
  projects: z.infer<typeof ProjectSchema>[];
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectGridCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ProjectGrid;
