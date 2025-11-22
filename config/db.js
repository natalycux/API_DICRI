// config/db.js

const sql = require('mssql');
require('dotenv').config();

// Objeto de configuración de conexión usando variables de entorno
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false, // Cambiar a true si usas Azure o SQL Server con SSL
        trustServerCertificate: true // Necesario para desarrollo local
    }
};

/**
 * Conecta y ejecuta un Procedimiento Almacenado con los parámetros dados.
 * @param {string} spName Nombre del stored procedure (ej: 'sp_LoginUsuario').
 * @param {Array<Object>} inputParams Array de objetos {name, type, value}.
 * @returns {Promise<sql.IResult<any>>} El resultado de la consulta.
 */
async function executeStoredProcedure(spName, inputParams = []) {
    try {
        await sql.connect(config);
        const request = new sql.Request();

        // Agregar los parámetros de entrada
        inputParams.forEach(param => {
            // Utilizamos el tipo de dato de mssql (ej: sql.VarChar, sql.Int)
            request.input(param.name, param.type, param.value);
        });

        console.log(`Ejecutando SP: ${spName}`);
        const result = await request.execute(spName);
        return result;

    } catch (err) {
        console.error("Error al ejecutar el SP:", err);
        // Lanzamos el error para que el controlador lo maneje y devuelva un 500
        throw err;
    } finally {
        // La conexión se cierra automáticamente al finalizar el pool en mssql,
        // pero es buena práctica liberarla si se maneja un pool explícito (simplificado aquí).
        // sql.close(); 
    }
}

module.exports = { executeStoredProcedure, sql };