import React from 'react';
import { z } from 'zod';
import { ProjectSchema } from '../../schemas/projectSchema';

interface ProjectGridCardProps {
  project: z.infer<typeof ProjectSchema>;
}

const ProjectGridCard: React.FC<ProjectGridCardProps> = ({ project }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 flex flex-col h-full transition hover:shadow-lg">
      {/* Project image */}
      {project.image && (
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-40 object-cover rounded mb-4"
        />
      )}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">{project.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{project.description}</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {project.tags?.map((tag) => (
          <span key={tag} className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs">{tag}</span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-auto">
        {project.techStack?.map((tool) => (
          <span key={tool} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs">{tool}</span>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        {/* Live Demo button */}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition"
          >
            Live Demo
          </a>
        )}
        {/* GitHub Repo button */}
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-900 transition"
          >
            GitHub Repo
          </a>
        )}
      </div>
    </div>
  );
};

export default ProjectGridCard;
