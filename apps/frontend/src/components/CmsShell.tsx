import React from 'react';
import CmsUi from './CmsUi';
import { useCmsHomeEditor } from '../pages/Home/components/CmsHomeSection';
import { useCmsProjectsEditor } from '../pages/Projects/components/CmsProjectsSection';
import { useCmsVideosEditor } from '../pages/Videos/components/CmsVideosSection';

export type CmsShellProps = {
  onDirtyChange?: (dirty: boolean) => void;
};

export default function CmsShell({ onDirtyChange }: CmsShellProps) {
  const [activeSectionId, setActiveSectionId] = React.useState<'home' | 'projects' | 'videos'>('home');
  const homeEditor = useCmsHomeEditor({});
  const projectsEditor = useCmsProjectsEditor({});
  const videosEditor = useCmsVideosEditor({});

  React.useEffect(() => {
    onDirtyChange?.(homeEditor.isDirty || projectsEditor.isDirty || videosEditor.isDirty);
  }, [homeEditor.isDirty, onDirtyChange, projectsEditor.isDirty, videosEditor.isDirty]);

  const getTitle = () => {
    if (activeSectionId === 'home') return 'Home';
    if (activeSectionId === 'projects') return 'Projects';
    return 'Videos';
  };

  const getSubtitle = () => {
    if (activeSectionId === 'home') return 'Manage all content on the home page.';
    if (activeSectionId === 'projects') return 'Create and edit portfolio projects.';
    return 'Create and edit portfolio videos.';
  };

  const getActiveEditor = () => {
    if (activeSectionId === 'home') return homeEditor;
    if (activeSectionId === 'projects') return projectsEditor;
    return videosEditor;
  };

  const activeEditor = getActiveEditor();

  return (
    <CmsUi
      title={getTitle()}
      subtitle={getSubtitle()}
      sections={[
        { id: 'home', label: 'Home', shortLabel: 'H' },
        { id: 'projects', label: 'Projects', shortLabel: 'P' },
        { id: 'videos', label: 'Videos', shortLabel: 'V' },
      ]}
      activeSectionId={activeSectionId}
      onSectionChange={(id) => setActiveSectionId(id as 'home' | 'projects' | 'videos')}
      statusBadge={activeEditor.statusBadge}
      toolbar={activeEditor.toolbar}
      search={activeSectionId !== 'home' ? activeEditor.search : undefined}
      renderContent={() => activeEditor.content}
    />
  );
}