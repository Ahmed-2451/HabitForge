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

  // color intensity based on completion percentage  
  const getIntensityColor = (percentage) => {
    if (percentage === 0) return "bg-gray-100 border-gray-200";
    if (percentage < 25) return "bg-green-200 border-green-300";
    if (percentage < 50) return "bg-green-300 border-green-400";
    if (percentage < 75) return "bg-green-400 border-green-500";
    if (percentage < 100) return "bg-green-500 border-green-600";
    return "bg-green-600 border-green-700";
  };

  const getTextColor = (percentage) => {
    return percentage >= 50 ? "text-white" : "text-gray-700";
  };

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <div className="space-y-2">
              <p className="text-lg">No data available for heatmap</p>
              <p className="text-sm">Complete some habits to see your progress visualization</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dataMap = new Map();
  data.forEach(item => {
    dataMap.set(item.date, item);
  });

  // the date range
  const startDate = new Date(data[0].date);
  const endDate = new Date(data[data.length - 1].date);
  
  // Start from the beginning of the week containing the first date
  const heatmapStart = getWeekStart(startDate);
  
  const weeks = [];
  let currentWeek = [];
  let currentDate = new Date(heatmapStart);

  // Days of the week names
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
      isInRange: currentDate >= startDate && currentDate <= endDate,
      isToday: dateStr === new Date().toISOString().split('T')[0]
    });

    currentDate.setDate(currentDate.getDate() + 1);
    
    // Break if we've gone past the end date and completed the current week
    if (currentDate > endDate && currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      break;
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Visual representation of your daily habit completion progress
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-8 gap-1 text-xs font-medium text-muted-foreground">
            <div className="text-center"></div> 
            {dayLabels.map((day, index) => (
              <div key={index} className="text-center py-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* grid */}
          <div className="space-y-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-8 gap-1">
                {/* Month indicator */}
                <div className="text-xs text-muted-foreground flex items-center justify-end pr-2">
                  {weekIndex === 0 || new Date(week[0].date).getDate() <= 7 ? 
                    new Date(week[0].date).toLocaleDateString('en-US', { month: 'short' }) : 
                    ''
                  }
                </div>
                
                {/* Days of the week */}
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`
                      relative w-4 h-4 rounded-sm border transition-all duration-200 cursor-pointer
                      hover:scale-110 hover:shadow-md
                      ${day.isInRange ? getIntensityColor(day.percentage) : 'bg-gray-50 border-gray-100'}
                      ${day.isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                    `}
                    title={
                      day.isInRange 
                        ? `${new Date(day.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}: ${day.completed}/${day.total} habits completed (${day.percentage}%)${day.isToday ? ' - Today' : ''}`
                        : new Date(day.date).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric' 
                          })
                    }
                  >
                    {/* Show percentage for high completion days */}
                    {day.isInRange && day.percentage >= 75 && (
                      <span className={`
                        absolute inset-0 flex items-center justify-center text-[8px] font-bold
                        ${getTextColor(day.percentage)}
                      `}>
                        {day.percentage}
                      </span>
                    )}
                    
                    {/* Today indicator */}
                    {day.isToday && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Less</span>
              <div className="flex items-center gap-1">
                {[0, 25, 50, 75, 100].map((percentage) => (
                  <div
                    key={percentage}
                    className={`w-4 h-4 rounded-sm border ${getIntensityColor(percentage).split(' ')[0]} ${getIntensityColor(percentage).split(' ')[1]}`}
                    title={`${percentage}% completion`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-muted-foreground">More</span>
            </div>
            
            {/* Stats summary */}
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground bg-gray-50 rounded-lg p-3">
              <div className="text-center">
                <div className="font-semibold text-gray-700">{data.length}</div>
                <div>Total Days</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">
                  {data.filter(d => d.percentage >= 100).length}
                </div>
                <div>Perfect Days</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">
                  {Math.round(data.reduce((sum, d) => sum + d.percentage, 0) / data.length) || 0}%
                </div>
                <div>Avg Completion</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-600">
                  {data.reduce((sum, d) => sum + d.completed, 0)}
                </div>
                <div>Total Completions</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 