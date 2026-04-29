import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    let users = await prisma.user.findMany({ 
      take: 1,
      include: { devices: true }
    });
    
    if (!users.length) {
      // Seed a default user
      await prisma.user.create({
        data: {
          email: 'demilexor@gmail.com',
          password: 'hashed_password', // Mock hash
          secretKey: 'A3-GS8TKU-EOV2EF-XD1ZBG-EQNQW6-HBXOWW-C65XPB',
          travelMode: false
        }
      });
      users = await prisma.user.findMany({ 
        take: 1,
        include: { devices: true }
      });
    }
    const user = users[0];

    // Extract real data from request
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // Simple User-Agent parsing
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

    // Update existing devices to not be current
    await prisma.device.updateMany({
      where: { userId: user.id, isCurrent: true },
      data: { isCurrent: false }
    });

    // Check if device from this IP and Browser already exists
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
          location: 'Desconocida (Local)', // Needs IP geolocation API for real location, using placeholder
          os: osName,
          icon: icon,
          isCurrent: true
        }
      });
    }

    // Refetch updated devices
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id }, include: { devices: { orderBy: { lastAccess: 'desc' } } } });
    if (updatedUser) user.devices = updatedUser.devices;

    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        secretKey: user.secretKey,
        travelMode: user.travelMode,
        language: user.language,
        name: user.name,
        avatarUrl: user.avatarUrl,
        recoveryCode: user.recoveryCode,
        smtpHost: user.smtpHost,
        smtpPort: user.smtpPort,
        smtpUser: user.smtpUser,
        smtpPass: user.smtpPass,
        devices: user.devices
      }
    });
  } catch (error: any) {
    console.error('API USER GET ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch user', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const users = await prisma.user.findMany({ take: 1 });
    if (!users.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = users[0];

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
