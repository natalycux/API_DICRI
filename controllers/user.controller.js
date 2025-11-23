// controllers/user.controller.js

const { executeStoredProcedure, sql } = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * Endpoint para crear un nuevo usuario (POST /api/users)
 * Autorización: ADMIN
 * NOTA: El SP sp_CrearUsuario espera el hash ya generado.
 */
exports.createUser = async (req, res) => {
    const { id_rol, nombre, apellido, usuario_login, password_plano, estado } = req.body;
    const id_usuario_accion = req.user.id; // Obtenido del token (el ADMIN que ejecuta)

    if (!password_plano || !nombre || !apellido || !usuario_login || !id_rol) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        // Generar el Hash con bcrypt
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password_plano, salt);
        
        // Ahora sí, llamamos al SP
        const params = [
            { name: 'id_rol', type: sql.Int, value: id_rol },
            { name: 'nombre', type: sql.VarChar(100), value: nombre },
            { name: 'apellido', type: sql.VarChar(100), value: apellido },
            { name: 'usuario_login', type: sql.VarChar(50), value: usuario_login },
            { name: 'password_hash', type: sql.VarChar(255), value: password_hash },
            { name: 'estado', type: sql.Bit, value: estado !== undefined ? estado : 1 },
            { name: 'id_usuario_accion', type: sql.Int, value: id_usuario_accion }
        ];

        const result = await executeStoredProcedure('sp_CrearUsuario', params);
        
        // El SP devuelve el ID del nuevo usuario
        const nuevoId = result.recordset[0].NuevoIdUsuario;

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            id_usuario: nuevoId
        });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        // Manejar errores de SQL (ej: usuario_login duplicado)
        if (error.message && error.message.includes('UNIQUE')) {
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
            { name: 'estado', type: sql.Bit, value: estado !== undefined ? parseInt(estado) : null }
        ];

        const result = await executeStoredProcedure('sp_ObtenerUsuarios', params);

        res.json(result.recordset);

    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error al obtener la lista de usuarios.', error: error.message });
    }
};

/**
 * Endpoint para actualizar un usuario (PUT /api/users/:id)
 * Autorización: ADMIN
 * Llama al SP: sp_ActualizarUsuario
 */
exports.updateUser = async (req, res) => {
    const id_usuario = req.params.id;
    const id_usuario_accion = req.user.id;
    const { id_rol, nombre, apellido, usuario_login, password_plano, estado } = req.body;

    try {
        let password_hash = null;

        // Si se proporciona nueva contraseña, hashearla
        if (password_plano) {
            const salt = await bcrypt.genSalt(10);
            password_hash = await bcrypt.hash(password_plano, salt);
        }

        const params = [
            { name: 'id_usuario', type: sql.Int, value: id_usuario },
            { name: 'id_rol', type: sql.Int, value: id_rol || null },
            { name: 'nombre', type: sql.VarChar(100), value: nombre || null },
            { name: 'apellido', type: sql.VarChar(100), value: apellido || null },
            { name: 'usuario_login', type: sql.VarChar(50), value: usuario_login || null },
            { name: 'password_hash', type: sql.VarChar(255), value: password_hash },
            { name: 'estado', type: sql.Bit, value: estado !== undefined ? estado : null },
            { name: 'id_usuario_accion', type: sql.Int, value: id_usuario_accion }
        ];

        const result = await executeStoredProcedure('sp_ActualizarUsuario', params);

        res.json({
            message: `Usuario ${id_usuario} actualizado exitosamente.`,
            id_usuario_actualizado: result.recordset[0].id_usuario_actualizado
        });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error al actualizar el usuario.', error: error.message });
    }
};