import CmsUi from '../../components/CmsUi';

export type CmsSkillsSectionProps = {
  onDirtyChange?: (dirty: boolean) => void;
};

export default function CmsSkillsSection({}: CmsSkillsSectionProps) {
  return (
    <CmsUi
      title="Skills"
      subtitle="Edit skill categories and technologies."
      sections={[{ id: 'skills', label: 'Skills', shortLabel: 'S' }]}
      activeSectionId="skills"
      renderContent={() => (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-6 text-sm text-slate-600 dark:text-slate-300">
          Skills editor coming next.
        </div>
      )}
    />
  );
}
