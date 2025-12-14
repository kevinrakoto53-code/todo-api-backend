const { body } = require('express-validator');

// Validation pour l'inscription
const validateRegister = [
    body('nom')
        .notEmpty().withMessage('Le nom est requis')
        .trim()
        .isLength({ min: 2, max: 50 }),
    
    body('email')
        .notEmpty()
        .isEmail().withMessage('Email invalide')
        .normalizeEmail(), // Normalise l'email (met en minuscule, etc.)
    
    body('password')
        .notEmpty()
        .isLength({ min: 6, max: 100 })
        .matches(/\d/).withMessage('Le mot de passe doit contenir au moins un chiffre') // Regex pour vérifier qu'il y a un chiffre
];

// Validation pour la connexion
const validateLogin = [
    body('email')
        .notEmpty()
        .isEmail()
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
];

module.exports = { validateRegister, validateLogin };