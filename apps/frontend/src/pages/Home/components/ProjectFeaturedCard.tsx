import { Project } from "../../../../../../packages/types/projectSchema";
import { Star, ExternalLink } from 'lucide-react';
import GitHubIconBlack from '../../../../icons/GitHub Mark/SVG/GitHub_Invertocat_Black.svg';
import GitHubIconWhite from '../../../../icons/GitHub Mark/SVG/GitHub_Invertocat_White.svg';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <div
      className={`group bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden ${
        project.featured ? 'ring-2 ring-pink-300 dark:ring-pink-700 ring-opacity-50' : ''
      }`}
    >
      <div className={`grid lg:grid-cols-2 gap-0`}>
        <div className={`${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
          <div className="relative h-64 lg:h-full overflow-hidden">
            {project.featured && (
              <div className="absolute top-4 left-4 z-10 flex items-center bg-pink-300 dark:bg-pink-900 text-pink-800 dark:text-pink-200 px-3 py-1 rounded-full text-sm font-semibold">
                <Star size={16} className="mr-1" />
                Featured
              </div>
            )}
            {project.image && (
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>

        <div className={`p-8 lg:p-12 flex flex-col justify-center ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
          <h3 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white mb-4">
            {project.title}
          </h3>

          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {project.techStack.map((tech, techIndex) => (
              <span
                key={techIndex}
                className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="flex space-x-4">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center bg-pink-400 dark:bg-pink-900 hover:bg-pink-500 dark:hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 transform hover:scale-105"
              >
                <ExternalLink size={18} className="mr-2" />
                Live Demo
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center border-2 border-purple-300 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-600 text-purple-600 dark:text-purple-200 hover:text-purple-700 dark:hover:text-purple-100 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                <img src={GitHubIconBlack} alt="GitHub" className="w-5 h-5 mr-2 block dark:hidden" />
                <img src={GitHubIconWhite} alt="GitHub" className="w-5 h-5 mr-2 hidden dark:block" />
                Code
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;