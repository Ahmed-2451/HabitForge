import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./db/index.js";
import authRoutes from "./routes/auth.routes.js";
import habitsRoutes from "./routes/habits.routes.js";

// Load environment variables
dotenv.config();

// Initialize database
await initializeDatabase();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Simple CORS configuration
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitsRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("HabitForge API is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 