import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Login } from './components/Login';
import { TaskForm } from './components/TaskForm';
import { MDashboard } from './components/MDashboard';
import { EmployeeProfile } from './components/Employeeprofile';
import Profile from './components/Profile';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsManager } from './redux/authSlice';
import TimeSheet from './components/TimeSheet';

function App() {
  const navigate = useNavigate();
  const isManager = useSelector(selectIsManager); // Access the isManager value from Redux state
  const token = useSelector((state) => state.auth.token); // Access token to check if logged in

  useEffect(() => {
    // Redirect user based on their role and authentication status
    if (token) {
      if (isManager) {
        // Managers should have access to /dashboard, /task-form, and /time-sheet
        const allowedPaths = ['/dashboard', '/task-form', '/time-sheet','/profile',"/employee"];
        if (!allowedPaths.some((path) => window.location.pathname.startsWith(path))) {
          navigate('/dashboard'); // Default to dashboard for managers
        }
      } else {
        // Employees should have access to /task-form and /time-sheet
        const allowedPaths = ['/task-form', '/time-sheet', '/profile'];
        if (!allowedPaths.some((path) => window.location.pathname.startsWith(path))) {
          navigate('/task-form'); // Default to task-form for employees
        }
      }
    } else {
      // If not logged in, redirect to login
      if (!window.location.pathname.startsWith('/login')) {
        navigate('/login');
      }
    }
  }, [isManager, token, navigate]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<MDashboard />} />
        <Route path="/task-form" element={<TaskForm />} />
        <Route path="/employee/:id" element={<EmployeeProfile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/time-sheet" element={<TimeSheet />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
