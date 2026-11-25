import { FormEvent, useEffect, useState } from 'react';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchPatients } from '../store/patientsSlice';
import { deleteBill, fetchBills, saveBill } from '../store/billsSlice';
import type { Bill, PaymentStatus } from '../types';

interface BillForm {
  patientId: string;
  description: string;
  amount: string;
  tax: string;
  status: PaymentStatus;
}

const blankBill: BillForm = { patientId: '', description: '', amount: '', tax: '0', status: 'Pending' };
const date = (value: string) => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const money = (value: string | number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value));

export default function BillsPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.bills);
  const { items: patients } = useAppSelector((state) => state.patients);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Bill | null>(null);
  const [viewing, setViewing] = useState<Bill | null>(null);
  const [form, setForm] = useState<BillForm>(blankBill);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void dispatch(fetchBills());
    void dispatch(fetchPatients(undefined));
  }, [dispatch]);

  function openCreate() {
    setEditing(null);
    setForm({ ...blankBill, patientId: patients[0]?.id ?? '' });
    setFormOpen(true);
  }

  function openEdit(bill: Bill) {
    setEditing(bill);
    setForm({
      patientId: bill.patientId,
      description: bill.description,
      amount: String(bill.amount),
      tax: String(bill.tax),
      status: bill.status,
    });
    setFormOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await dispatch(saveBill({
        id: editing?.id,
        data: {
          patientId: form.patientId,
          description: form.description,
          amount: Number(form.amount),
          tax: Number(form.tax),
          ...(editing ? { status: form.status } : {}),
        },
      })).unwrap();
      await dispatch(fetchBills()).unwrap();
      setFormOpen(false);
      setEditing(null);
    } catch {
      // Errors from both save and reload are surfaced in the bills slice.
    } finally {
      setSaving(false);
    }
  }

  async function remove(bill: Bill) {
    if (!window.confirm(`Delete bill for ${bill.patient?.name ?? 'this patient'}? This cannot be undone.`)) return;
    try {
      await dispatch(deleteBill(bill.id)).unwrap();
      await dispatch(fetchBills()).unwrap();
    } catch {
      // Error is displayed from Redux.
    }
  }

  const totalOutstanding = items.filter((bill) => bill.status === 'Pending').reduce((sum, bill) => sum + Number(bill.totalAmount), 0);

  return (
    <>
      <div className="page-heading heading-with-date">
        <div><span className="eyebrow">FINANCIALS</span><h1>Billing</h1><p>Create bills and keep track of patient balances.</p></div>
        <button className="button button-primary" onClick={openCreate} disabled={!patients.length}><span className="button-plus">+</span> Create bill</button>
      </div>
      <section className="billing-overview">
        <div className="billing-overview-icon">▤</div><div><span>OPEN BALANCE</span><strong>{money(totalOutstanding)}</strong><small>Across {items.filter((bill) => bill.status === 'Pending').length} pending bills</small></div>
        {!patients.length && <span className="inline-hint">Add a patient before creating a bill.</span>}
      </section>
      <section className="content-card data-card">
        <div className="toolbar"><div className="toolbar-title"><h2>All bills</h2><span className="count-pill">{items.length}</span></div><span className="toolbar-note">Bills are managed in INR</span></div>
        {error && <div className="alert alert-error table-alert">{error}</div>}
        <div className="table-scroll">
          <table>
            <thead><tr><th>BILL / PATIENT</th><th>DESCRIPTION</th><th>AMOUNT</th><th>TAX</th><th>TOTAL</th><th>STATUS</th><th>CREATED</th><th className="actions-heading">ACTIONS</th></tr></thead>
            <tbody>
              {loading ? <tr><td className="table-message" colSpan={8}>Loading bills…</td></tr> :
                items.length ? items.map((bill) => <tr key={bill.id}>
                  <td><div className="bill-patient"><strong>{bill.patient?.name ?? 'Patient'}</strong><span>#{bill.id.slice(0, 8).toUpperCase()}</span></div></td>
                  <td className="description-cell">{bill.description}</td><td>{money(bill.amount)}</td><td>{money(bill.tax)}</td><td className="amount-strong">{money(bill.totalAmount)}</td><td><StatusBadge status={bill.status} /></td><td>{date(bill.createdAt)}</td>
                  <td><div className="row-actions"><button title="View bill" onClick={() => setViewing(bill)}>View</button><button title="Edit bill" onClick={() => openEdit(bill)}>Edit</button><button className="danger-action" title="Delete bill" onClick={() => void remove(bill)}>Delete</button></div></td>
                </tr>) : <tr><td className="table-message" colSpan={8}>No bills yet. Create a bill to see it here.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="table-footer">Showing <strong>{items.length}</strong> bill{items.length === 1 ? '' : 's'} <span>Online payment processing is not enabled.</span></div>
      </section>
      {formOpen && <Modal title={editing ? 'Edit bill' : 'Create a bill'} onClose={() => setFormOpen(false)} onSubmit={submit} submitLabel={editing ? 'Save changes' : 'Create bill'} busy={saving}>
        <div className="form-grid">
          <label className="field full-field">Patient<select required value={form.patientId} onChange={(event) => setForm({ ...form, patientId: event.target.value })}><option value="" disabled>Select a patient</option>{patients.map((patient) => <option value={patient.id} key={patient.id}>{patient.name} · {patient.email}</option>)}</select></label>
          <label className="field full-field">Service / description<input required minLength={2} maxLength={240} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="e.g. Consultation" /></label>
          <label className="field">Amount (INR)<input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0.00" /></label>
          <label className="field">Tax (INR)<input required type="number" min="0" step="0.01" value={form.tax} onChange={(event) => setForm({ ...form, tax: event.target.value })} placeholder="0.00" /></label>
          {editing && <label className="field full-field">Payment status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as PaymentStatus })}><option>Pending</option><option>Paid</option><option>Failed</option><option>Cancelled</option></select><small className="field-help">Status is recorded manually; no online payment is processed.</small></label>}
        </div>
        <div className="bill-total-preview"><span>Total amount</span><strong>{money((Number(form.amount) || 0) + (Number(form.tax) || 0))}</strong><small>Amount + tax</small></div>
        {error && <div className="alert alert-error">{error}</div>}
      </Modal>}
      {viewing && <Modal title="Bill details" onClose={() => setViewing(null)}>
        <div className="bill-detail-header"><div><span className="eyebrow">BILL REFERENCE</span><strong>#{viewing.id.toUpperCase()}</strong></div><StatusBadge status={viewing.status} /></div>
        <div className="detail-grid"><div><span>Patient</span><strong>{viewing.patient?.name ?? '—'}</strong></div><div><span>Created</span><strong>{date(viewing.createdAt)}</strong></div><div className="detail-full"><span>Description</span><strong>{viewing.description}</strong></div><div><span>Amount</span><strong>{money(viewing.amount)}</strong></div><div><span>Tax</span><strong>{money(viewing.tax)}</strong></div><div className="bill-total-detail"><span>Total</span><strong>{money(viewing.totalAmount)}</strong></div></div>
        <p className="payment-note">Payment status is tracked for record keeping only. Online payments and payment history are not enabled.</p>
      </Modal>}
    </>
  );
}
