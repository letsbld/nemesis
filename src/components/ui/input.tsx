import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          // 🌟 Base layout and shape
          "flex h-11 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-[15px] text-gray-800 shadow-sm outline-none transition-all duration-200",

          // 🌈 Placeholder styling
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",

          // 🌒 Dark mode background/text
          "dark:bg-[#1F2937] dark:text-gray-100 dark:border-gray-600",

          // ✨ Hover and focus states
          "hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-800",

          // 🚫 Disabled state
          "disabled:cursor-not-allowed disabled:opacity-60",

          // 📱 Responsive text
          "md:text-sm",

          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"
export { Input }
