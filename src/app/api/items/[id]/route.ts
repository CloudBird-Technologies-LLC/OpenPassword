import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import type { NextRequest } from 'next/server';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.passwordItem.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: any = {
      title: body.title,
      username: body.username,
      password: body.password,
      url: body.url,
      otpSecret: body.otpSecret,
      notes: body.notes,
      category: body.category,
      vaultId: body.vaultId,
      customFields: body.customFields,
      passkey: body.passkey,
    };

    if (body.isArchived !== undefined) data.isArchived = body.isArchived;
    if (body.isFavorite !== undefined) data.isFavorite = body.isFavorite;

    // Handle tags if provided
    if (body.tags !== undefined) {
      // Tags logic can be complex, for now we will just connect existing ones or create new
      // Since it's complex, we might just set them
      data.tags = {
        set: [], // clear existing
        connectOrCreate: body.tags.map((tag: string) => ({
          where: { name: tag },
          create: { name: tag, color: '#3b82f6' }
        }))
      };
    }

    const updatedItem = await prisma.passwordItem.update({
      where: { id },
      data,
      include: { tags: true }
    });

    return NextResponse.json({ data: updatedItem });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}
