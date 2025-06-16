import React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

const Dialog = ({ open, onClose, children, className }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div 
        className={cn(
          "relative w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg",
          className
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 h-6 w-6 rounded-full p-0"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        {children}
      </div>
    </div>
  );
};

const DialogHeader = ({ className, children, ...props }) => {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 pb-6", className)}
      {...props}
    >
      {children}
    </div>
  );
};

const DialogTitle = ({ className, children, ...props }) => {
  return (
    <h2
      className={cn("text-lg font-semibold", className)}
      {...props}
    >
      {children}
    </h2>
  );
};

const DialogDescription = ({ className, children, ...props }) => {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
};

const DialogContent = ({ className, children, ...props }) => {
  return (
    <div className={cn("py-4", className)} {...props}>
      {children}
    </div>
  );
};

const DialogFooter = ({ className, children, ...props }) => {
  return (
    <div
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-6", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter }; 