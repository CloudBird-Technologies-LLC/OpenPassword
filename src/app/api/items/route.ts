import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    const isTravelMode = user?.travelMode || false;

    const items = await prisma.passwordItem.findMany({
      where: isTravelMode ? { vault: { safeForTravel: true } } : undefined,
      orderBy: { updatedAt: 'desc' },
      include: {
        tags: true
      }
    });
    return NextResponse.json({ data: items });
  } catch (error) {
    console.error("GET /api/items error:", error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Ensure we have a vault first.
    let vault = await prisma.vault.findFirst();
    if (!vault) {
      vault = await prisma.vault.create({
        data: { name: 'Personal' }
      });
    }

    const newItem = await prisma.passwordItem.create({
      data: {
        title: body.title,
        username: body.username,
        password: body.password,
        url: body.url,
        otpSecret: body.otpSecret,
        notes: body.notes,
        category: body.category || 'login',
        vaultId: body.vaultId || vault.id,
        customFields: body.customFields || null,
        passkey: body.passkey || null,
        isArchived: body.isArchived || false,
        isFavorite: body.isFavorite || false,
        ...(body.tags && body.tags.length > 0 ? {
          tags: {
            connectOrCreate: body.tags.map((tag: string) => ({
              where: { name: tag },
              create: { name: tag, color: '#3b82f6' }
            }))
          }
        } : {})
      },
      include: {
        tags: true
      }
    });
    
    return NextResponse.json({ data: newItem }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 400 });
  }
}
