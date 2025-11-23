// controllers/expediente.controller.js

const { executeStoredProcedure, sql } = require('../config/db');

/**
 * Endpoint para crear un nuevo Expediente (POST /api/expedientes)
 * Autorización: TECNICO
 * Llama al SP: sp_CrearExpediente
 */
exports.crearExpediente = async (req, res) => {
    // El id_usuario_registro se obtiene del token JWT del usuario logueado.
    const id_usuario_registro = req.user.id; 
    
    // Parámetros esperados del cuerpo de la petición
    const { codigo_expediente, id_fiscalia, descripcion_corta, ruta_archivo_pdf } = req.body;

    if (!codigo_expediente || !id_fiscalia || !descripcion_corta) {
        return res.status(400).json({ message: 'El código, la fiscalía y la descripción son obligatorios.' });
    }

    try {
        const params = [
            { name: 'codigo_expediente', type: sql.VarChar(50), value: codigo_expediente },
            { name: 'id_fiscalia', type: sql.Int, value: id_fiscalia },
            { name: 'descripcion_corta', type: sql.VarChar(255), value: descripcion_corta },
            { name: 'ruta_archivo_pdf', type: sql.VarChar(255), value: ruta_archivo_pdf || null },
            { name: 'id_usuario_registro', type: sql.Int, value: id_usuario_registro }
        ];

        // El SP (6) sp_CrearExpediente maneja la transacción y el historial de estado.
        const result = await executeStoredProcedure('sp_CrearExpediente', params);
        
        // El SP devuelve el ID del nuevo expediente
        const nuevoId = result.recordset[0].id_expediente;

        res.status(201).json({
            message: 'Expediente creado exitosamente en estado BORRADOR.',
            id_expediente: nuevoId
        });

    } catch (error) {
        // El SP lanza errores si la Fiscalía no es válida o si el código_expediente es duplicado.
        console.error('Error al crear expediente:', error);
        res.status(500).json({ message: 'Error al registrar el expediente.', error: error.message });
    }
};


/**
 * Endpoint para agregar un Indicio a un Expediente (POST /api/expedientes/:id/indicios)
 * Autorización: TECNICO
 * Llama al SP: sp_AgregarIndicio
 */
exports.agregarIndicio = async (req, res) => {
    // El id_expediente viene de la URL
    const id_expediente = req.params.id; 
    // El id_usuario_registro se obtiene del token JWT
    const id_usuario_registro = req.user.id; 

    const { nombre_objeto, descripcion, color, tamano, peso, ubicacion_en_escena } = req.body;

    if (!nombre_objeto || !descripcion || !ubicacion_en_escena) {
        return res.status(400).json({ message: 'El nombre, descripción y ubicación del indicio son obligatorios.' });
    }

    try {
        const params = [
            { name: 'id_expediente', type: sql.Int, value: id_expediente },
            { name: 'nombre_objeto', type: sql.VarChar(150), value: nombre_objeto },
            { name: 'descripcion', type: sql.VarChar(500), value: descripcion },
            { name: 'color', type: sql.VarChar(50), value: color || null },
            { name: 'tamano', type: sql.VarChar(50), value: tamano || null },
            { name: 'peso', type: sql.Decimal(10, 2), value: peso || null },
            { name: 'ubicacion_en_escena', type: sql.VarChar(255), value: ubicacion_en_escena },
            { name: 'id_usuario_registro', type: sql.Int, value: id_usuario_registro }
        ];

        // El SP (7) sp_AgregarIndicio valida si el expediente está en estado BORRADOR (1).
        const result = await executeStoredProcedure('sp_AgregarIndicio', params);
        const nuevoIdIndicio = result.recordset[0].NuevoIdIndicio;

        res.status(201).json({
            message: 'Indicio agregado al expediente exitosamente.',
            id_indicio: nuevoIdIndicio
        });

    } catch (error) {
        console.error('Error al agregar indicio:', error);
        // El SP lanza un error si el expediente no existe o no está en BORRADOR.
        res.status(500).json({ message: 'Error al agregar el indicio. Verifique el estado del expediente.', error: error.message });
    }
};


/**
 * Endpoint para CAMBIAR el estado de un Expediente (PUT /api/expedientes/:id/estado)
 * Autorización: TECNICO (para enviar a revisión) o COORDINADOR (para aprobar/rechazar)
 * Llama al SP: sp_CambiarEstadoExpediente
 */
