const express = require('express');
const router = express.Router();
const db = require('../db/connection');

/**
 * @swagger
 * tags:
 *   name: Dependencias
 *   description: Gestión de dependencias y secciones presupuestales
 */

/**
 * @swagger
 * /dependencias:
 *   get:
 *     summary: Obtiene el listado completo de dependencias
 *     description: Retorna todas las dependencias registradas con su sección presupuestal
 *     tags: [Dependencias]
 *     responses:
 *       200:
 *         description: Listado de dependencias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Dependencia'
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
router.get('/dependencias', async (req, res) => {
  try {
    const dependencias = await db
      .withSchema('sis_cuipo')
      .select('dependencia', 'seccion_presupuestal')
      .from('dependencias');
      
    res.json(dependencias);
  } catch (error) {
    console.error('Error al obtener las dependencias:', error);
    res.status(500).json({ error: 'Error al obtener las dependencias' });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Dependencia:
 *       type: object
 *       properties:
 *         dependencia:
 *           type: string
 *           description: Nombre de la dependencia
 *           example: "Secretaría de Educación"
 *         seccion_presupuestal:
 *           type: string
 *           description: Código o nombre de la sección presupuestal
 *           example: "SEC-EDU-2023"
 *       required:
 *         - dependencia
 *         - seccion_presupuestal
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensaje de error
 *           example: "Error al obtener las dependencias"
 */

module.exports = router;
