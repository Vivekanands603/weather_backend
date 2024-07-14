const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
console.log("JWT_SECRET:", JWT_SECRET);

// User Registration
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  console.log("Received signup request:", { username, email, password });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    console.log("User created successfully:", newUser);
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Received login request:", { email, password });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Login successful, token generated:", token);
    res.status(200).json({ token, userId: user._id });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
