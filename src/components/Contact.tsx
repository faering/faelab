import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import GitHubIcon from '../../icons/GitHub Mark/SVG/GitHub_Invertocat_Black.svg';
import LinkedInIcon from '../../icons/in-logo/LI-In-Bug.png';
import { portfolioConfig } from '../config/portfolio';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-purple-200 to-pink-200">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Let's Work Together
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto mb-8"></div>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Ready to bring your ideas to life? Let's discuss your next project.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-8">Get In Touch</h3>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-center space-x-4">
                  <div className="bg-pink-400 p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-slate-800 font-semibold">Email</h4>
                    <p className="text-slate-600">{portfolioConfig.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-400 p-3 rounded-lg">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-slate-800 font-semibold">Phone</h4>
                    <p className="text-slate-600">{portfolioConfig.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-cyan-400 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-slate-800 font-semibold">Location</h4>
                    <p className="text-slate-600">{portfolioConfig.location}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-slate-800 font-semibold mb-4">Follow Me</h4>
                <div className="flex space-x-4">
                  <a 
                    href={portfolioConfig.social.github}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white/70 p-3 rounded-lg hover:bg-white transition-colors duration-200 transform hover:scale-110"
                  >
                    <img src={GitHubIcon} alt="GitHub" className="w-6 h-6" />
                  </a>
                  <a 
                    href={portfolioConfig.social.linkedin}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white/70 p-3 rounded-lg hover:bg-white transition-colors duration-200 transform hover:scale-110"
                  >
                    <img src={LinkedInIcon} alt="LinkedIn" className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-slate-800 font-medium mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/70 border border-purple-200 rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:border-pink-400 transition-colors duration-200"
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-slate-800 font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/70 border border-purple-200 rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:border-pink-400 transition-colors duration-200"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-slate-800 font-medium mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/70 border border-purple-200 rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:border-pink-400 transition-colors duration-200"
                    placeholder="Project Discussion"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-slate-800 font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-white/70 border border-purple-200 rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:border-pink-400 transition-colors duration-200 resize-none"
                    placeholder="Tell me about your project..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-semibold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;