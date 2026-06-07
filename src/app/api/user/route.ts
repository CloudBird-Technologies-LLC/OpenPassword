import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import * as bcrypt from 'bcryptjs';
import { getAuthUser } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    
    let browserName = 'Navegador desconocido';
    if (userAgent.includes('Firefox')) browserName = 'Firefox';
    else if (userAgent.includes('Edg')) browserName = 'Edge';
    else if (userAgent.includes('Chrome')) browserName = 'Chrome';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browserName = 'Safari';

    let osName = 'SO desconocido';
    if (userAgent.includes('Windows')) osName = 'Windows';
    else if (userAgent.includes('Mac OS')) osName = 'macOS';
    else if (userAgent.includes('Linux')) osName = 'Linux';
    else if (userAgent.includes('Android')) osName = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) osName = 'iOS';

    let icon = 'Globe';
    if (osName === 'iOS' || osName === 'Android') icon = 'Smartphone';

    await prisma.device.updateMany({
      where: { userId: user.id, isCurrent: true },
      data: { isCurrent: false }
    });

    const existingDevice = await prisma.device.findFirst({
      where: { userId: user.id, ip, name: browserName }
    });

    if (existingDevice) {
      await prisma.device.update({
        where: { id: existingDevice.id },
        data: { lastAccess: new Date(), isCurrent: true }
      });
    } else {
      await prisma.device.create({
        data: {
          userId: user.id,
          name: browserName,
          ip: ip,
          location: 'Desconocida (Local)',
          os: osName,
          icon: icon,
          isCurrent: true
        }
      });
    }

    const finalUser = await prisma.user.findUnique({ 
      where: { id: user.id }, 
      include: { devices: { orderBy: { lastAccess: 'desc' } } } 
    });
    
    if (!finalUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({
      data: {
        id: finalUser.id,
        email: finalUser.email,
        secretKey: finalUser.secretKey,
        travelMode: finalUser.travelMode,
        language: finalUser.language,
        name: finalUser.name,
        avatarUrl: finalUser.avatarUrl,
        recoveryCode: finalUser.recoveryCode,
        smtpHost: finalUser.smtpHost,
        smtpPort: finalUser.smtpPort,
        smtpUser: finalUser.smtpUser,
        smtpPass: finalUser.smtpPass,
        devices: finalUser.devices
      }
    });
  } catch (error) {
    console.error('API USER GET ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const data = await request.json();
    const updateData: any = {};
    if (data.travelMode !== undefined) updateData.travelMode = data.travelMode;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    if (data.secretKey) updateData.secretKey = data.secretKey;
    if (data.recoveryCode) updateData.recoveryCode = data.recoveryCode;
    if (data.email) updateData.email = data.email;
    if (data.smtpHost !== undefined) updateData.smtpHost = data.smtpHost;
    if (data.smtpPort !== undefined) updateData.smtpPort = data.smtpPort;
    if (data.smtpUser !== undefined) updateData.smtpUser = data.smtpUser;
    if (data.smtpPass !== undefined) updateData.smtpPass = data.smtpPass;
    if (data.password) {
      const salt = bcrypt.genSaltSync(10);
      updateData.password = bcrypt.hashSync(data.password, salt);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        avatarUrl: updated.avatarUrl,
        language: updated.language,
        secretKey: updated.secretKey,
        travelMode: updated.travelMode,
        recoveryCode: updated.recoveryCode,
        smtpHost: updated.smtpHost,
        smtpPort: updated.smtpPort,
        smtpUser: updated.smtpUser,
        smtpPass: updated.smtpPass,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
