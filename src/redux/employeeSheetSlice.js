import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apii } from './api'; // Assuming 'apii' is the base URL from api.js
import { selectUserToken } from './authSlice'; // Import token from auth slice

// Initial state for the employeeSheet slice
const initialState = {
  data: [],
  status: 'idle',
  error: null,
};

// Async function to fetch data based on employee id and date range
export const fetchEmployeeSheet = createAsyncThunk(
  'employeeSheet/fetchEmployeeSheet',
  async ({ employeeId, startDate, endDate, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apii}api/Sheet/${employeeId}?start=${startDate}&end=${endDate}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return rejectWithValue('Failed to fetch data');
      }

      const data = await response.json();
      return data.data; // Return the data array
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create employeeSheet slice
const employeeSheetSlice = createSlice({
  name: 'employeeSheet',
  initialState,
  reducers: {
    resetEmployeeSheet: (state) => {
      state.data = []; // Clear the data when the user navigates away
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeSheet.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEmployeeSheet.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchEmployeeSheet.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Exporting selectors for employee sheet data
export const selectEmployeeSheetData = (state) => state.employeeSheet.data;
export const selectEmployeeSheetStatus = (state) => state.employeeSheet.status;
export const selectEmployeeSheetError = (state) => state.employeeSheet.error;

export const { resetEmployeeSheet } = employeeSheetSlice.actions;

export default employeeSheetSlice.reducer;
