'use client';

import React from 'react';
import { 
  Menu, KeyRound, Star, ShieldAlert, Archive, 
  FolderLock, Tag, Users, Settings, LogOut, Plus, Hash, Mail
} from 'lucide-react';
import { Vault } from '../types';
import { useRouter } from 'next/navigation';
import { translations } from '../utils/i18n';

interface SidebarProps {
  vaults: Vault[];
  onAddVault: () => void;
  selectedFilter: { type: string, id?: string };
  onSelectFilter: (filter: { type: 'all' | 'vault' | 'favorites' | 'watchtower' | 'passencrypt' | 'archived' | 'tag' | 'settings' | 'people' | 'invitations' | 'vaults_admin', id?: string }) => void;
  tags: string[];
}

export default function Sidebar({ vaults, onAddVault, selectedFilter, onSelectFilter, tags }: SidebarProps) {
  const router = useRouter();
  const [language, setLanguage] = React.useState('es');

  React.useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.language) {
          setLanguage(data.data.language);
        }
      })
      .catch(e => console.error(e));

    const handleLanguageChange = (e: any) => {
      setLanguage(e.detail.language);
    };
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const t = translations[language] || translations['es'];

  const handleLogout = () => {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div style={{ width: 24, height: 24, background: 'var(--accent-primary)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <KeyRound size={14} color="#fff" />
        </div>
        OpenPassword
      </div>
      
      <div className="sidebar-nav">
        <div className={`sidebar-item ${selectedFilter.type === 'all' || selectedFilter.type === 'item' ? 'active' : ''}`} onClick={() => onSelectFilter({ type: 'all' })}>
          <Menu size={18} />
          <span>{t.sidebarAllItems || 'Todos los elementos'}</span>
        </div>
        <div className={`sidebar-item ${selectedFilter.type === 'favorites' ? 'active' : ''}`} onClick={() => onSelectFilter({ type: 'favorites' })}>
          <Star size={18} />
          <span>{t.sidebarFavorites || 'Favoritos'}</span>
        </div>
        <div className={`sidebar-item ${selectedFilter.type === 'watchtower' ? 'active' : ''}`} onClick={() => onSelectFilter({ type: 'watchtower' })}>
          <ShieldAlert size={18} />
          <span>{t.sidebarWatchtower || 'Watchtower'}</span>
        </div>
        <div className={`sidebar-item ${selectedFilter.type === 'passencrypt' ? 'active' : ''}`} onClick={() => onSelectFilter({ type: 'passencrypt' })}>
          <Hash size={18} />
          <span>{t.sidebarPassEncrypt || 'PassEncrypt'}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '12px' }}>
          <div className="sidebar-section-title">{t.sidebarVaults || 'BÓVEDAS'}</div>
          <button onClick={onAddVault} style={{ color: 'var(--text-tertiary)', cursor: 'pointer' }} title="Nueva bóveda">
            <Plus size={16} />
          </button>
        </div>
        
        {vaults.map(vault => (
          <div className={`sidebar-item ${selectedFilter.type === 'vault' && selectedFilter.id === vault.id ? 'active' : ''}`} key={vault.id} onClick={() => onSelectFilter({ type: 'vault', id: vault.id })}>
            {vault.icon === 'Users' ? <Users size={18} /> : <FolderLock size={18} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span>{vault.name}</span>
              {/* @ts-expect-error - _count is from Prisma include */}
              <span style={{ fontSize: '0.75rem', color: selectedFilter.type === 'vault' && selectedFilter.id === vault.id ? 'rgba(255,255,255,0.7)' : 'var(--text-tertiary)' }}>{vault._count?.items || 0}</span>
            </div>
          </div>
        ))}

        {vaults.length === 0 && (
          <div className="sidebar-item" style={{ opacity: 0.5 }}>
            <FolderLock size={18} />
            <span>{t.sidebarPersonal || 'Personal'}</span>
          </div>
        )}

        <div className={`sidebar-item ${selectedFilter.type === 'archived' ? 'active' : ''}`} onClick={() => onSelectFilter({ type: 'archived' })}>
          <Archive size={18} />
          <span>{t.sidebarArchived || 'Archivados'}</span>
        </div>

        {tags.length > 0 && (
          <>
            <div className="sidebar-section-title">{t.sidebarTags || 'ETIQUETAS'}</div>
            {tags.map(tag => (
              <div className={`sidebar-item ${selectedFilter.type === 'tag' && selectedFilter.id === tag ? 'active' : ''}`} key={tag} onClick={() => onSelectFilter({ type: 'tag', id: tag })}>
                <Tag size={18} />
                <span>{tag}</span>
              </div>
            ))}
          </>
        )}
      </div>

      <div style={{ padding: '10px', borderTop: '1px solid var(--border-color)' }}>
        <div className="sidebar-section-title">{t.sidebarAdmin || 'ADMINISTRACIÓN'}</div>
        <div className={`sidebar-item ${selectedFilter.type === 'people' ? 'active' : ''}`} onClick={() => onSelectFilter({ type: 'people' })}>
          <Users size={18} />
          <span>{t.sidebarPeople || 'Personas'}</span>
        </div>
        <div className={`sidebar-item ${selectedFilter.type === 'invitations' ? 'active' : ''}`} onClick={() => onSelectFilter({ type: 'invitations' })}>
          <Mail size={18} />
          <span>{t.sidebarInvitations || 'Invitaciones'}</span>
        </div>
        <div className={`sidebar-item ${selectedFilter.type === 'vaults_admin' ? 'active' : ''}`} onClick={() => onSelectFilter({ type: 'vaults_admin' })}>
          <FolderLock size={18} />
          <span>{t.sidebarVaultsAdmin || 'Bóvedas'}</span>
        </div>
        <div className={`sidebar-item ${selectedFilter.type === 'settings' ? 'active' : ''}`} onClick={() => onSelectFilter({ type: 'settings' })}>
          <Settings size={18} />
          <span>{t.sidebarSettings || 'Configuración'}</span>
        </div>
        <div className="sidebar-item" onClick={handleLogout} style={{ cursor: 'pointer', marginTop: '8px' }}>
          <LogOut size={18} />
          <span>{t.sidebarLogout || 'Cerrar sesión'}</span>
        </div>
      </div>
    </div>
  );
}
