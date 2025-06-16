import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function HabitHeatmap({ data, title = "Completion Heatmap" }) {
  // Function to get the start of the week containing the first date
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  // Function to get color intensity based on completion percentage  
  const getIntensityColor = (percentage) => {
    if (percentage === 0) return "bg-muted";
    if (percentage < 25) return "bg-green-200";
    if (percentage < 50) return "bg-green-300";
    if (percentage < 75) return "bg-green-400";
    if (percentage < 100) return "bg-green-500";
    return "bg-green-600";
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No data available for heatmap
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create a map for quick lookup
  const dataMap = new Map();
  data.forEach(item => {
    dataMap.set(item.date, item);
  });

  // Get the date range
  const startDate = new Date(data[0].date);
  const endDate = new Date(data[data.length - 1].date);
  
  // Start from the beginning of the week containing the first date
  const heatmapStart = getWeekStart(startDate);
  
  // Create weeks array
  const weeks = [];
  let currentWeek = [];
  let currentDate = new Date(heatmapStart);

  // Days of the week labels
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  while (currentDate <= endDate || currentWeek.length > 0) {
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }

    const dateStr = currentDate.toISOString().split('T')[0];
    const dayData = dataMap.get(dateStr);
    
    currentWeek.push({
      date: dateStr,
      displayDate: currentDate.getDate(),
      percentage: dayData ? dayData.percentage : 0,
      completed: dayData ? dayData.completed : 0,
      total: dayData ? dayData.total : 0,
      isInRange: currentDate >= startDate && currentDate <= endDate
    });

    currentDate.setDate(currentDate.getDate() + 1);
    
    // Break if we've gone past the end date and completed the current week
    if (currentDate > endDate && currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      break;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Day labels */}
          <div className="grid grid-cols-8 gap-1 text-xs text-muted-foreground">
            <div></div> {/* Empty cell for alignment */}
            {dayLabels.map((day, index) => (
              <div key={index} className="text-center">
                {day}
              </div>
            ))}
          </div>
          
          {/* Heatmap grid */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-8 gap-1">
              {/* Week number or empty cell */}
              <div className="text-xs text-muted-foreground flex items-center">
                {weekIndex === 0 || weekIndex === weeks.length - 1 ? 
                  new Date(week[0].date).toLocaleDateString('en-US', { month: 'short' }) : 
                  ''
                }
              </div>
              
              {/* Days of the week */}
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`
                    w-3 h-3 rounded-sm border border-border
                    ${day.isInRange ? getIntensityColor(day.percentage) : 'bg-muted/30'}
                    cursor-pointer transition-all hover:scale-110
                  `}
                  title={
                    day.isInRange 
                      ? `${day.date}: ${day.completed}/${day.total} habits (${day.percentage}%)`
                      : day.date
                  }
                />
              ))}
            </div>
          ))}
          
          {/* Legend */}
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-muted-foreground">Less</span>
            <div className="flex items-center gap-1">
              {[0, 25, 50, 75, 100].map((percentage) => (
                <div
                  key={percentage}
                  className={`w-3 h-3 rounded-sm border border-border ${getIntensityColor(percentage)}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 