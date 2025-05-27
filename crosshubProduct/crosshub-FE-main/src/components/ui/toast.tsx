import * as ToastPrimitives from "@radix-ui/react-toast";
import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.ToastViewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed left-[50%] top-0 z-[100] flex max-h-screen w-fit flex-col p-4",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

// custom toast가 필요한 경우 variant를 조절하여 만들 수 있을 것으로 예상
const toastVariants = cva(
  cn(
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80",
    "data-[swipe=move]:transition-none data-[swipe=end]:animate-out",
    // tailwindcss-intellisense doesn't resolve CSS Variables
    // swipeDirection / position 변경 시 함께 업데이트 필요
    "data-[swipe=end]:translate-y-[var(--radix-toast-swipe-end-y)] data-[swipe=move]:translate-y-[var(--radix-toast-swipe-move-y)]",
  ),
  {
    variants: {
      variant: {
        default: "bg-toast-background text-toast-text border",
        destructive: "destructive group border-red-600 bg-red-200 text-red-600",
      },
      position: {
        top: "data-[state=closed]:slide-out-to-top-full data-[state=open]:slide-in-from-top-full",
        bottom:
          "data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full",
      },
    },
    defaultVariants: {
      variant: "default",
      position: "top",
    },
  },
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, position, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      data-type={variant}
      ref={ref}
      className={cn(toastVariants({ variant, position }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors",
      "group-[.destructive]:border-neutral-600/40 group-[.destructive]:hover:border-neutral-600/30 group-[.destructive]:hover:bg-neutral-600 group-[.destructive]:hover:text-neutral-600 group-[.destructive]:focus:ring-neutral-600",
      "focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2",
      "hover:bg-secondary",
      "disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-neutral-600/50 opacity-0 transition-opacity hover:text-neutral-600 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      "focus:opacity-100 focus:outline-none focus:ring-2",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  type ToastActionElement,
  type ToastProps,
};
