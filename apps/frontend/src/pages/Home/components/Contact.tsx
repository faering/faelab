import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import GitHubIconBlack from '../../../../icons/GitHub Mark/SVG/GitHub_Invertocat_Black.svg';
import GitHubIconWhite from '../../../../icons/GitHub Mark/SVG/GitHub_Invertocat_White.svg';
import LinkedInIconBlack from '../../../../icons/in-logo/InBug-Black.png';
import LinkedInIconWhite from '../../../../icons/in-logo/InBug-White.png';
import { portfolioConfig } from '../../../config/portfolio';
import type { SiteProfile } from '../../../../../../packages/types/siteContentSchema';

type ContactProps = {
  profile?: SiteProfile | null;
};

const Contact = ({ profile }: ContactProps) => {
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
    <section id="contact" className="py-20 bg-gradient-to-br from-purple-200 to-pink-200 dark:bg-gray-900 dark:bg-none">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-6">
              {profile?.contactTitle || "Let's Work Together"}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto mb-8"></div>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {profile?.contactSubtitle || "Ready to bring your ideas to life? Let's discuss your next project."}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-8">Get In Touch</h3>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-center space-x-4">
                  <div className="bg-pink-400 dark:bg-pink-900 p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-slate-800 dark:text-white font-semibold">Email</h4>
                    <p className="text-slate-600 dark:text-slate-300">{profile?.contactEmail || portfolioConfig.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-400 dark:bg-purple-900 p-3 rounded-lg">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-slate-800 dark:text-white font-semibold">Phone</h4>
                    <p className="text-slate-600 dark:text-slate-300">{profile?.contactPhone || portfolioConfig.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-cyan-400 dark:bg-cyan-900 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-slate-800 dark:text-white font-semibold">Location</h4>
                    <p className="text-slate-600 dark:text-slate-300">{profile?.contactLocation || portfolioConfig.location}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-slate-800 dark:text-white font-semibold mb-4">Follow Me</h4>
                <div className="flex space-x-4">
                  <a 
                    href={portfolioConfig.social.github}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white/70 dark:bg-gray-800 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors duration-200 transform hover:scale-110"
                  >
                    {/* Black icon for light mode */}
                    <img src={GitHubIconBlack} alt="GitHub" className="w-6 h-6 block dark:hidden" />
                    {/* White icon for dark mode */}
                    <img src={GitHubIconWhite} alt="GitHub" className="w-6 h-6 hidden dark:block" />
                  </a>
                  <a 
                    href={portfolioConfig.social.linkedin}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white/70 dark:bg-gray-800 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors duration-200 transform hover:scale-110"
                  >
                    {/* Black icon for light mode */}
                    <img src={LinkedInIconBlack} alt="LinkedIn" className="w-6.5 h-6 block dark:hidden" />
                    {/* White icon for dark mode */}
                    <img src={LinkedInIconWhite} alt="LinkedIn" className="w-6.5 h-6 hidden dark:block" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/10 dark:bg-gray-800/80 backdrop-blur-md p-8 rounded-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-slate-800 dark:text-white font-medium mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/70 dark:bg-gray-900 border border-purple-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-pink-400 dark:focus:border-purple-400 transition-colors duration-200"
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-slate-800 dark:text-white font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/70 dark:bg-gray-900 border border-purple-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-pink-400 dark:focus:border-purple-400 transition-colors duration-200"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-slate-800 dark:text-white font-medium mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/70 dark:bg-gray-900 border border-purple-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-pink-400 dark:focus:border-purple-400 transition-colors duration-200"
                    placeholder="Project Discussion"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-slate-800 dark:text-white font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-white/70 dark:bg-gray-900 border border-purple-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-pink-400 dark:focus:border-purple-400 transition-colors duration-200 resize-none"
                    placeholder="Tell me about your project..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-400 to-purple-400 dark:from-purple-700 dark:to-pink-700 hover:from-pink-500 hover:to-purple-500 dark:hover:from-purple-600 dark:hover:to-pink-600 text-white font-semibold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
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