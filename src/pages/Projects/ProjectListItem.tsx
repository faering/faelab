import React from 'react';
import { z } from 'zod';
import { ProjectSchema } from '../../schemas/projectSchema';

interface ProjectListItemProps {
  project: z.infer<typeof ProjectSchema>;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({ project }) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
      <img
        src={project.image}
        alt={project.title}
        className="w-24 h-24 object-cover rounded-lg shadow-md flex-shrink-0"
      />
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-1">{project.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {project.techStack?.map((tech: string) => (
            <span key={tech} className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-1 rounded">
              {tech}
            </span>
          ))}
        </div>
        <div className="flex gap-4 mt-2">
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              Repo
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              Live
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectListItem;
