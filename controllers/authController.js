const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Fonction helper pour générer un JWT
const generateToken = (userId) => {
    return jwt.sign(
        { userId }, // Payload du token
        process.env.JWT_SECRET, // Clé secrète
        { expiresIn: "30d" } // Token valide 30 jours
    );
};

// Créer un nouveau compte utilisateur
const register = async (req, res) => {
    try {
        const { nom, email, password } = req.body;
        
        // Vérifier si l'email existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                erreur: "Cet email est déjà utilisé"
            });
        }
        
        // Créer le nouvel utilisateur (le password sera hashé automatiquement via le pre-save hook)
        const newUser = await User.create({ nom, email, password });
        
        // Générer un token pour l'utilisateur
        const token = generateToken(newUser._id);
        
        res.status(201).json({
            success: true,
            message: "Inscription réussie",
            token,
            user: {
                id: newUser._id,
                nom: newUser.nom,
                email: newUser.email
            }
        });
        
    } catch (error) {
        // Gérer les erreurs de validation
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                erreur: messages
            });
        }
        
        res.status(500).json({
            success: false,
            erreur: error.message
        });
    }
};

// Connexion d'un utilisateur existant
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validation basique
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                erreur: "Email et mot de passe requis"
            });
        }
        
        // Chercher l'utilisateur par email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                erreur: "Email ou mot de passe incorrect"
            });
        }
        
        // Vérifier le mot de passe avec la méthode du modèle
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                erreur: "Email ou mot de passe incorrect"
            });
        }
        
        // Générer le token
        const token = generateToken(user._id);
        
        res.status(200).json({
            success: true,
            message: "Connexion réussie",
            token,
            user: {
                id: user._id,
                nom: user.nom,
                email: user.email
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            erreur: error.message
        });
    }
};

// Récupérer les infos de l'utilisateur connecté
const getMe = async (req, res) => {
    try {
        // req.user vient du middleware protect
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            erreur: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getMe
};