const mongoose = require("mongoose");

// Fonction async pour se connecter à MongoDB
const connectDB = async () => {
    try {
        // On attend que mongoose se connecte avec l'URI dans les variables d'env
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connecté avec succès !✅");
    } catch (error) {
        // Si ça marche pas, on affiche l'erreur et on quitte le process
        console.error("❌ Erreur de connexion MongoDB:", error.message);
        process.exit(1); // Code 1 = erreur
    }
};

module.exports = connectDB;