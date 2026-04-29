'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface VaultFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function VaultForm({ onClose, onSuccess }: VaultFormProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/vaults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, icon: 'FolderLock' })
      });
      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '30px', borderRadius: '16px', width: '400px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Nueva Bóveda</h2>
          <button className="button" onClick={onClose} style={{ padding: '8px' }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Nombre de la bóveda</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
              autoFocus
              style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }}
              placeholder="Ej. Personal, Trabajo..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="button" onClick={onClose}>Cancelar</button>
            <button type="submit" className="button primary" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Bóveda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
