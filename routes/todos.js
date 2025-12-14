const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todoController");
const { protect } = require("../middlewares/auth");
const { validateCreateTodo, validateUpdateTodo } = require("../validators/todoValidator");
const { validateRequest } = require("../middlewares/validateRequest");
const upload = require("../config/multer");

// Appliquer le middleware protect à toutes les routes
// Donc toutes les routes en dessous nécessitent l'authentification
router.use(protect);

// Routes CRUD basiques
router.post("/", validateCreateTodo, validateRequest, todoController.createTodo);
router.get("/", todoController.getTodos);
router.get("/filter", todoController.filterTodos); // Doit être avant /:id sinon "filter" sera pris comme un ID
router.get("/search", todoController.searchTodos);
router.get("/stats", todoController.getStats);
router.get("/:id", todoController.getTodoById);
router.put("/:id", validateUpdateTodo, validateRequest, todoController.updateTodo);
router.patch("/:id/toggle", todoController.toggleComplete);
router.delete("/:id", todoController.deleteTodo);

// 

module.exports = router;