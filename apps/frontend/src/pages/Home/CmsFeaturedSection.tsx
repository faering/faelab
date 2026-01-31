import CmsUi from '../../components/CmsUi';

export type CmsFeaturedSectionProps = {
  onDirtyChange?: (dirty: boolean) => void;
};

export default function CmsFeaturedSection({}: CmsFeaturedSectionProps) {
  return (
    <CmsUi
      title="Featured Projects"
      subtitle="Edit featured project highlights."
      sections={[{ id: 'featured', label: 'Featured', shortLabel: 'F' }]}
      activeSectionId="featured"
      renderContent={() => (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-6 text-sm text-slate-600 dark:text-slate-300">
          Featured projects editor coming next.
        </div>
      )}
    />
  );
}
