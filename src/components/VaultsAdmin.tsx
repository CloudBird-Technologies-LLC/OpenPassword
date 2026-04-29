import React, { useState, useEffect } from 'react';
import { Plus, Search, ArrowUp, ArrowUpDown, ChevronDown, RefreshCw, Upload } from 'lucide-react';

export default function VaultsAdmin() {
  const [vaults, setVaults] = useState<any[]>([]);

  const fetchVaults = async () => {
    try {
      const res = await fetch('/api/vaults');
      const data = await res.json();
      setVaults(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchVaults();
  }, []);

  const toggleSafeForTravel = async (id: string, currentVal: boolean) => {
    try {
      await fetch(`/api/vaults/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ safeForTravel: !currentVal })
      });
      fetchVaults();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)', padding: '40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px' }}>Bóvedas</h1>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500 }}>
            <Plus size={16} /> Nueva bóveda
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              25 <ChevronDown size={14} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              All <ChevronDown size={14} />
            </div>
            <span>1 of 1</span>
            <RefreshCw size={16} color="var(--text-secondary)" cursor="pointer" />
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500 }}>
              <Upload size={14} /> Importar datos
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', width: '300px', backgroundColor: 'var(--bg-primary)' }}>
              <Search size={16} color="var(--text-secondary)" />
              <input type="text" placeholder="Buscar bóvedas" style={{ border: 'none', background: 'transparent', color: 'white', width: '100%', outline: 'none', fontSize: '0.85rem' }} />
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px', fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Nombre <ArrowUp size={14} color="var(--accent-primary)" /></div>
                </th>
                <th style={{ padding: '16px', fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Actualizado <ArrowUpDown size={14} color="var(--text-tertiary)" /></div>
                </th>
                <th style={{ padding: '16px', fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Creado <ArrowUpDown size={14} color="var(--text-tertiary)" /></div>
                </th>
                <th style={{ padding: '16px', fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Elementos <ArrowUpDown size={14} color="var(--text-tertiary)" /></div>
                </th>
                <th style={{ padding: '16px', fontWeight: 'bold', textAlign: 'center' }}>
                  Modo Viaje Seguro
                </th>
              </tr>
            </thead>
            <tbody>
              {vaults.map((vault) => (
                <tr key={vault.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: vault.icon === 'Users' ? '#8b5cf6' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem', overflow: 'hidden' }}>
                        {vault.name.charAt(0).toUpperCase()}
                      </div>
                      <a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}>{vault.name}</a>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{new Date(vault.updatedAt).toLocaleDateString()}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{new Date(vault.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{vault._count?.items || 0}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div 
                      onClick={() => toggleSafeForTravel(vault.id, vault.safeForTravel)}
                      style={{ margin: '0 auto', width: '36px', height: '20px', backgroundColor: vault.safeForTravel ? '#10b981' : 'var(--bg-tertiary)', borderRadius: '10px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s' }}
                      title="Marcar como Segura para Viajes"
                    >
                      <div style={{ width: '14px', height: '14px', backgroundColor: 'white', borderRadius: '7px', position: 'absolute', top: '3px', left: vault.safeForTravel ? '19px' : '3px', transition: 'left 0.2s' }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
