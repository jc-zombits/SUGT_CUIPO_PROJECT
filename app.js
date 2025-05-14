const express = require('express');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const uploadRoutes = require('./src/routes/upload');
const tablesRoutes = require('./src/routes/tables');
const proyectosRoutes = require('./src/routes/proyectosRoutes');
const fuentesCuipoRoutes = require('./src/routes/fuentesCuipoRoutes');
const dependenciasRoutes = require('./src/routes/dependenciasRoutes');
const catalogoProductosRoutes = require('./src/routes/catalogoProductosRoutes');
const dependenciasPlantillaRoutes = require('./src/routes/dependenciasPlantillaRoutes');
const proyectosListRoutes = require('./src/routes/proyectosListRoutes');
const datosFinancierosRoutes = require('./src/routes/datosFinancierosRoutes');

const app = express();

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API CUIPO',
      version: '1.0.0',
      description: 'Documentación de la API para el sistema CUIPO',
      contact: {
        name: "Juan Camilo Cardona Pizarro",
        email: "jucampuca@gmail.com"
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5001}`,
        description: "Servidor local"
      },
      {
        url: "https://tu-api-produccion.com",
        description: "Servidor de producción"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js'] // Ruta a tus archivos de rutas
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

app.use(cors());
app.use(express.json());

// Ruta para la documentación Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas de la aplicación
app.use('/api/v1/cuipo', uploadRoutes);
app.use('/api/v1/cuipo', tablesRoutes);
app.use('/api/v1/cuipo', proyectosRoutes);
app.use('/api/v1/cuipo', fuentesCuipoRoutes);
app.use('/api/v1/cuipo', dependenciasRoutes);
app.use('/api/v1/cuipo', catalogoProductosRoutes);
app.use('/api/v1/cuipo', dependenciasPlantillaRoutes);
app.use('/api/v1/cuipo', proyectosListRoutes);
app.use('/api/v1/cuipo', datosFinancierosRoutes);

module.exports = app;
