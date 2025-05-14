// src/routes/upload.js
const express = require('express');
const XLSX = require('xlsx');
const db = require('../db/connection');
const upload = require('../middleware/upload');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Endpoint para cargar archivos Excel y crear tablas automáticamente
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Sube un archivo Excel y crea una tabla con sus datos
 *     tags: [Upload]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: Archivo Excel (.xlsx, .xls) para procesar
 *     responses:
 *       200:
 *         description: Archivo procesado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Archivo datos.xlsx cargado y almacenado en la tabla sis_cuipo.datos"
 *       400:
 *         description: Error en el archivo o formato inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El archivo está vacío"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al procesar el archivo"
 *     security:
 *       - bearerAuth: []
 */

router.post('/upload', (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        const fileBuffer = req.file.buffer;
        const originalName = req.file.originalname;
        const tableName = originalName.split('.')[0].replace(/\W/g, '_').toLowerCase();
        const schemaName = 'sis_cuipo';

        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetNames = workbook.SheetNames;

        const sheet = workbook.Sheets[sheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { defval: null });

        if (data.length === 0) {
            return res.status(400).json({ message: 'El archivo está vacío' });
        }

        const columns = Object.keys(data[0]);

        const tableExists = await db.schema.withSchema(schemaName).hasTable(tableName);
        if (tableExists) {
            await db.schema.withSchema(schemaName).dropTable(tableName);
        }

        await db.schema.withSchema(schemaName).createTable(tableName, (table) => {
            table.increments('id').primary();
            columns.forEach((col) => {
                table.text(col.replace(/\W/g, '_'));
            });
        });

        const sanitizedData = data.map((row) => {
            const newRow = {};
            columns.forEach((col) => {
                newRow[col.replace(/\W/g, '_')] = row[col];
            });
            return newRow;
        });

        const chunkSize = 1000; // Inserta de 1000 en 1000
        for (let i = 0; i < sanitizedData.length; i += chunkSize) {
            const chunk = sanitizedData.slice(i, i + chunkSize);
            await db(`${schemaName}.${tableName}`).insert(chunk);
        }

        return res.status(200).json({
            message: `Archivo ${originalName} cargado y almacenado en la tabla ${schemaName}.${tableName}`,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al procesar el archivo' });
    }
});

module.exports = router;
