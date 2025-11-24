// routes/user.routes.js

const express = require('express');
const userController = require('../controllers/user.controller');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios del sistema (solo ADMIN)
 */

// Middleware de protección: Todas las rutas de usuarios requieren token y rol ADMIN
router.use(verifyToken); 
router.use(authorizeRoles(['ADMIN']));

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       403:
 *         description: Acceso denegado (solo ADMIN)
 *       409:
 *         description: Usuario ya existe
 */
router.post('/', userController.createUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: Filtrar por estado (0=inactivo, 1=activo)
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/', userController.getUsers);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualiza un usuario existente
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       403:
 *         description: Acceso denegado
 */
router.put('/:id', userController.updateUser);

/**
 * @swagger
 * /users/{id}/estado:
 *   patch:
 *     summary: Activa o desactiva un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: 0 para desactivar, 1 para activar
 *           example:
 *             estado: 1
 *     responses:
 *       200:
 *         description: Estado del usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id_usuario:
 *                   type: integer
 *                 estado:
 *                   type: integer
 *       400:
 *         description: Campo estado inválido
 *       403:
 *         description: Acceso denegado
 */
router.patch('/:id/estado', userController.toggleUserStatus);

/**
 * @swagger
 * /users/{id}/toggle-estado:
 *   put:
 *     summary: Hace toggle automático del estado del usuario (activo ↔ inactivo)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Estado del usuario cambiado automáticamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id_usuario:
 *                   type: integer
 *                 nuevoEstado:
 *                   type: integer
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: Acceso denegado
 */
router.put('/:id/toggle-estado', userController.autoToggleUserStatus);

module.exports = router;