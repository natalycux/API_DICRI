// middleware/auth.middleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

/**
 * Middleware para verificar el Token JWT (Autenticación)
 */
exports.verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        // Adjuntamos los datos del usuario (id, rol) al objeto request
        req.user = decoded; 
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

/**
 * Middleware para verificar si el usuario tiene uno de los roles requeridos (Autorización)
 * @param {Array<string>} roles Array de nombres de roles permitidos (ej: ['ADMIN', 'COORDINADOR'])
 */
exports.authorizeRoles = (roles) => {
    return (req, res, next) => {
        // req.user fue establecido por verifyToken
        const userRole = req.user.rol; 

        if (!userRole) {
            return res.status(403).json({ message: 'Error de autorización: Rol no definido.' });
        }

        if (roles.includes(userRole)) {
            next(); // El rol es permitido, continuar
        } else {
            res.status(403).json({ 
                message: `Acceso prohibido. Rol '${userRole}' no tiene permiso para esta acción.`,
                required_roles: roles
            });
        }
    };
};