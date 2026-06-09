import Task from "../models/Task.js";

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id, deleted: { $ne: true } }).sort({
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

export const getDeletedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id, deleted: true }).sort({
      deletedAt: -1,
    });
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch recycle bin tasks" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
      deleted: { $ne: true },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { title, description, dueDate, priority, completed } = req.body;

    if (
      task.completed &&
      (title !== undefined ||
        description !== undefined ||
        dueDate !== undefined ||
        priority !== undefined)
    ) {
      return res.status(400).json({ message: "Completed tasks can no longer be edited" });
    }

    if (task.completed && completed === false) {
      return res.status(400).json({ message: "Completed tasks stay locked" });
    }

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.dueDate = dueDate === "" ? null : dueDate ?? task.dueDate;
    task.priority = priority ?? task.priority;
    task.completed = completed === true ? true : task.completed;

    const updatedTask = await task.save();
    return res.status(200).json(updatedTask);
  } catch (error) {
    return res.status(500).json({ message: "Could not update task" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
      deleted: { $ne: true },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!task.completed) {
      return res.status(400).json({ message: "Only completed tasks can be deleted" });
    }

    task.deleted = true;
    task.deletedAt = new Date();
    await task.save();

    return res.status(200).json({ message: "Task moved to recycle bin", task });
  } catch (error) {
    return res.status(500).json({ message: "Could not delete task" });
  }
};

export const restoreTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
      deleted: true,
    });

    if (!task) {
      return res.status(404).json({ message: "Deleted task not found" });
    }

    task.deleted = false;
    task.deletedAt = null;
    await task.save();

    return res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({ message: "Could not restore task" });
  }
};

export const permanentlyDeleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
      deleted: true,
    });

    if (!task) {
      return res.status(404).json({ message: "Deleted task not found" });
    }

    return res.status(200).json({ message: "Task deleted permanently" });
  } catch (error) {
    return res.status(500).json({ message: "Could not permanently delete task" });
  }
};

export const emptyRecycleBin = async (req, res) => {
  try {
    await Task.deleteMany({
      user: req.user._id,
      deleted: true,
    });

    return res.status(200).json({ message: "Recycle bin emptied" });
  } catch (error) {
    return res.status(500).json({ message: "Could not empty recycle bin" });
  }
};
