import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthedRequest } from '../middleware/authMiddleware';
import { query } from '../lib/db';

export const enrollmentsRouter = Router();

enrollmentsRouter.use(requireAuth);

const listSchema = z.object({
  courseId: z.string().min(1),
});

enrollmentsRouter.get('/me', async (req: AuthedRequest, res) => {
  const email = req.userEmail;
  if (!email) return res.status(401).json({ error: 'Unauthorized' });

  const rows = await query<{ course_id: string }>(
    `SELECT course_id FROM enrollments WHERE user_email = $1 ORDER BY created_at DESC`,
    [email],
  );

  return res.json({ courseIds: rows.map((r) => r.course_id) });
});

enrollmentsRouter.post('/enrolled', async (req: AuthedRequest, res) => {
  const email = req.userEmail;
  if (!email) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const body = listSchema.parse(req.body);
    const rows = await query<{ exists: string }>(
      `SELECT '1'::text AS exists FROM enrollments WHERE user_email = $1 AND course_id = $2 LIMIT 1`,
      [email, body.courseId],
    );

    return res.json({ enrolled: rows.length > 0 });
  } catch {
    return res.status(400).json({ error: 'Bad request' });
  }
});
