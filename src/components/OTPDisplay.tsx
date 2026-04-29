'use client';

import React, { useState, useEffect } from 'react';
import * as OTPAuth from 'otpauth';
import { Copy, CheckCircle2 } from 'lucide-react';

interface OTPDisplayProps {
  secret: string;
}

export default function OTPDisplay({ secret }: OTPDisplayProps) {
  const [code, setCode] = useState<string>('');
  const [progress, setProgress] = useState<number>(100);
  const [seconds, setSeconds] = useState<number>(30);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const rawCode = code.replace(/\s+/g, '');
    navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    let totp: OTPAuth.TOTP;
    try {
      totp = new OTPAuth.TOTP({
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret)
      });
    } catch (e) {
      console.error("Invalid secret for TOTP", e);
      return;
    }

    const updateOTP = () => {
      const newCode = totp.generate();
      // format code with a space in the middle: 123 456
      setCode(`${newCode.slice(0, 3)} ${newCode.slice(3)}`);
      
      const secondsLeft = 30 - (Math.floor(Date.now() / 1000) % 30);
      setProgress((secondsLeft / 30) * 100);
      setSeconds(secondsLeft);
    };

    updateOTP();
    const interval = setInterval(updateOTP, 1000);

    return () => clearInterval(interval);
  }, [secret]);

  const radius = 14;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (!code) return <span style={{ color: 'var(--text-secondary)' }}>Invalid Secret</span>;

  // Render the code with a clear separator like in the screenshot
  const codeParts = code.split(' ');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ fontSize: '1.4rem', fontFamily: 'monospace', fontWeight: 'bold', display: 'flex', gap: '8px', letterSpacing: '2px', color: 'white' }}>
        <span>{codeParts[0]}</span>
        <span style={{ color: 'var(--text-secondary)' }}>•</span>
        <span>{codeParts[1]}</span>
      </div>
      <div style={{ position: 'relative', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="36" height="36" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="3"
            fill="transparent"
            r={radius}
            cx="18"
            cy="18"
          />
          <circle
            stroke={seconds <= 5 ? '#ef4444' : '#3b82f6'}
            strokeWidth="3"
            fill="transparent"
            r={radius}
            cx="18"
            cy="18"
            style={{ 
              strokeDasharray: `${circumference} ${circumference}`, 
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' 
            }}
            strokeLinecap="round"
          />
        </svg>
        <div style={{ position: 'absolute', fontSize: '0.7rem', fontWeight: 'bold', color: seconds <= 5 ? '#ef4444' : 'var(--text-secondary)' }}>
          {seconds}
        </div>
      </div>
      <button onClick={handleCopy} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
        {copied ? <CheckCircle2 size={18} color="#10b981" /> : <Copy size={18} />}
      </button>
    </div>
  );
}
