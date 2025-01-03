import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoIosNotifications } from 'react-icons/io';
import { IoMenu, IoPersonCircle } from 'react-icons/io5';
import { useSelector, useDispatch } from 'react-redux';
import { MdDarkMode } from 'react-icons/md';
import { selectUserName, selectIsManager } from '../redux/authSlice';
import { logout } from '../redux/authSlice';
import logo from '../assets/logo.svg';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef(null);

  const userName = useSelector(selectUserName);
  const isManager = useSelector(selectIsManager);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    setIsDarkMode(storedDarkMode === 'true');
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const navItems = [
    isManager && { path: '/dashboard', label: 'Dashboard' },
    { path: '/task-form', label: 'Task Form' },
    { path: '/time-sheet', label: 'Time Sheet' }
  ].filter(Boolean);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <img src={logo} alt="logo" className="h-8 w-auto" />
            
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${isActive(item.path)
                      ? 'text-custom-blue bg-blue-50 dark:bg-gray-800'
                      : 'text-gray-600 dark:text-gray-300 hover:text-custom-blue hover:bg-gray-50 dark:hover:bg-gray-800'}
                  `}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4" ref={dropdownRef}>
            <button
              onClick={() => toggleDropdown('notifications')}
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <IoIosNotifications
                size={24}
                className={`${activeDropdown === 'notifications' ? 'text-custom-blue' : 'text-gray-600 dark:text-gray-300'}`}
              />
              
              {activeDropdown === 'notifications' && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  </div>
                  <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                    No new notifications
                  </div>
                </div>
              )}
            </button>

            <button
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                localStorage.setItem('darkMode', (!isDarkMode).toString());
              }}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <MdDarkMode
                size={24}
                className={isDarkMode ? 'text-custom-blue' : 'text-gray-600 dark:text-gray-300'}
              />
            </button>

            <div className="hidden md:block relative">
              <button
                onClick={() => toggleDropdown('profile')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <IoPersonCircle
                  size={24}
                  className={`${activeDropdown === 'profile' ? 'text-custom-blue' : 'text-gray-600 dark:text-gray-300'}`}
                />
              </button>

              {activeDropdown === 'profile' && (
                <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setActiveDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <IoMenu size={24} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {showMenu && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setShowMenu(false);
                }}
                className={`
                  w-full text-left px-3 py-2 rounded-md text-base font-medium
                  ${isActive(item.path)
                    ? 'text-custom-blue bg-blue-50 dark:bg-gray-800'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}
                `}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                navigate('/profile');
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              View Profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;