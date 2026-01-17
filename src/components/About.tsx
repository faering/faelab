import { Code, Palette, Zap } from 'lucide-react';

const About = () => {
  const highlights = [
    {
      icon: <Code className="w-8 h-8 text-pink-400" />,
      title: "Clean Code",
      description: "Writing maintainable, scalable code that stands the test of time"
    },
    {
      icon: <Palette className="w-8 h-8 text-purple-400" />,
      title: "Beautiful Design",
      description: "Creating pixel-perfect interfaces with attention to every detail"
    },
    {
      icon: <Zap className="w-8 h-8 text-cyan-400" />,
      title: "Performance",
      description: "Building fast, optimized applications that users love"
    }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              About Me
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto mb-8"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-slate-800 mb-6">
                Turning Ideas Into Reality
              </h3>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                With over 5 years of experience in web development, I specialize in creating 
                modern, responsive applications that solve real-world problems. My journey 
                started with a passion for technology and has evolved into a love for crafting 
                exceptional user experiences.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                I believe in the power of collaboration, continuous learning, and pushing 
                the boundaries of what's possible on the web. When I'm not coding, you'll 
                find me exploring new technologies, contributing to open source, or mentoring 
                fellow developers.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <span className="bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-semibold">
                  5+ Years Experience
                </span>
                <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                  50+ Projects
                </span>
                <span className="bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold">
                  Remote Friendly
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {highlights.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-4 p-6 bg-rose-50 rounded-xl hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-slate-800 mb-2">
                      {item.title}
                    </h4>
                    <p className="text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;