// src/Components/ui/checkbox.jsx (Customized for King of the Pitch)

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // --- UNCHECKED STATE STYLES ---
      // Changed the border from 'border-primary' to a neutral slate color for a cleaner look.
      "peer h-4 w-4 shrink-0 rounded-sm border border-slate-300 shadow",
      
      // --- FOCUS STATE STYLES (Unchanged) ---
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      
      // --- DISABLED STATE STYLES (Unchanged) ---
      "disabled:cursor-not-allowed disabled:opacity-50",
      
      // --- CHECKED STATE STYLES (This is what we changed) ---
      // Replaced 'bg-primary' with a rich amber color from your site's theme.
      "data-[state=checked]:bg-amber-600",
      // Replaced 'text-primary-foreground' with a clean white color for the checkmark.
      "data-[state=checked]:text-white",
      // Also made the border color amber when checked for a consistent look.
      "data-[state=checked]:border-amber-600",

      className
    )}
    {...props}>
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }