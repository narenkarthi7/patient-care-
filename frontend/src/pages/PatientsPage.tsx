import { FormEvent, useEffect, useState } from 'react';
import Modal from '../components/Modal';
import { useAppDispatch, useAppSelector } from '../hooks';
import { clearPatientError, deletePatient, fetchPatients, savePatient } from '../store/patientsSlice';
import type { Gender, Patient } from '../types';

type PatientForm = Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;
const blankPatient: PatientForm = { name: '', age: 0, gender: 'Female', phone: '', email: '', address: '' };
const date = (value: string) => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function PatientsPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.patients);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [editing, setEditing] = useState<Patient | null>(null);
  const [viewing, setViewing] = useState<Patient | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<PatientForm>(blankPatient);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => { void dispatch(fetchPatients({ search, gender })); }, 250);
    return () => window.clearTimeout(timer);
  }, [dispatch, search, gender]);

  function openCreate() {
    dispatch(clearPatientError());
    setEditing(null);
    setForm(blankPatient);
    setFormOpen(true);
  }

  function openEdit(patient: Patient) {
    dispatch(clearPatientError());
    setEditing(patient);
    setFormOpen(true);
    setForm({ name: patient.name, age: patient.age, gender: patient.gender, phone: patient.phone, email: patient.email, address: patient.address });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await dispatch(savePatient({ id: editing?.id, data: form })).unwrap();
      await dispatch(fetchPatients({ search, gender })).unwrap();
      setFormOpen(false);
      setEditing(null);
    } catch {
      // The rejected action stores the API error in Redux.
    } finally {
      setSaving(false);
    }
  }

  async function remove(patient: Patient) {
    if (!window.confirm(`Delete ${patient.name}? This action cannot be undone.`)) return;
    dispatch(clearPatientError());
    try { await dispatch(deletePatient(patient.id)).unwrap(); } catch { /* Error is displayed from Redux. */ }
  }

  return (
    <>
      <div className="page-heading heading-with-date">
        <div><span className="eyebrow">YOUR PRACTICE</span><h1>Patients</h1><p>Keep patient information organised and easy to find.</p></div>
        <button className="button button-primary" onClick={openCreate}><span className="button-plus">+</span> Add patient</button>
      </div>
      <section className="content-card data-card">
        <div className="toolbar">
          <div className="toolbar-title"><h2>All patients</h2><span className="count-pill">{items.length}</span></div>
          <div className="filters">
            <label className="search-field"><span>⌕</span><input aria-label="Search patients by name" placeholder="Search patients…" value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>⌘ K</kbd></label>
            <select aria-label="Filter by gender" value={gender} onChange={(event) => setGender(event.target.value)}><option value="">All genders</option><option>Female</option><option>Male</option><option>Other</option></select>
          </div>
        </div>
        {error && <div className="alert alert-error table-alert">{error}</div>}
        <div className="table-scroll">
          <table>
            <thead><tr><th>PATIENT</th><th>AGE / GENDER</th><th>PHONE</th><th>EMAIL</th><th>ADDED</th><th className="actions-heading">ACTIONS</th></tr></thead>
            <tbody>
              {loading ? <tr><td className="table-message" colSpan={6}>Loading patients…</td></tr> :
                items.length ? items.map((patient, index) => <tr key={patient.id}>
                  <td><div className="table-patient"><span className={`patient-avatar avatar-${index % 4}`}>{patient.name.slice(0, 1).toUpperCase()}</span><strong>{patient.name}</strong></div></td>
                  <td>{patient.age} <span className="muted-separator">·</span> {patient.gender}</td>
                  <td>{patient.phone}</td><td className="email-cell">{patient.email}</td><td>{date(patient.createdAt)}</td>
                  <td><div className="row-actions"><button title="View details" aria-label={`View ${patient.name}`} onClick={() => setViewing(patient)}>View</button><button title="Edit patient" aria-label={`Edit ${patient.name}`} onClick={() => openEdit(patient)}>Edit</button><button className="danger-action" title="Delete patient" aria-label={`Delete ${patient.name}`} onClick={() => void remove(patient)}>Delete</button></div></td>
                </tr>) : <tr><td className="table-message" colSpan={6}>{search || gender ? 'No patients match your filters.' : 'No patient records yet. Add your first patient to get started.'}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="table-footer">Showing <strong>{items.length}</strong> patient{items.length === 1 ? '' : 's'} <span>Patient data is stored securely.</span></div>
      </section>

      {formOpen && (
        <Modal title={editing ? 'Edit patient' : 'Add a patient'} onClose={() => setFormOpen(false)} onSubmit={submit} submitLabel={editing ? 'Save changes' : 'Add patient'} busy={saving}>
          <div className="form-grid">
            <label className="field full-field">Patient name<input required minLength={2} maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Full name" /></label>
            <label className="field">Age<input required type="number" min="0" max="125" value={form.age || ''} onChange={(event) => setForm({ ...form, age: Number(event.target.value) })} placeholder="Age in years" /></label>
            <label className="field">Gender<select required value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value as Gender })}><option>Female</option><option>Male</option><option>Other</option></select></label>
            <label className="field">Phone number<input required minLength={7} maxLength={30} type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+91 98765 43210" /></label>
            <label className="field">Email address<input required type="email" maxLength={254} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="patient@email.com" /></label>
            <label className="field full-field">Address<textarea required minLength={3} rows={3} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Street, city, postal code" /></label>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
        </Modal>
      )}
      {viewing && <Modal title="Patient details" onClose={() => setViewing(null)}>
        <div className="detail-person"><span className="patient-avatar avatar-0">{viewing.name.slice(0, 1).toUpperCase()}</span><div><h3>{viewing.name}</h3><span>Patient record</span></div></div>
        <div className="detail-grid"><div><span>Patient ID</span><strong className="detail-id">{viewing.id}</strong></div><div><span>Age</span><strong>{viewing.age} years</strong></div><div><span>Gender</span><strong>{viewing.gender}</strong></div><div><span>Phone</span><strong>{viewing.phone}</strong></div><div><span>Email</span><strong>{viewing.email}</strong></div><div><span>Created</span><strong>{date(viewing.createdAt)}</strong></div><div className="detail-full"><span>Address</span><strong>{viewing.address}</strong></div></div>
      </Modal>}
    </>
  );
}
