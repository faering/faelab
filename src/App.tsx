import Header from './components/Header';

import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import { projects } from './data/Projects';
import ProjectsFeatured from "./components/ProjectsFeatured";
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 dark:bg-gray-900 dark:text-white">
      <Header />
      <Hero />
      <About />
      <Skills />
      <ProjectsFeatured data={projects} />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;