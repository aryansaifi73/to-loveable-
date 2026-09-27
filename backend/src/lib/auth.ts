import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from './db';

export type JwtPayload = {
  email: string;
};

export function signJwt(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyJwt(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');
  return jwt.verify(token, secret) as JwtPayload;
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function findUserByEmail(email: string) {
  const lower = email.toLowerCase().trim();
  const rows = await query<any>(`SELECT * FROM users WHERE email = $1 LIMIT 1`, [lower]);
  return rows[0] || null;
}

export async function createUser({
  name,
  email,
  password,
  avatarUrl,
}: {
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
}) {
  const lower = email.toLowerCase().trim();

  const existing = await findUserByEmail(lower);
  if (existing) {
    throw new Error('Account already exists');
  }

  const id = `user_${Date.now()}`;
  const passwordHash = password ? await hashPassword(password) : null;

  await query(
    `INSERT INTO users (id, name, email, password_hash, avatar_url) VALUES ($1, $2, $3, $4, $5)`,
    [id, name.trim(), lower, passwordHash, avatarUrl || null],
  );

  return findUserByEmail(lower);
}
