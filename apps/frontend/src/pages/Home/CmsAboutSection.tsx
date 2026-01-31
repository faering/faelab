import CmsUi from '../../components/CmsUi';

export type CmsAboutSectionProps = {
  onDirtyChange?: (dirty: boolean) => void;
};

export default function CmsAboutSection({}: CmsAboutSectionProps) {
  return (
    <CmsUi
      title="About"
      subtitle="Edit the about section content."
      sections={[{ id: 'about', label: 'About', shortLabel: 'A' }]}
      activeSectionId="about"
      renderContent={() => (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-6 text-sm text-slate-600 dark:text-slate-300">
          About editor coming next.
        </div>
      )}
    />
  );
}
