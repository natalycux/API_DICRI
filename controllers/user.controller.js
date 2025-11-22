// controllers/user.controller.js

const { executeStoredProcedure, sql } = require('../config/db');
const bcrypt = require('bcryptjs'); // Usaremos bcrypt para hasheo seguro AQUÍ.
// El SP 2. sp_CrearUsuario, espera el hash YA CALCULADO.

/**
 * Endpoint para crear un nuevo usuario (POST /api/users)
 * Autorización: ADMIN
 * * NOTA: El SP sp_CrearUsuario espera el hash ya generado.
 */
exports.createUser = async (req, res) => {
    const { id_rol, nombre, apellido, usuario_login, password_plano, estado } = req.body;
    const id_usuario_accion = req.user.id; // Obtenido del token (el ADMIN que ejecuta)

    if (!password_plano) {
         return res.status(400).json({ message: 'La contraseña es obligatoria.' });
    }

    try {
        // Generar el Hash con bcrypt (ESTO ES MEJOR QUE SHA2_256)
        // Usaremos bcrypt para el hash y se lo pasaremos al SP.
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password_plano, salt);
        
        // Ahora sí, llamamos al SP
        const params = [
            { name: 'id_rol', type: sql.Int, value: id_rol },
            { name: 'nombre', type: sql.VarChar(100), value: nombre },
            { name: 'apellido', type: sql.VarChar(100), value: apellido },
            { name: 'usuario_login', type: sql.VarChar(50), value: usuario_login },
            { name: 'password_hash', type: sql.VarChar(255), value: password_hash }, // El hash de bcrypt
            { name: 'estado', type: sql.Bit, value: estado },
            { name: 'id_usuario_accion', type: sql.Int, value: id_usuario_accion }
        ];

        const result = await executeStoredProcedure('sp_CrearUsuario', params);
        
        // El SP devuelve el ID del nuevo usuario
        const nuevoId = result.recordset[0].NuevoIdUsuario;

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            id: nuevoId
        });

    } catch (error) {
        // Manejar errores de SQL (ej: usuario_login duplicado)
        if (error.code && error.code.includes('UNIQUE')) {
            return res.status(409).json({ message: 'El nombre de usuario ya existe.' });
        }
        res.status(500).json({ message: 'Error al crear el usuario.', error: error.message });
    }
};

/**
 * Endpoint para listar usuarios (GET /api/users)
 * Autorización: ADMIN
 */
exports.getUsers = async (req, res) => {
    // El filtro @estado es opcional
    const { estado } = req.query; 

    try {
        const params = [
            { name: 'estado', type: sql.Bit, value: estado !== undefined ? estado : null }
        ];

        const result = await executeStoredProcedure('sp_ObtenerUsuarios', params);

        res.json(result.recordset);

    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la lista de usuarios.', error: error.message });
    }
};
// ... Implementar updateUser y delete logic usando sp_ActualizarUsuario ...