import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) return pool;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL');
  }

  pool = new Pool({ connectionString: databaseUrl });
  return pool;
}

export async function initDb(): Promise<void> {
  const p = getPool();

  await p.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      avatar_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      thumbnail_url TEXT,
      demo_link TEXT,
      price_cents INTEGER,
      description TEXT,
      instructor TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      payment_provider TEXT NOT NULL,
      payment_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_email, course_id)
    );
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      provider_payment_id TEXT,
      amount_cents INTEGER NOT NULL,
      currency TEXT NOT NULL,
      status TEXT NOT NULL,
      raw_payload JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Optional: seed courses if empty (admin UI can later sync/overwrite)
  const courseCount = await p.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM courses');
  const count = Number(courseCount.rows[0]?.count ?? 0);
  if (count === 0) {
    // Seed from the frontend's default course catalog.
    // NOTE: We set a demo price so the payment button flow can be tested end-to-end.
    const demoPriceCents = 99900; // ₹999

    await p.query(`
      INSERT INTO courses (id, title, category, price_cents, instructor)
      VALUES
        -- Web Development
        ('web-1', 'HTML & CSS Foundations', 'Web Development', ${demoPriceCents}, 'CodeFront Academy'),
        ('web-2', 'JavaScript from Zero', 'Web Development', ${demoPriceCents}, 'CodeFront Academy'),
        ('web-3', 'Responsive Web Design', 'Web Development', ${demoPriceCents}, 'CodeFront Academy'),
        ('web-4', 'Git & GitHub', 'Web Development', ${demoPriceCents}, 'CodeFront Academy'),
        ('web-5', 'React Essentials', 'Web Development', ${demoPriceCents}, 'CodeFront Academy'),
        ('web-6', 'Advanced React', 'Web Development', ${demoPriceCents}, 'CodeFront Academy'),
        ('web-7', 'TypeScript', 'Web Development', ${demoPriceCents}, 'CodeFront Academy'),
        ('web-8', 'Next.js Full Stack', 'Web Development', ${demoPriceCents}, 'CodeFront Academy'),
        ('web-9', 'Node.js & Express', 'Web Development', ${demoPriceCents}, 'CodeFront Academy'),
        ('web-10', 'MongoDB', 'Web Development', ${demoPriceCents}, 'CodeFront Academy'),
        ('web-11', 'SQL for Developers', 'Web Development', ${demoPriceCents}, 'CodeFront Academy'),
        ('web-12', 'REST API Development', 'Web Development', ${demoPriceCents}, 'CodeFront Academy'),
        ('web-13', 'Authentication & Security', 'Web Development', ${demoPriceCents}, 'CodeFront Academy'),
        ('web-14', 'Web Performance', 'Web Development', ${demoPriceCents}, 'CodeFront Academy'),
        ('web-15', 'Full Stack Capstone', 'Web Development', ${demoPriceCents}, 'CodeFront Academy'),

        -- AI & ML
        ('ai-1', 'Python for AI', 'AI & ML', ${demoPriceCents}, 'CodeFront Academy'),
        ('ai-2', 'Machine Learning Basics', 'AI & ML', ${demoPriceCents}, 'CodeFront Academy'),
        ('ai-3', 'Data Analysis with Pandas', 'AI & ML', ${demoPriceCents}, 'CodeFront Academy'),
        ('ai-4', 'Deep Learning', 'AI & ML', ${demoPriceCents}, 'CodeFront Academy'),
        ('ai-5', 'Natural Language Processing', 'AI & ML', ${demoPriceCents}, 'CodeFront Academy'),
        ('ai-6', 'Generative AI', 'AI & ML', ${demoPriceCents}, 'CodeFront Academy'),
        ('ai-7', 'Computer Vision', 'AI & ML', ${demoPriceCents}, 'CodeFront Academy'),
        ('ai-8', 'AI Project Lab', 'AI & ML', ${demoPriceCents}, 'CodeFront Academy'),

        -- Video Editing
        ('vid-1', 'Editing Fundamentals', 'Video Editing', ${demoPriceCents}, 'CodeFront Academy'),
        ('vid-2', 'Premiere Pro', 'Video Editing', ${demoPriceCents}, 'CodeFront Academy'),
        ('vid-3', 'After Effects', 'Video Editing', ${demoPriceCents}, 'CodeFront Academy'),
        ('vid-4', 'DaVinci Resolve', 'Video Editing', ${demoPriceCents}, 'CodeFront Academy'),
        ('vid-5', 'Motion Graphics', 'Video Editing', ${demoPriceCents}, 'CodeFront Academy'),
        ('vid-6', 'Color Grading', 'Video Editing', ${demoPriceCents}, 'CodeFront Academy'),
        ('vid-7', 'Audio for Video', 'Video Editing', ${demoPriceCents}, 'CodeFront Academy'),
        ('vid-8', 'YouTube Editing Workflow', 'Video Editing', ${demoPriceCents}, 'CodeFront Academy'),

        -- AKTU Notes
        ('aktu-1', 'Engineering Mathematics', 'AKTU Notes', ${demoPriceCents}, 'CodeFront Academy'),
        ('aktu-2', 'Engineering Physics', 'AKTU Notes', ${demoPriceCents}, 'CodeFront Academy'),
        ('aktu-3', 'Programming for Problem Solving', 'AKTU Notes', ${demoPriceCents}, 'CodeFront Academy'),
        ('aktu-4', 'Data Structures', 'AKTU Notes', ${demoPriceCents}, 'CodeFront Academy'),
        ('aktu-5', 'DBMS', 'AKTU Notes', ${demoPriceCents}, 'CodeFront Academy'),
        ('aktu-6', 'Operating Systems', 'AKTU Notes', ${demoPriceCents}, 'CodeFront Academy'),
        ('aktu-7', 'Computer Networks', 'AKTU Notes', ${demoPriceCents}, 'CodeFront Academy'),
        ('aktu-8', 'Software Engineering', 'AKTU Notes', ${demoPriceCents}, 'CodeFront Academy')
      ON CONFLICT (id) DO NOTHING;
    `);
  }
}

export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const p = getPool();
  const res = await p.query(sql, params);
  return res.rows as T[];
}
