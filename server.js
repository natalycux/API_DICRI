// server.js (Actualizado)

const express = require('express');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express'); // <--- NUEVO
const swaggerSpec = require('./swagger');         // <--- NUEVO
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes'); 
const expedienteRoutes = require('./routes/expediente.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000; // Asumimos PORT 4000

// MIDDLEWARE
app.use(express.json()); 

// RUTAS DE DOCUMENTACIÓN SWAGGER (Debe ir primero)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // <--- NUEVO

// RUTAS DE LA API
app.use('/api/auth', authRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/expedientes', expedienteRoutes); 

// Ruta raíz
app.get('/', (req, res) => {
    res.send('API DICRI - En funcionamiento. Ver documentación en /api-docs');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor Node.js escuchando en el puerto ${PORT}`);
    console.log(`🚀 Documentación Swagger: http://localhost:${PORT}/api-docs`); // <--- NUEVO
});