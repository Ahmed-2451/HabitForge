import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

const habitSchema = z.object({
  name: z.string().min(1, { message: "Habit name is required" }).max(50, { message: "Habit name must be less than 50 characters" }),
  description: z.string().optional(),
  importance: z.string().default("5"),
});

export function HabitForm({ onSubmit, initialData = {}, submitLabel = "Add Habit", onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: initialData.name || "",
      description: initialData.description || "",
      importance: initialData.importance?.toString() || "5",
    },
  });



  const handleFormSubmit = async (data) => {
    // Convert importance to number
    const formattedData = {
      ...data,
      importance: parseInt(data.importance, 10)
    };
    
    await onSubmit(formattedData);
    if (!initialData.id) {
      reset(); // Only reset the form if we're adding a new habit
    }
  };

  const handleCancel = () => {
    reset();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} id="habit-form" className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Habit Name
        </label>
        <Input
          id="name"
          placeholder="e.g., Drink water, Read, Exercise"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description (Optional)
        </label>
        <Textarea
          id="description"
          placeholder="Why is this habit important to you?"
          {...register("description")}
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>
      
      <div className="space-y-3">
        <label className="text-sm font-medium">Priority Level</label>
        
        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="low-importance"
              value="3"
              {...register("importance")}
              className="h-4 w-4 text-primary focus:ring-primary"
            />
            <Label htmlFor="low-importance" className="text-sm font-normal cursor-pointer">
              Low
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="medium-importance"
              value="5"
              {...register("importance")}
              className="h-4 w-4 text-primary focus:ring-primary"
            />
            <Label htmlFor="medium-importance" className="text-sm font-normal cursor-pointer">
              Medium
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="high-importance"
              value="8"
              {...register("importance")}
              className="h-4 w-4 text-primary focus:ring-primary"
            />
            <Label htmlFor="high-importance" className="text-sm font-normal cursor-pointer">
              High
            </Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
} 