const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/cpc-opciones', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ 
            success: false,
            error: 'El parámetro "query" es requerido',
            data: []
        });
    }

    try {
        // 1. Primero verifiquemos la conexión a la base de datos
        await db.raw('SELECT 1');
        console.log('Conexión a la BD verificada correctamente');

        // 2. Verifiquemos si la tabla existe
        const tableExists = await db.schema.withSchema('sis_cuipo').hasTable('cpc');
        if (!tableExists) {
            return res.status(404).json({
                success: false,
                error: 'La tabla cpc no existe en el esquema sis_cuipo',
                data: []
            });
        }

        // 3. Consulta con más detalles de depuración
        console.log(`Ejecutando consulta para: ${query}`);
        
        const resultados = await db
            .withSchema('sis_cuipo')
            .select('codigo_clase_o_subclase')
            .from('cpc')
            .where('codigo_clase_o_subclase', 'ILIKE', `%${query}%`)
            .orderBy('codigo_clase_o_subclase', 'asc');

        console.log('Resultados de la consulta:', resultados);

        if (!resultados || resultados.length === 0) {
            console.log('No se encontraron resultados para la búsqueda');
            return res.json({
                success: true,
                message: 'No se encontraron coincidencias',
                data: []
            });
        }

        // 4. Mapeo seguro de resultados
        const opciones = resultados.map(r => {
            if (!r.codigo_clase_o_subclase) {
                console.warn('Registro sin codigo_clase_o_subclase:', r);
                return 'Código no disponible';
            }
            return r.codigo_clase_o_subclase;
        });

        console.log('Opciones a devolver:', opciones);

        return res.json({
            success: true,
            data: opciones
        });

    } catch (error) {
        console.error('Error completo al obtener opciones de CPC:', {
            message: error.message,
            stack: error.stack,
            sql: error.sql
        });

        return res.status(500).json({
            success: false,
            error: 'Error del servidor',
            details: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                sql: error.sql
            } : undefined,
            data: []
        });
    }
});

router.get('/productos-mga', async (req, res) => {
    try {
        // 1. Verificar conexión a la BD
        await db.raw('SELECT 1');
        
        // 2. Verificar si la tabla existe
        const tableExists = await db.schema.withSchema('sis_cuipo').hasTable('producto_mga');
        if (!tableExists) {
            return res.status(404).json({
                success: false,
                error: 'La tabla producto_mga no existe en el esquema sis_cuipo',
                data: []
            });
        }

        // 3. Consultar todos los productos MGA (campo concatenar)
        const productos = await db
            .withSchema('sis_cuipo')
            .select('concatenar', 'codigo')
            .from('producto_mga')
            .orderBy('concatenar', 'asc');

        if (!productos || productos.length === 0) {
            return res.json({
                success: true,
                message: 'No se encontraron productos MGA',
                data: []
            });
        }

        // 4. Mapear resultados
        const opciones = productos.map(p => ({
            valorCompleto: p.concatenar,
            codigo: p.codigo
        }));

        return res.json({
            success: true,
            data: opciones
        });

    } catch (error) {
        console.error('Error al obtener productos MGA:', {
            message: error.message,
            stack: error.stack,
            sql: error.sql
        });

        return res.status(500).json({
            success: false,
            error: 'Error del servidor al obtener productos MGA',
            details: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                sql: error.sql
            } : undefined,
            data: []
        });
    }
});

module.exports = router;