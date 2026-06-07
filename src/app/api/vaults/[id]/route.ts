import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getAuthUser } from '../../../../lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const { id } = await params;
    const data = await request.json();
    
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.safeForTravel !== undefined) updateData.safeForTravel = data.safeForTravel;

    const updated = await prisma.vault.update({
      where: { id },
      data: updateData,
      include: { _count: { select: { items: true } } }
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update vault' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const { id } = await params;

    // Check vault exists
    const vault = await prisma.vault.findUnique({
      where: { id },
      include: { _count: { select: { items: true } } }
    });

    if (!vault) {
      return NextResponse.json({ error: 'Vault not found' }, { status: 404 });
    }

    // Delete the vault (items cascade via schema)
    await prisma.vault.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/vaults/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete vault' }, { status: 500 });
  }
}
