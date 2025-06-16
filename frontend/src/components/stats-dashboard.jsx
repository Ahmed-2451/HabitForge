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
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", 
  "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6b7280"
];

const PERFORMANCE_COLORS = {
  excellent: "#10b981", // Green for 80%+
  good: "#3b82f6",      // Blue for 60-79%
  average: "#f59e0b",   // Yellow for 40-59%
  poor: "#ef4444",      // Red for <40%
  none: "#6b7280"       // Gray for 0%
};

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

  // Enhanced pie chart data preparation - include all habits even with 0% completion
  const pieData = habitBreakdown.length > 0 ? habitBreakdown.map((habit, index) => {
    const getPerformanceColor = (rate) => {
      if (rate === 0) return PERFORMANCE_COLORS.none;
      if (rate < 40) return PERFORMANCE_COLORS.poor;
      if (rate < 60) return PERFORMANCE_COLORS.average;
      if (rate < 80) return PERFORMANCE_COLORS.good;
      return PERFORMANCE_COLORS.excellent;
    };

    return {
      name: habit.name,
      value: Math.max(habit.completionRate, 1), // Ensure minimum 1% for visibility
      actualValue: habit.completionRate,
      color: getPerformanceColor(habit.completionRate),
      completedEntries: habit.completedEntries,
      totalEntries: habit.totalEntries
    };
  }) : [{
    name: "No habits yet",
    value: 100,
    actualValue: 0,
    color: PERFORMANCE_COLORS.none,
    completedEntries: 0,
    totalEntries: 0
  }];

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Completion Rate: {data.actualValue}%
          </p>
          <p className="text-xs text-gray-500">
            {data.completedEntries}/{data.totalEntries} entries
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, actualValue, name }) => {
    if (actualValue === 0) return null; // Don't show label for 0% habits
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${actualValue}%`}
      </text>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Habit Statistics</h2>
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
        <Card className="col-span-full shadow-lg">
          <CardContent className="pt-6">
            <HabitHeatmap 
              data={completionPerDay} 
              title="Daily Completion Heatmap"
            />
          </CardContent>
        </Card>

        {/* Daily Completion Bar Chart */}
        <Card className="col-span-full lg:col-span-2 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Daily Completion Overview</CardTitle>
            <p className="text-sm text-muted-foreground">
              Track your daily habit completion patterns
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consistencyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="dateLabel" 
                    tick={{ fontSize: 12, fill: '#666' }} 
                    tickLine={{ stroke: '#ccc' }}
                    axisLine={{ stroke: '#ccc' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#666' }}
                    tickLine={{ stroke: '#ccc' }}
                    axisLine={{ stroke: '#ccc' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => [
                      name === 'completed' ? `${value} habits completed` : `${value}% completion rate`,
                      name === 'completed' ? 'Completed Habits' : 'Completion Rate'
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="completed" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    name="Completed Habits"
                  />
                  <Bar 
                    dataKey="percentage" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                    name="Completion Rate (%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Consistency Line Chart */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Consistency Trend</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your completion rate over time
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={consistencyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="dateLabel" 
                    tick={{ fontSize: 12, fill: '#666' }} 
                    tickLine={{ stroke: '#ccc' }}
                    axisLine={{ stroke: '#ccc' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: '#666' }}
                    tickLine={{ stroke: '#ccc' }}
                    axisLine={{ stroke: '#ccc' }}
                    label={{ value: 'Completion %', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`${value}%`, 'Completion Rate']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: "#8b5cf6", strokeWidth: 2, fill: "white" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Habit Performance Pie Chart */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Habit Performance</CardTitle>
            <p className="text-sm text-muted-foreground">
              Individual habit completion rates
            </p>
          </CardHeader>
          <CardContent>
            {habitBreakdown.length > 0 ? (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={PieLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Performance Legend */}
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold text-sm">Performance Legend:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PERFORMANCE_COLORS.excellent }}></div>
                      <span>Excellent (80%+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PERFORMANCE_COLORS.good }}></div>
                      <span>Good (60-79%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PERFORMANCE_COLORS.average }}></div>
                      <span>Average (40-59%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PERFORMANCE_COLORS.poor }}></div>
                      <span>Needs Work (&lt;40%)</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg mb-2">No habits to display</p>
                  <p className="text-sm">Add some habits to see performance data</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Habit Breakdown Table */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Detailed Habit Performance</CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete breakdown of each habit&apos;s statistics
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-3 font-semibold">Habit</th>
                  <th className="text-left p-3 font-semibold">Completion Rate</th>
                  <th className="text-left p-3 font-semibold">Current Streak</th>
                  <th className="text-left p-3 font-semibold">Longest Streak</th>
                  <th className="text-left p-3 font-semibold">Progress</th>
                </tr>
              </thead>
              <tbody>
                {habitBreakdown.length > 0 ? habitBreakdown.map((habit, index) => {
                  const getPerformanceClass = (rate) => {
                    if (rate >= 80) return "text-green-700 bg-green-50";
                    if (rate >= 60) return "text-blue-700 bg-blue-50";
                    if (rate >= 40) return "text-yellow-700 bg-yellow-50";
                    return "text-red-700 bg-red-50";
                  };

                  return (
                    <tr key={habit.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <div className="font-medium">{habit.name}</div>
                        <div className="text-xs text-gray-500">
                          {habit.completedEntries} of {habit.totalEntries} days
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getPerformanceClass(habit.completionRate)}`}>
                          {habit.completionRate}%
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{habit.currentStreak}</span>
                          <span className="text-sm text-gray-500">days</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{habit.longestStreak}</span>
                          <span className="text-sm text-gray-500">days</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-3 min-w-[60px]">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300" 
                              style={{ width: `${habit.completionRate}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 min-w-[40px]">
                            {habit.completionRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-muted-foreground">
                      <div>
                        <p className="text-lg mb-2">No habits found</p>
                        <p className="text-sm">Start tracking habits to see detailed statistics</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 