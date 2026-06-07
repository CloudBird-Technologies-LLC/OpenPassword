import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    let members = await prisma.teamMember.findMany({
      include: {
        vaults: {
          include: { vault: true }
        }
      }
    });
    
    // Seed if empty
    if (members.length === 0) {
      await prisma.$transaction(
        [
          { name: 'CloudBird Technologies', email: 'soporte@cloudbird.com.mx', status: 'Activo', initial: 'C', color: '#3b82f6' },
          { name: 'DemiLexor', email: 'demilexor@gmail.com', status: 'Activo', initial: 'D', color: '#374151' },
          { name: 'Homolfis', email: 'leandro.palacio@cloudbird.com.mx', status: 'Activo', initial: 'H', color: '#d946ef' },
          { name: 'The Creative Vault', email: 'thecreativevaultcommunity@gmail.com', status: 'Activo', initial: 'T', color: '#0ea5e9' },
        ].map((data) => prisma.teamMember.create({ data }))
      );
      members = await prisma.teamMember.findMany({
        include: {
          vaults: {
            include: { vault: true }
          }
        }
      });
    }
    
    return NextResponse.json({ data: members });
  } catch (error) {
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
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create member' }, { status: 400 });
  }
}
