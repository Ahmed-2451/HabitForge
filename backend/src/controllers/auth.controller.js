import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
    
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const userId = randomUUID();
    await db.insert(users).values({
      id: userId,
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET || "habitforge_jwt_secret_key", // Fallback secret if env not set
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: userId, name, email },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Server error during registration" });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const user = await db.select().from(users).where(eq(users.email, email)).get();

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "habitforge_jwt_secret_key", // Fallback secret if env not set
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// Logout user
export const logout = (req, res) => {
  return res.status(200).json({ message: "Logged out successfully" });
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by the auth middleware
    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}; 