import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSheetData } from "../redux/viewsheetSlice";
import { IoCalendarOutline, IoAlertCircleOutline, IoTrashOutline } from "react-icons/io5";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { IoCreateOutline, IoSendOutline } from "react-icons/io5";
import { updateStatus } from "../redux/statusSlice";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

export const TimeSheet = ({ userRole }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const sheetData = useSelector((state) => state.viewsheet.data);
  const sheetStatus = useSelector((state) => state.viewsheet.status);
  const sheetError = useSelector((state) => state.viewsheet.error);

  const [selectedTasks, setSelectedTasks] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (token) {
      dispatch(fetchSheetData(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
        window.location.reload();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Filter tasks and calculate active hours (excluding rejected tasks)
  const filterTasks = (tasks) => {
    const today = new Date();
    const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 25);
    const startDate = lastMonthDate.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];

    return tasks.filter((task) => {
      const taskDate = new Date(task.day);
      return (
        task.status === "Submitted" &&
        taskDate >= new Date(startDate) &&
        taskDate <= new Date(endDate)
      );
    });
  };

  const filteredTasks = filterTasks(sheetData);
  const rejectedTasks = sheetData.filter((task) => task.status === "Rejected");

  // Calculate total hours excluding rejected tasks
  const totalActiveHours = sheetData
    .filter(task => task.status !== "Rejected")
    .length * 8;

  const handleSelectTask = (task) => {
    setSelectedTasks((prevSelected) => {
      if (prevSelected.includes(task.day)) {
        return prevSelected.filter((day) => day !== task.day);
      } else {
        return [...prevSelected, task.day];
      }
    });
  };

  // Navigate to TaskForm with the selected date
  const handleEdit = (day) => {
    dispatch({ type: "viewsheet/setSelectedDate", payload: day });
    navigate("/task-form", { state: { selectedDate: day } });
  };

  // Handle delete task
  const handleDelete = async (day) => {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${day}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotification({
          type: "success",
          message: "Task deleted successfully!"
        });
        dispatch(fetchSheetData(token));
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      setNotification({
        type: "error",
        message: "Failed to delete task"
      });
    }
  };

  const handleSendSelected = () => {
    if (selectedTasks.length > 0) {
      dispatch(updateStatus({ selectedTasks, token }))
        .unwrap()
        .then(() => {
          setNotification({
            type: "success",
            message: "Status updated successfully!",
          });
          setSelectedTasks([]);
        })
        .catch((error) => {
          setNotification({
            type: "error",
            message: "There is a day already sent to the manager",
          });
        });
    }
  };

  // Task Card Component
  const TaskCard = ({ task, showActions = true }) => (
    <div
      onClick={() => handleSelectTask(task)}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer border-2 dark:border-gray-600 transition-all hover:shadow-lg ${
        selectedTasks.includes(task.day)
          ? "border-blue-500 dark:border-blue-500"
          : "border-transparent"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <IoCalendarOutline className="text-blue-500 text-xl" />
          <div>
            <h3 className="font-semibold text-lg dark:text-white">
              {task.day}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {task.hours.length} hours logged
            </p>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(task.day);
            }}
            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-full transition-colors"
            title="Edit"
          >
            <IoCreateOutline />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(task.day);
            }}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-full transition-colors"
            title="Delete"
          >
            <IoTrashOutline />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Header userRole={userRole} />

      <div className="max-w-7xl mx-auto p-6">
        {/* ... (Header and notification code remains the same) ... */}

        {/* Monthly Hours Card - Updated to show active hours */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Active Monthly Hours
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total active hours (excluding rejected days)
              </p>
            </div>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-blue-500">{totalActiveHours}</div>
              <div className="ml-2 text-gray-600 dark:text-gray-400">hrs</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/task-form")}
            className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <IoCreateOutline />
            New Entry
          </button>
        </div>

        {/* Submitted Tasks Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Days Not Sent Yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            These are the days that have not been submitted yet.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {sheetStatus === "loading" ? (
            <div className="col-span-full text-center p-6 bg-gray-100 dark:bg-gray-700">
              <p>Loading...</p>
            </div>
          ) : sheetStatus === "failed" ? (
            <div className="col-span-full text-center p-6 bg-gray-100 dark:bg-gray-700">
              <p>Error: {sheetError || "Error in internet or server"}</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="col-span-full text-center p-6 bg-gray-100 dark:bg-gray-700">
              <p>No submitted days in the selected date range</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard key={task.day} task={task} />
            ))
          )}
        </div>

        {/* Rejected Tasks Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Rejected Days
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            These days were rejected by your manager and need revision.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-20">
          {rejectedTasks.length === 0 ? (
            <div className="col-span-full text-center p-6 bg-gray-100 dark:bg-gray-700">
              <p>No rejected days</p>
            </div>
          ) : (
            rejectedTasks.map((task) => (
              <TaskCard key={task.day} task={task} />
            ))
          )}
        </div>

        {/* Send Selected Button */}
        {(filteredTasks.length > 0 || rejectedTasks.length > 0) && (
          <div className="fixed bottom-6 right-6 left-6 max-w-7xl mx-auto">
            <button
              onClick={handleSendSelected}
              disabled={selectedTasks.length === 0}
              className={`w-full md:w-auto float-right px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                selectedTasks.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              } text-white`}
            >
              <IoSendOutline />
              Send Selected ({selectedTasks.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSheet;