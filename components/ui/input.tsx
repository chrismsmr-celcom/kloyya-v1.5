"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-xl border border-hairline bg-white/[0.03] px-3.5 text-[15px] text-paper",
      "placeholder:text-paper-faint",
      "transition-colors duration-200 focus:border-iris-violet/60 focus:outline-none",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
