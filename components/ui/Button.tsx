"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
  }
>(({ className, variant = "default", size = "md", ...props }, ref) => {
  const base =
    "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    default:
      "bg-yellow-400 text-black hover:bg-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.4)] hover:shadow-[0_0_25px_rgba(250,204,21,0.6)]",
    outline:
      "border border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400",
    ghost: "text-gray-400 hover:text-white hover:bg-white/10",
    danger:
      "bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 hover:text-red-300",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
