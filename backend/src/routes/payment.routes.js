import { Router } from 'express';
import { createCheckoutSession, verifyCheckoutSession, getMyPayments, registerCashEnrollment } from '../controllers/payment.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/payments/create-checkout-session
// Protegida: requiere token JWT válido
router.post('/create-checkout-session', authRequired, createCheckoutSession);

// POST /api/payments/verify-session
// Protegida: requiere token JWT válido
router.post('/verify-session', authRequired, verifyCheckoutSession);

// GET /api/payments/me
// Protegida: requiere token JWT válido
router.get('/me', authRequired, getMyPayments);

// POST /api/payments/register-cash
// Inscripción por efectivo/transferencia (queda en pending)
router.post('/register-cash', authRequired, registerCashEnrollment);

export default router;
