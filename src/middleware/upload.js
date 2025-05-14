const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage(); // cargar en memoria

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase(); // asegúrate que sea minúscula
    if (!['.xlsx', '.xls', '.xlsm'].includes(ext)) {
        return cb(new Error('Sólo se permiten archivos de Excel (.xlsx, .xls, .xlsm)'));
    }
    cb(null, true);
};

const upload = multer({ storage, fileFilter }).single('file');

module.exports = upload;
