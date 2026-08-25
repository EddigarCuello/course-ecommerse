import { Router } from 'express';

import { 
    obtenerProfesorPorId,
    obtenerProfesores,
    obtenerTodosProfesores,
    registrarProfesor,
    actualizarProfesor,
    eliminarProfesor
 } from '../controllers/teacher.controller.js';



const router = Router();

// Rutas para la raíz: /api/users
router.route('/')
  .get(obtenerTodosProfesores)      // GET /api/users -> Listar todos
  .post(registrarProfesor);   // POST /api/users -> Crear un nuevo usuario

router.route('/activos/')
 .get(obtenerProfesores);

// Rutas con parámetro ID: /api/users/:id
router.route('/:id')
  .get(obtenerProfesorPorId)  // GET /api/users/:id -> Obtener por ID
  .put(actualizarProfesor)    // PUT /api/users/:id -> Actualizar perfil
  .delete(eliminarProfesor);  // DELETE /api/users/:id -> Eliminar usuario

export default router;