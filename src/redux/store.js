import { configureStore } from '@reduxjs/toolkit';
import projectsReducer from './projectsSlice';
import tasksReducer from './tasksSlice';
import authReducer from './authSlice';
import employeeReducer from './employeeSlice';
import sheetReducer from './sheetSlice';
import viewsheetReducer from './viewsheetSlice';
import statusReducer from './statusSlice';
import employeeSheetReducer from './employeeSheetSlice';
import acceptReducer from './acceptSlice'; // Import the acceptSlice reducer
import dayTasksReducer from './dayTasksSlice';


export const store = configureStore({
  reducer: {
    projects: projectsReducer,
    tasks: tasksReducer,
    auth: authReducer,
    employees: employeeReducer,
    sheet: sheetReducer,
    viewsheet: viewsheetReducer,
    status: statusReducer,
    employeeSheet: employeeSheetReducer,
    accept: acceptReducer, // Add the accept reducer
    dayTasks: dayTasksReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Optional: Disable serializable check for non-serializable data
    }),
});

export default store;
