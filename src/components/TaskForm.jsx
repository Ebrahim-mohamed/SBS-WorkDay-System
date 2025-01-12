import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  IoCalendarOutline,
  IoTimeOutline,
  IoSaveOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoArrowBackOutline,
} from "react-icons/io5";
import { fetchProjects } from "../redux/projectsSlice";
import { fetchTasks } from "../redux/tasksSlice";
import {
  fetchDayTasks,
  saveDayTasks,
  clearCurrentDay,
} from "../redux/dayTasksSlice";
import Header from "./Header";

export const TaskForm = ({ userRole }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Redux state
  const { projects } = useSelector((state) => state.projects);
  const { status: sheetStatus } = useSelector((state) => state.sheet);
  const currentDayTasks = useSelector((state) => state.dayTasks.tasks);
  const dayTasksStatus = useSelector((state) => state.dayTasks.status);

  // Local state
  const [tasksForm, setTasksForm] = useState(
    Array.from({ length: 8 }, () => ({
      project: "",
      task: "",
      details: "",
      taskOptions: [],
    }))
  );

  const [date, setDate] = useState(
    location.state?.selectedDate || new Date().toISOString().slice(0, 10)
  );

  const [projectTasksMap, setProjectTasksMap] = useState({});
  const [activeRow, setActiveRow] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bulkAssign, setBulkAssign] = useState({
    project: "",
    task: "",
    details: "",
    taskOptions: [],
  });
  const [dayData, setDayData] = useState([]);
  const completionPercentage =
    (tasksForm.filter((task) => task.project && task.task).length /
      tasksForm.length) *
    100;

  const allRowsComplete = tasksForm.every((task) => task.project && task.task);

  useEffect(() => {
    const initializeForm = async () => {
      setIsLoading(true);
      try {
        await dispatch(fetchProjects());
        const data = await dispatch(fetchDayTasks(date, "no data"));
        setDayData(data.payload.tasks);
        if (location.state?.selectedDate) {
          const result = await dispatch(
            fetchDayTasks(location.state.selectedDate)
          ).unwrap();
          setTasksForm(result.tasks);

          // Load task options for each project
          for (const task of result.tasks) {
            if (task.project) {
              const tasksAction = await dispatch(fetchTasks(task.project));
              if (tasksAction.payload) {
                setProjectTasksMap((prev) => ({
                  ...prev,
                  [task.project]: tasksAction.payload,
                }));

                setTasksForm((prevTasks) =>
                  prevTasks.map((prevTask) =>
                    prevTask.project === task.project
                      ? { ...prevTask, taskOptions: tasksAction.payload }
                      : prevTask
                  )
                );
              }
            }
          }
        } else {
          // Check if day exists when adding new entry
          const response = await fetch(`${apii}api/Sheet/${date}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data && data.data) {
              setNotification({
                type: "error",
                message:
                  "This day already exists. You can edit it from the timesheet page.",
              });
              setTimeout(() => {
                navigate("/time-sheet");
              }, 2000);
              return;
            }
          }
        }
      } catch (error) {
        console.error("Error in initializeForm:", error);
        setNotification({
          type: "error",
          message: "Failed to load data. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeForm();

    // Cleanup when component unmounts
    return () => {
      dispatch(clearCurrentDay());
    };
  }, [dispatch, location.state?.selectedDate, date]);

  const handleBulkAssign = () => {
    if (bulkAssign.project && bulkAssign.task) {
      setTasksForm((prevTasks) =>
        prevTasks.map((task) => ({
          project: bulkAssign.project,
          task: bulkAssign.task,
          details: bulkAssign.details,
          taskOptions: bulkAssign.taskOptions,
        }))
      );
      setNotification({
        type: "success",
        message: "Tasks bulk assigned successfully!",
      });
    }
  };

  const handleBulkProjectChange = async (projectId) => {
    setBulkAssign((prev) => ({
      ...prev,
      project: projectId,
      task: "",
      taskOptions: [],
    }));

    if (projectId && !projectTasksMap[projectId]) {
      try {
        const action = await dispatch(fetchTasks(projectId));
        if (action.payload) {
          setProjectTasksMap((prev) => ({
            ...prev,
            [projectId]: action.payload,
          }));
          setBulkAssign((prev) => ({
            ...prev,
            taskOptions: action.payload,
          }));
        }
      } catch (error) {
        setNotification({
          type: "error",
          message: "Failed to fetch tasks for selected project",
        });
      }
    } else if (projectId) {
      setBulkAssign((prev) => ({
        ...prev,
        taskOptions: projectTasksMap[projectId],
      }));
    }
  };

  const handleProjectChange = async (index, projectId) => {
    setTasksForm((prevTasks) =>
      prevTasks.map((task, taskIndex) =>
        taskIndex === index
          ? { ...task, project: projectId, task: "", taskOptions: [] }
          : task
      )
    );

    if (projectId && !projectTasksMap[projectId]) {
      try {
        const action = await dispatch(fetchTasks(projectId));
        if (action.payload) {
          setProjectTasksMap((prevMap) => ({
            ...prevMap,
            [projectId]: action.payload,
          }));
          setTasksForm((prevTasks) =>
            prevTasks.map((task, taskIndex) =>
              taskIndex === index
                ? { ...task, taskOptions: action.payload }
                : task
            )
          );
        }
      } catch (error) {
        setNotification({
          type: "error",
          message: "Failed to fetch tasks for selected project",
        });
      }
    } else if (projectId) {
      setTasksForm((prevTasks) =>
        prevTasks.map((task, taskIndex) =>
          taskIndex === index
            ? { ...task, taskOptions: projectTasksMap[projectId] }
            : task
        )
      );
    }
  };

  const handleChange = (index, field, value) => {
    setTasksForm((prevTasks) =>
      prevTasks.map((task, taskIndex) =>
        taskIndex === index ? { ...task, [field]: value } : task
      )
    );
  };

  const handleSaveDay = async () => {
    console.log(tasksForm);
    try {
      await dispatch(
        saveDayTasks({
          date: date,
          tasks: tasksForm,
        })
      ).unwrap();

      setNotification({
        type: "success",
        message: location.state?.selectedDate
          ? "Day's tasks updated successfully!"
          : "Day's tasks saved successfully!",
      });

      setTimeout(() => {
        navigate("/time-sheet");
      }, 1500);
    } catch (error) {
      setNotification({
        type: "error",
        message: error.message || "Failed to save tasks",
      });
    }
  };

  const handleBack = () => {
    navigate("/time-sheet");
  };

  const calculateStartDate = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 26);
    return start.toISOString().split("T")[0];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-600 dark:text-gray-300">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header userRole={userRole} />
      <div className="p-6 max-w-7xl mx-auto">
        <button
          onClick={handleBack}
          className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          <IoArrowBackOutline />
          Back to Timesheet
        </button>

        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            {location.state?.selectedDate
              ? "Edit Day's Tasks"
              : "Daily Task Registration"}
          </h2>
        </div>

        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-64 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 rounded-full h-2 transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(completionPercentage)}% Complete
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium mb-2">
            <IoCalendarOutline className="text-blue-500 dark:text-blue-300" />
            Select Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-300"
            min={calculateStartDate()}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Bulk Assignment Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Bulk Assignment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <select
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-300"
              value={bulkAssign.project}
              onChange={(e) => handleBulkProjectChange(e.target.value)}
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            <select
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-300"
              value={bulkAssign.task}
              onChange={(e) =>
                setBulkAssign((prev) => ({ ...prev, task: e.target.value }))
              }
              disabled={!bulkAssign.project}
            >
              <option value="">Select Task</option>
              {bulkAssign.taskOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={bulkAssign.details}
              onChange={(e) =>
                setBulkAssign((prev) => ({ ...prev, details: e.target.value }))
              }
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-300"
              placeholder="Enter details for all hours..."
            />
          </div>

          <button
            onClick={handleBulkAssign}
            disabled={!bulkAssign.project || !bulkAssign.task}
            className={`w-full p-2 rounded-md transition-colors ${
              bulkAssign.project && bulkAssign.task
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Apply to All Hours
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Hourly Tasks
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-300">
                    Hour
                  </th>
                  <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-300">
                    Project
                  </th>
                  <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-300">
                    Task
                  </th>
                  <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-300">
                    Details
                  </th>
                  <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasksForm.map((task, index) => (
                  <tr
                    key={index}
                    className={`border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      activeRow === index ? "bg-blue-50 dark:bg-blue-900" : ""
                    }`}
                    onClick={() => setActiveRow(index)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <IoTimeOutline className="text-gray-400 dark:text-gray-500" />
                        <span className="font-medium dark:text-gray-200">
                          Hour {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-300"
                        value={task.project}
                        onChange={(e) =>
                          handleProjectChange(index, e.target.value)
                        }
                      >
                        <option value="">
                          {dayData[index].project
                            ? dayData[index].project
                            : "Select Project"}
                        </option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-300"
                        value={task.task}
                        onChange={(e) =>
                          handleChange(index, "task", e.target.value)
                        }
                        disabled={!task.project}
                      >
                        <option value="">
                          {dayData[index].task
                            ? dayData[index].task
                            : "Select Task"}
                        </option>
                        {task.taskOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={
                          dayData[index].details
                            ? dayData[index].details
                            : task.details
                        }
                        onChange={(e) =>
                          handleChange(index, "details", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-300"
                        placeholder="Enter details..."
                      />
                    </td>
                    <td className="py-3 px-4">
                      {task.project && task.task ? (
                        <span className="inline-flex items-center text-green-600 dark:text-green-400">
                          <IoCheckmarkCircleOutline className="mr-1" />
                          Complete
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-600 dark:text-red-400">
                          <IoAlertCircleOutline className="mr-1" />
                          Incomplete
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notification */}
          {notification && (
            <div
              className={`mt-4 p-4 rounded-lg shadow-md flex items-center gap-2 ${
                notification.type === "success"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {notification.type === "success" ? (
                <IoCheckmarkCircleOutline className="text-2xl" />
              ) : (
                <IoAlertCircleOutline className="text-2xl" />
              )}
              <span>{notification.message}</span>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSaveDay}
              className={`flex items-center gap-2 px-6 py-3 ${
                allRowsComplete
                  ? "bg-blue-500 dark:bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-800"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white rounded-lg transition-colors`}
              disabled={!allRowsComplete}
            >
              <IoSaveOutline className="mr-2" />
              {location.state?.selectedDate ? "Update Day" : "Save Day"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
