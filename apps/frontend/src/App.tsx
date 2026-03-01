import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/Home/HomePage';
import ProjectsPage from './pages/Projects/ProjectsPage';
import VideosPage from './pages/Videos/VideosPage';
import CmsHost from './components/CmsHost';

function App() {
  return (
    <div className="min-h-screen text-slate-900 dark:text-white">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/videos" element={<VideosPage />} />
      </Routes>
      <Footer />
      <CmsHost />
    </div>
  );
}

export default App;