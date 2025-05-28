const express = require('express');
const router = express.Router();
const db = require('../db/connection');

/**
 * @swagger
 * /api/v1/cuipo/proyectos-page:
 *   get:
 *     tags: [Proyectos]
 *     summary: Obtiene todos los proyectos disponibles
 *     description: Retorna una lista completa de proyectos con sus datos básicos
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       proyecto:
 *                         type: string
 *                         example: "PR-2023-001"
 *                       p:
 *                         type: string
 *                         example: "P1"
 *                       distrito_m1:
 *                         type: string
 *                         example: "DISTRITO 1"
 *                       nombre_proyecto:
 *                         type: string
 *                         example: "Construcción de carretera principal"
 *       404:
 *         description: Tabla proyectos no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/proyectos-page', async (req, res) => {
    try {
        // 1. Verificar conexión a la BD
        await db.raw('SELECT 1');
        
        // 2. Verificar si la tabla existe
        const tableExists = await db.schema.withSchema('sis_cuipo').hasTable('proyectos');
        if (!tableExists) {
            return res.status(404).json({
                success: false,
                error: 'La tabla proyectos no existe en el esquema sis_cuipo',
                data: []
            });
        }

        // 3. Consultar todos los proyectos
        const proyectos = await db
            .withSchema('sis_cuipo')
            .select('id', 'proyecto', 'p', 'distrito_m1', 'nombre_proyecto')
            .from('proyectos')
            .orderBy('proyecto', 'asc');

        return res.json({
            success: true,
            data: proyectos
        });

    } catch (error) {
        console.error('Error al obtener proyectos:', {
            message: error.message,
            stack: error.stack,
            sql: error.sql
        });

        return res.status(500).json({
            success: false,
            error: 'Error del servidor al obtener proyectos',
            details: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                sql: error.sql
            } : undefined,
            data: []
        });
    }
});



module.exports = router;