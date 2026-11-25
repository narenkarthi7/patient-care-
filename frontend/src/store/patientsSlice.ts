import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api';
import type { Patient } from '../types';

interface PatientsState {
  items: Patient[];
  loading: boolean;
  error: string | null;
}

const initialState: PatientsState = { items: [], loading: false, error: null };

export const fetchPatients = createAsyncThunk(
  'patients/fetch',
  async (filters: { search?: string; gender?: string } | undefined, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.set('search', filters.search);
      if (filters?.gender) params.set('gender', filters.gender);
      return await api<Patient[]>(`/patients${params.size ? `?${params}` : ''}`);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unable to load patients');
    }
  },
);

export const savePatient = createAsyncThunk(
  'patients/save',
  async (input: { id?: string; data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> }, { rejectWithValue }) => {
    try {
      return await api<Patient>(input.id ? `/patients/${input.id}` : '/patients', {
        method: input.id ? 'PATCH' : 'POST',
        body: JSON.stringify(input.data),
      });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unable to save patient');
    }
  },
);

export const deletePatient = createAsyncThunk('patients/delete', async (id: string, { rejectWithValue }) => {
  try {
    await api(`/patients/${id}`, { method: 'DELETE' });
    return id;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unable to delete patient');
  }
});

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: { clearPatientError(state) { state.error = null; } },
  extraReducers(builder) {
    builder
      .addCase(fetchPatients.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPatients.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string ?? 'Unable to load patients';
      })
      .addCase(savePatient.fulfilled, (state, action) => {
        const index = state.items.findIndex((patient) => patient.id === action.payload.id);
        if (index >= 0) state.items[index] = action.payload;
        else state.items.unshift(action.payload);
      })
      .addCase(savePatient.rejected, (state, action) => { state.error = action.payload as string ?? 'Unable to save patient'; })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.items = state.items.filter((patient) => patient.id !== action.payload);
      })
      .addCase(deletePatient.rejected, (state, action) => { state.error = action.payload as string ?? 'Unable to delete patient'; });
  },
});

export const { clearPatientError } = patientsSlice.actions;
export default patientsSlice.reducer;
