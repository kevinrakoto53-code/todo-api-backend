const Todo = require("../models/Todo");

// Créer une nouvelle todo
const createTodo = async (req, res) => {
  try {
    const { titre, description, priority, category, deadline } = req.body;

    // On crée la todo en ajoutant automatiquement l'user connecté
    const newTodo = await Todo.create({
      titre,
      description,
      priority,
      category,
      deadline,
      user: req.user._id, // L'ID vient du middleware protect
    });

    res.status(201).json({
      success: true,
      message: "Todo créée avec succès",
      data: newTodo,
    });
  } catch (error) {
    // Gestion des erreurs de validation Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        erreur: messages,
      });
    }

    res.status(500).json({
      success: false,
      erreur: error.message,
    });
  }
};

// Récupérer toutes les todos avec pagination et tri
const getTodos = async (req, res) => {
  try {
    // Pagination : on récupère page et limit depuis la query, avec des valeurs par défaut
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Gestion du tri
    let sortOption = {};

    if (req.query.sort) {
      const sortField = req.query.sort;
      // Si le champ commence par "-", on tri en ordre décroissant
      if (sortField.startsWith("-")) {
        const field = sortField.substring(1);
        sortOption[field] = -1;
      } else {
        sortOption[sortField] = 1;
      }
    } else {
      // Par défaut on tri par date de création (les plus récents d'abord)
      sortOption = { createdAt: -1 };
    }

    // Calcul des infos de pagination
    const totalTodos = await Todo.countDocuments({ user: req.user._id });
    const totalPages = Math.ceil(totalTodos / limit);

    // Requête principale avec filtrage par user
    const todos = await Todo.find({ user: req.user._id })
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      pagination: {
        currentPage: page,
        limit: limit,
        totalTodos: totalTodos,
        totalPages: totalPages,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      },
      sorting: req.query.sort || "createdAt (desc)",
      count: todos.length,
      data: todos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      erreur: error.message,
    });
  }
};

// Récupérer une todo spécifique par son ID
const getTodoById = async (req, res) => {
  try {
    // On cherche la todo ET on vérifie qu'elle appartient bien à l'user
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        erreur: "Todo non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    // Gérer le cas où l'ID n'est pas valide
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        erreur: "Todo non trouvée",
      });
    }

    res.status(500).json({
      success: false,
      erreur: error.message,
    });
  }
};

// Mettre à jour une todo
const updateTodo = async (req, res) => {
  try {
    const { titre, description, completed, priority, category, deadline } =
      req.body;

    const todo = await Todo.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id, // Sécurité : l'user peut modifier que ses todos
      },
      { titre, description, completed, priority, category, deadline },
      {
        new: true, // Retourne le document modifié
        runValidators: true, // Active les validations du schéma
      }
    );

    if (!todo) {
      return res.status(404).json({
        success: false,
        erreur: "Todo non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      message: "Todo mise à jour avec succès",
      data: todo,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        erreur: messages,
      });
    }

    res.status(500).json({
      success: false,
      erreur: error.message,
    });
  }
};

// Toggle le statut completed d'une todo
const toggleComplete = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        erreur: "Todo non trouvée",
      });
    }

    // On inverse le boolean completed
    todo.completed = !todo.completed;
    await todo.save();

    res.status(200).json({
      success: true,
      message: todo.completed
        ? "Todo marquée comme complétée"
        : "Todo marquée comme non complétée",
      data: todo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      erreur: error.message,
    });
  }
};

// Supprimer une todo
const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        erreur: "Todo non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      message: "Todo supprimée avec succès",
      data: todo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      erreur: error.message,
    });
  }
};

