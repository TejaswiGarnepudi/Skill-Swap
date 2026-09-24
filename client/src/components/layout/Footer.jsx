import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between flex-col md:flex-row gap-4">
          <div className="flex justify-center md:justify-start">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-coral-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="font-bold text-plum-900">SkillSwap</span>
            </div>
          </div>
          
          <div className="flex justify-center space-x-6">
            <Link to="#" className="text-gray-400 hover:text-violet-500 text-sm">About</Link>
            <Link to="#" className="text-gray-400 hover:text-violet-500 text-sm">Guidelines</Link>
            <Link to="#" className="text-gray-400 hover:text-violet-500 text-sm">Privacy</Link>
            <Link to="#" className="text-gray-400 hover:text-violet-500 text-sm">Terms</Link>
          </div>
          
          <div className="flex justify-center md:justify-end">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} SkillSwap. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
