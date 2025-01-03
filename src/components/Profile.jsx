import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserName, selectUserEmail } from '../redux/authSlice';
import Header from './Header';
import { IoPersonCircle } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { FaUser } from "react-icons/fa";

const Profile = () => {
  const userName = useSelector(selectUserName);
  const userEmail = useSelector(selectUserEmail);

  // Format name to show only capitalized first name
  const formatName = (fullName) => {
    const firstName = fullName.split('.')[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };

  const displayName = formatName(userName);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Header />

      <div className="flex-1 p-6 md:p-12">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 max-w-3xl mx-auto hover:shadow-2xl transition-shadow duration-300">
          <div className="flex justify-center mb-6">
            <div className="w-40 h-40 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <IoPersonCircle size={140} className="text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-8">
            Welcome {displayName}
          </h1>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <FaUser className="text-blue-500 dark:text-blue-300" size={24} />
              <p className="text-lg font-bold">{userName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <MdEmail className="text-purple-500 dark:text-purple-300" size={24} />
              <p className="text-lg font-bold">{userEmail}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;