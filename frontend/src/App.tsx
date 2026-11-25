import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppSelector } from './hooks';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import BillsPage from './pages/BillsPage';

function ProtectedLayout() {
  const authenticated = useAppSelector((state) => Boolean(state.auth.token));
  return authenticated ? <AppLayout /> : <Navigate to="/login" replace />;
}

export default function App() {
  const authenticated = useAppSelector((state) => Boolean(state.auth.token));
  return (
    <Routes>
      <Route path="/login" element={authenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/billing" element={<BillsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={authenticated ? '/' : '/login'} replace />} />
    </Routes>
  );
}
