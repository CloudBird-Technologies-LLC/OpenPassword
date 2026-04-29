'use client';

import React from 'react';
import { Search, Plus } from 'lucide-react';
import { PasswordItem } from '../types';
import { translations } from '../utils/i18n';

interface ItemListProps {
  items: PasswordItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddItem: () => void;
}

export default function ItemList({ items, selectedId, onSelect, onAddItem }: ItemListProps) {
  const [language, setLanguage] = React.useState('es');

  React.useEffect(() => {
    fetch('/api/user').then(res => res.json()).then(data => {
      if (data.data && data.data.language) setLanguage(data.data.language);
    }).catch(() => {});
    const handleLang = (e: any) => setLanguage(e.detail.language);
    window.addEventListener('languageChanged', handleLang);
    return () => window.removeEventListener('languageChanged', handleLang);
  }, []);

  const t = translations[language] || translations['es'];

  return (
    <div className="item-list-container">
      <div className="search-bar">
        <div className="search-input-wrapper">
          <Search size={16} color="var(--text-secondary)" />
          <input 
            type="text" 
            className="search-input" 
            placeholder={t.search || "Buscar..."} 
          />
        </div>
      </div>
      
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{items.length} {t.itemsCount || 'elementos'}</span>
        <button className="button" onClick={onAddItem} style={{ padding: '4px 8px' }} title={t.newItem || "Nuevo elemento"}>
          <Plus size={16} />
        </button>
      </div>

      <div className="item-list">
        {items.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {t.noItems || 'No hay elementos. Haz clic en + para añadir uno.'}
          </div>
        )}
        {items.map(item => (
          <div 
            key={item.id} 
            className={`list-item ${selectedId === item.id ? 'active' : ''}`}
            onClick={() => onSelect(item.id)}
          >
            <div className="item-icon" style={{ backgroundColor: item.url ? 'white' : 'var(--bg-tertiary)' }}>
              {item.url ? (
                <img src={`https://www.google.com/s2/favicons?domain=${item.url}&sz=64`} alt="" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
              ) : (
                item.title.charAt(0).toUpperCase()
              )}
            </div>
            <div className="item-info">
              <div className="item-title">{item.title}</div>
              <div className="item-subtitle">{item.username || item.url || (t.noDetails || 'Sin detalles')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
