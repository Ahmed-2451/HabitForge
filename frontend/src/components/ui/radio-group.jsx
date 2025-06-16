import React from "react";
import { cn } from "../../lib/utils";

const RadioGroup = React.forwardRef(
  ({ className, defaultValue, onValueChange, ...props }, ref) => {
    const [value, setValue] = React.useState(defaultValue || "");

    const handleChange = (newValue) => {
      setValue(newValue);
      if (onValueChange) {
        onValueChange(newValue);
      }
    };

    return (
      <div ref={ref} className={cn("grid gap-2", className)} {...props}>
        {React.Children.map(props.children, (child) => {
          if (!React.isValidElement(child)) return child;

          return React.cloneElement(child, {
            name: props.name,
            checked: child.props.value === value,
            onChange: () => handleChange(child.props.value),
          });
        })}
      </div>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef(
  ({ className, checked, onChange, value, id, ...props }, ref) => {
    return (
      <input
        type="radio"
        ref={ref}
        id={id}
        className={cn(className)}
        checked={checked}
        onChange={onChange}
        value={value}
        {...props}
      />
    );
  }
);

RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem }; 