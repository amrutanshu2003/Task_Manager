import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Task from "../models/Task.js";

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  themePreference: user.themePreference,
  pendingDeletion: user.pendingDeletion || false,
  deletionRequestedAt: user.deletionRequestedAt,
  accountPurgeAt: user.accountPurgeAt,
});

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
      user: serializeUser(user),
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
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not log in" });
  }
};

export const getProfile = async (req, res) => {
  return res.status(200).json(serializeUser(req.user));
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

    return res.status(200).json(serializeUser(user));
  } catch (error) {
    return res.status(500).json({ message: "Could not update theme" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const updateData = {
      name,
      email,
    };

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    }).select("-password");

    return res.status(200).json(serializeUser(user));
  } catch (error) {
    return res.status(500).json({ message: "Could not update profile" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const deletionRequestedAt = new Date();
    const accountPurgeAt = new Date(deletionRequestedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        pendingDeletion: true,
        deletionRequestedAt,
        accountPurgeAt,
      },
      { new: true }
    ).select("-password");

    await Task.updateMany(
      { user: req.user._id },
      {
        $set: {
          accountPurgeAt,
        },
      }
    );

    return res.status(200).json({
      message: "Account scheduled for deletion in 7 days",
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not delete account" });
  }
};

export const cancelAccountDeletion = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        pendingDeletion: false,
        deletionRequestedAt: null,
        accountPurgeAt: null,
      },
      { new: true }
    ).select("-password");

    await Task.updateMany(
      { user: req.user._id },
      {
        $set: {
          accountPurgeAt: null,
        },
      }
    );

    return res.status(200).json({
      message: "Account deletion cancelled",
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not cancel account deletion" });
  }
};
