import React from 'react';
import { z } from 'zod';
import { ProjectSchema } from '../../../../../../packages/types/projectSchema';
import { ExternalLink } from 'lucide-react';
import GitHubIconBlack from '../../../../icons/GitHub Mark/SVG/GitHub_Invertocat_Black.svg';
import GitHubIconWhite from '../../../../icons/GitHub Mark/SVG/GitHub_Invertocat_White.svg';

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
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{project.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{project.description}</p>
      </div>
      <div className="flex flex-col flex-1 justify-end">
        {/* Minimum gap above tools */}
        <div style={{ minHeight: '16px' }} />
        {/* Tools at top */}
        <div className="flex flex-wrap gap-2 mb-2">
          {project.techStack?.map((tool) => (
            <span key={tool} className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded">
              {tool}
            </span>
          ))}
        </div>
        {/* Tags below tools */}
        <div className="flex flex-wrap gap-2 mb-2">
          {project.tags?.map((tag) => (
            <span key={tag} className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 flex gap-2 justify-center">
          {/* Live Demo button */}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-pink-400 dark:bg-pink-900 hover:bg-pink-500 dark:hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 transform hover:scale-105"
            >
              <ExternalLink size={16} className="mr-2" />
              Live Demo
            </a>
          )}
          {/* GitHub Repo button */}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center border-2 border-purple-300 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-600 text-purple-600 dark:text-purple-200 hover:text-purple-700 dark:hover:text-purple-100 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-105"
            >
              <img src={GitHubIconBlack} alt="GitHub" className="w-5 h-5 mr-2 block dark:hidden" />
              <img src={GitHubIconWhite} alt="GitHub" className="w-5 h-5 mr-2 hidden dark:block" />
              Code
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectGridCard;
