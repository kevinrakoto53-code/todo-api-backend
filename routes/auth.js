const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/auth");
const { validateRegister, validateLogin } = require("../validators/authValidator");
const { validateRequest } = require("../middlewares/validateRequest");

// Routes publiques (pas besoin d'être connecté)
router.post("/register", validateRegister, validateRequest, authController.register);
router.post("/login", validateLogin, validateRequest, authController.login);

// Route protégée (nécessite d'être authentifié)
router.get("/me", protect, authController.getMe);

module.exports = router;