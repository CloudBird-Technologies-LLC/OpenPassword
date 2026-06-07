import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const secretKey = typeof body.secretKey === 'string' ? body.secretKey.trim().toUpperCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !secretKey || !password) {
      return NextResponse.json(
        { error: 'Correo, Secret Key y nueva contraseña son obligatorios.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 8 caracteres.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.secretKey.trim().toUpperCase() !== secretKey) {
      return NextResponse.json(
        { error: 'El correo o la Secret Key no son válidos.' },
        { status: 401 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('REFRESH PASSWORD ERROR:', error);
    return NextResponse.json(
      { error: 'No fue posible cambiar la contraseña.' },
      { status: 500 }
    );
  }
}
