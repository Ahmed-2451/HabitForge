import React, { useState, useEffect } from "react";
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { StatsCard } from "./stats-card";
import { HabitHeatmap } from "./habit-heatmap";
import { CalendarDays, TrendingUp, Target, Award } from "lucide-react";
import { habitsApi } from "../lib/api";

const TIME_RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" }
];

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function StatsDashboard() {
  const [timeRange, setTimeRange] = useState("30");
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await habitsApi.getHabitStats(timeRange);
      setStatsData(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setError("Failed to load statistics. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchStats}>Try Again</Button>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No statistics data available.</p>
      </div>
    );
  }

  // Extract data from API response
  const { completionPerDay = [], habitBreakdown = [], overallStats = {} } = statsData;

  // Simple data preparation for charts
  const chartData = completionPerDay.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    completed: day.completed,
    total: day.total,
    percentage: day.percentage
  }));

  // Simple pie chart data
  const pieData = habitBreakdown.map((habit, index) => ({
    name: habit.name,
    value: habit.completionRate,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Habit Statistics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={TIME_RANGES.find(r => r.value === timeRange)?.label || "Select time range"} />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map(range => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Habits"
          value={overallStats.totalHabits || 0}
          description="Being tracked"
          icon={Target}
        />
        <StatsCard
          title="Avg Completion"
          value={`${overallStats.avgCompletionRate || 0}%`}
          description="Over selected period"
          icon={TrendingUp}
        />
        <StatsCard
          title="Current Streaks"
          value={overallStats.currentStreakSum || 0}
          description="Days total"
          icon={CalendarDays}
        />
        <StatsCard
          title="Best Streaks"
          value={overallStats.longestStreakSum || 0}
          description="Days total"
          icon={Award}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Completion Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="percentage" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Habit Performance Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Habit Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <CardContent className="pt-6">
          <HabitHeatmap 
            data={completionPerDay} 
            title="Daily Completion Heatmap"
          />
        </CardContent>
      </Card>

      {/* Habit Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Habit Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Habit Name</th>
                  <th className="text-left p-2">Completion Rate</th>
                  <th className="text-left p-2">Current Streak</th>
                  <th className="text-left p-2">Longest Streak</th>
                </tr>
              </thead>
              <tbody>
                {habitBreakdown.map((habit) => (
                  <tr key={habit.id} className="border-b">
                    <td className="p-2">{habit.name}</td>
                    <td className="p-2">{habit.completionRate}%</td>
                    <td className="p-2">{habit.currentStreak} days</td>
                    <td className="p-2">{habit.longestStreak} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {habitBreakdown.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No habits found. Add some habits to see statistics.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 