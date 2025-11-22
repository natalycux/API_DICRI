// routes/expediente.routes.js (COMPLETO)

const express = require('express');
const expedienteController = require('../controllers/expediente.controller');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');
const router = express.Router();

// Aplica verificación de token a todas las rutas de expedientes
router.use(verifyToken); 

// ===============================================
// RUTAS DE EXPEDIENTES (CRUD Principal)
// ===============================================

// POST /api/expedientes: Crear Expediente (Solo TECNICO)
router.post(
    '/', 
    authorizeRoles(['TECNICO']), 
    expedienteController.crearExpediente
);

// PUT /api/expedientes/:id: Actualizar Expediente (Solo TECNICO - en BORRADOR/RECHAZADO)
router.put(
    '/:id',
    authorizeRoles(['TECNICO']), 
    expedienteController.actualizarExpediente
);

// GET /api/expedientes/:id: Obtener Detalle (TECNICO, COORDINADOR)
router.get(
    '/:id',
    authorizeRoles(['TECNICO', 'COORDINADOR']),
    expedienteController.obtenerDetalleExpediente
);

// GET /api/expedientes: Listar Expedientes con Filtros (TECNICO, COORDINADOR)
router.get(
    '/',
    authorizeRoles(['TECNICO', 'COORDINADOR']),
    expedienteController.listarExpedientes
);

// GET /api/expedientes/conteo: Conteo por Estado (COORDINADOR, ADMIN)
router.get(
    '/conteo', // Debe ir antes de /:id para evitar que "conteo" se interprete como un ID
    authorizeRoles(['COORDINADOR', 'ADMIN']),
    expedienteController.obtenerConteoPorEstado
);


// ===============================================
// RUTAS DE INDICIOS (CRUD)
// ===============================================

// POST /api/expedientes/:id/indicios: Agregar Indicio (Solo TECNICO)
router.post(
    '/:id/indicios', 
    authorizeRoles(['TECNICO']), 
    expedienteController.agregarIndicio
);

// PUT /api/expedientes/:id/indicios/:idIndicio: Actualizar Indicio (Solo TECNICO)
router.put(
    '/:id/indicios/:idIndicio', 
    authorizeRoles(['TECNICO']), 
    expedienteController.actualizarIndicio
);

// DELETE /api/expedientes/:id/indicios/:idIndicio: Eliminar Indicio (Solo TECNICO)
router.delete(
    '/:id/indicios/:idIndicio', 
    authorizeRoles(['TECNICO']), 
    expedienteController.eliminarIndicio
);


// ===============================================
// RUTAS DE FLUJO DE ESTADO
// ===============================================

// PUT /api/expedientes/:id/estado: Cambiar Estado
router.put(
    '/:id/estado', 
    authorizeRoles(['TECNICO', 'COORDINADOR']),
    expedienteController.cambiarEstado
);

module.exports = router;