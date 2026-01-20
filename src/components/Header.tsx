import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Switcher from './Switcher'; // If you rename Switcher.js to Switcher.jsx, this import remains valid

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-purple-400 dark:to-pink-400">
              Portfolio
            </div>

            {/* Desktop Navigation with Switcher */}
            <div className="hidden md:flex items-center space-x-8">
              {['home', 'about', 'skills', 'projects', 'contact'].map((item, idx, arr) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="text-slate-700 dark:text-slate-200 hover:text-pink-500 transition-colors duration-200 capitalize font-medium py-2"
                >
                  {item}
                </button>
              ))}
              {/* Switcher aligned with buttons */}
              <div className="flex items-center py-2">
                <Switcher />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-slate-700 dark:text-slate-200 hover:text-pink-500 transition-colors duration-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg">
            <div className="flex flex-col py-4">
              {['home', 'about', 'skills', 'projects', 'contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="text-slate-700 dark:text-slate-200 hover:text-pink-500 transition-colors duration-200 capitalize font-medium py-2 px-6 text-left"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;