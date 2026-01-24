import React from 'react';
import { z } from 'zod';
import { ProjectSchema } from '../../../../../packages/types/projectSchema';
import ProjectListItem from './ProjectListItem';

interface ProjectListProps {
  projects: z.infer<typeof ProjectSchema>[];
}

const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  if (!projects.length) {
    return null;
  }
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 rounded-lg shadow">
      {projects.map((project) => (
        <ProjectListItem key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ProjectList;
