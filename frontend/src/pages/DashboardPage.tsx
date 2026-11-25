import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchDashboard } from '../store/dashboardSlice';

const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
const date = (value: string) => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { summary, loading, error } = useAppSelector((state) => state.dashboard);
  const user = useAppSelector((state) => state.auth.user);
  useEffect(() => { void dispatch(fetchDashboard()); }, [dispatch]);

  return (
    <>
      <div className="page-heading heading-with-date">
        <div><span className="eyebrow">OVERVIEW</span><h1>Good to see you, {user?.name?.split(' ')[0] ?? 'there'} <span className="wave">✦</span></h1><p>Here’s what’s happening with your practice today.</p></div>
        <div className="date-chip"><span>◷</span> {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {loading && !summary ? <div className="loading-panel">Loading your overview…</div> : summary && <>
        <section className="stat-grid">
          <article className="stat-card"><div className="stat-top"><span className="stat-icon mint">♡</span><span className="stat-caption">ALL TIME</span></div><div className="stat-value">{summary.totalPatients}</div><div className="stat-label">Total patients</div><Link to="/patients" className="stat-link">View patients <span>→</span></Link></article>
          <article className="stat-card"><div className="stat-top"><span className="stat-icon lavender">▤</span><span className="stat-caption">ALL TIME</span></div><div className="stat-value">{summary.totalBills}</div><div className="stat-label">Total bills</div><Link to="/billing" className="stat-link">View billing <span>→</span></Link></article>
          <article className="stat-card"><div className="stat-top"><span className="stat-icon green">↗</span><span className="stat-caption">COLLECTED</span></div><div className="stat-value stat-money">{money(summary.totalPaidAmount)}</div><div className="stat-label">Total paid amount</div><Link to="/billing" className="stat-link">See transactions <span>→</span></Link></article>
          <article className="stat-card"><div className="stat-top"><span className="stat-icon peach">◷</span><span className="stat-caption">AWAITING</span></div><div className="stat-value stat-money">{money(summary.totalPendingAmount)}</div><div className="stat-label">Total pending amount</div><Link to="/billing" className="stat-link">Review pending <span>→</span></Link></article>
        </section>
        <section className="dashboard-lower">
          <article className="content-card recent-card">
            <div className="section-heading"><div><h2>Recently added patients</h2><p>Your latest patient records</p></div><Link className="text-link" to="/patients">View all <span>→</span></Link></div>
            {summary.recentPatients.length ? <div className="recent-list">{summary.recentPatients.map((patient, index) => <div className="recent-row" key={patient.id}><span className={`patient-avatar avatar-${index % 4}`}>{patient.name.slice(0, 1).toUpperCase()}</span><div className="recent-name"><strong>{patient.name}</strong><span>{patient.email}</span></div><span className="recent-date">{date(patient.createdAt)}</span></div>)}</div> : <div className="empty-state"><span className="empty-symbol">♡</span><strong>No patients yet</strong><span>Add your first patient record to get started.</span><Link className="button button-small button-primary" to="/patients">Add patient</Link></div>}
          </article>
          <article className="content-card quick-card"><span className="eyebrow">QUICK ACTIONS</span><h2>What would you like to do?</h2><p>Jump right into your daily work.</p><Link to="/patients" className="quick-action"><span className="quick-icon mint">♡</span><span><strong>Add a new patient</strong><small>Create and manage patient records</small></span><b>→</b></Link><Link to="/billing" className="quick-action"><span className="quick-icon lavender">▤</span><span><strong>Create a bill</strong><small>Prepare a bill for a patient</small></span><b>→</b></Link></article>
        </section>
      </>}
    </>
  );
}
