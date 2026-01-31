import React, { useState, useRef, useEffect } from 'react';
import { Tag, Hammer } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface ProjectFilterDropdownProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const ProjectFilterDropdown: React.FC<ProjectFilterDropdownProps> = ({ label, options, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setOpen((prev) => !prev);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);
  const handleOptionChange = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  // Choose icon based on label
  const Icon = label === "Tags" ? Tag : Hammer;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 dark:border-gray-700 shadow-sm px-4 py-2 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none"
        onClick={handleToggle}
      >
        <Icon className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" aria-hidden="true" />
        <span className="mr-2">{label}</span>
      </button>
      {open && (
        <div className="origin-top-left absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <label key={option.value} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => handleOptionChange(option.value)}
                  className="mr-2"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFilterDropdown;
