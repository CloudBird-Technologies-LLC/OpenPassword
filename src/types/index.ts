import { User as PrismaUser, Vault as PrismaVault, PasswordItem as PrismaPasswordItem, Tag as PrismaTag } from '@prisma/client';

export interface User extends Omit<PrismaUser, 'password' | 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export interface Vault extends Omit<PrismaVault, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export interface PasswordItem extends Omit<PrismaPasswordItem, 'createdAt' | 'updatedAt'> {
  customFields?: string | null;
  passkey?: string | null;
  isArchived: boolean;
  isFavorite: boolean;
  tags?: { id: string; name: string; color: string | null }[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag extends PrismaTag {}
