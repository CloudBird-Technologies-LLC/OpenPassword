import React, { useState } from 'react';
import { Vault } from '../types';
import { Copy, Edit2, Share, CheckCircle2, Fingerprint, Lock, Shield, CreditCard, FileText, FileBadge, KeyRound, MoreVertical, Star, FolderOutput, CopyPlus, History, Archive, Trash2, ChevronDown, Eye, EyeOff, X } from 'lucide-react';
import OTPDisplay from './OTPDisplay';
import { customAlert, customConfirm } from './GlobalModals';
import { translations } from '../utils/i18n';

interface ItemDetailProps {
  item: PasswordItem;
  vaults: Vault[];
  onDelete: (id: string) => void;
  onEdit: (item: PasswordItem) => void;
  onArchive: (id: string, isArchived: boolean) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onDuplicate: (item: PasswordItem) => void;
  onMoveVault: (id: string, vaultId: string) => void;
}

export default function ItemDetail({ item, onDelete, onEdit, onArchive, onToggleFavorite, onDuplicate, onMoveVault, vaults }: ItemDetailProps) {
  const [language, setLanguage] = useState('es');

  React.useEffect(() => {
    fetch('/api/user').then(res => res.json()).then(data => {
      if (data.data && data.data.language) setLanguage(data.data.language);
    }).catch(() => {});
    const handleLang = (e: any) => setLanguage(e.detail.language);
    window.addEventListener('languageChanged', handleLang);
    return () => window.removeEventListener('languageChanged', handleLang);
  }, []);

  const t = translations[language] || translations['es'];

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [shareExpiresIn, setShareExpiresIn] = useState(7);
  const [shareViewOnce, setShareViewOnce] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareGeneratedUrl, setShareGeneratedUrl] = useState<string | null>(null);

  const handleGenerateShareLink = async () => {
    setIsSharing(true);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          expiresInDays: shareExpiresIn,
          viewOnce: shareViewOnce
        })
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setShareGeneratedUrl(data.url);
      } else {
        customAlert('Error al generar enlace', true);
      }
    } catch (e) {
      console.error(e);
      customAlert('Error al generar enlace', true);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDelete = () => {
    customConfirm(t.areYouSureDelete || '¿Estás seguro de que quieres eliminar este elemento?', async () => {
      await fetch(`/api/items/${item.id}`, { method: 'DELETE' });
      onDelete(item.id);
    });
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  let parsedCustomFields: any[] = [];
  if (item.customFields) {
    try {
      parsedCustomFields = JSON.parse(item.customFields);
    } catch (e) { }
  }

  const getIcon = (size = 48) => {
    if (item.url) {
      return <img src={`https://www.google.com/s2/favicons?domain=${item.url}&sz=128`} alt="" style={{ width: size, height: size, borderRadius: '8px', objectFit: 'contain' }} />;
    }
    return <span style={{ fontSize: `${size * 0.6}px`, fontWeight: 'bold', color: 'var(--text-primary)' }}>{item.title.charAt(0).toUpperCase()}</span>;
  };

  const currentVault = vaults.find(v => v.id === item.vaultId);

  return (
    <div className="item-detail" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {/* Breadcrumb */}
          <div style={{ width: '20px', height: '20px', backgroundColor: '#3b82f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={12} color="white" />
          </div>
          <span>{currentVault ? currentVault.name : (t.privateVault || 'Bóveda Privada')}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', position: 'relative' }}>
        <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Share size={16} /> {t.share || 'Compartir'}
        </button>
        <button onClick={() => onEdit(item)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Edit2 size={16} /> {t.edit || 'Editar'}
        </button>
        <button onClick={() => setShowMenu(!showMenu)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MoreVertical size={16} />
        </button>

        {showMenu && (
          <div style={{ position: 'absolute', top: '30px', right: '0', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', width: '220px', zIndex: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', padding: '8px 0' }}>
            <div onClick={() => { setShowShareModal(true); setShowMenu(false); }} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}><Share size={16} /> {t.share || 'Compartir'}</div>
            <div onClick={() => { onToggleFavorite(item.id, !item.isFavorite); setShowMenu(false); }} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: item.isFavorite ? '#eab308' : 'inherit' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}><Star size={16} fill={item.isFavorite ? '#eab308' : 'none'} /> {item.isFavorite ? (t.removeFromFavorites || 'Quitar de favoritos') : (t.addToFavorites || 'Añadir a favoritos')}</div>
            <div onClick={() => { setShowMoveModal(true); setShowMenu(false); }} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}><FolderOutput size={16} /> {t.move || 'Mover...'}</div>
            <div onClick={() => { onDuplicate(item); setShowMenu(false); }} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}><CopyPlus size={16} /> {t.duplicate || 'Duplicar...'}</div>
            <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '8px 0' }}></div>
            <div onClick={() => { handleCopy(`${window.location.origin}/item/${item.id}`, 'share'); setShowMenu(false); }} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}><Copy size={16} /> <div style={{ display: 'flex', flexDirection: 'column' }}><span>{t.copyPrivateLink || 'Copiar enlace privado'}</span><span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{t.justForYou || 'solo para ti'}</span></div></div>
            <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '8px 0' }}></div>
            <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}><History size={16} /> {t.viewHistory || 'Ver historial'}</div>
            <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '8px 0' }}></div>
            <div onClick={() => { onArchive(item.id, !item.isArchived); setShowMenu(false); }} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}><Archive size={16} /> {item.isArchived ? (t.unarchive || 'Desarchivar') : (t.archive || 'Archivar')}</div>
            <div onClick={handleDelete} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#ef4444' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}><Trash2 size={16} /> {t.delete || 'Eliminar'}</div>
          </div>
        )}
        </div>
      </div>

      <div style={{ maxWidth: '700px', width: '100%', margin: '0 auto', padding: '0 40px', paddingBottom: '60px' }}>
        {/* Title Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
          <div style={{ width: '96px', height: '96px', backgroundColor: 'white', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            {getIcon(64)}
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '-0.5px' }}>{item.title}</h1>
        </div>

        {/* Main Details Block */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '30px', overflow: 'hidden' }}>
          
          {item.username && (
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>nombre de usuario</div>
              <div style={{ fontSize: '1.1rem' }}>{item.username}</div>
              <button onClick={() => handleCopy(item.username!, 'username')} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                {copiedField === 'username' ? <CheckCircle2 size={18} color="#10b981" /> : <Copy size={18} />}
              </button>
            </div>
          )}

          {item.password && (
            <div style={{ padding: '16px 24px', borderBottom: item.otpSecret || item.passkey ? '1px solid var(--border-color)' : 'none', position: 'relative' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>contraseña</div>
              <div style={{ fontSize: '1.4rem', letterSpacing: showPassword ? 'normal' : '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: showPassword ? 'inherit' : 'monospace' }}>
                <span style={{ fontSize: showPassword ? '1.1rem' : '1.4rem', wordBreak: 'break-all' }}>{showPassword ? item.password : '••••••••••••'}</span>
                
                {/* Copiar button like screenshot 4 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <button onClick={() => handleCopy(item.password!, 'password')} style={{ backgroundColor: '#1e3a8a', border: '1px solid #1e40af', borderRadius: '8px', padding: '6px 12px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', letterSpacing: 'normal' }}>
                    {copiedField === 'password' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    {copiedField === 'password' ? (t.copied || 'Copiado') : (t.copy || 'Copiar')}
                    <div style={{ width: '1px', height: '14px', backgroundColor: '#3b82f6', margin: '0 4px' }}></div>
                    <ChevronDown size={14} />
                  </button>

                  <span style={{ fontSize: '0.8rem', letterSpacing: 'normal', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {t.fantastic || 'Fantástico'} <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }}></div>
                  </span>
                </div>
              </div>
            </div>
          )}

          {item.passkey && (
             <div style={{ padding: '16px 24px', borderBottom: item.otpSecret ? '1px solid var(--border-color)' : 'none', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <Fingerprint size={24} color="#10b981" />
                 <div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>clave de acceso (passkey)</div>
                   <div style={{ fontSize: '1.1rem', color: '#10b981', fontWeight: 500 }}>{t.passkeyAvailable || 'Disponible para inicio de sesión'}</div>
                 </div>
               </div>
             </div>
          )}

          {item.otpSecret && (
            <div style={{ padding: '16px 24px', borderBottom: item.url ? '1px solid var(--border-color)' : 'none', position: 'relative' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>one-time password</div>
              <OTPDisplay secret={item.otpSecret} />
            </div>
          )}

          {/* URL Block moved inside the main block */}
          {item.url && (
            <div style={{ padding: '16px 24px', position: 'relative' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>website</div>
              <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '1.1rem' }}>
                {item.url}
              </a>
            </div>
          )}
        </div>

        {/* Custom Fields */}
        {parsedCustomFields.length > 0 && (
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '30px', overflow: 'hidden' }}>
            {parsedCustomFields.map((field, idx) => (
              <div key={field.id} style={{ padding: '16px 24px', borderBottom: idx !== parsedCustomFields.length - 1 ? '1px solid var(--border-color)' : 'none', position: 'relative' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{field.label.toLowerCase()}</div>
                <div style={{ fontSize: '1.1rem' }}>{field.value}</div>
                <button onClick={() => handleCopy(field.value, field.id)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  {copiedField === field.id ? <CheckCircle2 size={18} color="#10b981" /> : <Copy size={18} />}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <div style={{ padding: '0 8px', marginBottom: '30px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>notas</div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem' }}>
              {item.notes}
            </div>
          </div>
        )}

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '40px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {t.lastEdited || 'Última edición'} {new Date(item.updatedAt).toLocaleString()}
        </div>

      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '450px', backgroundColor: 'var(--bg-tertiary)', padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>{t.shareTitle || 'Comparte un enlace a este elemento'}</h2>
              <button onClick={() => { setShowShareModal(false); setShareGeneratedUrl(null); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', padding: '8px' }}>
                <X size={16} />
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: item.url ? 'white' : 'var(--bg-tertiary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {getIcon(24)}
              </div>
              <div>
                <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.username || item.url || ''}</div>
              </div>
            </div>

            {shareGeneratedUrl ? (
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t.shareSuccess || 'Enlace generado con éxito:'}</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input 
                    type="text" 
                    readOnly 
                    value={shareGeneratedUrl} 
                    style={{ flex: 1, padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none' }}
                  />
                  <button 
                    onClick={() => handleCopy(shareGeneratedUrl, 'shareUrl')}
                    style={{ backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {copiedField === 'shareUrl' ? <CheckCircle2 size={16} /> : <Copy size={16} />} 
                    {copiedField === 'shareUrl' ? (t.copied || 'Copiado') : (t.copy || 'Copiar')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t.linkExpires || 'El enlace caduca después de'}</div>
                    <select 
                      value={shareExpiresIn} 
                      onChange={(e) => setShareExpiresIn(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none' }}
                    >
                      <option value={7}>{t.days7 || '7 días'}</option>
                      <option value={1}>{t.day1 || '1 día'}</option>
                      <option value={30}>{t.days30 || '30 días'}</option>
                    </select>
                  </div>
                  <div style={{ flex: 2 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t.availableFor || 'Disponible para'}</div>
                    <select style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none' }}>
                      <option>{t.anyoneWithLink || 'Cualquier persona con el enlace'}</option>
                      <option disabled>{t.specificPeople || 'Solo personas especificadas'}</option>
                    </select>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={shareViewOnce}
                    onChange={(e) => setShareViewOnce(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }} 
                  />
                  <span style={{ fontSize: '0.9rem' }}>{t.viewOnce || 'Solo se puede ver 1 vez'}</span>
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={handleGenerateShareLink} 
                    disabled={isSharing}
                    style={{ backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', cursor: isSharing ? 'not-allowed' : 'pointer', opacity: isSharing ? 0.7 : 1 }}
                  >
                    <Share size={16} /> {isSharing ? (t.generating || 'Generando...') : (t.createLink || 'Crear enlace')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Move Vault Modal */}
      {showMoveModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '400px', backgroundColor: 'var(--bg-tertiary)', padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>{t.moveToVault || 'Mover a otra bóveda'}</h2>
              <button onClick={() => setShowMoveModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {vaults.map(v => (
                <div 
                  key={v.id} 
                  onClick={() => { onMoveVault(item.id, v.id); setShowMoveModal(false); }}
                  style={{ padding: '12px 16px', backgroundColor: item.vaultId === v.id ? 'var(--bg-hover)' : 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: item.vaultId === v.id ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
                  onMouseOver={e => item.vaultId !== v.id && (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                  onMouseOut={e => item.vaultId !== v.id && (e.currentTarget.style.backgroundColor = 'var(--bg-primary)')}
                >
                  <Lock size={16} />
                  <span>{v.name}</span>
                  {item.vaultId === v.id && <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.current || '(Actual)'}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
