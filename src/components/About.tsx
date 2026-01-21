import { Code, Palette, Zap } from 'lucide-react';

const About = () => {
  const highlights = [
    {
      icon: <Code className="w-8 h-8" style={{ color: 'var(--tw-color-pink-400)' }} />,
      title: "Clean Code",
      description: "Writing maintainable, scalable code that stands the test of time",
    },
    {
      icon: <Palette className="w-8 h-8" style={{ color: 'var(--tw-color-purple-400)' }} />,
      title: "Beautiful Design",
      description: "Creating pixel-perfect interfaces with attention to every detail",
    },
    {
      icon: <Zap className="w-8 h-8" style={{ color: 'var(--tw-color-cyan-400)' }} />,
      title: "Performance",
      description: "Building fast, optimized applications that users love",
    }
  ];

  return (
    <section id="about" className="py-20" style={{ backgroundColor: 'var(--tw-color-primary)' }}>
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--tw-color-text)' }}>
              About Me
            </h2>
            <div className="w-24 h-1 mx-auto mb-8" style={{ background: 'linear-gradient(90deg, var(--tw-color-pink-400), var(--tw-color-purple-400))' }}></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6" style={{ color: 'var(--tw-color-text)' }}>
                Turning Ideas Into Reality
              </h3>
              <p className="text-lg mb-6 leading-relaxed" style={{ color: 'var(--tw-color-text-muted)' }}>
                With over 5 years of experience in web development, I specialize in creating 
                modern, responsive applications that solve real-world problems. My journey 
                started with a passion for technology and has evolved into a love for crafting 
                exceptional user experiences.
              </p>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--tw-color-text-muted)' }}>
                I believe in the power of collaboration, continuous learning, and pushing 
                the boundaries of what's possible on the web. When I'm not coding, you'll 
                find me exploring new technologies, contributing to open source, or mentoring 
                fellow developers.
              </p>
              <div className="flex flex-wrap gap-4">
                <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: 'var(--tw-color-pink-100)', color: 'var(--tw-color-pink-700)' }}>
                  5+ Years Experience
                </span>
                <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: 'var(--tw-color-purple-100)', color: 'var(--tw-color-purple-700)' }}>
                  50+ Projects
                </span>
                <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: 'var(--tw-color-cyan-100)', color: 'var(--tw-color-cyan-700)' }}>
                  Remote Friendly
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {highlights.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-4 p-6 rounded-xl hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                  style={{ backgroundColor: 'var(--tw-color-rose-50)' }}
                >
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2" style={{ color: 'var(--tw-color-text)' }}>
                      {item.title}
                    </h4>
                    <p className="leading-relaxed" style={{ color: 'var(--tw-color-text-muted)' }}>
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