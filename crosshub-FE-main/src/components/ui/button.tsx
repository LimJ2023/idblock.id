import { Slot } from "@radix-ui/react-slot";
import { cva, VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-600 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:bg-[#AEAEAE]",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variants: {
        default: "bg-primary text-neutral-100 hover:bg-primary/90",
        secondary: "bg-secondary text-neutral-100 hover:bg-secondary/90",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        default: "px-4 py-2",
      },
    },
    defaultVariants: {
      variants: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variants, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variants, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
