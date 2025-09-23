import React from 'react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-[#DC143C] to-[#F75270] shadow-lg">
      <div className="w-full">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 pl-0 ml-0"> {/* Zero padding and margin */}
              <div className="flex items-center space-x-3 ml-4"> {/* Add margin only to the content */}
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
          
          
        </div>
      </div>
    </header>
  );
};

export default Header;