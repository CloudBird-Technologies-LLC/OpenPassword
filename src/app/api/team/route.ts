import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      include: {
        vaults: {
          include: { vault: true }
        }
      }
    });

    return NextResponse.json({ data: members });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const member = await prisma.teamMember.create({
      data: {
        name: body.name,
        email: body.email,
        initial: body.name.charAt(0).toUpperCase(),
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      }
    });
    return NextResponse.json({ data: member });
  } catch {
    return NextResponse.json({ error: 'Failed to create member' }, { status: 400 });
  }
}
