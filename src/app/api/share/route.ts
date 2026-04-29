import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { itemId, expiresInDays, viewOnce } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 7));

    const sharedLink = await prisma.sharedLink.create({
      data: {
        itemId,
        expiresAt,
        viewOnce: viewOnce || false
      }
    });

    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const shareUrl = `${protocol}://${host}/share/${sharedLink.id}`;

    return NextResponse.json({ url: shareUrl });
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
  }
}
