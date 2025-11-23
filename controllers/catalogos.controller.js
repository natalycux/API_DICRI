// controllers/catalogos.controller.js

const { executeStoredProcedure, sql } = require('../config/db');

/**
 * Endpoint para obtener catálogos geográficos (GET /api/catalogos/geograficos)
 * Autorización: Público o autenticado
 * Llama al SP: sp_ObtenerCatalogosGeograficos
 */
exports.getCatalogosGeograficos = async (req, res) => {
    try {
        // El SP retorna 3 result sets: Departamentos, Municipios, Fiscalías
        const result = await executeStoredProcedure('sp_ObtenerCatalogosGeograficos');

        res.json({
            departamentos: result.recordsets[0],
            municipios: result.recordsets[1],
            fiscalias: result.recordsets[2]
        });

    } catch (error) {
        console.error('Error al obtener catálogos geográficos:', error);
        res.status(500).json({ message: 'Error al obtener los catálogos.', error: error.message });
    }
};

/**
 * Endpoint para obtener roles (GET /api/catalogos/roles)
 * Autorización: ADMIN
 */
exports.getRoles = async (req, res) => {
    try {
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

        const result = await pool.request().query(`
            SELECT id_rol, nombre_rol 
            FROM Tbl_Rol 
            WHERE estado = 1 
            ORDER BY nombre_rol
        `);

        res.json(result.recordset);

    } catch (error) {
        console.error('Error al obtener roles:', error);
        res.status(500).json({ message: 'Error al obtener los roles.', error: error.message });
    }
};

/**
 * Endpoint para obtener estados de expediente (GET /api/catalogos/estados)
 * Autorización: Autenticado
 */
exports.getEstadosExpediente = async (req, res) => {
    try {
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

        const result = await pool.request().query(`
            SELECT id_estado, nombre_estado 
            FROM Tbl_EstadoExpediente 
            ORDER BY id_estado
        `);

        res.json(result.recordset);

    } catch (error) {
        console.error('Error al obtener estados:', error);
        res.status(500).json({ message: 'Error al obtener los estados.', error: error.message });
    }
};

/**
 * Endpoint para crear un departamento (POST /api/catalogos/departamentos)
 * Autorización: ADMIN
 */
exports.createDepartamento = async (req, res) => {
    const { nombre_departamento } = req.body;
    const id_usuario_accion = req.user.id;

    if (!nombre_departamento) {
        return res.status(400).json({ message: 'El nombre del departamento es obligatorio.' });
    }

    try {
        const params = [
            { name: 'nombre_departamento', type: sql.VarChar(100), value: nombre_departamento },
            { name: 'id_usuario_accion', type: sql.Int, value: id_usuario_accion }
        ];

        const result = await executeStoredProcedure('sp_CrearDepartamento', params);

        res.status(201).json({
            message: 'Departamento creado exitosamente.',
            id_departamento: result.recordset[0].NuevoIdDepartamento
        });

    } catch (error) {
        console.error('Error al crear departamento:', error);
        res.status(500).json({ message: 'Error al crear el departamento.', error: error.message });
    }
};

/**
 * Endpoint para crear un municipio (POST /api/catalogos/municipios)
 * Autorización: ADMIN
 */
exports.createMunicipio = async (req, res) => {
    const { id_departamento, nombre_municipio } = req.body;
    const id_usuario_accion = req.user.id;

    if (!id_departamento || !nombre_municipio) {
        return res.status(400).json({ message: 'El departamento y nombre del municipio son obligatorios.' });
    }

    try {
        const params = [
            { name: 'id_departamento', type: sql.Int, value: id_departamento },
            { name: 'nombre_municipio', type: sql.VarChar(100), value: nombre_municipio },
            { name: 'id_usuario_accion', type: sql.Int, value: id_usuario_accion }
        ];

        const result = await executeStoredProcedure('sp_CrearMunicipio', params);

        res.status(201).json({
            message: 'Municipio creado exitosamente.',
            id_municipio: result.recordset[0].NuevoIdMunicipio
        });

    } catch (error) {
        console.error('Error al crear municipio:', error);
        res.status(500).json({ message: 'Error al crear el municipio.', error: error.message });
    }
};

/**
 * Endpoint para crear una fiscalía (POST /api/catalogos/fiscalias)
 * Autorización: ADMIN
 */
exports.createFiscalia = async (req, res) => {
    const { id_municipio, nombre_fiscalia } = req.body;
    const id_usuario_accion = req.user.id;

    if (!id_municipio || !nombre_fiscalia) {
        return res.status(400).json({ message: 'El municipio y nombre de la fiscalía son obligatorios.' });
    }

    try {
        const params = [
            { name: 'id_municipio', type: sql.Int, value: id_municipio },
            { name: 'nombre_fiscalia', type: sql.VarChar(150), value: nombre_fiscalia },
            { name: 'id_usuario_accion', type: sql.Int, value: id_usuario_accion }
        ];

        const result = await executeStoredProcedure('sp_CrearFiscalia', params);

        res.status(201).json({
            message: 'Fiscalía creada exitosamente.',
            id_fiscalia: result.recordset[0].NuevoIdFiscalia
        });

    } catch (error) {
        console.error('Error al crear fiscalía:', error);
        res.status(500).json({ message: 'Error al crear la fiscalía.', error: error.message });
    }
};
