import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres']
    },

    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor ingresa un correo electrónico válido'
      ]
    },

    passwordHash: {
      type: String,
      required: [true, 'La contraseña es obligatoria']
    },

    telefono: {
      type: String,
      trim: true,
      default: ''
    },

    pais: {
      type: String,
      trim: true,
      default: ''
    },

    ciudad: {
      type: String,
      trim: true,
      default: ''
    },

    rol: {
      type: String,
      enum: {
        values: ['estudiante', 'instructor', 'admin'],
        message: '{VALUE} no es un rol válido'
      },
      default: 'estudiante'
    },

    activo: {
      type: Boolean,
      default: true
    },

    eliminado: {
      type: Boolean,
      default: false
    },

    avatarUrl: {
      type: String,
      default: null
    },

    bio: {
      type: String,
      default: ''
    },

    idiomaPreferido: {
      type: String,
      default: 'es'
    },

    ultimoLogin: {
      type: Date,
      default: null
    },

    // Solo se utiliza cuando rol === "instructor"
    detallesInstructor: {
      especializacion: {
        type: String,
        default: ''
      },

      tarifaHora: {
        type: Number,
        default: 0,
        min: [0, 'La tarifa no puede ser negativa']
      }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const UserModel = model('User', userSchema);