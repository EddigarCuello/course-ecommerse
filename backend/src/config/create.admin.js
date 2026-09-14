import { UserModel } from "../models/user.schema.js";

export const createAdmin = async () => {
    try {
        const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase().trim();
        const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123';

        let adminUser = await UserModel.findOne({ email: adminEmail });

        if (!adminUser) {
            adminUser = new UserModel({
                nombre: 'ADMIN',
                email: adminEmail,
                passwordHash: adminPassword, // El hook pre('save') del schema se encarga de encriptar
                rol: 'admin',
                avatarUrl: "https://imgcdn.stablediffusionweb.com/2024/9/8/2ee8c87f-e8e4-4f2a-a475-3dac6fa8feb9.jpg"
            });
            await adminUser.save();
            console.log('Admin creado exitosamente');
        } else {
            // Si el admin existe pero tiene un doble hash previo, corregimos la contraseña automáticamente
            const esValido = await adminUser.compararPassword(adminPassword);
            if (!esValido) {
                adminUser.passwordHash = adminPassword; // Disparará el pre('save') para hashear correctamente 1 vez
                await adminUser.save();
                console.log('Contraseña del Administrador corregida y actualizada');
            } else {
                console.log('Administrador Activo');
            }
        }
    } catch (error) {
        console.log('Error al crear o verificar Admin: ', error);
    }
};

