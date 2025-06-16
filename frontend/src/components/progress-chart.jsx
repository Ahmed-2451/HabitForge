import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function ProgressChart({ data, title = "Progress" }) {
  // Format data for the chart if needed
  const chartData = data.map(item => ({
    date: item.date,
    completed: item.completed ? 1 : 0,
    // Format the date label to be more readable
    dateLabel: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="dateLabel" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
              />
              <YAxis 
                domain={[0, 1]} 
                ticks={[0, 1]} 
                tickFormatter={(value) => value === 1 ? "Done" : ""}
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <Tooltip 
                formatter={(value) => value === 1 ? "Completed" : "Not completed"}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar 
                dataKey="completed" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 