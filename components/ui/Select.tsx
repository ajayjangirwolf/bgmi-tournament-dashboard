"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white",
      "focus:outline-none focus:ring-1 focus:ring-yellow-400/50 focus:border-yellow-400/50",
      "transition-colors duration-200 cursor-pointer",
      "[&>option]:bg-[#1a1a1a] [&>option]:text-white",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export { Select };
