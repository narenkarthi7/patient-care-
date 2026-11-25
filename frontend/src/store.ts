import { configureStore } from '@reduxjs/toolkit';
import authReducer from './store/authSlice';
import patientsReducer from './store/patientsSlice';
import billsReducer from './store/billsSlice';
import dashboardReducer from './store/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientsReducer,
    bills: billsReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
