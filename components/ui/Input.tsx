"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500",
      "focus:outline-none focus:ring-1 focus:ring-yellow-400/50 focus:border-yellow-400/50",
      "transition-colors duration-200",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
