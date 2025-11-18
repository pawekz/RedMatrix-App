import React from 'react';

const Header = ({ searchTerm, onSearchChange, darkMode, onToggleDarkMode, showCrudTestButton, onRunCrudSmokeTest, isCrudSmokeTesting }) => {
  return (
    <header className="bg-gradient-to-r from-[#DC143C] to-[#F75270] shadow-lg">
      <div className="w-full">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 pl-0 ml-0">
              <div className="flex items-center space-x-3 ml-4">
                <img 
                  src="/notepad.png" 
                  alt="RedMatrix Notes Icon" 
                  className="w-8 h-8"
                />
                <h1 className="text-2xl font-bold text-white">
                  RedMatrix Notes
                </h1>
              </div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={onSearchChange}
                className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DC143C] focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 pr-4">
            {showCrudTestButton && (
              <button
                onClick={onRunCrudSmokeTest}
                disabled={isCrudSmokeTesting}
                className="p-2 text-xs bg-white/20 text-white rounded-lg hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isCrudSmokeTesting ? 'Running CRUD test...' : 'CRUD Smoke Test'}
              </button>
            )}
            
            {/* Dark Mode Toggle Button */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                // Sun icon for light mode
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                // Moon icon for dark mode
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            <div className="text-white text-sm hidden md:block">
              Welcome to our notes app
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;