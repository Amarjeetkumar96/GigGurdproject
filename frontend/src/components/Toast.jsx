import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  };

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const colors = {
    success: { border: 'var(--green)', bg: 'var(--green-dim)', color: 'var(--green)' },
    error:   { border: 'var(--red)',   bg: 'var(--red-dim)',   color: 'var(--red)'   },
    info:    { border: 'var(--accent)',bg: 'var(--accent-dim)',color: 'var(--accent)' },
    warning: { border: 'var(--yellow)',bg: 'var(--yellow-dim)',color: 'var(--yellow)' },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => {
          const c = colors[t.type] || colors.info;
          return (
            <div
              key={t.id}
              className="toast-item"
              style={{ borderLeft: `3px solid ${c.border}`, background: 'var(--surface)', boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px var(--border)` }}
              onClick={() => removeToast(t.id)}
            >
              <span className="toast-icon" style={{ background: c.bg, color: c.color }}>
                {icons[t.type]}
              </span>
              <span className="toast-msg">{t.message}</span>
              <button className="toast-close" onClick={() => removeToast(t.id)}>✕</button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
