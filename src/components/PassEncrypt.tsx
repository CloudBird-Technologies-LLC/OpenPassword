import React, { useState, useEffect } from 'react';
import { Lock, Copy, CheckCircle2, RefreshCw, Hash, Shield, Key } from 'lucide-react';
import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';

export default function PassEncrypt() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('bcrypt');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // For AES encryption (requires a secret key)
  const [secretKey, setSecretKey] = useState('');

  // Generate hash/encryption whenever input or mode changes
  useEffect(() => {
    if (mode === 'file_to_base64') {
      // Don't erase output if it's already a Data URL, but if they just switched, clear it
      if (!output.startsWith('data:')) setOutput('');
      return;
    }

    if (!input) {
      setOutput('');
      return;
    }

    const processText = async () => {
      setIsProcessing(true);
      try {
        // We use a short timeout so the UI can update before heavy operations like bcrypt run
        await new Promise(resolve => setTimeout(resolve, 50)); 
        
        switch (mode) {
          case 'bcrypt':
            // 10 salt rounds is standard
            const salt = bcrypt.genSaltSync(10);
            setOutput(bcrypt.hashSync(input, salt));
            break;
          case 'sha256':
            setOutput(CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex));
            break;
          case 'sha512':
            setOutput(CryptoJS.SHA512(input).toString(CryptoJS.enc.Hex));
            break;
          case 'md5':
            setOutput(CryptoJS.MD5(input).toString(CryptoJS.enc.Hex));
            break;
          case 'base64_encode':
            setOutput(CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(input)));
            break;
          case 'base64_decode':
            try {
              setOutput(CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(input)));
            } catch (e) {
              setOutput('Cadena Base64 inválida');
            }
            break;
          case 'aes_encrypt':
            if (!secretKey) setOutput('Requiere una llave secreta para encriptar');
            else setOutput(CryptoJS.AES.encrypt(input, secretKey).toString());
            break;
          case 'aes_decrypt':
            if (!secretKey) setOutput('Requiere una llave secreta para desencriptar');
            else {
              try {
                const bytes = CryptoJS.AES.decrypt(input, secretKey);
                const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                setOutput(decrypted || 'Llave incorrecta o cadena inválida');
              } catch (e) {
                setOutput('Error al desencriptar');
              }
            }
            break;
        }
      } catch (error) {
        setOutput('Error al procesar la cadena');
      } finally {
        setIsProcessing(false);
      }
    };

    processText();
  }, [input, mode, secretKey]);

  const handleCopy = () => {
    if (!output || output.includes('inválida') || output.includes('Requiere')) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)', padding: '40px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px' }}>
            <Hash size={32} color="#8b5cf6" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>PassEncrypt</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', fontSize: '0.95rem', marginBottom: '40px' }}>
          Herramienta para desarrolladores. Genera hashes y encriptaciones de contraseñas u otros datos al instante para insertarlos directamente en bases de datos o realizar pruebas de seguridad.
        </p>

        {/* Tool Container */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          
          {/* Algorithm Selector */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ flex: 1, padding: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>Algoritmo</label>
              <div style={{ position: 'relative' }}>
                <select 
                  value={mode} 
                  onChange={(e) => setMode(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none', appearance: 'none', cursor: 'pointer', fontSize: '1rem' }}
                >
                  <optgroup label="Hashing de Contraseñas (Irreversible)">
                    <option value="bcrypt">Bcrypt (Recomendado para BD)</option>
                    <option value="sha256">SHA-256</option>
                    <option value="sha512">SHA-512</option>
                    <option value="md5">MD5 (Inseguro / Legacy)</option>
                  </optgroup>
                  <optgroup label="Codificación">
                    <option value="base64_encode">Base64 Encode</option>
                    <option value="base64_decode">Base64 Decode</option>
                  </optgroup>
                  <optgroup label="Encriptación (Reversible)">
                    <option value="aes_encrypt">AES-256 Encriptar</option>
                    <option value="aes_decrypt">AES-256 Desencriptar</option>
                  </optgroup>
                  <optgroup label="Archivos">
                    <option value="file_to_base64">Archivo a Base64 (Data URI)</option>
                  </optgroup>
                </select>
                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            {mode.includes('aes') && (
              <div style={{ flex: 1, padding: '20px', borderLeft: '1px solid var(--border-color)' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>Llave Secreta</label>
                <input 
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="SecretKey123!"
                  style={{ width: '100%', padding: '12px 16px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '1rem' }}
                />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 'bold' }}>
              <Key size={16} /> {mode === 'file_to_base64' ? 'Selecciona un archivo' : 'Cadena original'}
            </label>
            
            {mode === 'file_to_base64' ? (
              <div style={{ 
                width: '100%', 
                height: '100px', 
                backgroundColor: 'rgba(139, 92, 246, 0.05)', 
                border: '2px dashed var(--accent-primary)', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                position: 'relative',
                transition: 'all 0.2s'
              }}>
                <input 
                  type="file" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsProcessing(true);
                    const reader = new FileReader();
                    reader.onload = () => {
                      setOutput(reader.result as string);
                      setIsProcessing(false);
                    };
                    reader.readAsDataURL(file);
                  }}
                  style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
                <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>Haz clic o arrastra un archivo aquí (Imagen, PDF, etc.)</span>
              </div>
            ) : (
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ingresa la contraseña o texto aquí..."
                style={{ width: '100%', height: '100px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', color: 'white', outline: 'none', resize: 'vertical', fontSize: '1.1rem', fontFamily: 'monospace' }}
              />
            )}
          </div>

          {/* Output Area */}
          <div style={{ padding: '24px', backgroundColor: 'rgba(139, 92, 246, 0.05)', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#a78bfa', fontWeight: 'bold' }}>
                <Shield size={16} /> Resultado Generado
                {isProcessing && <RefreshCw size={14} className="spin" style={{ animation: 'spin 1s linear infinite' }} />}
              </label>

              {output && !output.includes('Requiere') && !output.includes('inválida') && (
                <button 
                  onClick={handleCopy}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: copied ? '#10b981' : '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s', fontSize: '0.85rem' }}
                >
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  {copied ? '¡Copiado!' : 'Copiar Hash'}
                </button>
              )}
            </div>
            
            <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', padding: '16px', minHeight: '80px', maxHeight: '250px', overflowY: 'auto', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.95rem', color: output ? 'white' : 'var(--text-secondary)', lineHeight: '1.5' }}>
              {output || 'Esperando entrada de texto...'}
            </div>
            
            {/* Context Help */}
            <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {mode === 'bcrypt' && 'Bcrypt incorpora un salt aleatorio automáticamente. Cada vez que generes un hash será diferente, pero coincidirá al validar en tu backend.'}
              {mode === 'sha256' && 'El hash SHA-256 es determinista. El mismo texto siempre producirá la misma cadena.'}
              {mode === 'aes_encrypt' && 'AES-256 es una encriptación simétrica. Necesitarás la misma Llave Secreta para revertir el texto a su estado original.'}
              {mode === 'file_to_base64' && 'Convierte el archivo directamente a Data URI usando la API del navegador. El archivo nunca sale de tu computadora.'}
            </div>
          </div>

        </div>

      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
