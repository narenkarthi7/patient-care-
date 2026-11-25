import { FormEvent, ReactNode } from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel?: string;
  busy?: boolean;
}

export default function Modal({ title, onClose, children, onSubmit, submitLabel, busy = false }: ModalProps) {
  const content = (
    <>
      <div className="modal-header"><h2>{title}</h2><button className="icon-button close-button" type="button" onClick={onClose} aria-label="Close dialog">×</button></div>
      {children}
      {onSubmit && <div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary" disabled={busy}>{busy ? 'Saving…' : submitLabel ?? 'Save'}</button></div>}
    </>
  );

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      {onSubmit
        ? <form className="modal-card" onSubmit={onSubmit}>{content}</form>
        : <section className="modal-card" role="dialog" aria-modal="true" aria-label={title}>{content}</section>}
    </div>
  );
}
