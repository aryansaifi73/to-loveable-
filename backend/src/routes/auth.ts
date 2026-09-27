import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { comparePassword, createUser, findUserByEmail, signJwt } from '../lib/auth';

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  avatarUrl: z.string().url().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).optional(),
});

authRouter.post('/register', async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);
    const user = await createUser({
      name: body.name,
      email: body.email,
      password: body.password,
      avatarUrl: body.avatarUrl,
    });

    const token = signJwt({ email: user.email });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatar_url } });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || 'Register failed' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await findUserByEmail(body.email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // In this demo backend, if password_hash is null, user must have used Google flow.
    if (!user.password_hash) {
      return res.status(401).json({ error: 'This account was created via Google. Use Google login.' });
    }

    if (!body.password) return res.status(401).json({ error: 'Password required' });

    const ok = await comparePassword(body.password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signJwt({ email: user.email });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatar_url } });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || 'Login failed' });
  }
});

authRouter.post('/google', async (req, res) => {
  try {
    // Mock google: accept { name, email, avatarUrl }
    const body = z
      .object({
        name: z.string().min(1),
        email: z.string().email(),
        avatarUrl: z.string().url().optional(),
      })
      .parse(req.body);

    const existing = await findUserByEmail(body.email);
    if (!existing) {
      await createUser({ name: body.name, email: body.email, password: undefined, avatarUrl: body.avatarUrl });
    } else {
      // Update name/avatar lightly
      await (await import('../lib/db')).query(
        `UPDATE users SET name = $1, avatar_url = COALESCE($2, avatar_url) WHERE email = $3`,
        [body.name.trim(), body.avatarUrl || null, body.email.toLowerCase().trim()],
      );
    }

    const user = await findUserByEmail(body.email);
    const token = signJwt({ email: user.email });

    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatar_url } });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || 'Google login failed' });
  }
});

