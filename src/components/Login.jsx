import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/authSlice';
import logo from '../assets/logo.svg';
import loginBackground from '../assets/login-background.mp4';

export const Login = () => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { error, status } = useSelector((state) => state.auth); // Access error and status from Redux

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser({ username, password })).unwrap(); // Dispatch login action
    } catch (err) {
      setMessage(err.message || 'Login failed. Please try again.'); // Show error message
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 min-w-full min-h-full object-cover z-0"
      >
        <source src={loginBackground} type="video/mp4" />
      </video>
      
      {/* Darker overlay for better contrast */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-10"></div>

      {/* Content */}
      <div className="relative flex flex-col justify-center items-center h-full z-20">
        <div className="bg-white/20 backdrop-blur-md p-8 rounded-xl shadow-2xl w-96 border border-white/30">
          {/* Logo Container */}
          <div className="flex justify-center mb-10">
            <img src={logo} alt="logo" className="h-20 drop-shadow-lg" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-white text-sm font-medium mb-1 drop-shadow-lg">
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-4 rounded-lg bg-white/90 border-2 border-white/50 
                           text-gray-800 placeholder-gray-500
                           focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50
                           transition duration-200 ease-in-out
                           shadow-lg"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-white text-sm font-medium mb-1 drop-shadow-lg">
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 rounded-lg bg-white/90 border-2 border-white/50
                           text-gray-800 placeholder-gray-500
                           focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50
                           transition duration-200 ease-in-out
                           shadow-lg"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full p-4 mt-6 bg-white/90 hover:bg-white
                       rounded-lg text-gray-800 font-semibold
                       transform hover:scale-[1.02] active:scale-[0.98]
                       transition duration-200 ease-in-out
                       shadow-lg hover:shadow-xl
                       disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <svg
                  className="animate-spin h-5 w-5 mx-auto text-gray-800"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {message && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/80 backdrop-blur-sm text-white text-center text-sm">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
