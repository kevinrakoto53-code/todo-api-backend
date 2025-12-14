const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Schéma pour le modèle User
const userSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, "Le nom est requis"],
        trim: true, // Enlève les espaces au début/fin
        minlength: [2, "Le nom doit faire au moins 2 caractères"]
    },
    email: {
        type: String,
        required: [true, "L'email est requis"],
        unique: true, // Pas de doublons d'email
        lowercase: true, // Converti en minuscule
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Email invalide"] // Regex pour valider le format email
    },
    password: {
        type: String,
        required: [true, "Le mot de passe est requis"],
        minlength: [6, "Le mot de passe doit faire au moins 6 caractères"]
    }
}, {
    timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Middleware Mongoose qui s'exécute avant la sauvegarde
// Permet de hasher le mot de passe automatiquement
userSchema.pre("save", async function() {
    // On hash seulement si le password a été modifié
    if (!this.isModified("password")) return;
    
    // Hasher le password avec bcrypt (10 rounds de salt)
    this.password = await bcrypt.hash(this.password, 10);
});

// Méthode custom pour comparer le password en clair avec le hash
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);