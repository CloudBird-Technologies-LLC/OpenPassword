import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getAuthUser } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const url = new URL(request.url);
    const fetchAll = url.searchParams.get('all') === 'true';

    const isTravelMode = user.travelMode || false;

    const vaults = await prisma.vault.findMany({
      where: isTravelMode && !fetchAll ? { safeForTravel: true } : undefined,
      include: {
        _count: {
          select: { items: true, members: true }
        },
        members: {
          include: { teamMember: true },
          take: 5
        }
      }
    });
    return NextResponse.json({ data: vaults });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vaults' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

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
