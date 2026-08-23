import { create } from "zustand";
import { authService } from "../services/auth.service.js";

/**
 * Store de autenticación desacoplado de Supabase.
 * Responsabilidad FRONT: estado UI + persistencia local + llamadas al backend.
 * Responsabilidad BACK: validación, hash bcrypt, verificación credenciales, registro.
 *
 * Estructura compatible con el backend Prime (MongoDB):
 *  user = { _id, nombre, email, rol, telefono, pais, ciudad, avatarUrl, bio, activo, eliminado, ultimoLogin, createdAt, updatedAt }
 */

const getInitialUser = () => authService.getStoredUser();

export const useAuthStore = create((set, get) => ({
  user: getInitialUser(),
  isAuthenticated: !!getInitialUser(),
  loading: false,
  error: null,

  // Inicializa desde localStorage (sin supabase.auth.getSession)
  initialize: () => {
    const storedUser = authService.getStoredUser();
    set({
      user: storedUser,
      isAuthenticated: !!storedUser,
      loading: false,
    });
  },

  // Registro: POST /api/auth/register  -> { nombre, email, password }
  // Backend espera "nombre" (no "name" ni "full_name")
  register: async ({ nombre, email, password }) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.register({ nombre, email, password });
      // Backend retorna data con usuario creado; no inicia sesión automáticamente.
      // Mantenemos comportamiento similar al original: no autologin, redirigir a login.
      set({ loading: false });
      return res;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  // Login: POST /api/auth/login -> { email, password }
  login: async ({ email, password }) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.login({ email, password });
      // res.data es el usuario; res puede incluir token en el futuro
      const user = res.data || res.user || res;
      const token = res.token || res.accessToken || null;

      authService.persistSession(user, token);
      set({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return res;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  logout: () => {
    authService.clearSession();
    set({ user: null, isAuthenticated: false, error: null });
  },

  // Helper para obtener perfil si se necesita (ej. GET /api/users/:id)
  // Por ahora el login ya retorna el usuario completo, no se requiere fetchProfile separado.
  // Se mantiene el nombre para compatibilidad con código legacy, pero sin llamada a Supabase.
  fetchProfile: async () => {
    const user = get().user;
    return user;
  },

  clearError: () => set({ error: null }),
}));
