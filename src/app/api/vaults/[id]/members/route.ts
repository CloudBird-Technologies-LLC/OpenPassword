import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { getAuthUser } from '../../../../../lib/auth';

/**
 * GET /api/vaults/[id]/members
 * Returns all members assigned to a vault with their permissions.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const { id } = await params;

    const members = await prisma.vaultMember.findMany({
      where: { vaultId: id },
      include: { teamMember: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ data: members });
  } catch (error) {
    console.error('GET /api/vaults/[id]/members error:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

/**
 * POST /api/vaults/[id]/members
 * Adds a team member to the vault with specified permissions.
 *
 * Body: { teamMemberId, canView?, canCopy?, canCreate?, canEdit?, canDelete?, extensionOnly? }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    if (!body.teamMemberId) {
      return NextResponse.json({ error: 'teamMemberId is required' }, { status: 400 });
    }

    // Check if already a member
    const existing = await prisma.vaultMember.findUnique({
      where: { vaultId_teamMemberId: { vaultId: id, teamMemberId: body.teamMemberId } },
    });
    if (existing) {
      return NextResponse.json({ error: 'User is already a member of this vault' }, { status: 409 });
    }

    const member = await prisma.vaultMember.create({
      data: {
        vaultId: id,
        teamMemberId: body.teamMemberId,
        canView: body.canView ?? true,
        canCopy: body.canCopy ?? true,
        canCreate: body.canCreate ?? false,
        canEdit: body.canEdit ?? false,
        canDelete: body.canDelete ?? false,
        extensionOnly: body.extensionOnly ?? false,
      },
      include: { teamMember: true },
    });

    return NextResponse.json({ data: member }, { status: 201 });
  } catch (error) {
    console.error('POST /api/vaults/[id]/members error:', error);
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}
