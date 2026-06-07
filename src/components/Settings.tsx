import React, { useState, useEffect } from 'react';
import { 
  User, Edit, Mail, KeyRound, Shield, Plane, Lock, QrCode, 
  Download, Smartphone, Monitor, MoreHorizontal, CheckSquare, 
  Square, ChevronRight, Globe, Info, Printer, Save, X, Key, Plus, Trash2, Copy, Eye, EyeOff
} from 'lucide-react';
import ApiDocs from './ApiDocsModal';
import { customAlert } from './GlobalModals';
import { translations } from '../utils/i18n';

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [travelMode, setTravelMode] = useState(false);
  const [shareData, setShareData] = useState(false);
  const [autoLock, setAutoLock] = useState('1 hora');
  const [showQR, setShowQR] = useState(true);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [tempRecoveryCode, setTempRecoveryCode] = useState('');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [confirmedInfo, setConfirmedInfo] = useState(false);
  const [showUsageDetails, setShowUsageDetails] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [activeDeviceMenu, setActiveDeviceMenu] = useState<string | null>(null);
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [smtpForm, setSmtpForm] = useState({ host: '', port: '', user: '', pass: '' });
  
  // New Modals State
  const [activeView, setActiveView] = useState<'general' | 'api' | 'smtp' | 'apikeys'>('general');
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const t = translations[language];

  // API Keys state
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState('read');
  const [newKeyExpiry, setNewKeyExpiry] = useState('never');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [keyNameError, setKeyNameError] = useState('');
  const [showCreatedKey, setShowCreatedKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchApiKeys = async () => {
    try {
      const res = await fetch('/api/apikeys');
      const data = await res.json();
      if (data.data) setApiKeys(data.data);
    } catch (e) { console.error(e); }
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) { setKeyNameError('El nombre es obligatorio.'); return; }
    setKeyNameError('');
    const expiresInDays = newKeyExpiry === 'never' ? undefined
      : newKeyExpiry === '30d' ? 30
      : newKeyExpiry === '90d' ? 90
      : newKeyExpiry === '1y' ? 365 : undefined;

    try {
      const res = await fetch('/api/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim(), scopes: newKeyScopes, expiresInDays }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedKey(data.data.key);
        setShowCreatedKey(true);
        setCopiedKey(false);
        setNewKeyName('');
        fetchApiKeys();
      } else {
        customAlert(data.error || 'Error al crear la API key.', true);
      }
    } catch (e) { console.error(e); }
  };

  const handleRevokeApiKey = async (id: string) => {
    try {
      const res = await fetch(`/api/apikeys/${id}`, { method: 'DELETE' });
      if (res.ok) setApiKeys(prev => prev.filter(k => k.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleCopyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: 'CloudBird Technologies', avatarUrl: '' });
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  
  const [showSecretKeyModal, setShowSecretKeyModal] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  useEffect(() => {
    fetch('/api/user')
      .then(r => r.json())
      .then(res => {
        if (res.data) {
          setUser(res.data);
          setTravelMode(res.data.travelMode);
          if (res.data.smtpHost) {
            setSmtpForm({ host: res.data.smtpHost, port: res.data.smtpPort, user: res.data.smtpUser, pass: res.data.smtpPass });
          }
          if (res.data.name || res.data.avatarUrl) {
            setProfileForm({ name: res.data.name || 'CloudBird Technologies', avatarUrl: res.data.avatarUrl || '' });
          }
          if (res.data.language) {
            setLanguage(res.data.language as 'es' | 'en');
          }
        }
      });
  }, []);

  const handleUpdateUser = async (updates: any) => {
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.data) {
        setUser(data.data);
        if (updates.travelMode !== undefined) {
          window.location.reload(); // Force reload to filter sidebars and items
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleTravelMode = () => {
    const newVal = !travelMode;
    setTravelMode(newVal);
    handleUpdateUser({ travelMode: newVal });
  };

  const handleGenerateSecretKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = 'A3-';
    for (let i = 0; i < 6; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
    key += '-';
    for (let i = 0; i < 5; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
    key += '-';
    for (let i = 0; i < 5; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
    handleUpdateUser({ secretKey: key });
    setShowSecretKeyModal(false);
  };

  const handleChangeEmail = () => {
    if (newEmail && newEmail.includes('@')) {
      handleUpdateUser({ email: newEmail });
      setShowEmailModal(false);
      setNewEmail('');
    } else {
      customAlert('Por favor introduce un correo válido.', true);
    }
  };

  const handleChangePassword = () => {
    if (passwordForm.new !== passwordForm.confirm) {
      customAlert('Las contraseñas no coinciden.', true);
      return;
    }
    if (passwordForm.new.length < 8) {
      customAlert('La contraseña debe tener al menos 8 caracteres.', true);
      return;
    }
    handleUpdateUser({ password: passwordForm.new });
    setShowPasswordModal(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
    customAlert('Contraseña actualizada correctamente.');
  };

  const handleDownloadEmergencyKit = () => {
    if (!user) return;
    const content = `OpenPassword Emergency Kit\n\n---------------------------\nNombre: CloudBird Technologies\nEmail: ${user.email}\nSecret Key: ${user.secretKey}\nRecovery Code: ${user.recoveryCode || 'No generado'}\n---------------------------\n\nGuarda este archivo en un lugar seguro. Lo necesitarás para iniciar sesión en dispositivos nuevos o recuperar tu cuenta.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'OpenPassword_Emergency_Kit.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const startRecoverySetup = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '1PRK-';
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) code += chars.charAt(Math.floor(Math.random() * chars.length));
      if (i < 3) code += '-';
    }
    setTempRecoveryCode(code);
    setRecoveryStep(1);
    setShowRecoveryModal(true);
    setConfirmedInfo(false);
    setRecoveryInput('');
  };

  const finishRecoverySetup = () => {
    if (recoveryInput.replace(/\s/g, '').toUpperCase() === tempRecoveryCode.replace(/-/g, '').toUpperCase()) {
      handleUpdateUser({ recoveryCode: tempRecoveryCode });
      setShowRecoveryModal(false);
      customAlert('Código de recuperación configurado correctamente.');
    } else {
      customAlert('El código introducido no coincide. Por favor, verifica e inténtalo de nuevo.', true);
    }
  };

  const handleSaveSmtp = () => {
    handleUpdateUser({
      smtpHost: smtpForm.host,
      smtpPort: parseInt(smtpForm.port),
      smtpUser: smtpForm.user,
      smtpPass: smtpForm.pass
    });
    setShowSmtpModal(false);
    customAlert('Configuración SMTP guardada correctamente.');
  };

  const handleDeleteDevice = async (id: string) => {
    try {
      const res = await fetch(`/api/devices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUser({ ...user, devices: user.devices.filter((d: any) => d.id !== id) });
        setActiveDeviceMenu(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Dynamic View Content */}
      {activeView === 'api' && <ApiDocs onBack={() => setActiveView('general')} />}

      {activeView === 'apikeys' && (
        <div style={{ flex: 1, padding: '40px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <button onClick={() => setActiveView('general')} style={{ background: 'var(--bg-tertiary)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
              </button>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>API Keys</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Crea claves para autenticar aplicaciones externas, extensiones o scripts contra la API de OpenPassword.</p>
              </div>
            </div>

            {/* Create key form */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Key size={16} /> Nueva API Key</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Nombre *</label>
                  <input
                    value={newKeyName}
                    onChange={e => { setNewKeyName(e.target.value); setKeyNameError(''); }}
                    placeholder='Ej: Extensión de Chrome, Script de backup…'
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${keyNameError ? '#ef4444' : 'var(--border-color)'}`, background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                  {keyNameError && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{keyNameError}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Permisos</label>
                  <select value={newKeyScopes} onChange={e => setNewKeyScopes(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    <option value='read'>Solo lectura</option>
                    <option value='read,write'>Lectura y escritura</option>
                    <option value='read,write,delete'>Control total</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Expiración</label>
                  <select value={newKeyExpiry} onChange={e => setNewKeyExpiry(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    <option value='never'>Sin expiración</option>
                    <option value='30d'>30 días</option>
                    <option value='90d'>90 días</option>
                    <option value='1y'>1 año</option>
                  </select>
                </div>
              </div>
              <button onClick={handleCreateApiKey} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--accent-primary)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                <Plus size={16} /> Generar API Key
              </button>
            </div>

            {/* Reveal created key — shown once */}
            {showCreatedKey && createdKey && (
              <div style={{ backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Shield size={18} color='#10b981' />
                  <span style={{ fontWeight: '700', color: '#10b981' }}>¡Copia tu clave ahora! No se mostrará de nuevo.</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <code style={{ flex: 1, padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'monospace', letterSpacing: '0.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                    {showCreatedKey ? createdKey : '•'.repeat(40)}
                  </code>
                  <button onClick={() => setShowCreatedKey(v => !v)} title='Mostrar/ocultar' style={{ padding: '10px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    {showCreatedKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button onClick={handleCopyKey} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: copiedKey ? '#10b981' : 'var(--bg-tertiary)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: copiedKey ? '#fff' : 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.2s' }}>
                    <Copy size={14} /> {copiedKey ? '¡Copiado!' : 'Copiar'}
                  </button>
                  <button onClick={() => { setShowCreatedKey(false); setCreatedKey(null); }} style={{ padding: '10px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Existing keys list */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: '600' }}>Claves activas</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{apiKeys.length} clave{apiKeys.length !== 1 ? 's' : ''}</span>
              </div>
              {apiKeys.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  <Key size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p style={{ fontSize: '0.9rem' }}>No hay claves API creadas todavía.</p>
                </div>
              ) : apiKeys.map(k => (
                <div key={k.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Key size={16} color='var(--accent-primary)' />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '2px' }}>{k.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'monospace' }}>{k.prefix}••••••</span>
                      <span style={{ background: 'var(--bg-primary)', padding: '1px 8px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>{k.scopes}</span>
                      {k.expiresAt && <span>Expira: {new Date(k.expiresAt).toLocaleDateString()}</span>}
                      {k.lastUsedAt && <span>Último uso: {new Date(k.lastUsedAt).toLocaleDateString()}</span>}
                      {!k.lastUsedAt && <span>Nunca usada</span>}
                    </div>
                  </div>
                  <button onClick={() => handleRevokeApiKey(k.id)} title='Revocar clave' style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', borderRadius: '6px', flexShrink: 0 }} onMouseOver={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')} onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Usage instructions */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-color)', marginTop: '24px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Info size={16} /> Cómo usar tu API Key</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Incluye tu clave en el header <code style={{ background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>Authorization</code> de cada petición:</p>
              <pre style={{ background: 'var(--bg-primary)', padding: '14px 16px', borderRadius: '8px', fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-primary)', overflowX: 'auto', border: '1px solid var(--border-color)', lineHeight: '1.6' }}>{`curl https://tu-dominio.com/api/items \\\n  -H "Authorization: Bearer op_tu_clave_aqui"`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Existing SMTP view trigger */}
      
      {activeView === 'smtp' && (
        <div style={{ flex: 1, padding: '40px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <button onClick={() => setActiveView('general')} style={{ background: 'var(--bg-tertiary)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
              </button>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{t.smtpTitle}</h1>
            </div>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{t.smtpDesc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Host</label>
                  <input type="text" value={smtpForm.host} onChange={e => setSmtpForm({...smtpForm, host: e.target.value})} placeholder="smtp.ejemplo.com" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Port</label>
                  <input type="text" value={smtpForm.port} onChange={e => setSmtpForm({...smtpForm, port: e.target.value})} placeholder="587" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Usuario</label>
                  <input type="text" value={smtpForm.user} onChange={e => setSmtpForm({...smtpForm, user: e.target.value})} placeholder="correo@ejemplo.com" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Contraseña</label>
                  <input type="password" value={smtpForm.pass} onChange={e => setSmtpForm({...smtpForm, pass: e.target.value})} placeholder="••••••••" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none' }} />
                </div>
                <button onClick={handleSaveSmtp} style={{ width: '100%', padding: '14px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '16px' }}>
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'general' && (
        <div style={{ flex: 1, padding: '40px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '32px' }}>{t.settingsTitle || 'Administrar cuenta'}</h1>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          
          {/* Left Column */}
          <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Profile Card */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: profileForm.avatarUrl ? 'transparent' : '#3b82f6', backgroundImage: profileForm.avatarUrl ? `url(${profileForm.avatarUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: profileForm.avatarUrl ? '1px solid var(--border-color)' : 'none' }}>
                {!profileForm.avatarUrl && <User size={40} color="white" />}
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '24px' }}>{profileForm.name}</h2>
              <button onClick={() => setShowProfileModal(true)} style={{ width: '100%', padding: '10px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                {t.profileEdit}
              </button>
            </div>

            {/* Actions Menu */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <button onClick={() => setShowEmailModal(true)} style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--accent-primary)', fontWeight: 500, cursor: 'pointer' }}>
                {t.changeEmail}
              </button>
              <button onClick={() => setShowSecretKeyModal(true)} style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--accent-primary)', fontWeight: 500, cursor: 'pointer' }}>
                {t.secretKeyGen}
              </button>
              <button onClick={() => setShowPasswordModal(true)} style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--accent-primary)', fontWeight: 500, cursor: 'pointer' }}>
                {t.changePassword}
              </button>
              
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowMoreActions(!showMoreActions)}
                  style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontWeight: 500, cursor: 'pointer' }}
                >
                  {t.moreActions}
                  <MoreHorizontal size={16} />
                </button>
                
                {showMoreActions && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 10, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <button 
                      onClick={() => {
                        const newLang = language === 'es' ? 'en' : 'es';
                        setLanguage(newLang);
                        handleUpdateUser({ language: newLang });
                        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: newLang } }));
                        setShowMoreActions(false);
                      }}
                      style={{ width: '100%', padding: '16px', textAlign: 'center', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      {t.changeLanguage || 'Cambiar idioma'} ({language === 'es' ? 'EN' : 'ES'})
                    </button>
                    <button 
                      onClick={() => { setShowMoreActions(false); setActiveView('apikeys'); fetchApiKeys(); }}
                      style={{ width: '100%', padding: '16px', textAlign: 'center', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Key size={16} /> API Keys
                      </div>
                    </button>
                    <button 
                      onClick={() => { setShowMoreActions(false); setActiveView('api'); }}
                      style={{ width: '100%', padding: '16px', textAlign: 'center', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      {t.apiDocs}
                    </button>
                    <button 
                      onClick={() => { setShowMoreActions(false); setActiveView('smtp'); }}
                      style={{ width: '100%', padding: '16px', textAlign: 'center', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      {t.emailPrefs}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Travel Mode */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div 
                  onClick={toggleTravelMode}
                  style={{ width: '40px', height: '24px', backgroundColor: travelMode ? '#10b981' : 'var(--bg-tertiary)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s' }}
                >
                  <div style={{ width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '9px', position: 'absolute', top: '3px', left: travelMode ? '19px' : '3px', transition: 'left 0.2s' }} />
                </div>
                <span style={{ fontWeight: 'bold' }}>{t.travelMode || 'Modo de viaje'}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '8px' }}>
                {t.travelModeDesc || 'Activar para eliminar las bóvedas de tus dispositivos.'}
              </p>
              <a href="#" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>Más información sobre el modo viaje ↗</a>
            </div>

            {/* Auto Lock */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '20px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{t.autoLock || 'Bloqueo automático'}</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '12px' }}>
                {t.autoLockDesc || 'Bloquear OpenPassword en este navegador tras estar inactivo durante:'}
              </p>
              <select 
                value={autoLock} 
                onChange={e => setAutoLock(e.target.value)}
                style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', outline: 'none', marginBottom: '12px' }}
              >
                <option>10 minutos</option>
                <option>30 minutos</option>
                <option>1 hora</option>
                <option>Nunca</option>
              </select>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                OpenPassword también se bloqueará cuando el navegador se cierre.
              </p>
            </div>

          </div>

          {/* Right Column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Account Info & QR */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Correo electrónico</div>
                  <div style={{ fontSize: '1.1rem' }}>{user?.email || 'Cargando...'}</div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Secret Key</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '1rem', fontFamily: 'monospace', letterSpacing: '2px', wordBreak: 'break-all' }}>
                      {(() => {
                        if (!user?.secretKey) return 'Cargando...';
                        if (showSecretKey) return user.secretKey;
                        const parts = user.secretKey.split('-');
                        if (parts.length > 2) {
                          return `${parts[0]}-${parts[1]}-` + parts.slice(2).map((p: string) => '•'.repeat(p.length)).join('-');
                        }
                        return '••••••••••••••••••••••••••••••';
                      })()}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                      <button 
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        style={{ padding: '6px 12px', backgroundColor: showSecretKey ? 'rgba(59, 130, 246, 0.1)' : 'transparent', border: `2px solid ${showSecretKey ? '#3b82f6' : 'var(--border-color)'}`, color: showSecretKey ? '#3b82f6' : 'var(--text-primary)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        {showSecretKey ? 'Ocultar' : 'Mostrar'}
                      </button>
                      <button 
                        onClick={() => { 
                          navigator.clipboard.writeText(user?.secretKey || ''); 
                          const btn = document.getElementById('copy-sk-btn');
                          if (btn) { btn.innerText = 'Copiado!'; setTimeout(() => btn.innerText = 'Copiar', 2000); }
                        }}
                        id="copy-sk-btn"
                        style={{ padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ width: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', textAlign: 'center', fontWeight: 'bold' }}>Código de Configuración</div>
                {showQR ? (
                  <div style={{ width: '120px', height: '120px', backgroundColor: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <QrCode size={100} color="black" />
                  </div>
                ) : (
                  <div style={{ width: '120px', height: '120px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Lock size={32} color="var(--text-secondary)" />
                  </div>
                )}
                <button 
                  onClick={() => setShowQR(!showQR)}
                  style={{ padding: '4px 16px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {showQR ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            {/* Emergency Kit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button onClick={handleDownloadEmergencyKit} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                <Download size={18} /> Guardar Emergency Kit
              </button>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1, lineHeight: '1.4' }}>
                Tu Emergency Kit contiene información que necesitarás para iniciar sesión en tu cuenta de OpenPassword.
              </div>
            </div>

            {/* Recovery Code Section */}
            {!user?.recoveryCode ? (
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '24px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ color: '#3b82f6' }}>
                    <Info size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '1.1rem' }}>Configura tu cuenta de recuperación</div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
                      Si pierdes acceso a tu cuenta, un código de recuperación te ayudará a recuperar el acceso. Tendrás que verificar tu identidad por correo electrónico.
                    </p>
                    <button 
                      onClick={startRecoverySetup}
                      style={{ padding: '8px 16px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}
                    >
                      Configurar código de recuperación
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '24px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '16px', fontSize: '1.1rem' }}>Código de recuperación</div>
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Creado el {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</div>
                    <div style={{ fontSize: '1rem', fontFamily: 'monospace', letterSpacing: '1px' }}>{user?.recoveryCode}</div>
                  </div>
                  <MoreHorizontal size={20} color="var(--text-secondary)" cursor="pointer" />
                </div>
              </div>
            )}

            {/* Usage Data */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Datos de uso</div>
                <span style={{ backgroundColor: '#8b5cf6', color: 'white', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nuevo</span>
              </div>
              
              <div 
                onClick={() => setShareData(!shareData)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '16px' }}
              >
                <div style={{ color: shareData ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}>
                  {shareData ? <CheckSquare size={20} /> : <Square size={20} />}
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Compartir información sobre tu uso en las aplicaciones de OpenPassword</span>
              </div>

              <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', overflow: 'hidden' }}>
                <button 
                  onClick={() => setShowUsageDetails(!showUsageDetails)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: 'transparent', color: 'var(--text-primary)', border: 'none', fontSize: '0.9rem', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                >
                  <ChevronRight size={16} style={{ transform: showUsageDetails ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  Acerca de la compartición de datos de uso
                </button>
                
                {showUsageDetails && (
                  <div style={{ padding: '0 16px 16px 40px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    <p style={{ marginBottom: '12px' }}>Compartir los datos de uso nos ayudará a entender cómo utiliza OpenPassword la gente y, por tanto, nos permitirá mejorarlo para todos.</p>
                    <ul style={{ paddingLeft: '20px', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li>No recopilaremos ni veremos datos encriptados de bóvedas o elementos, como las contraseñas.</li>
                      <li>No venderemos tus datos a terceros si decides acceder.</li>
                      <li>Siempre podrás cambiar tu decisión desde "Administrar cuentas".</li>
                    </ul>
                    <a href="#" style={{ display: 'block', marginTop: '12px', color: 'var(--accent-primary)', textDecoration: 'none' }}>Más información sobre la compartición de datos de uso</a>
                  </div>
                )}
              </div>
            </div>

            {/* Linked Devices */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Vinculado a tu cuenta</div>
                <button style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--accent-primary)', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>
                  Desvincular todo lo inactivo
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                
                {user?.devices?.map((device: any) => (
                  <div key={device.id} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '50%', marginRight: '16px' }}>
                      {device.icon === 'Globe' && <Globe size={24} color={device.isCurrent ? "#10b981" : "#3b82f6"} />}
                      {device.icon === 'Shield' && <Shield size={24} color={device.isCurrent ? "#10b981" : "#3b82f6"} />}
                      {device.icon === 'Smartphone' && <Smartphone size={24} color={device.isCurrent ? "#10b981" : "#f59e0b"} />}
                    </div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{device.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '16px' }}>
                          <span>{device.ip}</span>
                          <span>{device.location}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{device.os}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Último acceso: {new Date(device.lastAccess).toLocaleDateString()}</div>
                      </div>
                    </div>
                    {device.isCurrent ? (
                      <div style={{ paddingLeft: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Tu dispositivo actual</span>
                      </div>
                    ) : (
                      <div style={{ paddingLeft: '16px', position: 'relative' }}>
                        <MoreHorizontal 
                          size={20} 
                          color="var(--text-secondary)" 
                          cursor="pointer" 
                          onClick={() => setActiveDeviceMenu(activeDeviceMenu === device.id ? null : device.id)}
                        />
                        {activeDeviceMenu === device.id && (
                          <div style={{ position: 'absolute', top: '100%', right: 0, width: '180px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 10, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                            <button 
                              onClick={() => handleDeleteDevice(device.id)}
                              style={{ width: '100%', padding: '12px 16px', textAlign: 'left', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 500 }}
                            >
                              Desvincular dispositivo
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

              </div>
            </div>

          </div>
        </div>

      </div>
      {/* Recovery Modal */}
      {showRecoveryModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', width: '100%', maxWidth: '500px', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            
            {/* Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold' }}>
                {recoveryStep === 1 && 'Configurar un código de recu...'}
                {recoveryStep === 2 && 'Tu código de recuperación'}
                {recoveryStep === 3 && 'Confirma el código de recup...'}
              </div>
              <button onClick={() => setShowRecoveryModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
                Cancelar
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '32px 24px' }}>
              
              {recoveryStep === 1 && (
                <>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '24px' }}>Información importante</h2>
                  <ul style={{ paddingLeft: '20px', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '32px' }}>
                    <li>You are responsible for your own account recovery. OpenPassword cannot reset your passwords or help you with account recovery.</li>
                    <li>Los organizadores de familia pueden ayudar a los miembros familiares con la recuperación de una cuenta.</li>
                    <li>Mantén una copia de este código en un lugar seguro. No lo compartas con nadie.</li>
                  </ul>
                  <div 
                    onClick={() => setConfirmedInfo(!confirmedInfo)}
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                  >
                    <div style={{ color: confirmedInfo ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}>
                      {confirmedInfo ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                    <span style={{ fontSize: '0.95rem' }}>Lo confirmo y entiendo</span>
                  </div>
                </>
              )}

              {recoveryStep === 2 && (
                <>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '16px' }}>Guarda este código en un lugar seguro</h2>
                  <ul style={{ paddingLeft: '20px', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    <li>You are responsible for your own account recovery. OpenPassword cannot reset your passwords or help you with account recovery.</li>
                  </ul>
                  
                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontFamily: 'monospace', letterSpacing: '1px', wordBreak: 'break-all', lineHeight: '1.6' }}>
                      {tempRecoveryCode}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      <Save size={18} /> Guardar
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      <Printer size={18} /> Imprimir
                    </button>
                  </div>
                </>
              )}

              {recoveryStep === 3 && (
                <>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px' }}>Introduce tu código de recuperación</h2>
                  <textarea 
                    value={recoveryInput}
                    onChange={(e) => setRecoveryInput(e.target.value)}
                    placeholder="Pega aquí tu código de recuperación"
                    style={{ width: '100%', height: '100px', backgroundColor: 'var(--bg-primary)', border: '2px solid var(--accent-primary)', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none', fontSize: '1rem', fontFamily: 'monospace', marginBottom: '24px', resize: 'none' }}
                  />
                  <button 
                    onClick={() => setRecoveryStep(2)}
                    style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px' }}
                  >
                    Volver
                  </button>
                </>
              )}

              {/* Action Button */}
              <button 
                onClick={() => {
                  if (recoveryStep === 1 && confirmedInfo) setRecoveryStep(2);
                  else if (recoveryStep === 2) setRecoveryStep(3);
                  else if (recoveryStep === 3) finishRecoverySetup();
                }}
                disabled={recoveryStep === 1 && !confirmedInfo}
                style={{ width: '100%', padding: '14px', backgroundColor: (recoveryStep === 1 && !confirmedInfo) ? 'var(--bg-tertiary)' : 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: (recoveryStep === 1 && !confirmedInfo) ? 'default' : 'pointer', fontSize: '1rem' }}
              >
                {recoveryStep === 1 && 'Generar código de recuperación'}
                {recoveryStep === 2 && 'Siguiente'}
                {recoveryStep === 3 && 'Confirmar y terminar la configuración'}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* SMTP Modal */}
      {showSmtpModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', width: '100%', maxWidth: '400px', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            
            {/* Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Configuración SMTP</div>
              <button onClick={() => setShowSmtpModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Servidor (Host)</label>
                <input 
                  type="text" 
                  value={smtpForm.host} 
                  onChange={e => setSmtpForm({...smtpForm, host: e.target.value})}
                  placeholder="ej. smtp.gmail.com" 
                  style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Puerto</label>
                <input 
                  type="text" 
                  value={smtpForm.port} 
                  onChange={e => setSmtpForm({...smtpForm, port: e.target.value})}
                  placeholder="ej. 587" 
                  style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Usuario</label>
                <input 
                  type="text" 
                  value={smtpForm.user} 
                  onChange={e => setSmtpForm({...smtpForm, user: e.target.value})}
                  placeholder="tucorreo@empresa.com" 
                  style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Contraseña</label>
                <input 
                  type="password" 
                  value={smtpForm.pass} 
                  onChange={e => setSmtpForm({...smtpForm, pass: e.target.value})}
                  placeholder="Contraseña de aplicación" 
                  style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none' }}
                />
              </div>
              <button 
                onClick={handleSaveSmtp}
                style={{ width: '100%', padding: '14px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
              >
                Guardar Configuración
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Change Email Modal */}
      {showEmailModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', width: '100%', maxWidth: '400px', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Cambiar correo electrónico</div>
              <button onClick={() => setShowEmailModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nuevo correo electrónico</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="tu@correo.com" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none' }} />
              </div>
              <button onClick={handleChangeEmail} style={{ width: '100%', padding: '14px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                Actualizar correo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', width: '100%', maxWidth: '400px', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Cambiar contraseña maestra</div>
              <button onClick={() => setShowPasswordModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Contraseña actual</label>
                <input type="password" value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nueva contraseña</label>
                <input type="password" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Confirmar contraseña</label>
                <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none' }} />
              </div>
              <button onClick={handleChangePassword} style={{ width: '100%', padding: '14px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                Actualizar contraseña
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secret Key Modal */}
      {showSecretKeyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', width: '100%', maxWidth: '450px', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Generar otra Secret Key</div>
              <button onClick={() => setShowSecretKeyModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '16px', color: '#fca5a5', fontSize: '0.9rem', lineHeight: '1.5' }}>
                <strong>¡Atención!</strong> Si generas una nueva Secret Key, la anterior quedará invalidada inmediatamente. Deberás iniciar sesión de nuevo en todos tus otros dispositivos con la nueva Secret Key. Asegúrate de tener tu Emergency Kit descargado.
              </div>
              <button onClick={handleGenerateSecretKey} style={{ width: '100%', padding: '14px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                Generar nueva Secret Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', width: '100%', maxWidth: '400px', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Editar perfil</div>
              <button onClick={() => setShowProfileModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <div style={{ width: '100px', height: '100px', backgroundColor: profileForm.avatarUrl ? 'transparent' : '#3b82f6', backgroundImage: profileForm.avatarUrl ? `url(${profileForm.avatarUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: profileForm.avatarUrl ? '1px solid var(--border-color)' : 'none', position: 'relative' }}>
                  {!profileForm.avatarUrl && <User size={50} color="white" />}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  id="avatar-upload" 
                  style={{ display: 'none' }} 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setProfileForm({...profileForm, avatarUrl: reader.result as string});
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
                <label 
                  htmlFor="avatar-upload" 
                  style={{ fontSize: '0.85rem', backgroundColor: 'var(--bg-tertiary)', padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 'bold', display: 'inline-block' }}
                >
                  Subir foto
                </label>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nombre del perfil</label>
                <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} placeholder="Tu nombre" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none' }} />
              </div>
              <button 
                onClick={() => { 
                  handleUpdateUser({ name: profileForm.name, avatarUrl: profileForm.avatarUrl });
                  setShowProfileModal(false); 
                  customAlert('Perfil actualizado correctamente.'); 
                }} 
                style={{ width: '100%', padding: '14px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

        </div>
      )}
    </div>
  );
}
