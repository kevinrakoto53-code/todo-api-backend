const mongoose = require("mongoose");

// Schéma pour le modèle Todo
const todoSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
      minlength: [3, "Le titre doit faire au moins 3 caractères"],
      maxlength: [100, "Le titre ne peut pas dépasser 100 caractères"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
    },
    completed: {
      type: Boolean,
      default: false, // Par défaut une todo n'est pas complétée
    },
    priority: {
      type: String,
      enum: ["basse", "moyenne", "haute"], // Valeurs autorisées
      default: "moyenne",
    },
    category: {
      type: String,
      enum: ["travail", "personnel", "urgent", "autre"],
      default: "autre",
    },
    deadline: {
      type: Date, // Date limite pour la todo
    },
    user: {
      type: mongoose.Schema.Types.ObjectId, // Référence vers un User
      ref: "User",
      required: [true, "L'utilisateur est requis"],
    },
    attachments: [
      {
        // Tableau pour stocker les fichiers attachés
        filename: String, // Nom du fichier sur le serveur
        originalname: String, // Nom original du fichier
        mimetype: String, // Type MIME (image/jpeg, etc.)
        size: Number, // Taille en bytes
        path: String, // Chemin du fichier sur le serveur
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt
  }
);

// Index composés pour améliorer les performances des requêtes
// On cherche souvent par user + completed ou user + category
todoSchema.index({ user: 1, completed: 1 });
todoSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model("Todo", todoSchema);