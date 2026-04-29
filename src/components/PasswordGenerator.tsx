'use client';

import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Check } from 'lucide-react';

interface PasswordGeneratorProps {
  onSelectPassword?: (password: string) => void;
}

export default function PasswordGenerator({ onSelectPassword }: PasswordGeneratorProps) {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(20);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~|}{[]:;?><,./-=';
    
    let validChars = chars;
    if (useNumbers) validChars += numbers;
    if (useSymbols) validChars += symbols;

    let generated = '';
    for (let i = 0; i < length; i++) {
      generated += validChars.charAt(Math.floor(Math.random() * validChars.length));
    }
    setPassword(generated);
    if (onSelectPassword) onSelectPassword(generated);
  };

  useEffect(() => {
    generatePassword();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, useNumbers, useSymbols]);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Generador de contraseñas</h3>
        <button className="button" onClick={generatePassword} title="Regenerar">
          <RefreshCw size={16} />
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        <input 
          type="text" 
          value={password} 
          readOnly 
          style={{ width: '100%', padding: '16px', fontSize: '1.2rem', fontFamily: 'monospace', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', letterSpacing: '2px' }}
        />
        <button 
          className={`button ${copied ? 'primary' : ''}`}
          onClick={handleCopy}
          style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />} 
          {copied ? ' Copiado' : ' Copiar'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Longitud: {length}</label>
          <input 
            type="range" 
            min="8" 
            max="64" 
            value={length} 
            onChange={(e) => setLength(parseInt(e.target.value))}
            style={{ flex: 1, marginLeft: '16px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }} />
            Números
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }} />
            Símbolos
          </label>
        </div>
      </div>
    </div>
  );
}
