// swagger.js

const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

// Opciones de configuración de Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API DICRI - Gestión de Evidencia',
      version: '1.0.0',
      description: 'API RESTful para la Dirección de Investigación Criminalística del Ministerio Público, Guatemala. Permite la gestión completa del flujo de trabajo de Expedientes e Indicios con control de estados, roles y auditoría.',
      contact: {
        name: 'Soporte API DICRI',
        email: 'soporte@dicri.gob.gt'
      }
    },
    servers: [
      {
        url: 'http://localhost:4000/api',
        description: 'Servidor de Desarrollo Local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el token JWT obtenido del endpoint /auth/login'
        },
      },
      schemas: {
        // Esquemas de Autenticación
        LoginRequest: {
          type: 'object',
          required: ['usuario_login', 'password_plano'],
          properties: {
            usuario_login: {
              type: 'string',
              example: 'admin',
              description: 'Nombre de usuario'
            },
            password_plano: {
              type: 'string',
              example: 'pass',
              description: 'Contraseña en texto plano'
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Login exitoso' },
            user: {
              type: 'object',
              properties: {
                id_usuario: { type: 'integer', example: 1 },
                nombre: { type: 'string', example: 'Admin' },
                apellido: { type: 'string', example: 'Sistema' },
                rol: { type: 'string', example: 'ADMIN' }
              }
            },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
          }
        },
        
        // Esquemas de Usuario
        CreateUserRequest: {
          type: 'object',
          required: ['id_rol', 'nombre', 'apellido', 'usuario_login', 'password_plano'],
          properties: {
            id_rol: { type: 'integer', example: 3, description: 'ID del rol (1=ADMIN, 2=COORDINADOR, 3=TECNICO)' },
            nombre: { type: 'string', example: 'Juan' },
            apellido: { type: 'string', example: 'Pérez' },
            usuario_login: { type: 'string', example: 'jperez' },
            password_plano: { type: 'string', example: 'password123' },
            estado: { type: 'boolean', example: true, description: 'Estado del usuario (true=activo, false=inactivo)' }
          }
        },
        
        // Esquemas de Expediente
        CreateExpedienteRequest: {
          type: 'object',
          required: ['codigo_expediente', 'id_fiscalia', 'descripcion_corta'],
          properties: {
            codigo_expediente: {
              type: 'string',
              example: 'DICRI-2025-001',
              description: 'Código único del expediente'
            },
            id_fiscalia: {
              type: 'integer',
              example: 1,
              description: 'ID de la fiscalía solicitante'
            },
            descripcion_corta: {
              type: 'string',
              example: 'Inspección de escena por robo agravado en Zona 1',
              description: 'Resumen del caso'
            },
            ruta_archivo_pdf: {
              type: 'string',
              example: '/docs/2025/001/informe.pdf',
              description: 'Ruta del archivo PDF (opcional)'
            },
          },
        },
        
        // Esquemas de Indicio
        CreateIndicioRequest: {
          type: 'object',
          required: ['nombre_objeto', 'descripcion', 'ubicacion_en_escena'],
          properties: {
            nombre_objeto: { type: 'string', example: 'Arma de fuego calibre 9mm' },
            descripcion: { type: 'string', example: 'Pistola semiautomática marca Glock modelo 17' },
            color: { type: 'string', example: 'Negro', description: 'Opcional' },
            tamano: { type: 'string', example: '18cm x 13cm', description: 'Opcional' },
            peso: { type: 'number', format: 'decimal', example: 0.65, description: 'Peso en kg (opcional)' },
            ubicacion_en_escena: { type: 'string', example: 'Sala principal, junto al sofá' }
          }
        },
        
        // Cambio de Estado
        CambiarEstadoRequest: {
          type: 'object',
          required: ['id_estado_nuevo'],
          properties: {
            id_estado_nuevo: {
              type: 'integer',
              example: 2,
              description: 'ID del nuevo estado (1=BORRADOR, 2=EN_REVISION, 3=APROBADO, 4=RECHAZADO)'
            },
            justificacion: {
              type: 'string',
              example: 'Falta información sobre el peritaje balístico',
              description: 'Obligatorio cuando id_estado_nuevo=4 (RECHAZADO)'
            }
          }
        },
        
        // Respuestas de Error
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error en el servidor' },
            error: { type: 'string', example: 'Detalles del error...' },
          },
        },
      },
    },
    // Aplicar seguridad globalmente (opcional, se puede aplicar por endpoint)
    security: [],
  },
  // Especifica dónde buscar los comentarios JSDoc
  apis: [
    './routes/auth.routes.js',
    './routes/user.routes.js',
    './routes/expediente.routes.js',
    './routes/catalogos.routes.js'
  ],
};

const swaggerSpec = swaggerJsdoc(options);

console.log('Swagger spec generado:', Object.keys(swaggerSpec.paths || {}).length, 'endpoints encontrados');

module.exports = swaggerSpec;