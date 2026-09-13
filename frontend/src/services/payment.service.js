import { api } from "./api.js";

/**
 * Servicio de pagos — crea la sesión de Stripe Checkout
 * y redirige al usuario a la URL de pago seguro.
 */
export const paymentService = {
  /**
   * Crea una sesión de checkout y redirige al usuario a Stripe.
   * @param {string} courseId - ID del curso a comprar
   */
  createCheckout: async (courseId) => {
    const res = await api.post("/api/payments/create-checkout-session", { courseId });
    if (res?.url) {
      window.location.href = res.url;
    } else {
      throw new Error("No se recibió la URL de pago de Stripe.");
    }
    return res;
  },

  /**
   * Verifica una sesión de checkout completada para registrar
   * el pago y la inscripción en la base de datos.
   * @param {string} sessionId - ID de la sesión de Stripe
   */
  verifyCheckout: async (sessionId) => {
    const res = await api.post("/api/payments/verify-session", { sessionId });
    return res;
  },

  /**
   * Obtiene el historial de pagos del usuario actual
   */
  getMyPayments: async () => {
    const res = await api.get("/api/payments/me");
    return res.payments || [];
  },

  /**
   * Registra una inscripción por efectivo/transferencia (queda en pending)
   * @param {string} courseId - ID del curso
   */
  registerCashPayment: async (courseId) => {
    const res = await api.post("/api/payments/register-cash", { courseId });
    return res;
  }
};
