import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface ViewSettingsProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  children?: React.ReactNode;
}

const ViewSettings: React.FC<ViewSettingsProps> = ({ viewMode, setViewMode, children }) => {
  return (
    <div className="flex items-center justify-between px-6 py-3 mb-2 w-full rounded-t-xl bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center space-x-4">{children /* ProjectFilters will go here */}</div>
      <div className="flex space-x-0">
        <button
          className={`flex items-center justify-center w-12 h-12 rounded-l-xl rounded-r-none transition-colors duration-150
            ${viewMode === 'grid' ? 'bg-primary text-white shadow-md' : 'bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-200'}`}
          onClick={() => setViewMode('grid')}
          aria-label="Grid view"
        >
          <LayoutGrid size={28} className={viewMode === 'grid' ? 'text-white' : 'text-gray-400 dark:text-gray-500'} />
        </button>
        <button
          className={`flex items-center justify-center w-12 h-12 rounded-r-xl rounded-l-none transition-colors duration-150
            ${viewMode === 'list' ? 'bg-primary text-white shadow-md' : 'bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-200'}`}
          onClick={() => setViewMode('list')}
          aria-label="List view"
        >
          <List size={28} className={viewMode === 'list' ? 'text-white' : 'text-gray-400 dark:text-gray-500'} />
        </button>
      </div>
    </div>
  );
};

export default ViewSettings;