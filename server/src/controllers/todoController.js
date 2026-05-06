const Todo = require("../models/Todo");

// @desc    Get all todos for the logged-in user
// @route   GET /api/todos
const getTodos = async (req, res, next) => {
  try {
    // Only fetch todos that belong to this user
    const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: todos.length,
      data: todos,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new todo for the logged-in user
// @route   POST /api/todos
const createTodo = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const todo = await Todo.create({
      user: req.user._id, // bind to the authenticated user
      title,
      description,
    });

    res.status(201).json({
      success: true,
      message: "TODO created successfully",
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a todo's title and/or description
// @route   PUT /api/todos/:id
const updateTodo = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update (title or description)",
      });
    }

    // Scope the lookup to both id AND the current user — prevents modifying another user's todo
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "TODO not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "TODO updated successfully",
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle the done status of a todo
// @route   PATCH /api/todos/:id/done
const toggleTodoDone = async (req, res, next) => {
  try {
    // Scope to current user
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "TODO not found",
      });
    }

    // Flip the current done status
    todo.done = !todo.done;
    await todo.save();

    res.status(200).json({
      success: true,
      message: `TODO marked as ${todo.done ? "done" : "not done"}`,
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a todo
// @route   DELETE /api/todos/:id
const deleteTodo = async (req, res, next) => {
  try {
    // Scope to current user
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "TODO not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "TODO deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodos,
  createTodo,
  updateTodo,
  toggleTodoDone,
  deleteTodo,
};
