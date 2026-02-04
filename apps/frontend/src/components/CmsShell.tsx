import React from 'react';
import CmsUi from './CmsUi';
import { useCmsHomeEditor } from '../pages/Home/components/CmsHomeSection';
import { useCmsProjectsEditor } from '../pages/Projects/components/CmsProjectsSection';

export type CmsShellProps = {
  onDirtyChange?: (dirty: boolean) => void;
};

export default function CmsShell({ onDirtyChange }: CmsShellProps) {
  const [activeSectionId, setActiveSectionId] = React.useState<'home' | 'projects'>('home');
  const homeEditor = useCmsHomeEditor({});
  const projectsEditor = useCmsProjectsEditor({});

  React.useEffect(() => {
    onDirtyChange?.(homeEditor.isDirty || projectsEditor.isDirty);
  }, [homeEditor.isDirty, onDirtyChange, projectsEditor.isDirty]);

  const isHome = activeSectionId === 'home';

  return (
    <CmsUi
      title={isHome ? 'Home' : 'Projects'}
      subtitle={
        isHome
          ? 'Manage all content on the home page.'
          : 'Create and edit portfolio projects.'
      }
      sections={[
        { id: 'home', label: 'Home', shortLabel: 'H' },
        { id: 'projects', label: 'Projects', shortLabel: 'P' },
      ]}
      activeSectionId={activeSectionId}
      onSectionChange={(id) => setActiveSectionId(id as 'home' | 'projects')}
      statusBadge={isHome ? homeEditor.statusBadge : projectsEditor.statusBadge}
      toolbar={isHome ? homeEditor.toolbar : projectsEditor.toolbar}
      search={!isHome ? projectsEditor.search : undefined}
      renderContent={() => (isHome ? homeEditor.content : projectsEditor.content)}
    />
  );
}