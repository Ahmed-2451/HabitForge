import { db } from "../db/index.js";
import { habits, habitEntries } from "../db/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

// Get all habits for the current user
export const getHabits = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userHabits = await db
      .select()
      .from(habits)
      .where(eq(habits.userId, userId))
      .orderBy(desc(habits.createdAt))
      .all();
    
    return res.status(200).json({ habits: userHabits });
  } catch (error) {
    console.error("Get habits error:", error);
    return res.status(500).json({ message: "Server error while fetching habits" });
  }
};

// Create a new habit
export const createHabit = async (req, res) => {
  try {
    const { name, description, importance } = req.body;
    const userId = req.user.id;
    
    if (!name) {
      return res.status(400).json({ message: "Habit name is required" });
    }
    
    const habitId = randomUUID();
    
    await db.insert(habits).values({
      id: habitId,
      name,
      description: description || "",
      importance: importance || 5,
      userId,
      createdAt: new Date(),
      currentStreak: 0,
      longestStreak: 0,
    });
    
    const newHabit = await db
      .select()
      .from(habits)
      .where(eq(habits.id, habitId))
      .get();
    
    return res.status(201).json({ 
      message: "Habit created successfully",
      habit: newHabit
    });
  } catch (error) {
    console.error("Create habit error:", error);
    return res.status(500).json({ message: "Server error while creating habit" });
  }
};

// Get a specific habit by ID
export const getHabitById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const habit = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .get();
    
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    
    return res.status(200).json({ habit });
  } catch (error) {
    console.error("Get habit by ID error:", error);
    return res.status(500).json({ message: "Server error while fetching habit" });
  }
};

// Update a habit
export const updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, importance } = req.body;
    const userId = req.user.id;
    
    if (!name) {
      return res.status(400).json({ message: "Habit name is required" });
    }
    
    const habit = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .get();
    
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    
    await db
      .update(habits)
      .set({ 
        name,
        description: description !== undefined ? description : habit.description,
        importance: importance !== undefined ? importance : habit.importance
      })
      .where(eq(habits.id, id))
      .run();
    
    const updatedHabit = await db
      .select()
      .from(habits)
      .where(eq(habits.id, id))
      .get();
    
    return res.status(200).json({
      message: "Habit updated successfully",
      habit: updatedHabit
    });
  } catch (error) {
    console.error("Update habit error:", error);
    return res.status(500).json({ message: "Server error while updating habit" });
  }
};

// Delete a habit
export const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const habit = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .get();
    
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    
    await db
      .delete(habits)
      .where(eq(habits.id, id))
      .run();
    
    return res.status(200).json({ message: "Habit deleted successfully" });
  } catch (error) {
    console.error("Delete habit error:", error);
    return res.status(500).json({ message: "Server error while deleting habit" });
  }
};

// Toggle habit completion for a specific date
export const toggleHabitCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, completed } = req.body;
    const userId = req.user.id;
    
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }
    
    // Check if the habit exists and belongs to the user
    const habit = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .get();
    
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    
    // Check if an entry already exists for this habit and date
    const existingEntry = await db
      .select()
      .from(habitEntries)
      .where(and(eq(habitEntries.habitId, id), eq(habitEntries.date, date)))
      .get();
    
    if (existingEntry) {
      // Update existing entry
      await db
        .update(habitEntries)
        .set({ completed: completed ?? !existingEntry.completed })
        .where(and(eq(habitEntries.habitId, id), eq(habitEntries.date, date)))
        .run();
    } else {
      // Create new entry
      const entryId = randomUUID();
      await db
        .insert(habitEntries)
        .values({
          id: entryId,
          habitId: id,
          date,
          completed: completed ?? true,
          createdAt: new Date(),
        })
        .run();
    }
    
    // Update streak information
    await updateStreaks(id);
    
    // Get the updated habit
    const updatedHabit = await db
      .select()
      .from(habits)
      .where(eq(habits.id, id))
      .get();
    
    return res.status(200).json({
      message: "Habit completion toggled successfully",
      habit: updatedHabit
    });
  } catch (error) {
    console.error("Toggle habit completion error:", error);
    return res.status(500).json({ message: "Server error while toggling habit completion" });
  }
};

// Get habit entries for a specific habit
export const getHabitEntries = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const userId = req.user.id;
    
    // Check if the habit exists and belongs to the user
    const habit = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .get();
    
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    
    let query = db
      .select()
      .from(habitEntries)
      .where(eq(habitEntries.habitId, id));
    
    if (startDate) {
      query = query.where(sql`${habitEntries.date} >= ${startDate}`);
    }
    
    if (endDate) {
      query = query.where(sql`${habitEntries.date} <= ${endDate}`);
    }
    
    const entries = await query.orderBy(habitEntries.date).all();
    
    return res.status(200).json({ entries });
  } catch (error) {
    console.error("Get habit entries error:", error);
    return res.status(500).json({ message: "Server error while fetching habit entries" });
  }
};

