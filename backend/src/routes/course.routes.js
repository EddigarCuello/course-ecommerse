import { Router } from 'express';

import { 
    obtenerCursoPorId,
    obtenerCursos,
    crearCurso,
    eliminarCurso,
    actualizarCurso
} from '../controllers/course.controller.js';



const router = Router();

// Rutas para la raíz: /api/users
router.route('/')
  .get(obtenerCursos)      // GET /course/users -> Listar todos
  .post(crearCurso);   // POST /course/users -> Crear un nuevo curso

// Rutas con parámetro ID: /api/users/:id
router.route('/:id')
  .get(obtenerCursoPorId)  // GET /api/course/:id -> Obtener por ID
  .put(actualizarCurso)    // PUT /api/course/:id -> Actualizar curso
  .delete(eliminarCurso);  // DELETE /api/course/:id -> Eliminar curso

export default router;