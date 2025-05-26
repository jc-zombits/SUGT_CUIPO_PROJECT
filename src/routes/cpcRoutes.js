const express = require('express');
const router = express.Router();
const db = require('../db/connection');


router.get('/cpc-data', async (req, res) => {
    try {
        const cpcData = await db
        .withSchema('sis_cuipo')
        .select('codigo', 'clase_o_subclase', 'codigo_clase_o_subclase', 'cpc_codigo')
        .from('cpc');
        
        res.json(cpcData);
    } catch (error) { 
        console.error('Error al obtener los datos CPC:', error);
        res.status(500).json({ error: 'Error al obtener los datos CPC' });
    }
});

module.exports = router;