/**
 * @swagger
 * tags:
 *   name: Proyectos
 *   description: Gestión de proyectos CUIPO
 */

/**
 * @swagger
 * /proyectos:
 *   get:
 *     summary: Obtiene todos los proyectos
 *     tags: [Proyectos]
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Proyecto'
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Proyecto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *       example:
 *         id: 1
 *         nombre: "Proyecto de infraestructura"
 *         descripcion: "Descripción del proyecto"
 */

const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Obtener los proyectos con campos específicos
router.get('/proyectos', async (req, res) => {
  try {
    const proyectos = await db
      .withSchema('sis_cuipo')
      .select('proyecto', 'nombre_proyecto')
      .from('proyectos');
      
    res.json(proyectos);
  } catch (error) {
    console.error('Error al obtener los proyectos:', error);
    res.status(500).json({ error: 'Error al obtener los proyectos' });
  }
});

module.exports = router;
