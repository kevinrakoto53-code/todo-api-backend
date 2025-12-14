const { validationResult } = require('express-validator');

// Middleware pour valider les requêtes avec express-validator
const validateRequest = (req, res, next) => {
    // Récupérer les erreurs de validation
    const errors = validationResult(req);
    
    // Si y'a des erreurs, on les renvoie
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => err.msg) // On récupère juste les messages d'erreur
        });
    }
    
    // Sinon on passe au middleware suivant
    next();
};

module.exports = { validateRequest };