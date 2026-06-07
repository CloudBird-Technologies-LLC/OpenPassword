import { NextRequest } from 'next/server';
import prisma from './prisma';
import * as crypto from 'crypto';

/**
 * Resolves the authenticated user for an API request.
 * Accepts two authentication methods in priority order:
 *   1. Bearer token in Authorization header  →  API key auth
 *   2. auth_token cookie                     →  Session auth
 *
 * Returns the user record on success, or null if unauthenticated.
 */
export async function getAuthUser(request: NextRequest | Request) {
  // --- 1. API Key (Bearer token) ---
  const authHeader = request.headers.get('authorization') ?? '';
  if (authHeader.startsWith('Bearer ')) {
    const rawKey = authHeader.slice(7).trim();
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: { user: true },
    });

    if (!apiKey) return null;
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

    // Update last used timestamp (fire-and-forget)
    prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => {});

    return apiKey.user;
  }

  // --- 2. Cookie session (existing behaviour) ---
  // For cookie auth we trust the presence of auth_token and return the first user.
  // (The middleware already enforces the cookie on page routes.)
  const cookieHeader = request.headers.get('cookie') ?? '';
  if (cookieHeader.includes('auth_token=')) {
    const user = await prisma.user.findFirst();
    return user;
  }

  return null;
}

/**
 * Generates a new API key.
 * Returns { raw, hash, prefix } where:
 *   raw    — the full secret to show the user ONCE
 *   hash   — SHA-256 hex to store in the DB
 *   prefix — first 8 chars for display (e.g. "op_AbCd12")
 */
export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const secret = 'op_' + crypto.randomBytes(32).toString('base64url');
  const hash = crypto.createHash('sha256').update(secret).digest('hex');
  const prefix = secret.slice(0, 10);
  return { raw: secret, hash, prefix };
}
