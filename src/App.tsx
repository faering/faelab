import Header from './components/Header';

import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import { projects } from './data/Projects';
import ProjectLayout from "./components/ProjectLayout";
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 dark:bg-gray-900 dark:text-white">
      <Header />
      <Hero />
      <About />
      <Skills />
      <ProjectLayout data={projects} />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;