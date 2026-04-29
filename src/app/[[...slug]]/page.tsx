'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import ItemList from '../../components/ItemList';
import ItemDetail from '../../components/ItemDetail';
import VaultForm from '../../components/VaultForm';
import ItemForm from '../../components/ItemForm';
import Watchtower from '../../components/Watchtower';
import PassEncrypt from '../../components/PassEncrypt';
import Settings from '../../components/Settings';
import People from '../../components/People';
import Invitations from '../../components/Invitations';
import VaultsAdmin from '../../components/VaultsAdmin';
import { PasswordItem, Vault } from '../../types';
import { usePathname } from 'next/navigation';

export default function Home() {
  const pathname = usePathname();
  const getInitialFilter = () => {
    if (!pathname || pathname === '/') return { type: 'all' };
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'item' && segments[1]) {
      return { type: 'item', id: segments[1] };
    }
    const path = segments[0];
    // If it's a known string-based filter type
    if (['favorites', 'watchtower', 'passencrypt', 'archived', 'settings', 'people', 'invitations', 'vaults_admin'].includes(path)) {
      return { type: path };
    }
    return { type: 'all' };
  };

  const [items, setItems] = useState<PasswordItem[]>([]);
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<{ type: string, id?: string, itemIds?: string[] }>(getInitialFilter());
  const [editingItem, setEditingItem] = useState<PasswordItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showVaultForm, setShowVaultForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [itemsRes, vaultsRes] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/vaults')
      ]);
      const itemsData = await itemsRes.json();
      const vaultsData = await vaultsRes.json();
      
      setItems(itemsData.data || []);
      setVaults(vaultsData.data || []);
      
      const initialFilter = getInitialFilter();
      if (initialFilter.type === 'item' && initialFilter.id) {
        setSelectedId(initialFilter.id);
      } else if (itemsData.data && itemsData.data.length > 0 && !selectedId) {
        setSelectedId(itemsData.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update selectedFilter if user navigates back/forward via browser buttons
  useEffect(() => {
    setSelectedFilter(getInitialFilter());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleSelectFilter = (filter: any) => {
    setSelectedFilter(filter);
    // Update URL without full page reload
    if (filter.type === 'all') {
      window.history.pushState(null, '', '/');
    } else if (filter.type === 'vault' || filter.type === 'tag') {
      // For specific vault or tag, could use query params, but keeping it simple for now
      window.history.pushState(null, '', '/');
    } else {
      window.history.pushState(null, '', `/${filter.type}`);
    }
  };

  const handleVaultCreated = () => {
    setShowVaultForm(false);
    fetchData();
  };

  const handleItemCreated = () => {
    setShowItemForm(false);
    fetchData();
  };

  const handleSelectItem = (id: string | null) => {
    setSelectedId(id);
    if (id) {
      window.history.pushState(null, '', `/item/${id}`);
    } else {
      handleSelectFilter(selectedFilter);
    }
  };

  const handleItemDeleted = (deletedId: string) => {
    setItems(items.filter(i => i.id !== deletedId));
    handleSelectItem(null);
  };

  const handleEditItem = (item: PasswordItem) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleArchiveItem = async (id: string, isArchived: boolean) => {
    try {
      await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived })
      });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite })
      });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDuplicate = async (item: PasswordItem) => {
    try {
      const { id, createdAt, updatedAt, ...rest } = item;
      await fetch(`/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rest, title: `${rest.title} (copia)` })
      });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleMoveVault = async (id: string, newVaultId: string) => {
    try {
      await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vaultId: newVaultId })
      });
      fetchData();
    } catch (e) { console.error(e); }
  };

  // Extract unique tags
  const uniqueTags = Array.from(new Set(items.flatMap(item => item.tags?.map(t => t.name) || [])));

  // Filter items
  const filteredItems = items.filter(item => {
    if (selectedFilter.type === 'item') return !item.isArchived; // Show all when coming from a permalink
    if (selectedFilter.type === 'all') return !item.isArchived;
    if (selectedFilter.type === 'archived') return item.isArchived;
    if (item.isArchived) return false; // Other filters exclude archived by default
    
    if (selectedFilter.type === 'favorites') return item.isFavorite;
    if (selectedFilter.type === 'vault') return item.vaultId === selectedFilter.id;
    if (selectedFilter.type === 'tag') return item.tags?.some(t => t.name === selectedFilter.id);
    if (selectedFilter.type === 'wt_custom' && selectedFilter.itemIds) {
      return selectedFilter.itemIds.includes(item.id);
    }
    return true;
  });

  const selectedItem = filteredItems.find(item => item.id === selectedId) || null;

  return (
    <>
      <Sidebar 
        vaults={vaults} 
        onAddVault={() => setShowVaultForm(true)} 
        selectedFilter={selectedFilter}
        onSelectFilter={handleSelectFilter}
        tags={uniqueTags}
      />
      {isLoading && items.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          Cargando elementos...
        </div>
      ) : selectedFilter.type === 'watchtower' ? (
        <Watchtower 
          items={items.filter(i => !i.isArchived)} 
          onFilter={(ids) => {
            setSelectedFilter({ type: 'wt_custom', itemIds: ids });
            if (ids.length > 0) setSelectedId(ids[0]);
          }}
        />
      ) : selectedFilter.type === 'passencrypt' ? (
        <PassEncrypt />
      ) : selectedFilter.type === 'settings' ? (
        <Settings />
      ) : selectedFilter.type === 'people' ? (
        <People />
      ) : selectedFilter.type === 'invitations' ? (
        <Invitations />
      ) : selectedFilter.type === 'vaults_admin' ? (
        <VaultsAdmin />
      ) : (
        <>
          <ItemList 
            items={filteredItems} 
            selectedId={selectedId} 
            onSelect={handleSelectItem} 
            onAddItem={() => { setEditingItem(null); setShowItemForm(true); }}
          />
          {selectedItem ? (
            <ItemDetail 
              item={selectedItem} 
              vaults={vaults}
              onDelete={handleItemDeleted} 
              onEdit={handleEditItem} 
              onArchive={handleArchiveItem} 
              onToggleFavorite={handleToggleFavorite}
              onDuplicate={handleDuplicate}
              onMoveVault={handleMoveVault}
            />
          ) : (
            <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Selecciona un elemento para ver sus detalles.
            </div>
          )}
        </>
      )}

      {showVaultForm && (
        <VaultForm onClose={() => setShowVaultForm(false)} onSuccess={handleVaultCreated} />
      )}

      {showItemForm && (
        <ItemForm 
          onClose={() => setShowItemForm(false)} 
          onSuccess={handleItemCreated} 
          initialData={editingItem} 
          vaultId={selectedFilter.type === 'vault' ? selectedFilter.id : vaults[0]?.id}
        />
      )}
    </>
  );
}
