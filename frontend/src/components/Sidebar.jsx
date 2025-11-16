import React from 'react';

const Sidebar = ({ onAddNote, darkMode }) => {
  return (
    <aside className={`w-64 shadow-md border-r transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-[#F7CAC9]'
    }`}>
      <div className="p-6">
        <h2 className={`text-lg font-semibold mb-6 ${
          darkMode ? 'text-white' : 'text-[#2D2D2D]'
        }`}>
          Quick Actions
        </h2>
        
        <div className="space-y-3">
          <button 
            onClick={onAddNote}
            className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors duration-200 font-medium shadow-sm ${
              darkMode
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-[#DC143C] hover:bg-[#B91C3C] text-white'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Note
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;