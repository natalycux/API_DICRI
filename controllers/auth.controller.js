// controllers/auth.controller.js

const { executeStoredProcedure, sql } = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

/**
 * Endpoint de Login (POST /api/auth/login)
 * 1. Obtiene el usuario de la BD por usuario_login.
 * 2. Compara la contraseña plana con el hash almacenado usando bcrypt.
 * 3. Si coincide, genera un token JWT.
 */
exports.login = async (req, res) => {
    const { usuario_login, password_plano } = req.body;

    if (!usuario_login || !password_plano) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }

    try {
        // Obtener el usuario de la base de datos
        const params = [
            { name: 'usuario_login', type: sql.VarChar(50), value: usuario_login }
        ];

        // Consulta directa para obtener el hash almacenado
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

        const result = await pool.request()
            .input('usuario_login', sql.VarChar(50), usuario_login)
            .query(`
                SELECT U.id_usuario, U.nombre, U.apellido, U.password_hash, R.nombre_rol
                FROM Tbl_Usuario U
                INNER JOIN Tbl_Rol R ON U.id_rol = R.id_rol
                WHERE U.usuario_login = @usuario_login AND U.estado = 1
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas o usuario inactivo.' });
        }

        const user = result.recordset[0];

        // Comparar la contraseña plana con el hash almacenado usando bcrypt
        const isPasswordValid = await bcrypt.compare(password_plano, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // Generar Token JWT
        const token = jwt.sign(
            { 
                id: user.id_usuario, 
                rol: user.nombre_rol 
            }, 
            SECRET_KEY, 
            { expiresIn: '8h' } // Token expira en 8 horas
        );

        res.json({
            message: 'Login exitoso',
            user: {
                id_usuario: user.id_usuario,
                nombre: user.nombre,
                apellido: user.apellido,
                rol: user.nombre_rol
            },
            token: token
        });

    } catch (error) {
        // Manejo de errores de DB (ej: conexión fallida)
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor al autenticar.', error: error.message });
    }
};