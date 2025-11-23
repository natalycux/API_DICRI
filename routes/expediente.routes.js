// routes/expediente.routes.js

const express = require('express');
const expedienteController = require('../controllers/expediente.controller');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Expedientes
 *   description: Gestión completa de Expedientes e Indicios con flujo de estados
 */

// Aplica verificación de token a todas las rutas de expedientes
router.use(verifyToken); 

/**
 * @swagger
 * /expedientes/conteo:
 *   get:
 *     summary: Obtiene el conteo de expedientes por estado
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conteo exitoso
 *       403:
 *         description: Acceso denegado (solo COORDINADOR, ADMIN)
 */
router.get(
    '/conteo',
    authorizeRoles(['COORDINADOR', 'ADMIN']),
    expedienteController.obtenerConteoPorEstado
);

/**
 * @swagger
 * /expedientes:
 *   post:
 *     summary: Crea un nuevo expediente en estado BORRADOR
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExpedienteRequest'
 *     responses:
 *       201:
 *         description: Expediente creado exitosamente
 *       403:
 *         description: Acceso denegado (solo TECNICO)
 */
router.post(
    '/', 
    authorizeRoles(['TECNICO']), 
    expedienteController.crearExpediente
);

/**
 * @swagger
 * /expedientes:
 *   get:
 *     summary: Lista expedientes con filtros opcionales
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_estado
 *         schema:
 *           type: integer
 *         description: Filtrar por estado (1=BORRADOR, 2=EN_REVISION, 3=APROBADO, 4=RECHAZADO)
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por fecha final (YYYY-MM-DD)
 *       - in: query
 *         name: codigo_expediente
 *         schema:
 *           type: string
 *         description: Buscar por código de expediente
 *     responses:
 *       200:
 *         description: Lista de expedientes
 */
router.get(
    '/',
    authorizeRoles(['TECNICO', 'COORDINADOR']),
    expedienteController.listarExpedientes
);

/**
 * @swagger
 * /expedientes/{id}:
 *   get:
 *     summary: Obtiene el detalle completo de un expediente
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     responses:
 *       200:
 *         description: Detalle del expediente con indicios e historial
 *       404:
 *         description: Expediente no encontrado
 */
router.get(
    '/:id',
    authorizeRoles(['TECNICO', 'COORDINADOR']),
    expedienteController.obtenerDetalleExpediente
);

/**
 * @swagger
 * /expedientes/{id}:
 *   put:
 *     summary: Actualiza un expediente (solo en BORRADOR o RECHAZADO)
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExpedienteRequest'
 *     responses:
 *       200:
 *         description: Expediente actualizado
 *       403:
 *         description: Acceso denegado o estado no permite edición
 */
router.put(
    '/:id',
    authorizeRoles(['TECNICO']), 
    expedienteController.actualizarExpediente
);

/**
 * @swagger
 * /expedientes/{id}/estado:
 *   put:
 *     summary: Cambia el estado de un expediente
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CambiarEstadoRequest'
 *     responses:
 *       200:
 *         description: Estado cambiado exitosamente
 *       400:
 *         description: Transición de estado inválida
 */
router.put(
    '/:id/estado', 
    authorizeRoles(['TECNICO', 'COORDINADOR']),
    expedienteController.cambiarEstado
);

/**
 * @swagger
 * /expedientes/{id}/indicios:
 *   post:
 *     summary: Agrega un indicio a un expediente
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateIndicioRequest'
 *     responses:
 *       201:
 *         description: Indicio agregado exitosamente
 *       403:
 *         description: Solo se pueden agregar indicios en estado BORRADOR
 */
router.post(
    '/:id/indicios', 
    authorizeRoles(['TECNICO']), 
    expedienteController.agregarIndicio
);

/**
 * @swagger
 * /expedientes/{id}/indicios/{idIndicio}:
 *   put:
 *     summary: Actualiza un indicio
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *       - in: path
 *         name: idIndicio
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del indicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateIndicioRequest'
 *     responses:
 *       200:
 *         description: Indicio actualizado
 */
router.put(
    '/:id/indicios/:idIndicio', 
    authorizeRoles(['TECNICO']), 
    expedienteController.actualizarIndicio
);

/**
 * @swagger
 * /expedientes/{id}/indicios/{idIndicio}:
 *   delete:
 *     summary: Elimina un indicio
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *       - in: path
 *         name: idIndicio
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del indicio
 *     responses:
 *       200:
 *         description: Indicio eliminado exitosamente
 */
router.delete(
    '/:id/indicios/:idIndicio', 
    authorizeRoles(['TECNICO']), 
    expedienteController.eliminarIndicio
);

module.exports = router;