import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Signup ─────────────────────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  const { name, phone, email, password, role, avatar } = req.body;

  if (!name || !phone || !password)
    return res.status(400).json({ msg: "Name, phone, and password are required" });

  if (password.length < 8)
    return res.status(400).json({ msg: "Password must be at least 8 characters" });

  try {
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) return res.status(400).json({ msg: "Phone already registered" });

    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).json({ msg: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, phone, email, password: hashed, role, avatar });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ── Login ──────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password)
    return res.status(400).json({ msg: "Phone and password are required" });

  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ── Update profile (auth required — fix for unauthenticated access bug) ────────
router.put("/update/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  // Users can only update their own profile; admins can update any
  if (req.user._id.toString() !== id && req.user.role !== "admin") {
    return res.status(403).json({ msg: "Not authorized to update this profile" });
  }

  const { phone, email } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { phone, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ── Helper ─────────────────────────────────────────────────────────────────────
function sanitizeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    workerId: user.workerId,
    avatar: user.avatar,
  };
}

export default router;
