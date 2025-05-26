const express = require('express');
const router = express.Router();
const db = require('../db/connection');

/**
 * @swagger
 * /api/v1/ejecucion/cpc-data:
 *   get:
 *     tags: [CPC]
 *     summary: Obtiene todos los datos de la tabla CPC
 *     description: Retorna una lista completa de códigos CPC con su información asociada
 *     responses:
 *       200:
 *         description: Lista de códigos CPC
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   codigo:
 *                     type: string
 *                     description: Código numérico CPC
 *                     example: "7210"
 *                   clase_o_subclase:
 *                     type: string
 *                     description: Descripción de la clase o subclase
 *                     example: "Servicios de limpieza"
 *                   codigo_clase_o_subclase:
 *                     type: string
 *                     description: Código completo de clase/subclase
 *                     example: "721015 - Servicios de limpieza de oficinas"
 *                   cpc_codigo:
 *                     type: string
 *                     description: Código CPC alternativo
 *                     example: "CPC721015"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener los datos CPC"
 */

router.get('/cpc-data', async (req, res) => {
    try {
        const cpcData = await db
        .withSchema('sis_cuipo')
        .select('codigo', 'clase_o_subclase', 'codigo_clase_o_subclase', 'cpc_codigo')
        .from('cpc');
        
        res.json({
            success: true,
            data: cpcData
        });
    } catch (error) { 
        console.error('Error al obtener los datos CPC:', error);
        res.status(500).json({ error: 'Error al obtener los datos CPC' });
    }
});

module.exports = router;