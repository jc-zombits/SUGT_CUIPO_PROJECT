const express = require('express');
const router = express.Router();
const db = require('../db/connection');

/**
 * @swagger
 * tags:
 *   - name: CPC
 *     description: Operaciones relacionadas con códigos CPC
 *   - name: Productos MGA
 *     description: Operaciones relacionadas con productos MGA
 */

/**
 * @swagger
 * /api/v1/cuipo/cpc-opciones:
 *   get:
 *     tags: [CPC]
 *     summary: Obtiene opciones de CPC basadas en una consulta
 *     description: Retorna una lista de códigos CPC que coinciden con el criterio de búsqueda
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Cadena de búsqueda para filtrar códigos CPC
 *     responses:
 *       200:
 *         description: Lista de opciones CPC encontradas
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
 *                     type: string
 *                     example: "12345 - Descripción del producto"
 *       400:
 *         description: Parámetro query faltante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: 'El parámetro "query" es requerido'
 *       404:
 *         description: Tabla CPC no encontrada
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/v1/cuipo/productos-mga:
 *   get:
 *     tags: [Productos MGA]
 *     summary: Obtiene todos los productos MGA disponibles
 *     description: Retorna una lista completa de productos MGA con su código y valor concatenado
 *     responses:
 *       200:
 *         description: Lista de productos MGA
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
 *                       valorCompleto:
 *                         type: string
 *                         description: Valor concatenado del producto
 *                         example: "1234567 - Nombre completo del producto"
 *                       codigo:
 *                         type: string
 *                         description: Código del producto (primeros 7 dígitos del valorCompleto)
 *                         example: "1234567"
 *       404:
 *         description: Tabla producto_mga no encontrada
 *       500:
 *         description: Error del servidor
 */

// Endpoint para obtener opciones de CPC
router.get('/cpc-opciones', async (req, res) => {
    try {
        const { query } = req.query;

        // 1. Verifica la conexión
        await db.raw('SELECT 1');

        // 2. Consulta desde la tabla CPC, usando el campo codigo_clase_o_subclase
        const resultados = await db
            .withSchema('sis_cuipo')
            .distinct('codigo_clase_o_subclase as cpc')
            .from('cpc')
            .modify(qb => {
                if (query) {
                    qb.where('codigo_clase_o_subclase', 'ILIKE', `%${query}%`);
                }
            })
            .orderBy('cpc', 'asc');

        // 3. Formateo de resultados
        const opciones = resultados
            .filter(r => r.cpc)
            .map(r => r.cpc);

        return res.json({
            success: true,
            data: opciones
        });

    } catch (error) {
        console.error('Error en /cpc-opciones:', {
            message: error.message,
            stack: error.stack,
            sql: error.sql
        });

        return res.status(500).json({
            success: false,
            error: 'Error al consultar CPC',
            details: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                sql: error.sql
            } : undefined,
            data: []
        });
    }
});


// Endpoint para obtener opciones de Productos MGA
router.get('/productos-mga', async (req, res) => {
    try {
        const { query } = req.query;
        
        const resultados = await db
            .withSchema('sis_cuipo')
            .distinct('C_digo_y_Nombre_del_Producto_MGA')
            .from('cuipo_plantilla_distrito_2025_primer_trimestre_plan_b')
            .where('C_digo_y_Nombre_del_Producto_MGA', 'ILIKE', `%${query || ''}%`)
            .andWhereNot('C_digo_y_Nombre_del_Producto_MGA', 'Favor seleccionar una opción')
            .orderBy('C_digo_y_Nombre_del_Producto_MGA', 'asc');

        const opciones = resultados.map(r => r.C_digo_y_Nombre_del_Producto_MGA);

        return res.json({
            success: true,
            data: opciones
        });

    } catch (error) {
        console.error('Error al obtener productos MGA:', error);
        return res.status(500).json({
            success: false,
            error: 'Error del servidor',
            data: []
        });
    }
});

// Endpoint para obtener opciones de Secretarías
router.get('/secretarias', async (req, res) => {
    try {
        const { query } = req.query;
        
        const resultados = await db
            .withSchema('sis_cuipo')
            .distinct('Secretaria')
            .from('cuipo_plantilla_distrito_2025_primer_trimestre_plan_b')
            .where('Secretaria', 'ILIKE', `%${query || ''}%`)
            .orderBy('Secretaria', 'asc');

        const opciones = resultados.map(r => r.Secretaria);

        return res.json({
            success: true,
            data: opciones
        });

    } catch (error) {
        console.error('Error al obtener secretarías:', error);
        return res.status(500).json({
            success: false,
            error: 'Error del servidor',
            data: []
        });
    }
});

// Endpoint principal para validar y obtener datosrouter.post('/validar-datos', async (req, res) => {
router.post('/validar-datos', async (req, res) => {
    try {
        const { cpc, producto, secretaria } = req.body;

        if (!cpc && !producto && !secretaria) {
            return res.status(400).json({
                success: false,
                error: 'Debe proporcionar al menos un criterio de búsqueda (CPC, Producto o Secretaría)'
            });
        }

        const codigoProducto = producto?.split(' - ')[0].substring(0, 7);

        const ejecucionResultados = await db
            .withSchema('sis_cuipo')
            .select('etiquetas_de_fila')
            .from('ejecucion')
            .where('producto_cuipo', 'ILIKE', `${codigoProducto}%`);

        const etiquetas = [...new Set(ejecucionResultados.map(e => e.etiquetas_de_fila))];

        if (etiquetas.length === 0) {
            return res.json({
                success: true,
                message: 'No hay coincidencias en ejecución para el producto MGA seleccionado',
                data: []
            });
        }

        const resultados = await db
            .withSchema('sis_cuipo')
            .select(
                'programacion.etiquetas_de_fila',
                'programacion.vigencia_gasto',
                'programacion.seccion_ptal_cuipo',
                'programacion.sector_cuipo',
                'programacion.detalle_sectorial_prog_gasto',
                'programacion.suma_de_ppto_inicial',
                'programacion.suma_de_total_ppto_actual',
                'ejecucion.pospre_cuipo',
                'ejecucion.producto_cuipo',
                'ejecucion.cpc_cuipo',
                'ejecucion.fuente_cuipo',
                'ejecucion.situacion_de_fondos',
                'ejecucion.suma_de_ejecucion',
                'ejecucion.suma_de_factura',
                'ejecucion.suma_de_pagos'
            )
            .from('ejecucion')
            .innerJoin('programacion', 'ejecucion.etiquetas_de_fila', 'programacion.etiquetas_de_fila')
            .whereIn('ejecucion.etiquetas_de_fila', etiquetas)
            .andWhere('ejecucion.producto_cuipo', 'ILIKE', `${codigoProducto}%`);

        if (resultados.length === 0) {
            return res.json({
                success: true,
                message: 'No se encontraron datos en la relación ejecución-programación',
                data: []
            });
        }

        // Si se proporcionó CPC, filtrar los resultados según POSPRE_CUIPO
        if (cpc) {
            const primerDigitoCPC = cpc.split(' - ')[0].charAt(0);
            const resultadosFiltrados = resultados.filter(row =>
                row.pospre_cuipo?.endsWith(primerDigitoCPC)
            );

            return res.json({
                success: true,
                data: resultadosFiltrados
            });
        }

        return res.json({
            success: true,
            data: resultados
        });

    } catch (error) {
        console.error('Error en /validar-datos:', error);
        return res.status(500).json({
            success: false,
            error: 'Ocurrió un error en el servidor'
        });
    }
});


module.exports = router;