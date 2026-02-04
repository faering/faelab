import About from './components/About';
import Contact from './components/Contact';
import Hero from './components/Hero';
import ProjectsFeatured from './components/ProjectsFeatured';
import Skills from './components/Skills';
import { trpc } from '../../trpc/trpc';

export default function HomePage() {
  const projectsQuery = trpc.projects.list.useQuery(undefined, {
    staleTime: 60_000,
  });

  const projects = projectsQuery.data ?? [];
  const featured = projects.some((p) => p.featured)
    ? projects.filter((p) => p.featured)
    : projects.slice(0, 3);

  return (
    <>
      <Hero />
      <About />
      <Skills />
      {projectsQuery.isLoading ? (
        <section id="projects" className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-6">
                Featured Projects
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto mb-8"></div>
              <p className="text-xl text-slate-600 dark:text-slate-300">Loading projects…</p>
            </div>
          </div>
        </section>
      ) : projectsQuery.isError ? (
        <section id="projects" className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-6">
                Featured Projects
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto mb-8"></div>
              <p className="text-xl text-rose-600 dark:text-rose-300">
                Could not load projects from the API.
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {projectsQuery.error instanceof Error ? projectsQuery.error.message : 'Unknown error'}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <ProjectsFeatured data={featured} />
      )}
      <Contact />
    </>
  );
}