// Helper function to update streaks
async function updateStreaks(habitId) {
  try {
    // Get all completed entries for this habit, ordered by date
    const entries = await db
      .select()
      .from(habitEntries)
      .where(and(eq(habitEntries.habitId, habitId), eq(habitEntries.completed, true)))
      .orderBy(habitEntries.date)
      .all();
    
    if (entries.length === 0) {
      // No completed entries, reset streaks
      await db
        .update(habits)
        .set({ currentStreak: 0, longestStreak: 0 })
        .where(eq(habits.id, habitId))
        .run();
      return;
    }
    
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Check if the most recent entry is today or yesterday
    const latestEntry = entries[entries.length - 1];
    if (latestEntry.date === today || latestEntry.date === yesterday) {
      currentStreak = 1; // Start with 1 for the latest day
      
      // Count consecutive days backwards
      for (let i = entries.length - 2; i >= 0; i--) {
        const currentDate = new Date(entries[i].date);
        const prevDate = new Date(entries[i + 1].date);
        
        // Check if dates are consecutive
        const diffTime = prevDate - currentDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    // Get the current habit to compare with longest streak
    const habit = await db
      .select()
      .from(habits)
      .where(eq(habits.id, habitId))
      .get();
    
    const longestStreak = Math.max(currentStreak, habit?.longestStreak || 0);
    
    // Update the habit with new streak values
    await db
      .update(habits)
      .set({
        currentStreak,
        longestStreak
      })
      .where(eq(habits.id, habitId))
      .run();
  } catch (error) {
    console.error("Update streaks error:", error);
    throw error;
  }
}

// Get statistics data for the user's habits
export const getHabitStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query; // Default to 30 days
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Get user's habits
    const userHabits = await db
      .select()
      .from(habits)
      .where(eq(habits.userId, userId))
      .all();
    
    if (userHabits.length === 0) {
      return res.status(200).json({
        completionPerDay: [],
        habitBreakdown: [],
        overallStats: {
          totalHabits: 0,
          avgCompletionRate: 0,
          currentStreakSum: 0,
          longestStreakSum: 0
        }
      });
    }
    
    // Get all habit entries in the date range
    const entries = await db
      .select()
      .from(habitEntries)
      .where(
        and(
          sql`${habitEntries.habitId} IN (${userHabits.map(h => `'${h.id}'`).join(',')})`,
          sql`${habitEntries.date} >= ${startDateStr}`,
          sql`${habitEntries.date} <= ${endDateStr}`
        )
      )
      .all();
    
    // Calculate completion per day
    const completionPerDay = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const dayEntries = entries.filter(e => e.date === dateStr);
      const completedCount = dayEntries.filter(e => e.completed).length;
      
      completionPerDay.push({
        date: dateStr,
        completed: completedCount,
        total: userHabits.length,
        percentage: userHabits.length > 0 ? Math.round((completedCount / userHabits.length) * 100) : 0
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    // Calculate habit breakdown (completion rate per habit)
    const habitBreakdown = userHabits.map(habit => {
      const habitEntries = entries.filter(e => e.habitId === habit.id);
      const completedEntries = habitEntries.filter(e => e.completed);
      const completionRate = habitEntries.length > 0 ? Math.round((completedEntries.length / parseInt(days)) * 100) : 0;
      
      return {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        importance: habit.importance,
        completionRate,
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
        totalEntries: habitEntries.length,
        completedEntries: completedEntries.length
      };
    });
    
    // Calculate overall stats
    const totalHabits = userHabits.length;
    const avgCompletionRate = habitBreakdown.length > 0 
      ? Math.round(habitBreakdown.reduce((sum, h) => sum + h.completionRate, 0) / habitBreakdown.length)
      : 0;
    const currentStreakSum = userHabits.reduce((sum, h) => sum + h.currentStreak, 0);
    const longestStreakSum = userHabits.reduce((sum, h) => sum + h.longestStreak, 0);
    
    return res.status(200).json({
      completionPerDay,
      habitBreakdown,
      overallStats: {
        totalHabits,
        avgCompletionRate,
        currentStreakSum,
        longestStreakSum
      }
    });
    
  } catch (error) {
    console.error("Get habit stats error:", error);
    return res.status(500).json({ message: "Server error while fetching habit statistics" });
  }
}; 