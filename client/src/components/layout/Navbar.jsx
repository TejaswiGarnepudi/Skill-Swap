import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import NotificationBell from '../notifications/NotificationBell';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Discover', path: '/discover' },
    { name: 'Matches', path: '/matches' },
    { name: 'Groups', path: '/groups' },
    { name: 'Sessions', path: '/sessions' },
    { name: 'Messages', path: '/messages' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-coral-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl text-plum-900">SkillSwap</span>
            </Link>
            
            {isAuthenticated && (
              <div className="hidden md:ml-8 md:flex md:space-x-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-violet-50 text-violet-700'
                          : 'text-gray-600 hover:bg-lavender-50 hover:text-plum-900'
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-4">
                <NotificationBell />
                
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center focus:outline-none"
                  >
                    <Avatar src={user?.avatar} name={user?.name} size="sm" />
                  </button>

                  {isProfileDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      />
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 overflow-hidden">
                        <div className="py-2 border-b border-gray-50 px-4">
                          <p className="text-sm font-medium text-plum-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-lavender-50"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <User className="mr-2 h-4 w-4" /> My Profile
                          </Link>
                          <Link
                            to="/edit-profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-lavender-50"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Settings className="mr-2 h-4 w-4" /> Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">Get Started</Button>
                </Link>
              </div>
            )}

            <div className="flex md:hidden items-center ml-4">
              {isAuthenticated && <NotificationBell />}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                      `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                        isActive
                          ? 'bg-violet-50 border-violet-500 text-violet-700'
                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                      }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </NavLink>
                ))}
                <div className="border-t border-gray-100 pt-4 pb-3">
                  <div className="flex items-center px-4">
                    <Avatar src={user?.avatar} name={user?.name} size="sm" />
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user?.name}</div>
                      <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="px-4 py-3 space-y-3">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" fullWidth>Log in</Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth>Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
