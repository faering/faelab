import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import Switcher from './Switcher';
import { Link, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { getApiBaseUrl } from '../trpc/apiBase';

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
  const [authMethod, setAuthMethod] = useState<'github' | 'local' | 'unknown'>('unknown');
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated' | 'error'>('checking');
  const authRequestIdRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const apiBaseUrl = getApiBaseUrl();

  const refreshAuth = () => {
    const requestId = ++authRequestIdRef.current;
    setAuthStatus('checking');

    Promise.all([
      fetch(`${apiBaseUrl}/auth/method`).then(async (res) => {
        if (!res.ok) throw new Error('Failed to get auth method');
        return (await res.json()) as { method?: 'github' | 'local' };
      }),
      fetch(`${apiBaseUrl}/auth/me`, { credentials: 'include' }).then(async (res) => {
        if (!res.ok) return { authenticated: false } as { authenticated: boolean };
        return (await res.json()) as { authenticated: boolean };
      }),
    ])
      .then(([methodResult, meResult]) => {
        if (authRequestIdRef.current !== requestId) return;
        setAuthMethod(methodResult.method ?? 'github');
        setAuthStatus(meResult.authenticated ? 'authenticated' : 'unauthenticated');
      })
      .catch(() => {
        if (authRequestIdRef.current !== requestId) return;
        setAuthStatus('error');
      });
  };

  useEffect(() => {
    refreshAuth();

    const onFocus = () => refreshAuth();
    const onAuthUpdated = () => refreshAuth();

    window.addEventListener('focus', onFocus);
    window.addEventListener('auth-updated', onAuthUpdated as EventListener);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('auth-updated', onAuthUpdated as EventListener);
    };
  }, [apiBaseUrl]);

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

  const openCms = () => {
    try {
      localStorage.setItem('projectsCmsOpen', '1');
      localStorage.setItem('projectsCmsResetOnNextOpen', '0');
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event('cms-open'));
    if (location.pathname !== '/projects') {
      navigate('/projects');
    }
  };

  const handleLogin = () => {
    if (authMethod === 'github') {
      window.location.href = `${apiBaseUrl}/auth/github/login`;
      return;
    }
    openCms();
  };

  const handleLogout = async () => {
    try {
      await fetch(`${apiBaseUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    }
    setAuthStatus('unauthenticated');
    window.dispatchEvent(new Event('auth-updated'));
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
            <div className="hidden md:flex flex-1 items-center justify-center">
              {/* Menu buttons */}
              <div className="flex items-center space-x-8">
              {(() => {
                // Dropdown open state for Projects menu
                const [dropdownOpen, setDropdownOpen] = useState(false);
                let dropdownTimeout: NodeJS.Timeout | null = null;

                return ['home', 'about', 'skills', 'projects', 'contact'].map((item) =>
                  item === 'projects' ? (
                    <div
                      key={item}
                      className="relative"
                      onMouseEnter={() => {
                        if (dropdownTimeout) clearTimeout(dropdownTimeout);
                        setDropdownOpen(true);
                      }}
                      onMouseLeave={() => {
                        dropdownTimeout = setTimeout(() => setDropdownOpen(false), 180);
                      }}
                    >
                      <Link
                        to={location.pathname === '/' ? `#${item}` : `/#${item}`}
                        onClick={e => {
                          e.preventDefault();
                          scrollToSection(item);
                        }}
                        className="transition-colors duration-200 capitalize font-medium py-2 px-2 cursor-pointer"
                        style={{ color: 'var(--tw-color-text)' }}
                      >
                        <span className="transition-colors duration-200 hover:text-purple-600 dark:hover:text-purple-300">Projects</span>
                      </Link>
                      {/* Dropdown menu */}
                      <div
                        className={`absolute left-0 top-full mt-2 min-w-[180px] bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg transition-opacity duration-200 z-50 ${dropdownOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                      >
                        <div className="flex flex-col py-2">
                          <Link
                            to={location.pathname === '/' ? '#projects' : '/#projects'}
                            onClick={e => {
                              e.preventDefault();
                              scrollToSection('projects');
                            }}
                            className="px-5 py-2 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-300 transition-colors duration-150 cursor-pointer"
                          >
                            Featured Projects
                          </Link>
                          <Link
                            to="/projects"
                            className="px-5 py-2 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-300 transition-colors duration-150 cursor-pointer"
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
                      className="transition-colors duration-200 capitalize font-medium py-2 px-2 cursor-pointer"
                      style={{ color: 'var(--tw-color-text)' }}
                    >
                      <span className="transition-colors duration-200 hover:text-purple-600 dark:hover:text-purple-300">{item.charAt(0).toUpperCase() + item.slice(1)}</span>
                    </Link>
                  )
                );
              })()}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Switcher />
              <div className="flex items-center gap-3">
                {authStatus === 'authenticated' && (
                  <button
                    type="button"
                    className="text-sm font-medium text-purple-700 dark:text-purple-300 hover:underline"
                    onClick={openCms}
                  >
                    Edit site
                  </button>
                )}
                <button
                  type="button"
                  className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:underline"
                  onClick={authStatus === 'authenticated' ? handleLogout : handleLogin}
                  disabled={authStatus === 'checking'}
                >
                  {authStatus === 'authenticated' ? 'Log out' : 'Login'}
                </button>
              </div>
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
              {authStatus === 'authenticated' && (
                <button
                  type="button"
                  className="transition-colors duration-200 font-medium py-2 px-6 text-left"
                  style={{ color: 'var(--tw-color-text)' }}
                  onClick={() => {
                    setIsMenuOpen(false);
                    openCms();
                  }}
                >
                  Edit site
                </button>
              )}
              <button
                type="button"
                className="transition-colors duration-200 font-medium py-2 px-6 text-left"
                style={{ color: 'var(--tw-color-text)' }}
                onClick={() => {
                  setIsMenuOpen(false);
                  if (authStatus === 'authenticated') {
                    handleLogout();
                  } else {
                    handleLogin();
                  }
                }}
                disabled={authStatus === 'checking'}
              >
                {authStatus === 'authenticated' ? 'Log out' : 'Login'}
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;