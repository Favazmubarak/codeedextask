const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { tasks } = require("../store");

const authCheck = (req, res, next) => {
  if (!req.session.user)
    return res.status(401).json({ message: "Not logged in" });
  next();
};

router.get("/", authCheck, (req, res) => {
  const userTasks = tasks.filter((t) => t.userId === req.session.user.id);
  res.json(userTasks);
});

router.post("/", authCheck, (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required" });

  const task = {
    id: uuidv4(),
    userId: req.session.user.id,
    title,
    description: description || "",
    status: "todo",
  };
  tasks.push(task);
  res.json(task);
});

router.put("/:id", authCheck, (req, res) => {
  const task = tasks.find(
    (t) => t.id === req.params.id && t.userId === req.session.user.id,
  );
  if (!task) return res.status(404).json({ message: "Task not found" });

  const { title, description, status } = req.body;
  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (status) task.status = status;

  res.json(task);
});

router.delete("/:id", authCheck, (req, res) => {
  const index = tasks.findIndex(
    (t) => t.id === req.params.id && t.userId === req.session.user.id,
  );
  if (index === -1) return res.status(404).json({ message: "Task not found" });

  tasks.splice(index, 1);
  res.json({ message: "Deleted" });
});

module.exports = router;
