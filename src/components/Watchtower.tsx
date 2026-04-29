import React from 'react';
import { PasswordItem } from '../types';
import { ShieldAlert, KeyRound, Lock, Fingerprint, ExternalLink, Globe, Clock, Activity, BarChart2, Mail, CreditCard, Shield, FileText } from 'lucide-react';
import { translations } from '../utils/i18n';

interface WatchtowerProps {
  items: PasswordItem[];
  onFilter: (ids: string[]) => void;
}

export default function Watchtower({ items, onFilter }: WatchtowerProps) {
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
  // Utility: Calculate Password Entropy
  const calculateEntropy = (pwd: string) => {
    if (!pwd) return 0;
    let pool = 0;
    if (/[a-z]/.test(pwd)) pool += 26;
    if (/[A-Z]/.test(pwd)) pool += 26;
    if (/[0-9]/.test(pwd)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) pool += 32;
    return pwd.length * Math.log2(pool || 1);
  };

  // --- Core Metrics ---
  const passwordsCounts = items.reduce((acc, item) => {
    if (item.password && item.password.length > 0) {
      acc[item.password] = (acc[item.password] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const reusedItems = items.filter(item => item.password && passwordsCounts[item.password] > 1);

  const weakItems = items.filter(item => {
    if (!item.password) return false;
    return calculateEntropy(item.password) < 40;
  });

  const passkeyItems = items.filter(item => item.passkey);
  const active2FAItems = items.filter(item => item.otpSecret);
  const httpItems = items.filter(item => item.url && item.url.startsWith('http://'));

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const oldItems = items.filter(item => new Date(item.updatedAt) < sixMonthsAgo);

  // --- Calculate real score ---
  let score = 1000;
  const totalItems = items.length || 1;
  score -= (reusedItems.length / totalItems) * 300;
  score -= (weakItems.length / totalItems) * 400;
  score -= (httpItems.length / totalItems) * 100;
  score -= (oldItems.length / totalItems) * 50;
  score += passkeyItems.length * 20;
  score += active2FAItems.length * 15;
  score = Math.max(0, Math.min(1000, Math.round(score)));

  const scoreColor = score >= 800 ? '#10b981' : score >= 500 ? '#eab308' : '#ef4444';
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = `${(score / 1000) * circumference} ${circumference}`;

  const healthyCount = items.length - weakItems.length - reusedItems.length;
  const healthyPercent = items.length === 0 ? 100 : Math.max(0, (healthyCount / items.length) * 100);
  const reusedPercent = items.length === 0 ? 0 : (reusedItems.length / items.length) * 100;
  const weakPercent = items.length === 0 ? 0 : (weakItems.length / items.length) * 100;

  // --- NEW: Dashboard Analytics Data ---

  // 1. Calendar Heatmap Data (Last 16 weeks ~ 4 months for compact view)
  const WEEKS_TO_SHOW = 24;
  const heatmapDays = WEEKS_TO_SHOW * 7;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const startDate = new Date(today.getTime() - (heatmapDays - 1) * 24 * 60 * 60 * 1000);
  
  const activityMap: Record<string, number> = {};
  items.forEach(item => {
    const d = new Date(item.createdAt).toISOString().split('T')[0];
    activityMap[d] = (activityMap[d] || 0) + 1;
  });

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'rgba(255, 255, 255, 0.05)';
    if (count === 1) return 'rgba(16, 185, 129, 0.4)';
    if (count <= 3) return 'rgba(16, 185, 129, 0.7)';
    return 'rgba(16, 185, 129, 1)';
  };

  const calendarGrid = [];
  for (let col = 0; col < WEEKS_TO_SHOW; col++) {
    const column = [];
    for (let row = 0; row < 7; row++) {
      const date = new Date(startDate.getTime() + ((col * 7 + row) * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      column.push({ date: dateStr, count: activityMap[dateStr] || 0 });
    }
    calendarGrid.push(column);
  }

  // 2. Top 5 Sites
  const sitesCount: Record<string, number> = {};
  items.forEach(i => {
    if (i.url && i.category === 'login') {
      try {
        const hostname = new URL(i.url).hostname.replace(/^www\./, '');
        sitesCount[hostname] = (sitesCount[hostname] || 0) + 1;
      } catch (e) {}
    }
  });
  const topSites = Object.entries(sitesCount).sort((a,b) => b[1] - a[1]).slice(0, 5);

  // 3. Top 5 Emails
  const emailsCount: Record<string, number> = {};
  items.forEach(i => {
    if (i.username && i.username.includes('@')) {
      emailsCount[i.username] = (emailsCount[i.username] || 0) + 1;
    }
  });
  const topEmails = Object.entries(emailsCount).sort((a,b) => b[1] - a[1]).slice(0, 5);

  // 4. Categories Stats
  const categoryCount = items.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)', padding: '40px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <ShieldAlert size={32} color="var(--text-secondary)" />
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{t.wtTitle || 'Watchtower'}</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', fontSize: '0.95rem' }}>
              {t.wtDesc || 'Recibe alertas sobre problemas de seguridad que te afecten. Tu puntuación evalúa la fortaleza (entropía), reutilización, obsolescencia y seguridad web (HTTPS) de tus elementos. Adopta medidas para abordar los elementos señalados y aumentar la seguridad.'}
            </p>
            <button style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <ExternalLink size={16} /> {t.wtShare || 'Compartir mi puntuación'}
            </button>
          </div>

          {/* Score Gauge */}
          <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 100 100" style={{ position: 'absolute', width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-tertiary)" strokeWidth="10" />
              <circle cx="50" cy="50" r="45" fill="none" stroke={scoreColor} strokeWidth="10" strokeDasharray={strokeDasharray} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease-out' }} />
            </svg>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', zIndex: 1, color: scoreColor }}>{score}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', zIndex: 1, letterSpacing: '1px' }}>{t.wtScore || 'PUNTUACIÓN'}</div>
          </div>
        </div>

        {/* Progress Bar overall */}
        <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', padding: '20px', marginBottom: '32px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '16px' }}>{t.wtOverall || 'Nivel de seguridad general de contraseñas'}</div>
          <div style={{ height: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', display: 'flex', overflow: 'hidden' }}>
            <div style={{ width: `${healthyPercent}%`, backgroundColor: '#10b981', transition: 'width 1s' }}></div>
            <div style={{ width: `${reusedPercent}%`, backgroundColor: '#eab308', transition: 'width 1s' }}></div>
            <div style={{ width: `${weakPercent}%`, backgroundColor: '#ef4444', transition: 'width 1s' }}></div>
          </div>
        </div>

        {/* Alerts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
          
          <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-10px', top: '20px', opacity: 0.1 }}><KeyRound size={80} /></div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px', color: reusedItems.length > 0 ? '#eab308' : 'inherit' }}>{reusedItems.length}</div>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{t.wtReused || 'Contraseñas reutilizadas'}</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4', marginBottom: '24px', minHeight: '60px' }}>{t.wtReusedDesc || 'No uses la misma contraseña para varios sitios web. Genera contraseñas exclusivas para mejorar tu seguridad.'}</p>
            <button onClick={() => onFilter(reusedItems.map(i => i.id))} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', padding: 0, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>{t.wtShowItems || 'Mostrar elementos →'}</button>
          </div>

          <div style={{ backgroundColor: weakItems.length > 0 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-tertiary)', border: weakItems.length > 0 ? '1px solid rgba(239, 68, 68, 0.2)' : 'none', borderRadius: '12px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-10px', top: '20px', opacity: 0.1, color: weakItems.length > 0 ? '#ef4444' : 'inherit' }}><Lock size={80} /></div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px', color: weakItems.length > 0 ? '#ef4444' : 'inherit' }}>{weakItems.length}</div>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: weakItems.length > 0 ? '#fca5a5' : 'inherit' }}>{t.wtWeak || 'Contraseñas débiles'}</div>
            <p style={{ color: weakItems.length > 0 ? 'rgba(252, 165, 165, 0.8)' : 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4', marginBottom: '24px', minHeight: '60px' }}>{t.wtWeakDesc || 'Identificadas por baja entropía (<40 bits). Son más fáciles de descifrar por fuerza bruta. Usa el generador.'}</p>
            <button onClick={() => onFilter(weakItems.map(i => i.id))} style={{ background: 'none', border: 'none', color: weakItems.length > 0 ? '#fca5a5' : 'var(--accent-primary)', padding: 0, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>{t.wtShowItems || 'Mostrar elementos →'}</button>
          </div>

          <div style={{ backgroundColor: passkeyItems.length > 0 ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-tertiary)', border: passkeyItems.length > 0 ? '1px solid rgba(139, 92, 246, 0.2)' : 'none', borderRadius: '12px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-10px', top: '20px', opacity: 0.1, color: passkeyItems.length > 0 ? '#8b5cf6' : 'inherit' }}><Fingerprint size={80} /></div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px', color: passkeyItems.length > 0 ? '#a78bfa' : 'inherit' }}>{passkeyItems.length}</div>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: passkeyItems.length > 0 ? '#c4b5fd' : 'inherit' }}>{t.wtPasskeys || 'Claves disponibles'}</div>
            <p style={{ color: passkeyItems.length > 0 ? 'rgba(196, 181, 253, 0.8)' : 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4', marginBottom: '24px', minHeight: '60px' }}>{t.wtPasskeysDesc || 'Las claves son una alternativa más segura que las contraseñas, inmunes al phishing.'}</p>
            <button onClick={() => onFilter(passkeyItems.map(i => i.id))} style={{ background: 'none', border: 'none', color: passkeyItems.length > 0 ? '#c4b5fd' : 'var(--accent-primary)', padding: 0, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>{t.wtShowItems || 'Mostrar elementos →'}</button>
          </div>

          <div style={{ backgroundColor: active2FAItems.length > 0 ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-tertiary)', border: active2FAItems.length > 0 ? '1px solid rgba(59, 130, 246, 0.2)' : 'none', borderRadius: '12px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-10px', top: '20px', opacity: 0.1, color: active2FAItems.length > 0 ? '#3b82f6' : 'inherit' }}><ShieldAlert size={80} /></div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px', color: active2FAItems.length > 0 ? '#60a5fa' : 'inherit' }}>{active2FAItems.length}</div>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: active2FAItems.length > 0 ? '#93c5fd' : 'inherit' }}>{t.wt2FA || 'Autenticación de dos factores'}</div>
            <p style={{ color: active2FAItems.length > 0 ? 'rgba(147, 197, 253, 0.8)' : 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4', marginBottom: '24px', minHeight: '60px' }}>{t.wt2FADesc || 'Sitios que están protegidos mediante códigos de verificación de un solo uso (OTP).'}</p>
            <button onClick={() => onFilter(active2FAItems.map(i => i.id))} style={{ background: 'none', border: 'none', color: active2FAItems.length > 0 ? '#93c5fd' : 'var(--accent-primary)', padding: 0, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>{t.wtShowItems || 'Mostrar elementos →'}</button>
          </div>

          <div style={{ backgroundColor: httpItems.length > 0 ? 'rgba(249, 115, 22, 0.1)' : 'var(--bg-tertiary)', border: httpItems.length > 0 ? '1px solid rgba(249, 115, 22, 0.2)' : 'none', borderRadius: '12px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-10px', top: '20px', opacity: 0.1, color: httpItems.length > 0 ? '#f97316' : 'inherit' }}><Globe size={80} /></div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px', color: httpItems.length > 0 ? '#fb923c' : 'inherit' }}>{httpItems.length}</div>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: httpItems.length > 0 ? '#fdba74' : 'inherit' }}>{t.wtHTTP || 'Sitios no seguros (HTTP)'}</div>
            <p style={{ color: httpItems.length > 0 ? 'rgba(253, 186, 116, 0.8)' : 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4', marginBottom: '24px', minHeight: '60px' }}>{t.wtHTTPDesc || 'Las contraseñas en sitios sin HTTPS pueden ser interceptadas en la red.'}</p>
            <button onClick={() => onFilter(httpItems.map(i => i.id))} style={{ background: 'none', border: 'none', color: httpItems.length > 0 ? '#fdba74' : 'var(--accent-primary)', padding: 0, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>{t.wtShowItems || 'Mostrar elementos →'}</button>
          </div>

          <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-10px', top: '20px', opacity: 0.1 }}><Clock size={80} /></div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px' }}>{oldItems.length}</div>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{t.wtOld || 'Contraseñas antiguas'}</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4', marginBottom: '24px', minHeight: '60px' }}>{t.wtOldDesc || 'Llevan más de 6 meses sin actualizarse. Es una buena práctica rotar contraseñas críticas periódicamente.'}</p>
            <button onClick={() => onFilter(oldItems.map(i => i.id))} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', padding: 0, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>{t.wtShowItems || 'Mostrar elementos →'}</button>
          </div>

        </div>

        {/* --- ANALYTICS DASHBOARD SECTION --- */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', marginTop: '60px' }}>
          <BarChart2 size={24} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{t.wtAnalyticsTitle || 'Panel de Analíticas'}</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
          
          {/* Calendar Heatmap */}
          <div style={{ gridColumn: '1 / -1', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Activity size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>{t.wtHeatmapTitle || 'Actividad de guardado (Últimos meses)'}</h3>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
              {/* Day Labels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.65rem', color: 'var(--text-secondary)', paddingRight: '4px' }}>
                <span style={{ height: '14px', lineHeight: '14px' }}>Lun</span>
                <span style={{ height: '14px', lineHeight: '14px' }}></span>
                <span style={{ height: '14px', lineHeight: '14px' }}>Mié</span>
                <span style={{ height: '14px', lineHeight: '14px' }}></span>
                <span style={{ height: '14px', lineHeight: '14px' }}>Vie</span>
                <span style={{ height: '14px', lineHeight: '14px' }}></span>
                <span style={{ height: '14px', lineHeight: '14px' }}></span>
              </div>
              
              {/* Grid columns */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {calendarGrid.map((col, colIdx) => (
                  <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {col.map((cell, rowIdx) => (
                      <div 
                        key={`${colIdx}-${rowIdx}`}
                        title={`${cell.date}: ${cell.count} elementos`}
                        style={{ 
                          width: '14px', 
                          height: '14px', 
                          borderRadius: '3px', 
                          backgroundColor: getHeatmapColor(cell.count),
                          cursor: 'help'
                        }} 
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>{t.wtHeatmapLess || 'Menos'}</span>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'rgba(16, 185, 129, 0.4)' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'rgba(16, 185, 129, 0.7)' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'rgba(16, 185, 129, 1)' }} />
              <span>{t.wtHeatmapMore || 'Más'}</span>
            </div>
          </div>

          {/* Top Sites */}
          <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Globe size={20} color="#3b82f6" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>{t.wtTopSites || 'Dominios más utilizados'}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topSites.length === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.wtNoData || 'No hay datos suficientes.'}</span>}
              {topSites.map(([domain, count], idx) => {
                const max = topSites[0][1] || 1;
                const percent = (count / max) * 100;
                return (
                  <div key={domain}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 500 }}>{domain}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{count} {t.wtAccounts || 'cuentas'}</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${percent}%`, backgroundColor: '#3b82f6', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Emails */}
          <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Mail size={20} color="#8b5cf6" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>{t.wtTopEmails || 'Correos electrónicos más usados'}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topEmails.length === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.wtNoData || 'No hay datos suficientes.'}</span>}
              {topEmails.map(([email, count], idx) => {
                const max = topEmails[0][1] || 1;
                const percent = (count / max) * 100;
                return (
                  <div key={email}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{email}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{count} {t.wtAccounts || 'cuentas'}</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${percent}%`, backgroundColor: '#8b5cf6', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Categories Breakdown */}
          <div style={{ gridColumn: '1 / -1', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, marginBottom: '20px' }}>{t.wtCategoriesTitle || 'Resumen de bóveda por tipo'}</h3>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 calc(25% - 16px)', backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: 'rgba(14, 165, 233, 0.1)', borderRadius: '8px' }}><Lock size={24} color="#0ea5e9" /></div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{categoryCount['login'] || 0}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.wtCatLogins || 'Inicios de sesión'}</div>
                </div>
              </div>

              <div style={{ flex: '1 1 calc(25% - 16px)', backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}><CreditCard size={24} color="#3b82f6" /></div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{(categoryCount['credit_card'] || 0) + (categoryCount['bank_account'] || 0)}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.wtCatCards || 'Tarjetas y Bancos'}</div>
                </div>
              </div>

              <div style={{ flex: '1 1 calc(25% - 16px)', backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}><Shield size={24} color="#10b981" /></div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{(categoryCount['identity'] || 0) + (categoryCount['document'] || 0)}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.wtCatIds || 'Identidades / Docs'}</div>
                </div>
              </div>

              <div style={{ flex: '1 1 calc(25% - 16px)', backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}><FileText size={24} color="#f59e0b" /></div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{categoryCount['secure_note'] || 0}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.wtCatNotes || 'Notas seguras'}</div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
