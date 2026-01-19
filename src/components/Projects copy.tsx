import { ExternalLink, Star } from 'lucide-react';
import GitHubIcon from '../../icons/GitHub Mark/SVG/GitHub_Invertocat_Black.svg';
import { portfolioConfig } from '../config/portfolio';


export const Projects = () => {
  const projects = [
    {
      title: "E-Commerce Platform",
      description: "A full-featured e-commerce solution with real-time inventory, payment processing, and admin dashboard. Built with modern technologies for scalability and performance.",
      image: "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800",
      technologies: ["React", "Node.js", "PostgreSQL", "Stripe"],
      githubUrl: "https://github.com",
      liveUrl: "https://example.com",
      
    },
    {
      title: "Task Management App",
      description: "Collaborative project management tool with real-time updates, team chat, and advanced analytics. Designed for remote teams and agile workflows.",
      image: "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800",
      technologies: ["Next.js", "TypeScript", "Supabase", "Tailwind"],
      githubUrl: "https://github.com",
      liveUrl: "https://example.com",
      featured: false
    },
    {
      title: "Weather Dashboard",
      description: "Beautiful weather application with location-based forecasts, interactive maps, and weather alerts. Features a responsive design and offline capabilities.",
      image: "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=800",
      technologies: ["React", "OpenWeather API", "Chart.js", "PWA"],
      githubUrl: "https://github.com",
      liveUrl: "https://example.com",
      featured: false
    },
    {
      title: "Social Media Analytics",
      description: "Comprehensive analytics platform for social media managers. Track engagement, analyze trends, and generate detailed reports across multiple platforms.",
      image: "https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=800",
      technologies: ["Vue.js", "Python", "FastAPI", "MongoDB"],
      githubUrl: "https://github.com",
      liveUrl: "https://example.com",
      featured: true
    },
    {
      title: "Learning Management System",
      description: "Educational platform with course creation tools, progress tracking, and interactive assessments. Supports video streaming and real-time collaboration.",
      image: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800",
      technologies: ["React", "Firebase", "Material-UI", "WebRTC"],
      githubUrl: "https://github.com",
      liveUrl: "https://example.com",
      featured: false
    },
    {
      title: "Cryptocurrency Tracker",
      description: "Real-time cryptocurrency tracking application with portfolio management, price alerts, and market analysis. Features a modern, intuitive interface.",
      image: "https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=800",
      technologies: ["React Native", "Redux", "CoinGecko API", "AsyncStorage"],
      githubUrl: "https://github.com",
      liveUrl: "https://example.com",
      featured: false
    }
  ];

  return (
    <section id="projects" className="py-20 bg-white">
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
              <div 
                key={index}
                className={`group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden ${
                  project.featured ? 'ring-2 ring-pink-300 ring-opacity-50' : ''
                }`}
              >
                <div className={`grid ${index % 2 === 0 ? 'lg:grid-cols-2' : 'lg:grid-cols-2'} gap-0`}>
                  <div className={`${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="relative h-64 lg:h-full overflow-hidden">
                      {project.featured && (
                        <div className="absolute top-4 left-4 z-10 flex items-center bg-pink-300 text-pink-800 px-3 py-1 rounded-full text-sm font-semibold">
                          <Star size={16} className="mr-1" />
                          Featured
                        </div>
                      )}
                      <img 
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
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
                      {project.technologies.map((tech, techIndex) => (
                        <span 
                          key={techIndex}
                          className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex space-x-4">
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center bg-pink-400 hover:bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 transform hover:scale-105"
                      >
                        <ExternalLink size={18} className="mr-2" />
                        Live Demo
                      </a>
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center border-2 border-purple-300 hover:border-purple-400 text-purple-600 hover:text-purple-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                      >
                        <img src={GitHubIcon} alt="GitHub" className="w-5 h-5 mr-2" />
                        Code
                      </a>
                    </div>
                  </div>
                </div>
              </div>
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
};

// export default Projects;