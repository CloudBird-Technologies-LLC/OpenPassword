'use client';

import React, { useState } from 'react';
import OTPDisplay from '../../../components/OTPDisplay';
import { Lock, Eye, EyeOff, Copy, CheckCircle2 } from 'lucide-react';
import { customAlert } from '../../../components/GlobalModals';

export default function SharedItemClient({ sharedLink }: { sharedLink: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/share/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId: sharedLink.id,
          email,
          password
        })
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        customAlert('Error al acceder al elemento compartido', true);
      }
    } catch (error) {
      console.error(error);
      customAlert('Error de conexión', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const item = sharedLink.item;

  if (!isAuthenticated) {
    return (
      <div style={{ flex: 1, width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#121212', color: 'white', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#1e1e1e', padding: '40px', borderRadius: '16px', border: '1px solid #333' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ width: '60px', height: '60px', backgroundColor: '#3b82f6', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={32} color="white" />
            </div>
          </div>
          <h1 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '8px', fontWeight: 'bold' }}>Acceso compartido</h1>
          <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: '32px', fontSize: '0.9rem' }}>Ingresa tus datos para acceder a este elemento y unirte como invitado.</p>
          
          <form onSubmit={handleAccess} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px' }}>Correo electrónico</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px', backgroundColor: '#2a2a2a', border: '1px solid #3f3f46', borderRadius: '8px', color: 'white', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px' }}>Crea o ingresa tu contraseña</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', backgroundColor: '#2a2a2a', border: '1px solid #3f3f46', borderRadius: '8px', color: 'white', outline: 'none' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ width: '100%', padding: '14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', marginTop: '16px' }}
            >
              {isSubmitting ? 'Accediendo...' : 'Ver elemento'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, width: '100%', minHeight: '100vh', backgroundColor: '#121212', color: 'white', padding: '60px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '700px', width: '100%', margin: '0 auto' }}>
        
        {/* Title Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
          <div style={{ width: '96px', height: '96px', backgroundColor: 'white', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            {item.url ? (
              <img src={`https://www.google.com/s2/favicons?domain=${item.url}&sz=128`} alt="" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '40px', fontWeight: 'bold', color: '#333' }}>{item.title.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '-0.5px' }}>{item.title}</h1>
        </div>

        {/* Main Details Block */}
        <div style={{ backgroundColor: '#1e1e1e', borderRadius: '16px', border: '1px solid #333', marginBottom: '30px', overflow: 'hidden' }}>
          
          {item.username && (
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #333', position: 'relative' }}>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '4px' }}>nombre de usuario</div>
              <div style={{ fontSize: '1.1rem' }}>{item.username}</div>
              <button onClick={() => handleCopy(item.username, 'username')} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                {copiedField === 'username' ? <CheckCircle2 size={18} color="#10b981" /> : <Copy size={18} />}
              </button>
            </div>
          )}

          {item.password && (
            <div style={{ padding: '16px 24px', borderBottom: item.otpSecret || item.url ? '1px solid #333' : 'none', position: 'relative' }}>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '4px' }}>contraseña</div>
              <div style={{ fontSize: '1.4rem', letterSpacing: showPassword ? 'normal' : '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: showPassword ? 'inherit' : 'monospace' }}>
                <span style={{ fontSize: showPassword ? '1.1rem' : '1.4rem', wordBreak: 'break-all' }}>{showPassword ? item.password : '••••••••••••'}</span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <button onClick={() => handleCopy(item.password, 'password')} style={{ backgroundColor: '#1e3a8a', border: '1px solid #1e40af', borderRadius: '8px', padding: '6px 12px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', letterSpacing: 'normal' }}>
                    {copiedField === 'password' ? <CheckCircle2 size={14} /> : 'Copiar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {item.otpSecret && (
            <div style={{ padding: '16px 24px', borderBottom: item.url ? '1px solid #333' : 'none', position: 'relative' }}>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '4px' }}>one-time password</div>
              <OTPDisplay secret={item.otpSecret} />
            </div>
          )}

          {item.url && (
            <div style={{ padding: '16px 24px', position: 'relative' }}>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '4px' }}>website</div>
              <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '1.1rem' }}>
                {item.url}
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
