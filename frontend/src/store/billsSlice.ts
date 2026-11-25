import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api';
import type { Bill } from '../types';

interface BillsState {
  items: Bill[];
  loading: boolean;
  error: string | null;
}

const initialState: BillsState = { items: [], loading: false, error: null };

export const fetchBills = createAsyncThunk('bills/fetch', async (_, { rejectWithValue }) => {
  try {
    return await api<Bill[]>('/bills');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unable to load bills');
  }
});

export const saveBill = createAsyncThunk(
  'bills/save',
  async (input: { id?: string; data: { patientId: string; description: string; amount: number; tax: number; status?: string } }, { rejectWithValue }) => {
    try {
      return await api<Bill>(input.id ? `/bills/${input.id}` : '/bills', {
        method: input.id ? 'PATCH' : 'POST',
        body: JSON.stringify(input.data),
      });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unable to save bill');
    }
  },
);

export const deleteBill = createAsyncThunk('bills/delete', async (id: string, { rejectWithValue }) => {
  try {
    await api(`/bills/${id}`, { method: 'DELETE' });
    return id;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unable to delete bill');
  }
});

const billsSlice = createSlice({
  name: 'bills',
  initialState,
  reducers: { clearBillError(state) { state.error = null; } },
  extraReducers(builder) {
    builder
      .addCase(fetchBills.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBills.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string ?? 'Unable to load bills';
      })
      .addCase(saveBill.fulfilled, (state, action) => {
        const index = state.items.findIndex((bill) => bill.id === action.payload.id);
        if (index >= 0) state.items[index] = action.payload;
        else state.items.unshift(action.payload);
      })
      .addCase(saveBill.rejected, (state, action) => { state.error = action.payload as string ?? 'Unable to save bill'; })
      .addCase(deleteBill.fulfilled, (state, action) => {
        state.items = state.items.filter((bill) => bill.id !== action.payload);
      })
      .addCase(deleteBill.rejected, (state, action) => { state.error = action.payload as string ?? 'Unable to delete bill'; });
  },
});

export const { clearBillError } = billsSlice.actions;
export default billsSlice.reducer;