exports.cambiarEstado = async (req, res) => {
    const id_expediente = req.params.id;
    const id_usuario_accion = req.user.id; 
    const rol_usuario = req.user.rol;
    
    const { id_estado_nuevo, justificacion } = req.body;

    if (!id_estado_nuevo) {
        return res.status(400).json({ message: 'El nuevo estado (id_estado_nuevo) es obligatorio.' });
    }

    // El SP (8) sp_CambiarEstadoExpediente contiene TODA la lógica de validación de flujos y roles.
    // Solo necesitamos asegurarnos de que el usuario tenga un rol permitido (TECNICO o COORDINADOR).
    
    try {
        const params = [
            { name: 'id_expediente', type: sql.Int, value: id_expediente },
            { name: 'id_estado_nuevo', type: sql.Int, value: id_estado_nuevo },
            { name: 'justificacion', type: sql.VarChar(500), value: justificacion || null },
            { name: 'id_usuario_accion', type: sql.Int, value: id_usuario_accion }
        ];

        // El SP devolverá un error si:
        // 1. El rol no tiene permiso para esa transición (Ej: Técnico intentando Aprobar).
        // 2. La justificación falta en caso de RECHAZO (ID 4).
        // 3. La transición es inválida (Ej: APROBADO intentando cambiar de nuevo).
        const result = await executeStoredProcedure('sp_CambiarEstadoExpediente', params);

        res.json({
            message: `Estado del Expediente ${id_expediente} actualizado a ID ${id_estado_nuevo}.`,
            id_expediente_actualizado: result.recordset[0].id_expediente_actualizado
        });

    } catch (error) {
        console.error('Error al cambiar estado:', error);
        // Cuando el SP lanza un RAISERROR, SQL Server lo devuelve como un error que podemos capturar.
        res.status(400).json({ message: 'Fallo al cambiar el estado. Verifique las reglas del flujo.', error: error.message });
    }
};


/**
 * Endpoint para obtener el detalle de un Expediente (GET /api/expedientes/:id)
 * Autorización: TECNICO, COORDINADOR
 * Llama al SP: sp_ObtenerExpedienteDetalle
 */
exports.obtenerDetalleExpediente = async (req, res) => {
    const id_expediente = req.params.id;

    try {
        const params = [
            { name: 'id_expediente', type: sql.Int, value: id_expediente }
        ];

        // El SP (9) devuelve 3 Result Sets (Expediente, Indicios, Historial)
        const result = await executeStoredProcedure('sp_ObtenerExpedienteDetalle', params);
        
        if (result.recordsets[0].length === 0) {
            return res.status(404).json({ message: 'Expediente no encontrado.' });
        }
        
        // Estructuramos la respuesta de los 3 Result Sets
        const detalleExpediente = {
            datos_principales: result.recordsets[0][0], // Primer Result Set (solo 1 fila)
            indicios: result.recordsets[1],             // Segundo Result Set (lista de indicios)
            historial_estado: result.recordsets[2]      // Tercer Result Set (historial)
        };

        res.json(detalleExpediente);

    } catch (error) {
        console.error('Error al obtener detalle del expediente:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener el detalle.', error: error.message });
    }
};


/**
 * Endpoint para actualizar datos generales de un Expediente (PUT /api/expedientes/:id)
 * Autorización: TECNICO
 * Llama al SP: sp_ActualizarExpediente (11)
 */
exports.actualizarExpediente = async (req, res) => {
    const id_expediente = req.params.id;
    const id_usuario_accion = req.user.id; 
    
    // Parámetros esperados del cuerpo de la petición
    const { codigo_expediente, id_fiscalia, descripcion_corta, ruta_archivo_pdf } = req.body;

    if (!codigo_expediente || !id_fiscalia || !descripcion_corta) {
        return res.status(400).json({ message: 'El código, fiscalía y descripción son obligatorios.' });
    }

    try {
        const params = [
            { name: 'id_expediente', type: sql.Int, value: id_expediente },
            { name: 'codigo_expediente', type: sql.VarChar(50), value: codigo_expediente },
            { name: 'id_fiscalia', type: sql.Int, value: id_fiscalia },
            { name: 'descripcion_corta', type: sql.VarChar(255), value: descripcion_corta },
            { name: 'ruta_archivo_pdf', type: sql.VarChar(255), value: ruta_archivo_pdf || null },
            { name: 'id_usuario_accion', type: sql.Int, value: id_usuario_accion }
        ];

        // El SP (11) sp_ActualizarExpediente valida el estado (solo BORRADOR o RECHAZADO).
        const result = await executeStoredProcedure('sp_ActualizarExpediente', params);
        
        res.status(200).json({
            message: `Expediente ${id_expediente} actualizado exitosamente.`,
            id_expediente_actualizado: result.recordset[0].id_expediente_actualizado
        });

    } catch (error) {
        console.error('Error al actualizar expediente:', error);
        res.status(500).json({ message: 'Error al actualizar el expediente. Verifique el estado.', error: error.message });
    }
};


/**
 * Endpoint para actualizar un Indicio (PUT /api/expedientes/:id/indicios/:idIndicio)
 * Autorización: TECNICO
 * Llama al SP: sp_ActualizarIndicio (12)
 */
