import React, { useState, useEffect } from 'react';
import { UserPlus, Search, ArrowUp, ArrowUpDown, FolderLock, Puzzle, Eye, Copy, Edit, Trash2, Plus, Shield } from 'lucide-react';
import { translations } from '../utils/i18n';

export default function People() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [language, setLanguage] = useState('es');

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => { if (data.data?.language) setLanguage(data.data.language); })
      .catch(() => {});
    const handleLang = (e: any) => setLanguage(e.detail.language);
    window.addEventListener('languageChanged', handleLang);
    return () => window.removeEventListener('languageChanged', handleLang);
  }, []);

  const fetchTeam = () => {
    setIsLoading(true);
    fetch('/api/team')
      .then(r => r.json())
      .then(res => { setUsers(res.data || []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => { fetchTeam(); }, []);

  const isEs = language === 'es';
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const permIcon = (key: string, size: number) => {
    if (key === 'canView') return <Eye size={size} />;
    if (key === 'canCopy') return <Copy size={size} />;
    if (key === 'canCreate') return <Plus size={size} />;
    if (key === 'canEdit') return <Edit size={size} />;
    if (key === 'canDelete') return <Trash2 size={size} />;
    if (key === 'extensionOnly') return <Puzzle size={size} />;
    return <Shield size={size} />;
  };

  const permLabel = (key: string) => {
    const labels: any = {
      canView: isEs ? 'Ver' : 'View',
      canCopy: isEs ? 'Copiar' : 'Copy',
      canCreate: isEs ? 'Crear' : 'Create',
      canEdit: isEs ? 'Editar' : 'Edit',
      canDelete: isEs ? 'Eliminar' : 'Delete',
      extensionOnly: isEs ? 'Solo ext.' : 'Ext. only'
    };
    return labels[key] || key;
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)', padding: '40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px' }}>
          {isEs ? 'Personas' : 'People'}
        </h1>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', width: '320px', backgroundColor: 'var(--bg-secondary)' }}>
            <Search size={16} color="var(--text-secondary)" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isEs ? 'Buscar por nombre o correo...' : 'Search by name or email...'}
              style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '0.85rem' }}
            />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {filteredUsers.length} {isEs ? 'miembro' : 'member'}{filteredUsers.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isEs ? 'Nombre' : 'Name'} <ArrowUp size={14} color="var(--accent-primary)" />
                  </div>
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isEs ? 'Correo electrónico' : 'Email'} <ArrowUpDown size={14} color="var(--text-tertiary)" />
                  </div>
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                  {isEs ? 'Bóvedas' : 'Vaults'}
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isEs ? 'Estado' : 'Status'} <ArrowUpDown size={14} color="var(--text-tertiary)" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>{isEs ? 'Cargando equipo...' : 'Loading team...'}</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>{isEs ? 'No se encontraron personas.' : 'No people found.'}</td></tr>
              ) : filteredUsers.map(user => (
                <React.Fragment key={user.id}>
                  <tr
                    style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: user.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem', flexShrink: 0 }}>
                          {user.initial}
                        </div>
                        <span style={{ fontWeight: 600 }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {user.vaults && user.vaults.length > 0 ? (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {user.vaults.map((vm: any) => (
                            <span key={vm.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '12px', backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', fontSize: '0.75rem', color: '#60a5fa', fontWeight: 500 }}>
                              <FolderLock size={10} /> {vm.vault.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{isEs ? 'Sin acceso' : 'No access'}</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 500, backgroundColor: user.status === 'Activo' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: user.status === 'Activo' ? '#10b981' : '#ef4444', border: `1px solid ${user.status === 'Activo' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                  {/* Expanded row: vault permissions detail */}
                  {expandedUser === user.id && user.vaults && user.vaults.length > 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '0 16px 16px', backgroundColor: 'var(--bg-primary)' }}>
                        <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Shield size={14} /> {isEs ? 'Permisos por bóveda' : 'Permissions by vault'}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {user.vaults.map((vm: any) => (
                              <div key={vm.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.7rem', flexShrink: 0 }}>
                                  {vm.vault.name.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: 600, fontSize: '0.85rem', minWidth: '100px' }}>{vm.vault.name}</span>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  {['canView', 'canCopy', 'canCreate', 'canEdit', 'canDelete', 'extensionOnly'].filter(k => vm[k]).map(k => (
                                    <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 500, backgroundColor: k === 'extensionOnly' ? 'rgba(249,115,22,0.1)' : 'rgba(139,92,246,0.1)', color: k === 'extensionOnly' ? '#f97316' : '#a78bfa', border: `1px solid ${k === 'extensionOnly' ? 'rgba(249,115,22,0.2)' : 'rgba(139,92,246,0.2)'}` }}>
                                      {permIcon(k, 10)} {permLabel(k)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
