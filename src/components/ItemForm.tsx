import React, { useState } from 'react';
import { X, Lock, CreditCard, FileText, KeyRound, Shield, Search, FileBadge, Plus, MinusCircle, CheckCircle, Fingerprint, Star, Eye, EyeOff, Smartphone } from 'lucide-react';
import PasswordGenerator from './PasswordGenerator';
import OTPDisplay from './OTPDisplay';
import { customAlert } from './GlobalModals';
import { translations } from '../utils/i18n';

interface CustomField {
  id: string;
  type: string;
  label: string;
  value: string;
}

interface ItemFormProps {
  onClose: () => void;
  onSuccess: () => void;
  vaultId?: string;
  initialData?: any;
}

export default function ItemForm({ onClose, onSuccess, vaultId, initialData }: ItemFormProps) {
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

  const [step, setStep] = useState<'category' | 'form'>(initialData ? 'form' : 'category');
  const [category, setCategory] = useState(initialData?.category || 'login');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  
  // Basic Fields
  const [title, setTitle] = useState(initialData?.title || '');
  const [username, setUsername] = useState(initialData?.username || '');
  const [password, setPassword] = useState(initialData?.password || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [otpSecret, setOtpSecret] = useState(initialData?.otpSecret || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  
  // Advanced features
  const [showGen, setShowGen] = useState(false);
  const [passkey, setPasskey] = useState(initialData?.passkey || ''); 
  const [customFields, setCustomFields] = useState<CustomField[]>(() => {
    if (initialData?.customFields) {
      try { return JSON.parse(initialData.customFields); } catch(e) { return []; }
    }
    return [];
  });
  const [tags, setTags] = useState<string[]>(initialData?.tags?.map((t: any) => t.name) || []);
  const [newTag, setNewTag] = useState('');
  const [showFieldMenu, setShowFieldMenu] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);

  const categories = [
    { id: 'login', icon: Lock, label: 'Inicio de sesión', color: '#0ea5e9' },
    { id: 'secure_note', icon: FileText, label: 'Nota segura', color: '#f59e0b' },
    { id: 'credit_card', icon: CreditCard, label: 'Tarjeta de crédito', color: '#3b82f6' },
    { id: 'identity', icon: FileBadge, label: 'Identidad', color: '#10b981' },
    { id: 'password', icon: KeyRound, label: 'Contraseña', color: '#06b6d4' },
    { id: 'document', icon: Shield, label: 'Documento', color: '#6366f1' },
    { id: 'database', icon: Lock, label: 'Base de datos', color: '#ec4899' },
    { id: 'drivers_license', icon: FileBadge, label: 'Carnet de conducir', color: '#f43f5e' },
    { id: 'crypto_wallet', icon: CreditCard, label: 'Cartera crypto', color: '#8b5cf6' },
    { id: 'ssh_key', icon: KeyRound, label: 'Clave SSH', color: '#f59e0b' },
    { id: 'api_credentials', icon: Lock, label: 'Credenciales de API', color: '#06b6d4' },
    { id: 'bank_account', icon: CreditCard, label: 'Cuenta bancaria', color: '#eab308' },
    { id: 'email', icon: FileText, label: 'Correo electrónico', color: '#ec4899' },
    { id: 'medical_record', icon: Shield, label: 'Historia clínica', color: '#ef4444' },
    { id: 'outdoor_license', icon: FileBadge, label: 'Licencia de exteriores', color: '#84cc16' },
    { id: 'software_license', icon: Shield, label: 'Licencia de software', color: '#3b82f6' },
    { id: 'membership', icon: FileBadge, label: 'Membresía', color: '#d946ef' },
    { id: 'social_security', icon: Shield, label: 'Número de la Seguridad Social', color: '#14b8a6' },
    { id: 'passport', icon: FileBadge, label: 'Pasaporte', color: '#3b82f6' },
    { id: 'rewards', icon: Star, label: 'Recompensas', color: '#f43f5e' },
    { id: 'wireless_router', icon: Lock, label: 'Router Inalámbrico', color: '#06b6d4' },
    { id: 'server', icon: Lock, label: 'Servidor', color: '#64748b' },
  ];

  const fieldTypes = [
    'Texto', 'URL', 'Correo electrónico', 'Dirección', 'Fecha', 'Contraseña de un solo uso', 'Contraseña', 'Teléfono', 'Clave de acceso (Passkey)'
  ];

  const handleSelectCategory = (cat: string) => {
    setCategory(cat);
    setTitle(categories.find(c => c.id === cat)?.label || '');
    setStep('form');
  };

  const addCustomField = (type: string) => {
    if (type === 'Clave de acceso (Passkey)') {
      setShowPasskeyModal(true);
    } else if (type === 'Contraseña de un solo uso') {
      const fieldId = Math.random().toString(36).substr(2, 9);
      setCustomFields([...customFields, { id: fieldId, type: 'otp', label: 'Secret OTP (Base32)', value: '' }]);
    } else {
      const fieldId = Math.random().toString(36).substr(2, 9);
      setCustomFields([...customFields, { id: fieldId, type: type.toLowerCase(), label: type, value: '' }]);
    }
    setShowFieldMenu(false);
  };

  const updateCustomField = (id: string, value: string) => {
    setCustomFields(customFields.map(f => f.id === id ? { ...f, value } : f));
  };

  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Si el usuario añadió un OTP en los custom fields, extraemos su valor (simplificado)
      let finalOtp = otpSecret;
      const customOtp = customFields.find(f => f.type === 'otp');
      if (customOtp && customOtp.value) {
        finalOtp = customOtp.value;
      }

      const categoryLabel = categories.find((item) => item.id === category)?.label || category;
      const payload = {
        title: title || categoryLabel,
        category,
        username,
        password,
        url,
        notes,
        otpSecret: finalOtp,
        passkey: passkey || undefined,
        customFields: customFields.length > 0 ? JSON.stringify(customFields) : null,
        vaultId: vaultId || initialData?.vaultId,
        tags
      };

      const res = await fetch(initialData ? `/api/items/${initialData.id}` : '/api/items', {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        onSuccess();
      } else {
        customAlert(t.errorSaving || 'Error al guardar el elemento', true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (step === 'category') {
    const filteredCategories = categories.filter(c => c.label.toLowerCase().includes(searchTerm.toLowerCase()));
    const displayedCategories = (searchTerm || showAllCategories) ? filteredCategories : filteredCategories.slice(0, 6);

    return (
      <div className="modal-overlay">
        <div className="modal" style={{ width: '600px', backgroundColor: '#212121', padding: '32px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          
          <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '1.3rem', fontWeight: 'bold' }}>{t.whatToAdd || '¿Qué te gustaría añadir?'}</h2>
          
          <div style={{ marginBottom: '24px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder={t.searchSomething || "Intenta buscar algo"} 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '14px 16px 14px 44px', backgroundColor: '#2a2a2a', border: '1px solid #3f3f46', borderRadius: '8px', color: 'white', fontSize: '1rem', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {displayedCategories.map(cat => {
              const Icon = cat.icon;
              const isHovered = hoveredCat === cat.id;
              return (
                <div 
                  key={cat.id} 
                  onClick={() => handleSelectCategory(cat.id)}
                  onMouseEnter={() => setHoveredCat(cat.id)}
                  onMouseLeave={() => setHoveredCat(null)}
                  style={{ 
                    backgroundColor: isHovered ? 'rgba(59, 130, 246, 0.1)' : 'transparent', 
                    border: `1px solid ${isHovered ? '#3b82f6' : '#3f3f46'}`, 
                    borderRadius: '8px', 
                    padding: '16px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-start', 
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  {isHovered && <Plus size={16} color="#3b82f6" style={{ position: 'absolute', top: '12px', right: '12px' }} />}
                  <div style={{ 
                    padding: '8px', 
                    backgroundColor: cat.color, 
                    borderRadius: '8px', 
                    marginBottom: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <Icon size={20} color="white" />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.label}</span>
                </div>
              );
            })}
          </div>
          
          {!searchTerm && !showAllCategories && filteredCategories.length > 6 && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button 
                onClick={() => setShowAllCategories(true)}
                style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
              >
                {t.viewMore || 'Mostrar más'}
              </button>
            </div>
          )}
          {filteredCategories.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '40px', color: '#9ca3af' }}>
              {t.noDetails || 'No se encontraron elementos que coincidan con tu búsqueda.'}
            </div>
          )}
        </div>
      </div>
    );
  }

  // FORM STEP
  const SelectedIcon = categories.find(c => c.id === category)?.icon || Lock;
  const iconColor = categories.find(c => c.id === category)?.color || '#0ea5e9';

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: '650px', backgroundColor: 'var(--bg-secondary)', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        
        {/* Header */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
          <button onClick={() => setStep('category')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Atrás
          </button>
          <span style={{ fontWeight: 'bold' }}>{initialData ? (t.edit || 'Editar elemento') : (t.newItem || 'Nuevo elemento')}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <form id="itemForm" onSubmit={handleSubmit}>
            
            {/* Title Header */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: `${iconColor}20`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SelectedIcon size={32} color={iconColor} />
              </div>
              <div style={{ flex: 1 }}>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', borderRadius: '12px', padding: '0 16px', fontSize: '1.2rem', color: 'white', fontWeight: 'bold' }}
                />
              </div>
            </div>

            {/* Main Fields Container */}
            <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              
              {category === 'login' && (
                <>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t.usernameUpper || 'nombre de usuario'}</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '1rem', outline: 'none' }} placeholder="usuario@email.com" />
                  </div>
                  
                  <div style={{ padding: '12px 16px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t.passwordUpper || 'contraseña'}</label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '1rem', outline: 'none', letterSpacing: password && !showPassword ? '3px' : 'normal', fontFamily: showPassword ? 'inherit' : 'monospace' }} placeholder="••••••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <button type="button" onClick={() => setShowGen(!showGen)} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'white', backgroundColor: '#1e3a8a', padding: '6px 12px', borderRadius: '16px', border: 'none', cursor: 'pointer' }}>
                        <KeyRound size={14} />
                        {showGen ? 'Ocultar generador' : (t.generatePassword || 'Crear una contraseña nueva')}
                      </button>
                    </div>
                  </div>
                  {showGen && (
                    <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                      <PasswordGenerator onSelectPassword={setPassword} />
                    </div>
                  )}
                </>
              )}

              {category === 'credit_card' && (
                <>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Nombre del titular</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '1rem', outline: 'none' }} />
                  </div>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Número de tarjeta</label>
                    <input type="text" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '1rem', outline: 'none' }} placeholder="0000 0000 0000 0000" />
                  </div>
                </>
              )}

            </div>

            {category === 'login' && (
              <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px', padding: '12px 16px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t.websiteUpper || 'página web'}</label>
                <input type="url" value={url} onChange={e => setUrl(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '1rem', outline: 'none' }} placeholder="https://example.com" />
              </div>
            )}

            {/* Custom Fields Mapping */}
            {customFields.length > 0 && (
              <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
                {customFields.map((field, idx) => (
                  <div key={field.id} style={{ padding: '12px 16px', borderBottom: idx !== customFields.length - 1 ? '1px solid var(--border-color)' : 'none', position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{field.label.toLowerCase()}</label>
                    <input type="text" value={field.value} onChange={e => updateCustomField(field.id, e.target.value)} style={{ width: '90%', background: 'transparent', border: 'none', color: 'white', fontSize: '1rem', outline: 'none' }} placeholder={field.type === 'otp' ? 'Ingresa la semilla secreta (ej. JBSWY3DPEHPK3PXP)' : ''} />
                    
                    {field.type === 'otp' && field.value.length > 5 && (
                      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px dashed var(--accent-primary)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '8px', fontWeight: 'bold' }}>Vista previa del código (Validación en tiempo real):</div>
                        <OTPDisplay secret={field.value.replace(/\s+/g, '')} />
                      </div>
                    )}

                    <button type="button" onClick={() => removeCustomField(field.id)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <MinusCircle size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Passkey Indicator */}
            {passkey && (
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '24px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                <Fingerprint size={28} color="#10b981" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 'bold' }}>Clave de acceso guardada</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Validada correctamente por el sistema biométrico.</div>
                </div>
                <CheckCircle size={20} color="#10b981" />
                <button type="button" onClick={() => setPasskey('')} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                  <MinusCircle size={18} />
                </button>
              </div>
            )}

            {/* Añadir Más Button */}
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <button type="button" onClick={() => setShowFieldMenu(!showFieldMenu)} style={{ width: '100%', padding: '16px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                <Plus size={18} /> {t.addMoreDetails || 'añadir más'}
              </button>
              
              {showFieldMenu && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', zIndex: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', padding: '8px 0', maxHeight: '250px', overflowY: 'auto' }}>
                  {fieldTypes.map(type => (
                    <div key={type} onClick={() => addCustomField(type)} style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px', padding: '12px 16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t.fieldNotes || 'notas'}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '1rem', outline: 'none', resize: 'vertical', minHeight: '60px' }} placeholder={t.writeNotes || "Añadir notas sobre este elemento aquí."} />
            </div>

            {/* Tags */}
            <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px', padding: '12px 16px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>etiquetas</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                {tags.map(tag => (
                  <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    {tag}
                    <X size={12} cursor="pointer" onClick={() => setTags(tags.filter(t => t !== tag))} />
                  </span>
                ))}
              </div>
              <input 
                type="text" 
                placeholder="+ Añadir etiqueta (presiona Enter)" 
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newTag.trim()) {
                    e.preventDefault();
                    if (!tags.includes(newTag.trim())) {
                      setTags([...tags, newTag.trim()]);
                    }
                    setNewTag('');
                  }
                }}
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
          <button type="submit" form="itemForm" style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            {t.saveItem || 'Guardar'}
          </button>
        </div>

      </div>

      {/* Mock Passkey Validation Modal */}
      {showPasskeyModal && (
        <div className="modal-overlay" style={{ zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal" style={{ width: '380px', backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '16px', border: '1px solid #333', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '40px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #10b981' }}>
                <Fingerprint size={40} color="#10b981" />
              </div>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '8px' }}>Seguridad de Windows</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '30px', lineHeight: '1.5' }}>
              Verifica tu identidad para crear una clave de acceso (passkey) para este elemento.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => {
                  setPasskey(`pk_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`);
                  setShowPasskeyModal(false);
                }} 
                style={{ width: '100%', padding: '14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1rem' }}
              >
                <Fingerprint size={18} /> Validar con Huella Digital
              </button>
              <button 
                onClick={() => {
                  setPasskey(`pk_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`);
                  setShowPasskeyModal(false);
                }} 
                style={{ width: '100%', padding: '14px', backgroundColor: '#262626', color: 'white', border: '1px solid #404040', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1rem' }}
              >
                <Smartphone size={18} /> Usar otro dispositivo
              </button>
              <button 
                onClick={() => setShowPasskeyModal(false)} 
                style={{ width: '100%', padding: '14px', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginTop: '8px' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
