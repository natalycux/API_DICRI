// routes/catalogos.routes.js

const express = require('express');
const catalogosController = require('../controllers/catalogos.controller');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Catálogos
 *   description: Catálogos geográficos, roles y estados del sistema
 */

/**
 * @swagger
 * /catalogos/geograficos:
 *   get:
 *     summary: Obtiene catálogos geográficos (Departamentos, Municipios, Fiscalías)
 *     tags: [Catálogos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Catálogos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 departamentos:
 *                   type: array
 *                   items:
 *                     type: object
 *                 municipios:
 *                   type: array
 *                   items:
 *                     type: object
 *                 fiscalias:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/geograficos', verifyToken, catalogosController.getCatalogosGeograficos);

/**
 * @swagger
 * /catalogos/roles:
 *   get:
 *     summary: Obtiene lista de roles disponibles
 *     tags: [Catálogos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles
 */
router.get('/roles', verifyToken, authorizeRoles(['ADMIN']), catalogosController.getRoles);

/**
 * @swagger
 * /catalogos/estados:
 *   get:
 *     summary: Obtiene estados de expediente
 *     tags: [Catálogos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estados
 */
router.get('/estados', verifyToken, catalogosController.getEstadosExpediente);

/**
 * @swagger
 * /catalogos/departamentos:
 *   post:
 *     summary: Crea un nuevo departamento
 *     tags: [Catálogos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_departamento
 *             properties:
 *               nombre_departamento:
 *                 type: string
 *                 example: "Petén"
 *     responses:
 *       201:
 *         description: Departamento creado
 *       403:
 *         description: Solo ADMIN
 */
router.post('/departamentos', verifyToken, authorizeRoles(['ADMIN']), catalogosController.createDepartamento);

/**
 * @swagger
 * /catalogos/municipios:
 *   post:
 *     summary: Crea un nuevo municipio
 *     tags: [Catálogos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_departamento
 *               - nombre_municipio
 *             properties:
 *               id_departamento:
 *                 type: integer
 *                 example: 1
 *               nombre_municipio:
 *                 type: string
 *                 example: "Mixco"
 *     responses:
 *       201:
 *         description: Municipio creado
 */
router.post('/municipios', verifyToken, authorizeRoles(['ADMIN']), catalogosController.createMunicipio);

/**
 * @swagger
 * /catalogos/fiscalias:
 *   post:
 *     summary: Crea una nueva fiscalía
 *     tags: [Catálogos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_municipio
 *               - nombre_fiscalia
 *             properties:
 *               id_municipio:
 *                 type: integer
 *                 example: 1
 *               nombre_fiscalia:
 *                 type: string
 *                 example: "Fiscalía de Delitos contra la Vida"
 *     responses:
 *       201:
 *         description: Fiscalía creada
 */
router.post('/fiscalias', verifyToken, authorizeRoles(['ADMIN']), catalogosController.createFiscalia);

module.exports = router;
