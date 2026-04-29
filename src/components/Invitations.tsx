import React, { useState, useEffect } from 'react';
import { UserCheck, UserPlus } from 'lucide-react';
import { customAlert } from './GlobalModals';

export default function Invitations() {
  const [invitations, setInvitations] = useState<any[]>([]);
  
  useEffect(() => {
    fetch('/api/invitations')
      .then(r => r.json())
      .then(res => setInvitations(res.data || []));
  }, []);

  const handleInvite = async () => {
    const email = window.prompt('Introduce el correo electrónico del nuevo miembro:');
    if (email) {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.data) {
        setInvitations([...invitations, data.data]);
        customAlert(`Invitación enviada a ${email}`);
      }
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)', padding: '40px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '32px' }}>Invitar a tu equipo</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Main Action Card */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '12px' }}>Invitar por correo electrónico</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '24px' }}>
              Invita a miembros uno a uno por correo electrónico. Una vez que se registren, puedes confirmar sus cuentas en esta página.
            </p>
            <button 
              onClick={handleInvite}
              style={{ padding: '10px 20px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Invitar por correo electrónico
            </button>
          </div>

          {/* Status Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Confirmations Pending */}
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: '#10b981', fontWeight: 'bold' }}>
                <UserCheck size={20} />
                <span>0 pendientes de confirmación</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                Los nuevos miembros del equipo deben ser confirmados para poder acceder a las bóvedas compartidas. Te enviaremos un correo electrónico si hay alguien pendiente de confirmación.
              </p>
            </div>

            {/* Invitations Pending */}
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: '#3b82f6', fontWeight: 'bold' }}>
                <UserPlus size={20} />
                <span>{invitations.length} invitaciones pendientes</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                {invitations.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px' }}>
                    {invitations.map(inv => (
                      <li key={inv.id} style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{inv.email}</span>
                        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Expira {new Date(inv.expiresAt).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  "Las invitaciones caducan tras 5 días. Puedes volver a enviar una invitación en cualquier momento."
                )}
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
