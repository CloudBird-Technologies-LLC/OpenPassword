'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-tertiary)',
  fontSize: '1rem',
  color: 'var(--text-primary)'
};

export default function RefreshPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/refreshpass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, secretKey, password })
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'No fue posible cambiar la contraseña.');
        return;
      }

      setSuccess(true);
      window.setTimeout(() => router.push('/login'), 1800);
    } catch {
      setError('Error de conexión. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ width: '100%', minHeight: '100vh', overflowY: 'auto', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <LockKeyhole size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Restablecer contraseña maestra</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Confirma tu identidad con la Secret Key de tu Emergency Kit.
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '32px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.25)' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <CheckCircle2 size={52} color="var(--success)" style={{ marginBottom: '16px' }} />
              <h2 style={{ marginBottom: '8px' }}>Contraseña actualizada</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Redirigiendo al inicio de sesión...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ backgroundColor: 'rgba(255, 69, 58, 0.12)', border: '1px solid rgba(255, 69, 58, 0.35)', color: '#ff8a84', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem' }}>
                  {error}
                </div>
              )}

              <label style={{ display: 'block', marginBottom: '18px' }}>
                <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Correo electrónico</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" style={inputStyle} />
              </label>

              <label style={{ display: 'block', marginBottom: '18px' }}>
                <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Secret Key</span>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input type="text" value={secretKey} onChange={(event) => setSecretKey(event.target.value)} required autoComplete="off" placeholder="A3-XXXXXX-..." style={{ ...inputStyle, paddingLeft: '40px', fontFamily: 'monospace' }} />
                </div>
              </label>

              <label style={{ display: 'block', marginBottom: '18px' }}>
                <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Nueva contraseña maestra</span>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" style={inputStyle} />
              </label>

              <label style={{ display: 'block', marginBottom: '24px' }}>
                <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Confirmar nueva contraseña</span>
                <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} autoComplete="new-password" style={inputStyle} />
              </label>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: '6px', backgroundColor: 'var(--accent-primary)', color: '#fff', fontSize: '1rem', fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Actualizando...' : 'Cambiar contraseña maestra'}
              </button>
            </form>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '20px' }}>
          <ShieldCheck size={16} />
          <span>La Secret Key nunca será mostrada ni modificada.</span>
        </div>
        <div style={{ textAlign: 'center', marginTop: '18px' }}>
          <Link href="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Volver al inicio de sesión</Link>
        </div>
      </div>
    </main>
  );
}
