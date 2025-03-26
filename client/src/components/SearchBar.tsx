import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  showButtons?: boolean;
  compact?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  onKeyDown,
  showButtons = false,
  compact = false
}: SearchBarProps) {
  return (
    <div className="search-container">
      <div className="relative">
        <div className={`flex items-center border rounded-full ${compact ? 'shadow p-2 pr-4' : 'shadow-md hover:shadow-lg p-4'} transition-shadow`}>
          <span className="material-icons text-gray-400 mx-2">search</span>
          <input 
            type="text" 
            className="flex-grow focus:outline-none text-base" 
            placeholder="खोज करें..."
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
          />
          <span className="material-icons text-google-blue cursor-pointer">mic</span>
        </div>
      </div>
      
      {showButtons && (
        <div className="mt-6 flex justify-center space-x-3">
          <button 
            className="bg-google-gray hover:bg-gray-200 text-gray-700 py-2 px-4 rounded"
            onClick={onSearch}
          >
            खोज करें
          </button>
          <button 
            className="bg-google-gray hover:bg-gray-200 text-gray-700 py-2 px-4 rounded"
          >
            आज का दिन
          </button>
        </div>
      )}
    </div>
  );
}
