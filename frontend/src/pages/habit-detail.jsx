import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Trash2, Flame, BarChart3, Clock, CheckCircle2, Circle } from "lucide-react";
import { Button } from "../components/ui/button";
import { ProgressChart } from "../components/progress-chart";
import { StatsCard } from "../components/stats-card";
import { HabitForm } from "../components/habit-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { habitsApi } from "../lib/api";

export function HabitDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [habit, setHabit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [progressData, setProgressData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [importance, setImportance] = useState(null);
  const [importanceLoading, setImportanceLoading] = useState(false);

  useEffect(() => {
    fetchHabit();
  }, [id]);

  const fetchHabit = async () => {
    setHabit(null);
    setProgressData([]);
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch habit details
      const { habit } = await habitsApi.getHabitById(id);
      setHabit(habit);
      setImportance(habit.importance?.toString() || "5");
      
      // Fetch habit entries
      const today = new Date();
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(today.getDate() - 14);
      
      const startDate = twoWeeksAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      const { entries } = await habitsApi.getHabitEntries(id, startDate, endDate);
      
      // Transform entries to progress data format
      const data = [];
      let currentDate = new Date(twoWeeksAgo);
      
      while (currentDate <= today) {
        const dateString = currentDate.toISOString().split('T')[0];
        const entry = entries.find(e => e.date === dateString);
        
        data.push({
          date: dateString,
          completed: entry ? entry.completed : false
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setProgressData(data);
    } catch (error) {
      console.error("Error fetching habit details:", error);
      setError("Failed to load habit details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditHabit = async (data) => {
    try {
      await habitsApi.updateHabit(id, data);
      setIsEditing(false);
      fetchHabit(); // Refresh habit data
    } catch (error) {
      console.error("Failed to update habit:", error);
    }
  };

  const handleDeleteHabit = async () => {
    try {
      await habitsApi.deleteHabit(id);
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to delete habit:", error);
    }
  };

  const handleToggleDay = async (date, completed) => {
    try {
      await habitsApi.toggleHabitCompletion(id, date, completed);
      
      // Update progress data
      setProgressData(prev => 
        prev.map(entry => 
          entry.date === date ? { ...entry, completed } : entry
        )
      );
      
      // Refresh habit data to get updated streaks
      fetchHabit();
    } catch (error) {
      console.error("Failed to toggle completion:", error);
    }
  };

  const handleImportanceChange = async (value) => {
    setImportance(value);
    setImportanceLoading(true);
    try {
      await habitsApi.updateHabit(id, { ...habit, importance: parseInt(value, 10) });
      setHabit((prev) => ({ ...prev, importance: parseInt(value, 10) }));
    } catch (error) {
      // Optionally show error
    }
    setImportanceLoading(false);
  };

  const getPriorityLabel = (value) => {
    const numValue = parseInt(value);
    if (numValue >= 8) return "High";
    if (numValue >= 5) return "Medium";
    return "Low";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/15 text-destructive p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Habit not found</p>
      </div>
    );
  }

  // Calculate stats
  const daysTracked = progressData.length;
  const daysCompleted = progressData.filter(day => day.completed).length;
  const completionRate = daysTracked > 0 ? Math.round((daysCompleted / daysTracked) * 100) : 0;

  // Calculate days since creation
  const createdDate = new Date(habit.createdAt);
  const today = new Date();
  const daysSinceCreation = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));

  return (
    <div key={id} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">{habit.name}</h1>
            <div className="flex gap-1">
              <input
                type="radio"
                id="low-importance-detail"
                name="importance"
                value="3"
                checked={importance === "3"}
                onChange={(e) => handleImportanceChange(e.target.value)}
                disabled={importanceLoading}
                className="sr-only"
              />
              <Label 
                htmlFor="low-importance-detail" 
                className={`px-3 py-1 rounded-l-md border cursor-pointer text-xs transition-colors ${
                  importance === "3" ? "bg-green-100 border-green-300 text-green-800" : "border-input hover:bg-secondary/50"
                }`}
              >
                Low
              </Label>
              
              <input
                type="radio"
                id="medium-importance-detail"
                name="importance"
                value="5"
                checked={importance === "5"}
                onChange={(e) => handleImportanceChange(e.target.value)}
                disabled={importanceLoading}
                className="sr-only"
              />
              <Label 
                htmlFor="medium-importance-detail" 
                className={`px-3 py-1 border-t border-b cursor-pointer text-xs transition-colors ${
                  importance === "5" ? "bg-yellow-100 border-yellow-300 text-yellow-800" : "border-input hover:bg-secondary/50"
                }`}
              >
                Medium
              </Label>
              
              <input
                type="radio"
                id="high-importance-detail"
                name="importance"
                value="8"
                checked={importance === "8"}
                onChange={(e) => handleImportanceChange(e.target.value)}
                disabled={importanceLoading}
                className="sr-only"
              />
              <Label 
                htmlFor="high-importance-detail" 
                className={`px-3 py-1 rounded-r-md border cursor-pointer text-xs transition-colors ${
                  importance === "8" ? "bg-red-100 border-red-300 text-red-800" : "border-input hover:bg-secondary/50"
                }`}
              >
                High
              </Label>
            </div>
          </div>
          {habit.description && (
            <p className="text-muted-foreground mt-2">{habit.description}</p>
          )}
        </div>
        <Button variant="outline" onClick={() => setIsEditing(true)}>
          <Edit2 className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="destructive" onClick={handleDeleteHabit}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      {/* Edit Habit Dialog */}
      <Dialog open={isEditing} onClose={() => setIsEditing(false)}>
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <HabitForm 
            onSubmit={handleEditHabit}
            initialData={habit}
            submitLabel="Save Changes"
            onCancel={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Stats Section */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Completion Rate"
          value={`${completionRate}%`}
          description="Days completed"
          icon={BarChart3}
        />
        <StatsCard
          title="Current Streak"
          value={habit.currentStreak || 0}
          description="Days in a row"
          icon={Flame}
        />
        <StatsCard
          title="Longest Streak"
          value={habit.longestStreak || 0}
          description="Your record"
          icon={Flame}
        />
        <StatsCard
          title="Days Tracked"
          value={daysSinceCreation || 0}
          description="Since creation"
          icon={Clock}
        />
      </div>

      {/* Progress Chart */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Progress</h2>
        <ProgressChart 
          data={progressData} 
          title="Last 14 Days" 
        />
      </div>

      {/* Daily Tracking Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Daily Tracking</h2>
        <div className="border rounded-lg overflow-hidden">
          <div className="divide-y">
            {progressData.slice().reverse().map((entry) => {
              const entryDate = new Date(entry.date);
              const isToday = entry.date === new Date().toISOString().split('T')[0];
              
              return (
                <div 
                  key={entry.date} 
                  className={`flex items-center justify-between p-4 ${
                    isToday ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleDay(entry.date, !entry.completed)}
                      className={`p-1 rounded-full transition-all ${
                        entry.completed 
                          ? 'text-green-600 hover:text-green-700 hover:bg-green-100' 
                          : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {entry.completed ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {entryDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                        {isToday && <span className="text-blue-600 ml-2 text-sm font-semibold">(Today)</span>}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {entryDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      entry.completed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {entry.completed ? 'Completed' : 'Not completed'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 