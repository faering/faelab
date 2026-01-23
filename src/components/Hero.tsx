import { ArrowDown, Mail } from 'lucide-react';
import GitHubIconBlack from '../../icons/GitHub Mark/SVG/GitHub_Invertocat_Black.svg';
import GitHubIconWhite from '../../icons/GitHub Mark/SVG/GitHub_Invertocat_White.svg';
import LinkedInIconBlack from '../../icons/in-logo/InBug-Black.png';
import LinkedInIconWhite from '../../icons/in-logo/InBug-White.png';
import { portfolioConfig } from '../config/portfolio';

const Hero = () => {
  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-200 via-purple-200 to-indigo-200 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22m36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="container mx-auto px-6 text-center text-slate-800 dark:text-white relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Hi, I'm{' '}
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 dark:from-purple-700 dark:to-pink-700 bg-clip-text text-transparent">
              {portfolioConfig.name}
            </span>
          </h1>
          
          <h2 className="text-2xl md:text-3xl text-purple-600 dark:text-purple-300 font-light mb-8">
            {portfolioConfig.title}
          </h2>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            {portfolioConfig.bio}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <button 
              onClick={scrollToAbout}
              className="bg-gradient-to-r from-pink-300 to-purple-300 dark:from-purple-700 dark:to-pink-700 hover:from-pink-400 hover:to-purple-400 dark:hover:from-purple-600 dark:hover:to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              View My Work
            </button>
            
            <div className="flex space-x-6">
              <a 
                href={portfolioConfig.social.github}
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-colors duration-200 transform hover:scale-110">
                <img src={GitHubIconBlack} alt="GitHub" className="w-8 h-8 block dark:hidden" />
                <img src={GitHubIconWhite} alt="GitHub" className="w-8 h-8 hidden dark:block" />
              </a>
              <a 
                href={portfolioConfig.social.linkedin}
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-colors duration-200 transform hover:scale-110">
                <img src={LinkedInIconBlack} alt="LinkedIn" className="w-9 h-8 block dark:hidden" />
                <img src={LinkedInIconWhite} alt="LinkedIn" className="w-9 h-8 hidden dark:block" />
              </a>
              {/* <a 
                href={`mailto:${portfolioConfig.email}`}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors duration-200 transform hover:scale-110"
              >
                <Mail size={32} />
              </a> */}
            </div>
          </div>
          
          <button 
            onClick={scrollToAbout}
            className="animate-bounce text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors duration-200"
          >
            <ArrowDown size={32} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;