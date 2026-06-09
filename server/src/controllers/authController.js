import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        themePreference: user.themePreference,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not create account" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        themePreference: user.themePreference,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not log in" });
  }
};

export const getProfile = async (req, res) => {
  return res.status(200).json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    themePreference: req.user.themePreference || "dark",
  });
};

export const updateThemePreference = async (req, res) => {
  try {
    const { themePreference } = req.body;

    if (!["dark", "light"].includes(themePreference)) {
      return res.status(400).json({ message: "Invalid theme preference" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { themePreference },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      themePreference: user.themePreference,
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not update theme" });
  }
};
