import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET() {
  try {
    const configured = await prisma.user.count() > 0;
    return NextResponse.json({ configured });
  } catch (error) {
    console.error('AUTH STATUS ERROR:', error);
    return NextResponse.json({ error: 'No fue posible consultar la instancia.' }, { status: 500 });
  }
}
