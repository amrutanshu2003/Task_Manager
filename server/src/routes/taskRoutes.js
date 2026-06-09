import express from "express";
import {
  createTask,
  deleteTask,
  emptyRecycleBin,
  getDeletedTasks,
  getTasks,
  permanentlyDeleteTask,
  restoreTask,
  updateTask,
} from "../controllers/taskController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getTasks).post(createTask);
router.get("/deleted", getDeletedTasks);
router.delete("/deleted", emptyRecycleBin);
router.put("/:id/restore", restoreTask);
router.delete("/:id/permanent", permanentlyDeleteTask);
router.route("/:id").put(updateTask).delete(deleteTask);

export default router;
