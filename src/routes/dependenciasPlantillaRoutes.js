const express = require('express');
const router = express.Router();
const db = require('../db/connection'); // tu conexión a PostgreSQL

/**
 * @swagger
 * tags:
 *   name: Plantillas
 *   description: Endpoints para opciones de plantillas CUIPO
 */

/**
 * @swagger
 * /plantilla-opciones:
 *   get:
 *     summary: Obtiene opciones para formularios (secretarías, sectores y proyectos)
 *     description: Retorna listados únicos de secretarías, sectores CUIPO y nombres de proyectos disponibles
 *     tags: [Plantillas]
 *     responses:
 *       200:
 *         description: Listado de opciones para selects
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OpcionesPlantilla'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     security:
 *       - bearerAuth: []
 */

// GET /api/v1/cuipo/plantilla/opciones
router.get('/plantilla-opciones', async (req, res) => {
  try {
    const secretariasData = await db
      .withSchema('sis_cuipo')
      .select('secretaria')
      .distinct()
      .from('cuipo_plantilla_distrito_2025_vf')
      .whereNotNull('secretaria');

    const sectoresData = await db
      .withSchema('sis_cuipo')
      .select('sector_cuipo')
      .distinct()
      .from('cuipo_plantilla_distrito_2025_vf')
      .whereNotNull('sector_cuipo');

    const nombreProyectoData = await db
      .withSchema('sis_cuipo')
      .select('nombre_proyecto')
      .distinct()
      .from('cuipo_plantilla_distrito_2025_vf')
      .whereNotNull('nombre_proyecto');

    const secretarias = secretariasData.map(row => row.secretaria);
    const sectores = sectoresData.map(row => row.sector_cuipo);
    const nombreProyecto = nombreProyectoData.map(row => row.nombre_proyecto);

    res.json({ secretarias, sectores, nombreProyecto });
  } catch (error) {
    console.error('Error al obtener las opciones:', error);
    res.status(500).json({ error: 'Error al obtener las opciones' });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     OpcionesPlantilla:
 *       type: object
 *       properties:
 *         secretarias:
 *           type: array
 *           items:
 *             type: string
 *           description: Listado de secretarías disponibles
 *           example: ["Secretaría de Educación", "Secretaría de Salud"]
 *         sectores:
 *           type: array
 *           items:
 *             type: string
 *           description: Listado de sectores CUIPO disponibles
 *           example: ["Educación", "Infraestructura"]
 *         nombreProyecto:
 *           type: array
 *           items:
 *             type: string
 *           description: Listado de nombres de proyectos disponibles
 *           example: ["Proyecto Escuelas Nuevas", "Construcción Hospital"]
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensaje de error
 *           example: "Error al obtener las opciones"
 *         details:
 *           type: string
 *           description: Detalles técnicos del error (solo en desarrollo)
 *           example: "Error de conexión a la base de datos"
 */

module.exports = router;
