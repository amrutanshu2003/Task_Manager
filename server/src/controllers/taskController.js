import Task from "../models/Task.js";

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({
      completed: 1,
      dueDate: 1,
      createdAt: -1,
    });
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch tasks" });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      dueDate: dueDate || null,
      priority: priority || "medium",
    });

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: "Could not create task" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { title, description, dueDate, priority, completed } = req.body;

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.dueDate = dueDate === "" ? null : dueDate ?? task.dueDate;
    task.priority = priority ?? task.priority;
    task.completed = completed ?? task.completed;

    const updatedTask = await task.save();
    return res.status(200).json(updatedTask);
  } catch (error) {
    return res.status(500).json({ message: "Could not update task" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Could not delete task" });
  }
};

