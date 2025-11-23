// server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes'); 
const expedienteRoutes = require('./routes/expediente.routes');
const catalogosRoutes = require('./routes/catalogos.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CONFIGURACIÓN DE CORS (Debe ir ANTES de las rutas)
app.use(cors({
    origin: 'http://localhost:3000', // URL del frontend
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// MIDDLEWARE
app.use(express.json()); 

// RUTAS DE DOCUMENTACIÓN SWAGGER (Debe ir primero)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// RUTAS DE LA API
app.use('/api/auth', authRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/expedientes', expedienteRoutes);
app.use('/api/catalogos', catalogosRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.send('API DICRI - En funcionamiento. Ver documentación en /api-docs');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor Node.js escuchando en el puerto ${PORT}`);
    console.log(`🚀 Documentación Swagger: http://localhost:${PORT}/api-docs`);
});