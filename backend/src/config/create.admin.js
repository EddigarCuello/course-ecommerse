import { UserModel } from "../models/user.schema.js";

export const createAdmin = async () => {
    try {
        const envEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
        const envPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123';

        // Lista de correos admin a asegurar (admin@gmail.com, admin@course.com y el del .env)
        const emailsToEnsure = Array.from(new Set([
            'admin@gmail.com',
            'admin@course.com',
            envEmail
        ])).filter(Boolean);

        for (const email of emailsToEnsure) {
            let adminUser = await UserModel.findOne({ email });

            if (!adminUser) {
                adminUser = new UserModel({
                    nombre: 'ADMIN',
                    email,
                    passwordHash: 'AdminPassword123',
                    rol: 'admin',
                    avatarUrl: "https://imgcdn.stablediffusionweb.com/2024/9/8/2ee8c87f-e8e4-4f2a-a475-3dac6fa8feb9.jpg"
                });
                await adminUser.save();
                console.log(`Admin ${email} creado exitosamente`);
            } else {
                // Actualizar la contraseña a AdminPassword123 para garantizar acceso limpio sin doble hash
                adminUser.passwordHash = 'AdminPassword123';
                await adminUser.save();
                console.log(`Admin ${email} clave restablecida correctamente`);
            }
        }
    } catch (error) {
        console.log('Error al crear o verificar Admin: ', error);
    }
};

