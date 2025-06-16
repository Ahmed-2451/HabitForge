import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { BarChart2, ChevronRight, CheckCircle2, Circle } from "lucide-react";

export function HabitCard({ habit, onToggleComplete, onViewDetails }) {
  const { id, name, description, importance = 5, currentStreak = 0, completed = false } = habit;

  const handleToggle = (e) => {
    onToggleComplete(id, e.target.checked);
  };

  const getPriorityLabel = (value) => {
    const numValue = parseInt(value);
    if (numValue >= 8) return "High";
    if (numValue >= 5) return "Medium";
    return "Low";
  };

  const getPriorityColor = (value) => {
    const numValue = parseInt(value);
    if (numValue >= 8) return "bg-red-100 text-red-800 border-red-200";
    if (numValue >= 5) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <Card className={`overflow-hidden transition-all ${completed ? 'ring-2 ring-green-500 bg-green-50/50' : ''}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-medium">{name}</CardTitle>
            <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(importance)}`}>
              {getPriorityLabel(importance)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <BarChart2 className="mr-1 h-4 w-4" />
              <span>{currentStreak} day{currentStreak !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleComplete(id, !completed);
                }}
                className={`p-1 rounded-full transition-all ${
                  completed 
                    ? 'text-green-600 hover:text-green-700 hover:bg-green-100' 
                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                {completed ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </button>
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${completed ? 'text-green-700' : 'text-gray-700'}`}>
                  {completed ? 'Completed' : 'Mark Complete'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {today}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onViewDetails(id)}>
            Details
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 