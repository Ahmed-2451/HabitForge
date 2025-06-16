import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon, Flame, Calendar, BarChart3 } from "lucide-react";
import { Button } from "../components/ui/button";
import { HabitCard } from "../components/habit-card";
import { HabitForm } from "../components/habit-form";
import { StatsCard } from "../components/stats-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { habitsApi } from "../lib/api";

export function DashboardPage() {
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch habits on component mount
  useEffect(() => {
    fetchHabits();
  }, []);

  // Fetch habits from the API
  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await habitsApi.getHabits();
      setHabits(data.habits || []);
    } catch (error) {
      console.error("Failed to fetch habits:", error);
      setError("Failed to load habits. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await habitsApi.toggleHabitCompletion(id, today, completed);
      
      // Update the habit in the local state
      setHabits(
        habits.map((habit) =>
          habit.id === id ? { ...habit, completed } : habit
        )
      );
      
      // Refresh habits to get updated streak information
      fetchHabits();
    } catch (error) {
      console.error("Failed to toggle habit completion:", error);
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/habits/${id}`);
  };

  const handleAddHabit = async (data) => {
    try {
      await habitsApi.createHabit(data);
      setShowAddForm(false);
      fetchHabits();
    } catch (error) {
      console.error("Failed to add habit:", error);
    }
  };

  // Calculate stats
  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => h.completed).length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const longestStreak = habits.reduce((max, h) => (h.longestStreak > max ? h.longestStreak : max), 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/stats')}>
            <BarChart3 className="mr-2 h-4 w-4" />
            View Statistics
          </Button>
          <Button onClick={() => setShowAddForm(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Habit
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Stats Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Completion Rate"
          value={`${completionRate}%`}
          description="Habits completed today"
          icon={BarChart3}
        />
        <StatsCard
          title="Longest Streak"
          value={longestStreak}
          description="Days in a row"
          icon={Flame}
        />
        <StatsCard
          title="Total Habits"
          value={totalHabits}
          description="Being tracked"
          icon={Calendar}
        />
      </div>

      {/* Add Habit Dialog */}
      <Dialog open={showAddForm} onClose={() => setShowAddForm(false)}>
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <HabitForm 
            onSubmit={handleAddHabit} 
            submitLabel="Create Habit"
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Habits List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Habits</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleComplete={handleToggleComplete}
              onViewDetails={handleViewDetails}
            />
          ))}
          {habits.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p>You haven't added any habits yet.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowAddForm(true)}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add your first habit
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 