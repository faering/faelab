
import type { SiteProfile, SkillCategory, SkillItem, SkillTechnology } from '../../../../../../packages/types/siteContentSchema';

type SkillsProps = {
  profile?: SiteProfile | null;
  skillCategories: SkillCategory[];
  skillItems: SkillItem[];
  skillTechnologies: SkillTechnology[];
};

const Skills = ({ profile, skillCategories, skillItems, skillTechnologies }: SkillsProps) => {
  const itemsByCategory = skillItems.reduce<Record<string, SkillItem[]>>((acc, item) => {
    if (!acc[item.categoryId]) acc[item.categoryId] = [];
    acc[item.categoryId].push(item);
    return acc;
  }, {});

  return (
    <section id="skills" className="py-20 bg-purple-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-6">
              Skills & Expertise
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto mb-8"></div>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {profile?.skillsIntro || 'A comprehensive toolkit for building modern web applications'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {(skillCategories.length > 0 ? skillCategories : []).map((category) => (
              <div key={category.id} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center">
                  {category.title}
                </h3>
                <div className="space-y-3">
                  {(itemsByCategory[category.id] ?? []).map((skill) => (
                    <div key={skill.id}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-700 dark:text-slate-200 font-medium">{skill.label}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-sm">{skill.skillLevel}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-pink-400 to-purple-400 dark:from-purple-600 dark:to-pink-600 h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${skill.skillLevel}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                {category.description && (
                  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                    {category.description}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Always learning and exploring new technologies to stay ahead of the curve
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {(skillTechnologies.length > 0 ? skillTechnologies.map((tech) => tech.label) : ["Add", "Tech", "In", "CMS"]).map((tech) => (
                <span 
                  key={tech}
                  className="bg-gradient-to-r from-pink-300 to-purple-300 dark:from-purple-700 dark:to-pink-700 text-white px-6 py-3 rounded-full font-medium hover:from-pink-400 hover:to-purple-400 dark:hover:from-purple-600 dark:hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;