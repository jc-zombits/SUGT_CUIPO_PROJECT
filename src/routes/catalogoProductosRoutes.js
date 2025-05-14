const express = require('express');
const router = express.Router();
const db = require('../db/connection');

/**
 * @swagger
 * tags:
 *   name: Catálogo de Productos
 *   description: Endpoints para el catálogo de productos del sistema CUIPO
 */

/**
 * @swagger
 * /catalogo-productos:
 *   get:
 *     summary: Obtiene el listado completo de productos del catálogo
 *     description: Retorna todos los productos registrados con su código e indicador
 *     tags: [Catálogo de Productos]
 *     responses:
 *       200:
 *         description: Listado de productos del catálogo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductoCatalogo'
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
router.get('/catalogo-productos', async (req, res) => {
  try {
    const catalogoProducto = await db
      .withSchema('sis_cuipo')
      .select('codigo_del_indicador_de_producto', 'indicador_de_producto')
      .from('catalogo_de_productos');
      
    res.json(catalogoProducto);
  } catch (error) {
    console.error('Error al obtener los proyectos:', error);
    res.status(500).json({ error: 'Error al obtener los proyectos' });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductoCatalogo:
 *       type: object
 *       properties:
 *         codigo_del_indicador_de_producto:
 *           type: string
 *           description: Código único identificador del producto
 *           example: "PRD-EDU-001"
 *         indicador_de_producto:
 *           type: string
 *           description: Nombre descriptivo del producto
 *           example: "Construcción de aulas escolares"
 *       required:
 *         - codigo_del_indicador_de_producto
 *         - indicador_de_producto
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensaje de error
 *           example: "Error al obtener el catálogo de productos"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora del error
 *           example: "2023-08-20T14:30:45Z"
 */

module.exports = router;
