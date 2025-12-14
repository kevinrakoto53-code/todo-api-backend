const multer = require('multer');
const path = require('path');

// Config de stockage pour multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');  // Les fichiers vont dans le dossier uploads
    },
    filename: function(req, file, cb) {
        // On génère un nom unique avec timestamp + nombre random pour éviter les conflits
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// Fonction pour filtrer les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
    // Liste des extensions autorisées
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    // On vérifie l'extension ET le mimetype pour plus de sécurité
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non autorisé. Formats acceptés : jpeg, jpg, png, gif, pdf, doc, docx, txt'));
    }
};

// Configuration finale de multer avec toutes les options
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },  // Taille max 5MB
    fileFilter: fileFilter
});

module.exports = upload;