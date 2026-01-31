import CmsUi from '../../components/CmsUi';

export type CmsContactSectionProps = {
  onDirtyChange?: (dirty: boolean) => void;
};

export default function CmsContactSection({}: CmsContactSectionProps) {
  return (
    <CmsUi
      title="Contact"
      subtitle="Edit contact details and call to action."
      sections={[{ id: 'contact', label: 'Contact', shortLabel: 'C' }]}
      activeSectionId="contact"
      renderContent={() => (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-6 text-sm text-slate-600 dark:text-slate-300">
          Contact editor coming next.
        </div>
      )}
    />
  );
}
