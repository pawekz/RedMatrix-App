import React from 'react';

const Sidebar = ({ currentView, onNavigate, darkMode }) => {
  const navItems = [
    {
      id: 'notes',
      label: 'Notes',
      description: 'Manage your notes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'blockfrost',
      label: 'Metadata Viewer',
      description: 'View blockchain data',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    }
  ];

  return (
    <aside className={`w-64 shadow-lg border-r transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700' 
        : 'bg-gradient-to-b from-white to-gray-50 border-gray-200'
    }`}>
      {/* Header Section */}
      <div className={`p-6 border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center space-x-3 mb-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            darkMode ? 'bg-red-600/20' : 'bg-red-100'
          }`}>
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <div>
            <h2 className={`text-lg font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Navigation
            </h2>
            <p className={`text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Quick access
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation Items */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`group w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 font-medium relative overflow-hidden ${
                isActive
                  ? darkMode
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 scale-105'
                    : 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 scale-105'
                  : darkMode
                    ? 'text-gray-300 hover:bg-gray-700/50 hover:scale-102'
                    : 'text-gray-700 hover:bg-gray-100 hover:scale-102'
              }`}
            >
              {/* Active indicator line */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
              )}
              
              {/* Icon container */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg mr-3 transition-all duration-200 ${
                isActive
                  ? 'bg-white/20'
                  : darkMode
                    ? 'bg-gray-700/50 group-hover:bg-gray-600/50'
                    : 'bg-gray-100 group-hover:bg-gray-200'
              }`}>
                {item.icon}
              </div>
              
              {/* Text content */}
              <div className="flex-1 text-left">
                <div className="font-semibold text-sm">{item.label}</div>
                <div className={`text-xs transition-opacity ${
                  isActive 
                    ? 'text-white/80' 
                    : darkMode 
                      ? 'text-gray-400' 
                      : 'text-gray-500'
                }`}>
                  {item.description}
                </div>
              </div>
              
              {/* Arrow indicator */}
              {isActive && (
                <svg 
                  className="w-5 h-5 text-white animate-pulse" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${
        darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
      }`}>
        <div className={`flex items-center space-x-2 text-xs ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Blockchain enabled</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;