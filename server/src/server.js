import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDb from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();
connectDb();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: false,
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Task Manager API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

