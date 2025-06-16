import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

const Calendar = ({
  className,
  month,
  year,
  onPrevMonth,
  onNextMonth,
  markedDates = {},
  onSelectDate,
}) => {
  const currentDate = new Date();
  const viewMonth = month !== undefined ? month : currentDate.getMonth();
  const viewYear = year !== undefined ? year : currentDate.getFullYear();

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewMonth, viewYear);
    const firstDayOfMonth = getFirstDayOfMonth(viewMonth, viewYear);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${viewYear}-${viewMonth + 1}-${day}`;
      const isMarked = markedDates[dateKey];
      const isToday =
        day === currentDate.getDate() &&
        viewMonth === currentDate.getMonth() &&
        viewYear === currentDate.getFullYear();

      days.push(
        <Button
          key={day}
          variant={isMarked ? "default" : "ghost"}
          className={cn(
            "h-9 w-9",
            isToday && !isMarked && "border border-primary text-primary",
            isMarked && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={() => onSelectDate && onSelectDate(day, viewMonth, viewYear)}
        >
          {day}
        </Button>
      );
    }

    return days;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">
          {monthNames[viewMonth]} {viewYear}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onPrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 text-center text-sm">
        <div className="text-muted-foreground">S</div>
        <div className="text-muted-foreground">M</div>
        <div className="text-muted-foreground">T</div>
        <div className="text-muted-foreground">W</div>
        <div className="text-muted-foreground">T</div>
        <div className="text-muted-foreground">F</div>
        <div className="text-muted-foreground">S</div>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-sm">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export { Calendar }; 