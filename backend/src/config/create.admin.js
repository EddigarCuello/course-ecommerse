import moongose from "mongoose";
import bcrypt  from "bcryptjs";
import {UserModel} from "../models/user.schema.js";


export const createAdmin = async() => {
    try {
        //verificar si existe admin en la db
        const adminExist = await UserModel.findOne({rol:'admin'});
        if(adminExist){
            console.log('Administrador Activo');
            return;
        }


        //crear el admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('AdminPassword123', salt);

        const adminUser = new UserModel({
            nombre : 'ADMIN',
            email : 'admin@gmail.com', 
            passwordHash : hashedPassword, 
            rol : 'admin',
            avatarUrl : "https://imgcdn.stablediffusionweb.com/2024/9/8/2ee8c87f-e8e4-4f2a-a475-3dac6fa8feb9.jpg"
        });

        //guardar el admin
        await adminUser.save();
        console.log('Admin Activo');

    } catch (error) {
        console.log('error al crear Admin: ', error);
    }
}

