import express from "express";
import {
  cancelAccountDeletion,
  deleteAccount,
  getProfile,
  loginUser,
  registerUser,
  updateProfile,
  updateThemePreference,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.delete("/me", protect, deleteAccount);
router.delete("/me/delete-request", protect, cancelAccountDeletion);
router.put("/preferences/theme", protect, updateThemePreference);

export default router;
