import React from 'react';
import { LayoutGrid, List, Plus, X } from 'lucide-react';

const CMS_OPEN_KEY = 'projectsCmsOpen';

interface ViewSettingsProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  children?: React.ReactNode;
  cmsTitle?: string;
  cmsContent?: React.ReactNode;
}

const ViewSettings: React.FC<ViewSettingsProps> = ({
  viewMode,
  setViewMode,
  children,
  cmsTitle,
  cmsContent,
}) => {
  const [isCmsOpen, setIsCmsOpen] = React.useState(() => {
    try {
      return localStorage.getItem(CMS_OPEN_KEY) === '1';
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(CMS_OPEN_KEY, isCmsOpen ? '1' : '0');
    } catch {
      // ignore (storage unavailable)
    }
  }, [isCmsOpen]);

  React.useEffect(() => {
    if (!isCmsOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCmsOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCmsOpen]);

  React.useEffect(() => {
    if (!isCmsOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCmsOpen]);

  return (
    <>
      <div className="flex items-center justify-between px-6 py-3 mb-2 w-full rounded-t-xl bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center space-x-4">{children /* ProjectFilters will go here */}</div>

        <div className="flex items-center gap-3">
          <div className="flex">
            <button
              className={`flex items-center justify-center w-12 h-12 rounded-l-xl rounded-r-none border border-slate-200 dark:border-slate-700 transition-colors duration-150
                ${viewMode === 'grid' ? 'bg-primary text-white dark:bg-slate-900' : 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-200'}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <LayoutGrid
                size={28}
                className={
                  viewMode === 'grid'
                    ? 'text-white dark:text-gray-500'
                    : 'text-gray-400 dark:text-gray-300'
                }
              />
            </button>
            <button
              className={`flex items-center justify-center w-12 h-12 rounded-r-xl rounded-l-none border border-slate-200 dark:border-slate-700 transition-colors duration-150
                ${viewMode === 'list' ? 'bg-primary text-white dark:bg-slate-900' : 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-200'}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <List
                size={28}
                className={
                  viewMode === 'list'
                    ? 'text-white dark:text-gray-500'
                    : 'text-gray-400 dark:text-gray-300'
                }
              />
            </button>
          </div>

          <button
            type="button"
            className="flex items-center justify-center w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-150"
            onClick={() => setIsCmsOpen(true)}
            aria-label="Open CMS"
          >
            <Plus size={28} className="text-gray-400 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {isCmsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="CMS"
        >
          <button
            className="absolute inset-0 bg-black/40"
            aria-label="Close CMS"
            onClick={() => setIsCmsOpen(false)}
            type="button"
          />

          <div className="relative w-full max-w-5xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="font-semibold text-slate-900 dark:text-slate-100">{cmsTitle ?? 'CMS'}</div>
              <button
                type="button"
                className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setIsCmsOpen(false)}
                aria-label="Close"
              >
                <X size={22} className="text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            <div className="p-5 text-slate-700 dark:text-slate-200">
              {cmsContent ?? (
                <p className="text-sm">CMS UI MVP will live here next (Projects CRUD via tRPC).</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewSettings;