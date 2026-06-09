import express from "express";
import {
  getProfile,
  loginUser,
  registerUser,
  updateThemePreference,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getProfile);
router.put("/preferences/theme", protect, updateThemePreference);

export default router;
