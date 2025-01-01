import React, { useEffect } from 'react';
import { IoPersonSharp, IoBriefcase, IoStatsChart, IoCalendar } from 'react-icons/io5';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees, selectEmployees, selectEmployeesStatus, selectEmployeesError } from '../redux/employeeSlice';
import { selectUserToken } from '../redux/authSlice';

export const MDashboard = ({ userRole }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const token = useSelector(selectUserToken);
  const employees = useSelector(selectEmployees);
  const employeesStatus = useSelector(selectEmployeesStatus);
  const employeesError = useSelector(selectEmployeesError);

  // Fetch employees on mount
  useEffect(() => {
    if (token) {
      dispatch(fetchEmployees(token));
    }
  }, [dispatch, token]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white">
      <Header userRole={userRole} />
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">Team Dashboard</h2>
          <p className="text-gray-600 max-w-2xl mx-auto dark:text-gray-400">
            Monitor your team's performance, manage tasks, and track progress all in one place.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Employees', value: employees.length, icon: IoPersonSharp, color: 'bg-blue-500' },
            { label: 'Active Tasks', value: '', icon: IoBriefcase, color: 'bg-green-500' },
            { label: 'Completed Today', value: '', icon: IoStatsChart, color: 'bg-purple-500' },
            { label: 'Due This Week', value: '', icon: IoCalendar, color: 'bg-orange-500' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
              <div className={`${stat.color} text-white rounded-full w-12 h-12 flex items-center justify-center mb-4`}>
                <stat.icon className="text-2xl" />
              </div>
              <h3 className="text-gray-500 text-sm mb-1 dark:text-gray-400">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Employee Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {employeesStatus === 'loading' && <p>Loading employees...</p>}
          {employeesStatus === 'failed' && <p>{employeesError}</p>}
          {employeesStatus === 'succeeded' && (
            employees.length > 0 ? (
              employees.map((employee) => (
                <div
                  key={employee.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 dark:bg-gray-800"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-100 rounded-full p-4 dark:bg-gray-700">
                      <IoPersonSharp className="text-4xl text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800 dark:text-white">{employee.userName}</h3>
                      <p className="text-gray-500 text-sm mb-2 dark:text-gray-400">{employee.email}</p>
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => navigate(`/employee/${employee.id}`)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-1"
                        >
                          <span>View Profile</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>There is no employee under you</p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MDashboard;
