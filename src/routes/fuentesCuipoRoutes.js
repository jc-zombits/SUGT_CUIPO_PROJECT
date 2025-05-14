const express = require('express');
const router = express.Router();
const db = require('../db/connection');

/**
 * @swagger
 * tags:
 *   name: Fuentes CUIPO
 *   description: Gestión de las fuentes de financiamiento del sistema CUIPO
 */

/**
 * @swagger
 * /fuentes-cuipo:
 *   get:
 *     summary: Obtiene el listado completo de fuentes de financiamiento
 *     description: Retorna todas las fuentes registradas en el sistema con sus campos principales
 *     tags: [Fuentes CUIPO]
 *     responses:
 *       200:
 *         description: Listado de fuentes de financiamiento
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FuenteCuipo'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     security:
 *       - bearerAuth: []
 */

// Obtener los proyectos con campos específicos
router.get('/fuentes-cuipo', async (req, res) => {
  try {
    const fuentesCuipo = await db
      .withSchema('sis_cuipo')
      .select('cod', 'tipo_de_recurso', 'descripcion_cuipo', 'situacion_de_fondos')
      .from('fuentes_cuipo');
      
    res.json(fuentesCuipo);
  } catch (error) {
    console.error('Error al obtener los proyectos:', error);
    res.status(500).json({ error: 'Error al obtener los proyectos' });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     FuenteCuipo:
 *       type: object
 *       properties:
 *         cod:
 *           type: string
 *           description: Código único de la fuente
 *           example: "FNR-001"
 *         tipo_de_recurso:
 *           type: string
 *           description: Tipo de recurso financiero
 *           example: "Fondo Nacional de Regalías"
 *         descripcion_cuipo:
 *           type: string
 *           description: Descripción detallada de la fuente
 *           example: "Fondo para proyectos de inversión"
 *         situacion_de_fondos:
 *           type: string
 *           description: Estado actual de los fondos
 *           example: "Disponible"
 *       required:
 *         - cod
 *         - tipo_de_recurso
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensaje de error
 *           example: "Error al obtener los proyectos"
 */

module.exports = router;
