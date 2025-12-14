const { body } = require('express-validator');

// Validation pour la création d'une todo
const validateCreateTodo = [
    body('titre')
        .notEmpty().withMessage('Le titre est requis')
        .trim() // Nettoie les espaces
        .isLength({ min: 3 }).withMessage('Le titre doit faire au moins 3 caractères')
        .isLength({ max: 100 }).withMessage('Le titre ne peut pas dépasser 100 caractères'),
    
    body('description')
        .optional() // Ce champ n'est pas obligatoire
        .trim()
        .isLength({ max: 500 }).withMessage('La description ne peut pas dépasser 500 caractères'),
    
    body('priority')
        .optional()
        .isIn(['basse', 'moyenne', 'haute']).withMessage('La priorité doit être : basse, moyenne ou haute'),
    
    body('category')
        .optional()
        .isIn(['travail', 'personnel', 'urgent', 'autre']).withMessage('La catégorie doit être : travail, personnel, urgent ou autre'),
    
    body('deadline')
        .optional()
        .isISO8601().withMessage('La deadline doit être une date valide')
        .custom((value) => {
            // Validation custom : la deadline ne peut pas être dans le passé
            const deadline = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset l'heure pour comparer juste la date
            
            if (deadline < today) {
                throw new Error('La deadline ne peut pas être dans le passé');
            }
            return true;
        })
];

// Validation pour la modification d'une todo
const validateUpdateTodo = [
    body('titre')
        .optional() // Tous les champs sont optionnels pour un update
        .trim()
        .isLength({ min: 3 }).withMessage('Le titre doit faire au moins 3 caractères')
        .isLength({ max: 100 }).withMessage('Le titre ne peut pas dépasser 100 caractères'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('La description ne peut pas dépasser 500 caractères'),
    
    body('priority')
        .optional()
        .isIn(['basse', 'moyenne', 'haute']).withMessage('La priorité doit être : basse, moyenne ou haute'),
    
    body('category')
        .optional()
        .isIn(['travail', 'personnel', 'urgent', 'autre']).withMessage('La catégorie doit être : travail, personnel, urgent ou autre'),
    
    body('completed')
        .optional()
        .isBoolean().withMessage('Le statut completed doit être true ou false'),
    
    body('deadline')
        .optional()
        .isISO8601().withMessage('La deadline doit être une date valide')
        .custom((value) => {
            const deadline = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (deadline < today) {
                throw new Error('La deadline ne peut pas être dans le passé');
            }
            return true;
        })
];

module.exports = {
    validateCreateTodo,
    validateUpdateTodo
};