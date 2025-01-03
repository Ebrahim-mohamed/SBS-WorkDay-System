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
  const { error, status } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser({ username, password })).unwrap();
    } catch (err) {
      setMessage(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-900">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 min-w-full min-h-full object-cover z-0 hidden md:block"
      >
        <source src={loginBackground} type="video/mp4" />
      </video>
      
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/50 to-black/70 z-10"></div>

      <div className="relative flex flex-col justify-center items-center min-h-screen p-4 z-20">
        <div className="bg-white/40 backdrop-blur-lg p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md 
                      border border-white/20 transform transition-all duration-300 hover:shadow-3xl">
          <div className="flex justify-center mb-8 transform transition-transform duration-300 hover:scale-105">
            <img src={logo} alt="logo" className="h-16 md:h-20 drop-shadow-2xl" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="relative group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 md:p-4 rounded-xl bg-white/90 border-2 border-white/30
                           text-gray-800 placeholder-gray-500
                           focus:outline-none focus:border-white focus:ring-2 focus:ring-white/30
                           transition-all duration-300 ease-out
                           shadow-lg group-hover:shadow-xl"
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 md:p-4 rounded-xl bg-white/90 border-2 border-white/30
                           text-gray-800 placeholder-gray-500
                           focus:outline-none focus:border-white focus:ring-2 focus:ring-white/30
                           transition-all duration-300 ease-out
                           shadow-lg group-hover:shadow-xl"
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full p-3 md:p-4 bg-white/90 hover:bg-white
                       rounded-xl text-gray-800 font-semibold text-base md:text-lg
                       transform hover:scale-[1.02] active:scale-[0.98]
                       transition-all duration-300 ease-out
                       shadow-lg hover:shadow-2xl
                       disabled:opacity-50 disabled:cursor-not-allowed
                       focus:outline-none focus:ring-2 focus:ring-white/50"
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
            <div className="mt-4 p-3 rounded-xl bg-red-500/80 backdrop-blur-sm text-white text-center text-sm
                          animate-fade-in transition-all duration-300 ease-out">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;