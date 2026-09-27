import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './lib/db';
import { authRouter } from './routes/auth';
import { coursesRouter } from './routes/courses';
import { paymentsRouter } from './routes/payments';
import { enrollmentsRouter } from './routes/enrollments';

const app = express();

const port = Number(process.env.PORT || 4000);
const corsOrigin = process.env.CORS_ORIGIN;

app.use(
  cors({
    // If CORS_ORIGIN isn't set, use the requesting origin (avoids '*'+credentials CORS issues)
    origin: corsOrigin ? corsOrigin : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

const main = async () => {
  await initDb();

  app.use('/api/auth', authRouter);
  app.use('/api/courses', coursesRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/enrollments', enrollmentsRouter);

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[backend] listening on http://localhost:${port}`);
  });
};

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[backend] failed to start', err);
  process.exit(1);
});
