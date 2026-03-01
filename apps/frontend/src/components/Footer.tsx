import { Heart } from 'lucide-react';
import { portfolioConfig } from '../config/portfolio';

const Footer = () => {
  return (
    <footer className="py-8 bg-purple-100 dark:bg-dark-bg">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 text-text-muted dark:text-dark-muted">
              <p className="flex items-center">
                Made with <Heart className="w-4 h-4 mx-1 text-pink-400 dark:text-dark-accent" fill="currentColor" /> 
                by {portfolioConfig.name}
              </p>
            </div>
            
            <div className="text-sm text-text-muted dark:text-dark-muted">
              <p>&copy; {portfolioConfig.copyright.year} {portfolioConfig.name}. {portfolioConfig.copyright.statement}</p>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-secondary dark:border-dark-accent text-center">
            <p className="text-sm text-text-muted dark:text-dark-muted">
              Built with React, TypeScript, and Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;