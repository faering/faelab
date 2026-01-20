import { ProjectSchema, Project } from "../schemas/projectSchema";
import { ProjectCard } from "./ProjectCard";
import { portfolioConfig } from '../config/portfolio';
import GitHubIcon from '../../icons/GitHub Mark/SVG/GitHub_Invertocat_Black.svg';

/**
 * Container component responsible for validation + layout
 */
interface ProjectLayoutProps {
  data: unknown[];
}

export function ProjectLayout({ data }: ProjectLayoutProps) {
  // Validate all incoming project data at runtime
  const projects: Project[] = data.map((item) => ProjectSchema.parse(item));

  return (
    <section id="projects" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Featured Projects
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto mb-8"></div>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              A showcase of my recent work and creative solutions to complex problems
            </p>
          </div>

          <div className="grid gap-8">
            {projects.map((project, index) => (
              <ProjectCard key={project.id || index} project={project} index={index} />
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-lg text-slate-600 mb-8">
              Want to see more? Check out my GitHub for additional projects and contributions.
            </p>
            <a
              href={`${portfolioConfig.social.github}?tab=repositories`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-purple-400 hover:bg-purple-500 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200 transform hover:scale-105"
            >
              <img src={GitHubIcon} alt="GitHub" className="w-5 h-5 mr-2 invert" />
              View All Projects
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProjectLayout;