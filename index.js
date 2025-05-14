const app = require('./app');
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Documentación API en http://localhost:${PORT}/api-docs`);
});
