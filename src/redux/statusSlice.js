// src/redux/statusSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apii } from './api';

// Async thunk for updating the status
export const updateStatus = createAsyncThunk(
  'status/updateStatus',
  async ({ selectedTasks, token }, { rejectWithValue }) => {
    try {
      const url = `${apii}api/Sheet/updatestatus`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: null,
          days: selectedTasks,
          status: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice for handling status updates
const statusSlice = createSlice({
  name: 'status',
  initialState: {
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateStatus.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default statusSlice.reducer;
