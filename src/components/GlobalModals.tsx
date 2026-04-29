'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Info } from 'lucide-react';

type AlertState = { isOpen: boolean, message: string, title: string, isError: boolean };
type ConfirmState = { isOpen: boolean, message: string, title: string, onConfirm: () => void };

let alertCallback: (state: AlertState) => void;
let confirmCallback: (state: ConfirmState) => void;

export const customAlert = (message: string, isError = false, title = isError ? 'Error' : 'Aviso') => {
  if (alertCallback) {
    alertCallback({ isOpen: true, message, title, isError });
  } else {
    alert(message);
  }
};

export const customConfirm = (message: string, onConfirm: () => void, title = 'Confirmar acción') => {
  if (confirmCallback) {
    confirmCallback({ isOpen: true, message, title, onConfirm });
  } else {
    if (confirm(message)) onConfirm();
  }
};

export default function GlobalModals() {
  const [alertState, setAlertState] = useState<AlertState>({ isOpen: false, message: '', title: '', isError: false });
  const [confirmState, setConfirmState] = useState<ConfirmState>({ isOpen: false, message: '', title: '', onConfirm: () => {} });

  useEffect(() => {
    alertCallback = setAlertState;
    confirmCallback = setConfirmState;
  }, []);

  if (!alertState.isOpen && !confirmState.isOpen) return null;

  return (
    <>
      {/* Alert Modal */}
      {alertState.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', width: '90%', maxWidth: '400px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {alertState.isError ? <AlertCircle color="#ef4444" /> : <Info color="#3b82f6" />}
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: alertState.isError ? '#ef4444' : 'white' }}>{alertState.title}</h3>
            </div>
            <div style={{ padding: '24px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {alertState.message}
            </div>
            <div style={{ padding: '16px 24px', backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setAlertState(s => ({ ...s, isOpen: false }))}
                style={{ padding: '10px 24px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmState.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', width: '90%', maxWidth: '400px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle color="#f59e0b" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f59e0b' }}>{confirmState.title}</h3>
            </div>
            <div style={{ padding: '24px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {confirmState.message}
            </div>
            <div style={{ padding: '16px 24px', backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setConfirmState(s => ({ ...s, isOpen: false }))}
                style={{ padding: '10px 20px', backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setConfirmState(s => ({ ...s, isOpen: false }));
                  confirmState.onConfirm();
                }}
                style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
