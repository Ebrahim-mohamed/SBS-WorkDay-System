import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apii } from './api'; // Adjust based on your actual API path

// Async action to fetch sheet data
export const fetchSheetData = createAsyncThunk(
  'viewsheet/fetchSheetData',
  async (token, { rejectWithValue }) => {
    const today = new Date();
    const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 25);
    const endDate = today.toISOString().split("T")[0];
    const startDate = lastMonthDate.toISOString().split("T")[0];
    
    const url = `${apii}api/Sheet?start=${startDate}&end=${endDate}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return rejectWithValue('Error fetching data');
    }

    return response.json();
  }
);

const viewsheetSlice = createSlice({
  name: 'viewsheet',
  initialState: {
    data: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSheetData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSheetData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload.data || [];
      })
      .addCase(fetchSheetData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to load data';
      });
  },
});

export const selectSheetData = (state) => state.viewsheet.data;
export const selectSheetStatus = (state) => state.viewsheet.status;
export const selectSheetError = (state) => state.viewsheet.error;

export default viewsheetSlice.reducer;
