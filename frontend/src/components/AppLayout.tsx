import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks';

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  function signOut() {
    dispatch(logout());
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">+</span><span>careflow<span className="brand-dot">.</span></span></div>
        <p className="nav-label">WORKSPACE</p>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">⌂</span> Overview
          </NavLink>
          <NavLink to="/patients" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">♡</span> Patients
          </NavLink>
          <NavLink to="/billing" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">▤</span> Billing
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="profile-avatar">{user?.name?.slice(0, 1).toUpperCase() ?? 'A'}</div>
          <div className="profile-copy"><strong>{user?.name ?? 'Administrator'}</strong><span>Administrator</span></div>
          <button className="icon-button logout-button" onClick={signOut} title="Log out" aria-label="Log out">↪</button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Careflow <span>/</span> <strong>Patient care</strong></div>
          <div className="topbar-right"><span className="online-dot" /> Workspace active</div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  );
}
