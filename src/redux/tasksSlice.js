import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apii } from './api';

// Async thunk to fetch tasks by project ID
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (projectId, { getState }) => {
    const token = getState().auth.token;
    

    if (!token) {
      throw new Error('Authorization token is missing');
    }

    const url = `${apii}api/Tasks/${projectId}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('API Response:', await response.text()); // Log full response
      throw new Error('Failed to fetch tasks');
    }

    const data = await response.json();
 

    if (!data.succeeded || !Array.isArray(data.data)) {
      throw new Error('Invalid tasks response');
    }

    return data.data; // Return tasks
  }
);





const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [], // Initial state is an empty array
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading'; // Set loading status when fetch starts
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded'; // Set succeeded status when fetch is successful
        state.tasks = action.payload; // Set tasks array in the state
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed'; // Set failed status if fetch fails
        state.error = action.error.message; // Set error message
      });
  },
});

export default tasksSlice.reducer;
