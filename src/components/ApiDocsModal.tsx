import React from 'react';
import { X, Code, Server, Smartphone, Globe } from 'lucide-react';

interface ApiDocsProps {
  onBack: () => void;
}

const endpoints = [
  {
    path: 'Autenticación',
    method: 'HEADER',
    description: 'Todas las peticiones a la API deben incluir una API Key en el header Authorization o usar la sesión de navegador.',
    payload: 'Authorization: Bearer op_...',
    response: 'Acceso concedido si la clave es válida'
  },
  {
    path: '/api/items',
    method: 'GET',
    description: 'Obtiene todos los elementos (contraseñas, notas) del usuario.',
    payload: 'Ninguno',
    response: '[ { "id": "cuid", "title": "Google", "username": "...", ... } ]'
  },
  {
    path: '/api/items',
    method: 'POST',
    description: 'Crea un nuevo elemento en una bóveda.',
    payload: '{ "title": "...", "username": "...", "password": "...", "vaultId": "..." }',
    response: '{ "id": "cuid", "title": "...", ... }'
  },
  {
    path: '/api/vaults',
    method: 'GET',
    description: 'Obtiene todas las bóvedas a las que el usuario tiene acceso.',
    payload: 'Ninguno',
    response: '[ { "id": "cuid", "name": "Personal", ... } ]'
  },
  {
    path: '/api/share',
    method: 'POST',
    description: 'Genera un enlace temporal para compartir un elemento.',
    payload: '{ "itemId": "cuid", "expiresInDays": 7, "viewOnce": true }',
    response: '{ "url": "https://..." }'
  },
  {
    path: '/api/user/profile',
    method: 'PUT',
    description: 'Actualiza el perfil del usuario activo.',
    payload: '{ "name": "Nuevo Nombre", "avatarUrl": "https://..." }',
    response: '{ "success": true }'
  },
  {
    path: '/api/devices',
    method: 'GET',
    description: 'Obtiene la lista de dispositivos vinculados a la cuenta.',
    payload: 'Ninguno',
    response: '[ { "id": "cuid", "name": "Chrome (Windows)", "ip": "...", ... } ]'
  }
];

export default function ApiDocs({ onBack }: ApiDocsProps) {
  return (
    <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Code size={24} color="#3b82f6" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Documentación de API</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Definición técnica para App Móvil y Extensión</p>
            </div>
          </div>
          <button onClick={onBack} style={{ background: 'var(--bg-tertiary)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#10b981' }}>
                <Smartphone size={20} /> <h3 style={{ margin: 0 }}>Mobile App Stack</h3>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <li><strong>Framework:</strong> React Native / Expo</li>
                <li><strong>Auth:</strong> JWT Bearer Tokens</li>
                <li><strong>Network:</strong> RESTful API via fetch/axios</li>
              </ul>
            </div>
            
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#f59e0b' }}>
                <Globe size={20} /> <h3 style={{ margin: 0 }}>Browser Extension Stack</h3>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <li><strong>Environment:</strong> Chrome V3 Manifest</li>
                <li><strong>Storage:</strong> chrome.storage.local (Encrypted)</li>
                <li><strong>Communication:</strong> Background Service Workers</li>
              </ul>
            </div>
          </div>

          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} /> Endpoints Principales
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {endpoints.map((ep, i) => (
              <div key={i} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold', 
                    backgroundColor: ep.method === 'GET' ? 'rgba(59, 130, 246, 0.2)' : ep.method === 'POST' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: ep.method === 'GET' ? '#60a5fa' : ep.method === 'POST' ? '#34d399' : '#fbbf24'
                  }}>
                    {ep.method}
                  </span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{ep.path}</span>
                </div>
                <div style={{ padding: '16px' }}>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{ep.description}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Payload</div>
                      <pre style={{ margin: 0, padding: '12px', backgroundColor: '#121212', borderRadius: '8px', fontSize: '0.8rem', overflowX: 'auto', border: '1px solid #333' }}>
                        {ep.payload}
                      </pre>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Response</div>
                      <pre style={{ margin: 0, padding: '12px', backgroundColor: '#121212', borderRadius: '8px', fontSize: '0.8rem', overflowX: 'auto', border: '1px solid #333' }}>
                        {ep.response}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
  );
}
