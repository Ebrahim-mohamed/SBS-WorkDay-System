import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apii } from './api';

// Async thunk to fetch projects
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { getState }) => {
    const token = getState().auth.token; // Get token from Redux store
    if (!token) {
      throw new Error('Authorization token is missing');
    }

    // Fetch projects from API
      const url = `${apii}api/Projects`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`, // Authorization header with token
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    const data = await response.json();
    

    // If no projects found, return an empty array
    return data.data && Array.isArray(data.data) ? data.data : [];
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [], // Initial state is an empty array
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading'; // Set loading status when the fetch starts
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded'; // Set succeeded status when fetch is successful
        state.projects = action.payload; // Set projects array in the state
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed'; // Set failed status if fetch fails
        state.error = action.error.message; // Set error message
      });
  },
});

export default projectsSlice.reducer;


