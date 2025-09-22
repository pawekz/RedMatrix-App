import React from 'react';

const Sidebar = ({ onAddNote, onViewAllNotes }) => {
  return (
    <aside className="w-64 bg-white shadow-md border-r border-[#F7CAC9]">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-[#2D2D2D] mb-6">
          Quick Actions
        </h2>
        
        <div className="space-y-3">
          <button 
            onClick={onAddNote}
            className="w-full flex items-center justify-center px-4 py-3 bg-[#DC143C] text-white rounded-lg hover:bg-[#B91C3C] transition-colors duration-200 font-medium shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Note
          </button>
          
          <button 
            onClick={onViewAllNotes}
            className="w-full flex items-center justify-center px-4 py-3 bg-[#F75270] text-white rounded-lg hover:bg-[#E63946] transition-colors duration-200 font-medium shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View All Notes
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;