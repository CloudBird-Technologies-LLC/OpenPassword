import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    
    const updateData: any = {};
    if (data.safeForTravel !== undefined) updateData.safeForTravel = data.safeForTravel;

    const updated = await prisma.vault.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update vault' }, { status: 500 });
  }
}
