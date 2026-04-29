'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { KeyRound, Download, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { customAlert } from '../../components/GlobalModals';

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [secretKey, setSecretKey] = useState('');
  const [pdfSaved, setPdfSaved] = useState(false);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      customAlert('Las contraseñas no coinciden', true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (res.ok) {
        setSecretKey(json.data.secretKey);
        setStep(2);
      } else {
        customAlert(json.error || 'Error al crear cuenta', true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Colores y tipografía
    doc.setFillColor(220, 53, 69); // OpenPassword Emergency Kit header color
    doc.rect(15, 15, 180, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('OpenPassword Emergency Kit', 25, 33);
    
    doc.setTextColor(220, 53, 69);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const today = new Date().toLocaleDateString('es-ES');
    doc.text(`Creado para ${email} el ${today}`, 105, 48, { align: 'center' });

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.text("Si pierdes el acceso a tu cuenta, necesitarás estos datos para iniciar sesión.", 15, 60);
    doc.setFont('helvetica', 'bold');
    doc.text("Incluyendo tu Secret Key, a la cual nosotros no tenemos acceso.", 15, 66);
    
    // Lista de instrucciones
    doc.setFont('helvetica', 'normal');
    doc.text("1. Imprime una copia de este Emergency Kit.", 15, 76);
    doc.text("2. Escribe tu Contraseña Maestra en el espacio en blanco inferior.", 15, 83);
    doc.text("3. Guárdalo en un lugar seguro (junto a tus documentos importantes).", 15, 90);

    // Caja de datos
    doc.setFillColor(255, 240, 240);
    doc.setDrawColor(220, 53, 69);
    doc.roundedRect(15, 100, 180, 80, 3, 3, 'FD');
    
    doc.setTextColor(220, 53, 69);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Detalles de cuenta OpenPassword", 105, 110, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("DIRECCIÓN DE INICIO DE SESIÓN", 20, 120);
    doc.setFillColor(255, 255, 255);
    doc.rect(20, 122, 170, 10, 'F');
    doc.setTextColor(220, 53, 69);
    doc.setFontSize(11);
    doc.text(window.location.origin, 23, 129);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("DIRECCIÓN DE CORREO ELECTRÓNICO", 20, 140);
    doc.setFillColor(255, 255, 255);
    doc.rect(20, 142, 170, 10, 'F');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.text(email, 23, 149);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("SECRET KEY", 20, 160);
    doc.setFillColor(255, 255, 255);
    doc.rect(20, 162, 170, 10, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(11);
    doc.text(secretKey, 23, 169);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("CONTRASEÑA", 20, 180);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 53, 69);
    doc.rect(20, 182, 170, 10, 'FD'); // Caja para escribir a mano

    // QR Code
    try {
      // Create a setup payload string that mobile apps could potentially read
      const setupPayload = `op://setup?email=${encodeURIComponent(email)}&secret=${encodeURIComponent(secretKey)}`;
      const qrDataUrl = await QRCode.toDataURL(setupPayload, { width: 60, margin: 0 });
      doc.addImage(qrDataUrl, 'PNG', 75, 195, 60, 60);
      
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'bold');
      doc.text("Código de Configuración", 145, 210);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text("Escanea este código con\nlas apps de OpenPassword\npara configurar tu cuenta\nrápidamente.", 145, 216);

    } catch (e) {
      console.error("Error generating QR", e);
    }

    doc.save(`Emergency-Kit-OpenPassword-${email}.pdf`);
    setPdfSaved(true);
  };

  const finishSetup = () => {
    // Save minimal auth state to localStorage or cookies in a real app
    document.cookie = `auth_token=true; path=/`;
    router.push('/');
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', color: 'var(--text-primary)', fontFamily: 'sans-serif' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        
        {step === 1 && (
          <div style={{ maxWidth: '400px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', marginBottom: '16px' }}>
                <KeyRound size={30} color="#fff" />
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Crear una cuenta</h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Bienvenido a OpenPassword</p>
            </div>

            <form onSubmit={handleCreateAccount} style={{ backgroundColor: 'var(--bg-secondary)', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Correo electrónico</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', fontSize: '1rem', color: 'var(--text-primary)' }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Contraseña Maestra</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', fontSize: '1rem', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Confirmar Contraseña</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', fontSize: '1rem', color: 'var(--text-primary)' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ width: '100%', padding: '14px', borderRadius: '6px', backgroundColor: 'var(--accent-primary)', color: '#fff', fontSize: '1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '50px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-primary)' }}>Obtén tu Secret Key única</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.5' }}>
                Tu <strong>Secret Key</strong> se genera localmente. Solo te pertenece a ti, así que no la compartas nunca. Es vital para descifrar tus datos y recuperar tu cuenta.
              </p>

              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '30px', borderRadius: '12px', marginBottom: '30px', border: '1px dashed var(--border-color)' }}>
                <div style={{ fontSize: '1.5rem', fontFamily: 'monospace', letterSpacing: '2px', color: 'var(--text-primary)', fontWeight: 'bold', wordBreak: 'break-all' }}>
                  {secretKey}
                </div>
              </div>

              {pdfSaved ? (
                <div style={{ padding: '20px', backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '30px', fontWeight: '500' }}>
                  <CheckCircle size={24} /> Has guardado tu Secret Key
                </div>
              ) : (
                <button 
                  onClick={generatePDF}
                  style={{ width: '100%', padding: '16px', borderRadius: '8px', backgroundColor: 'var(--accent-primary)', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}
                >
                  <Download size={20} /> Guardar PDF (Emergency Kit)
                </button>
              )}

              {pdfSaved && (
                <button 
                  onClick={finishSetup}
                  style={{ width: '100%', padding: '16px', borderRadius: '8px', backgroundColor: 'var(--accent-primary)', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                  Continuar a mi bóveda <ArrowRight size={20} />
                </button>
              )}

              {!pdfSaved && (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
                  <ShieldCheck size={24} style={{ flexShrink: 0 }} /> 
                  No tenemos ningún registro de tu Secret Key. Asegúrate de guardarla ahora o podrías perder el acceso a todos tus datos.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
      
      {step === 1 && (
        <div style={{ width: '400px', backgroundColor: 'var(--bg-secondary)', padding: '60px 40px', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '16px' }}>GUÍA DE SEGURIDAD</h3>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '20px', lineHeight: '1.3' }}>¿Qué tan segura es mi contraseña maestra?</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1rem', marginBottom: '20px' }}>
            Como usuario promedio de Internet, probablemente tienes más de 100 contraseñas para varias cuentas en línea. Todas estas credenciales deben ser fuertes y únicas.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1rem' }}>
            OpenPassword te permite recordar una sola Contraseña Maestra. Úsala junto con tu Secret Key para cifrar todo tu entorno digital con encriptación AES-256 de grado militar.
          </p>
        </div>
      )}
    </div>
  );
}
