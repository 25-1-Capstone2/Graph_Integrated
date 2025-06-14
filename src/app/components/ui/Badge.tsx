import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors",
        variant === "default" && "bg-blue-100 text-blue-700",
        variant === "secondary" && "bg-gray-100 text-gray-700",
        variant === "outline" && "border border-blue-300 text-blue-700 bg-white",
        className
      )}
      {...props}
    />
  )
}
