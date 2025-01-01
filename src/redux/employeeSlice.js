import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apii } from './api';
import { selectUserToken } from './authSlice'; // To get the token from authSlice

// Initial state for the employees slice
const initialState = {
  employees: [],
  status: 'idle',
  error: null,
};

// Async function to fetch employees
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (token, { rejectWithValue }) => {
    const response = await fetch(`${apii}api/Users/subordinates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return rejectWithValue('Failed to fetch employees');
    }

    const data = await response.json();
    return data.data; // Return the data array
  }
);

// Create employee slice
const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Exporting employee data and status selectors
export const selectEmployees = (state) => state.employees.employees;
export const selectEmployeesStatus = (state) => state.employees.status;
export const selectEmployeesError = (state) => state.employees.error;

export default employeeSlice.reducer;
