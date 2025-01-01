import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoIosNotifications } from 'react-icons/io';
import { IoMenu, IoPersonCircle } from 'react-icons/io5';
import { useSelector, useDispatch } from 'react-redux';
import { MdDarkMode } from 'react-icons/md'; // Dark mode icon
import { selectUserName, selectIsManager } from '../redux/authSlice';
import logo from '../assets/logo.svg';
import { logout } from '../redux/authSlice'; // Import logout action

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Dark mode state

  const userName = useSelector(selectUserName);
  const isManager = useSelector(selectIsManager);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  const toggleNotifications = () => setShowNotifications((prev) => !prev);
  const toggleMenu = () => setShowMenu((prev) => !prev);
  const toggleProfileMenu = () => setShowProfileMenu((prev) => !prev);

  const getButtonClass = (path) =>
    location.pathname === path
      ? 'text-custom-blue uppercase font-bold'
      : 'text-gray-600 uppercase font-bold';

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode ? 'true' : 'false');
  };

  useEffect(() => {
    // On initial load, check localStorage for dark mode preference
    const storedDarkMode = localStorage.getItem('darkMode');
    setIsDarkMode(storedDarkMode === 'true');
  }, []);

  useEffect(() => {
    // Apply or remove the 'dark' class from the body based on isDarkMode
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <header className="bg-gray-100 dark:bg-black text-black dark:text-white p-4 flex items-center relative">
      <img src={logo} alt="logo" className="h-8" />

      {/* Navigation Links */}
      <div className="flex space-x-6 ml-6 hidden md:flex">
        {isManager && (
          <button
            onClick={() => navigate('/dashboard')}
            className={getButtonClass('/dashboard')}
          >
            Dashboard
          </button>
        )}
        <button
          onClick={() => navigate('/task-form')}
          className={getButtonClass('/task-form')}
        >
          Task Form
        </button>
        <button
          onClick={() => navigate('/time-sheet')}
          className={getButtonClass('/time-sheet')}
        >
          Time Sheet
        </button>
      </div>

      {/* Right Section */}
      <div className="ml-auto flex items-center space-x-4">
      <button
  onClick={toggleNotifications}
  className="text-gray-600 hover:text-custom-blue relative"
>
  {/* Change icon color to custom-blue if notifications are visible, else apply default color */}
  <IoIosNotifications 
    size={24} 
    className={`${showNotifications ? 'text-custom-blue' : 'text-gray-600'} 
                hover:text-custom-blue transition-all`}
  />
  
  {showNotifications && (
    <div className="absolute top-10 right-0 w-64 bg-white shadow-md rounded-md p-4 dark:bg-gray-800">
      <h4 className="font-semibold text-lg mb-2 text-black dark:text-white">Notifications</h4>
      <ul>
        <li className="mb-1 text-sm text-gray-700 dark:text-gray-300">
          No new notifications.
        </li>
      </ul>
    </div>
  )}
</button>


        {/* Dark Mode Toggle Icon */}
        <button
          onClick={toggleDarkMode}
          className="text-gray-600 hover:text-custom-blue"
        >
          <MdDarkMode
            size={24}
            className={isDarkMode ? 'text-custom-blue' : 'text-gray-600'}
          />
        </button>

        {/* Profile Icon */}
        <div className="hidden md:block">
  <button
    onClick={toggleProfileMenu}
    className="text-gray-600 hover:text-custom-blue relative"
  >
    {/* Change icon color to custom-blue when profile menu is open */}
    <IoPersonCircle 
      size={24} 
      className={`${showProfileMenu ? 'text-custom-blue' : 'text-gray-600'} 
                  hover:text-custom-blue transition-all`}
    />
    
    {showProfileMenu && (
      <div className="absolute top-10 right-0 w-64 bg-white shadow-md rounded-md p-4 dark:bg-gray-800">
        <ul>
          <li
            onClick={() => {
              navigate('/profile');
              setShowProfileMenu(false);
            }}
            className="mb-1 text-lg text-gray-700 cursor-pointer hover:text-custom-blue dark:text-gray-300"
          >
            View Profile
          </li>
          <li
            onClick={handleLogout}
            className="mb-1 text-lg text-gray-700 cursor-pointer text-red-500 hover:text-red-700 dark:text-gray-300"
          >
            Logout
          </li>
        </ul>
      </div>
    )}
  </button>
</div>

        {/* Mobile Menu Icon */}
        <button
          onClick={toggleMenu}
          className="text-gray-600 hover:text-custom-blue md:hidden"
        >
          <IoMenu size={24} />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMenu && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md z-10 flex flex-col items-start p-4 space-y-4 md:hidden">
          {isManager && (
            <button
              onClick={() => {
                setShowMenu(false);
                navigate('/dashboard');
              }}
              className="text-gray-700 text-lg"
            >
              Dashboard
            </button>
          )}
          <button
            onClick={() => {
              setShowMenu(false);
              navigate('/task-form');
            }}
            className="text-gray-700 text-lg"
          >
            Task Form
          </button>
          <button
            onClick={() => {
              setShowMenu(false);
              navigate('/time-sheet');
            }}
            className="text-gray-700 text-lg"
          >
            Time Sheet
          </button>
          <button
            onClick={() => {
              navigate('/profile');
              setShowMenu(false);
            }}
            className="text-gray-700 text-lg"
          >
            View Profile
          </button>
          <button
            onClick={handleLogout}
            className="text-gray-700 text-lg bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded w-full text-center"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
