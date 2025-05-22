const express = require('express');
const router = express.Router();
const db = require('../db/connection');

/**
 * @swagger
 * /api/v1/ejecucion/ejecucion-presu:
 *   get:
 *     tags: [Ejecución]
 *     summary: Compara datos de ejecución con plantilla distrito
 *     description: Retorna datos combinados donde pospre_cuipo coincide en ambas tablas
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Cantidad de resultados por página
 *     responses:
 *       200:
 *         description: Datos combinados con información de paginación
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
 *                       id_ejecucion:
 *                         type: integer
 *                         example: 1
 *                       id_plantilla:
 *                         type: integer
 *                         example: 1
 *                       pospre_cuipo:
 *                         type: string
 *                         example: "PP2023001"
 *                       seccion_ptal_cuipo:
 *                         type: string
 *                       cpc_cuipo:
 *                         type: string
 *                       situacion_de_fondos:
 *                         type: string
 *                       suma_de_ejecucion:
 *                         type: number
 *                       suma_de_factura:
 *                         type: number
 *                       suma_de_pagos:
 *                         type: number
 *                       fondo:
 *                         type: string
 *                       pospre:
 *                         type: string
 *                       proyecto:
 *                         type: string
 *                       nombre_proyecto:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 500
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 100
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *       404:
 *         description: Tablas no encontradas
 *       500:
 *         description: Error del servidor
 */
router.get('/ejecucion-presu', async (req, res) => {
    try {
        // 1. Verificar conexión a la BD
        await db.raw('SELECT 1');
        console.log('Conexión a la BD verificada');

        // 2. Verificar que ambas tablas existen
        const [ejecucionExists, plantillaExists] = await Promise.all([
            db.schema.withSchema('sis_cuipo').hasTable('ejecucion'),
            db.schema.withSchema('sis_cuipo').hasTable('cuipo_plantilla_distrito_2025_vf')
        ]);

        if (!ejecucionExists || !plantillaExists) {
            const errorMsg = `Tablas no encontradas: ${!ejecucionExists ? 'ejecucion' : ''} ${!plantillaExists ? 'cuipo_plantilla_distrito_2025_vf' : ''}`.trim();
            console.error(errorMsg);
            return res.status(404).json({
                success: false,
                error: errorMsg,
                data: []
            });
        }

        // 3. Configurar paginación
        const { page = 1, limit = 100 } = req.query;
        const offset = (page - 1) * limit;
        console.log(`Pagina: ${page}, Límite: ${limit}, Offset: ${offset}`);

        // 4. Consulta principal con paginación
        const resultados = await db
            .withSchema('sis_cuipo')
            .select(
                'e.id as id_ejecucion',
                'p.id as id_plantilla',
                'e.pospre_cuipo',
                'e.seccion_ptal_cuipo',
                'e.cpc_cuipo',
                'e.situacion_de_fondos',
                'e.suma_de_ejecucion',
                'e.suma_de_factura',
                'e.suma_de_pagos',
                'p.fondo',
                'p.pospre',
                'p.proyecto',
                'p.nombre_proyecto'
            )
            .from('ejecucion as e')
            .innerJoin('cuipo_plantilla_distrito_2025_vf as p', 'e.pospre_cuipo', 'p.pospre_cuipo')
            .limit(limit)
            .offset(offset)
            .orderBy('e.id', 'asc');

        console.log(`Resultados obtenidos: ${resultados.length} registros`);

        // 5. Obtener conteo total para paginación
        const totalResult = await db('sis_cuipo.ejecucion as e')
            .innerJoin('sis_cuipo.cuipo_plantilla_distrito_2025_vf as p', 'e.pospre_cuipo', 'p.pospre_cuipo')
            .count('* as total')
            .first();

        const total = parseInt(totalResult.total);
        const totalPages = Math.ceil(total / limit);

        console.log(`Total de registros: ${total}, Total de páginas: ${totalPages}`);

        // 6. Enviar respuesta estructurada
        return res.json({
            success: true,
            data: resultados,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });

    } catch (error) {
        console.error('Error en /ejecucion-presu:', {
            message: error.message,
            stack: error.stack,
            sql: error.sql
        });

        return res.status(500).json({
            success: false,
            error: 'Error del servidor al procesar la solicitud',
            details: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                sql: error.sql
            } : undefined,
            data: []
        });
    }
});

module.exports = router;