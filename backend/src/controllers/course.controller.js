import { CourseModel } from '../models/course.schema.js';
import mongoose from 'mongoose';

// GET /api/courses - Obtener todos los cursos activos
export const obtenerCursos = async (req, res, next) => {
  try {
    const cursos = await CourseModel.find()
      .populate('categoria', 'nombre') // Reemplaza ID por datos de la categoría
      .populate('instructor', 'nombre email avatarUrl'); // Reemplaza ID por datos del instructor

    res.status(200).json({
      ok: true,
      total: cursos.length,
      data: cursos
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/courses - Obtener todos los cursos activos
export const obtenerCursosActivos = async (req, res, next) => {
  try {
    const cursos = await CourseModel.find({activo : true})
      .populate('categoria', 'nombre') // Reemplaza ID por datos de la categoría
      .populate('instructor', 'nombre email avatarUrl'); // Reemplaza ID por datos del instructor

    res.status(200).json({
      ok: true,
      total: cursos.length,
      data: cursos
    });
  } catch (error) {
    next(error);
  }
};



// GET /api/courses/:id - Obtener un curso por ID
export const obtenerCursoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('El ID del curso no es válido');
      error.statusCode = 400;
      return next(error);
    }

    const curso = await CourseModel.findOne({ _id: id, eliminado: false })
      .populate('categoria', 'nombre')
      .populate('instructor', 'nombre email avatarUrl');

    if (!curso) {
      const error = new Error('Curso no encontrado');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      ok: true,
      data: curso
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/courses - Crear un nuevo curso
export const crearCurso = async (req, res, next) => {
  try {
    const {
      titulo,
      descripcion,
      categoria,
      instructor,
      precio,
      capacidad,
      fechaInicio,
      fechaFin,
      horaInicio,
      horaFin,
      diasSemana,
      horario,
      zonaHoraria,
      ubicacion,
      numeroAula,
      estado,
      publicado,
      thumbnailUrl,
      nivel,
      maxEstudiantesSesion,
      requisitos
    } = req.body;

    // Validar campos requeridos explícitamente en tu Schema
    if (!titulo || !categoria || !instructor || !fechaInicio || !fechaFin || !horaInicio || !horaFin || !diasSemana) {
      const error = new Error('Faltan campos obligatorios para registrar el curso');
      error.statusCode = 400;
      return next(error);
    }

    const nuevoCurso = await CourseModel.create({
      titulo,
      descripcion,
      categoria,
      instructor,
      precio,
      capacidad,
      fechaInicio,
      fechaFin,
      horaInicio,
      horaFin,
      diasSemana,
      horario,
      zonaHoraria,
      ubicacion,
      numeroAula,
      estado,
      publicado,
      thumbnailUrl,
      nivel,
      maxEstudiantesSesion,
      requisitos,
      fechaPublicacion: publicado ? new Date() : null
    });

    res.status(201).json({
      ok: true,
      message: 'Curso creado con éxito',
      data: nuevoCurso
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/courses/:id - Actualizar un curso
export const actualizarCurso = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('El ID del curso no es válido');
      error.statusCode = 400;
      return next(error);
    }

    const {
      titulo,
      descripcion,
      categoria,
      instructor,
      precio,
      capacidad,
      fechaInicio,
      fechaFin,
      horaInicio,
      horaFin,
      diasSemana,
      horario,
      zonaHoraria,
      ubicacion,
      numeroAula,
      estado,
      publicado,
      thumbnailUrl,
      nivel,
      maxEstudiantesSesion,
      requisitos
    } = req.body;

    // Construir objeto dinámico con solo las propiedades enviadas
    const camposAActualizar = {
      ...(titulo && { titulo }),
      ...(descripcion !== undefined && { descripcion }),
      ...(categoria && { categoria }),
      ...(instructor && { instructor }),
      ...(precio !== undefined && { precio }),
      ...(capacidad !== undefined && { capacidad }),
      ...(fechaInicio && { fechaInicio }),
      ...(fechaFin && { fechaFin }),
      ...(horaInicio && { horaInicio }),
      ...(horaFin && { horaFin }),
      ...(diasSemana && { diasSemana }),
      ...(horario !== undefined && { horario }),
      ...(zonaHoraria && { zonaHoraria }),
      ...(ubicacion && { ubicacion }),
      ...(numeroAula !== undefined && { numeroAula }),
      ...(estado && { estado }),
      ...(publicado !== undefined && { 
        publicado,
        fechaPublicacion: publicado ? new Date() : null 
      }),
      ...(thumbnailUrl !== undefined && { thumbnailUrl }),
      ...(nivel && { nivel }),
      ...(maxEstudiantesSesion !== undefined && { maxEstudiantesSesion }),
      ...(requisitos !== undefined && { requisitos })
    };

    const cursoActualizado = await CourseModel.findOneAndUpdate(
      { _id: id, eliminado: false },
      camposAActualizar,
      { new: true, runValidators: true }
    );

    if (!cursoActualizado) {
      const error = new Error('Curso no encontrado');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      ok: true,
      message: 'Curso actualizado correctamente',
      data: cursoActualizado
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/courses/:id - Borrado lógico
export const eliminarCurso = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('El ID del curso no es válido');
      error.statusCode = 400;
      return next(error);
    }

    const cursoEliminado = await CourseModel.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true, publicado: false, estado: 'draft' },
      { new: true }
    );

    if (!cursoEliminado) {
      const error = new Error('Curso no encontrado');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      ok: true,
      message: 'Curso eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};