require("dotenv").config(); // Charger les variables d'environnement depuis .env

const express = require("express");
const connectDB = require("./config/database");

const app = express();
const cors = require('cors');
app.use(cors({
  origin: ['https://todo-app-frontend-gold-one.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
const port = process.env.PORT || 5000;

// Se connecter à MongoDB
connectDB();

// Middlewares pour parser le body des requêtes
app.use(express.json()); // Parser le JSON
app.use(express.urlencoded({ extended: true })); // Parser les données de formulaire

// Servir les fichiers statiques du dossier uploads
app.use('/uploads', express.static('uploads'));

// Middleware simple pour logger les requêtes
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Import des routes
const authRoutes = require("./routes/auth");
const todoRoutes = require("./routes/todos");

// Utiliser les routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

// Route d'accueil qui affiche la doc de l'API
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "🚀 Bienvenue sur Todo App API",
        version: "1.0.0",
        endpoints: {
            auth: {
                register: "POST /api/auth/register",
                login: "POST /api/auth/login",
                profile: "GET /api/auth/me"
            },
            todos: {
                create: "POST /api/todos",
                getAll: "GET /api/todos",
                getOne: "GET /api/todos/:id",
                update: "PUT /api/todos/:id",
                toggle: "PATCH /api/todos/:id/toggle",
                delete: "DELETE /api/todos/:id",
                filter: "GET /api/todos/filter?completed=true&priority=haute",
                search: "GET /api/todos/search?q=urgent",
                stats: "GET /api/todos/stats"
            }
        }
    });
});

// Middleware global de gestion d'erreurs
// Sera appelé si une erreur est passée avec next(error)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        erreur: "Erreur serveur",
        message: err.message
    });
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`🚀 Serveur Todo App sur le port ${port}`);
    console.log(`📝 Environnement: ${process.env.NODE_ENV}`);
    console.log(`✨ Prêt à gérer tes todos !`);
});