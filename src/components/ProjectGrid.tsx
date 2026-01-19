import { ProjectSchema, Project } from "../schemas/projectSchema";
import { ProjectCard } from "./ProjectCard";

/**
 * Container component responsible for validation + layout
 */
interface ProjectGridProps {
  data: unknown[];
}

export function ProjectGrid({ data }: ProjectGridProps) {
  // Validate all incoming project data at runtime
  const projects: Project[] = data.map((item) =>
    ProjectSchema.parse(item)
  );

  return (
    <section className="grid gap-6 md:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </section>
  );
}

export default ProjectGrid;