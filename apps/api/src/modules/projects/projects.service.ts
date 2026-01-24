export interface Project {
  id: string;
  title: string;
  imageUrl?: string;
}

const projects: Project[] = [
  { id: '1', title: 'Portfolio Website' },
  { id: '2', title: 'CMS API' },
];

export function getProjects(): Project[] {
  return projects;
}
