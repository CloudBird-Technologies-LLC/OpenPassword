'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Lock, Info } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      
      if (res.ok) {
        // En una app real, usaríamos cookies HttpOnly configuradas por el backend, 
        // pero para esta demo usamos un token simple para que el middleware lo detecte
        document.cookie = `auth_token=valid_session; path=/`;
        router.push('/');
      } else {
        setErrorMsg(json.error || 'Credenciales inválidas');
      }
    } catch (error) {
      setErrorMsg('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', color: 'var(--text-primary)', fontFamily: 'sans-serif' }}>
      
      {/* Left Decoration */}
      <div style={{ width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderRight: '1px solid var(--border-color)' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', backgroundColor: 'var(--border-color)' }}></div>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', border: '5px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, boxShadow: '0 0 0 10px var(--bg-primary)' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#1e293b', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '8px', height: '16px', backgroundColor: '#fff', borderRadius: '4px' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        
        <div style={{ maxWidth: '450px', width: '100%' }}>
          
          <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', color: '#60a5fa', fontSize: '0.9rem' }}>
            <Info size={18} />
            Ingresa tu contraseña maestra para desbloquear tu bóveda.
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '10px', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={24} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>Iniciar sesión en OpenPassword</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tu gestor de contraseñas de código abierto</p>
              </div>
            </div>

            {errorMsg && (
              <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}>Correo electrónico</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', fontSize: '1rem', color: 'var(--text-primary)' }}
                />
              </div>
              
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}>Contraseña Maestra</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••••••"
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '2px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ padding: '12px 24px', borderRadius: '6px', backgroundColor: '#2563eb', color: '#fff', fontSize: '1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  {loading ? 'Iniciando...' : 'Iniciar sesión'}
                </button>
                <a href="#" style={{ color: '#2563eb', fontSize: '0.9rem', textDecoration: 'none' }}>¿Tienes problemas para iniciar sesión?</a>
              </div>
            </form>
          </div>

          <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <a href="/setup" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>Crear una nueva cuenta</a>
          </div>

        </div>
      </div>
      
      {/* Right Guide Panel */}
      <div style={{ width: '400px', backgroundColor: 'var(--bg-secondary)', padding: '60px 40px', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '16px' }}>GUÍA</h3>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '20px', lineHeight: '1.3' }}>¿Qué tan segura es mi contraseña?</h2>
        
        <div style={{ width: '100%', height: '160px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <KeyRound size={60} color="#3b82f6" opacity={0.5} />
        </div>

        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1rem', marginBottom: '20px' }}>
          Como usuario promedio de Internet, probablemente tienes más de 100 contraseñas para varias cuentas en línea. Todas estas credenciales deben ser fuertes y únicas pero la realidad es que la gente a menudo elige contraseñas que un hacker podría descifrar en una hora o dos.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1rem', marginBottom: '20px' }}>
          Lee nuestra guía para aprender cómo mantenerte seguro en línea.
        </p>

        <a href="#" style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '0.9rem', textDecoration: 'none' }}>Leer la guía</a>
      </div>
    </div>
  );
}
