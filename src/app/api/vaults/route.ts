import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const fetchAll = url.searchParams.get('all') === 'true';

    const user = await prisma.user.findFirst();
    const isTravelMode = user?.travelMode || false;

    const vaults = await prisma.vault.findMany({
      where: isTravelMode && !fetchAll ? { safeForTravel: true } : undefined,
      include: {
        _count: {
          select: { items: true }
        }
      }
    });
    return NextResponse.json({ data: vaults });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vaults' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newVault = await prisma.vault.create({
      data: {
        name: body.name,
        icon: body.icon,
      }
    });
    return NextResponse.json({ data: newVault }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create vault' }, { status: 400 });
  }
}
