import { Heart } from 'lucide-react';
import { portfolioConfig } from '../config/portfolio';

const Footer = () => {
  return (
    <footer className="bg-purple-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-600 dark:text-slate-300 mb-4 md:mb-0">
              <p className="flex items-center">
                Made with <Heart className="w-4 h-4 mx-1 text-pink-400 dark:text-pink-200" fill="currentColor" /> 
                by {portfolioConfig.name}
              </p>
            </div>
            
            <div className="text-slate-600 dark:text-slate-300 text-sm">
              <p>&copy; {portfolioConfig.copyright.year} {portfolioConfig.name}. {portfolioConfig.copyright.statement}</p>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-purple-200 dark:border-slate-700 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Built with React, TypeScript, and Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;