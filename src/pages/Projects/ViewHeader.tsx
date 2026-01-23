import React from 'react';

interface ViewHeaderProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  children?: React.ReactNode;
}

const ViewHeader: React.FC<ViewHeaderProps> = ({ viewMode, setViewMode, children }) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 mb-8 w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900 shadow-sm">
      <div className="flex items-center space-x-4">{children /* ProjectFilters will go here */}</div>
      <div className="flex space-x-2">
        <button
          className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          onClick={() => setViewMode('grid')}
          aria-label="Grid view"
        >
          <span className="material-icons">grid_view</span>
        </button>
        <button
          className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          onClick={() => setViewMode('list')}
          aria-label="List view"
        >
          <span className="material-icons">view_list</span>
        </button>
      </div>
    </div>
  );
};

export default ViewHeader;