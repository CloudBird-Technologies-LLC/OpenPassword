import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

/**
 * DELETE /api/apikeys/[id]
 * Revokes (deletes) an API key by ID.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    // Ensure the key belongs to this user
    const key = await prisma.apiKey.findFirst({ where: { id, userId: user.id } });
    if (!key) return NextResponse.json({ error: 'API key not found' }, { status: 404 });

    await prisma.apiKey.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/apikeys/[id] error:', error);
    return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 });
  }
}
