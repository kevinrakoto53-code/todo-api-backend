const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware pour protéger les routes qui nécessitent une authentification
const protect = async (req, res, next) => {
    try {
        // Récupérer le header Authorization
        const authHeader = req.headers.authorization;
        
        // Vérifier si le header existe et commence par "Bearer "
        if (!authHeader || !authHeader.startsWith("Bearer ")) { 
            return res.status(401).json({
                success: false,
                erreur: "Non authentifié - Token manquant"
            });
        }
        
        // Extraire le token (format: "Bearer TOKEN_ICI")
        const token = authHeader.split(" ")[1];
        
        // Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Récupérer l'utilisateur depuis la DB (sans le password)
        const user = await User.findById(decoded.userId).select("-password");
        
        if (!user) {
            return res.status(401).json({
                success: false,
                erreur: "Utilisateur non trouvé"
            });
        }
        
        // Attacher l'utilisateur à la requête pour les prochains middlewares
        req.user = user;
        next();
        
    } catch (error) {
        // Gérer les différents types d'erreurs JWT
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                erreur: "Token invalide"
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                erreur: "Token expiré"
            });
        }
        
        res.status(500).json({
            success: false,
            erreur: error.message
        });
    }
};

module.exports = { protect };