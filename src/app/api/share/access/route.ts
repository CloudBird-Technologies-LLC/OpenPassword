import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { linkId, email, password } = await req.json();

    if (!linkId || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sharedLink = await prisma.sharedLink.findUnique({
      where: { id: linkId }
    });

    if (!sharedLink) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    if (sharedLink.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Link expired' }, { status: 403 });
    }

    if (sharedLink.viewOnce && sharedLink.viewsCount > 0) {
      return NextResponse.json({ error: 'Link already consumed' }, { status: 403 });
    }

    // Increment views count
    await prisma.sharedLink.update({
      where: { id: linkId },
      data: { viewsCount: { increment: 1 } }
    });

    // Add them to the Team (panel general)
    const existingMember = await prisma.teamMember.findUnique({
      where: { email }
    });

    if (!existingMember) {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      await prisma.teamMember.create({
        data: {
          name: email.split('@')[0],
          email,
          role: 'Invitado',
          status: 'Activo',
          initial: email.charAt(0).toUpperCase(),
          color: randomColor
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error accessing share link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
