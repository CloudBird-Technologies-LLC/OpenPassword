import React, { useState, useEffect } from 'react';
import { Plus, Search, ArrowUp, ArrowUpDown, RefreshCw, Edit, Trash2, X, FolderLock, Users, Save, AlertTriangle, UserPlus, Shield, Eye, EyeOff, Copy, Check, Puzzle } from 'lucide-react';
import { translations } from '../utils/i18n';

export default function VaultsAdmin() {
  const [vaults, setVaults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('es');
  const t = translations[language] || translations['es'];

  // Edit state
  const [editingVault, setEditingVault] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirmation state
  const [deletingVault, setDeletingVault] = useState<any | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Create inline state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newVaultName, setNewVaultName] = useState('');
  const [creating, setCreating] = useState(false);

  // Members management state
  const [managingVault, setManagingVault] = useState<any | null>(null);
  const [vaultMembers, setVaultMembers] = useState<any[]>([]);
  const [allTeamMembers, setAllTeamMembers] = useState<any[]>([]);
  const [addingMember, setAddingMember] = useState(false);
  const [selectedNewMember, setSelectedNewMember] = useState('');

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => { if (data.data?.language) setLanguage(data.data.language); })
      .catch(() => {});

    const handleLang = (e: any) => setLanguage(e.detail.language);
    window.addEventListener('languageChanged', handleLang);
    return () => window.removeEventListener('languageChanged', handleLang);
  }, []);

  const fetchVaults = async () => {
    try {
      const res = await fetch('/api/vaults?all=true');
      const data = await res.json();
      setVaults(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchVaults(); }, []);

  const toggleSafeForTravel = async (id: string, currentVal: boolean) => {
    try {
      await fetch(`/api/vaults/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ safeForTravel: !currentVal })
      });
      fetchVaults();
    } catch (e) { console.error(e); }
  };

  const handleStartEdit = (vault: any) => {
    setEditingVault(vault);
    setEditName(vault.name);
    setEditIcon(vault.icon || 'FolderLock');
  };

  const handleSaveEdit = async () => {
    if (!editingVault || !editName.trim()) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/vaults/${editingVault.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), icon: editIcon })
      });
      if (res.ok) {
        setEditingVault(null);
        fetchVaults();
      }
    } catch (e) { console.error(e); }
    setEditSaving(false);
  };

  const handleDelete = async () => {
    if (!deletingVault) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/vaults/${deletingVault.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeletingVault(null);
        setDeleteConfirmText('');
        fetchVaults();
        // Dispatch event so sidebar refreshes
        window.dispatchEvent(new CustomEvent('vaultsUpdated'));
      }
    } catch (e) { console.error(e); }
    setDeleting(false);
  };

  const handleCreate = async () => {
    if (!newVaultName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/vaults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newVaultName.trim(), icon: 'FolderLock' })
      });
      if (res.ok) {
        setNewVaultName('');
        setShowCreateForm(false);
        fetchVaults();
        window.dispatchEvent(new CustomEvent('vaultsUpdated'));
      }
    } catch (e) { console.error(e); }
    setCreating(false);
  };

  // ---- Members handlers ----
  const openMembers = async (vault: any) => {
    setManagingVault(vault);
    const [membersRes, teamRes] = await Promise.all([
      fetch(`/api/vaults/${vault.id}/members`),
      fetch('/api/team')
    ]);
    const membersData = await membersRes.json();
    const teamData = await teamRes.json();
    setVaultMembers(membersData.data || []);
    setAllTeamMembers(teamData.data || []);
    setSelectedNewMember('');
  };

  const handleAddMember = async () => {
    if (!selectedNewMember || !managingVault) return;
    setAddingMember(true);
    try {
      await fetch(`/api/vaults/${managingVault.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamMemberId: selectedNewMember })
      });
      openMembers(managingVault);
    } catch (e) { console.error(e); }
    setAddingMember(false);
  };

  const handleUpdatePermission = async (memberId: string, field: string, value: boolean) => {
    if (!managingVault) return;
    const payload: any = { [field]: value };
    if (field === 'extensionOnly' && value) {
      payload.canView = false;
      payload.canCopy = false;
    }
    if ((field === 'canView' || field === 'canCopy') && value) {
      payload.extensionOnly = false;
    }
    await fetch(`/api/vaults/${managingVault.id}/members/${memberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    openMembers(managingVault);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!managingVault) return;
    await fetch(`/api/vaults/${managingVault.id}/members/${memberId}`, { method: 'DELETE' });
    openMembers(managingVault);
  };

  const filteredVaults = vaults.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isEs = language === 'es';
  const assignedIds = vaultMembers.map(m => m.teamMemberId);
  const availableMembers = allTeamMembers.filter(tm => !assignedIds.includes(tm.id));

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)', padding: '40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px' }}>
          {isEs ? 'Bóvedas' : 'Vaults'}
        </h1>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'var(--accent-primary)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
          >
            <Plus size={16} /> {isEs ? 'Nueva bóveda' : 'New vault'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>{filteredVaults.length} {isEs ? 'bóveda' : 'vault'}{filteredVaults.length !== 1 ? 's' : ''}</span>
            <RefreshCw size={16} style={{ cursor: 'pointer' }} onClick={fetchVaults} />
          </div>
        </div>

        {/* Create form inline */}
        {showCreateForm && (
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-color)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FolderLock size={20} color='var(--accent-primary)' />
            <input
              autoFocus
              value={newVaultName}
              onChange={e => setNewVaultName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder={isEs ? 'Nombre de la bóveda...' : 'Vault name...'}
              style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
            />
            <button onClick={handleCreate} disabled={creating} style={{ padding: '10px 20px', background: 'var(--accent-primary)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              {creating ? '...' : (isEs ? 'Crear' : 'Create')}
            </button>
            <button onClick={() => { setShowCreateForm(false); setNewVaultName(''); }} style={{ padding: '10px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <X size={16} />
            </button>
          </div>
        )}

        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          
          {/* Search bar */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', width: '300px', backgroundColor: 'var(--bg-primary)' }}>
              <Search size={16} color="var(--text-secondary)" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isEs ? 'Buscar bóvedas...' : 'Search vaults...'}
                style={{ border: 'none', background: 'transparent', color: 'white', width: '100%', outline: 'none', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Table */}
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
                    {isEs ? 'Elementos' : 'Items'} <ArrowUpDown size={14} color="var(--text-tertiary)" />
                  </div>
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isEs ? 'Actualizado' : 'Updated'} <ArrowUpDown size={14} color="var(--text-tertiary)" />
                  </div>
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                  {isEs ? 'Miembros' : 'Members'}
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 'bold', textAlign: 'center' }}>
                  {isEs ? 'Modo Viaje' : 'Travel Mode'}
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 'bold', textAlign: 'center' }}>
                  {isEs ? 'Acciones' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredVaults.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    <FolderLock size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.9rem' }}>{isEs ? 'No hay bóvedas.' : 'No vaults found.'}</p>
                  </td>
                </tr>
              ) : filteredVaults.map((vault) => (
                <tr key={vault.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                  onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Name cell */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        backgroundColor: vault.icon === 'Users' ? '#8b5cf6' : '#3b82f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0
                      }}>
                        {vault.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{vault.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {new Date(vault.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Items count */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      minWidth: '28px', height: '24px', padding: '0 8px',
                      backgroundColor: 'var(--bg-primary)', borderRadius: '12px',
                      fontSize: '0.8rem', fontWeight: 600,
                      border: '1px solid var(--border-color)'
                    }}>
                      {vault._count?.items || 0}
                    </span>
                  </td>

                  {/* Updated date */}
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {new Date(vault.updatedAt).toLocaleDateString()}
                  </td>

                  {/* Members avatars */}
                  <td style={{ padding: '14px 16px' }}>
                    {vault.members && vault.members.length > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {vault.members.slice(0, 4).map((m: any, idx: number) => (
                          <div key={m.id} title={m.teamMember.name} style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: m.teamMember.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.65rem', border: '2px solid var(--bg-secondary)', marginLeft: idx > 0 ? '-8px' : '0', zIndex: 5 - idx }}>
                            {m.teamMember.initial}
                          </div>
                        ))}
                        {(vault._count?.members || 0) > 4 && (
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 600, marginLeft: '-8px', border: '2px solid var(--bg-secondary)', color: 'var(--text-secondary)' }}>+{(vault._count?.members || 0) - 4}</div>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>—</span>
                    )}
                  </td>

                  {/* Travel mode toggle */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div 
                      onClick={() => toggleSafeForTravel(vault.id, vault.safeForTravel)}
                      style={{
                        margin: '0 auto', width: '40px', height: '22px',
                        backgroundColor: vault.safeForTravel ? '#10b981' : 'var(--bg-tertiary)',
                        borderRadius: '11px', position: 'relative', cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      title={isEs ? 'Marcar como Segura para Viajes' : 'Mark as Safe for Travel'}
                    >
                      <div style={{
                        width: '16px', height: '16px', backgroundColor: 'white',
                        borderRadius: '8px', position: 'absolute', top: '3px',
                        left: vault.safeForTravel ? '21px' : '3px', transition: 'left 0.2s'
                      }} />
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleStartEdit(vault)}
                        title={isEs ? 'Editar' : 'Edit'}
                        style={{ padding: '6px 10px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; e.currentTarget.style.color = '#60a5fa'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => openMembers(vault)}
                        title={isEs ? 'Miembros' : 'Members'}
                        style={{ padding: '6px 10px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; e.currentTarget.style.color = '#a78bfa'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        <Users size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingVault(vault)}
                        title={isEs ? 'Eliminar' : 'Delete'}
                        style={{ padding: '6px 10px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#ef4444'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== EDIT MODAL ========== */}
      {editingVault && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '32px', borderRadius: '16px', width: '440px', border: '1px solid var(--border-color)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {isEs ? 'Editar bóveda' : 'Edit vault'}
              </h2>
              <button onClick={() => setEditingVault(null)} style={{ padding: '8px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {isEs ? 'Nombre' : 'Name'}
                </label>
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                  style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {isEs ? 'Icono' : 'Icon'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['FolderLock', 'Users'].map(ico => (
                    <button
                      key={ico}
                      onClick={() => setEditIcon(ico)}
                      style={{
                        padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
                        border: `2px solid ${editIcon === ico ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                        backgroundColor: editIcon === ico ? 'rgba(59,130,246,0.1)' : 'var(--bg-primary)',
                        color: editIcon === ico ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 500
                      }}
                    >
                      {ico === 'FolderLock' ? <FolderLock size={16} /> : <Users size={16} />}
                      {ico === 'FolderLock' ? (isEs ? 'Personal' : 'Personal') : (isEs ? 'Compartida' : 'Shared')}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button onClick={() => setEditingVault(null)} style={{ padding: '10px 20px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>
                  {isEs ? 'Cancelar' : 'Cancel'}
                </button>
                <button onClick={handleSaveEdit} disabled={editSaving || !editName.trim()} style={{ padding: '10px 20px', background: 'var(--accent-primary)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', opacity: editSaving || !editName.trim() ? 0.5 : 1 }}>
                  <Save size={14} /> {editSaving ? '...' : (isEs ? 'Guardar' : 'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== DELETE CONFIRMATION MODAL ========== */}
      {deletingVault && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '32px', borderRadius: '16px', width: '480px', border: '1px solid var(--border-color)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={22} color="#ef4444" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  {isEs ? 'Eliminar bóveda' : 'Delete vault'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  {isEs ? 'Esta acción no se puede deshacer.' : 'This action cannot be undone.'}
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                {isEs
                  ? <>Se eliminará la bóveda <strong>{deletingVault.name}</strong> y todos sus <strong>{deletingVault._count?.items || 0} elementos</strong> de forma permanente.</>
                  : <>The vault <strong>{deletingVault.name}</strong> and all its <strong>{deletingVault._count?.items || 0} items</strong> will be permanently deleted.</>
                }
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {isEs
                  ? <>Escribe <strong>{deletingVault.name}</strong> para confirmar:</>
                  : <>Type <strong>{deletingVault.name}</strong> to confirm:</>
                }
              </label>
              <input
                autoFocus
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder={deletingVault.name}
                style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => { setDeletingVault(null); setDeleteConfirmText(''); }} style={{ padding: '10px 20px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>
                {isEs ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== deletingVault.name || deleting}
                style={{
                  padding: '10px 20px', background: '#ef4444', border: 'none', borderRadius: '8px',
                  color: '#fff', cursor: 'pointer', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '6px',
                  opacity: deleteConfirmText !== deletingVault.name || deleting ? 0.4 : 1,
                  transition: 'opacity 0.2s'
                }}
              >
                <Trash2 size={14} /> {deleting ? '...' : (isEs ? 'Eliminar definitivamente' : 'Delete permanently')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MEMBERS MODAL ========== */}
      {managingVault && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '32px', borderRadius: '16px', width: '640px', maxHeight: '80vh', overflowY: 'auto', border: '1px solid var(--border-color)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} color='#a78bfa' />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{isEs ? 'Miembros de' : 'Members of'} {managingVault.name}</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>{isEs ? 'Gestiona accesos y permisos' : 'Manage access and permissions'}</p>
                </div>
              </div>
              <button onClick={() => setManagingVault(null)} style={{ padding: '8px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={16} /></button>
            </div>

            {/* Add member */}
            {availableMembers.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <select value={selectedNewMember} onChange={e => setSelectedNewMember(e.target.value)} style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  <option value=''>{isEs ? 'Seleccionar miembro...' : 'Select member...'}</option>
                  {availableMembers.map(tm => (<option key={tm.id} value={tm.id}>{tm.name} ({tm.email})</option>))}
                </select>
                <button onClick={handleAddMember} disabled={!selectedNewMember || addingMember} style={{ padding: '10px 16px', background: 'var(--accent-primary)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', opacity: !selectedNewMember ? 0.5 : 1 }}>
                  <UserPlus size={14} /> {isEs ? 'Agregar' : 'Add'}
                </button>
              </div>
            )}

            {/* Members list */}
            {vaultMembers.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <Users size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p>{isEs ? 'No hay miembros asignados a esta bóveda.' : 'No members assigned to this vault.'}</p>
              </div>
            ) : vaultMembers.map(m => (
              <div key={m.id} style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '12px', backgroundColor: 'var(--bg-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: m.teamMember.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8rem' }}>{m.teamMember.initial}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.teamMember.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{m.teamMember.email}</div>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveMember(m.id)} title={isEs ? 'Quitar' : 'Remove'} style={{ padding: '6px 10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', borderRadius: '6px' }} onMouseOver={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')} onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                    <Trash2 size={14} />
                  </button>
                </div>
                {/* Permissions grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { key: 'canView', label: isEs ? 'Ver' : 'View', icon: <Eye size={13} />, color: '#3b82f6' },
                    { key: 'canCopy', label: isEs ? 'Copiar' : 'Copy', icon: <Copy size={13} />, color: '#10b981' },
                    { key: 'canCreate', label: isEs ? 'Crear' : 'Create', icon: <Plus size={13} />, color: '#f59e0b' },
                    { key: 'canEdit', label: isEs ? 'Editar' : 'Edit', icon: <Edit size={13} />, color: '#8b5cf6' },
                    { key: 'canDelete', label: isEs ? 'Eliminar' : 'Delete', icon: <Trash2 size={13} />, color: '#ef4444' },
                    { key: 'extensionOnly', label: isEs ? 'Solo extensión' : 'Extension only', icon: <Puzzle size={13} />, color: '#f97316' },
                  ].map(perm => {
                    const active = m[perm.key];
                    return (
                      <button key={perm.key} onClick={() => handleUpdatePermission(m.id, perm.key, !active)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', borderRadius: '8px', border: `1px solid ${active ? perm.color + '44' : 'var(--border-color)'}`, background: active ? perm.color + '15' : 'transparent', color: active ? perm.color : 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500, transition: 'all 0.15s' }}>
                        {active ? <Check size={13} /> : perm.icon} {perm.label}
                      </button>
                    );
                  })}
                </div>
                {m.extensionOnly && (
                  <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', fontSize: '0.75rem', color: '#f97316', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Puzzle size={12} /> {isEs ? 'Este usuario solo podrá usar credenciales a través de la extensión del navegador, sin ver las contraseñas.' : 'This user can only use credentials through the browser extension, without seeing passwords.'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
