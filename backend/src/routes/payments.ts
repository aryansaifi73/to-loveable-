import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { requireAuth, type AuthedRequest } from '../middleware/authMiddleware';
import { query } from '../lib/db';

export const paymentsRouter = Router();

paymentsRouter.use(requireAuth);

const env = {
  keyId: process.env.RAZORPAY_KEY_ID,
  keySecret: process.env.RAZORPAY_KEY_SECRET,
};

if (!env.keyId || !env.keySecret) {
  // allow server to boot for dev; endpoints will fail
  // eslint-disable-next-line no-console
  console.warn('[backend] Missing Razorpay keys in env. /api/payments may fail');
}

const razorpay = new Razorpay({
  key_id: env.keyId || 'rzp_test_missing',
  key_secret: env.keySecret || 'missing',
});

const createOrderSchema = z.object({
  courseId: z.string().min(1),
});

paymentsRouter.post('/create-order', async (req: AuthedRequest, res) => {
  const email = req.userEmail;
  if (!email) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const body = createOrderSchema.parse(req.body);

    const courseRows = await query<any>(
      `SELECT * FROM courses WHERE id = $1 LIMIT 1`,
      [body.courseId],
    );
    const course = courseRows[0];
    if (!course) return res.status(404).json({ error: 'Course not found' });

    // If free course (price_cents = 0), enroll immediately (no payment)
    const amountCents = course.price_cents ?? 0;
    if (amountCents === 0) {
      // Insert enrollment using a deterministic pseudo-payment record
      const paymentId = `free_${body.courseId}_${email}_${Date.now()}`;
      const enrollmentId = `enr_${Date.now()}`;
      await query(
        `INSERT INTO payments (id, user_email, course_id, provider, provider_payment_id, amount_cents, currency, status, raw_payload)
         VALUES ($1,$2,$3,'razorpay', $4, $5, 'INR','captured', $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          `pay_${paymentId}`,
          email,
          body.courseId,
          paymentId,
          amountCents,
          JSON.stringify({ reason: 'free' }),
        ],
      );

      await query(
        `INSERT INTO enrollments (id, user_email, course_id, payment_provider, payment_id)
         VALUES ($1,$2,$3,'razorpay', $4)
         ON CONFLICT (user_email, course_id) DO NOTHING`,
        [`${enrollmentId}`, email, body.courseId, paymentId],
      );

      return res.json({ orderId: null, amountCents: 0, currency: 'INR', free: true });
    }

    const order = await razorpay.orders.create({
      amount: amountCents,
      currency: 'INR',
      receipt: crypto.randomBytes(10).toString('hex'),
      payment_capture: 1,
    });

    // Create a payment row (pending)
    const paymentRowId = `pay_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    await query(
      `INSERT INTO payments (id, user_email, course_id, provider, provider_payment_id, amount_cents, currency, status, raw_payload)
       VALUES ($1,$2,$3,'razorpay',$4,$5,'INR','created',$6)`,
      [
        paymentRowId,
        email,
        body.courseId,
        order.id,
        amountCents,
        JSON.stringify({ order }),
      ],
    );

    return res.json({
      orderId: order.id,
      amountCents: amountCents,
      currency: 'INR',
      free: false,
      courseId: body.courseId,
      razorpayKeyId: env.keyId,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || 'Failed to create order' });
  }
});

function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = env.keySecret;
  if (!secret) return false;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${orderId}|${paymentId}`);
  return hmac.digest('hex') === signature;
}

const captureSchema = z.object({
  courseId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

paymentsRouter.post('/capture', async (req: AuthedRequest, res) => {
  const email = req.userEmail;
  if (!email) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const body = captureSchema.parse(req.body);

    const ok = verifyRazorpaySignature({
      orderId: body.razorpay_order_id,
      paymentId: body.razorpay_payment_id,
      signature: body.razorpay_signature,
    });

    if (!ok) return res.status(400).json({ error: 'Invalid payment signature' });

    // Mark payment captured
    await query(
      `UPDATE payments
       SET status = 'captured', provider_payment_id = $1, updated_at = NOW(), raw_payload = raw_payload || $2::jsonb
       WHERE user_email = $3 AND course_id = $4 AND provider_payment_id = $5`,
      [
        body.razorpay_payment_id,
        JSON.stringify({ razorpay_signature: body.razorpay_signature }),
        email,
        body.courseId,
        body.razorpay_order_id,
      ],
    );

    // Unlock enrollment
    await query(
      `INSERT INTO enrollments (id, user_email, course_id, payment_provider, payment_id)
       VALUES ($1,$2,$3,'razorpay',$4)
       ON CONFLICT (user_email, course_id) DO NOTHING`,
      [`enr_${Date.now()}_${Math.random().toString(16).slice(2)}`, email, body.courseId, body.razorpay_payment_id],
    );

    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || 'Capture failed' });
  }
});
