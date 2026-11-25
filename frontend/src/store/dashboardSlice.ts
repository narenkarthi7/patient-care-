import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api';
import type { DashboardSummary } from '../types';

interface DashboardState {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = { summary: null, loading: false, error: null };

export const fetchDashboard = createAsyncThunk('dashboard/fetch', async (_, { rejectWithValue }) => {
  try {
    return await api<DashboardSummary>('/dashboard');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unable to load dashboard');
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchDashboard.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDashboard.fulfilled, (state, action) => { state.loading = false; state.summary = action.payload; })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string ?? 'Unable to load dashboard';
      });
  },
});

export default dashboardSlice.reducer;
