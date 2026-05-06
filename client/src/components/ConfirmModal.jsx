import { useEffect } from 'react';

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal confirm-modal" role="dialog" aria-modal="true">

        <div className="modal-header">
          <h2 className="modal-title">
            <span className={`modal-title-icon${danger ? ' modal-title-icon--danger' : ''}`}>
              {danger ? (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M7.5 5.5v3.5M7.5 11v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M6.47 2.25L1.06 11.5A1.18 1.18 0 002.1 13.25h10.8a1.18 1.18 0 001.04-1.75L8.53 2.25a1.18 1.18 0 00-2.06 0z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M7.5 5v3.5M7.5 10v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              )}
            </span>
            {title}
          </h2>
          <button className="modal-close" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          {message && <p className="confirm-message">{message}</p>}
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button
              className={`btn ${danger ? 'btn-danger-solid' : 'btn-primary'}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Please wait…' : confirmLabel}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
