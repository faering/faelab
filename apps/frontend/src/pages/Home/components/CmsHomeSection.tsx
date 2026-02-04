import CmsUi from '../../../components/CmsUi';

export type CmsHomeSectionProps = {
  onDirtyChange?: (dirty: boolean) => void;
};

const homeSections = [
  {
    id: 'hero',
    title: 'Hero',
    description: 'Hero editor coming next.',
  },
  {
    id: 'about',
    title: 'About',
    description: 'About editor coming next.',
  },
  {
    id: 'skills',
    title: 'Skills',
    description: 'Skills editor coming next.',
  },
  {
    id: 'featured',
    title: 'Featured Projects',
    description: 'Featured projects editor coming next.',
  },
  {
    id: 'contact',
    title: 'Contact',
    description: 'Contact editor coming next.',
  },
];

export default function CmsHomeSection({}: CmsHomeSectionProps) {
  return (
    <CmsUi
      title="Home"
      subtitle="Manage all content on the home page."
      sections={[{ id: 'home', label: 'Home', shortLabel: 'H' }]}
      activeSectionId="home"
      renderContent={() => (
        <div className="grid gap-4">
          {homeSections.map((section) => (
            <section
              key={section.id}
              className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-6"
              aria-label={`${section.title} section`}
            >
              <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {section.title}
              </div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {section.description}
              </div>
            </section>
          ))}
        </div>
      )}
    />
  );
}
