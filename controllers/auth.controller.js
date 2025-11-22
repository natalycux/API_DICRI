// controllers/auth.controller.js

const { executeStoredProcedure, sql } = require('../config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

/**
 * Endpoint de Login (POST /api/auth/login)
 * 1. Hashea la contraseña plana.
 * 2. Llama a sp_LoginUsuario con el hash.
 * 3. Si el usuario existe, genera un token JWT.
 */
exports.login = async (req, res) => {
    const { usuario_login, password_plano } = req.body;

    if (!usuario_login || !password_plano) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }

    try {
        // NOTA IMPORTANTE: sp_LoginUsuario espera la contraseña PLANA.
        // El hasheo (SHA2_256) se realiza DENTRO del SP para la validación.
        // Si usarías bcrypt en Node, tendrías que recuperar el hash del SP 
        // y compararlo aquí, pero nos apegaremos a la lógica del SP actual.

        const params = [
            { name: 'usuario_login', type: sql.VarChar(50), value: usuario_login },
            { name: 'password_plano', type: sql.VarChar(255), value: password_plano }
        ];

        const result = await executeStoredProcedure('sp_LoginUsuario', params);
        
        // El resultado es un array de registros [usuario]
        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas o usuario inactivo.' });
        }

        const user = result.recordset[0];
        
        // Generar Token JWT
        const token = jwt.sign(
            { 
                id: user.id_usuario, 
                rol: user.nombre_rol 
            }, 
            SECRET_KEY, 
            { expiresIn: '1h' } // Token expira en 1 hora
        );

        res.json({
            message: 'Login exitoso',
            user: {
                id_usuario: user.id_usuario,
                nombre: user.nombre,
                rol: user.nombre_rol
            },
            token: token
        });

    } catch (error) {
        // Manejo de errores de DB (ej: conexión fallida)
        res.status(500).json({ message: 'Error en el servidor al autenticar.', error: error.message });
    }
};