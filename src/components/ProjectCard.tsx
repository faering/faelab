import { Project } from "../schemas/projectSchema";
import { Star } from 'lucide-react';
import GitHubIcon from '../../icons/GitHub Mark/SVG/GitHub_Invertocat_Black.svg';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <div
      className={`group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden ${
        project.featured ? 'ring-2 ring-pink-300 ring-opacity-50' : ''
      }`}
    >
      <div className={`grid lg:grid-cols-2 gap-0`}>
        <div className={`${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
          <div className="relative h-64 lg:h-full overflow-hidden">
            {project.featured && (
              <div className="absolute top-4 left-4 z-10 flex items-center bg-pink-300 text-pink-800 px-3 py-1 rounded-full text-sm font-semibold">
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
          <h3 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-4">
            {project.title}
          </h3>

          <p className="text-slate-600 mb-6 leading-relaxed">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {project.techStack.map((tech, techIndex) => (
              <span
                key={techIndex}
                className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
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
                className="flex items-center bg-pink-400 hover:bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 transform hover:scale-105"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M18 13v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Live Demo
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center border-2 border-purple-300 hover:border-purple-400 text-purple-600 hover:text-purple-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                <img src={GitHubIcon} alt="GitHub" className="w-5 h-5 mr-2" />
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