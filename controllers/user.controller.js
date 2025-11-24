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

        // Transformar 'estado' a 'activo' para compatibilidad con frontend
        const usuarios = result.recordset.map(user => ({
            ...user,
            activo: user.estado === 1 || user.estado === true
        }));

        res.json(usuarios);

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
    const { id_rol, nombre, apellido, usuario_login, password_plano } = req.body;

    try {
        // PRIMERO: Obtener los datos actuales del usuario
        const pool = await sql.connect({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            server: process.env.DB_SERVER,
            database: process.env.DB_DATABASE,
            options: {
                encrypt: false,
                trustServerCertificate: true
            }
        });

        const currentUser = await pool.request()
            .input('id_usuario', sql.Int, id_usuario)
            .query('SELECT id_rol, nombre, apellido, usuario_login, estado FROM Tbl_Usuario WHERE id_usuario = @id_usuario');

        if (currentUser.recordset.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const userData = currentUser.recordset[0];

        let password_hash = null;

        // Si se proporciona nueva contraseña, hashearla
        if (password_plano) {
            const salt = await bcrypt.genSalt(10);
            password_hash = await bcrypt.hash(password_plano, salt);
        }

        // Usar valores actuales si no se proporcionan nuevos
        const params = [
            { name: 'id_usuario', type: sql.Int, value: id_usuario },
            { name: 'id_rol', type: sql.Int, value: id_rol || userData.id_rol },
            { name: 'nombre', type: sql.VarChar(100), value: nombre || userData.nombre },
            { name: 'apellido', type: sql.VarChar(100), value: apellido || userData.apellido },
            { name: 'usuario_login', type: sql.VarChar(50), value: usuario_login || userData.usuario_login },
            { name: 'password_hash', type: sql.VarChar(255), value: password_hash },
            { name: 'estado', type: sql.Bit, value: userData.estado }, // Mantener el estado actual
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

/**
 * Endpoint para cambiar el estado de un usuario (PATCH /api/users/:id/estado)
 * Autorización: ADMIN
 * Permite activar/desactivar usuarios con body { estado: 0 o 1 }
 */
exports.toggleUserStatus = async (req, res) => {
    const id_usuario = req.params.id;
    const id_usuario_accion = req.user.id;
    const { estado } = req.body;

    if (estado === undefined || (estado !== 0 && estado !== 1 && estado !== true && estado !== false)) {
        return res.status(400).json({ message: 'El campo estado es requerido y debe ser 0 (inactivo) o 1 (activo).' });
    }

    try {
        // PRIMERO: Obtener los datos actuales del usuario
        const pool = await sql.connect({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            server: process.env.DB_SERVER,
            database: process.env.DB_DATABASE,
            options: {
                encrypt: false,
                trustServerCertificate: true
            }
        });

        const currentUser = await pool.request()
            .input('id_usuario', sql.Int, id_usuario)
            .query('SELECT id_rol, nombre, apellido, usuario_login FROM Tbl_Usuario WHERE id_usuario = @id_usuario');

        if (currentUser.recordset.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const userData = currentUser.recordset[0];

        // Usar los datos actuales del usuario y solo cambiar el estado
        const params = [
            { name: 'id_usuario', type: sql.Int, value: id_usuario },
            { name: 'id_rol', type: sql.Int, value: userData.id_rol },
            { name: 'nombre', type: sql.VarChar(100), value: userData.nombre },
            { name: 'apellido', type: sql.VarChar(100), value: userData.apellido },
            { name: 'usuario_login', type: sql.VarChar(50), value: userData.usuario_login },
            { name: 'password_hash', type: sql.VarChar(255), value: null },
            { name: 'estado', type: sql.Bit, value: estado ? 1 : 0 },
            { name: 'id_usuario_accion', type: sql.Int, value: id_usuario_accion }
        ];

        const result = await executeStoredProcedure('sp_ActualizarUsuario', params);

        res.json({
            message: `Usuario ${estado ? 'activado' : 'desactivado'} exitosamente.`,
            id_usuario: result.recordset[0].id_usuario_actualizado,
            estado: estado ? 1 : 0
        });

    } catch (error) {
        console.error('Error al cambiar estado del usuario:', error);
        res.status(500).json({ message: 'Error al cambiar el estado del usuario.', error: error.message });
    }
};

/**
 * Endpoint para hacer toggle automático del estado de un usuario (PUT /api/users/:id/toggle-estado)
 * Autorización: ADMIN
 * NO requiere body - automáticamente invierte el estado actual
 */
exports.autoToggleUserStatus = async (req, res) => {
    const id_usuario = req.params.id;
    const id_usuario_accion = req.user.id;

    try {
        // Obtener el estado actual y datos del usuario
        const pool = await sql.connect({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            server: process.env.DB_SERVER,
            database: process.env.DB_DATABASE,
            options: {
                encrypt: false,
                trustServerCertificate: true
            }
        });

        const currentUser = await pool.request()
            .input('id_usuario', sql.Int, id_usuario)
            .query('SELECT id_rol, nombre, apellido, usuario_login, estado FROM Tbl_Usuario WHERE id_usuario = @id_usuario');

        if (currentUser.recordset.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const userData = currentUser.recordset[0];

        // Toggle: Si está activo (1 o true), cambiar a inactivo (0), y viceversa
        const estadoActual = userData.estado === 1 || userData.estado === true;
        const nuevoEstado = estadoActual ? 0 : 1;

        // Actualizar con el nuevo estado
        const params = [
            { name: 'id_usuario', type: sql.Int, value: id_usuario },
            { name: 'id_rol', type: sql.Int, value: userData.id_rol },
            { name: 'nombre', type: sql.VarChar(100), value: userData.nombre },
            { name: 'apellido', type: sql.VarChar(100), value: userData.apellido },
            { name: 'usuario_login', type: sql.VarChar(50), value: userData.usuario_login },
            { name: 'password_hash', type: sql.VarChar(255), value: null },
            { name: 'estado', type: sql.Bit, value: nuevoEstado },
            { name: 'id_usuario_accion', type: sql.Int, value: id_usuario_accion }
        ];

        const result = await executeStoredProcedure('sp_ActualizarUsuario', params);

        res.json({
            message: `Usuario ${nuevoEstado === 1 ? 'activado' : 'desactivado'} exitosamente.`,
            id_usuario: result.recordset[0].id_usuario_actualizado,
            nuevoEstado: nuevoEstado
        });

    } catch (error) {
        console.error('Error al cambiar estado del usuario:', error);
        res.status(500).json({ message: 'Error al cambiar el estado del usuario.', error: error.message });
    }
};