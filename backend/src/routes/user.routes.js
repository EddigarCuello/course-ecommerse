import { Router } from 'express';

import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  registrarUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../controllers/user.controller.js';

import { register,login 
  
} from '../controllers/auth.controller.js';

const router = Router();

// Rutas para la raíz: /api/users
router.route('/')
  .get(obtenerUsuarios)      // GET /api/users -> Listar todos
  .post(registrarUsuario);   // POST /api/users -> Crear un nuevo usuario

// Rutas con parámetro ID: /api/users/:id
router.route('/:id')
  .get(obtenerUsuarioPorId)  // GET /api/users/:id -> Obtener por ID
  .put(actualizarUsuario)    // PUT /api/users/:id -> Actualizar perfil
  .delete(eliminarUsuario);  // DELETE /api/users/:id -> Eliminar usuario

router.route('/register')
  .post(register);           // POST /api/users/register -> registra usuarios

router.route('/login')
  .post(login);             //POST /api/users/login -> Inicio de seasion para usuarios

export default router;