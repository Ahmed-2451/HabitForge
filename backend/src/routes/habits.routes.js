import express from "express";
import { 
  getHabits, 
  createHabit, 
  getHabitById, 
  updateHabit, 
  deleteHabit,
  toggleHabitCompletion,
  getHabitEntries,
  getHabitStats
} from "../controllers/habits.controller.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Stats route (should come before parameterized routes)
router.get("/stats", getHabitStats);

// Habit routes
router.get("/", getHabits);
router.post("/", createHabit);
router.get("/:id", getHabitById);
router.put("/:id", updateHabit);
router.delete("/:id", deleteHabit);

// Habit entries routes
router.post("/:id/toggle", toggleHabitCompletion);
router.get("/:id/entries", getHabitEntries);



export default router; 