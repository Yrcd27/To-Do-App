const express = require("express");
const {
  getTodos,
  createTodo,
  updateTodo,
  toggleTodoDone,
  deleteTodo,
} = require("../controllers/todoController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All todo routes require a valid access token
router.use(protect);

router.route("/").get(getTodos).post(createTodo);
router.route("/:id").put(updateTodo).delete(deleteTodo);
router.patch("/:id/done", toggleTodoDone);

module.exports = router;
