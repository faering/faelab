import type { ComponentType } from 'react';
import * as Icons from 'lucide-react';
import type { AboutBadge, AboutHighlight, AboutParagraph, SiteProfile } from '../../../../../../packages/types/siteContentSchema';

type AboutProps = {
  profile?: SiteProfile | null;
  aboutParagraphs: AboutParagraph[];
  aboutBadges: AboutBadge[];
  aboutHighlights: AboutHighlight[];
};

const About = ({ profile, aboutParagraphs, aboutBadges, aboutHighlights }: AboutProps) => {
  const fallbackHighlights: AboutHighlight[] = profile?.aboutRightTitle || profile?.aboutRightDescription || profile?.aboutRightIcon
    ? [
        {
          id: 'legacy-highlight',
          ownerId: profile?.ownerId ?? 'legacy',
          profileId: profile?.id ?? 'legacy',
          position: 0,
          icon: profile?.aboutRightIcon ?? 'Star',
          title: profile?.aboutRightTitle ?? 'Your highlight title',
          description: profile?.aboutRightDescription ?? 'Add your highlight description in the CMS.',
          color: '#f472b6',
        },
      ]
    : [];

  const highlights = (aboutHighlights.length > 0 ? aboutHighlights : fallbackHighlights).slice(0, 3);
  const highlightColors = ['#f472b6', '#c084fc', '#22d3ee'];

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
                {profile?.aboutLeftHeadline || 'Turning Ideas Into Reality'}
              </h3>
              {(aboutParagraphs.length > 0 ? aboutParagraphs : [{ id: 'fallback-1', body: '' }]).map((paragraph, index) => (
                <p
                  key={paragraph.id}
                  className={`text-lg leading-relaxed ${index === 0 ? 'mb-6' : 'mb-8'}`}
                  style={{ color: 'var(--tw-color-text-muted)' }}
                >
                  {paragraph.body || 'Add your About paragraph in the CMS.'}
                </p>
              ))}
              <div className="flex flex-wrap gap-4">
                {(aboutBadges.length > 0 ? aboutBadges : [{ id: 'fallback', label: 'Add badges in CMS', color: '#64748b' }]).map((badge) => (
                  <span
                    key={badge.id}
                    className="px-4 py-2 rounded-full text-sm font-semibold"
                    style={{ backgroundColor: 'var(--tw-color-pink-100)', color: badge.color ?? 'var(--tw-color-pink-700)' }}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {(highlights.length > 0 ? highlights : [
                {
                  id: 'highlight-1',
                  icon: 'Star',
                  title: 'Add a highlight',
                  description: 'Use the CMS to add highlight cards.',
                  color: '#f472b6',
                } as AboutHighlight,
              ]).map((highlight, index) => {
                const Icon = highlight.icon
                  ? (Icons as Record<string, ComponentType<{ className?: string }>>)[highlight.icon]
                  : undefined;
                const accent = highlight.color ?? highlightColors[index % highlightColors.length];

                return (
                  <div
                    key={highlight.id}
                    className="flex items-start space-x-4 p-6 rounded-xl hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                    style={{ backgroundColor: 'var(--tw-color-rose-50)' }}
                  >
                    <div className="flex-shrink-0">
                      {Icon ? (
                        <Icon className="w-8 h-8" style={{ color: accent }} />
                      ) : (
                        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: accent }} />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2" style={{ color: 'var(--tw-color-text)' }}>
                        {highlight.title}
                      </h4>
                      <p className="leading-relaxed" style={{ color: 'var(--tw-color-text-muted)' }}>
                        {highlight.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;