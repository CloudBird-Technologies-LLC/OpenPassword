import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { generateApiKey } from '../../../lib/auth';

/**
 * GET /api/apikeys
 * Returns all API keys for the current user (never the raw key — only prefix, name, scopes, dates).
 */
export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const keys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        prefix: true,
        scopes: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: keys });
  } catch (error) {
    console.error('GET /api/apikeys error:', error);
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }
}

/**
 * POST /api/apikeys
 * Creates a new API key. Returns the raw key ONCE — it is never stored in plain text.
 *
 * Body: { name: string, scopes?: string, expiresInDays?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const body = await request.json();
    const { name, scopes = 'read', expiresInDays } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'A name for the API key is required' }, { status: 400 });
    }

    const { raw, hash, prefix } = generateApiKey();

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        name: name.trim(),
        keyHash: hash,
        prefix,
        scopes,
        expiresAt,
      },
    });

    // Return the raw key ONLY on creation — never shown again
    return NextResponse.json({
      data: {
        id: apiKey.id,
        name: apiKey.name,
        prefix: apiKey.prefix,
        scopes: apiKey.scopes,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
        key: raw, // <-- shown once
      },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/apikeys error:', error);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }
}
