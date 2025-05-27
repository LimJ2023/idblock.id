import * as React from "react";

import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex w-full rounded-md border border-gray-200 bg-background px-3 py-2 placeholder:text-gray-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-600 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
