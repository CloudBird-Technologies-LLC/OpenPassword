import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import SharedItemClient from './SharedItemClient';

const prisma = new PrismaClient();

export default async function SharedLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const sharedLink = await prisma.sharedLink.findUnique({
    where: { id: resolvedParams.id },
    include: { item: true }
  });

  if (!sharedLink) {
    notFound();
  }

  if (sharedLink.expiresAt < new Date()) {
    return (
      <div style={{ flex: 1, width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#121212', color: 'white' }}>
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#1e1e1e', borderRadius: '16px', border: '1px solid #333' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '16px', color: '#ef4444' }}>Enlace caducado</h1>
          <p style={{ color: '#9ca3af' }}>Este enlace compartido ha expirado y ya no está disponible.</p>
        </div>
      </div>
    );
  }

  if (sharedLink.viewOnce && sharedLink.viewsCount > 0) {
    return (
      <div style={{ flex: 1, width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#121212', color: 'white' }}>
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#1e1e1e', borderRadius: '16px', border: '1px solid #333' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '16px', color: '#ef4444' }}>Enlace consumido</h1>
          <p style={{ color: '#9ca3af' }}>Este enlace estaba configurado para verse solo 1 vez y ya ha sido utilizado.</p>
        </div>
      </div>
    );
  }

  // Pass the data to a client component to handle the "Guest Login" flow
  return <SharedItemClient sharedLink={sharedLink} />;
}
