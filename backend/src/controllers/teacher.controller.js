import { teacherModel } from '../models/teacher_data.schema.js';
import mongoose from 'mongoose';

// GET /api/teachers (Solo profesores activos)
export const obtenerProfesores = async (req, res, next) => {
  try {
    const profesores = await teacherModel.find({ activo: true }).select('-passwordHash');

    res.status(200).json({
      ok: true,
      total: profesores.length,
      data: profesores
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/teachers/all (Todos los profesores, activos e inactivos)
export const obtenerTodosProfesores = async (req, res, next) => {
  try {
    const profesores = await teacherModel.find().select('-passwordHash');

    res.status(200).json({
      ok: true,
      total: profesores.length,
      data: profesores
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/teachers/:idOrEmail
export const obtenerProfesorPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query = {};

    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.email = id.toLowerCase();
    }

    const profesor = await teacherModel.findOne(query).select('-passwordHash');

    if (!profesor) {
      const error = new Error('Docente no encontrado');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      ok: true,
      data: profesor
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/teachers
export const registrarProfesor = async (req, res, next) => {
  try {
    const {
      nombre,
      email,
      password,
      telefono,
      pais,
      ciudad,
      avatarUrl,
      detallesInstructor
    } = req.body;

    // 1. Validar campos obligatorios
    if (!nombre || !email || !password) {
      const error = new Error('Nombre, email y contraseña son obligatorios');
      error.statusCode = 400;
      return next(error);
    }

    // 2. Comprobar si el email ya existe
    const profesorExistente = await teacherModel.findOne({ email });
    if (profesorExistente) {
      const error = new Error('El correo electrónico ya está registrado');
      error.statusCode = 400;
      return next(error);
    }

    // 3. Crear el profesor (El pre('save') del schema encripta passwordHash)
    const nuevoProfesor = await teacherModel.create({
      nombre,
      email,
      passwordHash: password,
      telefono,
      pais,
      ciudad,
      avatarUrl,
      detallesInstructor
    });

    // 4. Formatear la respuesta omitiendo información sensible
    const profesorRespuesta = nuevoProfesor.toObject();
    delete profesorRespuesta.passwordHash;

    res.status(201).json({
      ok: true,
      message: 'Profesor registrado con éxito',
      data: profesorRespuesta
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/teachers/:id
export const actualizarProfesor = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('El ID enviado no es válido');
      error.statusCode = 400;
      return next(error);
    }

    const {
      nombre,
      telefono,
      pais,
      ciudad,
      activo,
      avatarUrl,
      detallesInstructor
    } = req.body;

    // Construcción dinámica alineada a tu teacherSchema
    const camposAActualizar = {
      ...(nombre && { nombre }),
      ...(telefono !== undefined && { telefono }),
      ...(pais !== undefined && { pais }),
      ...(ciudad !== undefined && { ciudad }),
      ...(activo !== undefined && { activo }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(detallesInstructor && { detallesInstructor })
    };

    const profesorActualizado = await teacherModel.findByIdAndUpdate(
      id,
      camposAActualizar,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!profesorActualizado) {
      const error = new Error('Profesor no encontrado');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      ok: true,
      message: 'Profesor actualizado correctamente',
      data: profesorActualizado
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/teachers/:id
export const eliminarProfesor = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('El ID enviado no es válido');
      error.statusCode = 400;
      return next(error);
    }

    // Como teacherSchema NO tiene campo 'eliminado', usamos borrado físico o desactivación
    const profesorEliminado = await teacherModel.findByIdAndDelete(id);

    if (!profesorEliminado) {
      const error = new Error('Profesor no encontrado');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      ok: true,
      message: 'Profesor eliminado correctamente de la base de datos'
    });
  } catch (error) {
    next(error);
  }
};