// Filtrer les todos selon différents critères
const filterTodos = async (req, res) => {
  try {
    const { completed, priority, category } = req.query;

    // Construction dynamique du filtre
    let filter = { user: req.user._id };

    // On ajoute les filtres seulement s'ils sont fournis
    if (completed !== undefined) {
      filter.completed = completed === "true";
    }

    if (priority) {
      filter.priority = priority;
    }

    if (category) {
      filter.category = category;
    }

    const todos = await Todo.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: todos.length,
      filters: { completed, priority, category },
      data: todos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      erreur: error.message,
    });
  }
};

// Rechercher des todos par mot-clé
const searchTodos = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        erreur: "Terme de recherche requis",
      });
    }

    // Recherche avec regex dans titre et description
    // $options: "i" = insensible à la casse
    const todos = await Todo.find({
      user: req.user._id,
      $or: [
        { titre: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: todos.length,
      searchTerm: q,
      data: todos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      erreur: error.message,
    });
  }
};

// Récupérer les statistiques des todos de l'utilisateur
const getStats = async (req, res) => {
  try {
    // Stats générales
    const totalTodos = await Todo.countDocuments({ user: req.user._id });
    const completedTodos = await Todo.countDocuments({
      user: req.user._id,
      completed: true,
    });
    const pendingTodos = await Todo.countDocuments({
      user: req.user._id,
      completed: false,
    });

    // Stats par priorité
    const highPriority = await Todo.countDocuments({
      user: req.user._id,
      priority: "haute",
    });
    const mediumPriority = await Todo.countDocuments({
      user: req.user._id,
      priority: "moyenne",
    });
    const lowPriority = await Todo.countDocuments({
      user: req.user._id,
      priority: "basse",
    });

    // Stats par catégorie
    const travail = await Todo.countDocuments({
      user: req.user._id,
      category: "travail",
    });
    const personnel = await Todo.countDocuments({
      user: req.user._id,
      category: "personnel",
    });
    const urgent = await Todo.countDocuments({
      user: req.user._id,
      category: "urgent",
    });
    const autre = await Todo.countDocuments({
      user: req.user._id,
      category: "autre",
    });

    res.status(200).json({
      success: true,
      stats: {
        total: totalTodos,
        completed: completedTodos,
        pending: pendingTodos,
        completionRate:
          totalTodos > 0
            ? ((completedTodos / totalTodos) * 100).toFixed(1) + "%"
            : "0%",
        byPriority: {
          haute: highPriority,
          moyenne: mediumPriority,
          basse: lowPriority,
        },
        byCategory: {
          travail,
          personnel,
          urgent,
          autre,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      erreur: error.message,
    });
  }
};

// Uploader un fichier sur une todo
const uploadFile = async (req, res) => {
  try {
    // Vérifier qu'un fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({
        success: false,
        erreur: "Aucun fichier fourni",
      });
    }

    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        erreur: "Todo non trouvée",
      });
    }

    // Ajouter les infos du fichier dans le tableau attachments
    todo.attachments.push({
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    });

    await todo.save();

    res.status(200).json({
      success: true,
      message: "Fichier uploadé avec succès",
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
      data: todo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      erreur: error.message,
    });
  }
};

// Supprimer un fichier d'une todo
const deleteFile = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        erreur: "Todo non trouvée",
      });
    }

    // Trouver l'index du fichier dans le tableau
    const fileIndex = todo.attachments.findIndex(
      (att) => att.filename === req.params.filename
    );

    if (fileIndex === -1) {
      return res.status(404).json({
        success: false,
        erreur: "Fichier non trouvé",
      });
    }

    // Supprimer le fichier physique du serveur
    const fs = require("fs");
    const filePath = todo.attachments[fileIndex].path;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Retirer le fichier du tableau MongoDB
    todo.attachments.splice(fileIndex, 1);
    await todo.save();

    res.status(200).json({
      success: true,
      message: "Fichier supprimé avec succès",
      data: todo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      erreur: error.message,
    });
  }
};

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  toggleComplete,
  deleteTodo,
  filterTodos,
  searchTodos,
  getStats,
  uploadFile,
  deleteFile,
};