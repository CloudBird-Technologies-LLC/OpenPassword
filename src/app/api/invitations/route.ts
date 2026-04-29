import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const invitations = await prisma.invitation.findMany();
    return NextResponse.json({ data: invitations });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const invitation = await prisma.invitation.create({
      data: {
        email: body.email,
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
      }
    });
    return NextResponse.json({ data: invitation });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 400 });
  }
}
