import type { PaymentStatus } from '../types';

export default function StatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}><span />{status}</span>;
}
