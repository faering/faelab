import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import { projects } from './data/Projects';
import ProjectsFeatured from "./components/ProjectsFeatured";
import Contact from './components/Contact';
import Footer from './components/Footer';
import ProjectsPage from './pages/Projects/ProjectsPage';

const CMS_OPEN_KEY = 'projectsCmsOpen';
const CMS_RESET_ON_NEXT_OPEN_KEY = 'projectsCmsResetOnNextOpen';

function App() {
  const location = useLocation();

  useEffect(() => {
    // CMS is an in-page modal scoped to the Projects page.
    // If we navigate away, ensure it won't auto-reopen when we come back.
    if (location.pathname === '/projects') return;

    try {
      localStorage.setItem(CMS_OPEN_KEY, '0');
      localStorage.setItem(CMS_RESET_ON_NEXT_OPEN_KEY, '1');
    } catch {
      // ignore (storage unavailable)
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen text-slate-900 dark:text-white">
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <About />
              <Skills />
              <ProjectsFeatured data={projects} />
              <Contact />
            </>
          }
        />
        <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;