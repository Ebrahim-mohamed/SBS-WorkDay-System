import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  fetchEmployeeSheet,
  selectEmployeeSheetData,
  selectEmployeeSheetStatus,
  resetEmployeeSheet,
} from '../redux/employeeSheetSlice';
import { updateStatus } from '../redux/acceptSlice';
import { selectUserToken } from '../redux/authSlice';
import { IoCheckmarkCircleOutline, IoAlertCircleOutline, IoCaretBackOutline, IoPersonSharp, IoCalendarOutline } from 'react-icons/io5';

export const EmployeeProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const token = useSelector(selectUserToken);

  const sheetData = useSelector(selectEmployeeSheetData);
  const sheetStatus = useSelector(selectEmployeeSheetStatus);
  const currentEmployee = useSelector((state) => {
    const employees = state.employees.employees;
    return employees?.find(emp => emp.id === parseInt(id));
  });

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [selectedDays, setSelectedDays] = useState([]);
  const [notification, setNotification] = useState(null);
  const [viewMode, setViewMode] = useState('pending'); // New state for tracking view mode: 'pending', 'accepted', or 'rejected'

  useEffect(() => {
    if (startDate && endDate) {
      dispatch(
        fetchEmployeeSheet({
          employeeId: id,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          token,
        })
      );
    }
    return () => {
      dispatch(resetEmployeeSheet());
    };
  }, [dateRange, dispatch, id, token]);

  const filteredData = sheetData.filter((day) => {
    if (viewMode === 'pending') {
      return day.status === 'Posted' &&
        new Date(day.day) >= startDate &&
        new Date(day.day) <= endDate;
    } else if (viewMode === 'accepted') {
      return day.status === 'Accepted' &&
        new Date(day.day) >= startDate &&
        new Date(day.day) <= endDate;
    } else if (viewMode === 'rejected') {
      return day.status === 'Rejected' &&
        new Date(day.day) >= startDate &&
        new Date(day.day) <= endDate;
    }
    return false;
  });

  const handleSelectAll = () => {
    setSelectedDays(
      selectedDays.length === filteredData.length 
        ? [] 
        : filteredData.map((day) => day.day)
    );
  };

  const handleSelectDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleStatusUpdate = (status) => {
    if (selectedDays.length === 0) return;

    const formattedDays = selectedDays.map((day) =>
      new Date(day).toISOString().split('T')[0]
    );

    dispatch(
      updateStatus({
        token,
        userId: id,
        days: formattedDays,
        status,
      })
    ).then((result) => {
      const isSuccess = result.meta.requestStatus === 'fulfilled';
      setNotification({
        type: isSuccess ? 'success' : 'error',
        message: isSuccess 
          ? `Selected days ${status === 2 ? 'accepted' : 'rejected'} successfully!`
          : `Failed to ${status === 2 ? 'accept' : 'reject'} selected days.`
      });

      if (isSuccess) {
        setSelectedDays([]);
        if (startDate && endDate) {
          dispatch(fetchEmployeeSheet({
            employeeId: id,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            token,
          }));
        }
      }

      setTimeout(() => setNotification(null), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Employee Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors mb-4 md:mb-0"
          >
            <IoCaretBackOutline className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          {currentEmployee && (
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
                <IoPersonSharp className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {currentEmployee.userName || 'Employee Name'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {currentEmployee.email || 'Employee Email'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {/* View Mode Selector */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setViewMode('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'pending'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Pending Days
            </button>
            <button
              onClick={() => setViewMode('accepted')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'accepted'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Accepted Days
            </button>
            <button
              onClick={() => setViewMode('rejected')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Rejected Days
            </button>
          </div>

          {/* Date Picker and Select All */}
          <div className="flex flex-col space-y-6 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <IoCalendarOutline className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-2" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Select Date Range
                </h3>
              </div>
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                placeholderText="Click to select date range"
                dateFormat="yyyy-MM-dd"
              />
            </div>
            
            {viewMode === 'pending' && (
              <button
                onClick={handleSelectAll}
                disabled={!startDate || !endDate}
                className={`w-full md:w-auto px-6 py-3 rounded-lg transition-colors self-end
                  ${(!startDate || !endDate) 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
              >
                {selectedDays.length === filteredData.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {/* Notification */}
          {notification && (
            <div className={`mb-6 p-4 rounded-lg shadow-md flex items-center gap-2 ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}>
              {notification.type === 'success' 
                ? <IoCheckmarkCircleOutline className="text-2xl" /> 
                : <IoAlertCircleOutline className="text-2xl" />
              }
              <span>{notification.message}</span>
            </div>
          )}

          {/* Timesheet Table */}
          {sheetStatus === 'loading' ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              Loading timesheet data...
            </div>
          ) : sheetStatus === 'succeeded' && filteredData.length > 0 ? (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="p-3 text-left border dark:border-gray-600 font-semibold">Day</th>
                      {[...Array(8)].map((_, hour) => (
                        <th key={hour} className="p-3 text-left border dark:border-gray-600 font-semibold">
                          Hour {hour + 1}
                        </th>
                      ))}
                      {viewMode === 'pending' && (
                        <th className="p-3 text-center border dark:border-gray-600 font-semibold">Select</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((day, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="p-3 border dark:border-gray-600">{day.day}</td>
                        {Array.from({ length: 8 }, (_, hour) => {
                          const hourData = day.hours.find((h) => h.hour === hour + 1);
                          return (
                            <td key={hour} className="p-3 border dark:border-gray-600">
                              {hourData ? (
                                <div className="space-y-1">
                                  <p className="font-medium">{hourData.projectName}</p>
                                  <p>{hourData.taskName}</p>
                                  {hourData.details !== 'null' && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {hourData.details}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">No Data</span>
                              )}
                            </td>
                          );
                        })}
                        {viewMode === 'pending' && (
                          <td className="p-3 border dark:border-gray-600 text-center">
                            <input
                              type="checkbox"
                              checked={selectedDays.includes(day.day)}
                              onChange={() => handleSelectDay(day.day)}
                              className="w-4 h-4 cursor-pointer"
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              {viewMode === 'pending' && selectedDays.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-4">
                  <button
                    onClick={() => handleStatusUpdate(2)}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
                  >
                    Accept ({selectedDays.length})
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(3)}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                  >
                    Reject ({selectedDays.length})
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No {viewMode} days found in the specified range.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;