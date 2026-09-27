import type { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../lib/auth';

export type AuthedRequest = Request & { userEmail?: string };

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.header('authorization');
  if (!header) return res.status(401).json({ error: 'Missing Authorization header' });

  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid Authorization header' });
  }

  try {
    const payload = verifyJwt(parts[1]);
    req.userEmail = payload.email;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
