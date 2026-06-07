import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

function generateSecretKey() {
  const parts = [];
  parts.push('A3');
  parts.push(crypto.randomBytes(3).toString('hex').toUpperCase()); // 6 chars
  
  for(let i=0; i<4; i++) {
    parts.push(crypto.randomBytes(3).toString('hex').toUpperCase() + crypto.randomBytes(2).toString('hex').toUpperCase().substring(0, 1)); // 7 chars, but let's just make it simple:
  }
  
  // Secret Key format: A3-XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX
  const generateBlock = (len: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  return `A3-${generateBlock(6)}-${generateBlock(6)}-${generateBlock(6)}-${generateBlock(6)}-${generateBlock(6)}-${generateBlock(6)}`;
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json({ error: 'La instancia ya fue configurada.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const secretKey = generateSecretKey();

    const [user] = await prisma.$transaction([
      prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          secretKey,
        }
      }),
      prisma.vault.create({
        data: { name: 'Personal', icon: 'FolderLock' }
      })
    ]);

    return NextResponse.json({ 
      data: { 
        email: user.email, 
        secretKey: user.secretKey 
      } 
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
