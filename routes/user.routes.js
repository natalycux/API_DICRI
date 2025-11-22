// routes/user.routes.js

const express = require('express');
const userController = require('../controllers/user.controller');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');
const router = express.Router();

// Middleware de protección: Todas las rutas de usuarios requieren token y rol ADMIN
router.use(verifyToken); 
router.use(authorizeRoles(['ADMIN']));

// POST /api/users - Crear usuario
router.post('/', userController.createUser);

// GET /api/users - Listar usuarios
router.get('/', userController.getUsers);

// ... Rutas para actualizar y eliminar usuario ...

module.exports = router;