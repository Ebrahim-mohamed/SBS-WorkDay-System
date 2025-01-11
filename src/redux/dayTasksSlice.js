import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apii } from "./api";

export const fetchDayTasks = createAsyncThunk(
  "dayTasks/fetchDayTasks",
  async (date, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await fetch(
        `${apii}api/Sheet?start=${date}&end=${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch day tasks");
      }

      const data = await response.json();

      if (!data.succeeded) {
        throw new Error(data.message || "Failed to fetch day tasks");
      }

      const dayData = data.data[0];
      const formattedTasks = Array.from({ length: 8 }, (_, index) => {
        const hourData = dayData.hours[index] || {};
        return {
          project: hourData.projectName || "",
          task: hourData.taskName?.toString() || "",
          details: hourData.details || "",
          taskOptions: [],
        };
      });

      return {
        date: date,
        tasks: formattedTasks,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveDayTasks = createAsyncThunk(
  "dayTasks/saveDayTasks",
  async ({ date, tasks }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const formattedTasks = tasks.map((task, index) => ({
        day: date,
        hour: index + 1,
        taskId: parseInt(task.task, 10),
        details: task.details || "N/A",
      }));

      const response = await fetch(`${apii}api/Sheet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tasks: formattedTasks }),
      });

      if (!response.ok) {
        throw new Error("Failed to save day tasks");
      }

      const data = await response.json();

      if (!data.succeeded) {
        throw new Error(data.message || "Failed to save day tasks");
      }

      return { date, tasks };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dayTasksSlice = createSlice({
  name: "dayTasks",
  initialState: {
    currentDay: null,
    tasks: [],
    status: "idle",
    error: null,
  },
  reducers: {
    clearCurrentDay: (state) => {
      state.currentDay = null;
      state.tasks = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDayTasks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDayTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentDay = action.payload.date;
        state.tasks = action.payload.tasks;
      })
      .addCase(fetchDayTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(saveDayTasks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveDayTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentDay = action.payload.date;
        state.tasks = action.payload.tasks;
      })
      .addCase(saveDayTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearCurrentDay } = dayTasksSlice.actions;
export default dayTasksSlice.reducer;
