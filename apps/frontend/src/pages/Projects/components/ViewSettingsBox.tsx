import React from 'react';
import { Funnel, LayoutGrid, List } from 'lucide-react';

interface ViewSettingsProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  children?: React.ReactNode;
  sortMode?: 'featured' | 'title';
  onSortModeChange?: (mode: 'featured' | 'title') => void;
}

const ViewSettings: React.FC<ViewSettingsProps> = ({
  viewMode,
  setViewMode,
  children,
  sortMode,
  onSortModeChange,
}) => {
  const [isSortMenuOpen, setIsSortMenuOpen] = React.useState(false);
  const sortMenuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!isSortMenuOpen) return;

    const onClickOutside = (e: MouseEvent) => {
      if (!sortMenuRef.current) return;
      if (!sortMenuRef.current.contains(e.target as Node)) {
        setIsSortMenuOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSortMenuOpen(false);
    };

    window.addEventListener('click', onClickOutside);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('click', onClickOutside);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isSortMenuOpen]);

  return (
    <>
      <div className="flex items-center justify-between px-6 py-3 mb-2 w-full rounded-t-xl bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center space-x-4">{children /* ProjectFilters will go here */}</div>

        <div className="flex items-center gap-3">
          {sortMode && onSortModeChange && (
            <div className="relative" ref={sortMenuRef}>
              <button
                type="button"
                className="flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSortMenuOpen((open) => !open);
                }}
                aria-label="Sort projects"
                title="Sort projects"
              >
                <Funnel size={20} />
              </button>

              {isSortMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 shadow-lg z-10">
                  <button
                    type="button"
                    className={`w-full text-left px-3 py-2 text-sm rounded-t-xl hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      sortMode === 'featured'
                        ? 'text-slate-900 dark:text-slate-100 font-semibold'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                    onClick={() => {
                      onSortModeChange('featured');
                      setIsSortMenuOpen(false);
                    }}
                  >
                    Featured first
                  </button>
                  <button
                    type="button"
                    className={`w-full text-left px-3 py-2 text-sm rounded-b-xl hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      sortMode === 'title'
                        ? 'text-slate-900 dark:text-slate-100 font-semibold'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                    onClick={() => {
                      onSortModeChange('title');
                      setIsSortMenuOpen(false);
                    }}
                  >
                    Title A–Z
                  </button>
                </div>
              )}
            </div>
          )}
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
        </div>
      </div>
    </>
  );
};

export default ViewSettings;