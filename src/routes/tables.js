const express = require('express');
const db = require('../db/connection');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tablas
 *   description: Endpoints para gestión de tablas de la base de datos
 */

/**
 * @swagger
 * /tables:
 *   get:
 *     summary: Obtiene listado de tablas disponibles en el esquema sis_cuipo
 *     description: Retorna un array con los nombres de todas las tablas base en el esquema sis_cuipo
 *     tags: [Tablas]
 *     responses:
 *       200:
 *         description: Listado de tablas obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tables:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["proyectos", "dependencias", "fuentes_financiamiento"]
 *       500:
 *         description: Error al consultar la base de datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al obtener las tablas del esquema"
 *     security:
 *       - bearerAuth: []
 */

router.get('/tables', async (req, res) => {
    try {
        const schemaName = 'sis_cuipo';

        const tables = await db('information_schema.tables')
            .select('table_name')
            .where({
                table_schema: schemaName,
                table_type: 'BASE TABLE',
            });

        const tableNames = tables.map((t) => t.table_name);

        return res.status(200).json({ tables: tableNames });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al obtener las tablas del esquema' });
    }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     TablesList:
 *       type: object
 *       properties:
 *         tables:
 *           type: array
 *           items:
 *             type: string
 *           description: Listado de nombres de tablas
 *       example:
 *         tables: ["proyectos", "usuarios", "fuentes"]
 */

module.exports = router;
