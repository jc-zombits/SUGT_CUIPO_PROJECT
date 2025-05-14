const express = require('express');
const router = express.Router();
const db = require('../db/connection');


// En tu archivo de rutas
router.get('/datos-financieros', async (req, res) => {
  try {
    const { proyecto } = req.query;
    
    if (!proyecto) {
      return res.status(400).json({ error: 'Se requiere el ID del proyecto' });
    }

    const datos = await db
      .withSchema('sis_cuipo')
      .select(
        'Fondo',
        'Proyecto_',
        'Nombre',
        'Ppto_Inicial',
        'Adiciones',
        'Contracreditos',
        'Total_Ppto_actual',
        'Disponibilidad',
        'Compromiso',
        'Pagos',
        'Disponible_neto',
        'Ejecuci_n',
        '__ejecucion'
      )
      .from('base_de_ejecucion_presupuestal_31032025')
      .where('Proyecto_', proyecto);

    res.json(datos);
  } catch (error) {
    console.error('Error al obtener datos financieros:', error);
    res.status(500).json({ error: 'Error al obtener datos financieros' });
  }
});

module.exports = router;