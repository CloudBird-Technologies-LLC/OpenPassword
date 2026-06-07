import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { getAuthUser } from '../../../../../../lib/auth';

/**
 * PUT /api/vaults/[id]/members/[memberId]
 * Updates permissions for a vault member.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const { id, memberId } = await params;
    const body = await request.json();

    const updateData: any = {};
    if (body.canView !== undefined) updateData.canView = body.canView;
    if (body.canCopy !== undefined) updateData.canCopy = body.canCopy;
    if (body.canCreate !== undefined) updateData.canCreate = body.canCreate;
    if (body.canEdit !== undefined) updateData.canEdit = body.canEdit;
    if (body.canDelete !== undefined) updateData.canDelete = body.canDelete;
    if (body.extensionOnly !== undefined) updateData.extensionOnly = body.extensionOnly;

    // If extensionOnly is enabled, disable view and copy (user never sees credentials)
    if (body.extensionOnly === true) {
      updateData.canView = false;
      updateData.canCopy = false;
    }

    const updated = await prisma.vaultMember.update({
      where: { id: memberId, vaultId: id },
      data: updateData,
      include: { teamMember: true },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('PUT /api/vaults/[id]/members/[memberId] error:', error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

/**
 * DELETE /api/vaults/[id]/members/[memberId]
 * Removes a member from the vault.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const { id, memberId } = await params;

    await prisma.vaultMember.delete({
      where: { id: memberId, vaultId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/vaults/[id]/members/[memberId] error:', error);
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
