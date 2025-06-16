import express from "express";
import { register, login, logout, getCurrentUser } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes
router.get("/me", authenticateToken, getCurrentUser);

export default router; 