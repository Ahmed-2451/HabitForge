import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
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

const CHART_COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1", 
  "#d084d0", "#ffb347", "#87ceeb", "#dda0dd", "#98fb98"
];

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

  const { completionPerDay, habitBreakdown, overallStats } = statsData;

  // Prepare data for consistency line chart
  const consistencyData = completionPerDay.map(day => ({
    ...day,
    dateLabel: new Date(day.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  // Prepare data for pie chart
  const pieData = habitBreakdown.map((habit, index) => ({
    name: habit.name,
    value: habit.completionRate,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }));

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Habit Statistics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
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

      {/* Overall Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Habits"
          value={overallStats.totalHabits}
          description="Being tracked"
          icon={Target}
        />
        <StatsCard
          title="Avg Completion"
          value={`${overallStats.avgCompletionRate}%`}
          description="Over selected period"
          icon={TrendingUp}
        />
        <StatsCard
          title="Current Streaks"
          value={overallStats.currentStreakSum}
          description="Days total"
          icon={CalendarDays}
        />
        <StatsCard
          title="Best Streaks"
          value={overallStats.longestStreakSum}
          description="Days total"
          icon={Award}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Completion Heatmap */}
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <HabitHeatmap 
              data={completionPerDay} 
              title="Daily Completion Heatmap"
            />
          </CardContent>
        </Card>

        {/* Daily Completion Bar Chart */}
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consistencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="dateLabel" 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'completed' ? `${value} habits` : `${value}%`,
                      name === 'completed' ? 'Completed' : 'Completion Rate'
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="completed" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    name="Completed Habits"
                  />
                  <Bar 
                    dataKey="percentage" 
                    fill="hsl(var(--muted))" 
                    radius={[4, 4, 0, 0]}
                    name="Completion %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Consistency Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Consistency Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={consistencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="dateLabel" 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Completion Rate']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
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
                  <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Habit Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Habit Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Habit</th>
                  <th className="text-left p-2">Completion Rate</th>
                  <th className="text-left p-2">Current Streak</th>
                  <th className="text-left p-2">Longest Streak</th>
                  <th className="text-left p-2">Total Entries</th>
                </tr>
              </thead>
              <tbody>
                {habitBreakdown.map((habit, index) => (
                  <tr key={habit.id} className="border-b">
                    <td className="p-2 font-medium">{habit.name}</td>
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${habit.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm">{habit.completionRate}%</span>
                      </div>
                    </td>
                    <td className="p-2">{habit.currentStreak} days</td>
                    <td className="p-2">{habit.longestStreak} days</td>
                    <td className="p-2">{habit.completedEntries}/{habit.totalEntries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 