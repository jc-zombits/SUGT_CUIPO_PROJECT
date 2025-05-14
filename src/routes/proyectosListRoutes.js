const express = require('express');
const router = express.Router();
const db = require('../db/connection');

/**
 * @swagger
 * tags:
 *   name: Proyectos
 *   description: Endpoint para obtener proyectos con filtros coordinados
 */

/**
 * @swagger
 * /proyectos-list:
 *   get:
 *     summary: Obtiene proyectos filtrados y datos financieros relacionados
 *     description: |
 *       Retorna proyectos de la tabla cuipo_plantilla_distrito_2025_vf con opción de filtrar por:
 *       - Secretaría
 *       - Sector CUIPO
 *       - Proyecto (ID)
 *       - Nombre de Proyecto
 *       
 *       Además devuelve datos financieros relacionados de base_de_ejecucion_presupuestal_31032025
 *     tags: [Proyectos]
 *     parameters:
 *       - in: query
 *         name: secretaria
 *         schema:
 *           type: string
 *         description: Filtrar por nombre de secretaría
 *         example: "SECRETARIA DE EDUCACION"
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filtrar por sector CUIPO
 *         example: "EDUCACION"
 *       - in: query
 *         name: proyecto
 *         schema:
 *           type: string
 *         description: Filtrar por ID de proyecto (campo proyecto)
 *         example: "PRY-EDU-2023-001"
 *       - in: query
 *         name: nombreProyecto
 *         schema:
 *           type: string
 *         description: Filtrar por nombre de proyecto (campo nombre_proyecto)
 *         example: "CONSTRUCCION DE AULAS ESCOLARES"
 *     responses:
 *       200:
 *         description: Objeto con listados únicos para filtros, datos de plantilla y datos financieros
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProyectosCompletosResponse'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProyectosCompletosResponse:
 *       type: object
 *       properties:
 *         filtros:
 *           type: object
 *           properties:
 *             secretarias:
 *               type: array
 *               items:
 *                 type: string
 *               description: Listado único de secretarías disponibles
 *             sectores:
 *               type: array
 *               items:
 *                 type: string
 *               description: Listado único de sectores CUIPO disponibles
 *             proyectos:
 *               type: array
 *               items:
 *                 type: string
 *               description: Listado único de IDs de proyecto disponibles
 *             nombreProyectos:
 *               type: array
 *               items:
 *                 type: string
 *               description: Listado único de nombres de proyecto disponibles
 *             datosCompletos:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProyectoDetalle'
 *         datosPlantilla:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProyectoDetalle'
 *         datosFinancieros:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DatoFinanciero'
 * 
 *     ProyectoDetalle:
 *       type: object
 *       properties:
 *         nombre_proyecto:
 *           type: string
 *           description: Nombre descriptivo del proyecto
 *         proyecto:
 *           type: string
 *           description: ID único del proyecto
 *         sector_cuipo:
 *           type: string
 *           description: Sector CUIPO al que pertenece el proyecto
 *         secretaria:
 *           type: string
 *           description: Secretaría responsable del proyecto
 * 
 *     DatoFinanciero:
 *       type: object
 *       properties:
 *         Fondo:
 *           type: string
 *         Proyecto_:
 *           type: string
 *         Nombre:
 *           type: string
 *         Ppto_Inicial:
 *           type: number
 *         Adiciones:
 *           type: number
 *         Contracreditos:
 *           type: number
 *         Total_Ppto_actual:
 *           type: number
 *         Disponibilidad:
 *           type: number
 *         Compromiso:
 *           type: number
 *         Pagos:
 *           type: number
 *         Disponible_neto:
 *           type: number
 *         Ejecuci_n:
 *           type: number
 *         __ejecucion:
 *           type: number
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensaje de error descriptivo
 *         details:
 *           type: string
 *           description: Detalles técnicos del error (solo en desarrollo)
 */

router.get('/proyectos-list', async (req, res) => {
  try {
    const { secretaria, sector, proyecto, nombreProyecto } = req.query;
    
    // 1. Consulta para obtener datos de la plantilla
    let query = db
      .withSchema('sis_cuipo')
      .select('nombre_proyecto', 'proyecto', 'sector_cuipo', 'secretaria')
      .from('cuipo_plantilla_distrito_2025_vf');

    if (secretaria) query = query.where('secretaria', secretaria);
    if (sector) query = query.where('sector_cuipo', sector);
    if (proyecto) query = query.where('proyecto', proyecto);
    if (nombreProyecto) query = query.where('nombre_proyecto', nombreProyecto);

    const proyectosPlantilla = await query;

    // 2. Consulta para datos financieros (solo si hay un proyecto específico)
    let datosFinancieros = [];
    if (proyecto && proyectosPlantilla.length > 0) {
      datosFinancieros = await db
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
    }

    // 3. Preparar respuesta
    const response = {
      filtros: {
        secretarias: [...new Set(proyectosPlantilla.map(r => r.secretaria))].filter(Boolean).sort(),
        sectores: [...new Set(proyectosPlantilla.map(r => r.sector_cuipo))].filter(Boolean).sort(),
        nombreProyectos: [...new Set(proyectosPlantilla.map(r => r.nombre_proyecto))].filter(Boolean).sort()
      },
      datosPlantilla: proyectosPlantilla,
      datosFinancieros: datosFinancieros
    };

    res.json(response);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ 
      error: 'Error al obtener datos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;