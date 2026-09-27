import { Router } from 'express';
import { query } from '../lib/db';

export const coursesRouter = Router();

coursesRouter.get('/', async (_req, res) => {
  const rows = await query<any>(`SELECT * FROM courses ORDER BY created_at DESC`);
  // match the frontend CourseData shape
  const grouped: Record<string, any[]> = {};
  for (const r of rows) {
    const category = r.category as string;
    grouped[category] = grouped[category] ?? [];
    grouped[category].push({
      id: r.id,
      title: r.title,
      category: r.category,
      thumbnail: r.thumbnail_url ?? undefined,
      demoLink: r.demo_link ?? undefined,
      price: r.price_cents !== null && r.price_cents !== undefined ? (r.price_cents / 100) : undefined,
      description: r.description ?? undefined,
      instructor: r.instructor ?? undefined,
    });
  }
  return res.json(grouped);
});
