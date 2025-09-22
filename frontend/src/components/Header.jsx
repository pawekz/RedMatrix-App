import React from 'react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-[#DC143C] to-[#F75270] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-3">
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
          
          <div className="flex items-center space-x-4">
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