exports.actualizarIndicio = async (req, res) => {
    const id_indicio = req.params.idIndicio;
    const id_usuario_accion = req.user.id; 

    const { nombre_objeto, descripcion, color, tamano, peso, ubicacion_en_escena } = req.body;

    if (!nombre_objeto || !descripcion || !ubicacion_en_escena) {
        return res.status(400).json({ message: 'El nombre, descripción y ubicación son obligatorios.' });
    }

    try {
        const params = [
            { name: 'id_indicio', type: sql.Int, value: id_indicio },
            { name: 'nombre_objeto', type: sql.VarChar(150), value: nombre_objeto },
            { name: 'descripcion', type: sql.VarChar(500), value: descripcion },
            { name: 'color', type: sql.VarChar(50), value: color || null },
            { name: 'tamano', type: sql.VarChar(50), value: tamano || null },
            { name: 'peso', type: sql.Decimal(10, 2), value: peso || null },
            { name: 'ubicacion_en_escena', type: sql.VarChar(255), value: ubicacion_en_escena },
            { name: 'id_usuario_accion', type: sql.Int, value: id_usuario_accion }
        ];

        // El SP (12) sp_ActualizarIndicio valida el estado del expediente.
        const result = await executeStoredProcedure('sp_ActualizarIndicio', params);
        
        res.status(200).json({
            message: `Indicio ${id_indicio} actualizado exitosamente.`,
            id_indicio_actualizado: result.recordset[0].id_indicio_actualizado
        });

    } catch (error) {
        console.error('Error al actualizar indicio:', error);
        res.status(500).json({ message: 'Error al actualizar el indicio. Verifique el estado del expediente.', error: error.message });
    }
};



/**
 * Endpoint para eliminar un Indicio (DELETE /api/expedientes/:id/indicios/:idIndicio)
 * Autorización: TECNICO
 * Llama al SP: sp_EliminarIndicio (13)
 */
exports.eliminarIndicio = async (req, res) => {
    const id_indicio = req.params.idIndicio;
    const id_usuario_accion = req.user.id;
    
    try {
        const params = [
            { name: 'id_indicio', type: sql.Int, value: id_indicio },
            { name: 'id_usuario_accion', type: sql.Int, value: id_usuario_accion }
        ];

        // El SP (13) sp_EliminarIndicio valida el estado y registra en bitácora.
        await executeStoredProcedure('sp_EliminarIndicio', params);
        
        res.status(200).json({
            message: `Indicio ${id_indicio} eliminado exitosamente. (Acción registrada en la Bitácora).`
        });

    } catch (error) {
        console.error('Error al eliminar indicio:', error);
        res.status(500).json({ message: 'Error al eliminar el indicio. Verifique el estado del expediente.', error: error.message });
    }
};


/**
 * Endpoint para obtener el listado de Expedientes (GET /api/expedientes)
 * Autorización: TECNICO, COORDINADOR
 * Llama al SP: sp_ListarExpedientes (10)
 */
exports.listarExpedientes = async (req, res) => {
    // Filtros opcionales desde los query parameters
    const { id_estado, fecha_inicio, fecha_fin, codigo_expediente } = req.query;

    try {
        const params = [
            { name: 'id_estado', type: sql.Int, value: id_estado ? parseInt(id_estado) : null },
            // Las fechas se esperan en formato ISO (YYYY-MM-DD)
            { name: 'fecha_inicio', type: sql.DateTime, value: fecha_inicio || null },
            { name: 'fecha_fin', type: sql.DateTime, value: fecha_fin || null },
            { name: 'codigo_expediente', type: sql.VarChar(50), value: codigo_expediente || null }
        ];

        // El SP (10) sp_ListarExpedientes usa la vista vw_ReporteExpedientes.
        const result = await executeStoredProcedure('sp_ListarExpedientes', params);

        res.json(result.recordset);

    } catch (error) {
        console.error('Error al listar expedientes:', error);
        res.status(500).json({ message: 'Error al obtener el listado de expedientes.', error: error.message });
    }
};

/**
 * Endpoint para obtener el conteo de Expedientes por Estado (GET /api/expedientes/conteo)
 * Autorización: COORDINADOR, ADMIN
 * Llama al SP: sp_ObtenerConteoExpedientesPorEstado (23)
 */
exports.obtenerConteoPorEstado = async (req, res) => {
    try {
        // No necesita parámetros
        const result = await executeStoredProcedure('sp_ObtenerConteoExpedientesPorEstado');

        res.json(result.recordset);

    } catch (error) {
        console.error('Error al obtener conteo:', error);
        res.status(500).json({ message: 'Error al obtener el conteo de expedientes por estado.', error: error.message });
    }
};