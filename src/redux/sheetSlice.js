import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apii } from './api'; // Update with the correct API endpoint if necessary

// Async thunk for posting selected tasks to the server
export const postSelectedTasks = createAsyncThunk(
  'sheet/postSelectedTasks',
  async (selectedData, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    const url = `${apii}api/Sheet`; // API endpoint to post selected tasks

    try {
      // Transform local data into the required format
      const tasks = selectedData.flatMap((day) =>
        day.tasks.map((task, index) => ({
          day: day.date,
          hour: index + 1,
          taskId: parseInt(task.task, 10), // Ensure taskId is an integer
          details: task.details || "N/A",

        }))
      );

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tasks }),
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error posting tasks');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Slice definition
const sheetSlice = createSlice({
  name: 'sheet',
  initialState: {
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postSelectedTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(postSelectedTasks.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(postSelectedTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default sheetSlice.reducer;
