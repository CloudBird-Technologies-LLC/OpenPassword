import React, { useState, useEffect } from 'react';
import { UserPlus, Search, ArrowUp, ArrowUpDown, ChevronDown } from 'lucide-react';

export default function People() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/team')
      .then(r => r.json())
      .then(res => {
        setUsers(res.data || []);
        setIsLoading(false);
      });
  }, []);

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)', padding: '40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px' }}>Personas</h1>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500 }}>
            <UserPlus size={16} /> Invitar a gente
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              25 <ChevronDown size={14} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              Todos <ChevronDown size={14} />
            </div>
            <span>1 of 1</span>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', width: '300px', backgroundColor: 'var(--bg-primary)' }}>
              <Search size={16} color="var(--text-secondary)" />
              <input type="text" placeholder="Buscar por nombre o correo electrónico" style={{ border: 'none', background: 'transparent', color: 'white', width: '100%', outline: 'none', fontSize: '0.85rem' }} />
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px', width: '40px' }}><input type="checkbox" /></th>
                <th style={{ padding: '16px', fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Nombre <ArrowUp size={14} color="var(--accent-primary)" /></div>
                </th>
                <th style={{ padding: '16px', fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Correo electrónico <ArrowUpDown size={14} color="var(--text-tertiary)" /></div>
                </th>
                <th style={{ padding: '16px', fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Estado <ArrowUpDown size={14} color="var(--text-tertiary)" /></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando equipo...</td></tr>
              ) : users.map((user, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px' }}><input type="checkbox" /></td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: user.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>
                        {user.initial}
                      </div>
                      <a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}>{user.name}</a>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{user.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
