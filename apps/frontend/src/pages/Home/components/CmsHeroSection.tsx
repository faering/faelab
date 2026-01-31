import CmsUi from '../../../components/CmsUi';

export type CmsHeroSectionProps = {
  onDirtyChange?: (dirty: boolean) => void;
};

export default function CmsHeroSection({}: CmsHeroSectionProps) {
  return (
    <CmsUi
      title="Hero"
      subtitle="Edit the hero section content."
      sections={[{ id: 'hero', label: 'Hero', shortLabel: 'H' }]}
      activeSectionId="hero"
      renderContent={() => (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-6 text-sm text-slate-600 dark:text-slate-300">
          Hero editor coming next.
        </div>
      )}
    />
  );
}
