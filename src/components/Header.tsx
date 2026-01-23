import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Switcher from './Switcher';
import { Link, useLocation, useNavigate, NavLink } from 'react-router-dom';
import Logo from '../icons/in-logo/Logo';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/#about' },
  { label: 'Skills', to: '/#skills' },
  { label: 'Projects', to: '/#projects' },
  { label: 'Contact', to: '/#contact' },
];

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

  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    // If already on landing page, just scroll
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setIsMenuOpen(false);
    } else {
      // If not on landing page, navigate to landing page and scroll after navigation
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      setIsMenuOpen(false);
    }
  };

  return (
    // <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
    //   isScrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    // }`}>
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`} style={{ backgroundColor: isScrolled ? 'var(--tw-color-primary)' : 'transparent' }}>
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
            {/*<div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-purple-400 dark:to-pink-400"> */}
            <Link
              to="/"
              className="text-2xl font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to right, var(--tw-color-pink-500), var(--tw-color-purple-500))' }}
            >
              Portfolio
            </Link>

            {/* Desktop Navigation with Switcher */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Switcher aligned with buttons */}
              <Switcher />
              {/* Menu buttons */}
              {['home', 'about', 'skills', 'projects', 'contact'].map((item) =>
                item === 'projects' ? (
                  <div key={item} className="relative group">
                    <Link
                      to={location.pathname === '/' ? `#${item}` : `/#${item}`}
                      onClick={e => {
                        e.preventDefault();
                        scrollToSection(item);
                      }}
                      className="transition-colors duration-200 capitalize font-medium py-2 px-2 cursor-pointer"
                      style={{ color: 'var(--tw-color-text)' }}
                    >
                      Projects
                    </Link>
                    {/* Dropdown menu */}
                    <div className="absolute left-0 top-full mt-2 min-w-[180px] bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none transition-opacity duration-200 z-50">
                      <div className="flex flex-col py-2">
                        <Link
                          to={location.pathname === '/' ? '#projects' : '/#projects'}
                          onClick={e => {
                            e.preventDefault();
                            scrollToSection('projects');
                          }}
                          className="px-5 py-2 text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-800 rounded-xl transition-colors duration-150 cursor-pointer"
                        >
                          Featured Projects
                        </Link>
                        <Link
                          to="/projects"
                          className="px-5 py-2 text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-800 rounded-xl transition-colors duration-150 cursor-pointer"
                        >
                          All Projects
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item}
                    to={location.pathname === '/' ? `#${item}` : `/#${item}`}
                    onClick={e => {
                      e.preventDefault();
                      scrollToSection(item);
                    }}
                    className="transition-colors duration-200 capitalize font-medium py-2"
                    style={{ color: 'var(--tw-color-text)' }}
                  >
                    {item}
                  </Link>
                )
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              // className="md:hidden text-slate-700 dark:text-slate-200 hover:text-pink-500 transition-colors duration-200"
              className="md:hidden transition-colors duration-200"
              style={{ color: 'var(--tw-color-text)' }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full backdrop-blur-md shadow-lg" style={{ backgroundColor: 'var(--tw-color-primary)' }}>
            <div className="flex flex-col py-4">
              {['home', 'about', 'skills', 'projects', 'contact'].map((item) => (
                <Link
                  key={item}
                  to={location.pathname === '/' ? `#${item}` : `/#${item}`}
                  onClick={e => {
                    e.preventDefault();
                    scrollToSection(item);
                  }}
                  className="transition-colors duration-200 capitalize font-medium py-2 px-6 text-left"
                  style={{ color: 'var(--tw-color-text)' }}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;