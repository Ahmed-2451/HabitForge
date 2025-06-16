import React from "react";
import { cn } from "../../lib/utils";

const Slider = React.forwardRef(
  ({ className, min = 0, max = 100, step = 1, defaultValue = [0], onValueChange, ...props }, ref) => {
    const [value, setValue] = React.useState(defaultValue);
    const trackRef = React.useRef(null);

    const handleChange = (event) => {
      const newValue = Number(event.target.value);
      const newValues = [...value];
      newValues[0] = newValue;
      setValue(newValues);
      
      if (onValueChange) {
        onValueChange(newValues);
      }
    };

    const getPercentage = () => {
      return ((value[0] - min) / (max - min)) * 100;
    };

    return (
      <div className={cn("relative w-full touch-none select-none", className)} {...props}>
        <div
          ref={trackRef}
          className="relative h-2 w-full rounded-full bg-secondary overflow-hidden"
        >
          <div
            className="absolute h-full bg-primary"
            style={{ width: `${getPercentage()}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          ref={ref}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-primary bg-background"
          style={{ left: `calc(${getPercentage()}% - 8px)` }}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider }; 